import React, { useState, useEffect } from 'react'
import './OfficeUtilitiesPage.css'
import { utilitiesAPI, vendorsAPI, ticketsAPI } from '../../services/api'

function OfficeUtilitiesPage() {
  const [utilities, setUtilities] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUtility, setEditingUtility] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [ticketFormData, setTicketFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    from: 'Admin',
    to: 'CEO'
  });
  const [formData, setFormData] = useState({
    utility_type: '',
    vendor_id: '',
    employee_name: '',
    department: '',
    description: '',
    amount: '',
    request_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    loadUtilities();
    loadVendors();
  }, []);

  const loadUtilities = async () => {
    try {
      setLoading(true);
      const response = await utilitiesAPI.getAll();
      if (response.success) {
        // Normalize ticket_raised and item_received to number for consistent checking
        const normalizedUtilities = response.data.map(utility => {
          const normalized = {
            ...utility,
            ticket_raised: utility.ticket_raised === 1 || utility.ticket_raised === true || utility.ticket_raised === '1' ? 1 : 0,
            ticket_status: utility.ticket_status || 'pending',
            item_received: utility.item_received === 1 || utility.item_received === true || utility.item_received === '1' ? 1 : 0
          };
          return normalized;
        });
        setUtilities(normalizedUtilities);
      }
    } catch (error) {
      console.error('Error loading utilities:', error);
      alert('Failed to load utilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      if (response.success) {
        setVendors(response.data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = "${value}"`); // Debug log
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated formData:', newData); // Debug log
      return newData;
    });
  };

  const handleAddClick = () => {
    setEditingUtility(null);
    setFormData({
      utility_type: '',
      vendor_id: '',
      employee_name: '',
      department: '',
      description: '',
      amount: '',
      request_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'pending'
    });
    setShowModal(true);
  };

  const handleEditClick = (utility) => {
    setEditingUtility(utility);
    setFormData({
      utility_type: utility.utility_type || '',
      vendor_id: utility.vendor_id || '',
      employee_name: utility.employee_name || '',
      department: utility.department || '',
      description: utility.description || '',
      amount: utility.amount || '',
      request_date: utility.request_date ? utility.request_date.split('T')[0] : new Date().toISOString().split('T')[0],
      due_date: utility.due_date ? utility.due_date.split('T')[0] : '',
      status: utility.status || 'pending'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      console.log('=== FORM SUBMISSION START ===');
      console.log('Form data before validation:', JSON.stringify(formData, null, 2));
      console.log('Employee Name value:', formData.employee_name, 'Type:', typeof formData.employee_name);
      console.log('Department value:', formData.department, 'Type:', typeof formData.department);
      
      // Check if fields are actually filled
      const empName = formData.employee_name ? String(formData.employee_name).trim() : '';
      const dept = formData.department ? String(formData.department).trim() : '';
      
      if (!empName) {
        alert('Please enter Employee Name');
        setSubmitting(false);
        return;
      }
      if (!dept) {
        alert('Please enter Department');
        setSubmitting(false);
        return;
      }

      const submitData = {
        utility_type: formData.utility_type,
        vendor_id: formData.vendor_id ? parseInt(formData.vendor_id) : null,
        employee_name: empName,
        department: dept,
        description: formData.description || null,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        request_date: formData.request_date,
        due_date: formData.due_date || null,
        status: formData.status
      };

      console.log('Submitting data to API:', JSON.stringify(submitData, null, 2));
      console.log('Employee Name in submitData:', submitData.employee_name);
      console.log('Department in submitData:', submitData.department);

      let response;
      if (editingUtility) {
        response = await utilitiesAPI.update(editingUtility.id, submitData);
      } else {
        response = await utilitiesAPI.create(submitData);
      }
      
      console.log('Response:', response); // Debug log

      if (response.success) {
        console.log('Success! Response data:', response.data); // Debug log
        if (response.data) {
          console.log('Employee Name in response:', response.data.employee_name);
          console.log('Department in response:', response.data.department);
        }
        setShowModal(false);
        setEditingUtility(null);
        await loadUtilities(); // Wait for reload
        alert(editingUtility ? 'Utility updated successfully!' : 'Utility request added successfully!');
      } else {
        console.error('Response error:', response.error);
        alert(`Failed to ${editingUtility ? 'update' : 'create'} utility: ${response.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error saving utility:', error);
      alert(`Failed to ${editingUtility ? 'update' : 'create'} utility: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this utility request?')) {
      return;
    }

    try {
      const response = await utilitiesAPI.delete(id);
      if (response.success) {
        loadUtilities();
        alert('Utility request deleted successfully!');
      } else {
        alert(`Failed to delete utility: ${response.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error deleting utility:', error);
      alert(`Failed to delete utility: ${error.message || 'Please try again.'}`);
    }
  };

  const handleMarkAsPaid = async (utility) => {
    if (!window.confirm('Mark this utility as paid?')) {
      return;
    }

    try {
      const response = await utilitiesAPI.update(utility.id, {
        ...utility,
        paid_date: new Date().toISOString().split('T')[0],
        status: 'completed'
      });

      if (response.success) {
        loadUtilities();
        alert('Utility marked as paid successfully!');
      } else {
        alert(`Failed to update utility: ${response.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error updating utility:', error);
      alert(`Failed to update utility: ${error.message || 'Please try again.'}`);
    }
  };

  const workflowSteps = [
    {
      number: 1,
      title: 'Utility Request',
      description: 'Submit and track utility service requests'
    },
    {
      number: 2,
      title: 'Vendor Assignment',
      description: 'Assign vendors for utility services'
    },
    {
      number: 3,
      title: 'Service Execution',
      description: 'Monitor and track service execution'
    },
    {
      number: 4,
      title: 'Quality Check',
      description: 'Verify service quality and completion'
    },
    {
      number: 5,
      title: 'Invoice Processing',
      description: 'Process utility invoices and payments'
    },
    {
      number: 6,
      title: 'Maintenance Schedule',
      description: 'Schedule and track regular maintenance'
    }
  ];

  const getStatusClass = (status) => {
    const statusMap = {
      'pending': 'pending',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'paid': 'paid'
    };
    return statusMap[status] || 'pending';
  };

  const isOverdue = (utility) => {
    if (!utility.due_date || utility.paid_date) return false;
    const dueDate = new Date(utility.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const handleRaiseTicket = (utility) => {
    setSelectedUtility(utility);
    setShowTicketModal(true);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let description = ticketFormData.description || `Utility request approval for: ${selectedUtility.utility_type} - ₹${selectedUtility.amount || 0}`;
      if (selectedUtility.employee_name) {
        description += `\n\nEmployee Name: ${selectedUtility.employee_name}`;
      }
      if (selectedUtility.department) {
        description += `\nDepartment: ${selectedUtility.department}`;
      }
      if (selectedUtility.description) {
        description += `\n\nDescription: ${selectedUtility.description}`;
      }
      if (selectedUtility.vendor_name) {
        description += `\nVendor: ${selectedUtility.vendor_name}`;
      }
      
      const response = await ticketsAPI.create({
        utility_id: selectedUtility.id,
        title: ticketFormData.title || `Utility Approval Request - ${selectedUtility.utility_type}`,
        description: description,
        priority: ticketFormData.priority,
        raised_by: ticketFormData.from || 'Admin',
        assigned_to: ticketFormData.to || 'CEO'
      });
      
      if (response.success) {
        setShowTicketModal(false);
        setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
        setSelectedUtility(null);
        
        // Immediately update the utility in local state if returned
        if (response.utility) {
          setUtilities(prevUtilities => {
            return prevUtilities.map(u => {
              if (u.id === response.utility.id) {
                return {
                  ...response.utility,
                  ticket_raised: response.utility.ticket_raised === 1 || response.utility.ticket_raised === true || response.utility.ticket_raised === '1' ? 1 : 0,
                  ticket_status: response.utility.ticket_status || 'open'
                };
              }
              return u;
            });
          });
        }
        
        // Reload from server to ensure consistency
        await loadUtilities();
        
        alert(`Ticket raised from ${ticketFormData.from || 'Admin'} to ${ticketFormData.to || 'CEO'}.`);
      } else {
        alert(`Failed to raise ticket: ${response.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error raising ticket:', error);
      alert(`Failed to raise ticket: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTicket = async (utility) => {
    if (!window.confirm('Resolve this ticket?')) {
      return;
    }

    try {
      // Find the ticket for this utility
      const ticketsResponse = await ticketsAPI.getAll({ utility_id: utility.id });
      if (ticketsResponse.success && ticketsResponse.data.length > 0) {
        const ticket = ticketsResponse.data[0];
        const response = await ticketsAPI.resolve(ticket.id, {
          resolution_notes: 'Ticket resolved'
        });

        if (response.success) {
          loadUtilities();
          alert('Ticket resolved successfully!');
        } else {
          alert(`Failed to resolve ticket: ${response.error || 'Please try again.'}`);
        }
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
      alert(`Failed to resolve ticket: ${error.message || 'Please try again.'}`);
    }
  };

  const handleCloseTicket = async (utility) => {
    if (!window.confirm('Close this ticket?')) {
      return;
    }

    try {
      // Find the ticket for this utility
      const ticketsResponse = await ticketsAPI.getAll({ utility_id: utility.id });
      if (ticketsResponse.success && ticketsResponse.data.length > 0) {
        const ticket = ticketsResponse.data[0];
        const response = await ticketsAPI.close(ticket.id, {
          resolution_notes: 'Ticket closed'
        });

        if (response.success) {
          loadUtilities();
          alert('Ticket closed successfully!');
        } else {
          alert(`Failed to close ticket: ${response.error || 'Please try again.'}`);
        }
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert(`Failed to close ticket: ${error.message || 'Please try again.'}`);
    }
  };

  const handleMarkAsReceived = async (utility) => {
    if (!window.confirm('Mark this item as received?')) {
      return;
    }

    try {
      const response = await utilitiesAPI.update(utility.id, {
        ...utility,
        item_received: 1,
        item_received_date: new Date().toISOString().split('T')[0]
      });

      if (response.success) {
        loadUtilities();
        alert('Item marked as received successfully!');
      } else {
        alert(`Failed to update utility: ${response.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error marking item as received:', error);
      alert(`Failed to update utility: ${error.message || 'Please try again.'}`);
    }
  };


  return (
    <div className="office-utilities-page">
      <div className="page-header">
        <h1>Office Utilities</h1>
        <button 
          type="button"
          className="add-button" 
          onClick={handleAddClick}
        >
          Add Utility Request
        </button>
      </div>

      <div className="workflow-section">
        <h2 className="workflow-title">Office Utilities Workflow Steps</h2>
        <div className="workflow-steps">
          {workflowSteps.map((step) => (
            <div key={step.number} className="workflow-step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">Step {step.number}: {step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="status-message">Loading utilities...</div>
      ) : utilities.length > 0 ? (
        <div className="records-table">
          <h3 className="table-title">Utility Requests</h3>
          <table>
            <thead>
              <tr>
                <th>Utility Type</th>
                <th>Vendor</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Item Received</th>
                <th>Ticket Status</th>
                <th>Request Date</th>
                <th>Due Date</th>
                <th>Paid Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilities.map((utility) => (
                <tr key={utility.id} className={isOverdue(utility) ? 'overdue-row' : ''}>
                  <td>{utility.utility_type}</td>
                  <td>{utility.vendor_name || '-'}</td>
                  <td>{utility.employee_name || '-'}</td>
                  <td>{utility.department || '-'}</td>
                  <td>{utility.description || '-'}</td>
                  <td>₹{utility.amount ? parseFloat(utility.amount).toFixed(2) : '0.00'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(utility.status)}`}>
                      {utility.status}
                      {isOverdue(utility) && ' (Overdue)'}
                    </span>
                  </td>
                  <td>
                    {(utility.item_received === 1 || utility.item_received === true || utility.item_received === '1') ? (
                      <span className="item-received-badge received">
                        ✅ Received
                        {utility.item_received_date && (
                          <span className="received-date">
                            <br />({new Date(utility.item_received_date).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="item-received-badge not-received">Not Received</span>
                    )}
                  </td>
                  <td>
                    {(utility.ticket_raised === 1 || utility.ticket_raised === true || utility.ticket_raised === '1') ? (
                      <span className={`ticket-badge ${utility.ticket_status || 'pending'}`}>
                        {utility.ticket_status === 'pending' || utility.ticket_status === 'open' ? 'Pending' : 
                         utility.ticket_status === 'resolved' ? 'Resolved' : 
                         utility.ticket_status === 'closed' ? 'Closed' : utility.ticket_status || 'Pending'}
                      </span>
                    ) : (
                      <span className="ticket-badge not-raised">Not Raised</span>
                    )}
                  </td>
                  <td>{utility.request_date ? new Date(utility.request_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {utility.due_date ? new Date(utility.due_date).toLocaleDateString() : '-'}
                    {isOverdue(utility) && <span className="overdue-indicator">⚠️</span>}
                  </td>
                  <td>{utility.paid_date ? new Date(utility.paid_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-buttons-grid">
                      <button
                        className="action-btn btn-edit"
                        onClick={() => handleEditClick(utility)}
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      {(!utility.ticket_raised || utility.ticket_raised === 0 || utility.ticket_raised === false || utility.ticket_raised === '0') && (
                        <button
                          className="action-btn btn-ticket"
                          onClick={() => handleRaiseTicket(utility)}
                          title="Raise Ticket"
                        >
                          🎫 Raise Ticket
                        </button>
                      )}
                      {(utility.ticket_raised === 1 || utility.ticket_raised === true || utility.ticket_raised === '1') && (
                        <>
                          {(utility.ticket_status === 'open' || utility.ticket_status === 'pending') && (
                            <button
                              className="action-btn btn-resolve"
                              onClick={() => handleResolveTicket(utility)}
                              title="Resolve Ticket"
                            >
                              ✅ Resolve
                            </button>
                          )}
                          {utility.ticket_status !== 'closed' && (
                            <button
                              className="action-btn btn-close"
                              onClick={() => handleCloseTicket(utility)}
                              title="Close Ticket"
                            >
                              🔒 Close Ticket
                            </button>
                          )}
                        </>
                      )}
                      {(!utility.item_received || utility.item_received === 0 || utility.item_received === false || utility.item_received === '0') && (
                        <button
                          className="action-btn btn-received"
                          onClick={() => handleMarkAsReceived(utility)}
                          title="Mark as Received"
                        >
                          📦 Received
                        </button>
                      )}
                      {!utility.paid_date && (
                        <button
                          className="action-btn btn-paid"
                          onClick={() => handleMarkAsPaid(utility)}
                          title="Mark as Paid"
                        >
                          💰 Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="status-message">
          No utility requests found. Add your first utility request!
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setEditingUtility(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUtility ? 'Edit Utility Request' : 'Add Utility Request'}</h2>
              <button className="modal-close" onClick={() => {
                setShowModal(false);
                setEditingUtility(null);
              }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Form submitted with formData:', formData);
              handleSubmit(e);
            }} noValidate>
              <div className="form-group">
                <label>Utility Type *</label>
                <select
                  name="utility_type"
                  value={formData.utility_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Utility Type</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Medical">Medical</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vendor</label>
                <select
                  name="vendor_id"
                  value={formData.vendor_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Vendor (Optional)</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.vendor_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Employee Name *</label>
                <input
                  type="text"
                  name="employee_name"
                  value={formData.employee_name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter employee name"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Department *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  placeholder="Enter department"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter utility request description..."
                />
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Request Date *</label>
                <input
                  type="date"
                  name="request_date"
                  value={formData.request_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingUtility(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={submitting}
                >
                  {submitting ? (editingUtility ? 'Updating...' : 'Adding...') : (editingUtility ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showTicketModal && selectedUtility && (
        <div className="modal-overlay" onClick={() => {
          setShowTicketModal(false);
          setSelectedUtility(null);
          setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Raise Ticket - {selectedUtility.utility_type}</h2>
              <button className="modal-close" onClick={() => {
                setShowTicketModal(false);
                setSelectedUtility(null);
                setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
              }}>×</button>
            </div>
            <form onSubmit={handleTicketSubmit} className="modal-form">
              <div className="form-group">
                <label>From *</label>
                <input
                  type="text"
                  name="from"
                  value={ticketFormData.from}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, from: e.target.value })}
                  required
                  placeholder="Admin"
                />
              </div>

              <div className="form-group">
                <label>To *</label>
                <input
                  type="text"
                  name="to"
                  value={ticketFormData.to}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, to: e.target.value })}
                  required
                  placeholder="CEO"
                />
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={ticketFormData.title}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, title: e.target.value })}
                  placeholder={`Utility Approval Request - ${selectedUtility.utility_type}`}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={ticketFormData.description}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
                  rows="4"
                  placeholder="Enter ticket description..."
                />
              </div>

              <div className="form-group">
                <label>Priority *</label>
                <select
                  name="priority"
                  value={ticketFormData.priority}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, priority: e.target.value })}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Utility Information</label>
                <div className="info-box">
                  <p><strong>Type:</strong> {selectedUtility.utility_type}</p>
                  <p><strong>Amount:</strong> ₹{selectedUtility.amount ? parseFloat(selectedUtility.amount).toFixed(2) : '0.00'}</p>
                  {selectedUtility.vendor_name && <p><strong>Vendor:</strong> {selectedUtility.vendor_name}</p>}
                  {selectedUtility.employee_name && <p><strong>Employee Name:</strong> {selectedUtility.employee_name}</p>}
                  {selectedUtility.department && <p><strong>Department:</strong> {selectedUtility.department}</p>}
                  {selectedUtility.description && <p><strong>Description:</strong> {selectedUtility.description}</p>}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowTicketModal(false);
                    setSelectedUtility(null);
                    setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Raising...' : 'Raise Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfficeUtilitiesPage
