import React, { useState, useEffect } from 'react'
import './TicketManagementPage.css'
import { ticketsAPI, vendorsAPI, utilitiesAPI } from '../../services/api'

function TicketManagementPage() {
  const [tickets, setTickets] = useState([])
  const [vendors, setVendors] = useState([])
  const [utilities, setUtilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [editingTicket, setEditingTicket] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    vendor_id: '',
    utility_id: ''
  })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    raised_by: 'Admin',
    assigned_to: 'CEO',
    vendor_id: '',
    utility_id: '',
    resolution_notes: ''
  })

  useEffect(() => {
    loadTickets()
    loadVendors()
    loadUtilities()
  }, [filters])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.vendor_id) params.vendor_id = filters.vendor_id
      if (filters.utility_id) params.utility_id = filters.utility_id

      const response = await ticketsAPI.getAll(params)
      if (response.success) {
        setTickets(response.data)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
      alert('Failed to load tickets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadVendors = async () => {
    try {
      const response = await vendorsAPI.getAll()
      if (response.success) {
        setVendors(response.data)
      }
    } catch (error) {
      console.error('Error loading vendors:', error)
    }
  }

  const loadUtilities = async () => {
    try {
      const response = await utilitiesAPI.getAll()
      if (response.success) {
        setUtilities(response.data)
      }
    } catch (error) {
      console.error('Error loading utilities:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket)
    setShowDetailModal(true)
  }

  const handleEditClick = (ticket) => {
    setEditingTicket(ticket)
    setFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'medium',
      status: ticket.status || 'open',
      raised_by: ticket.raised_by || 'Admin',
      assigned_to: ticket.assigned_to || 'CEO',
      vendor_id: ticket.vendor_id || '',
      utility_id: ticket.utility_id || '',
      resolution_notes: ticket.resolution_notes || ''
    })
    setShowModal(true)
  }

  const handleAddClick = () => {
    setEditingTicket(null)
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      raised_by: 'Admin',
      assigned_to: 'CEO',
      vendor_id: '',
      utility_id: '',
      resolution_notes: ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTicket) {
        // Update existing ticket
        const updateData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          assigned_to: formData.assigned_to,
          resolution_notes: formData.resolution_notes || null
        }
        await ticketsAPI.update(editingTicket.id, updateData)
        alert('Ticket updated successfully!')
      } else {
        // Create new ticket
        const createData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          raised_by: formData.raised_by,
          assigned_to: formData.assigned_to,
          vendor_id: formData.vendor_id || null,
          utility_id: formData.utility_id || null
        }
        await ticketsAPI.create(createData)
        alert('Ticket created successfully!')
      }
      setShowModal(false)
      setEditingTicket(null)
      loadTickets()
    } catch (error) {
      console.error('Error saving ticket:', error)
      alert(`Failed to save ticket: ${error.message}`)
    }
  }

  const handleCloseTicket = async (ticket) => {
    if (!window.confirm(`Are you sure you want to close ticket ${ticket.ticket_number}?`)) {
      return
    }
    const resolutionNotes = prompt('Enter resolution notes (optional):', ticket.resolution_notes || '')
    try {
      await ticketsAPI.close(ticket.id, {
        resolution_notes: resolutionNotes || 'Ticket closed by admin'
      })
      alert('Ticket closed successfully!')
      loadTickets()
      if (showDetailModal) {
        setShowDetailModal(false)
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error closing ticket:', error)
      alert(`Failed to close ticket: ${error.message}`)
    }
  }

  const handleResolveTicket = async (ticket) => {
    if (!window.confirm(`Are you sure you want to resolve ticket ${ticket.ticket_number}?`)) {
      return
    }
    const resolutionNotes = prompt('Enter resolution notes (optional):', ticket.resolution_notes || '')
    try {
      await ticketsAPI.resolve(ticket.id, {
        resolution_notes: resolutionNotes || 'Ticket resolved by admin'
      })
      alert('Ticket resolved successfully!')
      loadTickets()
      if (showDetailModal) {
        setShowDetailModal(false)
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error resolving ticket:', error)
      alert(`Failed to resolve ticket: ${error.message}`)
    }
  }

  const handleDeleteTicket = async (ticket) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticket.ticket_number}? This action cannot be undone.`)) {
      return
    }
    try {
      await ticketsAPI.delete(ticket.id)
      alert('Ticket deleted successfully!')
      loadTickets()
      if (showDetailModal) {
        setShowDetailModal(false)
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert(`Failed to delete ticket: ${error.message}`)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'status-open'
      case 'pending':
        return 'status-pending'
      case 'resolved':
        return 'status-resolved'
      case 'closed':
        return 'status-closed'
      default:
        return 'status-default'
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-high'
      case 'medium':
        return 'priority-medium'
      case 'low':
        return 'priority-low'
      default:
        return 'priority-medium'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="ticket-management-page"><div className="loading">Loading tickets...</div></div>
  }

  return (
    <div className="ticket-management-page">
      <div className="page-header">
        <h1>Ticket Management</h1>
        <button className="btn-primary" onClick={handleAddClick}>
          + Create Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Priority</label>
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Vendor</label>
            <select name="vendor_id" value={filters.vendor_id} onChange={handleFilterChange}>
              <option value="">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Utility</label>
            <select name="utility_id" value={filters.utility_id} onChange={handleFilterChange}>
              <option value="">All Utilities</option>
              {utilities.map(utility => (
                <option key={utility.id} value={utility.id}>{utility.utility_type} - {utility.description || 'N/A'}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <button className="btn-secondary" onClick={() => setFilters({ status: '', priority: '', vendor_id: '', utility_id: '' })}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="tickets-section">
        <h2>Tickets ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <div className="no-tickets">No tickets found. Create a new ticket to get started.</div>
        ) : (
          <div className="table-container">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Related To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Raised By</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td className="ticket-number">{ticket.ticket_number}</td>
                    <td className="ticket-title">{ticket.title}</td>
                    <td>
                      {ticket.vendor_id ? 'Vendor' : ticket.utility_id ? 'Utility' : 'General'}
                    </td>
                    <td>
                      {ticket.vendor_name || ticket.utility_type || '-'}
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority || 'medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
                        {ticket.status || 'open'}
                      </span>
                    </td>
                    <td>{ticket.raised_by || 'Admin'}</td>
                    <td>{ticket.assigned_to || 'CEO'}</td>
                    <td>{formatDate(ticket.created_at)}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="btn-view" 
                          onClick={() => handleViewDetails(ticket)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditClick(ticket)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                          <>
                            <button 
                              className="btn-resolve" 
                              onClick={() => handleResolveTicket(ticket)}
                              title="Resolve"
                            >
                              ✅
                            </button>
                            <button 
                              className="btn-close" 
                              onClick={() => handleCloseTicket(ticket)}
                              title="Close"
                            >
                              🔒
                            </button>
                          </>
                        )}
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteTicket(ticket)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                {editingTicket && (
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Raised By</label>
                  <input
                    type="text"
                    name="raised_by"
                    value={formData.raised_by}
                    onChange={handleInputChange}
                    disabled={!!editingTicket}
                  />
                </div>
                <div className="form-group">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {!editingTicket && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Related Vendor (Optional)</label>
                    <select
                      name="vendor_id"
                      value={formData.vendor_id}
                      onChange={handleInputChange}
                    >
                      <option value="">None</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Related Utility (Optional)</label>
                    <select
                      name="utility_id"
                      value={formData.utility_id}
                      onChange={handleInputChange}
                    >
                      <option value="">None</option>
                      {utilities.map(utility => (
                        <option key={utility.id} value={utility.id}>{utility.utility_type} - {utility.description || 'N/A'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {editingTicket && (
                <div className="form-group">
                  <label>Resolution Notes</label>
                  <textarea
                    name="resolution_notes"
                    value={formData.resolution_notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add resolution notes..."
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTicket ? 'Update Ticket' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {showDetailModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="ticket-details">
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-label">Ticket Number:</span>
                  <span className="detail-value">{selectedTicket.ticket_number}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{selectedTicket.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedTicket.description || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Priority:</span>
                  <span className={`priority-badge ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                    {selectedTicket.priority || 'medium'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedTicket.status)}`}>
                    {selectedTicket.status || 'open'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">
                    {selectedTicket.vendor_id ? 'Vendor Ticket' : selectedTicket.utility_id ? 'Utility Ticket' : 'General Ticket'}
                  </span>
                </div>
                {selectedTicket.vendor_name && (
                  <div className="detail-row">
                    <span className="detail-label">Related Vendor:</span>
                    <span className="detail-value">{selectedTicket.vendor_name}</span>
                  </div>
                )}
                {selectedTicket.utility_type && (
                  <div className="detail-row">
                    <span className="detail-label">Related Utility:</span>
                    <span className="detail-value">{selectedTicket.utility_type} - {selectedTicket.utility_description || 'N/A'}</span>
                  </div>
                )}
                {selectedTicket.employee_name && (
                  <div className="detail-row">
                    <span className="detail-label">Employee Name:</span>
                    <span className="detail-value">{selectedTicket.employee_name}</span>
                  </div>
                )}
                {selectedTicket.department && (
                  <div className="detail-row">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{selectedTicket.department}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Raised By:</span>
                  <span className="detail-value">{selectedTicket.raised_by || 'Admin'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Assigned To:</span>
                  <span className="detail-value">{selectedTicket.assigned_to || 'CEO'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">{formatDateTime(selectedTicket.created_at)}</span>
                </div>
                {selectedTicket.updated_at && (
                  <div className="detail-row">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{formatDateTime(selectedTicket.updated_at)}</span>
                  </div>
                )}
                {selectedTicket.closed_at && (
                  <div className="detail-row">
                    <span className="detail-label">Closed At:</span>
                    <span className="detail-value">{formatDateTime(selectedTicket.closed_at)}</span>
                  </div>
                )}
                {selectedTicket.resolution_notes && (
                  <div className="detail-row">
                    <span className="detail-label">Resolution Notes:</span>
                    <span className="detail-value">{selectedTicket.resolution_notes}</span>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
                <button className="btn-primary" onClick={() => {
                  setShowDetailModal(false)
                  handleEditClick(selectedTicket)
                }}>
                  Edit Ticket
                </button>
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <>
                    <button className="btn-resolve" onClick={() => handleResolveTicket(selectedTicket)}>
                      Resolve
                    </button>
                    <button className="btn-close" onClick={() => handleCloseTicket(selectedTicket)}>
                      Close Ticket
                    </button>
                  </>
                )}
                <button className="btn-delete" onClick={() => handleDeleteTicket(selectedTicket)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketManagementPage

