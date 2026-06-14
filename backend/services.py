import pandas as pd
import numpy as np
import os
import glob
from functools import lru_cache

DATA_DIR = r"C:\Users\Sai Niranjan\Desktop\Guvi Final Reports\submission_cleaned-20260613T040246Z-3-001\submission_cleaned"

# ─── Data Loading (cached) ───────────────────────────────────────────────────

@lru_cache(maxsize=1)
def load_flights():
    """Load and combine Nov + Dec Indigo flights."""
    nov = pd.read_csv(os.path.join(DATA_DIR, "flights", "indigo_flights_nov2025.csv"))
    dec = pd.read_csv(os.path.join(DATA_DIR, "flights", "indigo_flights_dec2025.csv"))
    nov["month"] = "Nov"
    dec["month"] = "Dec"
    df = pd.concat([nov, dec], ignore_index=True)
    df["route"] = df["origin"] + "-" + df["destination"]
    return df

@lru_cache(maxsize=1)
def load_revenue():
    """Load and combine Nov + Dec revenue data."""
    nov = pd.read_csv(os.path.join(DATA_DIR, "financial", "revenue_per_route_nov.csv"))
    dec = pd.read_csv(os.path.join(DATA_DIR, "financial", "revenue_per_route_dec.csv"))
    nov["month"] = "Nov"
    dec["month"] = "Dec"
    df = pd.concat([nov, dec], ignore_index=True)
    df["route"] = df["origin"] + "-" + df["destination"]
    return df

@lru_cache(maxsize=1)
def load_crew_duty():
    """Load and combine Nov + Dec crew duty logs."""
    nov = pd.read_csv(os.path.join(DATA_DIR, "crew", "crew_duty_logs_nov.csv"))
    dec = pd.read_csv(os.path.join(DATA_DIR, "crew", "crew_duty_logs_dec.csv"))
    nov["month"] = "Nov"
    dec["month"] = "Dec"
    return pd.concat([nov, dec], ignore_index=True)

@lru_cache(maxsize=1)
def load_pilot_roster():
    """Load and combine Nov + Dec pilot rosters."""
    nov = pd.read_csv(os.path.join(DATA_DIR, "crew", "pilot_roster_nov.csv"))
    dec = pd.read_csv(os.path.join(DATA_DIR, "crew", "pilot_roster_dec.csv"))
    nov["month"] = "Nov"
    dec["month"] = "Dec"
    df = pd.concat([nov, dec], ignore_index=True)
    df["route"] = df["origin"] + "-" + df["destination"]
    return df

@lru_cache(maxsize=1)
def load_dgca_penalties():
    """Load DGCA penalty log."""
    return pd.read_csv(os.path.join(DATA_DIR, "regulatory", "dgca_penalty_log.csv"))

@lru_cache(maxsize=1)
def load_fdtl_compliance():
    """Load FDTL compliance report."""
    return pd.read_csv(os.path.join(DATA_DIR, "regulatory", "fdtl_compliance_report.csv"))

@lru_cache(maxsize=1)
def load_weather_delhi():
    """Load Delhi weather METAR data."""
    return pd.read_csv(os.path.join(DATA_DIR, "external", "weather_metar_delhi.csv"))

@lru_cache(maxsize=1)
def load_weather_mumbai():
    """Load Mumbai weather METAR data."""
    return pd.read_csv(os.path.join(DATA_DIR, "external", "weather_metar_mumbai.csv"))

@lru_cache(maxsize=1)
def load_competitor_incidents():
    """Load competitor incidents."""
    return pd.read_csv(os.path.join(DATA_DIR, "external", "competitor_incidents.csv"))

# ─── Filter Options (for dynamic dropdowns) ─────────────────────────────────

def get_filter_options():
    """Returns available filter options derived from actual data."""
    flights = load_flights()
    revenue = load_revenue()
    roster = load_pilot_roster()
    
    origins = sorted(flights["origin"].dropna().unique().tolist())
    destinations = sorted(flights["destination"].dropna().unique().tolist())
    airports = sorted(list(set(origins + destinations)))
    routes = sorted(flights["route"].dropna().unique().tolist())
    statuses = sorted(flights["status"].dropna().unique().tolist())
    base_stations = sorted(roster["base_station"].dropna().unique().tolist())
    
    return {
        "months": ["Nov", "Dec"],
        "airports": airports,
        "routes": routes,
        "statuses": statuses,
        "baseStations": base_stations,
    }

# ─── Helpers ─────────────────────────────────────────────────────────────────

def safe_pct(num, denom):
    return round((num / denom) * 100, 1) if denom > 0 else 0.0

def filter_by_month(df, month):
    if month and month != "All" and "month" in df.columns:
        return df[df["month"] == month]
    return df

def filter_by_origin(df, origin):
    if origin and origin != "All" and "origin" in df.columns:
        return df[df["origin"] == origin]
    return df

def filter_by_destination(df, dest):
    if dest and dest != "All" and "destination" in df.columns:
        return df[df["destination"] == dest]
    return df

def filter_by_status(df, status):
    if status and status != "All" and "status" in df.columns:
        return df[df["status"] == status]
    return df

# ─── Executive Command Center ────────────────────────────────────────────────

def get_executive_center(month=None):
    flights = filter_by_month(load_flights(), month)
    revenue_df = filter_by_month(load_revenue(), month)
    penalties = load_dgca_penalties()
    indigo_penalties = penalties[penalties["airline"] == "IndiGo"]
    fdtl = load_fdtl_compliance()
    
    total_flights = len(flights)
    delayed = len(flights[flights["status"] == "DELAYED"]) if "status" in flights.columns else 0
    cancelled = len(flights[flights["status"] == "CANCELLED"]) if "status" in flights.columns else 0
    on_time = total_flights - delayed - cancelled
    
    total_revenue = float(revenue_df["revenue"].sum()) if "revenue" in revenue_df.columns else 0
    total_refunds = float(revenue_df["refunds_issued"].sum()) if "refunds_issued" in revenue_df.columns else 0
    
    # FDTL compliance rate
    compliant_count = len(fdtl[fdtl["compliant"] == "YES"]) if "compliant" in fdtl.columns else 0
    fdtl_total = len(fdtl)
    fdtl_rate = safe_pct(compliant_count, fdtl_total)
    
    total_penalties = len(indigo_penalties)
    total_penalty_amount = float(indigo_penalties["penalty_inr_lakh"].sum()) if "penalty_inr_lakh" in indigo_penalties.columns else 0
    
    # Revenue by month for trend
    rev_by_month = revenue_df.groupby("month")["revenue"].sum().to_dict() if not revenue_df.empty else {}
    nov_rev = rev_by_month.get("Nov", 0)
    dec_rev = rev_by_month.get("Dec", 0)
    rev_change_pct = round(((dec_rev - nov_rev) / nov_rev) * 100, 1) if nov_rev > 0 else 0
    
    # Flight status donut data
    flight_status_data = [
        {"name": "On Time", "value": int(on_time)},
        {"name": "Delayed", "value": int(delayed)},
        {"name": "Cancelled", "value": int(cancelled)},
    ]
    
    # Revenue trend
    revenue_trend = [
        {"month": "Nov", "revenue": round(nov_rev, 2)},
        {"month": "Dec", "revenue": round(dec_rev, 2)},
    ]
    
    # Top delay routes
    if not flights.empty and "status" in flights.columns:
        delayed_flights = flights[flights["status"] == "DELAYED"]
        top_delay_routes = delayed_flights.groupby("route").size().nlargest(5).reset_index()
        top_delay_routes.columns = ["route", "count"]
        top_delay_routes_list = top_delay_routes.to_dict("records")
    else:
        top_delay_routes_list = []

    # Top risk routes (Route, Delays, Revenue, Cancellation %)
    if not flights.empty:
        flight_metrics = flights.groupby("route").agg(
            total_flights=("flight_id", "count"),
            delays=("status", lambda s: int((s == "DELAYED").sum())),
            cancellations=("status", lambda s: int((s == "CANCELLED").sum()))
        ).reset_index()
        
        if not revenue_df.empty and "revenue" in revenue_df.columns:
            route_rev = revenue_df.groupby("route")["revenue"].sum().reset_index()
            route_data = pd.merge(flight_metrics, route_rev, on="route", how="left").fillna(0)
        else:
            route_data = flight_metrics.copy()
            route_data["revenue"] = 0.0
            
        route_data["cancel_pct"] = route_data.apply(
            lambda r: safe_pct(r["cancellations"], r["total_flights"]), axis=1
        )
        route_data["delay_pct"] = route_data.apply(
            lambda r: safe_pct(r["delays"], r["total_flights"]), axis=1
        )
        
        route_data["risk_score"] = (route_data["cancellations"] * 2) + route_data["delays"]
        top_risk_routes = route_data.sort_values("risk_score", ascending=False).head(5)
        
        top_risk_routes_list = []
        for _, r in top_risk_routes.iterrows():
            top_risk_routes_list.append({
                "route": r["route"],
                "delays": int(r["delays"]),
                "revenue": float(r["revenue"]),
                "cancelPct": float(r["cancel_pct"]),
                "delayPct": float(r["delay_pct"]),
                "totalFlights": int(r["total_flights"])
            })
    else:
        top_risk_routes_list = []
    
    # Operational health
    delay_pct = safe_pct(delayed, total_flights)
    cancel_pct = safe_pct(cancelled, total_flights)
    if delay_pct < 10 and cancel_pct < 3 and fdtl_rate > 90:
        health_status = "GREEN"
    elif delay_pct < 20 and cancel_pct < 5:
        health_status = "YELLOW"
    else:
        health_status = "RED"
    
    # Executive insights
    insights = []
    if top_delay_routes_list:
        worst_route = top_delay_routes_list[0]["route"]
        insights.append(f"🚨 {worst_route} route has the highest number of delays ({top_delay_routes_list[0]['count']} flights).")
    if fdtl_rate < 100:
        insights.append(f"⚠️ FDTL compliance is at {fdtl_rate}%, below 100% target.")
    if rev_change_pct != 0:
        direction = "decreased" if rev_change_pct < 0 else "increased"
        insights.append(f"📉 Revenue {direction} by {abs(rev_change_pct)}% from November to December.")
    if cancel_pct > 0:
        insights.append(f"⛈️ Cancellation rate is at {cancel_pct}% — weather disruptions may be contributing.")
    if total_penalties > 0:
        insights.append(f"📋 {total_penalties} DGCA penalties totaling ₹{total_penalty_amount:.1f} Lakh recorded against IndiGo.")
    
    return {
        "kpis": {
            "totalFlights": int(total_flights),
            "totalRevenue": round(total_revenue, 2),
            "delayPct": safe_pct(delayed, total_flights),
            "cancelPct": safe_pct(cancelled, total_flights),
            "fdtlCompliance": fdtl_rate,
            "totalPenalties": int(total_penalties),
            "penaltyAmount": round(total_penalty_amount, 2),
        },
        "healthStatus": health_status,
        "flightStatusData": flight_status_data,
        "revenueTrend": revenue_trend,
        "revChangePercent": rev_change_pct,
        "topDelayRoutes": top_delay_routes_list,
        "topRiskRoutes": top_risk_routes_list,
        "insights": insights,
    }

# ─── Flight Operations Intelligence ─────────────────────────────────────────

def get_flight_operations(month=None, origin=None, destination=None, status=None):
    flights = load_flights()
    flights = filter_by_month(flights, month)
    flights = filter_by_origin(flights, origin)
    flights = filter_by_destination(flights, destination)
    flights = filter_by_status(flights, status)
    
    total = len(flights)
    delayed = len(flights[flights["status"] == "DELAYED"])
    cancelled = len(flights[flights["status"] == "CANCELLED"])
    on_time = len(flights[flights["status"] == "ON_TIME"])
    avg_delay = round(flights["delay_minutes"].mean(), 1) if "delay_minutes" in flights.columns and not flights.empty else 0
    
    # Delay by route (top 10)
    delay_by_route_df = flights[flights["status"] == "DELAYED"]
    if not delay_by_route_df.empty:
        delay_by_route = (
            delay_by_route_df.groupby("route")
            .agg(
                count=("flight_id", "size"),
                avg_delay_minutes=("delay_minutes", "mean")
            )
            .nlargest(10, "count")
            .reset_index()
        )
        delay_by_route["avg_delay_minutes"] = delay_by_route["avg_delay_minutes"].round(1)
    else:
        delay_by_route = pd.DataFrame(columns=["route", "count", "avg_delay_minutes"])

    
    # Cancellation by route (top 10)
    cancel_by_route = (
        flights[flights["status"] == "CANCELLED"]
        .groupby("route").size()
        .nlargest(10).reset_index()
    )
    cancel_by_route.columns = ["route", "count"]
    
    # Top delay airports (origin)
    top_delay_airports = (
        flights[flights["status"] == "DELAYED"]
        .groupby("origin").size()
        .nlargest(10).reset_index()
    )
    top_delay_airports.columns = ["airport", "count"]
    
    # Flight status distribution
    status_dist = flights["status"].value_counts().reset_index()
    status_dist.columns = ["status", "count"]
    
    # Route performance — avg delay by route (top 15)
    route_perf = (
        flights.groupby("route")
        .agg(
            avg_delay=("delay_minutes", "mean"),
            total_flights=("flight_id", "count"),
        )
        .nlargest(15, "avg_delay")
        .reset_index()
    )
    route_perf["avg_delay"] = route_perf["avg_delay"].round(1)
    
    # Operational Risk Summary
    highest_delay_airport = "N/A"
    if not top_delay_airports.empty:
        highest_delay_airport = top_delay_airports.iloc[0]["airport"]
        
    highest_delay_route = "N/A"
    if isinstance(delay_by_route, pd.DataFrame) and not delay_by_route.empty:
        highest_delay_route = delay_by_route.iloc[0]["route"]
    elif isinstance(delay_by_route, list) and len(delay_by_route) > 0:
        highest_delay_route = delay_by_route[0]["route"]
        
    most_cancelled_route = "N/A"
    if not cancel_by_route.empty:
        most_cancelled_route = cancel_by_route.iloc[0]["route"]

    delay_pct = safe_pct(delayed, total)
    cancel_pct = safe_pct(cancelled, total)
    
    if delay_pct > 15 or cancel_pct > 5 or avg_delay > 25:
        operational_risk = "High"
    elif delay_pct > 8 or cancel_pct > 2 or avg_delay > 12:
        operational_risk = "Medium"
    else:
        operational_risk = "Low"
        
    risk_summary = {
        "highestDelayAirport": highest_delay_airport,
        "highestDelayRoute": highest_delay_route,
        "mostCancelledRoute": most_cancelled_route,
        "operationalRisk": operational_risk
    }
    
    return {
        "kpis": {
            "totalFlights": int(total),
            "delayed": int(delayed),
            "cancelled": int(cancelled),
            "onTime": int(on_time),
            "avgDelay": float(avg_delay),
        },
        "riskSummary": risk_summary,
        "delayByRoute": delay_by_route.to_dict("records"),
        "cancelByRoute": cancel_by_route.to_dict("records"),
        "topDelayAirports": top_delay_airports.to_dict("records"),
        "statusDistribution": status_dist.to_dict("records"),
        "routePerformance": route_perf.to_dict("records"),
    }

# ─── Financial Intelligence ──────────────────────────────────────────────────

def get_financial_intelligence(month=None, route=None):
    rev = load_revenue()
    rev = filter_by_month(rev, month)
    if route and route != "All":
        rev = rev[rev["route"] == route]
    
    all_rev = load_revenue()
    nov_rev = float(all_rev[all_rev["month"] == "Nov"]["revenue"].sum())
    dec_rev = float(all_rev[all_rev["month"] == "Dec"]["revenue"].sum())
    rev_change = round(((dec_rev - nov_rev) / nov_rev) * 100, 1) if nov_rev > 0 else 0
    
    total_revenue = float(rev["revenue"].sum())
    total_refunds = float(rev["refunds_issued"].sum())
    avg_fare = round(float(rev["avg_fare"].mean()), 2) if not rev.empty else 0
    avg_load = round(float(rev["load_factor"].mean()) * 100, 1) if not rev.empty else 0
    
    # Top revenue route
    if not rev.empty:
        top_route = rev.groupby("route")["revenue"].sum().idxmax()
        top_route_rev = float(rev.groupby("route")["revenue"].sum().max())
    else:
        top_route = "N/A"
        top_route_rev = 0
    
    # Revenue by route (top 10)
    rev_by_route = rev.groupby("route")["revenue"].sum().nlargest(10).reset_index()
    rev_by_route.columns = ["route", "revenue"]
    rev_by_route["revenue"] = rev_by_route["revenue"].round(2)
    
    # Calculate revenue loss (revenue drop from Nov to Dec)
    # If route filter is applied, we calculate for that route.
    all_rev = load_revenue()
    if route and route != "All":
        all_rev = all_rev[all_rev["route"] == route]
    
    nov_rev_total = float(all_rev[all_rev["month"] == "Nov"]["revenue"].sum()) if not all_rev.empty else 0.0
    dec_rev_total = float(all_rev[all_rev["month"] == "Dec"]["revenue"].sum()) if not all_rev.empty else 0.0
    revenue_lost = max(0.0, nov_rev_total - dec_rev_total) if (month == "All" or month == "Dec" or not month) else 0.0

    # Top 10 routes revenue share for concentration analysis
    if not rev.empty:
        total_rev_sum = float(rev["revenue"].sum())
        route_rev_grouped = rev.groupby("route")["revenue"].sum().reset_index()
        top_10_routes = route_rev_grouped.nlargest(10, "revenue")
        
        other_revenue = total_rev_sum - float(top_10_routes["revenue"].sum())
        
        revenue_share = []
        for _, r in top_10_routes.iterrows():
            revenue_share.append({
                "name": r["route"],
                "value": float(r["revenue"]),
                "percentage": round((float(r["revenue"]) / total_rev_sum) * 100, 1)
            })
        if other_revenue > 0:
            revenue_share.append({
                "name": "Other Routes",
                "value": float(other_revenue),
                "percentage": round((other_revenue / total_rev_sum) * 100, 1)
            })
    else:
        revenue_share = []
    
    # Refund by route (top 10)
    refund_by_route = rev[rev["refunds_issued"] > 0].groupby("route")["refunds_issued"].sum().nlargest(10).reset_index()
    refund_by_route.columns = ["route", "refunds"]
    
    # Revenue trend (daily)
    if "date" in rev.columns:
        rev_trend = rev.groupby("date")["revenue"].sum().reset_index()
        rev_trend.columns = ["date", "revenue"]
        rev_trend["revenue"] = rev_trend["revenue"].round(2)
        rev_trend = rev_trend.sort_values("date").to_dict("records")
    else:
        rev_trend = []
    
    # Financial insights
    insights = []
    insights.append(f"💰 {top_route} generated the highest revenue at ₹{top_route_rev/10000000:.2f} Cr.")
    if rev_change < 0:
        insights.append(f"📉 December revenue declined by {abs(rev_change)}% compared to November.")
    else:
        insights.append(f"📈 December revenue increased by {rev_change}% compared to November.")
    if total_refunds > 0:
        insights.append(f"💸 Total refunds: ₹{total_refunds/100000:.1f} Lakh — refunds increased during disruption periods.")
    insights.append(f"✈️ Average load factor: {avg_load}% across all routes.")
    if revenue_lost > 0:
        insights.append(f"⚠️ Revenue drop from Nov to Dec: ₹{revenue_lost/10000000:.1f} Cr due to winter flight cancellations.")
    
    return {
        "kpis": {
            "novRevenue": round(nov_rev, 2),
            "decRevenue": round(dec_rev, 2),
            "revChangePercent": rev_change,
            "totalRefunds": round(total_refunds, 2),
            "topRevenueRoute": top_route,
            "avgFare": avg_fare,
            "avgLoadFactor": avg_load,
            "revenueLost": round(revenue_lost, 2),
        },
        "revenueByRoute": rev_by_route.to_dict("records"),
        "refundByRoute": refund_by_route.to_dict("records"),
        "revenueTrend": rev_trend,
        "revenueShare": revenue_share,
        "insights": insights,
    }

# ─── Crew Optimization Center ────────────────────────────────────────────────

def get_crew_optimization(month=None, base_station=None):
    duty = load_crew_duty()
    roster = load_pilot_roster()
    duty = filter_by_month(duty, month)
    roster_f = filter_by_month(roster, month)
    
    if base_station and base_station != "All":
        roster_f = roster_f[roster_f["base_station"] == base_station]
    
    total_crew = roster_f["employee_id"].nunique() if not roster_f.empty else 0
    avg_block = round(float(duty["block_hours"].mean()), 1) if not duty.empty else 0
    avg_rest = round(float(duty["rest_hrs_before_duty"].mean()), 1) if not duty.empty else 0
    
    # Compliance rate from duty logs
    if "fdtl_compliant" in duty.columns:
        compliant_count = len(duty[duty["fdtl_compliant"] == 1])
        compliance_rate = safe_pct(compliant_count, len(duty))
    else:
        compliance_rate = 0
    
    # Block hours distribution (histogram bins)
    if not duty.empty and "block_hours" in duty.columns:
        bins = [0, 2, 4, 6, 8, 10, 12, 14]
        labels = ["0-2h", "2-4h", "4-6h", "6-8h", "8-10h", "10-12h", "12-14h"]
        duty["block_bin"] = pd.cut(duty["block_hours"], bins=bins, labels=labels, include_lowest=True)
        block_dist = duty["block_bin"].value_counts().sort_index().reset_index()
        block_dist.columns = ["range", "count"]
        block_dist_list = block_dist.to_dict("records")
    else:
        block_dist_list = []
    
    # Rest hours distribution
    if not duty.empty and "rest_hrs_before_duty" in duty.columns:
        rest_bins = [0, 10, 20, 30, 40, 50, 60, 70, 80]
        rest_labels = ["0-10h", "10-20h", "20-30h", "30-40h", "40-50h", "50-60h", "60-70h", "70-80h"]
        duty["rest_bin"] = pd.cut(duty["rest_hrs_before_duty"], bins=rest_bins, labels=rest_labels, include_lowest=True)
        rest_dist = duty["rest_bin"].value_counts().sort_index().reset_index()
        rest_dist.columns = ["range", "count"]
        rest_dist_list = rest_dist.to_dict("records")
    else:
        rest_dist_list = []
    
    # Compliance breakdown
    if "fdtl_compliant" in duty.columns:
        comp_counts = duty["fdtl_compliant"].value_counts().reset_index()
        comp_counts.columns = ["status", "count"]
        comp_counts["status"] = comp_counts["status"].map({1: "Compliant", 0: "Non-Compliant"})
        compliance_breakdown = comp_counts.to_dict("records")
    else:
        compliance_breakdown = []
    
    # Base station analysis
    if not roster_f.empty:
        base_analysis = roster_f.groupby("base_station").agg(
            crew_count=("employee_id", "nunique"),
            avg_block=("block_hours", "mean"),
        ).reset_index()
        base_analysis["avg_block"] = base_analysis["avg_block"].round(1)
        base_analysis = base_analysis.nlargest(10, "crew_count")
        base_analysis_list = base_analysis.to_dict("records")
    else:
        base_analysis_list = []
    
    # Duty type distribution
    if "duty_type" in duty.columns:
        duty_type_dist = duty["duty_type"].value_counts().reset_index()
        duty_type_dist.columns = ["type", "count"]
        duty_type_list = duty_type_dist.to_dict("records")
    else:
        duty_type_list = []
    
    # Optimization recommendation (simple model)
    non_compliant_rate = 100 - compliance_rate
    additional_crew = int(total_crew * (non_compliant_rate / 100) * 0.5) if total_crew > 0 else 0
    recommended_crew = total_crew + additional_crew
    
    return {
        "kpis": {
            "totalCrew": int(total_crew),
            "avgBlockHours": avg_block,
            "avgRestHours": avg_rest,
            "complianceRate": compliance_rate,
        },
        "blockHoursDistribution": block_dist_list,
        "restHoursDistribution": rest_dist_list,
        "complianceBreakdown": compliance_breakdown,
        "baseStationAnalysis": base_analysis_list,
        "dutyTypeDistribution": duty_type_list,
        "optimization": {
            "currentCrew": int(total_crew),
            "recommendedCrew": int(recommended_crew),
            "additionalRequired": int(additional_crew),
        },
    }

# ─── Risk & Compliance Center ────────────────────────────────────────────────

def get_risk_compliance(month=None):
    penalties = load_dgca_penalties()
    indigo_penalties = penalties[penalties["airline"] == "IndiGo"]
    fdtl = load_fdtl_compliance()
    weather_del = load_weather_delhi()
    weather_bom = load_weather_mumbai()
    incidents = load_competitor_incidents()
    
    # DGCA violations for IndiGo
    dgca_violations = indigo_penalties["violation_type"].value_counts().reset_index()
    dgca_violations.columns = ["type", "count"]
    
    total_penalty_amount = float(indigo_penalties["penalty_inr_lakh"].sum())
    
    # Delhi fog events
    delhi_fog = int(weather_del["is_fog"].sum()) if "is_fog" in weather_del.columns else 0
    delhi_low_vis = int(weather_del["low_vis"].sum()) if "low_vis" in weather_del.columns else 0
    
    # Mumbai visibility events
    mumbai_fog = int(weather_bom["is_fog"].sum()) if "is_fog" in weather_bom.columns else 0
    mumbai_low_vis = int(weather_bom["low_vis"].sum()) if "low_vis" in weather_bom.columns else 0
    
    # Competitor incident types
    incident_types = incidents["incident_type"].value_counts().reset_index()
    incident_types.columns = ["type", "count"]
    
    # Severity distribution
    severity_dist = incidents["severity"].value_counts().reset_index()
    severity_dist.columns = ["severity", "count"]
    
    # FDTL compliance summary
    if "compliant" in fdtl.columns:
        fdtl_yes = len(fdtl[fdtl["compliant"] == "YES"])
        fdtl_no = len(fdtl[fdtl["compliant"] == "NO"])
        fdtl_rate = safe_pct(fdtl_yes, fdtl_yes + fdtl_no)
    else:
        fdtl_yes, fdtl_no, fdtl_rate = 0, 0, 0
    
    # Operational risk score (composite)
    delay_risk = 20  # base
    compliance_risk = max(0, (100 - fdtl_rate))
    weather_risk = min(30, (delhi_fog + mumbai_fog) * 2)
    penalty_risk = min(20, len(indigo_penalties) * 5)
    risk_score = int(min(100, delay_risk + compliance_risk + weather_risk + penalty_risk))
    
    # Penalty status breakdown
    penalty_status = indigo_penalties["status"].value_counts().reset_index() if not indigo_penalties.empty else pd.DataFrame()
    if not penalty_status.empty:
        penalty_status.columns = ["status", "count"]
        penalty_status_list = penalty_status.to_dict("records")
    else:
        penalty_status_list = []
    
    return {
        "kpis": {
            "riskScore": risk_score,
            "dgcaViolations": int(len(indigo_penalties)),
            "penaltyAmountLakh": round(total_penalty_amount, 2),
            "delhiFogEvents": delhi_fog,
            "delhiLowVis": delhi_low_vis,
            "mumbaiFogEvents": mumbai_fog,
            "mumbaiLowVis": mumbai_low_vis,
            "fdtlComplianceRate": fdtl_rate,
        },
        "dgcaViolationTypes": dgca_violations.to_dict("records"),
        "incidentTypes": incident_types.to_dict("records"),
        "severityDistribution": severity_dist.to_dict("records"),
        "penaltyStatusBreakdown": penalty_status_list,
        "fdtlBreakdown": [
            {"status": "Compliant", "value": int(fdtl_yes)},
            {"status": "Non-Compliant", "value": int(fdtl_no)},
        ],
    }

# ─── Predictive Intelligence ─────────────────────────────────────────────────

def get_predictive_intelligence():
    all_rev = load_revenue()
    flights = load_flights()
    fdtl = load_fdtl_compliance()
    
    # Revenue forecast (simple linear projection)
    nov_rev = float(all_rev[all_rev["month"] == "Nov"]["revenue"].sum())
    dec_rev = float(all_rev[all_rev["month"] == "Dec"]["revenue"].sum())
    trend = dec_rev - nov_rev
    jan_forecast = max(0, dec_rev + trend)
    
    revenue_forecast = [
        {"month": "Nov (Actual)", "revenue": round(nov_rev, 2)},
        {"month": "Dec (Actual)", "revenue": round(dec_rev, 2)},
        {"month": "Jan (Forecast)", "revenue": round(jan_forecast, 2)},
    ]
    
    # Delay forecast
    nov_flights = flights[flights["month"] == "Nov"]
    dec_flights = flights[flights["month"] == "Dec"]
    nov_delay_pct = safe_pct(len(nov_flights[nov_flights["status"] == "DELAYED"]), len(nov_flights))
    dec_delay_pct = safe_pct(len(dec_flights[dec_flights["status"] == "DELAYED"]), len(dec_flights))
    delay_trend = dec_delay_pct - nov_delay_pct
    jan_delay_forecast = round(max(0, min(100, dec_delay_pct + delay_trend)), 1)
    
    delay_forecast = [
        {"month": "Nov (Actual)", "delayPct": nov_delay_pct},
        {"month": "Dec (Actual)", "delayPct": dec_delay_pct},
        {"month": "Jan (Forecast)", "delayPct": jan_delay_forecast},
    ]
    
    # Compliance forecast
    if "compliant" in fdtl.columns:
        fdtl_yes = len(fdtl[fdtl["compliant"] == "YES"])
        fdtl_total = len(fdtl)
        current_compliance = safe_pct(fdtl_yes, fdtl_total)
    else:
        current_compliance = 100
    
    compliance_forecast = [
        {"period": "Current", "compliance": current_compliance},
        {"period": "Next Month", "compliance": round(max(0, current_compliance - 2), 1)},
        {"period": "Q1 2026", "compliance": round(max(0, current_compliance - 5), 1)},
    ]
    
    # Recommendations
    recommendations = []
    if current_compliance < 95:
        recommendations.append({
            "priority": "HIGH",
            "title": "Increase Reserve Crew Allocation",
            "detail": f"FDTL compliance is at {current_compliance}%. Allocate additional reserve crew to reduce fatigue-related non-compliance."
        })
    if dec_delay_pct > nov_delay_pct:
        recommendations.append({
            "priority": "HIGH",
            "title": "Review High-Delay Routes",
            "detail": f"Delay rate increased from {nov_delay_pct}% to {dec_delay_pct}%. Focus on routes with highest delay frequency."
        })
    recommendations.append({
        "priority": "MEDIUM",
        "title": "Monitor Delhi Weather Disruptions",
        "detail": "Fog events at DEL caused operational disruptions. Pre-position crews and aircraft for winter weather."
    })
    recommendations.append({
        "priority": "MEDIUM",
        "title": "Improve FDTL Scheduling Compliance",
        "detail": "Distribute long-haul flights more evenly across crew to prevent FDTL breaches."
    })
    if trend < 0:
        recommendations.append({
            "priority": "HIGH",
            "title": "Revenue Decline Alert",
            "detail": f"Revenue dropped ₹{abs(trend)/10000000:.2f} Cr from Nov to Dec. Review pricing strategy and route profitability."
        })
    
    return {
        "revenueForecast": revenue_forecast,
        "delayForecast": delay_forecast,
        "complianceForecast": compliance_forecast,
        "recommendations": recommendations,
    }

# ─── Legacy support ──────────────────────────────────────────────────────────

def generate_summary_kpis():
    """Legacy endpoint — returns the same data as executive center KPIs."""
    result = get_executive_center()
    return result["kpis"]
