public with sharing class UpdateAccount {
     // Fetch the account details
     @AuraEnabled
     public static Account getAccountDetails(Id accountId) {
         // Query the account data based on the record ID
         return [
             SELECT Id, Name, Industry, Rating 
             FROM Account 
             WHERE Id = :accountId
             LIMIT 1
         ];
     }
 
     // Update the account details
     @AuraEnabled
     public static void updateAccountDetails(String name, String industry, String rating, Id accountId) {
         // Query the existing account to update
         Account acc = [
             SELECT Id, Name, Industry, Rating 
             FROM Account 
             WHERE Id = :accountId 
             LIMIT 1
         ];
         
         // Update the account fields with the new values
         acc.Name = name;
         acc.Industry = industry;
         acc.Rating = rating;
         
         // Save the changes to the database
         update acc;
     }
}