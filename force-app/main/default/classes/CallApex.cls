global without sharing class CallApex implements omnistudio.VlocityOpenInterface, Callable {

    // Called when invoked from IP Remote Action
    global static Boolean invokeMethod(String methodName, Map<String, Object> input, Map<String, Object> output, Map<String, Object> options) {
        try {
            if (methodName.equalsIgnoreCase('getAccount')) {
                getAccount(input, output, options);
                return true;
            } else {
                output.put('result', 'Unknown method');
                return false;
            }
        } catch (Exception e) {
            output.put('error', e.getMessage());
            return false;
        }
    }

    // Called when used in Apex async/Callable context
    public Object call(String action, Map<String, Object> args) {
        Map<String, Object> input = (Map<String, Object>) args.get('input');
        Map<String, Object> output = (Map<String, Object>) args.get('output');
        Map<String, Object> options = (Map<String, Object>) args.get('options');

        invokeMethod(action, input, output, options);
        return output;
    }

    // Logic used by both call paths
    public static void getAccount(Map<String, Object> input, Map<String, Object> output, Map<String, Object> options) {
        String acId = (String) input.get('AccId');
        List<Account> acc = [SELECT Id, Name ,rating FROM Account WHERE Id = :acId];
        output.put('result', acc);
    }
}
