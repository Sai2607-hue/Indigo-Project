import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import InfoIcon from '../components/InfoIcon';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const COLORS = { onTime: '#00B259', delayed: '#001B94', cancelled: '#4d6eb2' };

const ExecutiveCommandCenter = () => {
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({ month: 'All', airport: 'All', route: 'All' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/filters`).then(r => setFilterOptions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.month !== 'All') params.month = filters.month;
    if (filters.airport !== 'All') params.airport = filters.airport;
    if (filters.route !== 'All') params.route = filters.route;
    axios.get(`${API}/api/executive-center`, { params })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return (
    <div className="dashboard-container">
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">Loading Executive Intelligence...</div>
      </div>
    </div>
  );

  if (!data) return <div className="dashboard-container"><p>Failed to load data.</p></div>;

  const { kpis, flightStatusData, topRiskRoutes, insights, revChangePercent } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Executive Command Center</h1>
      </div>

      <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} />

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            Total Flights
            <InfoIcon tooltip="Total count of scheduled and operated flights for the selected period." />
          </div>
          <div className="kpi-value">{kpis.totalFlights.toLocaleString()}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--success)' }}>
          <div className="kpi-title">
            Total Revenue
            <InfoIcon tooltip="Gross passenger revenue generated across all route networks." />
          </div>
          <div className="kpi-value">₹{(kpis.totalRevenue / 10000000).toFixed(2)} Cr</div>
          {revChangePercent !== 0 && (
            <div className="kpi-subtitle" style={{ color: revChangePercent < 0 ? 'var(--danger)' : 'var(--success)' }}>
              {revChangePercent > 0 ? '▲' : '▼'} {Math.abs(revChangePercent)}% MoM
            </div>
          )}
        </div>
        <div className="kpi-card" style={{ borderLeftColor: kpis.delayPct > 15 ? 'var(--danger)' : 'var(--warning)' }}>
          <div className="kpi-title">
            Delay %
            <InfoIcon tooltip="Percentage of flights delayed by 15 minutes or more." />
          </div>
          <div className="kpi-value">{kpis.delayPct}%</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="kpi-title">
            Cancellation %
            <InfoIcon tooltip="Percentage of flights cancelled due to operational or weather issues." />
          </div>
          <div className="kpi-value">{kpis.cancelPct}%</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: kpis.fdtlCompliance > 90 ? 'var(--success)' : 'var(--danger)' }}>
          <div className="kpi-title">
            FDTL Compliance
            <InfoIcon tooltip="Percentage of crew duties compliant with regulatory rest limits." />
          </div>
          <div className="kpi-value">{kpis.fdtlCompliance}%</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="kpi-title">
            DGCA Events
            <InfoIcon tooltip="Total count and monetary value of regulatory penalties levied by the DGCA." />
          </div>
          <div className="kpi-value">{kpis.totalPenalties}</div>
          <div className="kpi-subtitle">Penalty Exposure: ₹{(kpis.penaltyAmount / 100).toFixed(2)} Cr</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="chart-grid" style={{ gridTemplateColumns: '1fr 1.8fr' }}>
        {/* Flight Status Donut */}
        <div className="chart-card">
          <h3>
            Flight Status Distribution
            <InfoIcon tooltip="Breakdown of flight operations by on-time, delayed, and cancelled status." />
          </h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={flightStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill={COLORS.onTime} />
                  <Cell fill={COLORS.delayed} />
                  <Cell fill={COLORS.cancelled} />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Risk Routes Table */}
        <div className="chart-card">
          <h3>
            Top Risk Routes
            <InfoIcon tooltip="Routes carrying the highest operational risk, delays, and passenger revenue exposure." />
          </h3>
          <div style={{ height: 260, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,27,148,0.08)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-muted)' }}>Route</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-muted)' }}>Delays</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-muted)' }}>Revenue</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-muted)' }}>Cancellation %</th>
                </tr>
              </thead>
              <tbody>
                {topRiskRoutes && topRiskRoutes.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,27,148,0.04)' }} className="table-row-hover">
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{r.route}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--warning)', fontWeight: 600 }}>{r.delays}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--success)' }}>₹{(r.revenue / 10000000).toFixed(2)} Cr</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <span className={`health-badge ${r.cancelPct > 10 ? 'red' : r.cancelPct > 5 ? 'yellow' : 'green'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {r.cancelPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Executive Insights */}
      <div className="insights-panel">
        <h3>📊 Executive Insights</h3>
        {insights.map((insight, i) => (
          <div key={i} className="insight-item">{insight}</div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveCommandCenter;
