public with sharing class FluxController {
    
    @AuraEnabled
    public static String generateImage(String prompt) {
        try {
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://router.huggingface.co/models/black-forest-labs/FLUX.1-dev');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('Authorization', 'Bearer REDACTED_HF_TOKEN');
            req.setTimeout(120000); // 120 seconds timeout
            
            // Configure generation parameters
            Map<String, Object> payload = new Map<String, Object>{
                'inputs' => prompt,
                'parameters' => new Map<String, Object>{
                    'num_inference_steps' => 50,
                    'guidance_scale' => 7.5
                }
            };
            
            req.setBody(JSON.serialize(payload));
            
            HttpResponse res = new Http().send(req);
            
            if(res.getStatusCode() == 200) {
                return EncodingUtil.base64Encode(res.getBodyAsBlob());
            } else {
                throw new AuraHandledException('API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            }
        } catch(Exception e) {
            throw new AuraHandledException('Generation failed: ' + e.getMessage());
        }
    }
}