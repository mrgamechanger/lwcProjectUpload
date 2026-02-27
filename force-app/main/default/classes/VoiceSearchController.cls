/**
 * @description Apex controller backing the Voice Search Lookup LWC.
 * Provides secure, limited SOSL/SOQL search for Account and Contact with WITH SECURITY_ENFORCED.
 * Keep queries selective and capped to avoid governor issues.
 */
public with sharing class VoiceSearchController {
    public class SearchResult {
        @AuraEnabled public Id Id;
        @AuraEnabled public String Name;
        // Optional fields used by UI mapping
        @AuraEnabled public String Email;
        @AuraEnabled public String Title;
        @AuraEnabled public String Industry;
        @AuraEnabled public String Type;
    }

    /**
     * @param objectApiName 'Account' or 'Contact'
     * @param searchKey user-entered search text
     * @param limitSize max results, defaults to 7 and capped at 25
     */
    @AuraEnabled(cacheable=true)
    public static List<SearchResult> searchRecords(String objectApiName, String searchKey, Integer limitSize) {
        if (String.isBlank(objectApiName)) {
            throw new AuraHandledException('objectApiName is required (Account or Contact).');
        }
        if (String.isBlank(searchKey)) {
            return new List<SearchResult>();
        }
        Integer limitVal = limitSize == null ? 7 : Math.max(1, Math.min(limitSize, 25));
        String key = searchKey.trim();

        if (objectApiName == 'Account') {
            return searchAccounts(key, limitVal);
        } else if (objectApiName == 'Contact') {
            return searchContacts(key, limitVal);
        } else {
            throw new AuraHandledException('Unsupported object: ' + objectApiName + '. Allowed: Account, Contact.');
        }
    }

    private static List<SearchResult> searchAccounts(String key, Integer limitVal) {
        // Try SOSL for name starts-with for speed, fallback to SOQL contains if needed
        List<Account> accts = new List<Account>();
        try {
            // SOSL: prioritize Name starts with the key
            List<List<sObject>> sr = Search.query('FIND \'' + String.escapeSingleQuotes(key) + '*\' IN NAME FIELDS RETURNING Account(Id, Name, Industry, Type WHERE IsDeleted = false LIMIT ' + limitVal + ')');
            if (!sr.isEmpty()) {
                accts = (List<Account>)sr[0];
            }
        } catch (Exception e) {
            // ignore and fallback to SOQL
        }
        if (accts.isEmpty()) {
            accts = [
                SELECT Id, Name, Industry, Type
                FROM Account
                WHERE IsDeleted = false
                  AND Name LIKE :('%' + key + '%')
                WITH SECURITY_ENFORCED
                ORDER BY Name
                LIMIT :limitVal
            ];
        }
        List<SearchResult> out = new List<SearchResult>();
        for (Account a : accts) {
            SearchResult r = new SearchResult();
            r.Id = a.Id;
            r.Name = a.Name;
            r.Industry = a.Industry;
            r.Type = a.Type;
            out.add(r);
        }
        return out;
    }

    private static List<SearchResult> searchContacts(String key, Integer limitVal) {
        List<Contact> cons = new List<Contact>();
        try {
            List<List<sObject>> sr = Search.query('FIND \'' + String.escapeSingleQuotes(key) + '*\' IN NAME FIELDS RETURNING Contact(Id, Name, Email, Title WHERE IsDeleted = false LIMIT ' + limitVal + ')');
            if (!sr.isEmpty()) {
                cons = (List<Contact>)sr[0];
            }
        } catch (Exception e) {
            // ignore and fallback
        }
        if (cons.isEmpty()) {
            cons = [
                SELECT Id, Name, Email, Title
                FROM Contact
                WHERE IsDeleted = false
                  AND (Name LIKE :('%' + key + '%') OR Email LIKE :('%' + key + '%'))
                WITH SECURITY_ENFORCED
                ORDER BY Name
                LIMIT :limitVal
            ];
        }
        List<SearchResult> out = new List<SearchResult>();
        for (Contact c : cons) {
            SearchResult r = new SearchResult();
            r.Id = c.Id;
            r.Name = c.Name;
            r.Email = c.Email;
            r.Title = c.Title;
            out.add(r);
        }
        return out;
    }
}
