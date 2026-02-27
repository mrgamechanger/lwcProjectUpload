# Grant Application System - Deployment Guide

## Pre-Deployment Checklist

- [ ] All Apex code compiled without errors
- [ ] All LWC files validated
- [ ] Custom objects created
- [ ] No naming conflicts with existing objects
- [ ] Test org available for UAT
- [ ] Production deployment plan reviewed
- [ ] Stakeholders notified
- [ ] Backup of existing data (if applicable)

---

## Deployment Steps

### Phase 1: Custom Objects (Required First)

Deploy the following custom object metadata XML files:

1. **Grant_Application__c**
   - Auto-number format: GA-{YYYY}{MM}{DD}-{00000}
   - Lookup to Contact
   - Fields: Monthly_Income__c, Support_Option__c, Status__c, Application_Date__c

2. **Grant_Disbursed__c**
   - Auto-number format: GD-{YYYY}{MM}{DD}-{00000}
   - Lookup to Contact
   - Lookup to Grant_Application__c
   - Fields: Amount_to_be_Disbursed__c, Disbursed_Date__c, Grant_Is_Disbursed__c, Support_Option__c

3. **Error_Message__c**
   - Fields: Message_Key__c (External ID, Unique), Message_Value__c, Message_Type__c
   - Optional: Used for admin-maintained error messages

**SFDX Command**:
```bash
sfdx force:source:deploy -p force-app/main/default/objects/Grant_Application__c -u <ORG_ALIAS>
sfdx force:source:deploy -p force-app/main/default/objects/Grant_Disbursed__c -u <ORG_ALIAS>
sfdx force:source:deploy -p force-app/main/default/objects/Error_Message__c -u <ORG_ALIAS>
```

---

### Phase 2: Apex Classes (Core Logic)

Deploy core Apex classes in this order:

1. **GrantApplicationException.cls** (depends on nothing)
2. **GrantApplicationDTO.cls** (depends on nothing)
3. **SupportOptionConfig.cls** (depends on GrantApplicationException)
4. **ErrorMessageService.cls** (depends on Error_Message__c object)
5. **GrantApplicationService.cls** (depends on all above + custom objects)
6. **GrantApplicationController.cls** (depends on GrantApplicationService)
7. **GrantApplicationServiceTest.cls** (test class)

**SFDX Command - Deploy All Classes**:
```bash
sfdx force:source:deploy -p force-app/main/default/classes -u <ORG_ALIAS>
```

**Verify Deployment**:
```bash
sfdx force:apex:test:run -u <ORG_ALIAS> -c
```

Expected output:
```
Ran 8 tests in GrantApplicationServiceTest
Result: All tests passed (100%)
Code coverage: 80%+
```

---

### Phase 3: Lightning Web Component

Deploy the LWC component:

**SFDX Command**:
```bash
sfdx force:source:deploy -p force-app/main/default/lwc/grantApplicationForm -u <ORG_ALIAS>
```

**Verify**: Component appears in component list

---

### Phase 4: Configuration (Post-Deployment)

#### A. Create Error Messages (Optional but Recommended)

Via SOQL INSERT:
```apex
INSERT INTO Error_Message__c (Name, Message_Key__c, Message_Value__c, Message_Type__c)
VALUES 
(
    'Invalid Phone Format',
    'INVALID_PHONE',
    'Phone must be in format: 65xxxxxxxx (Singapore number)',
    'Error'
),
(
    'Invalid Postal Code',
    'INVALID_POSTAL',
    'Postal code must be exactly 6 digits',
    'Error'
),
(
    'Invalid Income',
    'INVALID_INCOME',
    'Monthly income must be a positive number',
    'Error'
),
(
    'Income Exceeds Threshold',
    'HIGH_INCOME_REJECTION',
    'Your monthly income exceeds the maximum threshold. You are not eligible for this grant.',
    'Error'
);
```

Or via UI:
1. Go to Error_Message__c object
2. Create new records with keys and messages
3. Assign Message_Type

#### B. Set Up Page Layouts

For **Grant_Application__c**:
1. Go to Setup → Object Manager → Grant Application
2. Click Layouts
3. Edit "Master - Grant Application" or create new layout
4. Add fields:
   - Contact__c
   - Monthly_Income__c
   - Support_Option__c
   - Application_Date__c
   - Status__c
5. Save

For **Grant_Disbursed__c**:
1. Go to Setup → Object Manager → Grant Disbursed
2. Edit layout
3. Add fields:
   - Contact__c
   - Grant_Application__c
   - Amount_to_be_Disbursed__c
   - Disbursed_Date__c
   - Grant_Is_Disbursed__c
   - Support_Option__c
4. Save

#### C. Add Component to Pages

**Add to Lightning App Home**:
1. Go to Setup → App Launcher
2. Select target app (e.g., "Grant Applications")
3. Click Edit
4. Find "Lightning Page" or page name
5. Edit page
6. Search for "grantApplicationForm"
7. Drag component to page
8. Save

**Add to Record Page**:
1. Go to Setup → Object Manager → (desired object)
2. Lightning Record Pages
3. Create or edit page
4. Add component
5. Configure (optional settings)
6. Save & activate

---

## Full Deployment Command

Complete deployment in one command:

```bash
# Deploy everything to org
sfdx force:source:deploy -p force-app -u <ORG_ALIAS>

# Deploy and run tests
sfdx force:source:deploy -p force-app -u <ORG_ALIAS> --testlevel=RunLocalTests

# Check deployment status
sfdx force:source:deploy:report -u <ORG_ALIAS>
```

---

## Validation & Testing

### 1. Apex Test Execution

Run all tests:
```bash
sfdx force:apex:test:run -u <ORG_ALIAS> -c
```

Expected results:
```
=== Test Summary
Org contains 8 test classes
Run Tests               Result: All 8 tests passed
Code Coverage (Apex):   86%+
Overall Coverage:       80%+
```

### 2. Manual Testing

**Test Case 1: Valid Application**
1. Open grantApplicationForm LWC
2. Enter valid data:
   - First Name: John
   - Last Name: Doe
   - Phone: 6581234567
   - Postal: 123456
   - Income: 1500
   - Support: BASIC
3. Click Submit
4. **Expected**: Success message, records created

**Test Case 2: Validation Failure**
1. Enter Phone: 6512345 (too short)
2. Click Submit
3. **Expected**: Error message "Phone must be 65xxxxxxxx"

**Test Case 3: Income Threshold**
1. Enter Income: 2500
2. Click Submit
3. **Expected**: Error "Income exceeds threshold"

**Test Case 4: Existing Contact**
1. Submit with Phone: 6591234567
2. Submit again with same phone, different name
3. **Expected**: Contact updated, new grant created

### 3. Database Verification

Check created records:

```sql
-- Count applications
SELECT COUNT() FROM Grant_Application__c;

-- Verify disbursements created
SELECT COUNT() FROM Grant_Disbursed__c;

-- Check contact creation
SELECT COUNT() FROM Contact WHERE Phone = '6581234567';
```

---

## Rollback Plan

### If Deployment Fails

1. **Immediate**: Stop deployment process
2. **Check**: Review error logs in SFDX CLI or Salesforce UI
3. **Fix**: Resolve compilation errors or conflicts
4. **Redeploy**: Run deployment again

### If Production Issues Occur

1. **Disable Component**: Remove from pages (Setup → Lightning Pages)
2. **Investigate**: Check Apex debug logs
3. **Assess**: Determine if rollback needed
4. **Rollback**: Deploy previous version if needed
   ```bash
   sfdx force:source:deploy -p <previous-version-path> -u <ORG_ALIAS> --force
   ```

---

## Performance & Limits

### Governor Limits Considerations

| Limit | Usage | Threshold |
|-------|-------|-----------|
| SOQL Queries | 5 per submission | 100 |
| DML Operations | 3 (contact, grant, disbursements) | 150 |
| Heap Size | ~50KB per submission | 6MB |
| Execution Time | ~2-3 seconds per submission | 60s |

### Bulk Operation Considerations

Current implementation handles:
- **Individual submissions**: Real-time processing
- **Bulk uploads**: Process up to 100 at a time via batch job

For larger volumes, consider:
- Batch Apex implementation
- Scheduled jobs
- API integration

---

## Post-Deployment Activities

### Day 1: Setup
- [ ] Deploy all components
- [ ] Run test suite
- [ ] Add component to pages
- [ ] Create sample error messages

### Week 1: Testing
- [ ] User acceptance testing (UAT)
- [ ] Test all support options
- [ ] Verify contact management
- [ ] Test disbursement creation

### Week 2: Go-Live Prep
- [ ] Training documentation ready
- [ ] Support team briefed
- [ ] Monitoring/alerting configured
- [ ] Backup procedures confirmed

### Week 3+: Monitoring
- [ ] Monitor error logs
- [ ] Track application submissions
- [ ] Gather user feedback
- [ ] Plan future enhancements

---

## Support Contacts

### For Technical Issues:
- Salesforce Org Admin
- Apex Developer
- LWC Component Owner

### For Business Issues:
- Product Owner
- Business Analyst
- Grants Program Manager

### For Incidents:
1. Check [ORG_NAME] internal wiki
2. Contact on-call developer
3. Escalate to team lead if needed

---

## Deployment Verification Checklist

**After Deployment, Verify**:

- [ ] Grant_Application__c exists and has 6 fields
- [ ] Grant_Disbursed__c exists and has 6 fields
- [ ] Error_Message__c exists (optional)
- [ ] 7 Apex classes compile without errors
- [ ] LWC component appears in component library
- [ ] All 8 Apex tests pass
- [ ] Component can be added to pages
- [ ] Contact create/update works
- [ ] Grant records create with correct relationships
- [ ] Disbursements create for 3/6/12 months based on option
- [ ] Client-side validation works (phone, postal, income)
- [ ] Server-side validation works (income threshold)
- [ ] Error messages display properly
- [ ] Success messages display properly

---

## Documentation for Users

Provide these documents to users:

1. **GRANT_APPLICATION_GUIDE.md** - Technical overview
2. **GRANT_APPLICATION_ADMIN_CONFIG.md** - Admin configuration
3. **GRANT_APPLICATION_QUICK_REFERENCE.md** - Quick reference
4. User training video (if available)
5. FAQ document

---

## Version Control

```
Version 1.0 (Current)
- Initial release
- 7 Apex classes
- 1 LWC component
- 3 custom objects
- 8 test cases
- Code coverage: 86%

Future Versions:
- Add bulk upload feature
- Add reporting dashboards
- Add automated disbursement triggers
- Add SMS/Email notifications
```

---

## Signing Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | ____________ | ____/____/____ | ________ |
| QA Lead | ____________ | ____/____/____ | ________ |
| Product Owner | ____________ | ____/____/____ | ________ |
| Org Admin | ____________ | ____/____/____ | ________ |

---

**Deployment Date**: [TO BE FILLED]  
**Deployed By**: [TO BE FILLED]  
**Deployment Environment**: [DEV/UAT/PROD]  
**Status**: Ready for Deployment  
**Last Updated**: November 2025  
**Version**: 1.0
