# Named Credential Setup Guide

## Overview
This guide provides step-by-step instructions for setting up Named Credentials in Salesforce for the Finance Data Callout API integration.

---

## Why Named Credentials?

✅ **Security**: API keys stored securely, not in code
✅ **Reusability**: Multiple classes can use the same credential
✅ **Auditability**: Callouts are logged and auditable
✅ **Authentication**: Supports OAuth, Basic Auth, etc.
✅ **Production-Ready**: Recommended Salesforce best practice

---

## Setup Steps

### Step 1: Create Named Credential

1. **Login to Salesforce Org**
   - Production or Sandbox environment

2. **Navigate to Named Credentials**
   - Setup → Integrations → Named Credentials → New Named Credential

3. **Fill in Details**
   ```
   Label:                     FinanceDataAPI
   Name:                      FinanceDataAPI
   URL:                       https://real-time-finance-data.p.rapidapi.com
   Identity Type:             Per User
   Authentication Protocol:   Existing Custom Headers
   Require HttpsConnection:   ☑ (checked)
   ```

4. **Add Custom Headers**
   - Click "Add" under Custom Headers section
   - **Header Name**: `x-rapidapi-host`
   - **Header Value**: `real-time-finance-data.p.rapidapi.com`
   - Click "Add" again for second header
   - **Header Name**: `x-rapidapi-key`
   - **Header Value**: `98180e14d0msh15467eb1b934608p1cd0cajsn3c696a3b2fbb`

5. **Save**
   - Click "Save"
   - Note: You should now see "FinanceDataAPI" in Named Credentials list

### Step 2: Verify Setup

1. **Test Connection** (Optional)
   - Click on "FinanceDataAPI"
   - Click "Test"
   - You should see "Test successful" message

2. **Confirm in Code**
   ```apex
   // The code already uses:
   private static final String NAMED_CREDENTIAL = 'callout:FinanceDataAPI';
   
   // This matches our Named Credential Label
   ```

### Step 3: Whitelist Endpoint (If Using IP Restrictions)

If your organization has IP restrictions:

1. **Setup → Security → Remote Site Settings**
2. **Add Remote Site Setting**
   ```
   Remote Site Name:    FinanceDataAPI
   Remote Site URL:     https://real-time-finance-data.p.rapidapi.com
   Description:         RapidAPI Finance Data Integration
   Disable Protocol:    ☐ (unchecked)
   ```
3. **Save**

---

## API Key Security

### Current Implementation
```apex
// ✅ SECURE: Using Named Credentials
private static final String NAMED_CREDENTIAL = 'callout:FinanceDataAPI';

// API key is in Named Credential, not hardcoded
// Usage:
req.setEndpoint(NAMED_CREDENTIAL + SEARCH_ENDPOINT + '?query=' + stock);
```

### Why Not Hardcoded?
```apex
// ❌ INSECURE: Do NOT do this
private static final String RAPIDAPI_KEY = '98180e14d0msh15467eb1b934608p1cd0cajsn3c696a3b2fbb';
// Reasons:
// - Visible in version control
// - Visible in org-wide source code
// - Can be easily compromised
// - Not auditable
// - Difficult to rotate
```

---

## Using Named Credentials in Code

### Basic Usage
```apex
// In FinanceDataCallout.cls
private static final String NAMED_CREDENTIAL = 'callout:FinanceDataAPI';

// Making callout
HttpRequest req = new HttpRequest();
req.setEndpoint(NAMED_CREDENTIAL + SEARCH_ENDPOINT + '?query=' + stock);
req.setMethod('GET');
req.setHeader('Content-Type', 'application/json');

Http http = new Http();
HttpResponse response = http.send(req);
```

### Multiple Endpoints with Same Credential
```apex
// Endpoint 1: Search
String searchUrl = NAMED_CREDENTIAL + '/search?query=AAPL';

// Endpoint 2: Trending
String trendingUrl = NAMED_CREDENTIAL + '/trending';

// Both use the same Named Credential with same headers
```

### Custom Headers (Optional)
```apex
// Additional headers can still be added
req.setHeader('Accept', 'application/json');
req.setHeader('User-Agent', 'Salesforce/1.0');

// Named Credential headers are automatically included
```

---

## Troubleshooting

### Issue 1: "Callout error: Connection Failure"

**Diagnosis**:
```bash
1. Check if Named Credential exists
2. Check if URL is correct
3. Check if API key is valid
```

**Solution**:
```
1. Setup → Named Credentials
2. Verify "FinanceDataAPI" exists
3. Click it to view details
4. Verify:
   - URL: https://real-time-finance-data.p.rapidapi.com
   - Header: x-rapidapi-key has valid key
   - Header: x-rapidapi-host = real-time-finance-data.p.rapidapi.com
```

### Issue 2: "Remote Site Not Configured"

**Diagnosis**:
```apex
// Error in logs like:
// "Callout to a URL that has not been registered in a Remote Site Setting"
```

**Solution**:
```
1. Setup → Security → Remote Site Settings
2. Click "New Remote Site"
3. Fill:
   Remote Site Name: FinanceDataAPI
   Remote Site URL: https://real-time-finance-data.p.rapidapi.com
4. Save
```

### Issue 3: "Named Credential Not Found"

**Code Issue**:
```apex
// Wrong: 
req.setEndpoint('callout:FinanceDataApi'); // Different casing

// Correct:
req.setEndpoint('callout:FinanceDataAPI'); // Match exactly
```

**Solution**:
- Verify exact spelling: `FinanceDataAPI`
- Check for typos
- Case-sensitive!

### Issue 4: "Invalid API Key"

**Diagnosis**:
```
API returns 401 Unauthorized
```

**Solution**:
```
1. Get new API key from RapidAPI dashboard
2. Setup → Named Credentials → FinanceDataAPI
3. Edit the credential
4. Update Header: x-rapidapi-key with new value
5. Save
6. Test again
```

---

## Testing Named Credential

### Method 1: Anonymous Apex
```apex
// Execute in Execute Anonymous
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:FinanceDataAPI/search?query=AAPL');
req.setMethod('GET');
req.setHeader('Content-Type', 'application/json');

Http http = new Http();
HttpResponse response = http.send(req);

System.debug('Status: ' + response.getStatusCode());
System.debug('Body: ' + response.getBody());
```

### Method 2: Unit Tests
```apex
// Already included in FinanceDataCalloutTest.cls
@isTest
static void testSearchStockData() {
    Test.setMock(HttpCalloutMock.class, new FinanceDataMock(...));
    
    List<String> stocks = new List<String>{ 'AAPL' };
    Map<String, String> results = FinanceDataCallout.searchStockDataBulk(stocks);
    
    System.assertNotEquals(null, results);
}
```

### Method 3: Manual Test
```
1. Deploy code to org
2. Go to Developer Console
3. Execute Anonymous:
   List<String> stocks = new List<String>{ 'AAPL' };
   Map<String, String> results = FinanceDataCallout.searchStockDataBulk(stocks);
   System.debug(results);
4. Check logs for:
   - "Successfully processed" message
   - Actual API response
```

---

## Security Best Practices

### 1. Restrict API Key Access
```
Setup → Session Settings
- Set "Session lifetime" appropriately
- Enable "Lock sessions to IP restrictions"
- Enable "Security token required for API"
```

### 2. Audit Callouts
```
Setup → Monitoring → API Usage
- Monitor callout frequency
- Watch for unusual patterns
- Set up alerts for high usage
```

### 3. Rotate Keys Regularly
```
Process:
1. Generate new API key in RapidAPI
2. Update Named Credential with new key
3. Test thoroughly
4. Deactivate old key in RapidAPI
5. Document change
```

### 4. Use IP Whitelisting
```
RapidAPI Dashboard:
1. Go to your app settings
2. Enable IP whitelist
3. Add Salesforce IP ranges
4. Verify callouts still work
```

---

## Named Credential vs Custom Metadata

### Named Credential (Used Here) ✅
```
Pros:
- Built-in Salesforce feature
- Secure storage
- Easy to use
- Supports multiple auth types
- UI-based management

Cons:
- No versioning
- Limited to per-user or system wide
- UI-only configuration
```

### Custom Metadata (Alternative)
```
Pros:
- Can be deployed via code
- Versioning support
- More flexible

Cons:
- More complex setup
- Not recommended for secrets
- Requires additional setup
```

---

## Multi-Org Deployment

### Sandbox to Production

**Step 1: Create in Sandbox**
- Follow setup steps above in Sandbox

**Step 2: Deploy to Production**
```bash
# If using package.xml
sf project deploy start --manifest manifest/package.xml --target-org prod

# Note: Named Credentials must be manually created in prod
# They are NOT included in deployment
```

**Step 3: Recreate in Production**
- Repeat setup steps in Production org
- Use same label: `FinanceDataAPI`
- Use same headers
- Use Production API key

**Step 4: Test**
```bash
sf apex run test --class-names FinanceDataCalloutTest --target-org prod
```

---

## FAQ

**Q: Can multiple orgs share the same API key?**
A: Yes, but each org needs its own Named Credential with the same key.

**Q: What if we need multiple API endpoints?**
A: Create multiple Named Credentials (e.g., FinanceDataAPI, StockPriceAPI)

**Q: Can I use same credential for different environments?**
A: Yes, but recommend using environment-specific API keys for security.

**Q: How often should I rotate API keys?**
A: Quarterly recommended, or immediately if compromised.

**Q: Does Named Credential affect callout limits?**
A: No, governor limits are same regardless of credential type.

---

## Reference

- [Salesforce Named Credentials Documentation](https://help.salesforce.com/s/articleView?id=sf.named_credentials_overview.htm)
- [Remote Site Settings](https://help.salesforce.com/s/articleView?id=sf.security_remote_site_settings.htm)
- [HTTP Callout Best Practices](https://help.salesforce.com/s/articleView?id=sf.apex_callouts_best_practices.htm)

---

**Setup Time**: ~10 minutes
**Difficulty**: Easy
**Required Access**: System Administrator
