import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import InfoIcon from '../components/InfoIcon';

const API = 'http://127.0.0.1:8000';
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const FlightOperationsIntelligence = () => {
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({ month: 'All', origin: 'All', destination: 'All', status: 'All' });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'avg_delay', direction: 'asc' });

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
  if (!data) return <div className="dashboard-container"><p>Failed to load data.</p></div>;

  const { kpis, riskSummary = {}, delayByRoute, cancelByRoute, topDelayAirports, routePerformance } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Flight Operations Intelligence</h1>
        <p>Deep dive into flight schedules, delays, cancellations, and route performance.</p>
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
        {/* Delay by Route */}
        <div className="chart-card">
          <h3>
            Top 10 Delay Routes
            <InfoIcon tooltip="Routes experiencing the highest frequency and severity of delays (average minutes and count)." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={delayByRoute} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis xAxisId="count" type="number" stroke="#001B94" fontSize={11} />
                <XAxis xAxisId="avg" type="number" stroke="#00B259" fontSize={11} orientation="top" />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar xAxisId="count" dataKey="count" fill="#001B94" radius={[0, 4, 4, 0]} name="Delay Count" />
                <Bar xAxisId="avg" dataKey="avg_delay_minutes" fill="#00B259" radius={[0, 4, 4, 0]} name="Avg Delay (min)" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#001B94" radius={[0, 4, 4, 0]} name="Cancelled Flights" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Top Delay Airports */}
        <div className="chart-card">
          <h3>
            Top Delay Airports (Origin)
            <InfoIcon tooltip="Departure airports experiencing the highest absolute count of delays." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topDelayAirports}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="airport" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#001B94" radius={[6, 6, 0, 0]} name="Delayed Flights" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Route Performance Heatmap (table) */}
      <div className="chart-card">
        <h3>
          Route Performance — Highest Average Delay (minutes)
          <InfoIcon tooltip="Average departure delay duration in minutes by route." />
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th 
                  onClick={() => requestSort('route')} 
                  style={{ textAlign: 'left', padding: '10px', color: '#94a3b8', cursor: 'pointer', userSelect: 'none' }}
                >
                  Route{getSortIndicator('route')}
                </th>
                <th 
                  onClick={() => requestSort('avg_delay')} 
                  style={{ textAlign: 'right', padding: '10px', color: '#94a3b8', cursor: 'pointer', userSelect: 'none' }}
                >
                  Avg Delay (min){getSortIndicator('avg_delay')}
                </th>
                <th 
                  onClick={() => requestSort('total_flights')} 
                  style={{ textAlign: 'right', padding: '10px', color: '#94a3b8', cursor: 'pointer', userSelect: 'none' }}
                >
                  Total Flights{getSortIndicator('total_flights')}
                </th>
                <th 
                  onClick={() => requestSort('risk_level')} 
                  style={{ textAlign: 'left', padding: '10px', color: '#94a3b8', cursor: 'pointer', userSelect: 'none' }}
                >
                  Risk Level{getSortIndicator('risk_level')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRoutePerformance.map((r, i) => (
                <tr key={i} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{r.route}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{r.avg_delay}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{r.total_flights}</td>
                  <td style={{ padding: '10px' }}>
                    <span className={`health-badge ${r.avg_delay > 30 ? 'red' : r.avg_delay > 15 ? 'yellow' : 'green'}`} style={{ fontSize: '11px', padding: '3px 10px' }}>
                      <span className="health-dot" style={{ width: 6, height: 6 }} />
                      {r.avg_delay > 30 ? 'High' : r.avg_delay > 15 ? 'Medium' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FlightOperationsIntelligence;
