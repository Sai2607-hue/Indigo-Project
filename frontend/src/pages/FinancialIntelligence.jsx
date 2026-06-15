import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import InfoIcon from '../components/InfoIcon';

const API = 'http://127.0.0.1:8000';
const COLORS = ['#001B94', '#00B259', '#3349aa', '#33c17a', '#6677bf', '#66d19c', '#99a4d4', '#99e0bd', '#4d60b3', '#1aa66b'];

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

  const { kpis, revenueByRoute, refundByRoute, revenueTrend, revenueShare, insights } = data;

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
        <div className="kpi-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="kpi-title">
            Revenue Lost
            <InfoIcon tooltip="Calculated revenue lost due to winter flight cancellations and drop between November and December." />
          </div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>
            ₹{(kpis.revenueLost / 10000000).toFixed(1)} Cr
          </div>
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
          <div className="kpi-value">{kpis.totalRefunds.toLocaleString()}</div>
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
        {/* Top 10 Revenue Routes - Bar Chart */}
        <div className="chart-card">
          <h3>
            Top 10 Revenue Routes
            <InfoIcon tooltip="Passenger ticket revenue across the top 10 routes." />
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={revenueByRoute}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                <XAxis dataKey="route" stroke="#64748b" fontSize={11} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickFormatter={v => `₹${(v/10000000).toFixed(0)}Cr`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }}
                  formatter={v => [`₹${(v/10000000).toFixed(2)} Cr`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#00B259" radius={[4, 4, 0, 0]} name="Revenue" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={v => v.toLocaleString()} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }}
                  formatter={v => [`${v.toLocaleString()} refunds`, 'Refunds']}
                />
                <Bar dataKey="refunds" fill="#001B94" radius={[0, 4, 4, 0]} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={d => d ? d.slice(5) : ''} interval={Math.floor(revenueTrend.length / 8)} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/10000000).toFixed(1)}Cr`} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }}
                  formatter={v => [`₹${(v/10000000).toFixed(2)} Cr`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#001B94" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Concentration Analysis */}
        {revenueShare && revenueShare.length > 0 && (
          <div className="chart-card">
            <h3>
              Top 10 Routes Revenue Contribution
              <InfoIcon tooltip="Revenue share breakdown among the top 10 highest performing routes." />
            </h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={revenueShare.filter(r => r.name !== 'Other Routes').sort((a, b) => b.value - a.value)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={v => `₹${(v/10000000).toFixed(1)}Cr`} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', color: '#1e293b' }}
                    formatter={(value, name, props) => {
                      const topRoutes = revenueShare.filter(r => r.name !== 'Other Routes');
                      const totalTop10 = topRoutes.reduce((sum, r) => sum + r.value, 0);
                      const pctOfTop10 = ((value / totalTop10) * 100).toFixed(1);
                      return [`₹${(value / 10000000).toFixed(2)} Cr (${pctOfTop10}%)`, 'Revenue'];
                    }}
                  />
                  <Bar dataKey="value" fill="#001B94" radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
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
