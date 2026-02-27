public with sharing class accountcontact {
    @future
    public static AccountConatct(list<Account> Acclist,map<Id,Account> oldmap)
    {

        interger id=0;
        map<id,string> Accountmap=new map<id,string>();
        list<contact>conlist=new list<contact>();
        
        for(Account acc:Acclist)
        {
            if(acc.phone!=oldmap.get(acc.Id).phone  )
            {
                
                Accountmap.put(acc.id,acc.phone);
            }
        }
    


    if(!Accountmap.isEmpty())
    {
        for(contact con:[select id,AccountId,phone from contact where AccountId in:Accountmap.keyset()])
        {
            con.phone=Accountmap.get(con.AccountId);
            conlist.add(con);
    }
}

            if(!conlist.isEmpty())
            {
                update conlist;
            }
         
    }   
}
}


triger  Accounttrigger on Account (after insert, after update) {
    if(trigger.isafter && (trigger.isupdate || trigger.isinsert)){
        accountcontact.AccountConatct(trigger.new,trigger.oldmap);
    }
    

}


public static void Accountclass implemts quable()
{

}