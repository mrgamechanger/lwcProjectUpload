public with sharing class ContactController {
    @AuraEnabled(Cacheable=true)
    public static list<contact> ContactControll() {
        list<contact>Conlist =[select Id, name,lastname,firstname,email,phone,photoUrl from contact where photoUrl!=null  limit 15];
        return Conlist;

    }
}