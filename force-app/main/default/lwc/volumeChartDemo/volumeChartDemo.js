import { LightningElement } from 'lwc';

export default class VolumeChartDemo extends LightningElement {
    sampleJsonData = JSON.stringify({
        "company": {
            "name": "Example Tech Ltd",
            "ticker": "EXTL"
        },
        "currency": "USD",
        "period": {
            "start_date": "2025-01-01",
            "end_date": "2025-01-30",
            "frequency": "daily"
        },
        "data": [
            { "date": "2025-01-01", "open": 100.5, "high": 102.0, "low": 99.8, "close": 101.2, "volume": 1500000 },
            { "date": "2025-01-02", "open": 101.2, "high": 103.1, "low": 100.9, "close": 102.7, "volume": 1325000 },
            { "date": "2025-01-03", "open": 102.7, "high": 104.0, "low": 101.8, "close": 103.5, "volume": 1410000 },
            { "date": "2025-01-04", "open": 103.5, "high": 104.2, "low": 102.1, "close": 102.9, "volume": 980000 },
            { "date": "2025-01-05", "open": 102.9, "high": 103.8, "low": 101.7, "close": 102.2, "volume": 1103000 },
            { "date": "2025-01-06", "open": 102.2, "high": 103.0, "low": 100.5, "close": 101.1, "volume": 1240000 },
            { "date": "2025-01-07", "open": 101.1, "high": 102.4, "low": 100.9, "close": 102.0, "volume": 1175000 },
            { "date": "2025-01-08", "open": 102.0, "high": 103.6, "low": 101.8, "close": 103.1, "volume": 1289000 },
            { "date": "2025-01-09", "open": 103.1, "high": 104.5, "low": 102.9, "close": 104.0, "volume": 1367000 },
            { "date": "2025-01-10", "open": 104.0, "high": 104.9, "low": 103.2, "close": 103.8, "volume": 1455000 },
            { "date": "2025-01-11", "open": 103.8, "high": 104.4, "low": 102.6, "close": 103.0, "volume": 975000 },
            { "date": "2025-01-12", "open": 103.0, "high": 103.9, "low": 102.1, "close": 103.4, "volume": 1012000 },
            { "date": "2025-01-13", "open": 103.4, "high": 105.0, "low": 103.0, "close": 104.8, "volume": 1523000 },
            { "date": "2025-01-14", "open": 104.8, "high": 106.2, "low": 104.5, "close": 105.9, "volume": 1634000 },
            { "date": "2025-01-15", "open": 105.9, "high": 106.5, "low": 104.8, "close": 105.2, "volume": 1398000 },
            { "date": "2025-01-16", "open": 105.2, "high": 106.0, "low": 104.3, "close": 104.9, "volume": 1205000 },
            { "date": "2025-01-17", "open": 104.9, "high": 105.7, "low": 103.9, "close": 104.1, "volume": 1157000 },
            { "date": "2025-01-18", "open": 104.1, "high": 104.9, "low": 103.6, "close": 104.6, "volume": 990000 },
            { "date": "2025-01-19", "open": 104.6, "high": 105.3, "low": 103.8, "close": 104.0, "volume": 1022000 },
            { "date": "2025-01-20", "open": 104.0, "high": 104.7, "low": 103.0, "close": 103.5, "volume": 1080000 },
            { "date": "2025-01-21", "open": 103.5, "high": 104.2, "low": 102.7, "close": 103.1, "volume": 1115000 },
            { "date": "2025-01-22", "open": 103.1, "high": 104.0, "low": 102.4, "close": 103.8, "volume": 1199000 },
            { "date": "2025-01-23", "open": 103.8, "high": 105.0, "low": 103.5, "close": 104.7, "volume": 1263000 },
            { "date": "2025-01-24", "open": 104.7, "high": 106.0, "low": 104.2, "close": 105.6, "volume": 1348000 },
            { "date": "2025-01-25", "open": 105.6, "high": 106.4, "low": 105.0, "close": 106.1, "volume": 1420000 },
            { "date": "2025-01-26", "open": 106.1, "high": 107.0, "low": 105.5, "close": 106.8, "volume": 1536000 },
            { "date": "2025-01-27", "open": 106.8, "high": 107.5, "low": 106.0, "close": 107.2, "volume": 1602000 },
            { "date": "2025-01-28", "open": 107.2, "high": 108.0, "low": 106.7, "close": 107.6, "volume": 1710000 },
            { "date": "2025-01-29", "open": 107.6, "high": 108.4, "low": 107.0, "close": 108.1, "volume": 1654000 },
            { "date": "2025-01-30", "open": 108.1, "high": 109.0, "low": 107.5, "close": 108.7, "volume": 1789000 }
        ]
    });
}

