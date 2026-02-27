/**
 * @description ForecastEngine computes quarterly owner-level forecasts using a weighted moving average (WMA v1)
 * with optional seasonality and confidence bounds. Multi-currency aware: aggregates and predicts in corporate currency,
 * but persists in record currency via DML currency conversion handled by platform when CurrencyIsoCode is set.
 *
 * Design:
 * - Public facade methods for batch and LWC usage
 * - Efficient SOQL with selective filters and indexed fields
 * - No hard-coded IDs
 * - Safe for large datasets: aggregation happens in Apex using maps and key structs
 *
 * Security:
 * - No with sharing here; aggregations run in system context by batch. Read filtering must be done by caller if needed.
 *
 * Dependencies:
 * - Forecast_Summary__c custom object
 */
public class ForecastEngine {

    public class QuarterKey {
        public Date periodStart; // first day of fiscal quarter (or calendar quarter fallback)
        public Id ownerId;

        public QuarterKey(Date periodStart, Id ownerId) {
            this.periodStart = periodStart;
            this.ownerId = ownerId;
        }

        public override Boolean equals(Object obj) {
            if (obj == null || !(obj instanceof QuarterKey)) return false;
            QuarterKey other = (QuarterKey) obj;
            return this.periodStart == other.periodStart && this.ownerId == other.ownerId;
        }
        public override Integer hashCode() {
            return String.valueOf(periodStart) + String.valueOf(ownerId).hashCode();
        }
    }

    public class ForecastPoint {
        @AuraEnabled public Date periodStart;
        @AuraEnabled public Integer fiscalYear;
        @AuraEnabled public Integer fiscalQuarter;
        @AuraEnabled public Id ownerId;
        @AuraEnabled public Decimal historicAmount;
        @AuraEnabled public Decimal pipelineAmount;
        @AuraEnabled public Decimal closedWonAmount;
        @AuraEnabled public Decimal predictedAmount;
        @AuraEnabled public Decimal lowerBound;
        @AuraEnabled public Decimal upperBound;
        @AuraEnabled public String currencyIsoCode;
        @AuraEnabled public String method;
        @AuraEnabled public Integer version;
    }

    public class GenerateRequest {
        @AuraEnabled public Date anchorDate; // base date to compute next 4 quarters from; defaults to today
        @AuraEnabled public Set<Id> ownerIds; // optional scope. Null/empty = all active opportunity owners
        @AuraEnabled public Integer horizonQuarters; // default 4
        @AuraEnabled public Boolean includeSeasonality; // default true
        @AuraEnabled public String currencyIsoCode; // optional target currency for aggregation. If null, use corporate currency
    }

    public class GenerateResponse {
        @AuraEnabled public List<ForecastPoint> points;
        @AuraEnabled public Datetime snapshotAt;
        @AuraEnabled public String method;
        @AuraEnabled public Integer version;
    }

    private static final Integer MODEL_VERSION = 1;
    private static final String METHOD = 'WMA_v1';

    /**
     * Public entry: compute and return forecast points without DML.
     */
    @AuraEnabled(cacheable=false)
    public static GenerateResponse generate(GenerateRequest req) {
        Validate.notNull(req, 'Request is required');
        Date anchor = (req.anchorDate == null) ? Date.today() : req.anchorDate;
        Integer horizon = (req.horizonQuarters == null || req.horizonQuarters <= 0) ? 4 : req.horizonQuarters;
        Boolean seasonality = (req.includeSeasonality == null) ? true : req.includeSeasonality;

        // Determine quarter starts for window: past 8 quarters for training + next horizon for prediction
        List<Date> quarterStartsHistory = computeHistoricalQuarterStarts(anchor, 8);
        List<Date> quarterStartsFuture = computeFutureQuarterStarts(anchor, horizon);

        // Build owner scope
        Set<Id> ownerScope = (req.ownerIds == null) ? new Set<Id>() : req.ownerIds.clone();

        // Pull opportunity aggregates by owner and quarter
        Map<QuarterKey, AggregateResult> histAgg = aggregateOpportunitiesByQuarter(quarterStartsHistory, ownerScope);

        // Convert aggregates into feature series per owner
        Map<Id, List<ForecastPoint>> ownerSeries = buildOwnerSeries(histAgg);

        // Compute predictions for each owner over future quarters
        List<ForecastPoint> out = new List<ForecastPoint>();
        for (Id oid : ownerSeries.keySet()) {
            List<ForecastPoint> series = ownerSeries.get(oid);
            Map<Date, ForecastPoint> future = predictForOwner(oid, series, quarterStartsFuture, seasonality);
            out.addAll(future.values());
        }

        // Ensure currency code is set; platform will convert to user/org currency as needed in UI
        for (ForecastPoint fp : out) {
            fp.method = METHOD;
            fp.version = MODEL_VERSION;
            if (fp.currencyIsoCode == null) fp.currencyIsoCode = UserInfo.getDefaultCurrency();
        }

        GenerateResponse resp = new GenerateResponse();
        resp.points = out;
        resp.snapshotAt = System.now();
        resp.method = METHOD;
        resp.version = MODEL_VERSION;
        return resp;
    }

    /**
     * Upsert forecast points into Forecast_Summary__c with NaturalKey__c = OwnerId + ':' + YYYY 'Q' QN
     */
    public static void upsertSummaries(List<ForecastPoint> points) {
        if (points == null || points.isEmpty()) return;
        List<Forecast_Summary__c> rows = new List<Forecast_Summary__c>();
        for (ForecastPoint p : points) {
            String nk = buildNaturalKey(p.ownerId, p.periodStart);
            Forecast_Summary__c fs = new Forecast_Summary__c();
            fs.Grain__c = 'Quarter';
            fs.PeriodStartDate__c = p.periodStart;
            fs.FiscalYear__c = p.fiscalYear;
            fs.FiscalQuarter__c = p.fiscalQuarter;
            fs.Owner__c = p.ownerId;
            fs.HistoricAmount__c = p.historicAmount;
            fs.PipelineAmount__c = p.pipelineAmount;
            fs.ClosedWonAmount__c = p.closedWonAmount;
            fs.PredictedAmount__c = p.predictedAmount;
            fs.LowerBound__c = p.lowerBound;
            fs.UpperBound__c = p.upperBound;
            fs.Method__c = p.method;
            fs.Version__c = p.version;
            fs.SnapshotDateTime__c = System.now();
            fs.NaturalKey__c = nk;
            if (Schema.sObjectType.Forecast_Summary__c.fields.getMap().containsKey('CurrencyIsoCode') && p.currencyIsoCode != null) {
                fs.put('CurrencyIsoCode', p.currencyIsoCode);
            }
            rows.add(fs);
        }
        Database.UpsertResult[] res = Database.upsert(rows, Forecast_Summary__c.Fields.NaturalKey__c, false);
        // Minimal logging only on failures
        List<Database.Error> errs = new List<Database.Error>();
        for (Database.UpsertResult r : res) {
            if (!r.isSuccess()) errs.addAll(r.getErrors());
        }
        if (!errs.isEmpty()) {
            throw new AuraHandledException('Forecast upsert failed: ' + errs[0].getMessage());
        }
    }

    // --------- Aggregation and Prediction internals ---------

    private static Map<QuarterKey, AggregateResult> aggregateOpportunitiesByQuarter(List<Date> quarterStarts, Set<Id> ownerScope) {
        if (quarterStarts.isEmpty()) return new Map<QuarterKey, AggregateResult>();
        Date minD = quarterStarts[0];
        Date maxD = quarterStarts[quarterStarts.size()-1].addMonths(3).addDays(-1);

        String ownerFilter = (ownerScope == null || ownerScope.isEmpty()) ? '' : ' AND OwnerId IN :ownerScope';
        // Using CloseDate for quarterly bucket and IsClosed/IsWon for aggregation
        List<AggregateResult> rows = [
            SELECT OwnerId ownerId,
                   CALENDAR_QUARTER(CloseDate) qn,
                   CALENDAR_YEAR(CloseDate) yn,
                   SUM(CASE WHEN IsClosed = false THEN Amount ELSE 0 END) pipelineAmt,
                   SUM(CASE WHEN IsWon = true THEN Amount ELSE 0 END) wonAmt
            FROM Opportunity
            WHERE CloseDate >= :minD AND CloseDate <= :maxD
                  AND IsDeleted = false
                  AND Amount != null
                  /* dynamic owner filter */ 
                  /* placeholder */
            GROUP BY OwnerId, CALENDAR_YEAR(CloseDate), CALENDAR_QUARTER(CloseDate)
        ];
        // Note: cannot inline dynamic filter easily in static SOQL; re-run with two paths
        if (ownerFilter != '') {
            rows = [
                SELECT OwnerId ownerId,
                       CALENDAR_QUARTER(CloseDate) qn,
                       CALENDAR_YEAR(CloseDate) yn,
                       SUM(CASE WHEN IsClosed = false THEN Amount ELSE 0 END) pipelineAmt,
                       SUM(CASE WHEN IsWon = true THEN Amount ELSE 0 END) wonAmt
                FROM Opportunity
                WHERE CloseDate >= :minD AND CloseDate <= :maxD
                      AND IsDeleted = false
                      AND Amount != null
                      AND OwnerId IN :ownerScope
                GROUP BY OwnerId, CALENDAR_YEAR(CloseDate), CALENDAR_QUARTER(CloseDate)
            ];
        }

        Map<QuarterKey, AggregateResult> out = new Map<QuarterKey, AggregateResult>();
        for (AggregateResult ar : rows) {
            Integer y = (Integer) ar.get('yn');
            Integer q = (Integer) ar.get('qn');
            Date start = quarterStartForCalendar(y, q);
            Id oid = (Id) ar.get('ownerId');
            QuarterKey key = new QuarterKey(start, oid);
            out.put(key, ar);
        }
        return out;
    }

    private static Map<Id, List<ForecastPoint>> buildOwnerSeries(Map<QuarterKey, AggregateResult> histAgg) {
        Map<Id, List<ForecastPoint>> mapByOwner = new Map<Id, List<ForecastPoint>>();
        for (QuarterKey k : histAgg.keySet()) {
            AggregateResult ar = histAgg.get(k);
            Decimal pipeline = (Decimal) ar.get('pipelineAmt');
            Decimal won = (Decimal) ar.get('wonAmt');
            Date ps = k.periodStart;
            Integer y = ps.year();
            Integer q = quarterNumberFromDate(ps);
            ForecastPoint fp = new ForecastPoint();
            fp.periodStart = ps;
            fp.fiscalYear = y;
            fp.fiscalQuarter = q;
            fp.ownerId = k.ownerId;
            fp.pipelineAmount = pipeline;
            fp.closedWonAmount = won;
            fp.historicAmount = won;
            mapByOwner.putIfAbsent(k.ownerId, new List<ForecastPoint>());
            mapByOwner.get(k.ownerId).add(fp);
        }
        // sort each owner's series by period
        for (Id oid : mapByOwner.keySet()) {
            mapByOwner.get(oid).sort(new ComparatorByPeriod());
        }
        return mapByOwner;
    }

    private class ComparatorByPeriod implements System.Comparator<ForecastPoint> {
        public Integer compare(ForecastPoint a, ForecastPoint b) {
            if (a.periodStart == b.periodStart) return 0;
            return a.periodStart < b.periodStart ? -1 : 1;
        }
    }

    private static Map<Date, ForecastPoint> predictForOwner(Id ownerId, List<ForecastPoint> history, List<Date> futureStarts, Boolean seasonality) {
        Map<Date, ForecastPoint> out = new Map<Date, ForecastPoint>();
        if (futureStarts.isEmpty()) return out;

        // Build series of totals per quarter from history: closedWon + pipeline as proxy for total
        List<Decimal> histTotals = new List<Decimal>();
        List<Date> histPeriods = new List<Date>();
        for (ForecastPoint h : history) {
            Decimal total = (h.closedWonAmount == null ? 0 : h.closedWonAmount) + (h.pipelineAmount == null ? 0 : h.pipelineAmount);
            histTotals.add(total);
            histPeriods.add(h.periodStart);
        }

        // Weighted moving average weights: most recent gets highest weight
        List<Decimal> weights = new List<Decimal>{0.5, 0.3, 0.2}; // 3-quarter WMA
        Integer wlen = weights.size();

        // Compute baseline mean and std dev for simple confidence bands
        Decimal mean = 0, variance = 0;
        if (!histTotals.isEmpty()) {
            for (Decimal v : histTotals) mean += v;
            mean = mean / histTotals.size();
            for (Decimal v2 : histTotals) variance += (v2 - mean) * (v2 - mean);
            variance = (histTotals.size() > 1) ? variance / (histTotals.size() - 1) : 0;
        }
        Decimal stddev = (variance > 0) ? Decimal.valueOf(Math.sqrt((Double)variance)) : 0;

        for (Date fs : futureStarts) {
            // WMA over latest available quarters
            Decimal pred = 0;
            Integer count = 0;
            for (Integer i = 0; i < wlen; i++) {
                Integer idx = histTotals.size() - 1 - i;
                if (idx >= 0) {
                    pred += histTotals[idx] * weights[i];
                    count++;
                }
            }
            if (count == 0) pred = mean;

            if (seasonality == true) {
                // Simple seasonal adjustment: compare same quarter across years if available
                Integer qn = quarterNumberFromDate(fs);
                List<Decimal> sameQuarter = new List<Decimal>();
                for (Integer j = 0; j < histPeriods.size(); j++) {
                    if (quarterNumberFromDate(histPeriods[j]) == qn) sameQuarter.add(histTotals[j]);
                }
                if (!sameQuarter.isEmpty()) {
                    Decimal sqMean = 0;
                    for (Decimal v : sameQuarter) sqMean += v;
                    sqMean = sqMean / sameQuarter.size();
                    if (mean != 0) {
                        Decimal factor = sqMean / mean;
                        pred = pred * factor;
                    }
                }
            }

            ForecastPoint p = new ForecastPoint();
            p.periodStart = fs;
            p.fiscalYear = fs.year();
            p.fiscalQuarter = quarterNumberFromDate(fs);
            p.ownerId = ownerId;
            p.predictedAmount = pred.setScale(2);
            // Symmetric confidence interval using 1 std dev
            p.lowerBound = (pred - stddev).setScale(2);
            if (p.lowerBound < 0) p.lowerBound = 0;
            p.upperBound = (pred + stddev).setScale(2);
            out.put(fs, p);

            // Roll-forward history for next prediction step
            histTotals.add(pred);
            histPeriods.add(fs);
        }
        return out;
    }

    // --------- Quarter helpers ---------

    private static List<Date> computeHistoricalQuarterStarts(Date anchor, Integer quartersBack) {
        Date startQ = quarterStartForDate(anchor);
        List<Date> out = new List<Date>();
        for (Integer i = quartersBack; i > 0; i--) {
            out.add(startQ.addMonths(-3 * i));
        }
        return out;
    }

    private static List<Date> computeFutureQuarterStarts(Date anchor, Integer horizon) {
        Date startQ = quarterStartForDate(anchor);
        List<Date> out = new List<Date>();
        for (Integer i = 1; i <= horizon; i++) {
            out.add(startQ.addMonths(3 * i));
        }
        return out;
    }

    private static Date quarterStartForDate(Date d) {
        Integer q = ((d.month() - 1) / 3) + 1;
        Integer qStartMonth = ((q - 1) * 3) + 1;
        return Date.newInstance(d.year(), qStartMonth, 1);
    }

    private static Date quarterStartForCalendar(Integer yearNum, Integer quarterNum) {
        Integer qStartMonth = ((quarterNum - 1) * 3) + 1;
        return Date.newInstance(yearNum, qStartMonth, 1);
    }

    private static Integer quarterNumberFromDate(Date d) {
        return ((d.month() - 1) / 3) + 1;
    }

    private static String buildNaturalKey(Id ownerId, Date periodStart) {
        return String.valueOf(ownerId) + ':' + periodStart.year() + 'Q' + quarterNumberFromDate(periodStart);
    }

    // ---------- Minimal validation utility ----------
    private class Validate {
        static void notNull(Object o, String msg) {
            if (o == null) throw new AuraHandledException(msg);
        }
    }
}
