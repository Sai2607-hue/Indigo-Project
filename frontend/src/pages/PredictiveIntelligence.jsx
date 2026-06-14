import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';
import InfoIcon from '../components/InfoIcon';

const API = 'http://127.0.0.1:8000';

const PredictiveIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/predictive-intelligence`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="dashboard-container"><div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading Predictive Models...</div></div></div>
  );
  if (!data) return <div className="dashboard-container"><p>Failed to load data.</p></div>;

  const { revenueForecast, delayForecast, complianceForecast, recommendations } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Predictive Intelligence</h1>
        <p>Revenue forecasting, delay predictions, compliance risk outlook, and actionable recommendations.</p>
      </div>

      <div className="chart-grid">
        {/* Revenue Forecast */}
        <div className="chart-card">
          <h3>
            Revenue Forecast
            <InfoIcon tooltip="AI projection of passenger revenues for the upcoming month based on linear trends." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={revenueForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/10000000).toFixed(1)}Cr`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={v => [`₹${(v/10000000).toFixed(2)} Cr`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}
                  fill="#001B94"
                  /* forecast bar will be lighter */
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delay Forecast */}
        <div className="chart-card">
          <h3>
            Delay % Forecast
            <InfoIcon tooltip="AI projection of flight delay rates based on historical trend lines." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={delayForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={v => [`${v}%`, 'Delay Rate']}
                />
                <Line type="monotone" dataKey="delayPct" stroke="#001B94" strokeWidth={3} dot={{ r: 6, fill: '#001B94' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Compliance Forecast */}
        <div className="chart-card">
          <h3>
            Compliance Risk Outlook
            <InfoIcon tooltip="AI crew FDTL compliance risk projections over the next quarter." />
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={complianceForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={v => [`${v}%`, 'Compliance']}
                />
                <Line type="monotone" dataKey="compliance" stroke="#00B259" strokeWidth={3} dot={{ r: 6, fill: '#00B259' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="chart-card">
          <h3>
            Forecast Summary
            <InfoIcon tooltip="Executive summary of actual vs forecast revenue values." />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {revenueForecast.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-dark)', borderRadius: '8px', borderLeft: `3px solid ${item.month.includes('Forecast') ? '#00B259' : '#001B94'}` }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.month}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: item.month.includes('Forecast') ? '#00B259' : 'var(--text-primary)' }}>
                  ₹{(item.revenue / 10000000).toFixed(2)} Cr
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation Engine */}
      <div style={{ marginTop: '4px' }}>
        <div className="chart-card" style={{ background: 'linear-gradient(145deg, rgba(0, 102, 255, 0.04) 0%, rgba(17, 24, 39, 0.98) 100%)', border: '1px solid var(--border-accent)' }}>
          <h3 style={{ color: 'var(--info)' }}>
            🤖 Recommendation Engine
            <InfoIcon tooltip="Actionable operational recommendations generated by the predictive engine." />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            {recommendations.map((rec, i) => (
              <div key={i} className={`recommendation-card ${rec.priority.toLowerCase()}`}>
                <div className="rec-priority">{rec.priority} Priority</div>
                <div className="rec-title">{rec.title}</div>
                <div className="rec-detail">{rec.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveIntelligence;
