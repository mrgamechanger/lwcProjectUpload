@isTest
private class VoiceSearchControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Create test accounts
        List<Account> accounts = new List<Account>();
        accounts.add(new Account(Name = 'Test Account 1', Phone = '1234567890', Industry = 'Technology'));
        accounts.add(new Account(Name = 'Test Account 2', Phone = '0987654321', BillingCity = 'San Francisco'));
        insert accounts;
        
        // Create test contacts
        List<Contact> contacts = new List<Contact>();
        contacts.add(new Contact(FirstName = 'John', LastName = 'Doe', Email = 'john.doe@test.com', Phone = '1111111111', AccountId = accounts[0].Id));
        contacts.add(new Contact(FirstName = 'Jane', LastName = 'Smith', Email = 'jane.smith@test.com', Title = 'Manager', AccountId = accounts[1].Id));
        insert contacts;
    }
    
    @isTest
    static void testSearchAccountsAndContacts() {
        Test.startTest();
        List<VoiceSearchController.SearchResult> results = VoiceSearchController.searchAccountsAndContacts('Test');
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assert(results.size() > 0, 'Should return at least one result');
    }
    
    @isTest
    static void testSearchWithEmptyTerm() {
        Test.startTest();
        List<VoiceSearchController.SearchResult> results = VoiceSearchController.searchAccountsAndContacts('');
        Test.stopTest();
        
        System.assertEquals(0, results.size(), 'Should return empty results for empty search term');
    }
    
    @isTest
    static void testSearchWithNoResults() {
        Test.startTest();
        List<VoiceSearchController.SearchResult> results = VoiceSearchController.searchAccountsAndContacts('NonExistentRecord');
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
    }
}

