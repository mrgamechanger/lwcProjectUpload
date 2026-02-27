public with sharing class OmniStudioIntegrationHandler implements System.Callable {
    
    public Object call(String action, Map<String, Object> args) {
        try {
            switch on action {
                when 'getAccountDetails' {
                    return getAccountDetails(args);
                }
                when 'createRecord' {
                    return createRecord(args);
                }
                when else {
                    throw new CalloutException('Invalid action specified: ' + action);
                }
            }
        } catch (Exception e) {
            throw new CalloutException('Error processing request: ' + e.getMessage());
        }
    }

    private Map<String, Object> getAccountDetails(Map<String, Object> args) {
        String accountName = String.valueOf(args.get('account'));
        List<Account> accounts = new List<Account>();
        
        if (String.isBlank(accountName)) {
            accounts = [SELECT Id, Name, Phone, Industry, Description 
                       FROM Account 
                       WITH SECURITY_ENFORCED
                       LIMIT 100];
        } else {
            accounts = [SELECT Id, Name, Phone, Industry, Description 
                       FROM Account 
                       WHERE Name LIKE :('%' + accountName + '%')
                       WITH SECURITY_ENFORCED
                       LIMIT 100];
        }
        
        Map<String, Object> result = new Map<String, Object>();
        result.put('accounts', accounts);
        return result;
    }

    private Map<String, Object> createRecord(Map<String, Object> args) {
        String objectType = (String)args.get('objectType');
        Map<String, Object> recordData = (Map<String, Object>)args.get('recordData');

        if (String.isBlank(objectType) || recordData == null) {
            throw new CalloutException('Object type and record data are required');
        }

        SObject newRecord = (SObject)Type.forName(objectType).newInstance();
        
        for (String field : recordData.keySet()) {
            newRecord.put(field, recordData.get(field));
        }

        insert newRecord;

        Map<String, Object> result = new Map<String, Object>();
        result.put('Id', newRecord.Id);
        result.put('success', true);

        return result;
    }
} 