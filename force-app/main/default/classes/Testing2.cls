public class Testing2 {
public void fun()
{
      
    List<Contact> contacts = [SELECT Id, FirstName, LastName, Email, Phone FROM Contact limit 4];
    for(Contact con : contacts) {
    System.debug('Name: ' + con.FirstName + ' ' + con.LastName);
    System.debug('Email: ' + con.Email);
    }
}
public void AddDetails()
{
    
  Account acc = new Account();
acc.Name = 'Bodfnv';
acc.Phone = '1234543890';
acc.BillingCity ='jamshedpur';
insert acc;

Contact con = new Contact();
con.FirstName = 'Aka';
con.LastName = 'lads';
con.Phone = '8709868887';
con.AccountId = acc.Id;
insert con;

System.debug('Created Account: ' + acc);
System.debug('Created Contact: ' + con);


    
}

        
        
    }