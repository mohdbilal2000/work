import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Deliverables from './pages/Deliverables';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Tickets from './pages/Tickets';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deliverables" element={<Deliverables />} />
          <Route path="/team" element={<Team />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/tickets" element={<Tickets />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

