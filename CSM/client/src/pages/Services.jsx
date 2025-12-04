import React, { useState, useEffect } from 'react';
import api from '../api/config';
import './Services.css';
import { useAuth } from '../context/AuthContext';

const Services = () => {
  const { user, loading: authLoading } = useAuth();
  const isMember = user?.role === 'member';
  const [activeClients, setActiveClients] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    if (isMember) {
      fetchAssignedServices();
    } else {
      fetchActiveClients();
    }
  }, [authLoading, user, isMember]);

  const fetchActiveClients = async () => {
    try {
      const response = await api.get('/clients');
      setActiveClients(filterActive(response.data || []));
    } catch (error) {
      console.error('Error fetching clients:', error);
      const stored = JSON.parse(localStorage.getItem('csm_clients') || '[]');
      setActiveClients(filterActive(stored));
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedServices = async () => {
    try {
      const response = await api.get('/services');
      setAssignedServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActive = (list = []) =>
    list.filter((client) => (client.status || '').toLowerCase() === 'active');

  if (authLoading || loading) {
    return <div className="loading">Loading serviceable...</div>;
  }

  if (isMember) {
    return (
      <div className="services-page">
        <div className="page-header">
          <div>
            <h1>My Assignments</h1>
            <p className="page-subtitle">
              Clients and services routed to you by Operations Lead appear below.
            </p>
          </div>
        </div>

        <div className="services-table">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned By</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {assignedServices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No serviceable data yet. Ask Operations Lead to assign a client to you.
                  </td>
                </tr>
              ) : (
                assignedServices.map((service) => (
                  <tr key={service.id}>
                    <td>{service.client_name || '—'}</td>
                    <td>{service.service_type || '—'}</td>
                    <td>
                      <span className={`status-badge ${service.status}`}>{service.status}</span>
                    </td>
                    <td>
                      <span className={`priority-badge ${service.priority}`}>{service.priority}</span>
                    </td>
                    <td>{service.created_by_name || 'Operations Lead'}</td>
                    <td>
                      {service.updated_at
                        ? new Date(service.updated_at).toLocaleString()
                        : service.created_at
                        ? new Date(service.created_at).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="page-header">
        <div>
          <h1>Serviceable</h1>
          <p className="page-subtitle">
            Active clients are listed here automatically once approved. Manual add is not required.
          </p>
        </div>
      </div>

      <div className="services-table">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Status</th>
              <th>Email</th>
              <th>Source</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {activeClients.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No serviceable found. Only active clients can appear here.
                </td>
              </tr>
            ) : (
              activeClients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.company || '—'}</td>
                  <td>
                    <span className={`status-badge ${client.status}`}>{client.status}</span>
                  </td>
                  <td>{client.email || '—'}</td>
                  <td>{client.assignedFrom || client.created_by_name || 'Clients'}</td>
                  <td>
                    {client.updated_at
                      ? new Date(client.updated_at).toLocaleDateString()
                      : client.created_at
                      ? new Date(client.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Services;

