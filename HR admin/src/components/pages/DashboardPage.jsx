import React, { useState, useEffect } from 'react'
import './DashboardPage.css'
import { dashboardAPI } from '../../services/api'

function DashboardPage() {
  const [stats, setStats] = useState({
    total_employees: 0,
    active_vendors: 0,
    pending_utilities: 0,
    total_compliance_records: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-content">
        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Employees</h3>
                <p className="stat-value">{stats.total_employees}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-info">
                <h3>Active Vendors</h3>
                <p className="stat-value">{stats.active_vendors}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <h3>Pending Utilities</h3>
                <p className="stat-value">{stats.pending_utilities}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>Compliance Records</h3>
                <p className="stat-value">{stats.total_compliance_records}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage

