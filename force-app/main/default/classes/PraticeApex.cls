public class PraticeApex {
    public void accTest(){
        list<Account> Acc=new list<Account>([select id ,name,Rating ,industry,Active__c From Account Where Active__c='Yes' And Rating ='Hot']);
        Account a=new Account();
        a.Name='Aman testing';
         a.Active__c='yes';   
        a.Industry='Dating';
        a.Rating='Cold';
        insert(a);
        
        Account a2=new Account();
        a2.Name='Aman testing 2';
         a2.Active__c='yes';   
        a2.Industry='Healthcare';
        a2.Rating='Hot';
        Acc.add(a2);
        Acc.add(a);
        for(Account i : Acc)
        {
            System.debug('Account Name: ' + i.Name + ', Rating: ' + i.Rating);
            
        }
        
        List<Account> hotRatedAccounts = [SELECT Id, Name, Rating FROM Account WHERE Rating = 'Hot'];

for (Account acc1 : hotRatedAccounts) {
    System.debug('Account Name: ' + acc1.Name + ', Rating: ' + acc1.Rating);
}
        
    }

}