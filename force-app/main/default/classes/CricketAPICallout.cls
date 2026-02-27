public class CricketAPICallout {
    
    public static void getCurrentMatches() {
        HttpRequest req = new HttpRequest();
        HttpResponse res = new HttpResponse();
        Http http = new Http();
        
        // Use Named Credential with apikey parameter merged from External Credential
       req.setEndpoint('callout:Cricket_API');
       req.setMethod('GET');
        req.setTimeout(120000);
        
        try {
            res = http.send(req);
            if (res.getStatusCode() == 200) {
                String responseBody = res.getBody();
                System.debug('Cricket API Response: ' + responseBody);
                parseCurrentMatches(responseBody);
            } else {
                System.debug('Error: ' + res.getStatusCode() + ' ' + res.getStatus());
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
        }
    }
    
    private static void parseCurrentMatches(String jsonResponse) {
        Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(jsonResponse);
        List<Object> matches = (List<Object>) responseMap.get('data');
        
        for (Object matchObj : matches) {
            Map<String, Object> match = (Map<String, Object>) matchObj;
            System.debug('Match: ' + match.get('name'));
            System.debug('Status: ' + match.get('status'));
        }
    }
}
