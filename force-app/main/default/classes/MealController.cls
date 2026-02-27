public with sharing class MealController {
    @AuraEnabled(cacheable=true)
    public static String searchMeal(String searchTerm) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://www.themealdb.com/api/json/v1/1/search.php?s=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new AuraHandledException('Error fetching meals: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static String getCategories() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://www.themealdb.com/api/json/v1/1/categories.php');
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new AuraHandledException('Error fetching categories: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    
    
    @AuraEnabled(cacheable=true)
    public static String getAreas() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new AuraHandledException('Error fetching areas: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static String filterByArea(String area) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + EncodingUtil.urlEncode(area, 'UTF-8'));
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new AuraHandledException('Error filtering by area: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static String filterByCategory(String category) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + EncodingUtil.urlEncode(category, 'UTF-8'));
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new AuraHandledException('Error filtering by category: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static String getMealDetails(String mealId) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + EncodingUtil.urlEncode(mealId, 'UTF-8'));
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if(response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new AuraHandledException('Error fetching meal details: ' + response.getStatusCode());
            }
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}