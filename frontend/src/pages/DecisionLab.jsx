import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import InfoIcon from '../components/InfoIcon';

const API = 'http://127.0.0.1:8000';

const PARAMS = [
  { id: 'crewChange', label: 'Crew Availability', unit: '%', min: -30, max: 30, step: 1, default: 0, icon: '👥' },
  { id: 'delayReduction', label: 'Delay Reduction', unit: '%', min: 0, max: 50, step: 1, default: 0, icon: '⏱️' },
  { id: 'cancellationReduction', label: 'Cancellation Reduction', unit: '%', min: 0, max: 50, step: 1, default: 0, icon: '✈️' },
  { id: 'fareAdjustment', label: 'Fare Adjustment', unit: '%', min: -20, max: 20, step: 1, default: 0, icon: '💰' },
  { id: 'loadFactorChange', label: 'Load Factor', unit: 'pts', min: -15, max: 15, step: 1, default: 0, icon: '📊' },
  { id: 'weatherSeverity', label: 'Weather Severity', unit: 'x', min: 0.5, max: 2.0, step: 0.1, default: 1.0, icon: '🌦️' },
];

/* ─── Compact Slider ─────────────────────────────────────────────────────── */
const Slider = ({ p, value, onChange }) => {
  const defaultPct = ((p.default - p.min) / (p.max - p.min)) * 100;
  const pct = ((value - p.min) / (p.max - p.min)) * 100;
  const isDefault = value === p.default;
  const displayVal = p.id === 'weatherSeverity' ? value.toFixed(1) : value;
  const sign = value > 0 && p.id !== 'weatherSeverity' ? '+' : '';

  const getSliderBackground = () => {
    if (pct === defaultPct) {
      return 'rgba(0, 27, 148, 0.12)';
    }
    if (pct > defaultPct) {
      return `linear-gradient(to right, rgba(0, 27, 148, 0.12) 0%, rgba(0, 27, 148, 0.12) ${defaultPct}%, var(--indigo-primary) ${defaultPct}%, var(--indigo-primary) ${pct}%, rgba(0, 27, 148, 0.12) ${pct}%, rgba(0, 27, 148, 0.12) 100%)`;
    }
    return `linear-gradient(to right, rgba(0, 27, 148, 0.12) 0%, rgba(0, 27, 148, 0.12) ${pct}%, var(--indigo-primary) ${pct}%, var(--indigo-primary) ${defaultPct}%, rgba(0, 27, 148, 0.12) ${defaultPct}%, rgba(0, 27, 148, 0.12) 100%)`;
  };

  return (
    <div style={{ flex: '1 1 0', minWidth: '150px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.icon} {p.label}</span>
        <span style={{
          fontSize: '12px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
          color: isDefault ? 'var(--text-muted)' : 'var(--primary)',
          background: isDefault ? 'transparent' : 'rgba(0,27,148,0.06)',
        }}>{sign}{displayVal}{p.unit}</span>
      </div>
      <input type="range" min={p.min} max={p.max} step={p.step} value={value}
        onChange={e => onChange(p.id, parseFloat(e.target.value))}
        className="scenario-slider"
        style={{
          width: '100%',
          background: getSliderBackground(),
        }}
      />
    </div>
  );
};

/* ─── Metric Tile ────────────────────────────────────────────────────────── */
const Tile = ({ label, baseline, projected, format, inverse }) => {
  const diff = projected - baseline;
  const pct = baseline !== 0 ? (diff / Math.abs(baseline)) * 100 : 0;
  const better = inverse ? diff < 0 : diff > 0;
  const same = Math.abs(diff) < 0.01;

  const fmt = v => {
    if (format === 'cr') return `₹${(v / 1e7).toFixed(2)} Cr`;
    if (format === '%') return `${v.toFixed(1)}%`;
    if (format === '#') return Math.round(v).toLocaleString();
    if (format === 'min') return `${v.toFixed(1)} min`;
    return v.toFixed(1);
  };

  return (
    <div style={{
      padding: '14px 16px', background: '#fff', borderRadius: '10px',
      border: `1px solid ${same ? 'var(--border-subtle)' : better ? 'rgba(0,178,89,0.18)' : 'rgba(239,68,68,0.18)'}`,
      borderTop: same ? undefined : `3px solid ${better ? 'var(--success)' : 'var(--danger)'}`,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        {!same && <span style={{
          fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
          color: better ? 'var(--success)' : 'var(--danger)',
          background: better ? 'rgba(0,178,89,0.1)' : 'rgba(239,68,68,0.1)',
        }}>{better ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%</span>}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{fmt(projected)}</div>
      {!same && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>was {fmt(baseline)}</div>}
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
const DecisionLab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState(() => {
    const d = {}; PARAMS.forEach(p => d[p.id] = p.default); return d;
  });
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/decision-lab`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (id, v) => { setParams(p => ({ ...p, [id]: v })); setActivePreset(null); };
  const reset = () => { const d = {}; PARAMS.forEach(p => d[p.id] = p.default); setParams(d); setActivePreset(null); };
  const modified = PARAMS.some(p => params[p.id] !== p.default);

  /* ─── Projection Engine ────────────────────────────────────────────────── */
  const proj = useMemo(() => {
    if (!data) return null;
    const b = data.baseline;

    // If no slider is changed, return exact baseline values
    if (!PARAMS.some(p => params[p.id] !== p.default)) {
      return {
        totalFlights: b.totalFlights,
        onTime: b.onTime,
        delayed: b.delayed,
        cancelled: b.cancelled,
        delayPct: b.delayPct,
        cancelPct: b.cancelPct,
        avgDelay: b.avgDelay,
        revenue: b.totalRevenue,
        refunds: b.totalRefunds,
        loadFactor: b.avgLoadFactor,
        fdtl: b.fdtlCompliance,
        penalties: b.penaltyCount,
        crew: b.totalCrew,
        health: Math.round(
          Math.max(0, 100 - b.delayPct * 3) * 0.3 +
          Math.max(0, 100 - b.cancelPct * 5) * 0.3 +
          b.fdtlCompliance * 0.4
        ),
      };
    }

    // Sliders have been changed — compute projections
    const wDelay = (params.weatherSeverity - 1) * 15;
    const dReduce = b.delayPct * (params.delayReduction / 100);
    const cEffect = params.crewChange > 0 ? params.crewChange * 0.15 : params.crewChange * 0.25;
    const delayPct = Math.max(0, Math.min(100, b.delayPct - dReduce + wDelay - cEffect));
    const delayed = Math.round(b.totalFlights * delayPct / 100);

    const wCancel = (params.weatherSeverity - 1) * 8;
    const cReduce = b.cancelPct * (params.cancellationReduction / 100);
    const cancelPct = Math.max(0, Math.min(100, b.cancelPct - cReduce + wCancel));
    const cancelled = Math.round(b.totalFlights * cancelPct / 100);
    const onTime = b.totalFlights - delayed - cancelled;

    const avgDelay = Math.max(0, b.avgDelay * (1 - params.delayReduction / 100) * params.weatherSeverity);

    const fareE = 1 + params.fareAdjustment / 100;
    const loadE = 1 + params.loadFactorChange / b.avgLoadFactor;
    const cancelE = 1 - (cancelPct - b.cancelPct) / 100;
    const revenue = b.totalRevenue * fareE * loadE * cancelE;

    const loadFactor = Math.max(0, Math.min(100, b.avgLoadFactor + params.loadFactorChange));
    const fdtl = Math.max(0, Math.min(100, b.fdtlCompliance + params.crewChange * 0.3));

    const penaltyM = fdtl >= 95 ? 0.5 : fdtl >= 90 ? 0.8 : 1.2;
    const penalties = Math.round(b.penaltyCount * penaltyM);

    const refunds = b.totalRefunds * (cancelPct / Math.max(b.cancelPct, 0.1));
    const crew = Math.round(b.totalCrew * (1 + params.crewChange / 100));

    const health = Math.round(
      Math.max(0, 100 - delayPct * 3) * 0.3 +
      Math.max(0, 100 - cancelPct * 5) * 0.3 +
      fdtl * 0.4
    );

    return {
      totalFlights: b.totalFlights, onTime, delayed, cancelled,
      delayPct: Math.round(delayPct * 10) / 10,
      cancelPct: Math.round(cancelPct * 10) / 10,
      avgDelay: Math.round(avgDelay * 10) / 10,
      revenue: Math.round(revenue), refunds: Math.round(refunds),
      loadFactor: Math.round(loadFactor * 10) / 10,
      fdtl: Math.round(fdtl * 10) / 10,
      penalties, crew, health,
    };
  }, [data, params]);

  const radar = useMemo(() => {
    if (!data || !proj) return [];
    const b = data.baseline;
    return [
      { m: 'On-Time', baseline: 100 - b.delayPct - b.cancelPct, projected: 100 - proj.delayPct - proj.cancelPct },
      { m: 'Revenue', baseline: 100, projected: Math.round((proj.revenue / b.totalRevenue) * 100) },
      { m: 'FDTL', baseline: b.fdtlCompliance, projected: proj.fdtl },
      { m: 'Load Factor', baseline: b.avgLoadFactor, projected: proj.loadFactor },
      { m: 'Low Penalties', baseline: Math.max(0, 100 - b.penaltyCount), projected: Math.max(0, 100 - proj.penalties) },
    ];
  }, [data, proj]);

  if (loading) return (
    <div className="dashboard-container"><div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Initializing Decision Lab...</div></div></div>
  );
  if (!data) return (
    <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ padding: '32px', background: 'var(--surface-dark)', borderRadius: '16px', border: '1px solid var(--danger)', textAlign: 'center', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: 'var(--danger)', margin: '0 0 12px 0' }}>Failed to Load Data</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Unable to connect to the Decision Lab engine.</p>
        <button onClick={() => window.location.reload()}
          style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          Retry
        </button>
      </div>
    </div>
  );

  const b = data.baseline;

  return (
    <div className="dashboard-container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div className="dashboard-header" style={{ marginBottom: 0 }}>
          <h1>🧪 Decision Lab</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} disabled={!modified} style={{
            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, 
            cursor: modified ? 'pointer' : 'not-allowed',
            border: modified ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-subtle)', 
            background: modified ? 'rgba(239,68,68,0.04)' : 'var(--surface-light)', 
            color: modified ? 'var(--danger)' : 'var(--text-muted)',
            transition: 'all 0.2s ease',
          }}>↺ Reset All</button>
        </div>
      </div>

      {/* ── Sliders Strip ── */}
      <div className="chart-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {PARAMS.map(p => <Slider key={p.id} p={p} value={params[p.id]} onChange={set} />)}
        </div>
      </div>

      {/* ── Health Score + Key Metrics ── */}
      {proj && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Health Score */}
          <div className="chart-card" style={{
            padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: proj.health >= 80 ? 'linear-gradient(135deg, rgba(0,178,89,0.04), rgba(0,178,89,0.1))' : proj.health >= 60 ? 'linear-gradient(135deg, rgba(245,158,11,0.04), rgba(245,158,11,0.1))' : 'linear-gradient(135deg, rgba(239,68,68,0.04), rgba(239,68,68,0.1))',
            borderBottom: `4px solid ${proj.health >= 80 ? 'var(--success)' : proj.health >= 60 ? 'var(--warning)' : 'var(--danger)'}`,
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>Health Score</span>
            <span style={{
              fontSize: '48px', fontWeight: 900, lineHeight: 1,
              color: proj.health >= 80 ? 'var(--success)' : proj.health >= 60 ? 'var(--warning)' : 'var(--danger)',
            }}>{proj.health}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>/100</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
              {proj.health >= 80 ? 'Healthy operations' : proj.health >= 60 ? 'Monitor closely' : 'Immediate action needed'}
            </span>
          </div>

          {/* 6 Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Tile label="Revenue" baseline={b.totalRevenue} projected={proj.revenue} format="cr" />
            <Tile label="Delay Rate" baseline={b.delayPct} projected={proj.delayPct} format="%" inverse />
            <Tile label="Cancel Rate" baseline={b.cancelPct} projected={proj.cancelPct} format="%" inverse />
            <Tile label="On-Time Flights" baseline={b.onTime} projected={proj.onTime} format="#" />
            <Tile label="FDTL Compliance" baseline={b.fdtlCompliance} projected={proj.fdtl} format="%" />
            <Tile label="Avg Delay" baseline={b.avgDelay} projected={proj.avgDelay} format="min" inverse />
          </div>
        </div>
      )}

      {/* ── Charts Row ── */}
      {proj && (
        <div className="chart-grid" style={{ marginBottom: '20px' }}>
          {/* Radar */}
          <div className="chart-card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: '13px' }}>
              Baseline vs Projected
              <InfoIcon tooltip="Radar comparison of key metrics." />
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radar}>
                  <PolarGrid stroke="rgba(0,27,148,0.08)" />
                  <PolarAngleAxis dataKey="m" stroke="var(--text-secondary)" fontSize={10} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--text-muted)" fontSize={9} />
                  <Radar name="Baseline" dataKey="baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.12} strokeWidth={2} />
                  <Radar name="Projected" dataKey="projected" stroke="#001B94" fill="#001B94" fillOpacity={0.18} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar */}
          <div className="chart-card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: '13px' }}>
              Flight Status Comparison
              <InfoIcon tooltip="Side-by-side baseline vs projected flight statuses." />
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { status: 'On Time', Baseline: b.onTime, Projected: proj.onTime },
                  { status: 'Delayed', Baseline: b.delayed, Projected: proj.delayed },
                  { status: 'Cancelled', Baseline: b.cancelled, Projected: proj.cancelled },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,27,148,0.06)" />
                  <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,27,148,0.08)', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Projected" fill="#001B94" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Route Impact Table ── */}
      {data.routeMetrics?.length > 0 && proj && (
        <div className="chart-card" style={{ padding: '16px 20px' }}>
          <h3 style={{ fontSize: '13px' }}>
            Top Routes — Projected Impact
            <InfoIcon tooltip="How current scenario affects the top revenue routes." />
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,27,148,0.08)' }}>
                  {['Route', 'Flights', 'Baseline Rev', 'Projected Rev', 'Δ Revenue', 'Proj. Delay %'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.routeMetrics.slice(0, 10).map((r, i) => {
                  const isDefault = !modified;
                  const fE = 1 + params.fareAdjustment / 100;
                  const lE = 1 + params.loadFactorChange / Math.max(b.avgLoadFactor, 1);
                  const pRev = isDefault ? r.revenue : r.revenue * fE * lE;
                  const dRev = pRev - r.revenue;
                  const wI = (params.weatherSeverity - 1) * 15;
                  const cE = params.crewChange > 0 ? params.crewChange * 0.15 : params.crewChange * 0.25;
                  const pDelay = isDefault ? r.delayPct : Math.max(0, Math.min(100, r.delayPct - r.delayPct * (params.delayReduction / 100) + wI - cE));

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,27,148,0.04)' }} className="table-row-hover">
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{r.route}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--text-secondary)' }}>{r.flights}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--text-secondary)' }}>₹{(r.revenue / 1e7).toFixed(2)} Cr</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>₹{(pRev / 1e7).toFixed(2)} Cr</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, color: Math.abs(dRev) < 0.01 ? 'var(--text-muted)' : dRev >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {Math.abs(dRev) < 0.01 ? '—' : `${dRev >= 0 ? '+' : ''}₹${(dRev / 1e7).toFixed(2)} Cr`}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                        <span className={`health-badge ${pDelay > 20 ? 'red' : pDelay > 10 ? 'yellow' : 'green'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {pDelay.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionLab;
