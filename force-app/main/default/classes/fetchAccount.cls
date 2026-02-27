public with sharing class fetchAccount {
    @AuraEnabled(cacheable=true)
   
    public static list<Account> fetchAccountlo() {
        list<Account> Acc=[select id ,name ,industry from Account limit 10];
       return Acc;
    }
}