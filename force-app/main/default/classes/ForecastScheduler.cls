/**
 * @description Schedulable wrapper to run quarterly owner forecast generation on a schedule.
 * Default: runs with next 4 quarters horizon and seasonality enabled.
 *
 * To schedule via UI:
 * - Setup -> Apex Classes -> Schedule Apex
 *   Class: ForecastScheduler
 *   CRON: e.g., 0 0 2 * * ? (2 AM daily) or per business need
 */
global without sharing class ForecastScheduler implements Schedulable {

    global void execute(SchedulableContext sc) {
        Date anchor = Date.today();
        Integer horizon = 4;
        Boolean seasonality = true;

        ForecastBatch b = new ForecastBatch(anchor, horizon, seasonality);
        Database.executeBatch(b, 200);
    }

    /**
     * Helper to schedule programmatically.
     * Example CRON: "0 0 2 * * ?"
     */
    @AuraEnabled
    public static Id scheduleJob(String jobName, String cron) {
        if (String.isBlank(jobName)) jobName = 'ForecastScheduler';
        if (String.isBlank(cron)) cron = '0 0 2 * * ?';
        return System.schedule(jobName, cron, new ForecastScheduler());
    }
}
