import React, { useState, useEffect } from 'react';
import api from '../api/config';
import './Tickets.css';
import { useAuth } from '../context/AuthContext';

const Tickets = () => {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    service_id: '',
    title: '',
    description: '',
    status: 'open',
    priority: 'medium'
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (authLoading) return;
    fetchTickets();
    if (user?.role !== 'member') {
      fetchServices();
    }
  }, [authLoading, user]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', formData);
      fetchTickets();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating ticket');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const ticket = tickets.find(t => t.id === id);
      await api.put(`/tickets/${id}`, {
        ...ticket,
        status
      });
      fetchTickets();
      if (selectedTicket && selectedTicket.id === id) {
        fetchTicketDetails(id);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating ticket');
    }
  };

  const handleAddComment = async (ticketId) => {
    if (!comment.trim()) return;
    try {
      await api.post(`/tickets/${ticketId}/comments`, { comment });
      setComment('');
      fetchTicketDetails(ticketId);
      fetchTickets();
    } catch (error) {
      alert(error.response?.data?.error || 'Error adding comment');
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: '',
      title: '',
      description: '',
      status: 'open',
      priority: 'medium'
    });
  };

  if (authLoading || loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Tickets</h1>
        {!isMember && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
            Create Ticket
          </button>
        )}
      </div>

      <div className="tickets-grid">
        {tickets.length === 0 ? (
          <p>No tickets found. Create your first ticket!</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>{ticket.title}</h3>
                <span className={`status-badge ${ticket.status}`}>{ticket.status}</span>
              </div>
              <div className="ticket-info">
                <p><strong>Client:</strong> {ticket.client_name}</p>
                <p><strong>Service:</strong> {ticket.service_type}</p>
                <p><strong>Priority:</strong> <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span></p>
                {ticket.description && <p className="ticket-description">{ticket.description}</p>}
              </div>
              <div className="ticket-actions">
                <button onClick={() => fetchTicketDetails(ticket.id)} className="btn-view">View Details</button>
                {ticket.status === 'open' && !isMember && (
                  <button onClick={() => handleUpdateStatus(ticket.id, 'resolved')} className="btn-resolve">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content ticket-details" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTicket.title}</h2>
            <div className="ticket-detail-info">
              <p><strong>Status:</strong> <span className={`status-badge ${selectedTicket.status}`}>{selectedTicket.status}</span></p>
              <p><strong>Priority:</strong> <span className={`priority-badge ${selectedTicket.priority}`}>{selectedTicket.priority}</span></p>
              <p><strong>Client:</strong> {selectedTicket.client_name}</p>
              <p><strong>Service:</strong> {selectedTicket.service_type}</p>
              <p><strong>Created:</strong> {new Date(selectedTicket.created_at).toLocaleString()}</p>
              {selectedTicket.description && (
                <div className="ticket-description-box">
                  <strong>Description:</strong>
                  <p>{selectedTicket.description}</p>
                </div>
              )}
            </div>

            <div className="comments-section">
              <h3>Comments</h3>
              <div className="comments-list">
                {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                  selectedTicket.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <strong>{comment.user_name}</strong>
                        <span>{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p>{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </div>
              <div className="add-comment">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                />
                <button onClick={() => handleAddComment(selectedTicket.id)} className="btn-primary">
                  Add Comment
                </button>
              </div>
            </div>

            <div className="modal-actions">
              {selectedTicket.status === 'open' && !isMember && (
                <button onClick={() => { handleUpdateStatus(selectedTicket.id, 'resolved'); setSelectedTicket(null); }} className="btn-resolve">
                  Mark as Resolved
                </button>
              )}
              <button onClick={() => setSelectedTicket(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {!isMember && showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Ticket</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service *</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.client_name} - {service.service_type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
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
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;

