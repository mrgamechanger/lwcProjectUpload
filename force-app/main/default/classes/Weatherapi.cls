public with sharing class Weatherapi {
    @AuraEnabled
    public static String getWeatherapi(String city) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String responseBody;

        try {
            // Construct the endpoint URL with the Named Credential
            request.setEndpoint('callout:WeatherApi/current.json?q=' + EncodingUtil.urlEncode(city, 'UTF-8'));
            request.setMethod('GET');

            // Send the request
            HttpResponse response = http.send(request);

            // Check the response status
            if (response.getStatusCode() == 200) {
                responseBody = response.getBody();
            } else {
                throw new CalloutException('Failed to retrieve weather data: HTTP ' + response.getStatusCode());
            }
        } catch (CalloutException e) {
            // Handle callout-specific exceptions
            System.debug('Callout Exception: ' + e.getMessage());
            responseBody = 'Error: Unable to retrieve weather data.';
        } catch (Exception e) {
            // Handle other exceptions
            System.debug('General Exception: ' + e.getMessage());
            responseBody = 'Error: An unexpected error occurred.';
        }

        return responseBody;
    }
}