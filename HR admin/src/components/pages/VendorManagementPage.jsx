import React, { useState, useEffect } from 'react'
import './VendorManagementPage.css'
import { vendorsAPI } from '../../services/api'

const ticketsAPI = {
  getAll: () => fetch('/api/tickets').then(res => res.json()),
  create: (data) => fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id, data) => fetch(`/api/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  close: (id, data) => fetch(`/api/tickets/${id}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  resolve: (id, data) => fetch(`/api/tickets/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
}

function VendorManagementPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    service_type: '',
    contract_start_date: '',
    contract_end_date: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorsAPI.getAll();
      if (response.success) {
        // Ensure invoice_uploaded is properly converted to number
        const vendorsWithProperTypes = response.data.map(vendor => {
          // Convert invoice_uploaded to number (1 or 0)
          let invoiceUploaded = 0;
          if (vendor.invoice_uploaded === 1 || vendor.invoice_uploaded === true || vendor.invoice_uploaded === '1') {
            invoiceUploaded = 1;
          }
          
          let ticketRaised = 0;
          if (vendor.ticket_raised === 1 || vendor.ticket_raised === true || vendor.ticket_raised === '1') {
            ticketRaised = 1;
          }
          
          let ceoApproved = 0;
          if (vendor.ceo_approved === 1 || vendor.ceo_approved === true || vendor.ceo_approved === '1') {
            ceoApproved = 1;
          }
          
          console.log('Vendor:', vendor.vendor_name, 'invoice_uploaded (raw):', vendor.invoice_uploaded, '-> (converted):', invoiceUploaded);
          
          return {
            ...vendor,
            invoice_uploaded: invoiceUploaded,
            ticket_raised: ticketRaised,
            ceo_approved: ceoApproved
          };
        });
        console.log('Loaded vendors:', vendorsWithProperTypes);
        setVendors(vendorsWithProperTypes);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await vendorsAPI.create(formData);
      if (response.success) {
        setShowModal(false);
        setFormData({
          vendor_name: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
          service_type: '',
          contract_start_date: '',
          contract_end_date: '',
          status: 'active'
        });
        loadVendors();
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      alert(`Failed to create vendor: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showTicketList, setShowTicketList] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketFormData, setTicketFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    from: 'Admin',
    to: 'CEO'
  });

  const handleInvoiceUpload = (vendor) => {
    setSelectedVendor(vendor);
    setShowInvoiceModal(true);
  };

  const handleViewInvoice = (vendor) => {
    // Allow viewing invoice even if not uploaded (temporary - for testing)
    // Will show message if no invoice uploaded
    setSelectedVendor(vendor);
    setShowViewInvoiceModal(true);
  };

  const handleFileChange = (e) => {
    setInvoiceFile(e.target.files[0]);
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceFile) {
      alert('Please select an invoice file');
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('invoice', invoiceFile);

      console.log('Uploading invoice for vendor:', selectedVendor.id);
      console.log('File:', invoiceFile.name, 'Size:', invoiceFile.size);

      // Upload file to server - use proxy path
      const uploadResponse = await fetch(`/api/vendors/${selectedVendor.id}/upload-invoice`, {
        method: 'POST',
        body: formData
      });

      // Check if response is OK
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Server error: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      // Try to parse JSON response
      let uploadResult;
      try {
        uploadResult = await uploadResponse.json();
      } catch (jsonError) {
        const responseText = await uploadResponse.text();
        console.error('JSON parse error. Response:', responseText);
        throw new Error('Server returned invalid response. Please check if backend server is running.');
      }

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file');
      }

      console.log('Invoice file uploaded successfully:', uploadResult);
      
      // Immediately update the vendor in the local state
      setVendors(prevVendors => {
        const updated = prevVendors.map(v => {
          if (v.id === selectedVendor.id) {
            const updatedVendor = { 
              ...v, 
              invoice_uploaded: 1,
              invoice_file_path: uploadResult.file.path,
              invoice_original_name: uploadResult.file.originalName
            };
            console.log('Updated vendor in state:', updatedVendor);
            return updatedVendor;
          }
          return v;
        });
        return updated;
      });
      
      setShowInvoiceModal(false);
      setInvoiceFile(null);
      setSelectedVendor(null);
      
      // Reload from server to ensure consistency
      setTimeout(async () => {
        await loadVendors();
      }, 300);
      
      alert('Invoice uploaded and saved successfully. You can now raise a ticket.');
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert(`Failed to upload invoice: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRaiseTicket = (vendor) => {
    // Allow raising ticket even if invoice not uploaded (temporary - for testing)
    // if (!vendor.invoice_uploaded) {
    //   alert('Please upload invoice first before raising a ticket');
    //   return;
    // }

    setSelectedVendor(vendor);
    setShowTicketModal(true);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Build description with invoice information if available
      let description = ticketFormData.description || `Invoice approval request for vendor: ${selectedVendor.vendor_name}`;
      if (selectedVendor.invoice_uploaded === 1 || selectedVendor.invoice_uploaded === true || selectedVendor.invoice_uploaded === '1') {
        if (selectedVendor.invoice_file_path) {
          description += `\n\nInvoice File: ${selectedVendor.invoice_file_path}`;
          description += `\nInvoice Status: Uploaded`;
        }
      }
      
      const response = await ticketsAPI.create({
        vendor_id: selectedVendor.id,
        title: ticketFormData.title || `Invoice Approval Request - ${selectedVendor.vendor_name}`,
        description: description,
        priority: ticketFormData.priority,
        raised_by: ticketFormData.from || 'Admin',
        assigned_to: ticketFormData.to || 'CEO'
      });
      
      if (response.success) {
        setShowTicketModal(false);
        setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
        setSelectedVendor(null);
        loadVendors();
        alert(`Ticket raised from ${ticketFormData.from || 'Admin'} to ${ticketFormData.to || 'CEO'}. Invoice information included.`);
      }
    } catch (error) {
      console.error('Error raising ticket:', error);
      alert(`Failed to raise ticket: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const loadTickets = async () => {
    try {
      const response = await ticketsAPI.getAll();
      if (response.success) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleCloseTicket = async (ticket) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) {
      return;
    }

    try {
      const response = await ticketsAPI.close(ticket.id, {
        resolution_notes: 'Ticket closed by admin'
      });
      
      if (response.success) {
        loadTickets();
        loadVendors();
        alert('Ticket closed successfully');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert(`Failed to close ticket: ${error.message || 'Please try again.'}`);
    }
  };

  const handleCEOApproval = async (vendor) => {
    if (vendor.ticket_status !== 'resolved') {
      alert('Ticket must be resolved before CEO approval');
      return;
    }

    try {
      const response = await vendorsAPI.update(vendor.id, {
        ...vendor,
        ceo_approved: 1,
        ceo_approval_date: new Date().toISOString().split('T')[0]
      });
      
      if (response.success) {
        loadVendors();
        alert('CEO approval granted');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert(`Failed to approve: ${error.message || 'Please try again.'}`);
    }
  };

  const handleResolveTicket = async (vendor) => {
    if (!vendor.ticket_id) {
      alert('No ticket found for this vendor');
      return;
    }

    try {
      // Find the ticket by ticket_id
      const allTickets = await ticketsAPI.getAll();
      const ticket = allTickets.data?.find(t => t.ticket_number === vendor.ticket_id);
      
      if (!ticket) {
        alert('Ticket not found');
        return;
      }

      const response = await ticketsAPI.resolve(ticket.id, {
        resolution_notes: 'Ticket resolved. Ready for CEO approval.'
      });
      
      if (response.success) {
        loadVendors();
        loadTickets();
        alert('Ticket resolved. CEO can now approve.');
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
      alert(`Failed to resolve ticket: ${error.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="vendor-management-page">
      <div className="page-header">
        <h1>Vendor Management</h1>
        <div className="header-actions">
          <button 
            type="button"
            className="add-button secondary"
            onClick={() => {
              setShowTicketList(!showTicketList);
              if (!showTicketList) {
                loadTickets();
              }
            }}
          >
            {showTicketList ? 'Hide Tickets' : 'View Tickets'}
          </button>
          <button 
            type="button"
            className="add-button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Add Vendor clicked, opening modal');
              setShowModal(true);
            }}
          >
            Add Vendor
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {showTicketList && (
        <div className="tickets-section">
          <h2 className="section-title">Tickets</h2>
          {tickets.length > 0 ? (
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-info">
                      <span className="ticket-number">{ticket.ticket_number}</span>
                      <h3 className="ticket-title">{ticket.title}</h3>
                    </div>
                    <div className="ticket-badges">
                      <span className={`priority-badge ${ticket.priority}`}>
                        {ticket.priority}
                      </span>
                      <span className={`ticket-status-badge ${ticket.status}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <div className="ticket-body">
                    <p className="ticket-description">{ticket.description || 'No description'}</p>
                    <div className="ticket-meta">
                      <span>Vendor: {ticket.vendor_name || 'N/A'}</span>
                      <span>Assigned to: {ticket.assigned_to || 'CEO'}</span>
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    {ticket.resolution_notes && (
                      <div className="ticket-resolution">
                        <strong>Resolution:</strong> {ticket.resolution_notes}
                      </div>
                    )}
                  </div>
                  <div className="ticket-actions">
                    {ticket.status === 'open' && (
                      <button
                        className="action-btn resolve-btn"
                        onClick={() => handleResolveTicket({ ticket_id: ticket.ticket_number })}
                      >
                        Resolve
                      </button>
                    )}
                    {ticket.status !== 'closed' && (
                      <button
                        className="action-btn close-btn"
                        onClick={() => handleCloseTicket(ticket)}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="status-message">No tickets found</div>
          )}
        </div>
      )}

      {loading ? (
        <div className="status-message">Loading vendors...</div>
      ) : vendors.length > 0 ? (
        <div className="vendors-grid">
          <h3 className="section-title">Vendors</h3>
          <div className="vendor-tiles">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="vendor-tile">
                <div className="tile-header">
                  <h3 className="vendor-name">{vendor.vendor_name}</h3>
                  <span className={`status-badge ${vendor.status}`}>
                    {vendor.status}
                  </span>
                </div>
                
                <div className="tile-body">
                  <div className="vendor-info">
                    <div className="info-item">
                      <span className="info-label">Contact Person:</span>
                      <span className="info-value">{vendor.contact_person || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{vendor.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{vendor.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Service Type:</span>
                      <span className="info-value">{vendor.service_type || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="tile-status-section">
                    <div className="status-item">
                      <span className="status-label">Invoice:</span>
                      {(vendor.invoice_uploaded === 1 || vendor.invoice_uploaded === true || vendor.invoice_uploaded === '1') ? (
                        <span className="invoice-badge uploaded">Uploaded</span>
                      ) : (
                        <span className="invoice-badge not-uploaded">Not Uploaded</span>
                      )}
                    </div>
                    <div className="status-item">
                      <span className="status-label">Ticket:</span>
                      {(vendor.ticket_raised === 1 || vendor.ticket_raised === true || vendor.ticket_raised === '1') ? (
                        <span className={`ticket-badge ${vendor.ticket_status}`}>
                          {vendor.ticket_status === 'pending' || vendor.ticket_status === 'open' ? 'Pending' : 
                           vendor.ticket_status === 'resolved' ? 'Resolved' : 
                           vendor.ticket_status === 'closed' ? 'Closed' : vendor.ticket_status}
                        </span>
                      ) : (
                        <span className="ticket-badge not-raised">Not Raised</span>
                      )}
                    </div>
                    <div className="status-item">
                      <span className="status-label">CEO Approval:</span>
                      {(vendor.ceo_approved === 1 || vendor.ceo_approved === true || vendor.ceo_approved === '1') ? (
                        <span className="approval-badge approved">Approved</span>
                      ) : (
                        <span className="approval-badge not-approved">Not Approved</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="tile-actions">
                  {/* Always show Upload Invoice button */}
                  <button
                    className="action-btn upload-btn"
                    onClick={() => handleInvoiceUpload(vendor)}
                    title="Upload Invoice"
                  >
                    📄 Upload Invoice
                  </button>
                  
                  {/* Always show View Invoice button */}
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewInvoice(vendor)}
                    title="View Invoice"
                  >
                    👁️ View Invoice
                  </button>
                  
                  {/* Always show Raise Ticket button if ticket not raised */}
                  {(!vendor.ticket_raised || vendor.ticket_raised === 0 || vendor.ticket_raised === false || vendor.ticket_raised === '0' || vendor.ticket_raised === null || vendor.ticket_raised === undefined) && (
                    <button
                      className="action-btn ticket-btn"
                      onClick={() => handleRaiseTicket(vendor)}
                      title="Raise Ticket"
                    >
                      🎫 Raise Ticket
                    </button>
                  )}
                  
                  {/* Show Resolve Ticket button if ticket is raised and pending */}
                  {(vendor.ticket_raised === 1 || vendor.ticket_raised === true || vendor.ticket_raised === '1') && 
                   (vendor.ticket_status === 'pending' || vendor.ticket_status === 'open') && (
                    <button
                      className="action-btn resolve-btn"
                      onClick={() => handleResolveTicket(vendor)}
                      title="Resolve Ticket"
                    >
                      ✅ Resolve Ticket
                    </button>
                  )}
                  
                  {/* Show CEO Approve button if ticket is resolved */}
                  {vendor.ticket_status === 'resolved' && 
                   (!vendor.ceo_approved || vendor.ceo_approved === 0 || vendor.ceo_approved === false || vendor.ceo_approved === '0' || vendor.ceo_approved === null || vendor.ceo_approved === undefined) && (
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleCEOApproval(vendor)}
                      title="CEO Approval"
                    >
                      ✓ CEO Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="status-message">
          No vendors found. Add your first vendor!
        </div>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            console.log('Closing modal');
            setShowModal(false);
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <h2>Add Vendor</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Service Type</label>
                <input
                  type="text"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleInputChange}
                  placeholder="e.g., Cleaning, Security, IT Services"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contract Start Date</label>
                  <input
                    type="date"
                    name="contract_start_date"
                    value={formData.contract_start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Contract End Date</label>
                  <input
                    type="date"
                    name="contract_end_date"
                    value={formData.contract_end_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Upload Modal */}
      {showInvoiceModal && selectedVendor && (
        <div className="modal-overlay" onClick={() => {
          setShowInvoiceModal(false);
          setSelectedVendor(null);
          setInvoiceFile(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Invoice - {selectedVendor.vendor_name}</h2>
              <button className="modal-close" onClick={() => {
                setShowInvoiceModal(false);
                setSelectedVendor(null);
                setInvoiceFile(null);
              }}>×</button>
            </div>
            <form onSubmit={handleInvoiceSubmit} className="modal-form">
              <div className="form-group">
                <label>Select Invoice File *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                  required
                />
                <p className="file-help-text" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Supported formats: PDF, JPG, JPEG, PNG, GIF, BMP, WEBP, DOC, DOCX, XLS, XLSX, TXT (Max 10MB)
                </p>
                {invoiceFile && (
                  <p className="file-name">Selected: {invoiceFile.name} ({(invoiceFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedVendor(null);
                  setInvoiceFile(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting || !invoiceFile}>
                  {submitting ? 'Uploading...' : 'Upload Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showTicketModal && selectedVendor && (
        <div className="modal-overlay" onClick={() => {
          setShowTicketModal(false);
          setSelectedVendor(null);
          setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Raise Ticket - {selectedVendor.vendor_name}</h2>
              <button className="modal-close" onClick={() => {
                setShowTicketModal(false);
                setSelectedVendor(null);
                setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
              }}>×</button>
            </div>
            <form onSubmit={handleTicketSubmit} className="modal-form">
              <div className="form-group">
                <label>From (Raised By) *</label>
                <input
                  type="text"
                  value={ticketFormData.from}
                  onChange={(e) => setTicketFormData(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="e.g., Admin, HR Manager"
                  required
                />
              </div>
              <div className="form-group">
                <label>To (Assigned To) *</label>
                <input
                  type="text"
                  value={ticketFormData.to}
                  onChange={(e) => setTicketFormData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="e.g., CEO, Finance Manager"
                  required
                />
              </div>
              <div className="form-group">
                <label>Ticket Title *</label>
                <input
                  type="text"
                  value={ticketFormData.title || `Invoice Approval Request - ${selectedVendor.vendor_name}`}
                  onChange={(e) => setTicketFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={ticketFormData.description || `Invoice approval request for vendor: ${selectedVendor.vendor_name}`}
                  onChange={(e) => setTicketFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="4"
                  placeholder="Describe the ticket details..."
                />
              </div>
              <div className="form-group">
                <label>Invoice Attachment</label>
                {(selectedVendor.invoice_uploaded === 1 || selectedVendor.invoice_uploaded === true || selectedVendor.invoice_uploaded === '1' || selectedVendor.invoice_file_path) ? (
                  <div className="invoice-attachment-info">
                    <div className="attachment-item">
                      <span className="attachment-icon">📄</span>
                      <div className="attachment-details">
                        <span className="attachment-name">{selectedVendor.invoice_original_name || selectedVendor.invoice_file_path || 'Invoice file'}</span>
                        <span className="attachment-status">Invoice uploaded and attached</span>
                        {selectedVendor.invoice_file_path && (
                          <a 
                            href={selectedVendor.invoice_file_path.startsWith('/') ? `https://api-hr.defitex2.0.org${selectedVendor.invoice_file_path}` : selectedVendor.invoice_file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-link"
                            style={{ marginTop: '8px', display: 'inline-block', color: '#2563eb', textDecoration: 'underline', fontSize: '12px' }}
                          >
                            View/Download Invoice
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="invoice-attachment-info" style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
                    <div className="attachment-item">
                      <span className="attachment-icon">⚠️</span>
                      <div className="attachment-details">
                        <span className="attachment-name">No invoice uploaded</span>
                        <span className="attachment-status" style={{ color: '#92400e' }}>Please upload invoice first</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={ticketFormData.priority}
                  onChange={(e) => setTicketFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowTicketModal(false);
                  setSelectedVendor(null);
                  setTicketFormData({ title: '', description: '', priority: 'medium', from: 'Admin', to: 'CEO' });
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Raising...' : 'Raise Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewInvoiceModal && selectedVendor && (
        <div className="modal-overlay" onClick={() => {
          setShowViewInvoiceModal(false);
          setSelectedVendor(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>View Invoice - {selectedVendor.vendor_name}</h2>
              <button className="modal-close" onClick={() => {
                setShowViewInvoiceModal(false);
                setSelectedVendor(null);
              }}>×</button>
            </div>
            <div className="modal-form">
              <div className="invoice-view-section">
                <div className="invoice-info-card">
                  <h3 className="invoice-info-title">Invoice Details</h3>
                  <div className="invoice-details">
                    <div className="detail-row">
                      <span className="detail-label">Vendor Name:</span>
                      <span className="detail-value">{selectedVendor.vendor_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Invoice File:</span>
                      <span className="detail-value">
                        {selectedVendor.invoice_original_name || selectedVendor.invoice_file_path || 'N/A'}
                        {selectedVendor.invoice_file_path && (
                          <a 
                            href={selectedVendor.invoice_file_path.startsWith('/') ? `https://api-hr.defitex2.0.org${selectedVendor.invoice_file_path}` : selectedVendor.invoice_file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: '8px', color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}
                          >
                            (View/Download)
                          </a>
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Upload Status:</span>
                      <span className="detail-value">
                        {(selectedVendor.invoice_uploaded === 1 || selectedVendor.invoice_uploaded === true || selectedVendor.invoice_uploaded === '1') ? (
                          <span className="invoice-badge uploaded">Uploaded</span>
                        ) : (
                          <span className="invoice-badge not-uploaded">Not Uploaded</span>
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Upload Date:</span>
                      <span className="detail-value">
                        {selectedVendor.updated_at 
                          ? new Date(selectedVendor.updated_at).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="invoice-preview-section">
                  <h3 className="invoice-info-title">Invoice Preview</h3>
                  <div className="invoice-preview">
                    {(selectedVendor.invoice_uploaded === 1 || selectedVendor.invoice_uploaded === true || selectedVendor.invoice_uploaded === '1') && selectedVendor.invoice_file_path ? (
                      <div className="invoice-file-preview">
                        <div className="file-icon">
                          {selectedVendor.invoice_file_path.toLowerCase().endsWith('.pdf') ? '📄' :
                           selectedVendor.invoice_file_path.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? '🖼️' :
                           selectedVendor.invoice_file_path.toLowerCase().match(/\.(doc|docx)$/i) ? '📝' :
                           selectedVendor.invoice_file_path.toLowerCase().match(/\.(xls|xlsx)$/i) ? '📊' :
                           selectedVendor.invoice_file_path.toLowerCase().match(/\.(txt)$/i) ? '📃' : '📎'}
                        </div>
                        <p className="file-name-large">{selectedVendor.invoice_original_name || selectedVendor.invoice_file_path}</p>
                        <p className="file-info">Invoice file uploaded successfully</p>
                        <div className="invoice-actions">
                          <a
                            href={selectedVendor.invoice_file_path.startsWith('/') ? `https://api-hr.defitex2.0.org${selectedVendor.invoice_file_path}` : selectedVendor.invoice_file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn download-btn"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            ⬇️ Download Invoice
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="no-invoice">
                        <div className="file-icon">📄</div>
                        <p className="file-name-large">No Invoice Uploaded</p>
                        <p className="file-info">Please upload an invoice first to view it here.</p>
                        <div className="invoice-actions">
                          <button
                            className="action-btn upload-btn"
                            onClick={() => {
                              setShowViewInvoiceModal(false);
                              handleInvoiceUpload(selectedVendor);
                            }}
                          >
                            📄 Upload Invoice Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowViewInvoiceModal(false);
                    setSelectedVendor(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorManagementPage

