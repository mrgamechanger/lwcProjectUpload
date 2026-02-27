public class SalseforcePracticeHelper {
    
    public static void AccDescrprtion(list<Account> Acc)
    {
        for(Account i: Acc)
        {
            if(i.Description == Null)
            {
                i.Description='Please add descption';
            }
        }
    }
    
    public static void CheckPhone(list<Account> Accj, map<id,account> oldMa)
    {
        for(Account j: Accj)
        {
            if(oldMa != NULL  &&  j.phone == oldMa.get(j.id).phone)
            {
                j.Description='bro i have updated it';
            }
            else if(oldMa != NULL  &&  j.phone != oldMa.get(j.id).phone)
            {
                j.Description='u have changed phone';
            }
        }
    }
    public static void Delepromax(list<Account> dfl)
    {
        for(Account i: dfl)
        {
            if(i.Active__c=='Yes')
            {
                i.adderror('u cant delete the active account');
            }
        }
    }

}