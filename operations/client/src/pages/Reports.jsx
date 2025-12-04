import React, { useState, useEffect } from 'react';
import './Reports.css';

const Reports = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDeliverables: 0,
    completedDeliverables: 0,
    pendingDeliverables: 0,
    teamMembers: 0,
    activeProjects: 0
  });

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('operations_projects') || '[]');
    const deliverables = JSON.parse(localStorage.getItem('operations_deliverables') || '[]');
    const team = JSON.parse(localStorage.getItem('operations_team') || '[]');

    setStats({
      totalProjects: projects.length,
      totalDeliverables: deliverables.length,
      completedDeliverables: deliverables.filter(d => d.status === 'completed').length,
      pendingDeliverables: deliverables.filter(d => d.status === 'pending').length,
      teamMembers: team.length,
      activeProjects: projects.filter(p => p.status === 'active').length
    });
  }, []);

  const completionRate = stats.totalDeliverables > 0 
    ? Math.round((stats.completedDeliverables / stats.totalDeliverables) * 100) 
    : 0;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>📈 Reports & Analytics</h1>
          <p className="page-subtitle">Operations performance overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card large">
          <div className="stat-icon completion">📊</div>
          <div className="stat-info">
            <span className="stat-value">{completionRate}%</span>
            <span className="stat-label">Completion Rate</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📁</div>
          <div className="metric-info">
            <span className="metric-value">{stats.totalProjects}</span>
            <span className="metric-label">Total Projects</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✓</div>
          <div className="metric-info">
            <span className="metric-value">{stats.activeProjects}</span>
            <span className="metric-label">Active Projects</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <span className="metric-value">{stats.totalDeliverables}</span>
            <span className="metric-label">Total Deliverables</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-info">
            <span className="metric-value">{stats.completedDeliverables}</span>
            <span className="metric-label">Completed</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⏳</div>
          <div className="metric-info">
            <span className="metric-value">{stats.pendingDeliverables}</span>
            <span className="metric-label">Pending</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-info">
            <span className="metric-value">{stats.teamMembers}</span>
            <span className="metric-label">Team Members</span>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h2>📋 Summary</h2>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Active Projects</span>
            <span className="summary-value">{stats.activeProjects} of {stats.totalProjects}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Deliverables Completed</span>
            <span className="summary-value">{stats.completedDeliverables} of {stats.totalDeliverables}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pending Deliverables</span>
            <span className="summary-value">{stats.pendingDeliverables}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Team Size</span>
            <span className="summary-value">{stats.teamMembers} members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;



