from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from services import (
    get_filter_options,
    get_executive_center,
    get_flight_operations,
    get_financial_intelligence,
    get_crew_optimization,
    get_risk_compliance,
    get_predictive_intelligence,
    get_decision_lab,
)

app = FastAPI(title="Indigo Airlines Operational Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Indigo Airlines Operational Intelligence API v2.0"}

@app.get("/api/filters")
def get_filters():
    """Returns all available filter options derived from real data."""
    return get_filter_options()

@app.get("/api/executive-center")
def executive_center(
    month: Optional[str] = Query(None),
    airport: Optional[str] = Query(None),
    route: Optional[str] = Query(None),
):
    return get_executive_center(month, airport, route)

@app.get("/api/flight-operations")
def flight_operations(
    month: Optional[str] = Query(None),
    origin: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    return get_flight_operations(month, origin, destination, status)

@app.get("/api/financial-intelligence")
def financial_intelligence(
    month: Optional[str] = Query(None),
    route: Optional[str] = Query(None),
):
    return get_financial_intelligence(month, route)

@app.get("/api/crew-optimization")
def crew_optimization(
    month: Optional[str] = Query(None),
    base_station: Optional[str] = Query(None),
):
    return get_crew_optimization(month, base_station)

@app.get("/api/risk-compliance")
def risk_compliance(month: Optional[str] = Query(None)):
    return get_risk_compliance(month)

@app.get("/api/predictive-intelligence")
def predictive_intelligence():
    return get_predictive_intelligence()

@app.get("/api/decision-lab")
def decision_lab():
    return get_decision_lab()

# Legacy endpoint for backward compat
@app.get("/api/summary")
def get_summary():
    result = get_executive_center()
    return result["kpis"]
