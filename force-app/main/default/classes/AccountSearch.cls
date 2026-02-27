public with sharing class AccountSearch {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountsByName(String searchName) {
        String searchTermWithWildcard = '%' + searchName + '%';
        return [SELECT Id, Name, Type, Industry,Phone FROM Account WHERE Name LIKE :searchTermWithWildcard LIMIT 10];
    }
}