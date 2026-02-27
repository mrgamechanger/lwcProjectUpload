public with sharing class lazyLoadingApexContoller {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(Integer limitSize, Integer offset){
        List<Account> accountList = [SELECT Id,Name,Rating,Phone
                                     FROM Account
                                     LIMIT :limitSize
                                     OFFSET :offset
                                     ];
        return accountList;
    }
}