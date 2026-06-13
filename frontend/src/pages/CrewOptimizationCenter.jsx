import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import InfoIcon from '../components/InfoIcon';

const API = 'http://127.0.0.1:8000';
const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

const CrewOptimizationCenter = () => {
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({ month: 'All', baseStation: 'All' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/filters`).then(r => setFilterOptions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.month !== 'All') params.month = filters.month;
    if (filters.baseStation !== 'All') params.base_station = filters.baseStation;
    axios.get(`${API}/api/crew-optimization`, { params })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  if (loading) return (
    <div className="dashboard-container"><div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading Crew Data...</div></div></div>
  );
  if (!data) return <div className="dashboard-container"><p>Failed to load data.</p></div>;

  const { kpis, blockHoursDistribution, restHoursDistribution, complianceBreakdown, baseStationAnalysis, dutyTypeDistribution, optimization } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Crew Optimization Center</h1>
        <p>Crew duty logs, FDTL compliance, fatigue management, and roster optimization.</p>
      </div>

      <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} />

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            Total Crew
            <InfoIcon tooltip="Total number of active pilots and crew members in roster database." />
          </div>
          <div className="kpi-value">{kpis.totalCrew.toLocaleString()}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--info)' }}>
          <div className="kpi-title">
            Avg Block Hours
            <InfoIcon tooltip="Average flight block time hours flown by crew members." />
          </div>
          <div className="kpi-value">{kpis.avgBlockHours} hrs</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--warning)' }}>
          <div className="kpi-title">
            Avg Rest Hours
            <InfoIcon tooltip="Average rest period hours received before starting duty." />
          </div>
          <div className="kpi-value">{kpis.avgRestHours} hrs</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: kpis.complianceRate > 90 ? 'var(--success)' : 'var(--danger)' }}>
          <div className="kpi-title">
            FDTL Compliance
            <InfoIcon tooltip="Percentage of duties fully compliant with DGCA rest rules." />
          </div>
          <div className="kpi-value">{kpis.complianceRate}%</div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Block Hours Distribution */}
        <div className="chart-card">
          <h3>
            Block Hours Distribution
            <InfoIcon tooltip="Histogram showing distribution of flight block hours among crew members." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={blockHoursDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Crew Members" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rest Hours Distribution */}
        <div className="chart-card">
          <h3>
            Rest Hours Distribution
            <InfoIcon tooltip="Histogram showing distribution of rest hours provided before duty periods." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={restHoursDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Crew Members" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Compliance Breakdown */}
        <div className="chart-card">
          <h3>
            FDTL Compliance Breakdown
            <InfoIcon tooltip="Proportional breakdown of schedules meeting safety fatigue regulations." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={complianceBreakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={5} dataKey="count"
                  nameKey="status" label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                >
                  {complianceBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.status === 'Compliant' ? '#10b981' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Base Station Analysis */}
        <div className="chart-card">
          <h3>
            Top Base Stations (by crew count)
            <InfoIcon tooltip="Active crew member counts segmented by primary aircraft base." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={baseStationAnalysis} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="base_station" type="category" stroke="#64748b" fontSize={11} width={50} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="crew_count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Crew Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Duty Type Distribution */}
        <div className="chart-card">
          <h3>
            Duty Type Distribution
            <InfoIcon tooltip="Roster allocations segmented by flight duties, stand-bys, and training sessions." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dutyTypeDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="count" nameKey="type"
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                >
                  {dutyTypeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optimization Panel */}
        <div className="optimization-panel">
          <h3>
            🤖 Crew Optimization Recommendation
            <InfoIcon tooltip="Calculated optimization adjustments based on historical fatigue levels." />
          </h3>
          <div className="opt-metric">
            <span className="opt-metric-label">Current Crew Strength</span>
            <span className="opt-metric-value">{optimization.currentCrew.toLocaleString()}</span>
          </div>
          <div className="opt-metric">
            <span className="opt-metric-label">Recommended Crew</span>
            <span className="opt-metric-value" style={{ color: 'var(--info)' }}>{optimization.recommendedCrew.toLocaleString()}</span>
          </div>
          <div className="opt-metric">
            <span className="opt-metric-label">Additional Crew Required</span>
            <span className="opt-metric-value" style={{ color: optimization.additionalRequired > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {optimization.additionalRequired > 0 ? `+${optimization.additionalRequired}` : '0'}
            </span>
          </div>
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-dark)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Based on current FDTL compliance rate of {kpis.complianceRate}%, additional reserve crew is recommended to reduce fatigue-related non-compliance and improve operational safety margins.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewOptimizationCenter;
