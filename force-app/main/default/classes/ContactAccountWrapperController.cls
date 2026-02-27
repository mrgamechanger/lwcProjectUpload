public with sharing class ContactAccountWrapperController {
    // Wrapper class definition
    public class ContactAccountWrapper {
        @AuraEnabled public Contact contact { get; set; }
        @AuraEnabled public Account account { get; set; }
        @AuraEnabled public Boolean isSelected { get; set; }

        // Constructor
        public ContactAccountWrapper(Contact con, Account acc, Boolean isSelected) {
            this.contact = con;
            this.account = acc;
            this.isSelected = isSelected;
        }
    }

    // Apex method to fetch data and return a list of wrapper objects
    @AuraEnabled(cacheable=true)
    public static List<ContactAccountWrapper> getContactAccountWrappers() {
        List<ContactAccountWrapper> wrappers = new List<ContactAccountWrapper>();

        // Query for Contacts and their related Account data
        for (Contact con : [
            SELECT Id, FirstName, LastName, Email, Account.Id, Account.Name, Account.Industry
            FROM Contact
            WHERE AccountId != null AND Email!= null
            LIMIT 15
        ]) {
            wrappers.add(new ContactAccountWrapper(con, con.Account, false));
        }

        return wrappers;
    }
}
