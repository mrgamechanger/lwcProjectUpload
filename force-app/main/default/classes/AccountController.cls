public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Id, Name, Phone, Rating, Industry, AnnualRevenue FROM Account LIMIT 10];
    }
}