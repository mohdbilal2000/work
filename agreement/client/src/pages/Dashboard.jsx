import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    pendingApproval: 0,
    completed: 0
  });

  const [recentAgreements, setRecentAgreements] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('tendering_agreements');
    if (stored) {
      const agreements = JSON.parse(stored);
      setRecentAgreements(agreements.slice(0, 5));
      
      setStats({
        total: agreements.length,
        inProgress: agreements.filter(a => a.currentStep > 0 && a.currentStep < 8).length,
        pendingApproval: agreements.filter(a => a.currentStep === 3).length,
        completed: agreements.filter(a => a.currentStep === 8).length
      });
    }
  }, []);

  const workflowSteps = [
    { num: 1, title: 'Closure of Negotiations', icon: '🤝' },
    { num: 2, title: 'Creation of Draft', icon: '📝' },
    { num: 3, title: 'CEO Approval', icon: '✅' },
    { num: 4, title: 'Draft to Client', icon: '📤' },
    { num: 5, title: 'Client Approval', icon: '👍' },
    { num: 6, title: 'E-Stamp Download', icon: '📜' },
    { num: 7, title: 'Signatures', icon: '✍️' },
    { num: 8, title: 'Operations Handover', icon: '📋' }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Agreement Creation Workflow Overview</p>
        </div>
        <Link to="/agreements/new" className="btn-primary">
          + New Agreement
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📄</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Agreements</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">🔔</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingApproval}</span>
            <span className="stat-label">Pending CEO Approval</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">✓</div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Workflow Overview */}
      <div className="workflow-overview">
        <h2>Agreement Creation SOP (ORG8.0)</h2>
        <div className="workflow-steps">
          <div className="workflow-row">
            {workflowSteps.slice(0, 4).map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="workflow-step">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-num">Step {step.num}</span>
                  <span className="step-title">{step.title}</span>
                </div>
                {idx < 3 && <div className="workflow-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
          <div className="workflow-down">↓</div>
          <div className="workflow-row reverse">
            {workflowSteps.slice(4, 8).reverse().map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="workflow-step">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-num">Step {step.num}</span>
                  <span className="step-title">{step.title}</span>
                </div>
                {idx < 3 && <div className="workflow-arrow">←</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Agreements */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Agreements</h2>
          <Link to="/agreements" className="view-all">View All →</Link>
        </div>
        {recentAgreements.length === 0 ? (
          <div className="empty-state">
            <p>No agreements yet. Create your first agreement to get started!</p>
            <Link to="/agreements/new" className="btn-primary">+ Create Agreement</Link>
          </div>
        ) : (
          <div className="agreements-table">
            <table>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Agreement Type</th>
                  <th>Current Step</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAgreements.map((agreement) => (
                  <tr key={agreement.id}>
                    <td>{agreement.clientName}</td>
                    <td>{agreement.agreementType}</td>
                    <td>
                      <span className="step-badge">
                        {workflowSteps[agreement.currentStep - 1]?.icon} {workflowSteps[agreement.currentStep - 1]?.title || 'Not Started'}
                      </span>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(agreement.currentStep / 8) * 100}%` }}></div>
                      </div>
                      <span className="progress-text">{agreement.currentStep}/8</span>
                    </td>
                    <td>
                      <Link to={`/agreements/${agreement.id}/workflow`} className="btn-action">
                        Continue →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


