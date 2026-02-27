@isTest(SeeAllData=false)
public class CCSP_Comprehensive_Test_Template {

    // =========================================================
    // CONSTANTS & STATIC VARIABLES
    // =========================================================
    public static final String SYS_ADMIN_PROFILE    = 'System Administrator';
    public static final String CONTACT_CENTER_PROFILE = 'Contact Center';
    public static final String CCSP_ADMIN_PROFILE   = 'CCSP Admin';

    // =========================================================
    // @TESTSETUP – SHARED TEST DATA
    // =========================================================
    /**
     * Description : Creates shared test data for ALL test methods in this class
     * Notes       : Runs ONCE before all tests, data is reused per test method
     * Best practice: This is for data needed by multiple tests
     * @author     : <Your Name>
     * @date       : <DD/MM/YYYY>
     */
    @testSetup
    static void setup() {

        // Create admin user for test execution
        User systemAdminUser = CCSP_TestDataFactory.createCCSPAdminRunUser();

        // Run all data creation as admin user (ensures proper permissions)
        System.runAs(systemAdminUser) {

            // ---------- TIER 1: Base Objects (Account, Contact) ----------
            // Create Account (Billing type by default)
            Account acc = CCSP_TestDataFactory.createAccount();
            // Account is auto‑inserted in factory method

            // Create Business Account
            List<Account> businessAccounts = CCSP_TestDataFactory.createBusinessAccounts();
            insert businessAccounts;

            // Create Billing Account
            List<Account> billingAccounts = CCSP_TestDataFactory.createBillingAccounts();
            insert billingAccounts;

            // Create Contacts
            List<Contact> contactList = CCSP_TestDataFactory.createContact();
            insert contactList;

            // ---------- TIER 2: Utility Objects (Premises, Service Points, Meters) ----------
            // Create Premises
            List<Velocity_cmt__Premises__c> premList =
                CCSP_TestDataFactory.createPremises();
            insert premList;

            // Create Service Points
            List<Velocity_cmt__ServicePoints__c> spList =
                CCSP_TestDataFactory.createServicePoints();
            insert spList;

            // Create Meters (Inventory Items)
            List<Velocity_cmt__InventoryItem__c> meterList =
                CCSP_TestDataFactory.createMeter();
            meterList[0].CCSP_Meter_On_Off_Status__c = 'On';
            insert meterList;

            // Update Service Points with meter reference
            spList[0].Velocity_cmt__MeterId__c = meterList[0].Id;
            spList[0].CCSP_cust__Status__c     = 'In Service';
            spList[0].CCSP_Service_Point_ID__c = '0042958005';
            update spList;

            // ---------- TIER 3: Service Agreements & Relationships ----------
            // Create Service Agreements (Assets)
            List<Asset> saList = CCSP_TestDataFactory.createServiceAgreement();
            saList[0].AccountId       = acc.Id;
            saList[0].CCSP_SA_Status__c = 'Active';
            insert saList;

            // Create SA–SP Relationships
            List<CCSP_SA_SP_Relationship__c> saSpList =
                CCSP_TestDataFactory.createSASpRelationship(
                    spList[0].Id,
                    saList[0].Id
                );
            insert saSpList;

            // ---------- TIER 4: Customer Interactions & Topics ----------
            // Create Customer Interaction
            List<Velocity_cmt__CustomerInteraction__c> custIntList =
                CCSP_TestDataFactory.createCustomerInteraction();
            custIntList[0].Velocity_cmt__AccountId__c = acc.Id;
            insert custIntList;

            // ---------- TIER 5: ACRI (Account Contact Related Information) ----------
            List<CCSP_AccountContactRelatedInformation__c> acriList =
                CCSP_TestDataFactory.createAccountContactRelatedInfo();
            insert acriList;

            // ---------- TIER 6: Custom Settings & Configuration ----------
            // Create Trigger Switch (controls trigger execution)
            PS_TriggerSwitch__c triggerSwitch =
                CCSP_TestDataFactory.createPSTriggerSwitch();
            triggerSwitch.Name      = 'CCSP_Account_Trigger';
            triggerSwitch.IsActive__c = false;
            update triggerSwitch;

            // ---------- TIER 7: Cases & Work Orders (if needed) ----------
            List<Case> caseList = CCSP_TestDataFactory.createCase();
            insert caseList;
        }
    }

    // =========================================================
    // TYPE 1: BASIC UNIT TESTS (Standard Apex Classes)
    // =========================================================
    /**
     * Pattern : Test standard apex class methods
     * Use For : Utility classes, helper methods, static methods
     */
    @isTest
    static void testBasicMethod_ValidInputs_ReturnsExpectedResult() {
        // ARRANGE
        Account acc = [SELECT Id, Name FROM Account WHERE Name = 'Account1' LIMIT 1];
        String testInput = 'testValue';

        // ACT
        Test.startTest();
        String result = CCSP_CommonMethodUtility.someMethod(testInput);
        Test.stopTest();

        // ASSERT
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals('ExpectedValue', result, 'Should return expected value');
    }

    @isTest
    static void testRecordTypeRetrieval_ValidType_ReturnsId() {
        // ARRANGE
        String recordTypeName = 'Service Agreement';

        // ACT
        Test.startTest();
        Id recordTypeId = CCSP_CommonMethodUtility.getAssetRecordType(recordTypeName);
        Test.stopTest();

        // ASSERT
        System.assertNotEquals(null, recordTypeId, 'Record Type Id should not be null');
    }

    // =========================================================
    // TYPE 2: TRIGGER TESTS (Before/After DML Operations)
    // =========================================================
    /**
     * Pattern : Test trigger handler methods
     * Use For : Trigger classes, trigger handler patterns
     * Note    : Use PS_TriggerSwitch__c to control trigger execution
     */
    @isTest
    static void testAccountTrigger_BeforeInsert_SetsDefaultValues() {

        // ARRANGE
        PS_TriggerSwitch__c triggerSwitch =
            CCSP_TestDataFactory.getPSTriggerSwitch('CCSP_Account_Trigger');
        triggerSwitch.IsActive__c = true;
        update triggerSwitch;

        Account acc = new Account(
            Name = 'Trigger Test Account'
        );

        // ACT
        Test.startTest();
        insert acc;
        Test.stopTest();

        // ASSERT
        acc = [SELECT Id, <Some_Field__c> FROM Account WHERE Id = :acc.Id];
        System.assertEquals(
            'ExpectedDefault',
            acc.<Some_Field__c>,
            'Default value should be set by trigger'
        );
    }

    // =========================================================
    // More TYPE sections (3 – 10) can be added here
    // following the same pattern as in your reference:
    // TYPE 3: Future/Batch/Queueable tests
    // TYPE 4: @AuraEnabled / LWC controller tests
    // TYPE 5: Integration tests (callouts, mocks)
    // TYPE 6: Negative tests (error handling)
    // TYPE 7: Bulk tests (200 records)
    // TYPE 8: Security/profile/permission tests
    // TYPE 9: Regression / scenario tests
    // TYPE 10: Misc / edge‑case tests
}
