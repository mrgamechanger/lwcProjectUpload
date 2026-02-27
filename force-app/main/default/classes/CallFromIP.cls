global with sharing class CallFromIP implements omnistudio.VlocityOpenInterface2 {

    global Boolean invokeMethod(String methodName, Map<String, Object> inputMap, Map<String, Object> outMap, Map<String, Object> options) {
        Boolean result = true;
        try {
            if ('getAccountById'.equalsIgnoreCase(methodName)) {
                getAccountById(inputMap, outMap, options);
            } else {
                result = false;
            }
        } catch (Exception e) {
            System.debug('Error in invokeMethod: ' + e.getMessage());
            result = false;
        }
        return result;
    }
    
    public void getAccountById(Map<String, Object> inputMap, Map<String, Object> outMap, Map<String, Object> options) {
        try {
            // Retrieve the AccountId from inputMap
            String accountId = (String) inputMap.get('AccountId');
            if (String.isBlank(accountId)) {
                throw new IllegalArgumentException('AccountId is required.');
            }

            // Query Account record by Id
            Account account = [
                SELECT Id, Name, Industry, Phone, Type 
                FROM Account 
                WHERE Id = :accountId
                LIMIT 1
            ];

            // Add the queried Account to outMap
            outMap.put('Account', account);
        } catch (Exception e) {
            System.debug('Error in getAccountById: ' + e.getMessage());
            throw e;
        }
    }
}
