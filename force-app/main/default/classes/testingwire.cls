public with sharing class testingwire {

    @AuraEnabled(cacheable=true)
    public static List<Account> testingAccount() {
        // Query Account with Owner field to show in the datatable
        return [
            SELECT Id, Name, Type, Owner.Name 
            FROM Account 
            LIMIT 15
        ];
    }
    @AuraEnabled(cacheable=true)
    public static list<contact> getContacts(string aid){
        list<contact> con = [select id,phone,email,name from contact where accountid = :aid];
        return con;
    }
}