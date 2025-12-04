import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    pendingDeliverables: 0,
    teamMembers: 0,
    completedTasks: 0
  });

  const [recentDeliverables, setRecentDeliverables] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('operations_deliverables');
    if (stored) {
      const deliverables = JSON.parse(stored);
      setRecentDeliverables(deliverables.slice(0, 5));
      setStats({
        activeProjects: new Set(deliverables.map(d => d.project)).size,
        pendingDeliverables: deliverables.filter(d => d.status === 'pending').length,
        teamMembers: new Set(deliverables.map(d => d.assignee)).size,
        completedTasks: deliverables.filter(d => d.status === 'completed').length
      });
    }
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Operations Dashboard</h1>
          <p className="page-subtitle">Track deliverables, team, and project progress</p>
        </div>
        <Link to="/deliverables" className="btn-primary">
          + New Deliverable
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon projects">📁</div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeProjects}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingDeliverables}</span>
            <span className="stat-label">Pending Deliverables</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon team">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.teamMembers}</span>
            <span className="stat-label">Team Members</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">✓</div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedTasks}</span>
            <span className="stat-label">Completed Tasks</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="section-card">
          <div className="section-header">
            <h2>📦 Recent Deliverables</h2>
            <Link to="/deliverables" className="view-all">View All →</Link>
          </div>
          {recentDeliverables.length === 0 ? (
            <div className="empty-state">
              <p>No deliverables yet. Add your first deliverable!</p>
            </div>
          ) : (
            <div className="deliverables-list">
              {recentDeliverables.map((item, index) => (
                <div key={index} className="deliverable-item">
                  <div className="deliverable-info">
                    <span className="deliverable-name">{item.name}</span>
                    <span className="deliverable-project">{item.project}</span>
                  </div>
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>📊 Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <Link to="/deliverables" className="action-btn">
              <span className="action-icon">📦</span>
              <span>Add Deliverable</span>
            </Link>
            <Link to="/projects" className="action-btn">
              <span className="action-icon">📁</span>
              <span>New Project</span>
            </Link>
            <Link to="/team" className="action-btn">
              <span className="action-icon">👤</span>
              <span>Add Team Member</span>
            </Link>
            <Link to="/reports" className="action-btn">
              <span className="action-icon">📈</span>
              <span>Generate Report</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



