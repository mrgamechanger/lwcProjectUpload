@IsTest
private class VoiceChatBotControllerTest {
    @TestSetup
    static void setupData() {
        // Accounts
        insert new Account(Name = 'Acme Corporation');
        insert new Account(Name = 'Acme Subsidiary');
        insert new Account(Name = 'Globex');

        // Contacts
        Account a = [SELECT Id FROM Account WHERE Name = 'Acme Corporation' LIMIT 1];
        insert new Contact(FirstName = 'John', LastName = 'Smith', AccountId = a.Id);
        insert new Contact(FirstName = 'Jane', LastName = 'Doe', AccountId = a.Id);

        // Opportunities
        insert new Opportunity(Name = 'Acme Big Deal', StageName = 'Prospecting', CloseDate = Date.today().addDays(30), Amount = 50000);

        // Cases
        insert new Case(Subject = 'Acme Onboarding', Origin = 'Phone', Status = 'New');
        insert new Case(Subject = 'Globex Support', Origin = 'Email', Status = 'New');
    }

    @IsTest
    static void testRunVoiceSearch_AllObjects() {
        Test.startTest();
        VoiceChatBotController.SearchResponse resp = VoiceChatBotController.runVoiceSearch(
            'acme', 5, 0, 0, 0, 0, null
        );
        Test.stopTest();

        System.assertNotEquals(null, resp, 'Response should not be null');
        System.assert(resp.accounts != null, 'Accounts should be present');
        System.assert(resp.contacts != null, 'Contacts should be present');
        System.assert(resp.opportunities != null, 'Opportunities should be present');
        System.assert(resp.cases != null, 'Cases should be present');

        // Validate some matches
        Boolean foundAcme = false;
        for (Account a : resp.accounts) {
            if (a.Name.contains('Acme')) {
                foundAcme = true;
                break;
            }
        }
        System.assertEquals(true, foundAcme, 'Should find Acme accounts');

        Boolean foundCase = false;
        for (Case c : resp.cases) {
            if (c.Subject.contains('Acme') || c.CaseNumber != null) {
                foundCase = true;
                break;
            }
        }
        System.assertEquals(true, foundCase, 'Should find at least one case');
    }

    @IsTest
    static void testRunVoiceSearch_RestrictToAccount() {
        Test.startTest();
        VoiceChatBotController.SearchResponse resp = VoiceChatBotController.runVoiceSearch(
            'acme', 1, 0, 0, 0, 0, 'Account'
        );
        Test.stopTest();

        System.assertNotEquals(null, resp, 'Response should not be null');
        System.assertEquals(true, resp.accounts.size() > 0, 'Accounts should return rows');
        System.assertEquals(0, resp.contacts.size(), 'Contacts should be empty when restricted');
        System.assertEquals(0, resp.cases.size(), 'Cases should be empty when restricted');
        System.assertEquals(0, resp.opportunities.size(), 'Opps should be empty when restricted');
    }

    @IsTest
    static void testPaginationFlags() {
        // Request small page to trigger hasMore calculation
        Test.startTest();
        VoiceChatBotController.SearchResponse resp = VoiceChatBotController.runVoiceSearch(
            'acme', 1, 0, 0, 0, 0, null
        );
        Test.stopTest();

        System.assertNotEquals(null, resp, 'Response should not be null');
        // Depending on dataset, hasMore may be true for accounts if more than 1 contained "acme"
        System.assertNotEquals(null, resp.accountHasMore, 'accountHasMore should be present');
        System.assertNotEquals(null, resp.contactHasMore, 'contactHasMore should be present');
        System.assertNotEquals(null, resp.caseHasMore, 'caseHasMore should be present');
        System.assertNotEquals(null, resp.opptyHasMore, 'opptyHasMore should be present');
    }

    @IsTest
    static void testFetchRecordUrl_ByNameAndById() {
        Account a = [SELECT Id, Name FROM Account WHERE Name = 'Acme Corporation' LIMIT 1];

        Test.startTest();
        String urlByName = VoiceChatBotController.fetchRecordUrl('Account', a.Name, null);
        String urlById = VoiceChatBotController.fetchRecordUrl('Account', null, a.Id);
        Test.stopTest();

        System.assertNotEquals(null, urlByName, 'URL by name should be returned');
        System.assert(urlByName.contains('/' + a.Id), 'URL should contain record Id when found by name');
        System.assertNotEquals(null, urlById, 'URL by id should be returned');
        System.assert(urlById.endsWith('/' + a.Id), 'URL by id should end with record Id');
    }
}
