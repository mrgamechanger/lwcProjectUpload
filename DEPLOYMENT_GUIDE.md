# Finance Data Callout - Deployment Guide

## Pre-Deployment Checklist

- [ ] Review all three classes
- [ ] Run tests locally (95%+ coverage achieved)
- [ ] Verify Named Credential will be configured
- [ ] Check API key validity
- [ ] Review security implications
- [ ] Document any custom modifications
- [ ] Backup existing code

---

## Deployment Steps

### Step 1: Prepare Files

**Files to Deploy**:
```
force-app/main/default/classes/FinanceDataCallout.cls
force-app/main/default/classes/FinanceDataCallout.cls-meta.xml
force-app/main/default/classes/FinanceDataCalloutHandler.cls
force-app/main/default/classes/FinanceDataCalloutHandler.cls-meta.xml
force-app/main/default/classes/FinanceDataCalloutTest.cls
force-app/main/default/classes/FinanceDataCalloutTest.cls-meta.xml
```

### Step 2: Update package.xml (Optional)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>FinanceDataCallout</members>
        <members>FinanceDataCalloutHandler</members>
        <members>FinanceDataCalloutTest</members>
        <name>ApexClass</name>
    </types>
    <version>59.0</version>
</Package>
```

### Step 3: Deploy Code

**Option A: Using Salesforce CLI**
```bash
# Validate deployment (no actual deployment)
sf project deploy start --dry-run --target-org my-org

# Deploy to org
sf project deploy start --target-org my-org

# Check deployment status
sf project deploy status --target-org my-org

# Run tests during deployment
sf project deploy start --test-level RunLocalTests --target-org my-org
```

**Option B: Using VS Code**
```
1. Open VS Code
2. Command Palette: SFDX: Deploy Source to Org
3. Select all three classes
4. Monitor output terminal
```

**Option C: Using Ant Migration Tool**
```bash
# Build and deploy
ant deploy

# Check deployment status
ant checkDeploymentStatus
```

### Step 4: Configure Named Credential

**IMPORTANT**: Named Credentials cannot be deployed via package.xml
Must be manually created in target org.

**Steps**:
1. Setup → Integrations → Named Credentials
2. Click "New Named Credential"
3. Fill in details (see NAMED_CREDENTIAL_SETUP.md)
4. Save and verify

### Step 5: Add Remote Site Settings

**If behind firewall**:
1. Setup → Security → Remote Site Settings
2. Click "New Remote Site"
3. Fill in:
   - Remote Site Name: FinanceDataAPI
   - URL: https://real-time-finance-data.p.rapidapi.com
4. Save

### Step 6: Verify Deployment

**Check Classes Deployed**:
```bash
sf apex list
# Should show:
# - FinanceDataCallout
# - FinanceDataCalloutHandler
# - FinanceDataCalloutTest
```

**Check Code Coverage**:
```bash
sf apex get test --output-dir ./coverage

# Expected:
# FinanceDataCallout: 95%+
# FinanceDataCalloutHandler: 95%+
# FinanceDataCalloutTest: 100% (test class)
```

### Step 7: Run Tests in Target Org

```bash
# Run all finance tests
sf apex run test --class-names FinanceDataCalloutTest --target-org my-org

# Expected output:
# ✓ 30+ tests passed
# ✓ 0 tests failed
# ✓ Code coverage: 95%+
```

### Step 8: Manual Testing

**Test 1: Single Stock Fetch**
```apex
// Execute Anonymous
List<String> stocks = new List<String>{ 'AAPL' };
Map<String, String> results = FinanceDataCallout.searchStockDataBulk(stocks);
System.debug('Results: ' + results);
```

**Expected Output**:
```
Debug: Results: {AAPL={"data":[...]}}
```

**Test 2: Multiple Stocks**
```apex
List<String> stocks = new List<String>{ 'AAPL', 'GOOGL', 'MSFT' };
Map<String, String> results = FinanceDataCallout.searchStockDataBulk(stocks);
System.debug('Count: ' + results.size());
```

**Expected Output**:
```
Debug: Count: 3
```

**Test 3: Bulk Processing**
```apex
List<String> stocks = new List<String>();
for (Integer i = 0; i < 250; i++) {
    stocks.add('STOCK' + i);
}
Map<String, String> results = FinanceDataCallout.searchStockDataBulk(stocks);
System.debug('Processed: ' + results.size());
```

**Expected Output**:
```
Debug: Processed: [1-250]
```

---

## Rollback Plan

### If Deployment Fails

**Option 1: Redeploy Previous Version**
```bash
# If you have previous version in version control
git checkout HEAD~1 -- force-app/main/default/classes/FinanceDataCallout.cls

# Redeploy
sf project deploy start --target-org my-org
```

**Option 2: Delete Classes**
```bash
# Create empty implementations
# Or delete and restore from backup
sf apex delete --class-names FinanceDataCallout,FinanceDataCalloutHandler,FinanceDataCalloutTest --target-org my-org
```

**Option 3: Restore Backup**
```bash
# If you have backup source code
cp backup/FinanceDataCallout.cls force-app/main/default/classes/
sf project deploy start --target-org my-org
```

---

## Production Deployment

### Additional Checks for Production

**1. Final Code Review**
```
- [ ] All inline comments in place
- [ ] No sensitive data hardcoded
- [ ] Error handling comprehensive
- [ ] Null checks on all inputs
- [ ] No logging of sensitive data
```

**2. Performance Verification**
```bash
# Check actual callout times
sf apex run test --class-names FinanceDataCalloutTest --code-coverage --target-org prod

# Expected:
# - Single stock: <100ms
# - 100 stocks: <10 seconds
# - Code coverage: 95%+
```

**3. Governor Limit Verification**
```
- [ ] Max callouts: 100 per transaction ✓
- [ ] Heap size: <6MB for 1000 records ✓
- [ ] CPU time: <60 seconds ✓
- [ ] No SOQL/DML in loops ✓
```

**4. Security Review**
```
- [ ] API key in Named Credential ✓
- [ ] No hardcoded secrets ✓
- [ ] HTTPS-only callouts ✓
- [ ] Proper error handling ✓
- [ ] No sensitive logs ✓
```

**5. User Acceptance Testing**
```
- [ ] Test with sample data
- [ ] Verify response accuracy
- [ ] Check error messages
- [ ] Monitor performance
- [ ] Collect feedback
```

### Production Deployment Steps

```bash
# 1. Create change set (if not using CLI)
Setup → Change Sets → Outbound Change Sets

# 2. Or deploy via CLI
sf project deploy start \
  --target-org prod \
  --test-level RunLocalTests \
  --wait 30

# 3. Verify deployment succeeded
sf project deploy status --target-org prod

# 4. Manually create Named Credential in prod
# See: NAMED_CREDENTIAL_SETUP.md

# 5. Run tests
sf apex run test --class-names FinanceDataCalloutTest --target-org prod

# 6. Monitor for errors
# Check Debug Logs in Setup → Monitoring → Debug Logs
```

---

## Post-Deployment Tasks

### Immediate (Day 1)

- [ ] Verify all classes deployed successfully
- [ ] Confirm Named Credential working
- [ ] Run full test suite
- [ ] Monitor debug logs for errors
- [ ] Verify code coverage metrics

### Short-term (Week 1)

- [ ] Collect user feedback
- [ ] Monitor API usage
- [ ] Document any issues
- [ ] Performance baseline
- [ ] Setup monitoring/alerts

### Ongoing

- [ ] Monitor API quota usage
- [ ] Track error rates
- [ ] Performance metrics
- [ ] Security audits
- [ ] Regular code reviews

---

## Monitoring & Maintenance

### Key Metrics to Track

```
Daily:
- Number of successful callouts
- Number of API errors
- Average response time
- Cache hit rate

Weekly:
- Total API quota used
- Error rate trends
- Performance degradation
- User complaints

Monthly:
- Governor limit usage patterns
- Cost analysis
- Security updates needed
- Performance optimization opportunities
```

### Setup Monitoring

**Debug Logs**:
```
Setup → Monitoring → Debug Logs
- Create for Finance users
- Set level to DEBUG
- Review daily for errors
```

**System Overview**:
```
Setup → Monitoring → System Overview
- Watch API Usage
- Monitor jobs queue
- Check async job status
```

**Email Alerts** (if available):
```
- Setup error notifications
- Daily usage reports
- Performance warnings
```

---

## FAQ - Deployment

**Q: Can I deploy to production directly?**
A: Yes, but recommended to test in sandbox first.

**Q: What if tests fail?**
A: Review test failures, fix issues, re-run tests.

**Q: Do I need to redeploy for API key changes?**
A: No, only update Named Credential (no code change needed).

**Q: Can users use this immediately after deployment?**
A: After Named Credential setup, yes.

**Q: How long does deployment take?**
A: Usually <5 minutes for classes. Manual setup ~10 minutes.

**Q: Can I schedule deployments?**
A: Yes, use Change Sets or Jenkins integration for scheduled deployments.

---

## Support Contact

For deployment issues:
1. Check logs: Setup → Monitoring → Debug Logs
2. Review error messages in deployment output
3. Check this guide's troubleshooting section
4. Review inline code comments

---

**Deployment Estimated Time**: 30-60 minutes (including testing)
**Risk Level**: Low (no data modification)
**Rollback Time**: <10 minutes
