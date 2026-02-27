/**
 * Service class to handle chat transcript and message persistence
 * @author Salesforce Developer
 * @date 2025
 */
public with sharing class ChatTranscriptService {
    
    /**
     * Creates a new chat transcript
     * @param userId The ID of the user initiating the chat
     * @return The created Chat_Transcript__c record
     */
    public static Chat_Transcript__c createTranscript(Id userId) {
        Chat_Transcript__c transcript = new Chat_Transcript__c(
            Name = 'Chat Transcript ' + DateTime.now().format(),
            CreatedById = userId,
            LastModifiedById = userId
        );
        insert transcript;
        return transcript;
    }
    
    /**
     * Adds a message to a chat transcript
     * @param transcriptId The ID of the transcript
     * @param message The message content
     * @param messageType The type of message (User or Bot)
     * @return The created Chat_Message__c record
     */
    public static Chat_Message__c addMessage(Id transcriptId, String message, String messageType) {
        Chat_Message__c chatMessage = new Chat_Message__c(
            Chat_Transcript__c = transcriptId,
            Message__c = message,
            Message_Type__c = messageType,
            Timestamp__c = DateTime.now()
        );
        insert chatMessage;
        return chatMessage;
    }
    
    /**
     * Gets all messages for a transcript
     * @param transcriptId The ID of the transcript
     * @return List of Chat_Message__c records
     */
    public static List<Chat_Message__c> getMessages(Id transcriptId) {
        return [
            SELECT Id, Message__c, Message_Type__c, Timestamp__c 
            FROM Chat_Message__c 
            WHERE Chat_Transcript__c = :transcriptId 
            ORDER BY Timestamp__c ASC
        ];
    }
}
