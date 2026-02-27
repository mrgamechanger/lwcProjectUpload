public class loanTrigger {
    public static void Loan(list<loan__c> luka , map<id,loan__c> mk)
    {
       for(loan__c i: luka)
        {
            if(mk != NULL  &&  i.name == mk.get(i.id).name)
            {
                i.Description__c='as it was';
                i.active__c='No';
            }
            else if(mk != NULL  &&  i.name != mk.get(i.id).name)
            {
                i.Description__c='u have changed name';
                i.active__c='Yes';
            }
        } 
    }
    
    public static void Activedel(list<loan__c> fbii)
    {
        for(loan__c i : fbii)
        {
            if(i.active__c =='Yes')
            {
                i.addError('Loan is pending bro cant be deleted');
            }
            
        }
    }

}