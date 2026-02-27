public class VideoP {
    
    
    
    public void NewACC()
    {
        list<Account> Accy=new list<Account>([select id ,name,active__c,(Select name,id  From Contacts ) From Account  limit 10 ]);
        for(Account i:Accy)
        {
            System.debug('name of Account ' + i.name);
            for(contact j: i.contacts)
            System.debug(j.name  + ' are the contact'); 
        }
       
    }
    
    public static void Oppo()
    {
        List<opportunity> oli=new List<opportunity>();
        oli=[Select id,StageName From opportunity Where createdDate =THIS_YEAR];
        
        if(!oli.isEmpty()){
        for (opportunity iocon: oli)
        {
            if(iocon.StageName =='Closed Won')
            {
                iocon.Description='Opportunity is Won completely';
            }
            else if (iocon.StageName =='Closed Lost')
            {
                iocon.Description='Opportunity is LOSt completely';
            }
            else
            {
                iocon.Description='Opportunity is open';
            }
            
        }
            update oli;
            System.debug(oli);
        }
        
    }
    public void pratice()
    {
        list<Account> tujhe=new list<Account>();
        tujhe=[select id,name ,rating,Industry,active__c from Account where active__c='yes'];
        
        for(Account i: tujhe)
        {
            if(i.Rating=='Hot')
            {
                i.Industry='education';
            }
             System.debug('the  Account are' + i);
        }
        
        
        
    }
    
    public void praticepart2()
    {
        list<contact> connachdi=new list<contact>([select id,name ,createdDate from Contact where createdDate =THIS_YEAR]);
        for(contact i:connachdi )
        {
            System.debug('the  Contact are' + i);
        }
    }
    
    public void Oppvivi(){
        
        list<Loan__c> Loanlelo=new  list<Loan__c>();
        
        
        
    }
    
    public static void ParentToChild()
    {
         List<Account> Ace =new List<Account>([Select name,id  From Account where createdDate =THIS_YEAR  limit 10]);
        
        
        if(!Ace.isEmpty()){
        for (Account pi: Ace)
        {
           System.debug('name of Account ' + pi.name);
            for (Contact ion : pi.contacts)
            { 
                System.debug( ion.name  + ' are the contact');
            }
            }
            
           
        }
        
        
    }
    public static void Pechma()
    {
        //list<Account> Acc=new list<Account>();
        //
        
        
        map<id,Account> lika=new map<id,Account>([select name , industry , active__c from Account where ID ='0012w00001UIGCpAAP']);
        
        
        
            System.debug('these are fields' + lika );
        
            
    }
   
    
    public static void Sce()
    {
        List<Account> Acc=new List<Account>([Select id,name,industry,(Select id ,amount From Opportunities ) From Account Where Phone !=NULL ]);
        
        
        
        
       
        if(!Acc.isEmpty()){
        for (Account ion: Acc)
        {
           decimal total=0;
            for (opportunity opp :ion.Opportunities)
            { 
                if(opp.Amount != NULL){
                total=total+ opp.amount;
            }
            }
            
            System.debug( ion.name +' has '+ total + 'worth opportunities');
        }
    }
    }

}