import React, { useState, useEffect } from 'react';
import './Approvals.css';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = () => {
    const stored = localStorage.getItem('ceo_approvals');
    if (stored) {
      setApprovals(JSON.parse(stored));
    } else {
      // Sample data
      const sampleData = [
        { id: 1, type: 'Agreement', title: 'Client Agreement - ABC Corp', requester: 'Operations Lead', date: '2025-12-02', status: 'pending', priority: 'high' },
        { id: 2, type: 'Budget', title: 'Q1 2025 Marketing Budget', requester: 'Finance', date: '2025-12-01', status: 'pending', priority: 'medium' },
        { id: 3, type: 'Hire', title: 'Senior Developer Position', requester: 'HR Admin', date: '2025-11-30', status: 'pending', priority: 'high' },
      ];
      localStorage.setItem('ceo_approvals', JSON.stringify(sampleData));
      setApprovals(sampleData);
    }
  };

  const saveApprovals = (data) => {
    localStorage.setItem('ceo_approvals', JSON.stringify(data));
    setApprovals(data);
  };

  const handleApprove = (id) => {
    const updated = approvals.map(a => a.id === id ? { ...a, status: 'approved' } : a);
    saveApprovals(updated);
  };

  const handleReject = (id) => {
    const updated = approvals.map(a => a.id === id ? { ...a, status: 'rejected' } : a);
    saveApprovals(updated);
  };

  const filteredApprovals = approvals.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="approvals-page">
      <div className="page-header">
        <div>
          <h1>✅ Approvals</h1>
          <p className="page-subtitle">Review and approve pending requests</p>
        </div>
      </div>

      <div className="filters">
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          ⏳ Pending ({approvals.filter(a => a.status === 'pending').length})
        </button>
        <button className={`filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          ✅ Approved ({approvals.filter(a => a.status === 'approved').length})
        </button>
        <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
          ❌ Rejected ({approvals.filter(a => a.status === 'rejected').length})
        </button>
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({approvals.length})
        </button>
      </div>

      <div className="approvals-list">
        {filteredApprovals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <h3>No {filter} approvals</h3>
            <p>All caught up!</p>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div key={approval.id} className={`approval-card ${approval.status}`}>
              <div className="approval-header">
                <span className="approval-type">{approval.type}</span>
                <span className={`priority-badge ${approval.priority}`}>{approval.priority}</span>
              </div>
              <h3 className="approval-title">{approval.title}</h3>
              <div className="approval-meta">
                <span>👤 {approval.requester}</span>
                <span>📅 {approval.date}</span>
              </div>
              {approval.status === 'pending' ? (
                <div className="approval-actions">
                  <button className="btn-approve" onClick={() => handleApprove(approval.id)}>✓ Approve</button>
                  <button className="btn-reject" onClick={() => handleReject(approval.id)}>✗ Reject</button>
                </div>
              ) : (
                <div className={`status-badge ${approval.status}`}>
                  {approval.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Approvals;



