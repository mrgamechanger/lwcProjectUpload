public with sharing class trainDetailsFetch {
    @AuraEnabled
    public static String getTrainDetails(String trainNo) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:RapidAPI_Train/train.php?train_no=' + trainNo);
        req.setMethod('GET');
        
        HttpResponse resp = http.send(req);
        String responseBody = '';
        
        if (resp.getStatusCode() == 200) {
            responseBody = resp.getBody();
            System.debug('response body: ' + resp.getBody());
        } else {
            System.debug('Error fetching train details. Status code: ' + resp.getStatusCode());
            System.debug('Error response body: ' + resp.getBody());
        }
        
        return responseBody;
    }
}