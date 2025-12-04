import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Agreements from './pages/Agreements';
import WorkflowStepDetail from './pages/WorkflowStepDetail';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Tickets from './pages/Tickets';
import Induction from './pages/Induction';
import Layout from './components/Layout';
import Login from './pages/Login';
import MemberLogin from './pages/MemberLogin';
import MemberRegister from './pages/MemberRegister';
import PrivateRoute from './components/PrivateRoute';

// Determine basename based on environment
const getBasename = () => {
  // In production, the app is served from /csm
  if (window.location.pathname.startsWith('/csm')) {
    return '/csm';
  }
  // Development mode
  return '/';
};

function App() {
  return (
    <Router basename={getBasename()}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/member-login" element={<MemberLogin />} />
        <Route path="/member-register" element={<MemberRegister />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agreements" element={<Agreements />} />
          <Route path="agreements/workflow-step/:stepId" element={<WorkflowStepDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="services" element={<Services />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="induction" element={<Induction />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
