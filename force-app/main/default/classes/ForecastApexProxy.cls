/**
 * @description Apex proxy for LWC to access forecast data without direct REST calls.
 * Wraps ForecastRestController behavior for Lightning context.
 * Security: with sharing to honor row-level access on Forecast_Summary__c.
 */
public with sharing class ForecastApexProxy {

    @AuraEnabled
    public static List<ForecastRestController.ForecastDTO> getSummaries(Id ownerId, Integer horizon) {
        Date startQ = quarterStartForDate(Date.today());
        // Compute future quarter starts
        List<Date> future = new List<Date>();
        Integer hz = (horizon == null || horizon <= 0) ? 4 : horizon;
        for (Integer i = 1; i <= hz; i++) {
            future.add(startQ.addMonths(3 * i));
        }
        Set<Date> futureStarts = new Set<Date>(future);

        List<Forecast_Summary__c> rows;
        if (ownerId == null) {
            rows = [
                SELECT Id, Grain__c, PeriodStartDate__c, FiscalYear__c, FiscalQuarter__c, Owner__c,
                       HistoricAmount__c, PipelineAmount__c, ClosedWonAmount__c, PredictedAmount__c,
                       LowerBound__c, UpperBound__c, Method__c, Version__c, SnapshotDateTime__c, NaturalKey__c
                FROM Forecast_Summary__c
                WHERE Grain__c = 'Quarter' AND PeriodStartDate__c IN :futureStarts
                ORDER BY Owner__c, PeriodStartDate__c
            ];
        } else {
            rows = [
                SELECT Id, Grain__c, PeriodStartDate__c, FiscalYear__c, FiscalQuarter__c, Owner__c,
                       HistoricAmount__c, PipelineAmount__c, ClosedWonAmount__c, PredictedAmount__c,
                       LowerBound__c, UpperBound__c, Method__c, Version__c, SnapshotDateTime__c, NaturalKey__c
                FROM Forecast_Summary__c
                WHERE Grain__c = 'Quarter' AND Owner__c = :ownerId AND PeriodStartDate__c IN :futureStarts
                ORDER BY PeriodStartDate__c
            ];
        }
        return toDTOs(rows);
    }

    /**
     * Generate on-demand and persist for selected owners (or all owners if empty).
     */
    @AuraEnabled
    public static ForecastEngine.GenerateResponse generateAndPersist(List<Id> ownerIds, Integer horizonQuarters, Boolean includeSeasonality) {
        ForecastEngine.GenerateRequest req = new ForecastEngine.GenerateRequest();
        req.anchorDate = Date.today();
        req.horizonQuarters = (horizonQuarters == null || horizonQuarters <= 0) ? 4 : horizonQuarters;
        req.includeSeasonality = (includeSeasonality == null) ? true : includeSeasonality;
        req.ownerIds = (ownerIds == null) ? new Set<Id>() : new Set<Id>(ownerIds);
        ForecastEngine.GenerateResponse resp = ForecastEngine.generate(req);
        ForecastEngine.upsertSummaries(resp.points);
        return resp;
    }

    // ----- DTO conversion (reuse structure from REST) -----
    private static List<ForecastRestController.ForecastDTO> toDTOs(List<Forecast_Summary__c> rows) {
        List<ForecastRestController.ForecastDTO> out = new List<ForecastRestController.ForecastDTO>();
        for (Forecast_Summary__c r : rows) {
            ForecastRestController.ForecastDTO d = new ForecastRestController.ForecastDTO();
            d.periodStart = r.PeriodStartDate__c;
            d.fiscalYear = (r.FiscalYear__c == null) ? r.PeriodStartDate__c.year() : Integer.valueOf(r.FiscalYear__c);
            d.fiscalQuarter = (r.FiscalQuarter__c == null) ? quarterNumberFromDate(r.PeriodStartDate__c) : Integer.valueOf(r.FiscalQuarter__c);
            d.ownerId = r.Owner__c;
            d.historicAmount = r.HistoricAmount__c;
            d.pipelineAmount = r.PipelineAmount__c;
            d.closedWonAmount = r.ClosedWonAmount__c;
            d.predictedAmount = r.PredictedAmount__c;
            d.lowerBound = r.LowerBound__c;
            d.upperBound = r.UpperBound__c;
            d.method = r.Method__c;
            d.version = (r.Version__c == null) ? 1 : Integer.valueOf(r.Version__c);
            d.snapshotAt = r.SnapshotDateTime__c;
            if (Schema.sObjectType.Forecast_Summary__c.fields.getMap().containsKey('CurrencyIsoCode')) {
                d.currencyIsoCode = (String) r.get('CurrencyIsoCode');
            }
            out.add(d);
        }
        return out;
    }

    private static Date quarterStartForDate(Date d) {
        Integer q = ((d.month() - 1) / 3) + 1;
        Integer qStartMonth = ((q - 1) * 3) + 1;
        return Date.newInstance(d.year(), qStartMonth, 1);
    }
    private static Integer quarterNumberFromDate(Date d) {
        return ((d.month() - 1) / 3) + 1;
    }
}
