import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import InfoIcon from '../components/InfoIcon';

const API = 'http://127.0.0.1:8000';
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f97316'];

const RiskComplianceCenter = () => {
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({ month: 'All' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/filters`).then(r => setFilterOptions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.month !== 'All') params.month = filters.month;
    axios.get(`${API}/api/risk-compliance`, { params })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  if (loading) return (
    <div className="dashboard-container"><div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading Risk Intelligence...</div></div></div>
  );
  if (!data) return <div className="dashboard-container"><p>Failed to load data.</p></div>;

  const { kpis, dgcaViolationTypes, incidentTypes, severityDistribution, penaltyStatusBreakdown, fdtlBreakdown } = data;

  const riskColor = kpis.riskScore > 70 ? 'var(--danger)' : kpis.riskScore > 40 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Risk & Compliance Center</h1>
        <p>DGCA violations, weather disruptions, competitor incidents, and operational risk assessment.</p>
      </div>

      <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} />

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeftColor: riskColor }}>
          <div className="kpi-title">
            Operational Risk Score
            <InfoIcon tooltip="Calculated operational risk level based on delays, FDTL compliance, weather, and penalties." />
          </div>
          <div className="risk-gauge">
            <div className="risk-score-value" style={{ color: riskColor }}>{kpis.riskScore}</div>
            <div className="risk-score-label">out of 100</div>
          </div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="kpi-title">
            DGCA Violations (IndiGo)
            <InfoIcon tooltip="Number of regulatory compliance violations reported by DGCA." />
          </div>
          <div className="kpi-value">{kpis.dgcaViolations}</div>
          <div className="kpi-subtitle">₹{kpis.penaltyAmountLakh} Lakh in penalties</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--warning)' }}>
          <div className="kpi-title">
            Delhi Fog Events
            <InfoIcon tooltip="Count of adverse weather fog events recorded at Delhi (DEL) airport." />
          </div>
          <div className="kpi-value">{kpis.delhiFogEvents}</div>
          <div className="kpi-subtitle">Low visibility: {kpis.delhiLowVis}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--warning)' }}>
          <div className="kpi-title">
            Mumbai Weather Events
            <InfoIcon tooltip="Count of adverse weather visibility incidents recorded at Mumbai (BOM) airport." />
          </div>
          <div className="kpi-value">{kpis.mumbaiFogEvents}</div>
          <div className="kpi-subtitle">Low visibility: {kpis.mumbaiLowVis}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: kpis.fdtlComplianceRate > 90 ? 'var(--success)' : 'var(--danger)' }}>
          <div className="kpi-title">
            FDTL Compliance
            <InfoIcon tooltip="Percentage of schedules complying with Flight Duty Time Limitation rules." />
          </div>
          <div className="kpi-value">{kpis.fdtlComplianceRate}%</div>
        </div>
      </div>

      <div className="chart-grid">
        {/* DGCA Violation Types */}
        <div className="chart-card">
          <h3>
            DGCA Violation Types (IndiGo)
            <InfoIcon tooltip="DGCA violation categories recorded for IndiGo." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={dgcaViolationTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} name="Violations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FDTL Breakdown */}
        <div className="chart-card">
          <h3>
            FDTL Compliance Breakdown
            <InfoIcon tooltip="Proportion of FDTL compliant vs non-compliant pilot duty logs." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={fdtlBreakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="status"
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Competitor Incident Types */}
        <div className="chart-card">
          <h3>
            Industry Incident Types
            <InfoIcon tooltip="Safety and technical incident categories reported by competitor airlines." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={incidentTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="chart-card">
          <h3>
            Incident Severity Distribution
            <InfoIcon tooltip="Classification of industry incidents by level of severity." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={severityDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="count" nameKey="severity"
                  label={({ severity, percent }) => `${severity} ${(percent * 100).toFixed(0)}%`}
                >
                  {severityDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Penalty Status */}
      {penaltyStatusBreakdown.length > 0 && (
        <div className="chart-card">
          <h3>
            IndiGo Penalty Status
            <InfoIcon tooltip="Payment and settlement status of DGCA financial penalties." />
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: '#94a3b8' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '10px', color: '#94a3b8' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {penaltyStatusBreakdown.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px' }}>
                      <span className={`health-badge ${r.status === 'PAID' ? 'red' : r.status === 'PENDING' ? 'yellow' : 'green'}`} style={{ fontSize: '11px', padding: '3px 10px' }}>
                        <span className="health-dot" style={{ width: 6, height: 6 }} />
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskComplianceCenter;
