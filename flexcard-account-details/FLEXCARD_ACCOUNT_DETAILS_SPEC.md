# FlexCard: Account Details (Name, Phone, Industry) with Refresh Button

## Overview
A FlexCard that displays **Account Name**, **Phone**, and **Industry** from a SOQL query on the Account object, with a **Refresh** button to reload the data.

---

## 1. Create the FlexCard

1. Navigate to **OmniStudio** → **FlexCards** in your Salesforce org
2. Click **New FlexCard**
3. In the **Setup** panel:
   - **Name**: `AccountDetailsCard` (or your preferred name)
   - **Title**: Account Details
   - **Description**: Displays Account Name, Phone, and Industry with refresh capability
   - **Author**: Your name
   - **Type**: Parent

---

## 2. Data Source Configuration (SOQL)

In the Setup panel, configure the **Data Source**:

| Setting | Value |
|--------|--------|
| **Data Source Type** | SOQL Query |
| **SOQL Query** | `SELECT Id, Name, Phone, Industry FROM Account WHERE Id = '{recordId}' LIMIT 1` |

> **Note**: `{recordId}` is a merge field passed when the FlexCard is embedded (e.g., on a record page). If used standalone, replace with a specific Account Id for testing.

### Alternative (List view - multiple accounts)

For displaying a list of accounts without record context:

```
SELECT Id, Name, Phone, Industry FROM Account LIMIT 10
```

---

## 3. Property Set Configuration (Design)

Add the following elements in the FlexCard Designer canvas:

### Layout Structure

1. **Block** (container) – optional, for grouping
   - Label: Account Information
   - Collapsible: No

2. **Field** elements:
   - **Account Name**: Merge field `{Name}`
   - **Phone**: Merge field `{Phone}`
   - **Industry**: Merge field `{Industry}`

3. **Action** (Refresh button):
   - **Label**: Refresh
   - **Action Type**: Card
   - **Type**: Update Datasource
   - **Data Source Type**: Same as card (SOQL)
   - This re-runs the SOQL query and updates the displayed data

### Element Configuration

| Element | Type | Merge Field / Config |
|---------|------|----------------------|
| Account Name | Field or Text | `{Name}` |
| Phone | Field or Text | `{Phone}` |
| Industry | Field or Text | `{Industry}` |
| Refresh Button | Action | Type: Update Datasource |

---

## 4. Refresh Button Setup

For the **Action** element configured as the Refresh button:

- **Action Type**: Card
- **Type**: Update Datasource
- **Data Source**: Uses the same SOQL data source as the card
- **Result JSON Path**: Leave default (replaces root data)

This causes the FlexCard to re-execute its SOQL query and refresh the displayed values when the button is clicked.

---

## 5. Sample Data (for Preview)

In Setup → **Sample Data Source Response**, add:

```json
{
  "Id": "001000000000001AAA",
  "Name": "Sample Account",
  "Phone": "(555) 123-4567",
  "Industry": "Technology"
}
```

---

## 6. Test Parameters

If using `{recordId}` in the SOQL:

- **Test Parameter Name**: `recordId`
- **Test Value**: A valid Account Id from your org (e.g., `001XXXXXXXXXXXXXXX`)

---

## 7. Where to Use the FlexCard

- **Record Page**: Add the FlexCard component to an Account record page (it will receive `recordId` automatically)
- **OmniScript**: Embed as a Custom Lightning Web Component
- **LWC**: Use `c-flex-card-wrapper` or the OmniStudio LWC wrapper

---

## Data Source Config JSON Reference

```json
{
  "type": "Query",
  "value": {
    "query": "SELECT Id, Name, Phone, Industry FROM Account WHERE Id = '{recordId}' LIMIT 1"
  }
}
```

---

## Property Set Config JSON Reference

The PropertySetConfig defines the layout. A simplified structure:

```json
{
  "states": [
    {
      "props": {
        "label": "Account Details"
      },
      "children": [
        {
          "descriptor": "Field",
          "props": {
            "label": "Account Name",
            "value": "{Name}"
          }
        },
        {
          "descriptor": "Field",
          "props": {
            "label": "Phone",
            "value": "{Phone}"
          }
        },
        {
          "descriptor": "Field",
          "props": {
            "label": "Industry",
            "value": "{Industry}"
          }
        },
        {
          "descriptor": "Action",
          "props": {
            "label": "Refresh",
            "actionType": "Update Datasource"
          }
        }
      ]
    }
  ]
}
```

> **Note**: The exact structure depends on the OmniStudio FlexCard Designer version. Use the Designer UI for precise configuration; this JSON is for reference.

---

## Deployment

1. **Save** and **Activate** the FlexCard in the Designer
2. Add to an Account record page via Lightning App Builder
3. Set the FlexCard to receive the record context (`recordId`)
