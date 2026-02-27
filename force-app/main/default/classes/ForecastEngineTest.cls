@IsTest
private class ForecastEngineTest {

    @TestSetup
    static void setupData() {
        // Create 2 users to act as Opportunity Owners
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User u1 = new User(
            Alias = 'ownr1',
            Email = 'owner1@example.test',
            EmailEncodingKey = 'UTF-8',
            LastName = 'OwnerOne',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/Los_Angeles',
            Username = 'owner1+' + System.currentTimeMillis() + '@example.test',
            ProfileId = p.Id
        );
        User u2 = new User(
            Alias = 'ownr2',
            Email = 'owner2@example.test',
            EmailEncodingKey = 'UTF-8',
            LastName = 'OwnerTwo',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/Los_Angeles',
            Username = 'owner2+' + System.currentTimeMillis() + '@example.test',
            ProfileId = p.Id
        );
        insert new List<User>{ u1, u2 };

        // Create simple Opportunities for past quarters for u1
        Date anchor = Date.today();
        Date qStart = quarterStartForDate(anchor);
        List<Opportunity> opps = new List<Opportunity>();
        // 3 prior quarters with some amounts and wins for pattern
        for (Integer i = 1; i <= 3; i++) {
            Date closeDt = qStart.addMonths(-3 * i).addDays(15);
            opps.add(new Opportunity(
                Name = 'Opp U1 Q-' + i,
                StageName = 'Closed Won',
                CloseDate = closeDt,
                Amount = 10000 * i,
                OwnerId = u1.Id
            ));
            opps.add(new Opportunity(
                Name = 'Pipe U1 Q-' + i,
                StageName = 'Prospecting',
                CloseDate = closeDt,
                Amount = 5000 * i,
                OwnerId = u1.Id
            ));
        }
        // A couple of records for u2 as well
        for (Integer i = 1; i <= 2; i++) {
            Date closeDt = qStart.addMonths(-3 * i).addDays(10);
            opps.add(new Opportunity(
                Name = 'Opp U2 Q-' + i,
                StageName = 'Closed Won',
                CloseDate = closeDt,
                Amount = 7000 * i,
                OwnerId = u2.Id
            ));
        }
        insert opps;
    }

    @IsTest
    static void testGenerateForecast() {
        User u1 = [SELECT Id FROM User WHERE Alias = 'ownr1' LIMIT 1];
        ForecastEngine.GenerateRequest req = new ForecastEngine.GenerateRequest();
        req.anchorDate = Date.today();
        req.horizonQuarters = 4;
        req.includeSeasonality = true;
        req.ownerIds = new Set<Id>{ u1.Id };

        Test.startTest();
        ForecastEngine.GenerateResponse resp = ForecastEngine.generate(req);
        Test.stopTest();

        System.assertNotEquals(null, resp, 'Response should not be null');
        System.assertEquals(4, resp.points.size(), 'Should predict next 4 quarters');
        for (ForecastEngine.ForecastPoint p : resp.points) {
            System.assertNotEquals(null, p.predictedAmount, 'Predicted must be populated');
            System.assert(p.predictedAmount >= 0, 'Predicted non-negative');
            System.assertNotEquals(null, p.fiscalQuarter, 'Quarter populated');
            System.assertEquals(u1.Id, p.ownerId, 'Owner matches');
        }
    }

    @IsTest
    static void testUpsertSummaries() {
        User u1 = [SELECT Id FROM User WHERE Alias = 'ownr1' LIMIT 1];
        ForecastEngine.GenerateRequest req = new ForecastEngine.GenerateRequest();
        req.anchorDate = Date.today();
        req.horizonQuarters = 2;
        req.includeSeasonality = true;
        req.ownerIds = new Set<Id>{ u1.Id };

        ForecastEngine.GenerateResponse resp = ForecastEngine.generate(req);

        Test.startTest();
        ForecastEngine.upsertSummaries(resp.points);
        Test.stopTest();

        List<Forecast_Summary__c> rows = [
            SELECT Id, NaturalKey__c, Owner__c, PeriodStartDate__c, PredictedAmount__c
            FROM Forecast_Summary__c
            WHERE Owner__c = :u1.Id
            ORDER BY PeriodStartDate__c
        ];
        System.assertEquals(2, rows.size(), 'Two summary rows should be persisted');
        // Idempotency check: upsert same points again
        Test.startTest();
        ForecastEngine.upsertSummaries(resp.points);
        Test.stopTest();
        Integer afterCount = [SELECT COUNT() FROM Forecast_Summary__c WHERE Owner__c = :u1.Id];
        System.assertEquals(2, afterCount, 'Upsert must not duplicate rows');
    }

    @IsTest
    static void testBatchAndScheduler() {
        // Run batch end-to-end
        Test.startTest();
        Id jobId = Database.executeBatch(new ForecastBatch(Date.today(), 2, true), 50);
        Test.stopTest();
        System.assertNotEquals(null, jobId, 'Batch job id should be returned');

        // Schedule once
        Test.startTest();
        Id schedId = ForecastScheduler.scheduleJob('ForecastSchedTest', '0 0 2 * * ?');
        Test.stopTest();
        System.assertNotEquals(null, schedId, 'Schedule Id should be returned');
    }

    private static Date quarterStartForDate(Date d) {
        Integer q = ((d.month() - 1) / 3) + 1;
        Integer qStartMonth = ((q - 1) * 3) + 1;
        return Date.newInstance(d.year(), qStartMonth, 1);
    }
}
