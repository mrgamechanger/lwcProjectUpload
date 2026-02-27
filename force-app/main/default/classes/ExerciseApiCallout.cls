public with sharing class ExerciseApiCallout {
    private static final String BASE_URL = 'https://exercisedb.p.rapidapi.com/exercises/bodyPart/';
    private static final String RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';
    private static final String RAPIDAPI_KEY = '98180e14d0msh15467eb1b934608p1cd0cajsn3c696a3b2fbb'; // Replace with your actual API key

    @AuraEnabled
    public static String searchExercises(String bodyPart, Integer noofexercises) {
        // Validate input parameters
        if (String.isBlank(bodyPart)) {
            throw new AuraHandledException('Body part is required.');
        }
        
        if (noofexercises == null || noofexercises <= 0) {
            throw new AuraHandledException('Number of exercises must be greater than 0.');
        }
        
        String responseBody;
        String endpoint = BASE_URL + bodyPart + '?limit=' + noofexercises;

        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('X-RapidAPI-Host', RAPIDAPI_HOST);
        request.setHeader('X-RapidAPI-Key', RAPIDAPI_KEY);
        request.setTimeout(120000); // 2 minutes timeout

        Http http = new Http();
        
        try {
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                responseBody = response.getBody();
                // Validate that we received valid JSON
                if (String.isNotBlank(responseBody)) {
                    try {
                        // Test if the response is valid JSON
                        JSON.deserializeUntyped(responseBody);
                        System.debug('Response: ' + responseBody);
                    } catch (JSONException e) {
                        System.debug('Invalid JSON response: ' + e.getMessage());
                        throw new AuraHandledException('Invalid response format from API.');
                    }
                } else {
                    throw new AuraHandledException('Empty response from API.');
                }
            } else {
                System.debug('Error calling Exercise API. Status code: ' + response.getStatusCode());
                System.debug('Error calling Exercise API. Response body: ' + response.getBody());
                throw new AuraHandledException('API Error: ' + response.getStatusCode() + ' - ' + response.getStatus());
            }
        } catch (CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new AuraHandledException('Network error: ' + e.getMessage());
        } catch (AuraHandledException e) {
            // Re-throw AuraHandledException as is
            throw e;
        } catch (Exception e) {
            System.debug('Unexpected error: ' + e.getMessage());
            throw new AuraHandledException('Unexpected error: ' + e.getMessage());
        }
        
        return responseBody;
    }
}