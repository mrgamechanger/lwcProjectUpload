public with sharing class OmniStudioTrackingService {
    
    @AuraEnabled
    public static void trackComponentInteraction(String componentType, String componentName, String stepName, Integer timeSpent) {
        try {
            OmniStudioTracking__c tracking = new OmniStudioTracking__c(
                Name = componentName + ' - ' + System.now(),
                ComponentType__c = componentType,
                ComponentName__c = componentName,
                StepName__c = stepName,
                TimeSpent__c = timeSpent,
                User__c = UserInfo.getUserId(),
                SessionId__c = UserInfo.getSessionId()
            );
            insert tracking;
        } catch(Exception e) {
            throw new AuraHandledException('Error tracking component interaction: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<OmniStudioTracking__c> getTrackingData(String componentType, String componentName, Date startDate, Date endDate) {
        String query = 'SELECT Id, ComponentType__c, ComponentName__c, StepName__c, TimeSpent__c, CreatedDate, User__c ' +
                      'FROM OmniStudioTracking__c ';
        
        List<String> conditions = new List<String>();
        if (String.isNotBlank(componentType)) {
            conditions.add('ComponentType__c = :componentType');
        }
        if (String.isNotBlank(componentName)) {
            conditions.add('ComponentName__c = :componentName');
        }
        if (startDate != null) {
            conditions.add('CreatedDate >= :startDate');
        }
        if (endDate != null) {
            conditions.add('CreatedDate <= :endDate');
        }
        
        if (!conditions.isEmpty()) {
            query += 'WHERE ' + String.join(conditions, ' AND ');
        }
        
        query += ' ORDER BY CreatedDate DESC LIMIT 1000';
        
        return Database.query(query);
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTrackingStats(String componentType, Date startDate, Date endDate) {
        Map<String, Object> stats = new Map<String, Object>();
        
        // Get average time spent by component
        List<AggregateResult> avgTimeSpent = [
            SELECT ComponentName__c, AVG(TimeSpent__c) avgTime
            FROM OmniStudioTracking__c
            WHERE ComponentType__c = :componentType
            AND CreatedDate >= :startDate
            AND CreatedDate <= :endDate
            GROUP BY ComponentName__c
        ];
        
        // Get total interactions by component
        List<AggregateResult> totalInteractions = [
            SELECT ComponentName__c, COUNT(Id) totalCount
            FROM OmniStudioTracking__c
            WHERE ComponentType__c = :componentType
            AND CreatedDate >= :startDate
            AND CreatedDate <= :endDate
            GROUP BY ComponentName__c
        ];
        
        // Get step-wise time distribution for OmniScripts
        List<AggregateResult> stepWiseTime = [
            SELECT StepName__c, AVG(TimeSpent__c) avgTime
            FROM OmniStudioTracking__c
            WHERE ComponentType__c = 'OmniScript'
            AND CreatedDate >= :startDate
            AND CreatedDate <= :endDate
            GROUP BY StepName__c
        ];
        
        stats.put('averageTimeSpent', avgTimeSpent);
        stats.put('totalInteractions', totalInteractions);
        stats.put('stepWiseTime', stepWiseTime);
        
        return stats;
    }
} 