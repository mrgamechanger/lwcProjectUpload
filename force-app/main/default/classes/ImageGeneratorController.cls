public with sharing class ImageGeneratorController {

    @AuraEnabled
    public static String generateImage(String inputText) {
        // Ensure the input is not empty or null
        if (String.isBlank(inputText)) {
            return 'Error: Input text cannot be blank.';
        }

        // Set the endpoint and API details
        String apiEndpoint = 'https://ai-text-to-image-generator-api.p.rapidapi.com/realistic';
        String apiKey = '98180e14d0msh15467eb1b934608p1cd0cajsn3c696a3b2fbb';
        String apiHost = 'ai-text-to-image-generator-api.p.rapidapi.com';

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(apiEndpoint);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('x-rapidapi-host', apiHost);
        request.setHeader('x-rapidapi-key', apiKey);

        // Construct the request body
        String requestBody = '{"inputs": "' + String.escapeSingleQuotes(inputText) + '"}';
        request.setBody(requestBody);

        try {
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                // Parse the response JSON to extract the URL
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                
                if (responseBody != null && responseBody.containsKey('url')) {
                    return (String) responseBody.get('url');  // Return the image URL
                } else {
                    return 'Error: Failed to retrieve the image URL from the response.';
                }
            } else {
                return 'Error: HTTP Response Code ' + response.getStatusCode() + ' - ' + response.getStatus();
            }
        } catch (Exception e) {
            // Log the error (optional)
            System.debug('Error generating image: ' + e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }
}