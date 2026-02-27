public with sharing class ImageTextExtractorController {
    @AuraEnabled
    public static String extractTextFromImage(String base64Image) {
        try {
            // Remove the data URL prefix if present
            String cleanBase64 = base64Image;
            if(base64Image.contains(',')) {
                cleanBase64 = base64Image.substring(base64Image.indexOf(',') + 1);
            }
            
            // Create the request to Einstein Vision API
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.einstein.ai/v2/vision/ocr');
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Authorization', 'Bearer ' + getEinsteinToken());
            
            // Prepare the request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'sampleBase64Content' => cleanBase64,
                'task' => 'ocr'
            };
            
            request.setBody(JSON.serialize(requestBody));
            
            // Send the request
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new AuraHandledException('Error processing image: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    private static String getEinsteinToken() {
        // In a real implementation, you would store this securely
        // and potentially use Named Credentials or Custom Setting
        return 'YOUR_EINSTEIN_API_TOKEN';
    }
} 