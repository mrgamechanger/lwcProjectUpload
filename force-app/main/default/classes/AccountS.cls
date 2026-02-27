public with sharing class AccountS {
    @AuraEnabled(cacheable=true)
    public static list<Account> AccountSearch() {

        return [Select Id, Name, Type, Industry, AnnualRevenue, Phone, Website, NumberOfEmployees, OwnerId FROM Account where type!=Null And Industry!=null And Phone!=null And AnnualRevenue!=null];

    }
    @AuraEnabled(cacheable=true)
    public static list<Account> AccountSearchbystring(string str) {


        return [Select Id, Name, Type, Industry, AnnualRevenue, Phone, Website, NumberOfEmployees, OwnerId FROM Account where type=:str And Industry!=null  limit 5];

    }
    
}