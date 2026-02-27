public with sharing class AccountSearchd {
    @AuraEnabled(cacheable=true)
    public static List<Account> AccountSearchdone(string str) {
        
        String strKey = '%'+str+'%';

        List<Account> accList = [SELECT Id,Name,industry,rating FROM Account WHERE name like :strKey ];
        return accList;


    }
}