# Cricket Matches FlexCard Specification

## Overview
The Cricket Matches FlexCard displays cricket match data fetched from the `api_cricket` Integration Procedure in a datatable format.

## Data Source
- **Type**: Integration Procedure
- **Procedure Name**: `api_cricket`
- **Input Parameters**: None (uses default empty object)

## DataTable Columns

| Column Name | Field Name | Type | Sortable | Description |
|---|---|---|---|---|
| Series | series | text | Yes | Cricket series name (e.g., World Cup, IPL) |
| Teams | matchTeams | text | No | Team matchup (e.g., "India vs Australia") |
| Date & Time | dateTimeGMT | date | Yes | Match date and time in GMT |
| Match Type | matchType | text | Yes | Type of match (e.g., ODI, T20, Test) |
| Status | status | text | Yes | Current match status (e.g., LIVE, COMPLETED, UPCOMING) |
| Scores | scores | text | No | Team scores (e.g., "250/8 vs 120/3") |

## Sample Data
```json
{
  "id": "1",
  "series": "World Cup",
  "t1": "India",
  "t2": "Australia",
  "t1img": "https://example.com/india.png",
  "t2img": "https://example.com/aus.png",
  "dateTimeGMT": "2026-02-21T10:00:00Z",
  "ms": "Live",
  "status": "LIVE",
  "matchType": "ODI",
  "t1s": "250/8",
  "t2s": "120/3"
}
```

## Features
- **Sortable Columns**: Series, Date & Time, Match Type, and Status columns are sortable
- **Checkbox Column**: Hidden for cleaner display
- **Refresh Action**: Includes a refresh button to update data from the Integration Procedure
- **Row Number Offset**: None (starts at 0)

## Integration with OmniStudio
This FlexCard is configured as an OmniUiCard parent component and can be embedded in:
- OmniScripts
- Guided Interactions
- Custom Visualforce/LWC pages using the OmniStudio rendering engine

## Configuration Details
- **Card Name**: CricketMatchesCard
- **Is Active**: True
- **Card Type**: Parent (Standard OmniUiCard)

## Data Transformation Notes
The flexcard expects the api_cricket Integration Procedure to return an array of cricket match objects with the following fields:
- `id`: Unique match identifier
- `series`: Series name
- `t1` / `t2`: Team names
- `dateTimeGMT`: Match date/time
- `matchType`: Type of match
- `status`: Match status
- `ms`: Match status (alternate field)
- `t1s` / `t2s`: Team scores
- `t1img` / `t2img`: Team image URLs

When displayed in the datatable, the data is formatted with:
- `matchTeams`: Derived from `t1` and `t2` (formatted as "t1 vs t2")
- `scores`: Derived from `t1s` and `t2s` (formatted as "t1s vs t2s")
