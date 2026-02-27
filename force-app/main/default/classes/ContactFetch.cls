public with sharing class ContactFetch {
    @AuraEnabled(cacheable=true)
    public static list<contact> getContacts() {
        return [select Name,Id,Email,Title From Contact limit 15 ];

    }
    @AuraEnabled(cacheable=true)
  public static List<Contact> getContact(Integer pageNumber, Integer pageSize) {
  Integer offset = pageNumber * pageSize;
    return [SELECT Id, Name, Email FROM Contact ORDER BY Name LIMIT :pageSize OFFSET :offset];
  }
  @AuraEnabled(cacheable=true)
    public static List<Contact> getContactname(String Name) {
    return [SELECT Id, Name, Email,accountid  FROM Contact WHERE Name LIKE :('%' + Name + '%') LIMIT 50 ];
    }

    @AuraEnabled(cacheable=true)
    public static list<contact> returnContact(ID accId)
    {
        list<contact> contactlist = [select id,name,phone,email,accountid from contact where accountid =:accId];
        
        return contactlist;
}
}