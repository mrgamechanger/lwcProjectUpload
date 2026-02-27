public with sharing class MovieApiCallout {
    private static final String API_KEY = '7a24878e'; // OMDB API key
    private static final String BASE_URL = 'https://www.omdbapi.com/';
    
    @AuraEnabled
    public static Map<String, Object> searchContent(String searchTerm, String contentType, Integer page) {
        try {
            String endpoint = BASE_URL + '?apikey=' + API_KEY + '&s=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            
            // Add content type filter if specified
            if (String.isNotBlank(contentType)) {
                endpoint += '&type=' + contentType;
            }
            
            // Add pagination if specified
            if (page != null && page > 1) {
                endpoint += '&page=' + page;
            }
            
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            } else {
                throw new AuraHandledException('Error fetching content: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> getContentDetails(String imdbId, Integer season, Integer episode) {
        try {
            String endpoint = BASE_URL + '?apikey=' + API_KEY + '&i=' + imdbId + '&plot=full';
            
            // Add season parameter if specified
            if (season != null) {
                endpoint += '&Season=' + season;
            }
            
            // Add episode parameter if specified
            if (episode != null) {
                endpoint += '&Episode=' + episode;
            }
            
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            } else {
                throw new AuraHandledException('Error fetching content details: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> getSeasonEpisodes(String imdbId, Integer season) {
        try {
            String endpoint = BASE_URL + '?apikey=' + API_KEY + '&i=' + imdbId + '&Season=' + season;
            
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            } else {
                throw new AuraHandledException('Error fetching season episodes: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}