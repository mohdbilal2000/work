import React from 'react';
import './Reports.css';

const Reports = () => {
  const reports = [
    { id: 1, title: 'Monthly Performance Report', type: 'Performance', date: 'Dec 2025', icon: '📊' },
    { id: 2, title: 'Financial Summary Q4', type: 'Financial', date: 'Q4 2025', icon: '💰' },
    { id: 3, title: 'Team Productivity Analysis', type: 'HR', date: 'Nov 2025', icon: '👥' },
    { id: 4, title: 'Client Satisfaction Survey', type: 'Clients', date: 'Nov 2025', icon: '⭐' },
    { id: 5, title: 'Project Completion Report', type: 'Operations', date: 'Nov 2025', icon: '📋' },
    { id: 6, title: 'Revenue Growth Analysis', type: 'Financial', date: 'Q3-Q4 2025', icon: '📈' },
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>📈 Reports</h1>
          <p className="page-subtitle">Executive reports and analytics</p>
        </div>
      </div>

      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-icon">{report.icon}</div>
            <div className="report-info">
              <h3>{report.title}</h3>
              <div className="report-meta">
                <span className="report-type">{report.type}</span>
                <span className="report-date">📅 {report.date}</span>
              </div>
            </div>
            <button className="btn-view">View Report</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;



