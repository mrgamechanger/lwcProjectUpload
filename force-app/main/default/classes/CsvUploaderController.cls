// CsvUploaderController.cls
public with sharing class CsvUploaderController {
    @AuraEnabled
    public static Integer insertRecords(String objectName, List<Map<String, String>> records) {
        // Get the SObject type dynamically
        SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        List<SObject> sObjects = new List<SObject>();
        
        for (Map<String, String> record : records) {
            // Create a new instance of the specified SObject
            SObject sobj = sObjectType.newSObject();

            for (String fieldName : record.keySet()) {
                String fieldValue = record.get(fieldName);
                
                // Describe field to determine the type
                Schema.DescribeFieldResult fieldResult = sObjectType.getDescribe().fields.getMap().get(fieldName).getDescribe();

                // Handle Decimal and Currency fields safely
                if (fieldResult.getType() == Schema.DisplayType.Currency ) {
                    if (fieldValue != null && fieldValue.trim() != '') {
                        try {
                            // Convert String to Decimal
                            Decimal decimalValue = Decimal.valueOf(fieldValue);
                            sobj.put(fieldName, decimalValue);
                        } catch (Exception e) {
                            System.debug('Error converting field: ' + fieldName + ' with value: ' + fieldValue + ' - ' + e.getMessage());
                        }
                    }
                } else if (fieldResult.getType() == Schema.DisplayType.Integer) {
                    if (fieldValue != null && fieldValue.trim() != '') {
                        try {
                            // Convert String to Integer
                            Integer intValue = Integer.valueOf(fieldValue);
                            sobj.put(fieldName, intValue);
                        } catch (Exception e) {
                            System.debug('Error converting field: ' + fieldName + ' with value: ' + fieldValue + ' - ' + e.getMessage());
                        }
                    }
                } else {
                    sobj.put(fieldName, fieldValue);
                }
            }
            
            sObjects.add(sobj);
        }

        // Insert records and return the count of inserted records
        Database.SaveResult[] results = Database.insert(sObjects, false);
        Integer count = 0;
        for (Database.SaveResult result : results) {
            if (result.isSuccess()) {
                count++;
            } else {
                // Handle errors
                for (Database.Error err : result.getErrors()) {
                    System.debug('Error: ' + err.getMessage());
                }
            }
        }
        return count;
    }
}