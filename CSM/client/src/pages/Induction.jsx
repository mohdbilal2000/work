import React, { useState, useEffect } from 'react';
import api from '../api/config';
import './Induction.css';

const Induction = () => {
  const [inductionRecords, setInductionRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    department: '',
    designation: '',
    joining_date: '',
    induction_date: '',
    induction_status: 'pending',
    trainer_name: '',
    training_topics: '',
    documents_submitted: false,
    id_card_issued: false,
    system_access_granted: false,
    remarks: ''
  });

  useEffect(() => {
    loadInductionRecords();
  }, []);

  const loadInductionRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/induction');
      if (response.data.success) {
        setInductionRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error loading induction records:', error);
      setInductionRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/induction/${editingRecord.id}`, formData);
        loadInductionRecords();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving induction record:', error);
      alert('Failed to save induction record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      employee_name: record.employee_name || '',
      employee_id: record.employee_id || '',
      department: record.department || '',
      designation: record.designation || '',
      joining_date: record.joining_date ? record.joining_date.split('T')[0] : '',
      induction_date: record.induction_date ? record.induction_date.split('T')[0] : '',
      induction_status: record.induction_status || 'pending',
      trainer_name: record.trainer_name || '',
      training_topics: record.training_topics || '',
      documents_submitted: record.documents_submitted || false,
      id_card_issued: record.id_card_issued || false,
      system_access_granted: record.system_access_granted || false,
      remarks: record.remarks || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      employee_name: '',
      employee_id: '',
      department: '',
      designation: '',
      joining_date: '',
      induction_date: '',
      induction_status: 'pending',
      trainer_name: '',
      training_topics: '',
      documents_submitted: false,
      id_card_issued: false,
      system_access_granted: false,
      remarks: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'status-pending',
      in_progress: 'status-progress',
      completed: 'status-completed'
    };
    return statusColors[status] || 'status-pending';
  };

  return (
    <div className="induction-page">
      <div className="page-header">
        <div>
          <h1>Employee Induction</h1>
          <p className="page-subtitle">Candidates are automatically added when Zimyo Access is granted in CSO</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading induction records...</div>
      ) : inductionRecords.length > 0 ? (
        <div className="induction-table-container">
          <table className="induction-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Induction Date</th>
                <th>Status</th>
                <th>Trainer</th>
                <th>Docs</th>
                <th>ID Card</th>
                <th>System Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inductionRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{record.department || '-'}</td>
                  <td>{record.designation || '-'}</td>
                  <td>{record.joining_date ? new Date(record.joining_date).toLocaleDateString() : '-'}</td>
                  <td>{record.induction_date ? new Date(record.induction_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(record.induction_status)}`}>
                      {record.induction_status === 'in_progress' ? 'In Progress' : 
                       record.induction_status?.charAt(0).toUpperCase() + record.induction_status?.slice(1)}
                    </span>
                  </td>
                  <td>{record.trainer_name || '-'}</td>
                  <td>
                    <span className={`check-badge ${record.documents_submitted ? 'yes' : 'no'}`}>
                      {record.documents_submitted ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>
                    <span className={`check-badge ${record.id_card_issued ? 'yes' : 'no'}`}>
                      {record.id_card_issued ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>
                    <span className={`check-badge ${record.system_access_granted ? 'yes' : 'no'}`}>
                      {record.system_access_granted ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(record)}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Induction Records Yet</h3>
          <p>Candidates will appear here automatically when Zimyo Access is granted in CSO Final Process.</p>
          <div className="empty-hint">
            <strong>How it works:</strong>
            <ol>
              <li>Go to CSO → Part 2: Final Process</li>
              <li>Edit a candidate with "Zimyo Access" status</li>
              <li>Click <strong>"Grant Zimyo Access"</strong> button</li>
              <li>The candidate will automatically appear here for induction</li>
            </ol>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingRecord && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Induction - {editingRecord.employee_name}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="induction-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label>Employee Name</label>
                  <input
                    type="text"
                    value={formData.employee_name}
                    disabled
                    className="disabled-input"
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
                    placeholder="Enter Department"
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Enter Designation"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Induction Date</label>
                  <input
                    type="date"
                    name="induction_date"
                    value={formData.induction_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Induction Status</label>
                  <select
                    name="induction_status"
                    value={formData.induction_status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trainer Name</label>
                  <input
                    type="text"
                    name="trainer_name"
                    value={formData.trainer_name}
                    onChange={handleInputChange}
                    placeholder="Enter Trainer Name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Training Topics</label>
                <textarea
                  name="training_topics"
                  value={formData.training_topics}
                  onChange={handleInputChange}
                  placeholder="Enter training topics covered..."
                  rows="3"
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="documents_submitted"
                    checked={formData.documents_submitted}
                    onChange={handleInputChange}
                  />
                  <span>Documents Submitted</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="id_card_issued"
                    checked={formData.id_card_issued}
                    onChange={handleInputChange}
                  />
                  <span>ID Card Issued</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="system_access_granted"
                    checked={formData.system_access_granted}
                    onChange={handleInputChange}
                  />
                  <span>System Access Granted</span>
                </label>
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Any additional remarks..."
                  rows="2"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Induction;
