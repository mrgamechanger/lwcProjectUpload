public with sharing class OmniStudioMonitoringController {
    
    @AuraEnabled(cacheable=true)
    public static List<OmniStudioMonitoring__c> getMonitoringData() {
        return [
            SELECT Id, Name, ComponentName__c, ExecutionTime__c, CreatedDate
            FROM OmniStudioMonitoring__c
            ORDER BY CreatedDate DESC
            LIMIT 100
        ];
    }
    
    @AuraEnabled
    public static void logExecution(String componentName, Integer executionTime) {
        try {
            OmniStudioMonitoring__c monitoring = new OmniStudioMonitoring__c(
                Name = componentName + ' - ' + System.now(),
                ComponentName__c = componentName,
                ExecutionTime__c = executionTime
            );
            insert monitoring;
        } catch(Exception e) {
            throw new AuraHandledException('Error logging execution: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getMonitoringStats() {
        Map<String, Object> stats = new Map<String, Object>();
        
        List<AggregateResult> avgExecutionTime = [
            SELECT ComponentName__c, AVG(ExecutionTime__c) avgTime
            FROM OmniStudioMonitoring__c
            GROUP BY ComponentName__c
        ];
        
        stats.put('averageExecutionTimes', avgExecutionTime);
        
        List<AggregateResult> totalExecutions = [
            SELECT ComponentName__c, COUNT(Id) totalCount
            FROM OmniStudioMonitoring__c
            GROUP BY ComponentName__c
        ];
        
        stats.put('totalExecutions', totalExecutions);
        
        return stats;
    }
} 