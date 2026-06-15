import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { MdDashboard, MdFlightTakeoff, MdAttachMoney, MdPeople, MdWarning, MdTimeline, MdScience } from 'react-icons/md';
import './index.css';
import indigoLogo from './assets/indigo-logo.svg';

import ExecutiveCommandCenter from './pages/ExecutiveCommandCenter';
import FlightOperationsIntelligence from './pages/FlightOperationsIntelligence';
import FinancialIntelligence from './pages/FinancialIntelligence';
import CrewOptimizationCenter from './pages/CrewOptimizationCenter';
import RiskComplianceCenter from './pages/RiskComplianceCenter';
import PredictiveIntelligence from './pages/PredictiveIntelligence';
import DecisionLab from './pages/DecisionLab';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src={indigoLogo} alt="IndiGo Logo" style={{ height: '24px', filter: 'brightness(0) invert(1)', marginRight: '10px' }} />
          </div>
          <nav>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              <MdDashboard size={20} /> 6E Command Center
            </NavLink>
            <NavLink to="/flight-operations" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdFlightTakeoff size={20} /> 6E Flight Operations
            </NavLink>
            <NavLink to="/financial-intelligence" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdAttachMoney size={20} /> 6E Financial Intelligence
            </NavLink>
            <NavLink to="/crew-optimization" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdPeople size={20} /> 6E Crew Planning
            </NavLink>
            <NavLink to="/risk-compliance" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdWarning size={20} /> 6E Safety & Risk
            </NavLink>
            <NavLink to="/predictive-intelligence" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdTimeline size={20} /> 6E Foresight
            </NavLink>
            <NavLink to="/decision-lab" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <MdScience size={20} /> 6E Decision Lab
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
            <Route path="/decision-lab" element={<DecisionLab />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

