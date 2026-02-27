global class FetchAccountDetails implements System.Callable {

    // Required method to implement System.Callable
    global Object call(String action, Map<String, Object> args) {
        if (action == 'getAccountDetails') {
            return getAccountDetails(args);
        } else {
            throw new IllegalArgumentException('Unsupported action: ' + action);
        }
    }

    // Private method to fetch account details
    private List<Map<String, Object>> getAccountDetails(Map<String, Object> args) {
        if (!args.containsKey('AccountId')) {
            throw new IllegalArgumentException('AccountId is required.');
        }

        String accountId = (String) args.get('AccountId');

        // Query the Account object
        List<Account> accounts = [
            SELECT Id, Name, Industry, Phone, Website, BillingCity
            FROM Account
            WHERE Id = :accountId
        ];

        // Map the Account records to a simple List<Map> structure
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (Account acc : accounts) {
            Map<String, Object> accMap = new Map<String, Object>();
            accMap.put('Id', acc.Id);
            accMap.put('Name', acc.Name);
            accMap.put('Industry', acc.Industry);
            accMap.put('Phone', acc.Phone);
            accMap.put('Website', acc.Website);
            accMap.put('BillingCity', acc.BillingCity);
            result.add(accMap);
        }

        return result;
    }
}
