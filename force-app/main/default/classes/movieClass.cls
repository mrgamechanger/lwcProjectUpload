public with sharing class movieClass {
    private static final String BASE_URL = 'https://online-movie-database.p.rapidapi.com/v2/search';
    private static final String RAPIDAPI_HOST = 'online-movie-database.p.rapidapi.com';
    private static final String RAPIDAPI_KEY = '98180e14d0msh15467eb1b934608p1cd0cajsn3c696a3b2fbb'; // Replace with your actual API key
    @AuraEnabled
    public static String MoviesSearch(String searchTerm, String type) {
                                            String responseBody;
        String endpoint = BASE_URL + '?searchTerm=' + searchTerm +
                          '&type=' + type +'&first=1';

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
            System.debug('Error calling MoviesSearch API. Status code: ' + response.getStatusCode());
            System.debug('Error calling MoviesSearch API. Response body: ' + response.getBody());
        }
        return responseBody;
    }
}