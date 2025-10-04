# Enterprise Agile Planning Tool

A comprehensive enterprise-grade agile planning solution for managing strategic targets, objectives, and portfolio planning across 14 portfolios.

## Features

### Strategic Targets Overview
- **RAG Status Tracking**: Visual representation of objectives using Red-Amber-Green status indicators
- **Multi-Year & PI Support**: Switch between different years and Program Increments (PI)
- **Data Ingestion**: Import CSV/TSV data to dynamically update views
- **Portfolio Aggregation**: Roll-up objective statuses across 14 portfolios
- **Interactive Dashboard**: Stacked bar charts, KPI cards, and detailed breakdowns

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The application will be available at `http://localhost:3000`

## Data Format

The Strategic Targets overview accepts CSV/TSV data with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Year | The year of the data | 2025 |
| PI | Program Increment | PI2, PI3 |
| Strategic Target | The strategic target category | 24/7 availability |
| Objective | The specific objective | Stable, secure infrastructure |
| RAG | Status indicator | On track, At risk, Not on track |

### Sample Data Import

```tsv
year	pi	strategic target	objective	rag
2025	PI3	24/7 availability	Stable infrastructure	On track
2025	PI3	Employee engagement	Improve satisfaction	At risk
```

## Status Definitions

- **On track**: Objective is progressing as planned
- **At risk**: Objective faces challenges that may impact delivery
- **Not on track**: Objective is significantly delayed or blocked
- **Done**: Objective has been completed
- **On hold**: Objective is temporarily paused
- **TBD**: Status is yet to be determined

## Architecture

```
enterprise-agile-planning/
├── src/
│   ├── components/
│   │   └── StrategicTargetsRAG.jsx  # Main strategic targets component
│   ├── App.jsx                       # Root application component
│   ├── main.jsx                      # Application entry point
│   └── index.css                     # Global styles with Tailwind
├── public/                           # Static assets
└── index.html                        # HTML template
```

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

## Future Enhancements

- Portfolio drill-down views
- Timeline & Gantt charts
- Resource allocation tracking
- Risk & dependency management
- Team capacity planning
- Sprint/iteration planning
- Reporting & analytics
- Data export capabilities

## License

Proprietary - Enterprise Use Only
