import React, { useState, useEffect } from 'react';
import './Deliverables.css';

const Deliverables = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    description: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('operations_deliverables');
    if (stored) {
      setDeliverables(JSON.parse(stored));
    }
  }, []);

  const saveDeliverables = (data) => {
    localStorage.setItem('operations_deliverables', JSON.stringify(data));
    setDeliverables(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDeliverable = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    saveDeliverables([newDeliverable, ...deliverables]);
    setFormData({ name: '', project: '', assignee: '', dueDate: '', priority: 'medium', status: 'pending', description: '' });
    setShowModal(false);
  };

  const updateStatus = (id, status) => {
    const updated = deliverables.map(d => d.id === id ? { ...d, status } : d);
    saveDeliverables(updated);
  };

  const deleteDeliverable = (id) => {
    const filtered = deliverables.filter(d => d.id !== id);
    saveDeliverables(filtered);
  };

  return (
    <div className="deliverables-page">
      <div className="page-header">
        <div>
          <h1>📦 Deliverables</h1>
          <p className="page-subtitle">Track and manage project deliverables</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Deliverable
        </button>
      </div>

      <div className="deliverables-grid">
        {deliverables.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No Deliverables</h3>
            <p>Add your first deliverable to start tracking</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Deliverable
            </button>
          </div>
        ) : (
          deliverables.map((item) => (
            <div key={item.id} className="deliverable-card">
              <div className="card-header">
                <span className={`priority-badge ${item.priority}`}>{item.priority}</span>
                <span className={`status-badge ${item.status}`}>{item.status.replace('-', ' ')}</span>
              </div>
              <h3 className="card-title">{item.name}</h3>
              <p className="card-project">📁 {item.project}</p>
              <p className="card-assignee">👤 {item.assignee}</p>
              {item.dueDate && <p className="card-due">📅 Due: {item.dueDate}</p>}
              {item.description && <p className="card-desc">{item.description}</p>}
              <div className="card-actions">
                <select 
                  value={item.status} 
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button className="btn-delete" onClick={() => deleteDeliverable(item.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Deliverable</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Deliverable Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter deliverable name"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Project *</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Project name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Assignee *</label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Assigned to"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description..."
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Deliverable</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliverables;



