public with sharing class VlocityTrackingService {
    
    @AuraEnabled
    public static void trackOmniScriptEvent(String omniScriptId, String eventType, Map<String, Object> customData) {
        try {
            VlocityTrackingEntry__c trackingEntry = new VlocityTrackingEntry__c(
                OmniScriptId__c = omniScriptId,
                EventType__c = eventType,
                Timestamp__c = System.now(),
                ElapsedTime__c = (Decimal)customData.get('elapsedTime'),
                InteractionId__c = (String)customData.get('interactionId'),
                CustomData__c = JSON.serialize(customData)
            );
            
            // Add any additional fields based on event type
            if (eventType == 'Done') {
                trackingEntry.Outcome__c = (String)customData.get('outcome');
            }
            
            insert trackingEntry;
        } catch(Exception e) {
            throw new AuraHandledException('Error tracking OmniScript event: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<VlocityTrackingEntry__c> getTrackingData(String componentType, String eventType) {
        String query = 'SELECT Id, OmniScriptId__c, EventType__c, Timestamp__c, ElapsedTime__c, ' +
                      'InteractionId__c, CustomData__c, Outcome__c ' +
                      'FROM VlocityTrackingEntry__c ';
        
        List<String> conditions = new List<String>();
        if (String.isNotBlank(componentType)) {
            conditions.add('ComponentType__c = :componentType');
        }
        if (String.isNotBlank(eventType)) {
            conditions.add('EventType__c = :eventType');
        }
        
        if (!conditions.isEmpty()) {
            query += 'WHERE ' + String.join(conditions, ' AND ');
        }
        
        query += ' ORDER BY Timestamp__c DESC LIMIT 1000';
        
        return Database.query(query);
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTrackingStats() {
        Map<String, Object> stats = new Map<String, Object>();
        
        // Get average execution times by component
        List<AggregateResult> avgExecutionTimes = [
            SELECT ComponentType__c, AVG(ElapsedTime__c) avgTime
            FROM VlocityTrackingEntry__c
            GROUP BY ComponentType__c
        ];
        
        // Get event counts by type
        List<AggregateResult> eventCounts = [
            SELECT EventType__c, COUNT(Id) totalCount
            FROM VlocityTrackingEntry__c
            GROUP BY EventType__c
        ];
        
        // Get success rates for OmniScripts
        List<AggregateResult> successRates = [
            SELECT OmniScriptId__c, 
                   COUNT(Id) totalExecutions,
                   SUM(CASE WHEN Outcome__c = 'Success' THEN 1 ELSE 0 END) successCount
            FROM VlocityTrackingEntry__c
            WHERE EventType__c = 'Done'
            GROUP BY OmniScriptId__c
        ];
        
        stats.put('averageExecutionTimes', avgExecutionTimes);
        stats.put('eventCounts', eventCounts);
        stats.put('successRates', successRates);
        
        return stats;
    }
} 