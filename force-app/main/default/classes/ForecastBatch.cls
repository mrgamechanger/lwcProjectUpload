/**
 * @description Batch job to generate and persist quarterly forecasts for Opportunity Owners (next 4 quarters).
 * Uses ForecastEngine to compute predictions and upserts Forecast_Summary__c records keyed by NaturalKey__c.
 * Multi-currency supported via platform CurrencyIsoCode on target object.
 *
 * Execution:
 *  - Query distinct owners with Opportunities in past N quarters
 *  - Chunk owners into manageable scope per batch
 *  - In execute(), call ForecastEngine.generate() and upsert results
 *
 * Scheduling:
 *  - Use ForecastScheduler to run nightly/weekly as required.
 */
public without sharing class ForecastBatch implements Database.Batchable<SObject>, Database.Stateful {

    private Date anchorDate;
    private Integer horizonQuarters;
    private Boolean includeSeasonality;

    public ForecastBatch(Date anchorDateParam, Integer horizonQuartersParam, Boolean includeSeasonalityParam) {
        anchorDate = (anchorDateParam == null) ? Date.today() : anchorDateParam;
        horizonQuarters = (horizonQuartersParam == null || horizonQuartersParam <= 0) ? 4 : horizonQuartersParam;
        includeSeasonality = (includeSeasonalityParam == null) ? true : includeSeasonalityParam;
    }

    public Database.QueryLocator start(Database.BatchableContext bc) {
        // Discover owners with recent Opp activity within last 8 quarters (training window)
        Date startPeriod = ForecastEngine.quarterStartForDate(anchorDate).addMonths(-3 * 8);
        String soql = 'SELECT OwnerId FROM Opportunity WHERE CloseDate >= :startPeriod AND IsDeleted = false GROUP BY OwnerId';
        return Database.getQueryLocator(soql);
    }

    public void execute(Database.BatchableContext bc, List<SObject> scope) {
        if (scope == null || scope.isEmpty()) return;
        Set<Id> ownerIds = new Set<Id>();
        for (SObject s : scope) {
            ownerIds.add((Id)s.get('OwnerId'));
        }

        ForecastEngine.GenerateRequest req = new ForecastEngine.GenerateRequest();
        req.anchorDate = anchorDate;
        req.horizonQuarters = horizonQuarters;
        req.includeSeasonality = includeSeasonality;
        req.ownerIds = ownerIds;

        ForecastEngine.GenerateResponse resp = ForecastEngine.generate(req);
        ForecastEngine.upsertSummaries(resp.points);
    }

    public void finish(Database.BatchableContext bc) {
        // Optionally log completion; keep minimal to avoid noisy logs
        System.debug('ForecastBatch finished at ' + Datetime.now());
    }
}
