/**
 * ChatAiService
 * Server-side integration with external LLM provider using Named Credential (External Credential-backed).
 * - Uses Named Credential API Name: ChatAI_NC
 * - Base URL: https://api.openai.com
 * - Auth: API key injected in Authorization header by External Credential (DO NOT set in code)
 *
 * Responsibilities:
 * - Build OpenAI Chat Completions request
 * - Execute callout via Http with proper timeout and headers
 * - Parse response and return a simple DTO for the LWC via ChatController
 *
 * Notes:
 * - Keep this class focused on outbound callout and mapping logic.
 * - Add retry/backoff if required by business (beware of governor limits).
 * - Consider Custom Metadata for model/temperature/maxTokens configuration.
 */
public with sharing class ChatAiService {
    public class ChatResponseDTO {
        @AuraEnabled public String botMessage;
        @AuraEnabled public List<String> quickReplies;
    }

    // Centralized configuration (could be moved to Custom Metadata)
    private static final String ENDPOINT_PATH = '/v1/chat/completions';
    private static final String MODEL = 'gpt-4o-mini';
    private static final Integer TIMEOUT_MS = 20000;
    private static final Decimal DEFAULT_TEMPERATURE = 0.7;
    private static final Integer DEFAULT_MAX_TOKENS = 256;

    /**
     * Generate a reply for a user message.
     * transcriptId is passed for context and logging/auditing if needed.
     */
    public static ChatResponseDTO generateReply(String transcriptId, String userMessage) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ChatAI_NC' + ENDPOINT_PATH);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        // Do NOT set Authorization header; injected by External Credential policy.
        req.setTimeout(TIMEOUT_MS);

        // Build request body (OpenAI-style)
        Map<String, Object> payload = new Map<String, Object>{
            'model' => MODEL,
            'temperature' => DEFAULT_TEMPERATURE,
            'max_tokens' => DEFAULT_MAX_TOKENS,
            'messages' => new List<Object>{
                new Map<String, Object>{
                    'role' => 'user',
                    'content' => userMessage
                }
            }
        };
        req.setBody(JSON.serialize(payload));

        Http http = new Http();
        HTTPResponse res;
        try {
            res = http.send(req);
        } catch (Exception e) {
            return error('Callout failed: ' + e.getMessage());
        }

        if (res == null) {
            return error('No response from provider');
        }

        Integer code = res.getStatusCode();
        String body = res.getBody();

        if (code >= 200 && code < 300) {
            try {
                Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(body);
                List<Object> choices = (List<Object>) parsed.get('choices');
                String content = 'Sorry, I could not process your request.';
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> first = (Map<String, Object>) choices[0];
                    Map<String, Object> message = (Map<String, Object>) first.get('message');
                    if (message != null) {
                        Object maybeContent = message.get('content');
                        if (maybeContent != null) {
                            content = String.valueOf(maybeContent);
                        }
                    }
                }
                ChatResponseDTO dto = new ChatResponseDTO();
                dto.botMessage = content;
                dto.quickReplies = new List<String>();
                return dto;
            } catch (Exception parseEx) {
                return error('Parsing error: ' + parseEx.getMessage());
            }
        } else {
            return error('Upstream error ' + code + ': ' + truncate(body, 5000));
        }
    }

    private static ChatResponseDTO error(String msg) {
        ChatResponseDTO dto = new ChatResponseDTO();
        dto.botMessage = msg;
        dto.quickReplies = new List<String>();
        return dto;
    }

    // Utility to avoid exceeding string limits in error messages/logs
    private static String truncate(String s, Integer maxLen) {
        if (s == null) return null;
        if (s.length() <= maxLen) return s;
        return s.substring(0, maxLen) + '...';
    }
}
