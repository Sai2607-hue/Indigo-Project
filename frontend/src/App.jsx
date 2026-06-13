import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { MdDashboard, MdFlightTakeoff, MdAttachMoney, MdPeople, MdWarning, MdTimeline } from 'react-icons/md';
import './index.css';

import ExecutiveCommandCenter from './pages/ExecutiveCommandCenter';
import FlightOperationsIntelligence from './pages/FlightOperationsIntelligence';
import FinancialIntelligence from './pages/FinancialIntelligence';
import CrewOptimizationCenter from './pages/CrewOptimizationCenter';
import RiskComplianceCenter from './pages/RiskComplianceCenter';
import PredictiveIntelligence from './pages/PredictiveIntelligence';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <MdFlightTakeoff size={28} />
            <span>Indigo OCC</span>
          </div>
          <nav>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              <MdDashboard size={20} /> Executive Center
            </NavLink>
            <NavLink to="/flight-operations" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdFlightTakeoff size={20} /> Flight Operations
            </NavLink>
            <NavLink to="/financial-intelligence" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdAttachMoney size={20} /> Financial Intel
            </NavLink>
            <NavLink to="/crew-optimization" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdPeople size={20} /> Crew Optimization
            </NavLink>
            <NavLink to="/risk-compliance" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdWarning size={20} /> Risk & Compliance
            </NavLink>
            <NavLink to="/predictive-intelligence" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdTimeline size={20} /> Predictive Intel
            </NavLink>
          </nav>
        </aside>
        
        <main style={{ width: 'calc(100% - 260px)', backgroundColor: 'var(--surface-dark)', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<ExecutiveCommandCenter />} />
            <Route path="/flight-operations" element={<FlightOperationsIntelligence />} />
            <Route path="/financial-intelligence" element={<FinancialIntelligence />} />
            <Route path="/crew-optimization" element={<CrewOptimizationCenter />} />
            <Route path="/risk-compliance" element={<RiskComplianceCenter />} />
            <Route path="/predictive-intelligence" element={<PredictiveIntelligence />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
