/**
 * @description Service class for managing error messages
 * Provides methods to retrieve admin-maintained error messages from Error_Message__c custom object
 */
public with sharing class ErrorMessageService {
    private static Map<String, String> messageCache;

    /**
     * @description Retrieves an error message by key from the Error_Message__c object
     * @param messageKey The unique key for the error message
     * @return String - the error message value or a default message if not found
     */
    public static String getErrorMessage(String messageKey) {
        if (messageCache == null) {
            loadMessageCache();
        }

        String message = messageCache.get(messageKey);
        return message != null ? message : 'An error occurred. Please try again.';
    }

    /**
     * @description Loads all error messages from the Error_Message__c object into cache
     */
    private static void loadMessageCache() {
        messageCache = new Map<String, String>();

        List<Error_Message__c> messages = [SELECT Message_Key__c, Message_Value__c FROM Error_Message__c];

        for (Error_Message__c msg : messages) {
            messageCache.put(msg.Message_Key__c, msg.Message_Value__c);
        }
    }

    /**
     * @description Refreshes the message cache (useful for testing or when messages are updated)
     */
    public static void refreshCache() {
        messageCache = null;
        loadMessageCache();
    }
}
