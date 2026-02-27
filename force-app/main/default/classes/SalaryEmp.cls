public class SalaryEmp {
public static void TOtalSalry()
{
    list<Account> Accofemp=new list<Account>([select id,total_salary__c, name,phone ,(Select salary__c,id from Employees__r) from Account where CreatedDate=THIS_YEAR
]);
    if(!Accofemp.isEmpty())
    {
        for(Account i:Accofemp )
        {
            decimal total=0;
            
            for(Employee__c j :  i.Employees__r)
            {
                total=total+j.salary__c;
            }
            
            i.total_salary__c=total;
        }
    }
    
    if(!Accofemp.isEmpty())
    {
        update Accofemp;
    }
    
}
}