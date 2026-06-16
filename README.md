# ✈️ IndiGo 6E Operational Intelligence Dashboard

A comprehensive, production-ready full-stack analytical platform built for **IndiGo Airlines**. This application integrates operational, financial, crew planning, and safety data from actual schedules (November & December 2025) to provide executives and operations managers with interactive insights, predictive projections, and decision-simulating capabilities.

---

## 🔍 Key Dashboard Features

1. **📊 6E Command Center (Executive Center)**
   - High-level KPIs: Total flights, gross revenues, delay percentages, cancellation rates, FDTL compliance, and Delhi/Mumbai fog events.
   - Proportional status breakdown (On-Time vs Delayed vs Cancelled).
   - High-risk route tracking based on delays.

2. **✈️ 6E Flight Operations**
   - Granular status search: Filter by specific flight status, origin, destination, or month.
   - Interactive maps/visualizations of delayed flights.
   - Detailed metric logs.

3. **💰 6E Financial Intelligence**
   - Month-over-Month (MoM) revenue comparison.
   - Revenue and refund metrics across routes.
   - Route contribution shares and daily revenue trend lines.

4. **👥 6E Crew Planning (Crew Optimization Center)**
   - Analysis of Pilot Block Hours and Rest Hours distribution.
   - Flight Duty Time Limitation (FDTL) compliance rates.
   - Automated crew requirement recommendations based on fatigue rules.

5. **⚠️ 6E Safety & Risk (Risk & Compliance Center)**
   - Overall Operational Risk Score gauge.
   - DGCA violation counts and financial penalty exposure logs.
   - Competitor incident analysis and industry-wide severity breakdown.

6. **📈 6E Foresight (Predictive Intelligence)**
   - AI/Statistical forecasts of future revenues, delay rates, and compliance trends.
   - Actionable recommendations with impact projections.

7. **🧪 6E Decision Lab**
   - Simulated scenario engine: Slide variables (Crew Availability, Delay Reduction, Cancellation Reduction, Fare Adjustment, Load Factor, Weather Severity) to see immediate hypothetical impacts.
   - Visual slider track highlights starting from the default position to make relative differences clear.
   - Side-by-side radar and bar chart comparison of baseline vs. projected outcomes.

---

## 🛠️ Technology Stack

- **Frontend:** React (JS), Vite, Recharts, React Icons, Vanilla CSS
- **Backend:** FastAPI (Python), Pandas, Numpy, Uvicorn
- **Data Source:** Cleaned CSV data schedules

---

## 🚀 Setup & Launch Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Quick Start (Both Backend + Frontend together)
Run the following commands from the root directory (`indigo-dashboard`):
```bash
# Install dependencies
npm install

# Start both servers in concurrently mode
npm run dev
```
- **Frontend URL:** http://localhost:5173
- **Backend API URL:** http://localhost:8000

---

## 📂 Project Structure

```text
indigo-dashboard/
├── backend/
│   ├── main.py          # FastAPI app routers
│   ├── services.py      # Pandas analytical engine (computations, loading, caching)
│   └── venv/            # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── pages/       # Dashboard page views
│   │   ├── components/  # Reusable UI elements (Filter panels, tooltips)
│   │   ├── index.css    # Unified custom style definitions
│   │   ├── App.jsx      # Navigation router layout
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── package.json         # Concurrently script configuration
└── start_servers.ps1    # Automated launch powershell script
```
