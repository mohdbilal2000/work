import React, { useState, useEffect } from 'react'
import './TDSPage.css'
import { tdsAPI } from '../../services/api'

function TDSPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    pan_number: '',
    tds_amount: '',
    financial_year: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await tdsAPI.getAll();
      if (response.success) {
        setRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading records:', error);
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
      const response = await tdsAPI.create({
        ...formData,
        tds_amount: parseFloat(formData.tds_amount) || 0
      });
      if (response.success) {
        setShowModal(false);
        setFormData({
          employee_id: '',
          employee_name: '',
          pan_number: '',
          tds_amount: '',
          financial_year: '',
          status: 'active'
        });
        loadRecords();
      }
    } catch (error) {
      console.error('Error creating record:', error);
      alert(`Failed to create record: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const workflowSteps = [
    {
      number: 1,
      title: 'Employee Registration',
      description: 'Register employees for TDS compliance'
    },
    {
      number: 2,
      title: 'PAN Verification',
      description: 'Verify and record employee PAN numbers'
    },
    {
      number: 3,
      title: 'TDS Calculation',
      description: 'Calculate TDS based on salary and tax slabs'
    },
    {
      number: 4,
      title: 'TDS Deduction',
      description: 'Deduct TDS from employee salaries'
    },
    {
      number: 5,
      title: 'TDS Filing',
      description: 'File quarterly TDS returns with Income Tax Department'
    },
    {
      number: 6,
      title: 'Form 16 Generation',
      description: 'Generate and issue Form 16 to employees'
    }
  ]

  return (
    <div className="tds-page">
      <div className="page-header">
        <h1>TDS Compliance</h1>
        <button 
          type="button"
          className="add-button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
          }}
        >
          Add TDS Record
        </button>
      </div>

      <div className="workflow-section">
        <h2 className="workflow-title">TDS Compliance Workflow Steps</h2>
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
        <div className="status-message">Loading records...</div>
      ) : records.length > 0 ? (
        <div className="records-table">
          <h3 className="table-title">TDS Records</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>PAN Number</th>
                <th>TDS Amount</th>
                <th>Financial Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{record.pan_number || 'N/A'}</td>
                  <td>₹{record.tds_amount || 0}</td>
                  <td>{record.financial_year || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="status-message">
          No TDS records found. Add your first TDS record!
        </div>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add TDS Record</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
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
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleInputChange}
                  maxLength="10"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div className="form-group">
                <label>TDS Amount</label>
                <input
                  type="number"
                  name="tds_amount"
                  value={formData.tds_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Financial Year</label>
                <input
                  type="text"
                  name="financial_year"
                  value={formData.financial_year}
                  onChange={handleInputChange}
                  placeholder="2024-25"
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
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TDSPage

