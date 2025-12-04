import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agreements from './pages/Agreements';
import NewAgreement from './pages/NewAgreement';
import AgreementWorkflow from './pages/AgreementWorkflow';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agreements" element={<Agreements />} />
          <Route path="/agreements/new" element={<NewAgreement />} />
          <Route path="/agreements/:id/workflow" element={<AgreementWorkflow />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;


