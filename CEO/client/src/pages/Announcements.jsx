import React, { useState, useEffect } from 'react';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    const stored = localStorage.getItem('ceo_announcements');
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    }
  };

  const saveAnnouncements = (data) => {
    localStorage.setItem('ceo_announcements', JSON.stringify(data));
    setAnnouncements(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAnnouncement = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString(),
      author: 'CEO'
    };
    saveAnnouncements([newAnnouncement, ...announcements]);
    setFormData({ title: '', content: '', priority: 'normal' });
    setShowModal(false);
  };

  const deleteAnnouncement = (id) => {
    if (window.confirm('Delete this announcement?')) {
      const filtered = announcements.filter(a => a.id !== id);
      saveAnnouncements(filtered);
    }
  };

  return (
    <div className="announcements-page">
      <div className="page-header">
        <div>
          <h1>📢 Announcements</h1>
          <p className="page-subtitle">Broadcast messages to the organization</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Announcement
        </button>
      </div>

      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📢</span>
            <h3>No Announcements</h3>
            <p>Create your first announcement to broadcast to the team</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + New Announcement
            </button>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className={`announcement-card ${announcement.priority}`}>
              <div className="announcement-header">
                <span className={`priority-badge ${announcement.priority}`}>
                  {announcement.priority === 'urgent' ? '🔴 Urgent' : announcement.priority === 'important' ? '🟡 Important' : '🟢 Normal'}
                </span>
                <span className="announcement-date">{new Date(announcement.date).toLocaleDateString()}</span>
              </div>
              <h3 className="announcement-title">{announcement.title}</h3>
              <p className="announcement-content">{announcement.content}</p>
              <div className="announcement-footer">
                <span className="announcement-author">👤 {announcement.author}</span>
                <button className="btn-delete" onClick={() => deleteAnnouncement(announcement.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📢 New Announcement</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your announcement..."
                  rows={5}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="normal">🟢 Normal</option>
                  <option value="important">🟡 Important</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;



