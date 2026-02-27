@IsTest
private class GrantApplicationServiceTest {
    @IsTest static void testNewContactCreation() {
        Test.startTest();
        GrantApplicationService.SubmissionResult res = GrantApplicationService.submitGrantApplication('John','Doe','6512345678','123456',1000,'BASIC');
        Test.stopTest();
        System.assert(res.success, res.message);
        Contact c = [SELECT Id, FirstName, LastName, Phone, MailingPostalCode, Description FROM Contact WHERE Phone='6512345678' LIMIT 1];
        System.assertEquals('John', c.FirstName);
        System.assertEquals(3, res.disbursements.size());
    }

    @IsTest static void testExistingContactUpdate() {
        Contact c = new Contact(FirstName='Jane', LastName='Smith', Phone='6598765432', MailingPostalCode='654321', Description='old');
        insert c;
        Test.startTest();
        GrantApplicationService.SubmissionResult res = GrantApplicationService.submitGrantApplication('Jane','Smith','6598765432','654321',500,'PREMIUM');
        Test.stopTest();
        System.assert(res.success);
        Contact c2 = [SELECT Id, Description FROM Contact WHERE Id=:c.Id];
        System.assert(c2.Description.contains('SupportOption:PREMIUM'));
    }
}
/**
 * @description Test class for GrantApplicationService
 * Tests eligibility checks, contact management, grant application creation, and disbursement logic
 */
@isTest
private class GrantApplicationServiceTest {
    /**
     * Test data setup
     */
    @testSetup
    static void setupTestData() {
        // Insert test error messages
        Error_Message__c errorMsg = new Error_Message__c(
            Name = 'Invalid Phone Format',
            Message_Key__c = 'INVALID_PHONE',
            Message_Value__c = 'Phone must be in format: 65xxxxxxxx',
            Message_Type__c = 'Error'
        );
        insert errorMsg;
    }

    /**
     * @description Test successful grant application submission with eligible income
     */
    @isTest
    static void testSuccessfulApplicationSubmission() {
        GrantApplicationDTO dto = new GrantApplicationDTO(
            'John',
            'Doe',
            '6581234567',
            '123456',
            1500.00,
            'BASIC'
        );

        Test.startTest();
        Map<String, Object> result = GrantApplicationService.submitApplication(dto);
        Test.stopTest();

        Assert.isTrue((Boolean) result.get('success'), 'Application should be successful');
        Assert.isNotNull(result.get('message'), 'Message should be returned');

        // Verify contact was created
        List<Contact> contacts = [SELECT Id, FirstName, LastName, Phone FROM Contact WHERE Phone = '6581234567'];
        Assert.areEqual(1, contacts.size(), 'Contact should be created');
        Assert.areEqual('John', contacts[0].FirstName);

        // Verify grant application was created
        List<Grant_Application__c> grants = [
            SELECT Id, Contact__c, Support_Option__c, Monthly_Income__c
            FROM Grant_Application__c
        ];
        Assert.areEqual(1, grants.size(), 'Grant application should be created');
        Assert.areEqual('BASIC', grants[0].Support_Option__c);

        // Verify disbursements were created (3 months for BASIC)
        List<Grant_Disbursed__c> disbursements = [
            SELECT Id, Amount_to_be_Disbursed__c, Disbursed_Date__c
            FROM Grant_Disbursed__c
            WHERE Contact__c = :contacts[0].Id
            ORDER BY Disbursed_Date__c ASC
        ];
        Assert.areEqual(3, disbursements.size(), 'Should have 3 disbursement records for BASIC option');
        Assert.areEqual(300, disbursements[0].Amount_to_be_Disbursed__c);
    }

    /**
     * @description Test that high income applicants are rejected
     */
    @isTest
    static void testIneligibleHighIncome() {
        GrantApplicationDTO dto = new GrantApplicationDTO(
            'Jane',
            'Smith',
            '6587654321',
            '654321',
            2500.00,
            'STANDARD'
        );

        Test.startTest();
        Map<String, Object> result = GrantApplicationService.submitApplication(dto);
        Test.stopTest();

        Assert.isFalse((Boolean) result.get('success'), 'Application should fail due to high income');
        String message = (String) result.get('message');
        Assert.isTrue(
            message.contains('exceeds'),
            'Error message should indicate income threshold exceeded'
        );
    }

    /**
     * @description Test existing contact update with same support option
     */
    @isTest
    static void testExistingContactUpdate() {
        // First application
        GrantApplicationDTO dto1 = new GrantApplicationDTO(
            'Bob',
            'Johnson',
            '6591234567',
            '111111',
            1200.00,
            'BASIC'
        );

        Test.startTest();
        Map<String, Object> result1 = GrantApplicationService.submitApplication(dto1);
        Assert.isTrue((Boolean) result1.get('success'));

        // Second application with same phone but updated info
        GrantApplicationDTO dto2 = new GrantApplicationDTO(
            'Robert',
            'Johnson-Smith',
            '6591234567',
            '222222',
            1300.00,
            'BASIC'
        );
        Map<String, Object> result2 = GrantApplicationService.submitApplication(dto2);
        Assert.isTrue((Boolean) result2.get('success'));
        Test.stopTest();

        // Verify only one contact exists
        List<Contact> contacts = [SELECT Id, FirstName, MailingPostalCode FROM Contact WHERE Phone = '6591234567'];
        Assert.areEqual(1, contacts.size(), 'Should have only one contact');
        Assert.areEqual('Robert', contacts[0].FirstName, 'Contact should be updated');
        Assert.areEqual('222222', contacts[0].MailingPostalCode, 'Postal code should be updated');
    }

    /**
     * @description Test support option change with valid disbursement history
     */
    @isTest
    static void testSupportOptionChangeValid() {
        // Create initial application with BASIC
        GrantApplicationDTO dtoBasic = new GrantApplicationDTO(
            'Alice',
            'Williams',
            '6581111111',
            '333333',
            1100.00,
            'BASIC'
        );

        Test.startTest();
        Map<String, Object> result1 = GrantApplicationService.submitApplication(dtoBasic);
        Assert.isTrue((Boolean) result1.get('success'));

        // Simulate some disbursements being processed
        List<Grant_Disbursed__c> disbursements = [
            SELECT Id, Grant_Is_Disbursed__c
            FROM Grant_Disbursed__c
            ORDER BY Disbursed_Date__c ASC
            LIMIT 1
        ];
        if (!disbursements.isEmpty()) {
            disbursements[0].Grant_Is_Disbursed__c = true;
            update disbursements[0];
        }

        // Change to STANDARD support option
        GrantApplicationDTO dtoStandard = new GrantApplicationDTO(
            'Alice',
            'Williams',
            '6581111111',
            '333333',
            1100.00,
            'STANDARD'
        );
        Map<String, Object> result2 = GrantApplicationService.submitApplication(dtoStandard);
        Test.stopTest();

        Assert.isTrue((Boolean) result2.get('success'), 'Support option change should succeed');

        // Verify grant application was updated
        List<Grant_Application__c> grants = [
            SELECT Support_Option__c
            FROM Grant_Application__c
            WHERE Contact__c IN (SELECT Id FROM Contact WHERE Phone = '6581111111')
        ];
        Assert.isTrue(grants.size() > 0);
        Assert.areEqual('STANDARD', grants[0].Support_Option__c, 'Support option should be updated');
    }

    /**
     * @description Test support option change that would result in impossible disbursement
     */
    @isTest
    static void testSupportOptionChangeInvalid() {
        // Create initial application with PREMIUM (12 months * 200 = 2400 total)
        GrantApplicationDTO dtoPremium = new GrantApplicationDTO(
            'Charlie',
            'Brown',
            '6582222222',
            '444444',
            1050.00,
            'PREMIUM'
        );

        Test.startTest();
        Map<String, Object> result1 = GrantApplicationService.submitApplication(dtoPremium);
        Assert.isTrue((Boolean) result1.get('success'));

        // Simulate all disbursements being processed
        List<Grant_Disbursed__c> allDisbursements = [
            SELECT Id, Grant_Is_Disbursed__c
            FROM Grant_Disbursed__c
        ];
        for (Grant_Disbursed__c d : allDisbursements) {
            d.Grant_Is_Disbursed__c = true;
        }
        update allDisbursements;

        // Try to change to BASIC (3 months * 300 = 900 total, less than already disbursed)
        GrantApplicationDTO dtoBasic = new GrantApplicationDTO(
            'Charlie',
            'Brown',
            '6582222222',
            '444444',
            1050.00,
            'BASIC'
        );
        Map<String, Object> result2 = GrantApplicationService.submitApplication(dtoBasic);
        Test.stopTest();

        Assert.isFalse((Boolean) result2.get('success'), 'Support option change should fail');
        String message = (String) result2.get('message');
        Assert.isTrue(
            message.contains('already disbursed'),
            'Error message should indicate disbursement conflict'
        );
    }

    /**
     * @description Test invalid DTO validation
     */
    @isTest
    static void testInvalidDTO() {
        GrantApplicationDTO dto = new GrantApplicationDTO('', '', '', '', -100, '');

        Test.startTest();
        Map<String, Object> result = GrantApplicationService.submitApplication(dto);
        Test.stopTest();

        Assert.isFalse((Boolean) result.get('success'), 'Application should fail');
    }

    /**
     * @description Test STANDARD support option (6 months)
     */
    @isTest
    static void testStandardOption() {
        GrantApplicationDTO dto = new GrantApplicationDTO(
            'David',
            'Lee',
            '6583333333',
            '555555',
            900.00,
            'STANDARD'
        );

        Test.startTest();
        Map<String, Object> result = GrantApplicationService.submitApplication(dto);
        Test.stopTest();

        Assert.isTrue((Boolean) result.get('success'));

        List<Contact> contacts = [SELECT Id FROM Contact WHERE Phone = '6583333333'];
        List<Grant_Disbursed__c> disbursements = [
            SELECT Amount_to_be_Disbursed__c
            FROM Grant_Disbursed__c
            WHERE Contact__c = :contacts[0].Id
        ];
        Assert.areEqual(6, disbursements.size(), 'Should have 6 disbursement records for STANDARD option');
        Assert.areEqual(250, disbursements[0].Amount_to_be_Disbursed__c, 'Monthly amount should be 250');
    }

    /**
     * @description Test PREMIUM support option (12 months)
     */
    @isTest
    static void testPremiumOption() {
        GrantApplicationDTO dto = new GrantApplicationDTO(
            'Emma',
            'Taylor',
            '6584444444',
            '666666',
            800.00,
            'PREMIUM'
        );

        Test.startTest();
        Map<String, Object> result = GrantApplicationService.submitApplication(dto);
        Test.stopTest();

        Assert.isTrue((Boolean) result.get('success'));

        List<Contact> contacts = [SELECT Id FROM Contact WHERE Phone = '6584444444'];
        List<Grant_Disbursed__c> disbursements = [
            SELECT Amount_to_be_Disbursed__c
            FROM Grant_Disbursed__c
            WHERE Contact__c = :contacts[0].Id
        ];
        Assert.areEqual(12, disbursements.size(), 'Should have 12 disbursement records for PREMIUM option');
        Assert.areEqual(200, disbursements[0].Amount_to_be_Disbursed__c, 'Monthly amount should be 200');
    }
}
