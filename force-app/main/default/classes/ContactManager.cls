public with sharing class ContactManager {
    @auraEnabled(cacheable=true)
    public static List<Contact> getContacts(){
    return [select id,LastName,FirstName,email,Account.name, phone from Contact LIMIT 10];
    }
}