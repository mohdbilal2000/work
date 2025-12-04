import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/config';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '', // Using company field to store type
    address: '',
    status: 'active'
  });

  useEffect(() => {
    // Check if there's a new client from Operations Lead
    const newClientParam = searchParams.get('newClient');
    if (newClientParam) {
      try {
        const newClientData = JSON.parse(decodeURIComponent(newClientParam));
        // Add client via API
        addClientFromOperations(newClientData);
        // Clear URL param
        setSearchParams({});
      } catch (e) {
        console.error('Error parsing client data:', e);
      }
    }
    fetchClients();
  }, []);

  const addClientFromOperations = async (clientData) => {
    try {
      const newClient = {
        name: clientData.name,
        email: `${clientData.name.toLowerCase().replace(/\s+/g, '')}@client.com`,
        phone: '',
        company: clientData.projectName || '',
        address: clientData.description || '',
        status: 'active',
        assignedFrom: 'Operations Lead'
      };
      await api.post('/clients', newClient);
      alert('🎉 Client received from Operations Lead!');
      fetchClients();
    } catch (error) {
      console.error('Error adding client from Operations:', error);
    }
  };

  const fetchClients = async () => {
    try {
      let apiClients = [];
      try {
        const response = await api.get('/clients');
        apiClients = response.data || [];
      } catch (apiError) {
        console.log('API unavailable, using localStorage');
      }
      
      // Get localStorage clients
      const storedClients = JSON.parse(localStorage.getItem('csm_clients') || '[]');
      
      // Merge and dedupe
      const allClients = [...apiClients];
      storedClients.forEach(sc => {
        const exists = allClients.some(c => c.name === sc.name || c.id === sc.id);
        if (!exists) {
          allClients.push(sc);
        }
      });
      
      setClients(allClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Fallback to localStorage
      const storedClients = JSON.parse(localStorage.getItem('csm_clients') || '[]');
      setClients(storedClients);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      fetchClients();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving client');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      status: client.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting client');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      status: 'active'
    });
    setEditingClient(null);
  };

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Clients</h1>
        <p className="page-subtitle">Clients transferred from Project Journey</p>
      </div>

      <div className="clients-grid">
        {clients.length === 0 ? (
          <p>No clients yet. Clients will appear here when transferred from Project Journey.</p>
        ) : (
          clients.map((client) => (
            <div key={client.id} className={`client-card ${client.fromProjectJourney ? 'from-journey' : ''}`}>
              <div className="client-header">
                <h3>{client.name}</h3>
                <span className={`status-badge ${client.status}`}>{client.status}</span>
              </div>
              {client.fromProjectJourney && (
                <div className="journey-badge">🚀 From Project Journey</div>
              )}
              {client.projectTitle && (
                <p className="project-info"><strong>📁 Project:</strong> {client.projectTitle}</p>
              )}
              <div className="client-info">
                <p><strong>Email:</strong> {client.email}</p>
                {client.phone && <p><strong>Phone:</strong> {client.phone}</p>}
                {client.company && <p><strong>Type:</strong> {client.company}</p>}
                {client.address && <p><strong>Address:</strong> {client.address}</p>}
                {client.created_by_name && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    <strong>Created by:</strong> {client.created_by_name} ({client.created_by_role || 'user'})
                  </p>
                )}
              </div>
              <div className="client-actions">
                <button onClick={() => handleEdit(client)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(client.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingClient ? 'Edit Client' : 'Add Client'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option value="PERM">PERM</option>
                  <option value="Staffing">Staffing</option>
                  <option value="RPO's">RPO's</option>
                  <option value="Slim Perm">Slim Perm</option>
                  <option value="PM's">PM's</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="dormant">Dormant</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
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

export default Clients;

