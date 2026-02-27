public with sharing class CricApiController {
    @AuraEnabled(cacheable=true)
    public static String getCricScore() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.cricapi.com/v1/cricScore?apikey=1adb8f1d-0cd6-48f0-9c98-96bb999269ff');
            request.setMethod('GET');
            HttpResponse response = http.send(request);
            return response.getBody();
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching data: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getCurrentMatches() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.cricapi.com/v1/currentMatches?apikey=1adb8f1d-0cd6-48f0-9c98-96bb999269ff');
            request.setMethod('GET');
            HttpResponse response = http.send(request);
            return response.getBody();
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching data: ' + e.getMessage());
        }
    }
}
