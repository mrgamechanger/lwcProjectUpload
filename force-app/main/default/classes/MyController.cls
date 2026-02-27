public with sharing class MyController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [Select id, name ,active__c,cotactsize__c, industry ,(select id,name from Contacts) from Account where createdDate=THIS_YEAR]; // Query your data here
    }
}