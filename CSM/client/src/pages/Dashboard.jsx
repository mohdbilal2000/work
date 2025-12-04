import React, { useState, useEffect } from 'react';
import api from '../api/config';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data) {
        setStats(response.data);
      } else {
        // Set default stats if response is empty
        setStats({
          totalClients: 0,
          activeClients: 0,
          totalServices: 0,
          pendingServices: 0,
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          recentTickets: [],
          servicesByStatus: []
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalClients: 0,
        activeClients: 0,
        totalServices: 0,
        pendingServices: 0,
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        recentTickets: [],
        servicesByStatus: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  // Always show dashboard with default values if stats is null
  const displayStats = stats || {
    totalClients: 0,
    activeClients: 0,
    totalServices: 0,
    pendingServices: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    recentTickets: [],
    servicesByStatus: []
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Clients</h3>
          <p className="stat-number">{displayStats.totalClients || 0}</p>
          <span className="stat-subtitle">{displayStats.activeClients || 0} active</span>
        </div>
        <div className="stat-card">
          <h3>Total Serviceable</h3>
          <p className="stat-number">{displayStats.totalServices || 0}</p>
          <span className="stat-subtitle">{displayStats.pendingServices || displayStats.warmServices || 0} pending</span>
        </div>
        <div className="stat-card">
          <h3>Total Tickets</h3>
          <p className="stat-number">{displayStats.totalTickets || 0}</p>
          <span className="stat-subtitle">{displayStats.openTickets || 0} open</span>
        </div>
        <div className="stat-card">
          <h3>Resolved Tickets</h3>
          <p className="stat-number">{displayStats.resolvedTickets || 0}</p>
          <span className="stat-subtitle">Completed</span>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Tickets</h2>
          <div className="tickets-list">
            {displayStats.recentTickets && displayStats.recentTickets.length > 0 ? (
              displayStats.recentTickets.map((ticket) => (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-header">
                    <span className="ticket-title">{ticket.title}</span>
                    <span className={`ticket-status ${ticket.status}`}>{ticket.status}</span>
                  </div>
                  <div className="ticket-meta">
                    <span>Client: {ticket.client_name || 'N/A'}</span>
                    <span>Service: {ticket.service_type || 'N/A'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No tickets yet</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Serviceable by Status</h2>
          <div className="status-list">
            {displayStats.servicesByStatus && displayStats.servicesByStatus.length > 0 ? (
              displayStats.servicesByStatus.map((item) => (
                <div key={item.status} className="status-item">
                  <span className="status-label">{item.status}</span>
                  <span className="status-count">{item.count}</span>
                </div>
              ))
            ) : (
              <p>No serviceable data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

