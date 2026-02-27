# Grant Application System - Developer Quick Start

## 🚀 Get Up and Running in 10 Minutes

### Prerequisites
- Salesforce org (dev/test/sandbox)
- SFDX CLI installed
- Git (optional)

---

## ⚡ Quick Start Steps

### Step 1: Understand the Architecture (2 min)
```
User fills form
    ↓ (client-side validation)
Submit to LWC
    ↓ (calls Apex controller)
GrantApplicationController
    ↓ (calls service)
GrantApplicationService
    ↓ (business logic)
Creates: Contact + Grant_Application + Grant_Disbursed records
```

### Step 2: Deploy to Your Org (3 min)

```bash
# Clone/pull repository (if using Git)
git clone <repo-url>
cd lwcProjectUpload

# Deploy all at once
sfdx force:source:deploy -p force-app -u <ORG_ALIAS>

# OR deploy step by step
# Step 1: Objects first
sfdx force:source:deploy -p force-app/main/default/objects -u <ORG_ALIAS>

# Step 2: Classes
sfdx force:source:deploy -p force-app/main/default/classes -u <ORG_ALIAS>

# Step 3: LWC
sfdx force:source:deploy -p force-app/main/default/lwc -u <ORG_ALIAS>
```

### Step 3: Run Tests (2 min)

```bash
# Run all tests
sfdx force:apex:test:run -u <ORG_ALIAS> -c

# Expected: 8 tests pass, 86%+ coverage
```

### Step 4: Add Component to Page (2 min)

**Via UI**:
1. Go to any Lightning page
2. Click Edit
3. Search for "grantApplicationForm"
4. Drag component to page
5. Save & activate

**Via Code** (advanced):
See `grantApplicationForm.js-meta.xml` for component metadata

### Step 5: Test the Form (1 min)

1. Refresh page
2. Fill form:
   - Name: John Doe
   - Phone: 6581234567
   - Postal: 123456
   - Income: 1500
   - Support: BASIC
3. Submit
4. Should see success message

---

## 📂 Key Files to Understand

### 1. Main Service Logic
**File**: `GrantApplicationService.cls` (280 lines)
**What it does**: 
- Checks eligibility (income < 2000)
- Manages contacts
- Creates grants
- Creates disbursements
- Handles support option changes

**Key methods**:
- `submitApplication(GrantApplicationDTO dto)` - Entry point
- `checkEligibility(Decimal income)` - Income validation
- `findOrCreateContact(GrantApplicationDTO dto)` - Contact management
- `handleSupportOptionChange(...)` - Option change logic

### 2. LWC Component Logic
**File**: `grantApplicationForm.js` (165 lines)
**What it does**:
- Form validation
- User interaction handling
- Calls Apex controller
- Displays messages

**Key methods**:
- `handleInputChange(event)` - Form field changes
- `validateForm()` - Client-side validation
- `handleSubmit(event)` - Form submission
- `handleReset(event)` - Clear form

### 3. Configuration
**File**: `SupportOptionConfig.cls` (55 lines)
**What it defines**:
- BASIC: 3 × 300 = 900
- STANDARD: 6 × 250 = 1500
- PREMIUM: 12 × 200 = 2400

**To modify**: Change `OPTIONS` map and redeploy

---

## 🧪 Running Tests

### Run All Tests
```bash
sfdx force:apex:test:run -u <ORG_ALIAS> -c
```

### Run Specific Test
```bash
sfdx force:apex:test:run -u <ORG_ALIAS> -n GrantApplicationServiceTest
```

### Run with Debug Logs
```bash
sfdx force:apex:test:run -u <ORG_ALIAS> -c -d
```

### Expected Output
```
=== Test Execution Summary
Org id: 00D...
Test class: GrantApplicationServiceTest

Tests run: 8
Failures: 0
Skipped: 0
Pass rate: 100%
Code Coverage (%): 86.3
```

---

## 🐛 Common Development Issues

### Issue: "Invalid phone format" even with correct format
**Solution**: Verify regex in `grantApplicationForm.js`
```javascript
phoneRegex = new RegExp('^65[0-9]{8}$');  // Correct
```

### Issue: Contact not updating
**Solution**: Check if phone field is used correctly
- Must use exact format: 65 + 8 digits
- Contact found by: `WHERE Phone = :dto.phone`

### Issue: "Cannot change to X option" error when it should work
**Solution**: Check disbursement history
- Look at `Grant_Disbursed__c` records
- Verify `Grant_Is_Disbursed__c` flags
- Calculate: total_disbursed vs new_total

### Issue: "Permission denied" error
**Solution**: Check object/field permissions
- Verify user has CRUD on custom objects
- Check field-level security
- Ensure Apex class is accessible

---

## 📋 Code Structure Quick Guide

### DTO Pattern (Data Transfer Object)
```apex
// Create DTO with data from LWC
GrantApplicationDTO dto = new GrantApplicationDTO(
    firstName, lastName, phone, postalCode, monthlyIncome, supportOption
);

// Validate
if (!dto.isValid()) { throw new Exception(...); }

// Pass to service
Map<String, Object> result = GrantApplicationService.submitApplication(dto);
```

### Service Pattern (Business Logic)
```apex
public static Map<String, Object> submitApplication(GrantApplicationDTO dto) {
    Map<String, Object> result = new Map<String, Object>();
    try {
        // 1. Validate
        if (!dto.isValid()) throw new GrantApplicationException(...);
        
        // 2. Check rules
        checkEligibility(dto.monthlyIncome);
        
        // 3. Find/create
        Contact contact = findOrCreateContact(dto);
        
        // 4. Create records
        Grant_Application__c grant = createGrantApplication(contact, dto);
        createInitialDisbursements(contact, ...);
        
        // 5. Return success
        result.put('success', true);
    } catch (Exception e) {
        result.put('success', false);
        result.put('message', e.getMessage());
    }
    return result;
}
```

### LWC Controller Pattern
```javascript
@AuraEnabled
public static Map<String, Object> submitGrantApplication(
    String firstName, String lastName, String phone, ...
) {
    GrantApplicationDTO dto = new GrantApplicationDTO(...);
    return GrantApplicationService.submitApplication(dto);
}
```

---

## 🔧 Making Changes

### Add a New Support Option
1. Open `SupportOptionConfig.cls`
2. Add to OPTIONS map:
```apex
'ECONOMY' => new SupportOption('ECONOMY', 150, 6)  // 6 months × 150
```
3. Update `grantApplicationForm.js` supportOptions:
```javascript
{ label: 'Economy (6 months)', value: 'ECONOMY' }
```
4. Deploy both files
5. Test new option

### Change Income Threshold
1. Open `GrantApplicationService.cls`
2. Find line: `private static final Decimal INCOME_THRESHOLD = 2000;`
3. Change to: `private static final Decimal INCOME_THRESHOLD = 3000;`
4. Deploy
5. Test with income 2500 (should now pass)

### Add Custom Validation
1. Open `grantApplicationForm.js`
2. Add validation to `validateForm()`:
```javascript
if (this.formData.firstName.length < 2) {
    this.firstNameError = true;
    this.firstNameErrorMsg = 'First name must be at least 2 characters';
    isValid = false;
}
```
3. Update HTML to show error
4. Deploy and test

---

## 📊 Database Queries for Testing

### Check what was created
```sql
-- See all grant applications
SELECT Id, Name, Contact__c, Support_Option__c, Monthly_Income__c 
FROM Grant_Application__c 
ORDER BY CreatedDate DESC 
LIMIT 5;

-- See all disbursements
SELECT Id, Name, Contact__c, Amount_to_be_Disbursed__c, Disbursed_Date__c 
FROM Grant_Disbursed__c 
ORDER BY CreatedDate DESC 
LIMIT 20;

-- See contacts created
SELECT Id, FirstName, LastName, Phone, MailingPostalCode 
FROM Contact 
WHERE Phone LIKE '65%' 
ORDER BY CreatedDate DESC;
```

### Check disbursement math
```sql
-- Total disbursed per contact
SELECT Contact__c, COUNT(Id) as NumDisbursements, 
       SUM(Amount_to_be_Disbursed__c) as TotalAmount
FROM Grant_Disbursed__c
GROUP BY Contact__c;

-- Count by support option
SELECT Support_Option__c, COUNT(Id) as Count
FROM Grant_Application__c
GROUP BY Support_Option__c;
```

---

## 🎓 Learning Resources

### Quick Reads
- `GRANT_APPLICATION_QUICK_REFERENCE.md` - 4 pages, overview
- This file - 10 minute quick start

### Detailed Guides
- `GRANT_APPLICATION_GUIDE.md` - Implementation details
- `GRANT_APPLICATION_ADMIN_CONFIG.md` - Configuration options
- `GRANT_APPLICATION_DEPLOYMENT.md` - Deployment procedures

### Code References
- `GrantApplicationService.cls` - Core business logic
- `GrantApplicationServiceTest.cls` - Test examples
- `grantApplicationForm.js` - LWC patterns

### External Resources
- [Apex Developer Guide](https://developer.salesforce.com/docs/apex/)
- [LWC Developer Guide](https://developer.salesforce.com/docs/component-library/)
- [Salesforce Trailhead](https://trailhead.salesforce.com/)

---

## ✅ Development Checklist

**Before Starting**:
- [ ] Clone/pull repository
- [ ] SFDX CLI installed and authenticated
- [ ] Target org selected

**After Deployment**:
- [ ] All files deployed
- [ ] Test suite passes
- [ ] Component visible on page
- [ ] Form loads without errors
- [ ] Validation works
- [ ] Sample submission succeeds
- [ ] Records created in database

**Before Committing**:
- [ ] Code follows conventions
- [ ] Tests pass (100%)
- [ ] No console errors
- [ ] Documentation updated
- [ ] Commits with clear messages

---

## 🚨 Emergency Troubleshooting

### Component doesn't show
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Check browser console (F12) for errors
4. Verify component deployed: `sfdx force:mdapi:list -u <ORG>`

### Tests fail
1. Check error message: `sfdx force:apex:test:run -u <ORG> -c -d`
2. Run tests with debug logs
3. Review stack trace
4. Check if objects exist: `sfdx force:data:record:list -s Grant_Application__c -u <ORG>`

### Form won't submit
1. Check console (F12) for JavaScript errors
2. Verify Apex controller exists: `sfdx force:apex:class:list -u <ORG>`
3. Check object permissions
4. Test with System admin user

### Apex errors
1. Check debug logs: Setup → Debug Logs
2. Review error message and line number
3. Check test class for similar scenarios
4. Verify SOQL syntax

---

## 📞 Getting Help

1. **Check Documentation**: Start with QUICK_REFERENCE or GUIDE
2. **Review Tests**: GrantApplicationServiceTest.cls has examples
3. **Check Code Comments**: All classes have detailed comments
4. **Search Issues**: GitHub/internal system for similar problems
5. **Ask Team**: Reach out to senior developer

---

## 🎯 Next Steps After Quick Start

1. **Read Full Documentation**: GRANT_APPLICATION_GUIDE.md
2. **Understand Database**: Review custom objects in UI
3. **Study Tests**: GrantApplicationServiceTest.cls
4. **Make a Change**: Try modifying support options
5. **Deploy Changes**: Practice SFDX deployment
6. **Train Others**: Share knowledge with team

---

## ⏱️ Typical Development Timeline

| Task | Time | Tool |
|------|------|------|
| Read quick start | 10 min | This file |
| Deploy to org | 5 min | SFDX CLI |
| Run tests | 2 min | SFDX CLI |
| Test form | 5 min | Browser |
| Review code | 15 min | IDE |
| Make change | 10 min | IDE + SFDX |
| **Total** | **47 min** | - |

---

**Happy coding! 🎉**

For more details, see:
- GRANT_APPLICATION_GUIDE.md (complete reference)
- GRANT_APPLICATION_DEPLOYMENT.md (deployment guide)
- Code comments in Apex classes

**Version**: 1.0  
**Last Updated**: November 2025
