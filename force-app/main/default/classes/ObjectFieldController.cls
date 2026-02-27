// ObjectFieldController.cls
public with sharing class ObjectFieldController {

    @AuraEnabled(cacheable=true)
    public static List<String> getAllObjects() {
        List<String> sObjectNames = new List<String>();
        for(Schema.SObjectType objType : Schema.getGlobalDescribe().values()) {
            sObjectNames.add(objType.getDescribe().getName());
        }
        return sObjectNames;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getFieldsForObject(String objectName) {
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        return new List<String>(fieldMap.keySet());
    }

    @AuraEnabled
    public static List<SObject> queryRecords(String objectName, List<String> fields, String whereClause) {
        String fieldList = String.join(fields, ',');
        String queryString = 'SELECT ' + fieldList + ' FROM ' + objectName;

        if (whereClause != null && whereClause != '') {
            queryString += ' WHERE ' + whereClause;
        }

        return Database.query(queryString);
    }

    @AuraEnabled
    public static String createRecord(String objectName, Map<String, Object> fieldValues) {
        try {
            SObject newRecord = Schema.getGlobalDescribe().get(objectName).newSObject();

            for (String field : fieldValues.keySet()) {
                newRecord.put(field, fieldValues.get(field));
            }

            insert newRecord;
            return 'Record created successfully with Id: ' + newRecord.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating record: ' + e.getMessage());
        }
    }
}