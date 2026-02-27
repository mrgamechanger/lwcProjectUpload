public with sharing class CurrencyService {
    
    /**
     * Fetches all available currencies from Frankfurter API
     * @return Map<String, String> Currency code to currency name mapping
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getCurrencies() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.frankfurter.app/currencies');
        req.setMethod('GET');
        req.setTimeout(12000);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            Map<String, String> currencies = new Map<String, String>();
            
            for (String key : responseMap.keySet()) {
                currencies.put(key, (String) responseMap.get(key));
            }
            
            return currencies;
        } else {
            throw new AuraHandledException('Error fetching currencies: ' + res.getStatusCode() + ' ' + res.getStatus());
        }
    }
    
    /**
     * Converts currency using Frankfurter API
     * @param amount Amount to convert
     * @param fromCurrency Source currency code
     * @param toCurrency Target currency code
     * @return Map<String, Object> Contains rate and converted amount
     */
    @AuraEnabled
    public static Map<String, Object> convertCurrency(Decimal amount, String fromCurrency, String toCurrency) {
        if (amount == null || String.isBlank(fromCurrency) || String.isBlank(toCurrency)) {
            throw new AuraHandledException('Amount, from currency, and to currency are required');
        }
        
        String endpoint = 'https://api.frankfurter.app/latest?amount=' + amount + '&from=' + fromCurrency + '&to=' + toCurrency;
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setTimeout(12000);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            Map<String, Object> rates = (Map<String, Object>) responseMap.get('rates');
            
            Map<String, Object> result = new Map<String, Object>();
            result.put('rate', rates.get(toCurrency));
            result.put('amount', amount);
            result.put('fromCurrency', fromCurrency);
            result.put('toCurrency', toCurrency);
            
            return result;
        } else {
            throw new AuraHandledException('Error converting currency: ' + res.getStatusCode() + ' ' + res.getStatus());
        }
    }
}

