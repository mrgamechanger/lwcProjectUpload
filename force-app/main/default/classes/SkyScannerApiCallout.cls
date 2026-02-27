public with sharing class SkyScannerApiCallout {
    private static final String BASE_URL = 'https://sky-scanner3.p.rapidapi.com/flights/search-one-way';
    private static final String RAPIDAPI_HOST = 'sky-scanner3.p.rapidapi.com';
    private static final String RAPIDAPI_KEY = '98180e14d0msh15467eb1b934608p1cd0cajsn3c696a3b2fbb'; // Replace with your actual API key
    @AuraEnabled
    public static String searchOneWayFlights(String fromEntityId, String toEntityId,
                                           String departDate, String Amt, Integer adults) {
                                            String responseBody;
        String endpoint = BASE_URL + '?fromEntityId=' + fromEntityId +
                          '&toEntityId=' + toEntityId +
                          '&departDate=' + departDate +
                          '&currency=' + Amt +
                          '&adults=' + adults;

        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('X-RapidAPI-Host', RAPIDAPI_HOST);
        request.setHeader('X-RapidAPI-Key', RAPIDAPI_KEY);

        Http http = new Http();
        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 200) {
            responseBody = response.getBody();
            // Process the response data (e.g., parse JSON)
           
        } else {
            System.debug('Error calling SkyScanner API. Status code: ' + response.getStatusCode());
            System.debug('Error calling SkyScanner API. Response body: ' + response.getBody());
        }
        return responseBody;
    }
}