/**
 * FlightSearchController
 * with sharing to respect org sharing rules. Provides an @AuraEnabled method for LWC to search flights.
 * Uses Named Credential 'RapidAPI_GoogleFlights' for secure callout.
 *
 * Requirements/Notes:
 * - Validates IATA codes (3 uppercase letters), dates (outbound <= return, outbound not in past), adults 1..9
 * - travelClass allowed: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
 * - Returns a typed response wrapper with success, statusCode, message, and raw responseBody (JSON/text)
 */
public with sharing class FlightSearchController {

    public class FlightSearchResponse {
        @AuraEnabled public Boolean success;
        @AuraEnabled public Integer statusCode;
        @AuraEnabled public String message;
        @AuraEnabled public String responseBody;
    }

    private static final Set<String> ALLOWED_TRAVEL_CLASSES = new Set<String>{
        'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'
    };

    @AuraEnabled(cacheable=false)
    public static FlightSearchResponse searchFlights(
        String departureId,
        String arrivalId,
        Date outboundDate,
        Date returnDate,
        String travelClass,
        Integer adults
    ) {
        FlightSearchResponse resp = new FlightSearchResponse();
        try {
            // Normalize/validate inputs
            String dep = String.isBlank(departureId) ? null : departureId.trim().toUpperCase();
            String arr = String.isBlank(arrivalId) ? null : arrivalId.trim().toUpperCase();
            String tClass = String.isBlank(travelClass) ? 'ECONOMY' : travelClass.trim().toUpperCase();
            Integer pax = (adults == null) ? 1 : adults;

            // Basic validations
            if (dep == null || dep.length() != 3 || !isAllLetters(dep)) {
                return error(400, 'Invalid departure_id. Provide a 3-letter IATA code.');
            }
            if (arr == null || arr.length() != 3 || !isAllLetters(arr)) {
                return error(400, 'Invalid arrival_id. Provide a 3-letter IATA code.');
            }
            if (outboundDate == null) {
                return error(400, 'outbound_date is required.');
            }
            // Outbound cannot be in the past
            if (outboundDate < Date.today()) {
                return error(400, 'outbound_date cannot be in the past.');
            }
            // returnDate is optional but if provided it must be on/after outbound
            if (returnDate != null && returnDate < outboundDate) {
                return error(400, 'return_date must be on or after outbound_date.');
            }
            // Adults 1..9
            if (pax < 1 || pax > 9) {
                return error(400, 'adults must be between 1 and 9.');
            }
            // Travel class whitelist
            if (!ALLOWED_TRAVEL_CLASSES.contains(tClass)) {
                return error(400, 'travel_class must be one of ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST.');
            }

            // Build query string
            String path = '/api/v1/searchFlights'
                + '?departure_id=' + EncodingUtil.urlEncode(dep, 'UTF-8')
                + '&currency=INR'
                + '&arrival_id=' + EncodingUtil.urlEncode(arr, 'UTF-8')
                + '&outbound_date=' + EncodingUtil.urlEncode(String.valueOf(outboundDate), 'UTF-8')
                + '&travel_class=' + EncodingUtil.urlEncode(tClass, 'UTF-8')
                + '&adults=' + EncodingUtil.urlEncode(String.valueOf(pax), 'UTF-8');

            if (returnDate != null) {
                path += '&return_date=' + EncodingUtil.urlEncode(String.valueOf(returnDate), 'UTF-8');
            }

            HttpRequest req = new HttpRequest();
            req.setMethod('GET');
            // Named Credential should encapsulate base URL and auth headers
            req.setEndpoint('callout:RapidAPI_GoogleFlights' + path);

            Http http = new Http();
            HttpResponse httpRes = http.send(req);

            resp.statusCode = httpRes.getStatusCode();
            resp.responseBody = httpRes.getBody();
            if (resp.statusCode >= 200 && resp.statusCode < 300) {
                resp.success = true;
                resp.message = 'Success';
            } else {
                resp.success = false;
                resp.message = 'Callout failed with status ' + resp.statusCode;
            }
            return resp;

        } catch (CalloutException ce) {
            return error(502, 'CalloutException: ' + ce.getMessage());
        } catch (Exception e) {
            return error(500, 'Unexpected error: ' + e.getMessage());
        }
    }

    private static Boolean isAllLetters(String s) {
        // Apex doesn't have a Character.isLetter utility; validate via regex.
        if (String.isBlank(s)) return false;
        return Pattern.matches('^[A-Za-z]+$', s);
    }

    private static FlightSearchResponse error(Integer status, String msg) {
        FlightSearchResponse r = new FlightSearchResponse();
        r.success = false;
        r.statusCode = status;
        r.message = msg;
        r.responseBody = null;
        return r;
    }
}
