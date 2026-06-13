import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import InfoIcon from '../components/InfoIcon';

const API = 'http://127.0.0.1:8000';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#a855f7'];

const FinancialIntelligence = () => {
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({ month: 'All', route: 'All' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/filters`).then(r => setFilterOptions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v !== 'All') params[k] = v; });
    axios.get(`${API}/api/financial-intelligence`, { params })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  if (loading) return (
    <div className="dashboard-container"><div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading Financial Intelligence...</div></div></div>
  );
  if (!data) return <div className="dashboard-container"><p>Failed to load data.</p></div>;

  const { kpis, revenueByRoute, refundByRoute, revenueTrend, revenueBySeasonTag, insights } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Financial Intelligence</h1>
        <p>Revenue tracking, route profitability, refund analysis, and financial performance.</p>
      </div>

      <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} />

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeftColor: 'var(--success)' }}>
          <div className="kpi-title">
            November Revenue
            <InfoIcon tooltip="Total ticket sales revenue collected in November 2025." />
          </div>
          <div className="kpi-value">₹{(kpis.novRevenue / 10000000).toFixed(2)} Cr</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--info)' }}>
          <div className="kpi-title">
            December Revenue
            <InfoIcon tooltip="Total ticket sales revenue collected in December 2025." />
          </div>
          <div className="kpi-value">₹{(kpis.decRevenue / 10000000).toFixed(2)} Cr</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: kpis.revChangePercent < 0 ? 'var(--danger)' : 'var(--success)' }}>
          <div className="kpi-title">
            Revenue Change
            <InfoIcon tooltip="Percentage increase or decrease in revenue month-over-month." />
          </div>
          <div className="kpi-value" style={{ color: kpis.revChangePercent < 0 ? 'var(--danger)' : 'var(--success)' }}>
            {kpis.revChangePercent > 0 ? '+' : ''}{kpis.revChangePercent}%
          </div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--warning)' }}>
          <div className="kpi-title">
            Total Refunds
            <InfoIcon tooltip="Total refunds issued to passengers due to disruptions." />
          </div>
          <div className="kpi-value">₹{(kpis.totalRefunds / 100000).toFixed(1)} L</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--success)' }}>
          <div className="kpi-title">
            Top Revenue Route
            <InfoIcon tooltip="Specific route that generated the highest total revenue." />
          </div>
          <div className="kpi-value" style={{ fontSize: '22px' }}>{kpis.topRevenueRoute}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">
            Avg Load Factor
            <InfoIcon tooltip="Average percentage of aircraft passenger capacity filled." />
          </div>
          <div className="kpi-value">{kpis.avgLoadFactor}%</div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Top 10 Revenue Routes */}
        <div className="chart-card">
          <h3>
            Top 10 Revenue Routes
            <InfoIcon tooltip="Routes generating the highest total passenger ticket sales." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={revenueByRoute} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/10000000).toFixed(1)}Cr`} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={v => [`₹${(v/10000000).toFixed(2)} Cr`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Refund by Route */}
        <div className="chart-card">
          <h3>
            Top Refund Routes
            <InfoIcon tooltip="Routes with the highest total value of ticket refunds issued." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={refundByRoute} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={v => [`₹${(v/100000).toFixed(1)} Lakh`, 'Refunds']}
                />
                <Bar dataKey="refunds" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Revenue Trend */}
        <div className="chart-card">
          <h3>
            Revenue Trend (Daily)
            <InfoIcon tooltip="Daily aggregate flight revenue trends across all route operations." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={d => d ? d.slice(5) : ''} interval={Math.floor(revenueTrend.length / 8)} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/10000000).toFixed(1)}Cr`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={v => [`₹${(v/10000000).toFixed(2)} Cr`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Season */}
        {revenueBySeasonTag.length > 0 && (
          <div className="chart-card">
            <h3>
              Revenue by Season Tag
              <InfoIcon tooltip="Percentage breakdown of total flight revenue categorized by season." />
            </h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={revenueBySeasonTag} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="revenue"
                    nameKey="season_tag" label={({ season_tag, percent }) => `${season_tag} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueBySeasonTag.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Financial Insights */}
      <div className="insights-panel">
        <h3>💰 Financial Insights</h3>
        {insights.map((insight, i) => (
          <div key={i} className="insight-item">{insight}</div>
        ))}
      </div>
    </div>
  );
};

export default FinancialIntelligence;
