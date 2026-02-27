public with sharing class SearchController {
    @AuraEnabled(cacheable=true)
    public static List<String> searchContacts(String query) {
        String searchQuery = '%' + query + '%';
        List<Contact> contacts = [
            SELECT Name, Title 
            FROM Contact 
            WHERE Name LIKE :searchQuery OR Title LIKE :searchQuery
            LIMIT 10
        ];
        List<String> results = new List<String>();
        for(Contact c : contacts) {
            results.add(c.Name + ' (' + c.Title + ')');
        }
        return results;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> searchAccounts(String query) {
        String searchQuery = '%' + query + '%';
        List<Account> accounts = [
            SELECT Name, BillingCity 
            FROM Account 
            WHERE Name LIKE :searchQuery OR BillingCity LIKE :searchQuery
            LIMIT 10
        ];
        List<String> results = new List<String>();
        for(Account a : accounts) {
            results.add(a.Name + ' (' + a.BillingCity + ')');
        }
        return results;
    }
}