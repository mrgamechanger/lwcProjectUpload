// FieldMappingController.cls
public with sharing class FieldMappingController {
    @AuraEnabled(cacheable=true)
    public static List<FieldInfo> getObjectFields(String objectName) {
        List<FieldInfo> fields = new List<FieldInfo>();
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        
        if (schemaMap.containsKey(objectName)) {
            Schema.SObjectType sObjectType = schemaMap.get(objectName);
            Map<String, Schema.SObjectField> fieldMap = sObjectType.getDescribe().fields.getMap();

            for (String fieldName : fieldMap.keySet()) {
                Schema.DescribeFieldResult fieldResult = fieldMap.get(fieldName).getDescribe();
                fields.add(new FieldInfo(fieldResult.getName(), fieldResult.getLabel()));
            }
        }

        return fields;
    }

    public class FieldInfo {
        @AuraEnabled public String apiName;
        @AuraEnabled public String label;

        public FieldInfo(String apiName, String label) {
            this.apiName = apiName;
            this.label = label;
        }
    }
}