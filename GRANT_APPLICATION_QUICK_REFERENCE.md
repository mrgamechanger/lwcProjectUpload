# Grant Application System - Quick Reference

## Key Files Overview

### LWC Component Files
```
📁 grantApplicationForm/
├── grantApplicationForm.html       (Form UI template)
├── grantApplicationForm.js         (Component logic & validation)
├── grantApplicationForm.css        (Styling)
└── grantApplicationForm.js-meta.xml (Component metadata)
```

### Apex Service Classes
```
📄 GrantApplicationService.cls      (Core business logic - 280+ lines)
📄 GrantApplicationController.cls   (LWC Apex endpoint)
📄 SupportOptionConfig.cls          (Support option definitions)
📄 GrantApplicationDTO.cls          (Data transfer object)
📄 ErrorMessageService.cls          (Message retrieval)
📄 GrantApplicationException.cls    (Custom exception)
📄 GrantApplicationServiceTest.cls  (Test coverage - 8 tests)
```

### Custom Objects
```
📦 Grant_Application__c   (Main application records)
📦 Grant_Disbursed__c     (Monthly disbursement tracking)
📦 Error_Message__c       (Admin-maintained messages)
```

---

## Data Flow Diagram

```
┌─────────────────────────┐
│  grantApplicationForm   │ (LWC Component)
│  ├─ Form fields         │
│  ├─ Client validation   │
│  └─ Submit button       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ GrantApplicationController│ (Apex)
│ ├─ @AuraEnabled method  │
│ └─ Calls Service        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ GrantApplicationService │ (Business Logic)
│ ├─ Check eligibility    │
│ ├─ Manage contact       │
│ ├─ Create grant app     │
│ └─ Create disbursements │
└────────────┬────────────┘
             │
             ├──────► Grant_Application__c
             ├──────► Grant_Disbursed__c
             └──────► Contact (upsert)
```

---

## Application Workflow Timeline

### Day 1: Submit Application
```
User fills form → Validation → Submit to Apex
                                    ↓
                         Check income < 2000 SGD
                                    ↓
                         Find/Create Contact by Phone
                                    ↓
                         Create Grant_Application__c
                                    ↓
                         Create 3/6/12 disbursement records
                         (based on support option)
                                    ↓
                         Show success message
```

### Months 1-3/6/12: Disbursements
```
1st of each month: Grant_Disbursed__c records become due
                              ↓
                    Admin processes payment
                              ↓
                    Mark Grant_Is_Disbursed__c = true
```

### Re-Application: Support Option Change
```
Existing Contact with new support option
                        ↓
                  Check old disbursement total
                        ↓
            Validate: new total ≥ previously disbursed
                        ↓
    If Valid: Calculate remaining amount & months
             Delete future undisbursed records
             Create new disbursement schedule
                        ↓
    If Invalid: Throw exception, prevent change
```

---

## Support Option Quick Reference

| Option | Monthly | Duration | Total |
|--------|---------|----------|-------|
| BASIC | 300 SGD | 3 months | 900 SGD |
| STANDARD | 250 SGD | 6 months | 1,500 SGD |
| PREMIUM | 200 SGD | 12 months | 2,400 SGD |

---

## Validation Rules

### Client-Side (JavaScript)
```javascript
Phone:   /^65[0-9]{8}$/        (Singapore format)
Postal:  /^[0-9]{6}$/          (6 digits)
Income:  > 0 AND number        (Positive number)
```

### Server-Side (Apex)
```apex
Income threshold: < 2,000 SGD
Phone format:     65 + 8 digits
Postal code:      6 digits
All fields:       Not empty
```

---

## Error Messages & Resolutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Phone must be 65xxxxxxxx" | Invalid format | Enter phone: 65 + 8 digits |
| "Postal code must be 6 digits" | Wrong length | Enter exactly 6 digits |
| "Monthly income must be positive" | Invalid amount | Enter a positive number |
| "Income exceeds threshold" | Too high income | Monthly income < 2,000 SGD |
| "Cannot change to X option" | Invalid disbursement change | Contact admin - too much already paid |

---

## Testing Scenarios

### ✅ Happy Path
```
Name: John Doe
Phone: 6581234567
Postal: 123456
Income: 1500 SGD
Option: BASIC
Result: ✓ Success - Grant created, 3 disbursements scheduled
```

### ❌ High Income
```
Income: 2500 SGD
Result: ✗ Rejected - Exceeds 2000 SGD threshold
```

### 🔄 Support Option Change
```
Original: BASIC (3 × 300 = 900 total)
After 1 disbursed: 300 paid, 600 remaining
Change to: STANDARD (1500 total)
Result: ✓ Valid - More available than disbursed
New Schedule: 5 remaining disbursements at adjusted rate
```

---

## Database Schema

### Grant_Application__c
```
ID (PK)
Contact__c (FK)          → Contact.Id
Monthly_Income__c        → Currency
Support_Option__c        → BASIC|STANDARD|PREMIUM
Application_Date__c      → Date (auto: today)
Status__c                → New|In Review|Approved|Rejected
Name (auto)              → GA-YYYYMMDD-00000
CreatedDate (auto)
LastModifiedDate (auto)
```

### Grant_Disbursed__c
```
ID (PK)
Contact__c (FK)          → Contact.Id
Grant_Application__c (FK)→ Grant_Application__c.Id
Amount_to_be_Disbursed__c→ Currency
Disbursed_Date__c        → Date (1st of month)
Grant_Is_Disbursed__c    → Boolean (default: false)
Support_Option__c        → BASIC|STANDARD|PREMIUM
Name (auto)              → GD-YYYYMMDD-00000
CreatedDate (auto)
```

### Error_Message__c
```
ID (PK)
Name                     → Text
Message_Key__c (External ID, Unique)
Message_Value__c         → Text (1000 chars)
Message_Type__c          → Error|Warning|Info
CreatedDate (auto)
```

---

## Apex Test Coverage

```
✓ testSuccessfulApplicationSubmission     (Contact create, Grant create, Disbursement create)
✓ testIneligibleHighIncome                (Income threshold validation)
✓ testExistingContactUpdate               (Contact update by phone)
✓ testSupportOptionChangeValid            (Valid change logic)
✓ testSupportOptionChangeInvalid          (Reject invalid change)
✓ testInvalidDTO                          (DTO validation)
✓ testStandardOption                      (6-month disbursement)
✓ testPremiumOption                       (12-month disbursement)

Total Tests: 8
Expected Coverage: >80% of service logic
```

---

## Configuration Points

### To Change Support Options:
Edit `SupportOptionConfig.cls` - `OPTIONS` map

### To Change Income Threshold:
Edit `GrantApplicationService.cls` - `INCOME_THRESHOLD`

### To Add Error Messages:
Create records in `Error_Message__c` custom object (no code change)

### To Modify Validation Rules:
- Phone/Postal/Income: Edit validation in `grantApplicationForm.js`
- Income threshold: Edit constant in `GrantApplicationService.cls`

---

## Deployment Checklist

- [ ] Deploy `Grant_Application__c` custom object
- [ ] Deploy `Grant_Disbursed__c` custom object
- [ ] Deploy `Error_Message__c` custom object
- [ ] Deploy Apex classes (7 classes + 1 test)
- [ ] Deploy LWC component
- [ ] Add component to Lightning page
- [ ] Test with sample data
- [ ] Run `GrantApplicationServiceTest` → verify 100% pass
- [ ] Create error message records (optional)
- [ ] Configure page layouts (optional)
- [ ] Set field-level security (optional)

---

## Performance Notes

- **Upsert Contact**: Uses Phone field as external ID
- **Query Optimization**: Indexed lookups on Contact__c
- **Batch Limits**: Can process up to 100 applications per API call
- **Disbursement Creation**: Creates up to 12 records per submission

---

## Security Implementation

✓ Apex uses `with sharing` keyword  
✓ LWC uses proper `@AuraEnabled` annotations  
✓ Server-side validation on all inputs  
✓ Phone number is unique identifier (no SSN/ID exposure)  
✓ Custom exception prevents error leakage  

---

## Support & Documentation

📖 **GRANT_APPLICATION_GUIDE.md** - Complete implementation guide  
⚙️ **GRANT_APPLICATION_ADMIN_CONFIG.md** - Admin configuration guide  
🧪 **GrantApplicationServiceTest.cls** - Test examples  

---

**System Version**: 1.0  
**API Version**: 61.0  
**Last Updated**: November 2025  
**Status**: ✓ Ready for Production
