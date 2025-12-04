import React, { useState, useEffect } from 'react';
import './Tickets.css';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assignee: '',
    project: '',
    category: 'general'
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const stored = localStorage.getItem('operations_tickets');
    if (stored) {
      setTickets(JSON.parse(stored));
    }
  };

  const saveTickets = (data) => {
    localStorage.setItem('operations_tickets', JSON.stringify(data));
    setTickets(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicket = {
      ...formData,
      id: Date.now(),
      ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveTickets([newTicket, ...tickets]);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      assignee: '',
      project: '',
      category: 'general'
    });
    setShowModal(false);
  };

  const updateStatus = (id, status) => {
    const updated = tickets.map(t => 
      t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    saveTickets(updated);
  };

  const deleteTicket = (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      const filtered = tickets.filter(t => t.id !== id);
      saveTickets(filtered);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="tickets-page">
      <div className="page-header">
        <div>
          <h1>🎫 Ticket Management</h1>
          <p className="page-subtitle">Track and manage support tickets</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="ticket-stats">
        <div className="stat-card">
          <span className="stat-value">{tickets.filter(t => t.status === 'open').length}</span>
          <span className="stat-label">Open</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tickets.filter(t => t.status === 'in-progress').length}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tickets.filter(t => t.status === 'resolved').length}</span>
          <span className="stat-label">Resolved</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tickets.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({tickets.length})
        </button>
        <button className={`filter-btn ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>
          🔴 Open
        </button>
        <button className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`} onClick={() => setFilter('in-progress')}>
          🟡 In Progress
        </button>
        <button className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>
          🟢 Resolved
        </button>
        <button className={`filter-btn ${filter === 'closed' ? 'active' : ''}`} onClick={() => setFilter('closed')}>
          ⚫ Closed
        </button>
      </div>

      {/* Tickets List */}
      <div className="tickets-grid">
        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎫</span>
            <h3>No Tickets</h3>
            <p>Create your first ticket to start tracking</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + New Ticket
            </button>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-no">{ticket.ticketNo}</span>
                <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <h3 className="ticket-title">{ticket.title}</h3>
              <p className="ticket-desc">{ticket.description}</p>
              
              <div className="ticket-meta">
                {ticket.project && <span>📁 {ticket.project}</span>}
                {ticket.assignee && <span>👤 {ticket.assignee}</span>}
                <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="ticket-footer">
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value)}
                  className={`status-select ${getStatusColor(ticket.status)}`}
                >
                  <option value="open">🔴 Open</option>
                  <option value="in-progress">🟡 In Progress</option>
                  <option value="resolved">🟢 Resolved</option>
                  <option value="closed">⚫ Closed</option>
                </select>
                <button className="btn-delete" onClick={() => deleteTicket(ticket.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎫 Create New Ticket</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter ticket title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue or request..."
                  rows={4}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="support">Support</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Project</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Related project"
                  />
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Assignee name"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;



