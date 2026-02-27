public with sharing class CustomLookupLwcController {
    @AuraEnabled(cacheable=true)
    public static List<sObject> fetchLookupData(String searchKey, List<String> sObjectApiNames, List<String> fields) {
        List<sObject> results = new List<sObject>();
        for (String sObjectApiName : sObjectApiNames) {
            String fieldQuery = String.join(fields, ', ');
            String query = 'SELECT Id, ' + fieldQuery + ' FROM ' + sObjectApiName + ' WHERE ';
            List<String> conditions = new List<String>();
            for (String field : fields) {
                conditions.add(field + ' LIKE \'%' + searchKey + '%\'');
            }
            query += String.join(conditions, ' OR ') + ' LIMIT 10';
            results.addAll(Database.query(query));
        }
        return results;
    }

    @AuraEnabled(cacheable=true)
    public static List<sObject> fetchSearchResults(List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            return new List<sObject>();
        }

        List<sObject> results = new List<sObject>();
        List<String> sObjectApiNames = new List<String>{'Account', 'Contact', 'Employee'};
        List<String> fields = new List<String>{'Name', 'Email'};
        for (String sObjectApiName : sObjectApiNames) {
            String fieldQuery = String.join(fields, ', ');
            String query = 'SELECT Id, ' + fieldQuery + ' FROM ' + sObjectApiName + ' WHERE ';
            List<String> conditions = new List<String>();
            for (String keyword : keywords) {
                for (String field : fields) {
                    conditions.add(field + ' LIKE \'%' + keyword + '%\'');
                }
            }
            query += String.join(conditions, ' OR ') + ' LIMIT 50';
            results.addAll(Database.query(query));
        }
        return results;
    }
}