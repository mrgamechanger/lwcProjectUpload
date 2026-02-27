/**
 * @description Apex REST controller to expose forecast summaries and on-demand generation
 * for LWC and external integrations. Does NOT expose any sensitive data.
 * Security: with sharing to respect org data access for Owners/Opportunities via summaries.
 */
@RestResource(urlMapping='/forecast/v1/*')
global with sharing class ForecastRestController {

    /**
     * GET /services/apexrest/forecast/v1/summaries?ownerId=005...&horizon=4
     * Returns existing Forecast_Summary__c rows for upcoming quarters for the given owner(s).
     */
    @HttpGet
    global static List<ForecastDTO> getSummaries() {
        RestRequest req = RestContext.request;
        String ownerId = req.params.get('ownerId');
        Integer horizon = parseIntOrDefault(req.params.get('horizon'), 4);

        Date startQ = quarterStartForDate(Date.today());
        List<Date> future = new List<Date>();
        for (Integer i=1; i<=horizon; i++) future.add(startQ.addMonths(3*i));

        Set<Date> futureStarts = new Set<Date>(future);
        List<Forecast_Summary__c> rows;
        if (String.isBlank(ownerId)) {
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
     * POST /services/apexrest/forecast/v1/generate
     * Body: { "ownerIds": ["005...","005..."], "horizonQuarters": 4, "includeSeasonality": true }
     * Computes forecasts on-demand and persists summaries.
     */
    @HttpPost
    global static ForecastEngine.GenerateResponse generateAndPersist() {
        RestRequest req = RestContext.request;
        Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(req.requestBody.toString());

        ForecastEngine.GenerateRequest greq = new ForecastEngine.GenerateRequest();
        greq.anchorDate = Date.today();
        greq.horizonQuarters = (Integer) body.get('horizonQuarters');
        greq.includeSeasonality = (Boolean) body.get('includeSeasonality');
        greq.ownerIds = new Set<Id>();
        if (body.containsKey('ownerIds')) {
            List<Object> oids = (List<Object>) body.get('ownerIds');
            for (Object o : oids) greq.ownerIds.add((Id) (String) o);
        }

        ForecastEngine.GenerateResponse resp = ForecastEngine.generate(greq);
        ForecastEngine.upsertSummaries(resp.points);
        return resp;
    }

    // ----- DTO + helpers -----
    global class ForecastDTO {
        public Date periodStart;
        public Integer fiscalYear;
        public Integer fiscalQuarter;
        public Id ownerId;
        public Decimal historicAmount;
        public Decimal pipelineAmount;
        public Decimal closedWonAmount;
        public Decimal predictedAmount;
        public Decimal lowerBound;
        public Decimal upperBound;
        public String method;
        public Integer version;
        public Datetime snapshotAt;
        public String currencyIsoCode;
    }

    private static List<ForecastDTO> toDTOs(List<Forecast_Summary__c> rows) {
        List<ForecastDTO> out = new List<ForecastDTO>();
        for (Forecast_Summary__c r : rows) {
            ForecastDTO d = new ForecastDTO();
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

    // quarter helpers duplicate minimal logic to avoid exposing internals
    private static Date quarterStartForDate(Date d) {
        Integer q = ((d.month() - 1) / 3) + 1;
        Integer qStartMonth = ((q - 1) * 3) + 1;
        return Date.newInstance(d.year(), qStartMonth, 1);
    }
    private static Integer quarterNumberFromDate(Date d) {
        return ((d.month() - 1) / 3) + 1;
    }

    private static Integer parseIntOrDefault(String s, Integer defVal) {
        try { return (s == null) ? defVal : Integer.valueOf(s); }
        catch (Exception e) { return defVal; }
    }
}
