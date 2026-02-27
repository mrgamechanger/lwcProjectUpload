/**
 * FinanceDataCalloutHandler - Business Logic Handler for Finance Data Operations
 * API Version: 59.0
 * 
 * Purpose: Handles business logic for finance data processing
 * Responsibility: Transform, validate, and process API responses
 * 
 * Key Features:
 * - Parses JSON responses from finance API
 * - Validates and transforms data
 * - No SOQL/DML in loops (all operations are in-memory)
 * - Null-safe data handling
 * - Batch processing support for 10,000+ records
 * 
 * @author Salesforce Developer
 * @version 1.0
 * @since API 59.0
 */
public with sharing class FinanceDataCalloutHandler {
    
    // ============ CONSTANTS ============
    private static final String LOG_CLASS_NAME = 'FinanceDataCalloutHandler';
    private static final String JSON_KEY_SYMBOL = 'symbol';
    private static final String JSON_KEY_NAME = 'name';
    private static final String JSON_KEY_PRICE = 'price';
    private static final String JSON_KEY_CHANGE = 'change';
    private static final String JSON_KEY_CHANGE_PERCENT = 'changePercent';
    
    /**
     * Parse stock search response from API
     * NULL SAFETY: Handles missing fields gracefully
     * 
     * @param jsonResponse JSON response from API
     * @return Parsed stock data or empty list if parsing fails
     */
    public static List<StockData> parseStockSearchResponse(String jsonResponse) {
        List<StockData> stocks = new List<StockData>();
        
        try {
            // NULL SAFETY: Validate input
            if (String.isBlank(jsonResponse)) {
                logWarn('Empty JSON response received', LOG_CLASS_NAME);
                return stocks;
            }
            
            // Parse JSON response
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(jsonResponse);
            
            // NULL SAFETY: Check for null response map
            if (responseMap == null) {
                logWarn('Failed to deserialize response', LOG_CLASS_NAME);
                return stocks;
            }
            
            // Extract data array - handle different response formats
            List<Object> dataList = (List<Object>) responseMap.get('data');
            
            // NULL SAFETY: Check for null or empty data
            if (dataList == null || dataList.isEmpty()) {
                logDebug('No stock data found in response', LOG_CLASS_NAME);
                return stocks;
            }
            
            // BULKIFICATION: Process data list without SOQL/DML
            for (Object item : dataList) {
                try {
                    Map<String, Object> stockMap = (Map<String, Object>) item;
                    
                    // NULL SAFETY: Create stock data with null checks
                    StockData stock = new StockData();
                    stock.symbol = getString(stockMap, JSON_KEY_SYMBOL);
                    stock.name = getString(stockMap, JSON_KEY_NAME);
                    stock.price = getDecimal(stockMap, JSON_KEY_PRICE);
                    stock.change = getDecimal(stockMap, JSON_KEY_CHANGE);
                    stock.changePercent = getDecimal(stockMap, JSON_KEY_CHANGE_PERCENT);
                    
                    // Only add if we have at least a symbol
                    if (String.isNotBlank(stock.symbol)) {
                        stocks.add(stock);
                    }
                    
                } catch (Exception e) {
                    logError('Error parsing individual stock: ' + e.getMessage(), LOG_CLASS_NAME);
                    // Continue processing other stocks on error
                }
            }
            
            logDebug('Parsed ' + stocks.size() + ' stocks successfully', LOG_CLASS_NAME);
            return stocks;
            
        } catch (Exception e) {
            logError('Error parsing stock response: ' + e.getMessage(), LOG_CLASS_NAME);
            return stocks; // Return empty list on error
        }
    }
    
    /**
     * Parse trending stocks response
     * NULL SAFETY: Handles various response formats
     * 
     * @param jsonResponse JSON response from trending API
     * @return List of trending stocks
     */
    public static List<StockData> parseTrendingStocksResponse(String jsonResponse) {
        List<StockData> trendingStocks = new List<StockData>();
        
        try {
            // NULL SAFETY: Validate input
            if (String.isBlank(jsonResponse)) {
                logWarn('Empty trending response received', LOG_CLASS_NAME);
                return trendingStocks;
            }
            
            // Parse JSON response
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(jsonResponse);
            
            // NULL SAFETY: Check for null response
            if (responseMap == null) {
                logWarn('Failed to deserialize trending response', LOG_CLASS_NAME);
                return trendingStocks;
            }
            
            // Extract trending list
            List<Object> trendingList = (List<Object>) responseMap.get('trending');
            
            // NULL SAFETY: Handle missing trending field
            if (trendingList == null || trendingList.isEmpty()) {
                logDebug('No trending data in response', LOG_CLASS_NAME);
                return trendingStocks;
            }
            
            // BULKIFICATION: Process without SOQL/DML
            for (Object item : trendingList) {
                try {
                    Map<String, Object> stockMap = (Map<String, Object>) item;
                    
                    StockData stock = new StockData();
                    stock.symbol = getString(stockMap, JSON_KEY_SYMBOL);
                    stock.name = getString(stockMap, JSON_KEY_NAME);
                    stock.price = getDecimal(stockMap, JSON_KEY_PRICE);
                    stock.change = getDecimal(stockMap, JSON_KEY_CHANGE);
                    
                    if (String.isNotBlank(stock.symbol)) {
                        trendingStocks.add(stock);
                    }
                    
                } catch (Exception e) {
                    logError('Error parsing trending stock: ' + e.getMessage(), LOG_CLASS_NAME);
                    // Continue with other stocks
                }
            }
            
            return trendingStocks;
            
        } catch (Exception e) {
            logError('Error parsing trending response: ' + e.getMessage(), LOG_CLASS_NAME);
            return trendingStocks;
        }
    }
    
    /**
     * Validate stock data collection
     * 
     * @param stocks List of stocks to validate
     * @return True if valid, false otherwise
     */
    public static Boolean validateStockData(List<StockData> stocks) {
        if (stocks == null || stocks.isEmpty()) {
            logWarn('Stock data validation failed: empty list', LOG_CLASS_NAME);
            return false;
        }
        
        // BULKIFICATION: Validate all stocks without SOQL/DML
        Integer validCount = 0;
        for (StockData stock : stocks) {
            if (stock != null && String.isNotBlank(stock.symbol)) {
                validCount++;
            }
        }
        
        Boolean isValid = validCount > 0;
        logDebug('Stock validation: ' + validCount + '/' + stocks.size() + ' valid', LOG_CLASS_NAME);
        return isValid;
    }
    
    /**
     * Filter stocks by price criteria
     * BULKIFICATION: In-memory filtering without SOQL
     * 
     * @param stocks List of stocks to filter
     * @param minPrice Minimum price threshold (null = no minimum)
     * @param maxPrice Maximum price threshold (null = no maximum)
     * @return Filtered list of stocks
     */
    public static List<StockData> filterStocksByPrice(
        List<StockData> stocks,
        Decimal minPrice,
        Decimal maxPrice
    ) {
        List<StockData> filtered = new List<StockData>();
        
        // NULL SAFETY: Handle null input
        if (stocks == null) {
            return filtered;
        }
        
        // BULKIFICATION: Filter without SOQL
        for (StockData stock : stocks) {
            if (stock == null || stock.price == null) {
                continue;
            }
            
            Boolean meetsMinPrice = (minPrice == null || stock.price >= minPrice);
            Boolean meetsMaxPrice = (maxPrice == null || stock.price <= maxPrice);
            
            if (meetsMinPrice && meetsMaxPrice) {
                filtered.add(stock);
            }
        }
        
        return filtered;
    }
    
    /**
     * Sort stocks by price (ascending)
     * 
     * @param stocks List of stocks to sort
     * @return Sorted list
     */
    public static List<StockData> sortStocksByPrice(List<StockData> stocks) {
        if (stocks == null || stocks.isEmpty()) {
            return new List<StockData>();
        }
        
        // Create wrapper list for sorting
        List<StockDataWrapper> wrappers = new List<StockDataWrapper>();
        for (StockData stock : stocks) {
            if (stock != null) {
                wrappers.add(new StockDataWrapper(stock));
            }
        }
        
        // Sort wrappers
        wrappers.sort();
        
        // Extract sorted stocks
        List<StockData> sorted = new List<StockData>();
        for (StockDataWrapper wrapper : wrappers) {
            sorted.add(wrapper.stock);
        }
        
        return sorted;
    }
    
    /**
     * Calculate average price from stock list
     * 
     * @param stocks List of stocks
     * @return Average price or null if no valid data
     */
    public static Decimal calculateAveragePrice(List<StockData> stocks) {
        if (stocks == null || stocks.isEmpty()) {
            return null;
        }
        
        Decimal totalPrice = 0;
        Integer validCount = 0;
        
        // BULKIFICATION: Sum prices without SOQL
        for (StockData stock : stocks) {
            if (stock != null && stock.price != null && stock.price > 0) {
                totalPrice += stock.price;
                validCount++;
            }
        }
        
        if (validCount == 0) {
            return null;
        }
        
        return totalPrice.divide(validCount, 2, System.RoundingMode.HALF_UP);
    }
    
    // ============ HELPER METHODS ============
    
    /**
     * Safely get string value from map
     * 
     * @param dataMap Map to retrieve from
     * @param key Key to retrieve
     * @return String value or empty string if not found
     */
    private static String getString(Map<String, Object> dataMap, String key) {
        if (dataMap == null || String.isBlank(key)) {
            return '';
        }
        
        Object value = dataMap.get(key);
        return value != null ? String.valueOf(value).trim() : '';
    }
    
    /**
     * Safely get decimal value from map
     * 
     * @param dataMap Map to retrieve from
     * @param key Key to retrieve
     * @return Decimal value or null if not found or invalid
     */
    private static Decimal getDecimal(Map<String, Object> dataMap, String key) {
        if (dataMap == null || String.isBlank(key)) {
            return null;
        }
        
        try {
            Object value = dataMap.get(key);
            if (value == null) {
                return null;
            }
            
            return Decimal.valueOf(String.valueOf(value));
        } catch (Exception e) {
            logDebug('Could not convert ' + key + ' to Decimal', LOG_CLASS_NAME);
            return null;
        }
    }
    
    // ============ LOGGING METHODS ============
    
    private static void logDebug(String message, String className) {
        System.debug(LoggingLevel.DEBUG, className + ' - ' + message);
    }
    
    private static void logError(String message, String className) {
        System.debug(LoggingLevel.ERROR, className + ' - ' + message);
    }
    
    private static void logWarn(String message, String className) {
        System.debug(LoggingLevel.WARN, className + ' - ' + message);
    }
    
    // ============ INNER CLASSES ============
    
    /**
     * Stock Data Model
     */
    public class StockData {
        public String symbol;
        public String name;
        public Decimal price;
        public Decimal change;
        public Decimal changePercent;
        
        public StockData() {
            this.symbol = '';
            this.name = '';
            this.price = null;
            this.change = null;
            this.changePercent = null;
        }
    }
    
    /**
     * Stock Data Wrapper for sorting
     */
    private class StockDataWrapper implements Comparable {
        public StockData stock;
        
        public StockDataWrapper(StockData stock) {
            this.stock = stock;
        }
        
        public Integer compareTo(Object other) {
            StockDataWrapper otherWrapper = (StockDataWrapper) other;
            
            // NULL SAFETY: Handle null prices
            if (this.stock.price == null && otherWrapper.stock.price == null) {
                return 0;
            }
            if (this.stock.price == null) {
                return 1;
            }
            if (otherWrapper.stock.price == null) {
                return -1;
            }
            
            // Compare prices
            if (this.stock.price < otherWrapper.stock.price) {
                return -1;
            } else if (this.stock.price > otherWrapper.stock.price) {
                return 1;
            }
            return 0;
        }
    }
}
