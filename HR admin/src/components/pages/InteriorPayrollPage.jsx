import React, { useState, useEffect } from 'react'
import './InteriorPayrollPage.css'
import { interiorPayrollAPI } from '../../services/api'

function InteriorPayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filters, setFilters] = useState({
    pay_month: '',
    pay_year: '',
    department: '',
    payment_status: ''
  })
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    department: '',
    designation: '',
    pay_period: '',
    pay_month: '',
    pay_year: '',
    basic_salary: '',
    allowances: '',
    deductions: '',
    net_salary: '',
    payment_status: 'pending',
    payment_date: '',
    payment_method: '',
    bank_account: '',
    ifsc_code: '',
    remarks: '',
    status: 'active'
  })

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  useEffect(() => {
    loadPayrollRecords()
  }, [filters])

  const loadPayrollRecords = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.pay_month) params.pay_month = filters.pay_month
      if (filters.pay_year) params.pay_year = filters.pay_year
      if (filters.department) params.department = filters.department
      if (filters.payment_status) params.payment_status = filters.payment_status

      const response = await interiorPayrollAPI.getAll(params)
      if (response.success) {
        setPayrollRecords(response.data)
      }
    } catch (error) {
      console.error('Error loading payroll records:', error)
      alert('Failed to load payroll records. Please try again.')
    } finally {
      setLoading(false)
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
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      // Auto-calculate net salary when basic_salary, allowances, or deductions change
      if (name === 'basic_salary' || name === 'allowances' || name === 'deductions') {
        const basic = name === 'basic_salary' ? parseFloat(value) || 0 : parseFloat(prev.basic_salary) || 0
        const allow = name === 'allowances' ? parseFloat(value) || 0 : parseFloat(prev.allowances) || 0
        const deduct = name === 'deductions' ? parseFloat(value) || 0 : parseFloat(prev.deductions) || 0
        newData.net_salary = (basic + allow - deduct).toFixed(2)
      }
      
      return newData
    })
  }

  const handleAddClick = () => {
    setEditingRecord(null)
    setFormData({
      employee_id: '',
      employee_name: '',
      department: '',
      designation: '',
      pay_period: '',
      pay_month: months[new Date().getMonth()],
      pay_year: String(currentYear),
      basic_salary: '',
      allowances: '',
      deductions: '',
      net_salary: '',
      payment_status: 'pending',
      payment_date: '',
      payment_method: '',
      bank_account: '',
      ifsc_code: '',
      remarks: '',
      status: 'active'
    })
    setShowModal(true)
  }

  const handleEditClick = (record) => {
    setEditingRecord(record)
    setFormData({
      employee_id: record.employee_id || '',
      employee_name: record.employee_name || '',
      department: record.department || '',
      designation: record.designation || '',
      pay_period: record.pay_period || '',
      pay_month: record.pay_month || months[new Date().getMonth()],
      pay_year: record.pay_year || String(currentYear),
      basic_salary: record.basic_salary || '',
      allowances: record.allowances || '',
      deductions: record.deductions || '',
      net_salary: record.net_salary || '',
      payment_status: record.payment_status || 'pending',
      payment_date: record.payment_date ? record.payment_date.split('T')[0] : '',
      payment_method: record.payment_method || '',
      bank_account: record.bank_account || '',
      ifsc_code: record.ifsc_code || '',
      remarks: record.remarks || '',
      status: record.status || 'active'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = {
        employee_id: formData.employee_id,
        employee_name: formData.employee_name,
        department: formData.department || null,
        designation: formData.designation || null,
        pay_period: formData.pay_period || null,
        pay_month: formData.pay_month,
        pay_year: formData.pay_year,
        basic_salary: parseFloat(formData.basic_salary) || 0,
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        net_salary: parseFloat(formData.net_salary) || 0,
        payment_status: formData.payment_status,
        payment_date: formData.payment_date || null,
        payment_method: formData.payment_method || null,
        bank_account: formData.bank_account || null,
        ifsc_code: formData.ifsc_code || null,
        remarks: formData.remarks || null,
        status: formData.status
      }

      let response
      if (editingRecord) {
        response = await interiorPayrollAPI.update(editingRecord.id, submitData)
      } else {
        response = await interiorPayrollAPI.create(submitData)
      }

      if (response.success) {
        setShowModal(false)
        setEditingRecord(null)
        loadPayrollRecords()
        alert(editingRecord ? 'Payroll record updated successfully!' : 'Payroll record added successfully!')
      } else {
        alert(`Failed to ${editingRecord ? 'update' : 'create'} payroll record: ${response.error || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('Error saving payroll record:', error)
      alert(`Failed to ${editingRecord ? 'update' : 'create'} payroll record: ${error.message || 'Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll record?')) {
      return
    }
    try {
      await interiorPayrollAPI.delete(id)
      alert('Payroll record deleted successfully!')
      loadPayrollRecords()
    } catch (error) {
      console.error('Error deleting payroll record:', error)
      alert(`Failed to delete payroll record: ${error.message || 'Please try again.'}`)
    }
  }

  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'status-paid'
      case 'pending':
        return 'status-pending'
      case 'processing':
        return 'status-processing'
      default:
        return 'status-default'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  // Get unique departments for filter
  const departments = [...new Set(payrollRecords.map(r => r.department).filter(Boolean))]

  if (loading) {
    return <div className="interior-payroll-page"><div className="loading">Loading payroll records...</div></div>
  }

  return (
    <div className="interior-payroll-page">
      <div className="page-header">
        <h1>Internal Payroll</h1>
        <button className="btn-primary" onClick={handleAddClick}>
          + Add Payroll Record
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Pay Month</label>
            <select name="pay_month" value={filters.pay_month} onChange={handleFilterChange}>
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Pay Year</label>
            <select name="pay_year" value={filters.pay_year} onChange={handleFilterChange}>
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={String(year)}>{year}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Department</label>
            <select name="department" value={filters.department} onChange={handleFilterChange}>
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Payment Status</label>
            <select name="payment_status" value={filters.payment_status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="filter-group">
            <button className="btn-secondary" onClick={() => setFilters({ pay_month: '', pay_year: '', department: '', payment_status: '' })}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="payroll-section">
        <h2>Payroll Records ({payrollRecords.length})</h2>
        {payrollRecords.length === 0 ? (
          <div className="no-records">No payroll records found. Add your first payroll record to get started.</div>
        ) : (
          <div className="table-container">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Pay Period</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Payment Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.employee_id}</td>
                    <td>{record.employee_name}</td>
                    <td>{record.department || '-'}</td>
                    <td>{record.designation || '-'}</td>
                    <td>{record.pay_month} {record.pay_year}</td>
                    <td>₹{parseFloat(record.basic_salary || 0).toFixed(2)}</td>
                    <td>₹{parseFloat(record.allowances || 0).toFixed(2)}</td>
                    <td>₹{parseFloat(record.deductions || 0).toFixed(2)}</td>
                    <td className="net-salary">₹{parseFloat(record.net_salary || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getPaymentStatusBadgeClass(record.payment_status)}`}>
                        {record.payment_status || 'pending'}
                      </span>
                    </td>
                    <td>{formatDate(record.payment_date)}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEditClick(record)} title="Edit">
                          ✏️
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(record.id)} title="Delete">
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecord ? 'Edit Payroll Record' : 'Add Payroll Record'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Employee Name *</label>
                  <input
                    type="text"
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pay Month *</label>
                  <select
                    name="pay_month"
                    value={formData.pay_month}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pay Year *</label>
                  <select
                    name="pay_year"
                    value={formData.pay_year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={String(year)}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Basic Salary *</label>
                  <input
                    type="number"
                    name="basic_salary"
                    value={formData.basic_salary}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Allowances</label>
                  <input
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Deductions</label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Net Salary</label>
                  <input
                    type="number"
                    name="net_salary"
                    value={formData.net_salary}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bank Account</label>
                  <input
                    type="text"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    maxLength="11"
                    placeholder="ABCD0123456"
                  />
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
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteriorPayrollPage

