public with sharing class accountfromIp implements System.Callable
{
   

        public Boolean invokeMethod(String methodName, Map<String,Object> input, Map<String,Object> outMap, Map<String,Object> options) {
           if (methodName.equals('getAccountDetails')) {
               getAccountDetails(input, outMap, options);
           }
           return true;
       }
       public void getAccountDetails(Map<String,Object> input, Map<String,Object> outMap, Map<String,Object> options) {
           String accountName = String.valueOf(input.get('account'));
           List<Account> accounts = new List<Account>();
           if (String.isBlank(accountName)) {
               accounts = [SELECT Id, Name, Phone,Industry,Description FROM Account];
           } else {
               accounts = [SELECT Id, Name, Phone,Industry,Description from Account WHERE Name Like :('%' + accountName + '%')];
           }
           outMap.put('accounts', accounts);
       }
    
}