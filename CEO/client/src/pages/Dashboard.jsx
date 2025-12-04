import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingApprovals: 5,
    totalAgreements: 24,
    activeProjects: 12,
    teamMembers: 45
  });

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>⭐ CEO Dashboard</h1>
          <p className="page-subtitle">Executive overview and strategic insights</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingApprovals}</span>
            <span className="stat-label">Pending Approvals</span>
          </div>
        </div>
        <div className="stat-card agreements">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalAgreements}</span>
            <span className="stat-label">Total Agreements</span>
          </div>
        </div>
        <div className="stat-card projects">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeProjects}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>
        <div className="stat-card team">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.teamMembers}</span>
            <span className="stat-label">Team Members</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="section-card">
          <div className="section-header">
            <h2>🔔 Recent Activity</h2>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📋</span>
              <div className="activity-info">
                <span className="activity-title">New agreement pending approval</span>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <div className="activity-info">
                <span className="activity-title">Project "Alpha" completed</span>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">👤</span>
              <div className="activity-info">
                <span className="activity-title">New team member onboarded</span>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📈</span>
              <div className="activity-info">
                <span className="activity-title">Monthly report generated</span>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>⏳ Pending Actions</h2>
          </div>
          <div className="pending-list">
            <div className="pending-item">
              <div className="pending-info">
                <span className="pending-title">Agreement Draft Approval</span>
                <span className="pending-desc">Client: ABC Corp</span>
              </div>
              <button className="btn-approve">Review</button>
            </div>
            <div className="pending-item">
              <div className="pending-info">
                <span className="pending-title">Budget Approval</span>
                <span className="pending-desc">Q1 2025 Budget</span>
              </div>
              <button className="btn-approve">Review</button>
            </div>
            <div className="pending-item">
              <div className="pending-info">
                <span className="pending-title">New Hire Approval</span>
                <span className="pending-desc">Senior Developer Position</span>
              </div>
              <button className="btn-approve">Review</button>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <div className="section-header">
          <h2>📊 Key Metrics</h2>
        </div>
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Revenue Growth</span>
            <span className="metric-value positive">+15%</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Client Satisfaction</span>
            <span className="metric-value positive">92%</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Project Success Rate</span>
            <span className="metric-value positive">88%</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Team Efficiency</span>
            <span className="metric-value positive">+8%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



