public class salseforceHelperAccount {
    public static void CreateRating(list<Account> Acc){
        for (Account i: Acc)
        {
            if(i.industry != null  && i.industry =='media')
            {
                i.rating='Hot';
            }
            
        }
    }
    public static void CreteOpp(list<Account> Acc)
    {
        list<opportunity> opp=new list<opportunity>();
        for(Account i: Acc)
        {
            opportunity oppo=new opportunity();
            oppo.name= i.name;
            oppo.CloseDate=System.today();
            oppo.AccountId= i.Id;
            oppo.stageName='Prospecting';
            
            opp.add(oppo);
        }
        
        if(!opp.isEmpty())
        {
            insert opp;
        }
        
    }
    
    public static void aDDcontact(list<Account> Ackaxam)
    {
        list<contact> con=new List<contact>();
        
        for(Account i:Ackaxam)
        {
           Contact Aka=new Contact();
            Aka.AccountId=I.Id;
            //Aka.CreatedDate=System.today();
            Aka.FirstName='Koshish';
            Aka.LastName='mc';
            Aka.MobilePhone='8709868887';
            
            con.add(AKa);
            
        }
        
        if(!con.isEmpty())
        {
            insert con;
        }
    }
    
    public static void UpdatePhonedescription(list<Account> kon, map<id,Account>oldMap)
    {
        for(Account i: kon)
        {
            if( oldMap!=NUll  && i.Phone != oldMap.get(i.Id).Phone )
            {
                i.Description='bro this is the different phone number';
            }
            else if(oldMap!=NUll  && i.Phone == oldMap.get(i.Id).Phone )
            {
                 i.Description='bro this is the same phone number';
            }
        }
    }

}