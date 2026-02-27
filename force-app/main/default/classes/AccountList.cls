public with sharing class AccountList {
    @AuraEnabled(Cacheable=true)
    public static list<Account> getAccountList() {
        list<Account> Acc=[Select id ,name , industry,rating from Account where rating!=null];

        return Acc;

    }
}