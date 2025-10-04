# Getting Started with Enterprise Agile Planning Tool

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Import Sample Data

The tool comes pre-loaded with sample data for **2025 PI3**. To add more data:

1. Click the **"Paste data"** button in the top-right corner
2. Copy the contents of `sample-data.tsv` (included in the project root)
3. Paste into the text area
4. Click **"Import"**

The view will automatically switch to show the newly imported data.

## Understanding the Dashboard

### Strategic Targets

The dashboard displays 5 key strategic targets:
1. **24/7 availability** - Infrastructure stability and reliability
2. **Competitive customer satisfaction and brand trust** - Customer experience and brand perception
3. **Competitive return on investment capital** - Financial performance and ROI
4. **Employee engagement** - Workforce satisfaction and culture
5. **Solid risk management & compliance** - Regulatory and security posture

### Status Indicators (RAG)

Each objective is tracked using a RAG (Red-Amber-Green) status:

| Status | Meaning | Visual |
|--------|---------|--------|
| 🟢 **On track** | Progressing as planned | Green badge |
| 🟡 **At risk** | Facing challenges, may need intervention | Amber badge |
| 🔴 **Not on track** | Significantly delayed or blocked | Red badge |
| 🔵 **Done** | Successfully completed | Cyan badge |
| ⚪ **On hold** | Temporarily paused | Gray badge |
| ❓ **TBD** | Status not yet determined | Light gray badge |

### Key Metrics

**Top Summary Cards:**
- **Not on track** - Objectives requiring immediate attention
- **At risk** - Objectives needing monitoring
- **On track + Done** - Successfully progressing or completed objectives
- **Neutral** - Objectives on hold or yet to be determined

**Per Target Cards:**
- **Stacked Bar Chart** - Visual distribution of objective statuses
- **Mini KPIs** - Quick counts for On track+Done, At risk, and Not on track
- **Compact Legend** - Detailed breakdown with percentages

### Roll-up Logic

Objective statuses are automatically rolled up from Key Results (KRs):
- If all active KRs are **Done** → Objective is **Done**
- If any active KR is **Not on track** → Objective is **Not on track**
- If any active KR is **At risk** (and none are Not on track) → Objective is **At risk**
- Otherwise → Objective is **On track**

Active KRs exclude those that are "On hold" or "TBD"

## Data Format

### Required Columns

Your CSV/TSV must include these columns (case-insensitive):

```
Year, PI, Strategic Target, Objective, RAG
```

### Example Format

**Tab-separated (TSV):**
```tsv
year	pi	strategic target	objective	rag
2025	PI3	24/7 availability	Stable infrastructure	On track
2025	PI3	Employee engagement	Culture initiative	At risk
```

**Comma-separated (CSV):**
```csv
year,pi,strategic target,objective,rag
2025,PI3,24/7 availability,Stable infrastructure,On track
2025,PI3,Employee engagement,Culture initiative,At risk
```

### Valid RAG Values

The following values are recognized (case-insensitive):
- `On track` / `OnTrack` / `ontrack`
- `At risk` / `AtRisk` / `atrisk`
- `Not on track` / `NotOnTrack` / `notontrack`
- `Done` / `done`
- `On hold` / `OnHold` / `onhold`
- `TBD` / `tbd` / (empty)

## Switching Views

### Year Selector
Use the **Year** dropdown to switch between different years (e.g., 2025, 2026)

### PI Selector
Use the **PI** dropdown to switch between Program Increments (e.g., PI1, PI2, PI3, PI4)

## Tips & Best Practices

1. **Regular Updates**: Import fresh data at the start of each PI to track progress
2. **Focus on Red & Amber**: Cards are sorted by severity (Not on track → At risk → On track)
3. **Export from Tools**: Most planning tools (Jira, Azure DevOps) can export to CSV/TSV
4. **Consistent Naming**: Use consistent Strategic Target names across imports for accurate aggregation
5. **Data Validation**: The import will fail with a helpful error if columns are missing or malformed

## Troubleshooting

### Import Fails
- **Check headers**: Ensure your first row contains: `year, pi, strategic target, objective, rag`
- **Check separators**: Tool auto-detects tabs or commas - don't mix them
- **Check data**: Ensure no columns are missing values

### No Data Showing
- Verify the correct Year & PI are selected in the dropdowns
- Check if data was successfully imported (you should see a success alert)
- Try re-importing with the sample data to test

### Incorrect Aggregation
- Ensure Strategic Target names are spelled consistently
- Check that Objective names within the same target are unique
- Verify RAG values match the supported list

## Next Steps

- Explore the pre-loaded 2025 PI3 data
- Import your own portfolio data
- Share the dashboard URL with stakeholders
- Build on this foundation with additional views (portfolio drill-downs, timelines, etc.)

## Need Help?

Review the main `README.md` for architecture details and future enhancement plans.
