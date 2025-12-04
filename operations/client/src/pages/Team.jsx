import React, { useState, useEffect } from 'react';
import './Team.css';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('operations_team');
    if (stored) {
      setMembers(JSON.parse(stored));
    }
  }, []);

  const saveMembers = (data) => {
    localStorage.setItem('operations_team', JSON.stringify(data));
    setMembers(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMember = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    saveMembers([newMember, ...members]);
    setFormData({ name: '', role: '', email: '', phone: '', department: '' });
    setShowModal(false);
  };

  const deleteMember = (id) => {
    const filtered = members.filter(m => m.id !== id);
    saveMembers(filtered);
  };

  return (
    <div className="team-page">
      <div className="page-header">
        <div>
          <h1>👥 Team Management</h1>
          <p className="page-subtitle">Manage your operations team members</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Member
        </button>
      </div>

      <div className="team-grid">
        {members.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>No Team Members</h3>
            <p>Add your first team member to get started</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Member
            </button>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-avatar">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <div className="member-details">
                <span>📧 {member.email}</span>
                <span>📱 {member.phone}</span>
                <span>🏢 {member.department}</span>
              </div>
              <button className="btn-delete" onClick={() => deleteMember(member.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Team Member</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Job role"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;



