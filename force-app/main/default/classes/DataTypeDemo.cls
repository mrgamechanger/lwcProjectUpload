public class DataTypeDemo {
    
   
    public void add() {
        List<Contact> contacts = [SELECT Id, Name, Email FROM Contact limit 3];
        for(Contact i : contacts) {
            System.debug('Contact id: ' +i.id );
    System.debug('Contact Name: ' + i.Name);
    System.debug('Contact Email: ' + i.Email);
}


       
    }
}