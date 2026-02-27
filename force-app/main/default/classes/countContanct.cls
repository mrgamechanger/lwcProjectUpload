public class countContanct {

    public static void CountContact()
    {
        list<Account> Acc=new  list<Account> ();
        Acc=([Select id, name ,active__c,cotactsize__c, industry ,(select id,name from Contacts) from Account where createdDate=THIS_YEAR]);
        
        if(!Acc.isempty())
        {
        for(Account i: Acc)
        {
            i.cotactsize__c=i.Contacts.size();
        }
            
            update Acc;
    }
}
}