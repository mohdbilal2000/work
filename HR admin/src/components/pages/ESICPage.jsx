import React, { useState, useEffect } from 'react'
import './ESICPage.css'
import { esicAPI } from '../../services/api'

function ESICPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    esic_number: '',
    monthly_contribution: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await esicAPI.getAll();
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
      const response = await esicAPI.create({
        ...formData,
        monthly_contribution: parseFloat(formData.monthly_contribution) || 0
      });
      if (response.success) {
        setShowModal(false);
        setFormData({
          employee_id: '',
          employee_name: '',
          esic_number: '',
          monthly_contribution: '',
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
      description: 'Register employees for ESIC compliance'
    },
    {
      number: 2,
      title: 'ESIC Number Generation',
      description: 'Generate and assign ESIC numbers to employees'
    },
    {
      number: 3,
      title: 'Contribution Calculation',
      description: 'Calculate employee and employer ESIC contributions'
    },
    {
      number: 4,
      title: 'Payment Processing',
      description: 'Process monthly ESIC payments to authorities'
    },
    {
      number: 5,
      title: 'Filing & Returns',
      description: 'File monthly and annual ESIC returns'
    },
    {
      number: 6,
      title: 'Compliance Audit',
      description: 'Conduct regular ESIC compliance audits'
    }
  ]

  return (
    <div className="esic-page">
      <div className="page-header">
        <h1>ESIC Compliance</h1>
        <button 
          type="button"
          className="add-button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
          }}
        >
          Add ESIC Record
        </button>
      </div>

      <div className="workflow-section">
        <h2 className="workflow-title">ESIC Compliance Workflow Steps</h2>
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
          <h3 className="table-title">ESIC Records</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>ESIC Number</th>
                <th>Monthly Contribution</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{record.esic_number || 'N/A'}</td>
                  <td>₹{record.monthly_contribution || 0}</td>
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
          No ESIC records found. Add your first ESIC record!
        </div>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add ESIC Record</h2>
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
                <label>ESIC Number</label>
                <input
                  type="text"
                  name="esic_number"
                  value={formData.esic_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Monthly Contribution</label>
                <input
                  type="number"
                  name="monthly_contribution"
                  value={formData.monthly_contribution}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
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

export default ESICPage

