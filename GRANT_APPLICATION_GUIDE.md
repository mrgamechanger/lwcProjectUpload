# Grant Application System - Implementation Guide

## Overview
This implementation provides a complete grant application system for Salesforce with LWC form, Apex services, and comprehensive business logic for managing grant disbursements.

## Components Created

### 1. LWC Component: `grantApplicationForm`
**Location**: `force-app/main/default/lwc/grantApplicationForm/`

**Files**:
- `grantApplicationForm.html` - Form template with validation UI
- `grantApplicationForm.js` - Component logic and validation
- `grantApplicationForm.css` - Styling
- `grantApplicationForm.js-meta.xml` - Metadata

**Features**:
- Form fields: First Name, Last Name, Phone, Postal Code, Monthly Income, Support Option
- Client-side validation:
  - Phone: Must match `65[0-9]{8}` (Singapore format)
  - Postal Code: Must be exactly 6 digits
  - Monthly Income: Must be a positive number
- Real-time validation error display
- Form reset functionality
- Loading states during submission
- Success/error message display
- Responsive design

**Usage**:
```html
<c-grant-application-form></c-grant-application-form>
```

### 2. Apex Classes

#### A. `GrantApplicationDTO`
**Purpose**: Data Transfer Object for grant application data
**Key Methods**:
- Constructor with all required fields
- `isValid()` - Validates all fields

#### B. `SupportOptionConfig`
**Purpose**: Manages support option configurations
**Support Options**:
- **BASIC**: 3 months × 300 SGD/month = 900 SGD total
- **STANDARD**: 6 months × 250 SGD/month = 1,500 SGD total
- **PREMIUM**: 12 months × 200 SGD/month = 2,400 SGD total

**Key Methods**:
- `getOptionConfig(String optionCode)` - Get config by code
- `getAllOptions()` - Get all available options

#### C. `GrantApplicationException`
**Purpose**: Custom exception for grant application business logic errors

#### D. `GrantApplicationService`
**Purpose**: Core business logic for grant applications
**Key Methods**:
- `submitApplication(GrantApplicationDTO dto)` - Main entry point
- `checkEligibility(Decimal monthlyIncome)` - Income threshold check (< 2000 SGD)
- `findOrCreateContact(GrantApplicationDTO dto)` - Contact management by phone
- `createGrantApplication(Contact contact, GrantApplicationDTO dto)` - Create grant record
- `createInitialDisbursements(...)` - Create monthly disbursement records
- `handleSupportOptionChange(...)` - Manage option changes with validation

**Business Logic**:
1. **Eligibility Check**: Monthly income must be < 2,000 SGD
2. **Contact Management**: Contacts are identified by phone number
3. **Disbursement Creation**: Creates monthly records starting from 1st of next month
4. **Support Option Changes**:
   - Validates that total previously disbursed ≤ new option total
   - Calculates remaining amount and adjusts future disbursements
   - Throws exception if change would result in negative balance

#### E. `ErrorMessageService`
**Purpose**: Admin-maintained error message retrieval
**Key Methods**:
- `getErrorMessage(String messageKey)` - Retrieve message by key
- `refreshCache()` - Clear and reload message cache

#### F. `GrantApplicationController`
**Purpose**: LWC Apex controller
**AuraEnabled Methods**:
- `submitGrantApplication(...)` - Calls GrantApplicationService

### 3. Custom Objects

#### A. `Grant_Application__c`
**Fields**:
- `Contact__c` (Lookup) - Reference to Contact
- `Monthly_Income__c` (Currency) - Applicant's income
- `Support_Option__c` (Picklist) - BASIC, STANDARD, PREMIUM
- `Application_Date__c` (Date) - Auto-set to TODAY()
- `Status__c` (Picklist) - New, In Review, Approved, Rejected

**Auto Number Format**: `GA-{YYYY}{MM}{DD}-{00000}`

#### B. `Grant_Disbursed__c`
**Fields**:
- `Contact__c` (Lookup) - Reference to Contact
- `Grant_Application__c` (Lookup) - Reference to Grant Application
- `Amount_to_be_Disbursed__c` (Currency) - Monthly amount
- `Disbursed_Date__c` (Date) - When this disbursement is due
- `Grant_Is_Disbursed__c` (Checkbox) - True when disbursed
- `Support_Option__c` (Picklist) - Associated support option

**Auto Number Format**: `GD-{YYYY}{MM}{DD}-{00000}`

#### C. `Error_Message__c`
**Fields**:
- `Message_Key__c` (Text, External ID) - Unique key for message
- `Message_Value__c` (Text) - The actual message
- `Message_Type__c` (Picklist) - Error, Warning, Info

## Workflow

### Initial Application Submission
1. User fills form with all required information
2. Client-side validation runs (phone, postal, income format)
3. Form submits to Apex controller
4. Service checks income eligibility (< 2,000 SGD)
5. Contact found/created by phone number
6. Grant_Application__c record created
7. Monthly Grant_Disbursed__c records created (starting 1st of next month)
8. Success message displayed to user

### Existing Applicant Re-Application
1. User with existing phone submits new application
2. Contact is updated with new information
3. If support option changes:
   - System checks all previous disbursements
   - Validates new total ≥ previously disbursed amount
   - If valid: creates new disbursement schedule for remaining amount
   - If invalid: throws error and prevents change
4. If support option same: creates new grant application

### Support Option Change Example
**Scenario**: Applicant originally chose BASIC (3 × 300 = 900 SGD total)
- 1st disbursement (300) already processed → Total Disbursed = 300
- 2nd disbursement scheduled but not processed
- Applicant changes to STANDARD (6 × 250 = 1,500 SGD total)
- Remaining amount = 1,500 - 300 = 1,200 SGD
- Remaining months = 5
- New monthly amount = 1,200 / 5 = 240 SGD per month
- Old 2nd and 3rd disbursements deleted
- New 5 disbursement records created with 240 SGD each

## Testing

### Run Tests
```bash
sfdx force:apex:test:run -u <ORG_ALIAS> -c
```

### Test Class: `GrantApplicationServiceTest`
**Coverage**: 8 test methods
1. `testSuccessfulApplicationSubmission` - Happy path
2. `testIneligibleHighIncome` - Income threshold rejection
3. `testExistingContactUpdate` - Contact updates
4. `testSupportOptionChangeValid` - Valid option change
5. `testSupportOptionChangeInvalid` - Invalid option change
6. `testInvalidDTO` - DTO validation
7. `testStandardOption` - STANDARD option specifics
8. `testPremiumOption` - PREMIUM option specifics

## Error Handling

The system implements comprehensive error handling:

1. **Eligibility Exception**:
   ```
   "Applicant income of SGD 2500 exceeds the maximum threshold 
   of SGD 2000. You are not eligible for this grant."
   ```

2. **Invalid Support Option Change**:
   ```
   "Cannot change to BASIC option. Already disbursed SGD 2400 
   exceeds new total of SGD 900. Please contact support."
   ```

3. **Client-side Validation Errors**:
   - "Phone must be in format: 65xxxxxxxx (Singapore number)"
   - "Postal code must be exactly 6 digits"
   - "Monthly income must be a positive number"

## Configuration

### Error Messages
Admins can maintain error messages in `Error_Message__c` object with keys:
- `INVALID_PHONE` - Invalid phone format
- `INVALID_POSTAL` - Invalid postal code
- `INVALID_INCOME` - Invalid income

### Support Options
To modify support options, edit `SupportOptionConfig.cls`:
```apex
public static final Map<String, SupportOption> OPTIONS = new Map<String, SupportOption>{
    'BASIC' => new SupportOption('BASIC', 300, 3),
    'STANDARD' => new SupportOption('STANDARD', 250, 6),
    'PREMIUM' => new SupportOption('PREMIUM', 200, 12)
};
```

### Income Threshold
To modify income threshold, edit in `GrantApplicationService.cls`:
```apex
private static final Decimal INCOME_THRESHOLD = 2000;
```

## Security

- All Apex classes use `with sharing` keyword
- LWC uses proper Apex Enabled annotations
- Data validation at multiple levels (client-side and server-side)
- Exception handling prevents information leakage

## Future Enhancements

1. **Bulk Processing**: Handle multiple applications in batch
2. **Automated Disbursement**: Trigger actual fund transfers
3. **Reporting**: Dashboards for disbursement tracking
4. **Notifications**: Email/SMS when disbursements process
5. **Document Upload**: Support application documentation
6. **Approval Process**: Workflow for manual review
7. **API Integration**: REST API for third-party systems

## File Structure

```
force-app/main/default/
├── classes/
│   ├── GrantApplicationDTO.cls
│   ├── GrantApplicationDTO.cls-meta.xml
│   ├── GrantApplicationService.cls
│   ├── GrantApplicationService.cls-meta.xml
│   ├── GrantApplicationServiceTest.cls
│   ├── GrantApplicationServiceTest.cls-meta.xml
│   ├── GrantApplicationController.cls
│   ├── GrantApplicationController.cls-meta.xml
│   ├── SupportOptionConfig.cls
│   ├── SupportOptionConfig.cls-meta.xml
│   ├── GrantApplicationException.cls
│   ├── GrantApplicationException.cls-meta.xml
│   ├── ErrorMessageService.cls
│   └── ErrorMessageService.cls-meta.xml
├── lwc/
│   └── grantApplicationForm/
│       ├── grantApplicationForm.html
│       ├── grantApplicationForm.js
│       ├── grantApplicationForm.css
│       └── grantApplicationForm.js-meta.xml
└── objects/
    ├── Grant_Application__c/
    │   └── Grant_Application__c.object-meta.xml
    ├── Grant_Disbursed__c/
    │   └── Grant_Disbursed__c.object-meta.xml
    └── Error_Message__c/
        └── Error_Message__c.object-meta.xml
```

## Deployment Steps

1. Ensure all custom objects are created first
2. Deploy Apex classes
3. Deploy LWC component
4. Add component to Lightning page or record type
5. (Optional) Insert Error_Message__c records for custom messages
6. Run test class to verify deployment

## Support & Troubleshooting

### Debug Logging
To enable debug logging for the service, check system logs after submission. Errors are logged with:
- LoggingLevel: ERROR
- StackTrace included

### Common Issues

1. **"Premature end of file" for custom objects**
   - Ensure proper XML closing tags in object-meta.xml files

2. **LWC Not Appearing in App**
   - Verify metadata (targets) in js-meta.xml file
   - Ensure user has permission to view component

3. **Phone Validation Fails**
   - Phone must start with "65" followed by 8 digits
   - Examples: 6581234567, 6598765432

---

**Version**: 1.0
**Last Updated**: November 2025
