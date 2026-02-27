@RestResource(urlMapping='/AccountApi')
global with sharing class AccountApi {
    @HttpGet
    global static list<Account> getAccounts() {
       list<Account> acc = [SELECT Id, Name, Industry ,rating, AnnualRevenue  FROM Account LIMIT 10];
         return acc;
    }
}