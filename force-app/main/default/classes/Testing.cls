public class Testing {
 public void accTest()
  {
      Id accountId ; // Replace with the Id of the account you want to retrieve contacts for

List<Contact> contacts = [SELECT Id, FirstName, LastName, Email, Phone FROM Contact WHERE AccountId = :accountId];

for(Contact c : contacts) {
    System.debug('Contact Id: ' + c.Id);
    System.debug('Contact Name: ' + c.FirstName + ' ' + c.LastName);
    System.debug('Contact Email: ' + c.Email);
    System.debug('Contact Phone: ' + c.Phone);
}

      
  }
    public void test()
    {
        Id accountId = '0012w00001OOJNEAA5'; // Replace with the Id of the account you want to retrieve

Account account = [SELECT Id, Name, Phone, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry FROM Account WHERE Id = :accountId];

System.debug('Account Id: ' + account.Id);
System.debug('Account Name: ' + account.Name);
System.debug('Account Phone: ' + account.Phone);
System.debug('Billing Street: ' + account.BillingStreet);
System.debug('Billing City: ' + account.BillingCity);
System.debug('Billing State: ' + account.BillingState);
System.debug('Billing Postal Code: ' + account.BillingPostalCode);
System.debug('Billing Country: ' + account.BillingCountry);

    }
    
   public void fill()

    {
        list<Account> Accou=[Select Id, Name,Phone From Account Limit 5];
        
        for(Account c : Accou) {
           System.debug('Account id:' + c.ID);
            System.debug('Account Name:' + c.Name);
            System.debug('Account phone'+ c.Phone);
            
            
        
    }
}
}