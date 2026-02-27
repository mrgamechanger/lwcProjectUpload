# Grant Application System - Admin Configuration Guide

## Quick Setup Checklist

- [ ] Deploy all Apex classes
- [ ] Deploy all custom objects
- [ ] Deploy LWC component
- [ ] Create support option configuration records (optional)
- [ ] Create error message records (optional)
- [ ] Add component to Lightning pages
- [ ] Test with sample applications
- [ ] Configure page layouts for Grant_Application__c and Grant_Disbursed__c

---

## 1. Support Option Configuration

Support options are defined in `SupportOptionConfig.cls`. To modify:

### Default Configuration
```
BASIC:     300 SGD/month × 3 months = 900 SGD total
STANDARD:  250 SGD/month × 6 months = 1,500 SGD total
PREMIUM:   200 SGD/month × 12 months = 2,400 SGD total
```

### To Customize:
1. Open `SupportOptionConfig.cls`
2. Modify the `OPTIONS` map:
```apex
public static final Map<String, SupportOption> OPTIONS = new Map<String, SupportOption>{
    'BASIC' => new SupportOption('BASIC', 500, 4),      // New: 500/month, 4 months
    'STANDARD' => new SupportOption('STANDARD', 400, 8), // New: 400/month, 8 months
    'PREMIUM' => new SupportOption('PREMIUM', 300, 12)   // New: 300/month, 12 months
};
```
3. Update `grantApplicationForm.js` `supportOptions` array to match:
```javascript
supportOptions = [
    { label: 'Basic (4 months)', value: 'BASIC' },
    { label: 'Standard (8 months)', value: 'STANDARD' },
    { label: 'Premium (12 months)', value: 'PREMIUM' }
];
```
4. Deploy both changes

---

## 2. Income Threshold Configuration

Default income threshold: **2,000 SGD**

To modify:
1. Open `GrantApplicationService.cls`
2. Change this line:
```apex
private static final Decimal INCOME_THRESHOLD = 2000; // Change 2000 to desired amount
```
3. Deploy

**Note**: Applicants with monthly income ≥ threshold will be rejected.

---

## 3. Error Message Management

Error messages are stored in the `Error_Message__c` custom object and can be maintained by admins without code changes.

### Insert Sample Error Messages:

```sql
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
);
```

### Via UI:
1. Navigate to Error_Message__c list view
2. Click "New"
3. Fill in:
   - **Name**: Display name
   - **Message_Key**: Unique identifier (used in code)
   - **Message_Value**: The actual message text
   - **Message_Type**: Error, Warning, or Info
4. Save

### Common Message Keys:
- `INVALID_PHONE` - Phone number validation
- `INVALID_POSTAL` - Postal code validation
- `INVALID_INCOME` - Income validation
- `HIGH_INCOME_REJECTION` - Income threshold exceeded
- `OPTION_CHANGE_ERROR` - Invalid support option change

---

## 4. Contact & Grant Application Management

### Grant_Application__c Fields

| Field | Type | Description |
|-------|------|-------------|
| Application Number | Auto# | Read-only: GA-YYYYMMDD-00000 |
| Contact__c | Lookup | Link to applicant's contact |
| Monthly Income | Currency | Applicant's monthly income in SGD |
| Support Option | Picklist | BASIC, STANDARD, or PREMIUM |
| Application Date | Date | Auto-populated to today |
| Status | Picklist | New, In Review, Approved, Rejected |

### Grant_Disbursed__c Fields

| Field | Type | Description |
|-------|------|-------------|
| Disbursement Number | Auto# | Read-only: GD-YYYYMMDD-00000 |
| Contact__c | Lookup | Link to recipient's contact |
| Grant Application | Lookup | Link to grant application |
| Amount to be Disbursed | Currency | Monthly amount in SGD |
| Disbursed Date | Date | When this disbursement is scheduled |
| Grant is Disbursed | Checkbox | True when payment has been made |
| Support Option | Picklist | BASIC, STANDARD, or PREMIUM |

---

## 5. Monitoring & Reporting

### Key Queries for Analysis

**Total applications by support option:**
```sql
SELECT Support_Option__c, COUNT(Id) as Count
FROM Grant_Application__c
GROUP BY Support_Option__c
```

**Upcoming disbursements:**
```sql
SELECT Contact__c, Amount_to_be_Disbursed__c, Disbursed_Date__c
FROM Grant_Disbursed__c
WHERE Disbursed_Date__c >= TODAY()
  AND Grant_Is_Disbursed__c = false
ORDER BY Disbursed_Date__c ASC
```

**Contacts with multiple applications:**
```sql
SELECT Contact__c, COUNT(Id) as ApplicationCount
FROM Grant_Application__c
GROUP BY Contact__c
HAVING COUNT(Id) > 1
```

**Disbursement summary by contact:**
```sql
SELECT Contact__c, SUM(Amount_to_be_Disbursed__c) as TotalDisbursed
FROM Grant_Disbursed__c
WHERE Grant_Is_Disbursed__c = true
GROUP BY Contact__c
```

---

## 6. Security & Permissions

### Recommended Roles/Permissions

**Grant Admin Role** - Full CRUD on:
- Grant_Application__c
- Grant_Disbursed__c
- Error_Message__c
- Contact

**Grant Reviewer Role** - Read/Write:
- Grant_Application__c (update Status only)
- Grant_Disbursed__c (read only)

**Applicant Role** - Create Only:
- Grant_Application__c (via LWC form)

### Field-Level Security

Suggested settings:
- `Monthly_Income__c` - Admin only
- `Support_Option__c` - Admin & Reviewers
- `Status__c` - Reviewers only
- `Grant_Is_Disbursed__c` - Admin only

---

## 7. Testing Data Setup

### Test Application 1 - Should Succeed
```
First Name: John
Last Name: Doe
Phone: 6581234567
Postal Code: 123456
Monthly Income: 1500
Support Option: BASIC
Expected: Success
```

### Test Application 2 - Should Fail (High Income)
```
First Name: Jane
Last Name: Smith
Phone: 6587654321
Postal Code: 654321
Monthly Income: 2500
Support Option: STANDARD
Expected: Failure - Income threshold exceeded
```

### Test Application 3 - Support Option Change
```
First Application:
Phone: 6591111111
Support Option: BASIC

Later Re-application:
Phone: 6591111111
Support Option: PREMIUM
Expected: Success - if valid disbursement history
```

---

## 8. Troubleshooting

### Issue: Component Not Visible on Page

**Solution**:
1. Verify component is deployed
2. Check page assignments
3. Verify user permissions
4. Clear browser cache and reload

### Issue: Validation Errors Not Showing

**Solution**:
1. Check browser console (F12) for JavaScript errors
2. Verify regex patterns in JavaScript
3. Check that validation methods are being called

### Issue: Disbursements Not Creating

**Solution**:
1. Check object permissions
2. Verify Support_Option__c is valid (BASIC, STANDARD, PREMIUM)
3. Check Apex logs for errors
4. Ensure Contact record exists with valid Phone

### Issue: Contact Updates Not Working

**Solution**:
1. Verify Contact is being found by Phone field
2. Check Contact record ownership/permissions
3. Review Apex logs for upsert errors

---

## 9. Maintenance Tasks

### Regular Tasks

**Weekly**:
- Review pending applications
- Update Status of applications under review

**Monthly**:
- Process disbursements (mark Grant_Is_Disbursed__c = true for due records)
- Review disbursement summary reports
- Archive old applications (consider data retention policies)

**Quarterly**:
- Review error messages and update as needed
- Analyze application approval rates
- Update support option configurations if needed

---

## 10. Customization Examples

### Add Custom Field to Grant_Application__c

1. Create field: `Approver__c` (Lookup to User)
2. Add to page layout
3. Update `GrantApplicationService.cls` to populate if needed

### Add Email Notification on Disbursement

Add trigger on `Grant_Disbursed__c`:
```apex
trigger GrantDisbursedNotification on Grant_Disbursed__c (after insert, after update) {
    for (Grant_Disbursed__c disburse : Trigger.new) {
        if (disburse.Grant_Is_Disbursed__c == true && 
            Trigger.oldMap.get(disburse.Id).Grant_Is_Disbursed__c == false) {
            // Send email notification
        }
    }
}
```

### Add Validation Rule

Prevent manual grant creation with income ≥ 2000:
```
AND(
    ISNULL($RecordType.DeveloperName, false) = false,
    Monthly_Income__c >= 2000
)

Error Message: "Applicant income exceeds threshold. Use system to validate."
```

---

## Additional Resources

- [Salesforce Documentation](https://developer.salesforce.com)
- Lightning Web Components: https://developer.salesforce.com/docs/component-library/
- Apex Development: https://developer.salesforce.com/docs/apex/

---

**Last Updated**: November 2025  
**Version**: 1.0
