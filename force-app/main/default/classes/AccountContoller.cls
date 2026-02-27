public with sharing class AccountContoller {
    @AuraEnabled(cacheable=true)
    public static List<Account>getAccounts(){
return[SELECT Id, Name, Industry,rating, AnnualRevenue, Phone FROM Account ORDER BY Name LIMIT 200];
}
    @AuraEnabled
    public static void deleteAccount(String accountId){
    Database.delete(accountId);
}

}