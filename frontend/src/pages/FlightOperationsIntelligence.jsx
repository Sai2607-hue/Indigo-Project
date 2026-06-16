import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import InfoIcon from '../components/InfoIcon';
import IndiaMap from '@svg-maps/india';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const AIRPORT_NAMES = {
  DEL: 'Indira Gandhi International Airport (Delhi)',
  BOM: 'Chhatrapati Shivaji Maharaj International Airport (Mumbai)',
  BLR: 'Kempegowda International Airport (Bengaluru)',
  MAA: 'Chennai International Airport (Chennai)',
  CCU: 'Netaji Subhash Chandra Bose International Airport (Kolkata)',
  HYD: 'Rajiv Gandhi International Airport (Hyderabad)',
  AMD: 'Sardar Vallabhbhai Patel International Airport (Ahmedabad)',
  COK: 'Cochin International Airport (Kochi)',
  GOI: 'Manohar International Airport / Dabolim Airport (Goa)',
  PNQ: 'Pune Airport (Pune)',
  JAI: 'Jaipur International Airport (Jaipur)',
  LKO: 'Chaudhary Charan Singh International Airport (Lucknow)',
  ATQ: 'Sri Guru Ram Dass Jee International Airport (Amritsar)',
  GAU: 'Lokpriya Gopinath Bordoloi International Airport (Guwahati)',
  PAT: 'Jay Prakash Narayan Airport (Patna)',
  BHO: 'Raja Bhoj Airport (Bhopal)',
  SXR: 'Srinagar Airport (Srinagar)',
  VNS: 'Lal Bahadur Shastri Airport (Varanasi)',
  IXC: 'Shaheed Bhagat Singh International Airport (Chandigarh)',
  IXB: 'Bagdogra Airport (Siliguri/Bagdogra)'
};

const AIRPORT_COORDS = {
  DEL: { x: 190.2, y: 216.1 },
  BOM: { x: 107.0, y: 419.6 },
  BLR: { x: 202.1, y: 540.1 },
  MAA: { x: 250.5, y: 544.2 },
  CCU: { x: 412.9, y: 344.7 },
  HYD: { x: 216.3, y: 457.9 },
  AMD: { x: 102.5, y: 335.7 },
  COK: { x: 176.4, y: 601.2 },
  GOI: { x: 125.9, y: 495.9 },
  PNQ: { x: 127.7, y: 430.2 },
  JAI: { x: 164.9, y: 254.5 },
  LKO: { x: 264.6, y: 255.9 },
  ATQ: { x: 145.0, y: 144.5 },
  GAU: { x: 474.6, y: 270.3 },
  PAT: { x: 347.0, y: 281.5 },
  BHO: { x: 194.8, y: 331.2 },
  SXR: { x: 144.5, y: 91.3 },
  VNS: { x: 303.2, y: 284.6 },
  IXC: { x: 184.0, y: 168.3 },
  IXB: { x: 410.6, y: 257.7 }
};

const FlightOperationsIntelligence = () => {
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({ month: 'All', origin: 'All', destination: 'All', status: 'All' });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'avg_delay', direction: 'asc' });
  const [selectedAirportCode, setSelectedAirportCode] = useState(null);

  // Auto-select the airport with the highest average delay when data is loaded
  useEffect(() => {
    if (data && data.airportPerformance && data.airportPerformance.length > 0) {
      const sorted = [...data.airportPerformance].sort((a, b) => b.avgDelay - a.avgDelay);
      setSelectedAirportCode(sorted[0].airport);
    }
  }, [data]);

  const selectedAirportData = React.useMemo(() => {
    if (!data || !data.airportPerformance) return null;
    return data.airportPerformance.find(a => a.airport === selectedAirportCode) || null;
  }, [data, selectedAirportCode]);

  const sortedRoutePerformance = React.useMemo(() => {
    if (!data || !data.routePerformance) return [];
    let sortableItems = [...data.routePerformance];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'risk_level') {
          const riskWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
          const aRisk = a.avg_delay > 30 ? 'High' : a.avg_delay > 15 ? 'Medium' : 'Low';
          const bRisk = b.avg_delay > 30 ? 'High' : b.avg_delay > 15 ? 'Medium' : 'Low';
          aVal = riskWeight[aRisk];
          bVal = riskWeight[bRisk];
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  useEffect(() => {
    axios.get(`${API}/api/filters`).then(r => setFilterOptions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v !== 'All') params[k] = v; });
    axios.get(`${API}/api/flight-operations`, { params })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  if (loading) return (
    <div className="dashboard-container"><div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading Flight Operations...</div></div></div>
  );
  if (!data) return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
      <div style={{ padding: '32px', background: 'var(--surface-dark)', borderRadius: '16px', border: '1px solid var(--danger)', textAlign: 'center', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: 'var(--danger)', margin: '0 0 12px 0', fontSize: '20px' }}>Failed to Load Data</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
          We encountered an issue fetching flight operations intelligence. The server might be unreachable or returning an error.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0, 27, 148, 0.2)' }}
          onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(0, 27, 148, 0.3)'; }}
          onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(0, 27, 148, 0.2)'; }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );

  const { kpis, riskSummary = {}, delayByRoute, cancelByRoute, topDelayAirports, routePerformance, airportPerformance = [] } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Flight Operations Intelligence</h1>
      </div>

      <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} />

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            Total Flights
            <InfoIcon tooltip="Total count of scheduled and operated flights." />
          </div>
          <div className="kpi-value">{kpis.totalFlights.toLocaleString()}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--success)' }}>
          <div className="kpi-title">
            On Time
            <InfoIcon tooltip="Count of flights departing within 15 minutes of scheduled time." />
          </div>
          <div className="kpi-value">{kpis.onTime.toLocaleString()}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--warning)' }}>
          <div className="kpi-title">
            Delayed
            <InfoIcon tooltip="Count of flights delayed by 15 minutes or more." />
          </div>
          <div className="kpi-value">{kpis.delayed.toLocaleString()}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="kpi-title">
            Cancelled
            <InfoIcon tooltip="Count of flights cancelled due to weather or technical factors." />
          </div>
          <div className="kpi-value">{kpis.cancelled.toLocaleString()}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--info)' }}>
          <div className="kpi-title">
            Avg Delay (min)
            <InfoIcon tooltip="Average length of flight departure delays in minutes." />
          </div>
          <div className="kpi-value">{kpis.avgDelay}</div>
        </div>
      </div>

      {/* Operational Risk Panel */}
      <div className="chart-card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Operational Risk Summary</span>
          <InfoIcon tooltip="Summary of high-risk operational areas based on flight delay and cancellation patterns." />
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Highest Delay Airport</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{riskSummary.highestDelayAirport || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Highest Delay Route</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{riskSummary.highestDelayRoute || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Most Cancelled Route</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{riskSummary.mostCancelledRoute || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Operational Risk</span>
            <div>
              <span className={`health-badge ${riskSummary.operationalRisk === 'High' ? 'red' : riskSummary.operationalRisk === 'Medium' ? 'yellow' : 'green'}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
                <span className="health-dot" />
                {riskSummary.operationalRisk || 'Low'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Top Delay Routes (By Count) */}
        <div className="chart-card">
          <h3>
            Top Delay Routes (By Count)
            <InfoIcon tooltip="Routes experiencing the highest frequency of delays." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={delayByRoute} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="count" fill="#001B94" radius={[0, 4, 4, 0]} name="Delay Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cancellation by Route */}
        <div className="chart-card">
          <h3>
            Top 10 Cancellation Routes
            <InfoIcon tooltip="Routes experiencing the highest frequency of cancellations." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={cancelByRoute} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }} />
                <Bar dataKey="count" fill="#001B94" radius={[0, 4, 4, 0]} name="Cancelled Flights" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Delay Airports */}
        <div className="chart-card">
          <h3>
            Top Delay Airports (Origin)
            <InfoIcon tooltip="Departure airports experiencing the highest absolute count of delays." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={topDelayAirports}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                <XAxis dataKey="airport" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }} />
                <Bar dataKey="count" fill="#001B94" radius={[6, 6, 0, 0]} name="Delayed Flights" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highest Average Delay Routes */}
        <div className="chart-card">
          <h3>
            Highest Average Delay Routes
            <InfoIcon tooltip="Routes experiencing the most severe average delay duration in minutes." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={[...(delayByRoute || [])].sort((a,b) => b.avg_delay_minutes - a.avg_delay_minutes)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="avg_delay_minutes" fill="#00B259" radius={[0, 4, 4, 0]} name="Avg Delay (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Airport Intelligence Map */}
      <div className="chart-card" style={{ padding: '24px' }}>
        <h3>
          📍 Operational Airport Intelligence Map
          <InfoIcon tooltip="Interactive route intelligence map. Click on any airport marker to inspect delay rates and top delayed routes originating from that hub." />
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '16px' }}>
          {/* Left Column: Interactive Map */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface-dark)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
            <svg viewBox="0 0 612 696" style={{ width: '100%', maxHeight: '420px', filter: 'drop-shadow(0 10px 15px rgba(0, 27, 148, 0.08))' }}>
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 27, 148, 0.03)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" rx="10" />

              {/* Render state paths for a highly premium look */}
              {IndiaMap.locations.map((loc) => (
                <path
                  key={loc.id}
                  d={loc.path}
                  fill="rgba(0, 27, 148, 0.015)"
                  stroke="rgba(0, 27, 148, 0.12)"
                  strokeWidth="1.0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'all 0.2s ease' }}
                />
              ))}

              {airportPerformance.map((ap) => {
                const coords = AIRPORT_COORDS[ap.airport];
                if (!coords) return null;
                const isSelected = ap.airport === selectedAirportCode;
                const markerColor = ap.riskLevel === 'High' ? 'var(--danger)' : ap.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)';
                const pulseClass = ap.riskLevel === 'High' ? 'pulse-red' : ap.riskLevel === 'Medium' ? 'pulse-yellow' : 'pulse-green';

                return (
                  <g key={ap.airport} style={{ cursor: 'pointer' }} onClick={() => setSelectedAirportCode(ap.airport)}>
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isSelected ? 15 : 9}
                      fill={markerColor}
                      opacity={isSelected ? 0.35 : 0.2}
                      className={pulseClass}
                    />
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isSelected ? 7.5 : 5}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <text
                      x={coords.x + 12}
                      y={coords.y + 4}
                      fontSize="11px"
                      fontWeight="bold"
                      fill={isSelected ? 'var(--text-primary)' : 'var(--text-muted)'}
                      style={{ pointerEvents: 'none', transition: 'all 0.2s ease' }}
                    >
                      {ap.airport}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '11px', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                <span>High Risk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                <span>Medium Risk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                <span>Low Risk</span>
              </div>
            </div>
          </div>

          {/* Right Column: Insights Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedAirportData ? (
              <div 
                key={selectedAirportCode}
                className="animate-card-change"
                style={{ background: '#ffffff', border: '1px solid rgba(0, 27, 148, 0.08)', borderRadius: '12px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 12px rgba(0, 27, 148, 0.02)' }}
              >
                <div>
                  <span className={`health-badge ${selectedAirportData.riskLevel === 'High' ? 'red' : selectedAirportData.riskLevel === 'Medium' ? 'yellow' : 'green'}`} style={{ fontSize: '10px', float: 'right' }}>
                    {selectedAirportData.riskLevel} Risk
                  </span>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAirportData.airport}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{AIRPORT_NAMES[selectedAirportData.airport] || 'Airport Hub'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'var(--surface-dark)', borderRadius: '8px', borderLeft: '3px solid var(--info)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Departures</span>
                    <h5 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAirportData.totalFlights}</h5>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--surface-dark)', borderRadius: '8px', borderLeft: '3px solid var(--warning)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Delay</span>
                    <h5 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAirportData.avgDelay} min</h5>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--surface-dark)', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delay %</span>
                    <h5 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAirportData.delayPct}%</h5>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--surface-dark)', borderRadius: '8px', borderLeft: '3px solid #64748b' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cancelled %</span>
                    <h5 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAirportData.cancelPct}%</h5>
                  </div>
                </div>

                <div style={{ marginTop: '4px' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Delayed Routes Originating Here</h5>
                  {selectedAirportData.topRoutes && selectedAirportData.topRoutes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedAirportData.topRoutes.map((tr, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-dark)', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(0, 27, 148, 0.02)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tr.route}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--warning)' }}>{tr.avg_delay} min avg</strong> ({tr.count} delayed)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', background: 'var(--surface-dark)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      No delayed departures recorded.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ border: '1px dashed rgba(0, 27, 148, 0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Select an airport marker on the map to inspect operational insights and delay statistics.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightOperationsIntelligence;
