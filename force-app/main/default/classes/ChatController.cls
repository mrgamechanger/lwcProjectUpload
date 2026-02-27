/**
 * ChatController
 * Apex facade for the Chat Widget LWC.
 * - Initializes a transcript
 * - Retrieves conversation history
 * - Processes a user message by delegating to ChatAiService (Named Credential-backed callout)
 *
 * Security:
 * - Keep object/FLS checks minimal and explicit
 * - All external secrets handled by External Credential + Named Credential (ChatAI_NC)
 *
 * Dependencies:
 * - ChatTranscriptService (optional for transcript/message persistence if present)
 * - ChatAiService (server-side AI callout via Named Credential)
 */
public with sharing class ChatController {
    public class MessageDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String text;
        @AuraEnabled public String type; // 'user' or 'bot'
        public MessageDTO() {}
        public MessageDTO(String id, String text, String type) {
            this.id = id;
            this.text = text;
            this.type = type;
        }
    }

    public class ProcessResultDTO {
        @AuraEnabled public String botMessage;
        @AuraEnabled public List<String> quickReplies;
        public ProcessResultDTO() {}
    }

    /**
     * Initialize a chat session and return a transcript Id (String) for the client to correlate messages.
     */
    @AuraEnabled(cacheable=false)
    public static String initChat() {
        // If you already have ChatTranscriptService, delegate. Otherwise create a simple transcript record.
        try {
            // Example using a custom object Chat_Transcript__c if present
            // Field-level security validations should be enforced here in a production org.
            if (Schema.getGlobalDescribe().containsKey('Chat_Transcript__c')) {
                Chat_Transcript__c t = new Chat_Transcript__c(Name = 'LWC Chat ' + Datetime.now().format());
                insert t;
                return (String) t.get('Id');
            }
            // Fallback: return a generated token if custom object doesn't exist
            return String.valueOf(Crypto.getRandomLong());
        } catch (Exception e) {
            throw new AuraHandledException('Failed to initialize chat: ' + e.getMessage());
        }
    }

    /**
     * Return conversation messages for a transcript.
     */
    @AuraEnabled(cacheable=false)
    public static List<MessageDTO> getConversation(String transcriptId) {
        List<MessageDTO> out = new List<MessageDTO>();
        if (String.isBlank(transcriptId)) {
            return out;
        }
        try {
            // If Chat_Message__c exists, load persisted messages
            if (Schema.getGlobalDescribe().containsKey('Chat_Message__c')) {
                // Adjust field API names to your org schema as needed
                // Assuming fields: Transcript__c (Lookup to Chat_Transcript__c), Text__c (Long Text), Sender__c (Picklist/User/Bot)
                List<SObject> rows = Database.query('SELECT Id, Text__c, Sender__c FROM Chat_Message__c WHERE Transcript__c = :transcriptId ORDER BY CreatedDate ASC');
                for (SObject r : rows) {
                    String text = (String) r.get('Text__c');
                    String sender = (String) r.get('Sender__c');
                    String type = (sender != null && sender.toLowerCase() == 'user') ? 'user' : 'bot';
                    out.add(new MessageDTO((String) r.get('Id'), text, type));
                }
                return out;
            }
            // Fallback: no persistence available
            return out;
        } catch (Exception e) {
            // Return empty history on error; LWC handles default greeting
            return out;
        }
    }

    /**
     * Process a user message:
     * - Optionally persist user message
     * - Call ChatAiService to generate a bot response (via Named Credential ChatAI_NC)
     * - Optionally persist bot message
     * - Return response DTO for the LWC
     */
    @AuraEnabled
    public static ProcessResultDTO processMessage(String transcriptId, String userMessage) {
        if (String.isBlank(userMessage)) {
            ProcessResultDTO empty = new ProcessResultDTO();
            empty.botMessage = 'Please enter a message.';
            empty.quickReplies = new List<String>();
            return empty;
        }

        // Persist user message if custom object exists
        if (Schema.getGlobalDescribe().containsKey('Chat_Message__c') && !String.isBlank(transcriptId)) {
            try {
                SObject userMsg = Schema.getGlobalDescribe().get('Chat_Message__c').newSObject();
                userMsg.put('Transcript__c', transcriptId);
                userMsg.put('Text__c', userMessage);
                userMsg.put('Sender__c', 'User');
                insert userMsg;
            } catch (Exception ignorePersistUser) {
                // swallow; do not block response
            }
        }

        // Call AI service
        ChatAiService.ChatResponseDTO ai = ChatAiService.generateReply(transcriptId, userMessage);

        // Persist bot message if custom object exists
        if (Schema.getGlobalDescribe().containsKey('Chat_Message__c') && !String.isBlank(transcriptId) && ai != null && !String.isBlank(ai.botMessage)) {
            try {
                SObject botMsg = Schema.getGlobalDescribe().get('Chat_Message__c').newSObject();
                botMsg.put('Transcript__c', transcriptId);
                botMsg.put('Text__c', ai.botMessage);
                botMsg.put('Sender__c', 'Bot');
                insert botMsg;
            } catch (Exception ignorePersistBot) {
                // swallow; do not block response
            }
        }

        ProcessResultDTO dto = new ProcessResultDTO();
        dto.botMessage = (ai != null && !String.isBlank(ai.botMessage)) ? ai.botMessage : 'Sorry, I could not process your request.';
        dto.quickReplies = (ai != null && ai.quickReplies != null) ? ai.quickReplies : new List<String>();
        return dto;
    }
}
