import React, { useState, useEffect } from 'react'
import './ESICPFCompliancePage.css'
import { esicAPI, pfAPI, tdsAPI, medicalInsuranceAPI } from '../../services/api'

function ESICPFCompliancePage() {
  const [activeTab, setActiveTab] = useState('ESIC');
  const [esicRecords, setEsicRecords] = useState([]);
  const [pfRecords, setPfRecords] = useState([]);
  const [tdsRecords, setTdsRecords] = useState([]);
  const [medicalInsuranceRecords, setMedicalInsuranceRecords] = useState([]);
  const [loading, setLoading] = useState({ esic: true, pf: true, tds: true, medicalInsurance: true });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for editing
  const [esicFormData, setEsicFormData] = useState({});
  const [pfFormData, setPfFormData] = useState({});
  const [tdsFormData, setTdsFormData] = useState({});
  const [medicalFormData, setMedicalFormData] = useState({});

  useEffect(() => {
    loadAllRecords();
  }, []);

  const loadAllRecords = async () => {
    await Promise.all([loadESICRecords(), loadPFRecords(), loadTDSRecords(), loadMedicalInsuranceRecords()]);
  };

  const loadESICRecords = async () => {
    try {
      setLoading(prev => ({ ...prev, esic: true }));
      const response = await esicAPI.getAll();
      if (response.success) {
        setEsicRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading ESIC records:', error);
    } finally {
      setLoading(prev => ({ ...prev, esic: false }));
    }
  };

  const loadPFRecords = async () => {
    try {
      setLoading(prev => ({ ...prev, pf: true }));
      const response = await pfAPI.getAll();
      if (response.success) {
        setPfRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading PF records:', error);
    } finally {
      setLoading(prev => ({ ...prev, pf: false }));
    }
  };

  const loadTDSRecords = async () => {
    try {
      setLoading(prev => ({ ...prev, tds: true }));
      const response = await tdsAPI.getAll();
      if (response.success) {
        setTdsRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading TDS records:', error);
    } finally {
      setLoading(prev => ({ ...prev, tds: false }));
    }
  };

  const loadMedicalInsuranceRecords = async () => {
    try {
      setLoading(prev => ({ ...prev, medicalInsurance: true }));
      const response = await medicalInsuranceAPI.getAll();
      if (response.success) {
        setMedicalInsuranceRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading Medical Insurance records:', error);
    } finally {
      setLoading(prev => ({ ...prev, medicalInsurance: false }));
    }
  };

  const handleEditClick = (record, type) => {
    setEditingRecord({ ...record, type });
    if (type === 'esic') {
      setEsicFormData({
        employee_id: record.employee_id || '',
        employee_name: record.employee_name || '',
        employer_name: record.employer_name || '',
        esic_number: record.esic_number || '',
        monthly_contribution: record.monthly_contribution || '',
        employer_contribution: record.employer_contribution || '',
        payment_status: record.payment_status || 'pending',
        payment_date: record.payment_date ? record.payment_date.split('T')[0] : '',
        status: record.status || 'active'
      });
    } else if (type === 'pf') {
      setPfFormData({
        employee_id: record.employee_id || '',
        employee_name: record.employee_name || '',
        pf_number: record.pf_number || '',
        uan_number: record.uan_number || '',
        monthly_contribution: record.monthly_contribution || '',
        status: record.status || 'active'
      });
    } else if (type === 'tds') {
      setTdsFormData({
        employee_id: record.employee_id || '',
        employee_name: record.employee_name || '',
        pan_number: record.pan_number || '',
        salary_amount: record.salary_amount || '',
        tds_amount: record.tds_amount || '',
        tds_rate: record.tds_rate || '',
        financial_year: record.financial_year || '',
        status: record.status || 'active'
      });
    } else if (type === 'medical') {
      setMedicalFormData({
        employee_id: record.employee_id || '',
        employee_name: record.employee_name || '',
        policy_number: record.policy_number || '',
        insurance_provider: record.insurance_provider || '',
        policy_type: record.policy_type || '',
        coverage_amount: record.coverage_amount || '',
        premium_amount: record.premium_amount || '',
        policy_start_date: record.policy_start_date ? record.policy_start_date.split('T')[0] : '',
        policy_end_date: record.policy_end_date ? record.policy_end_date.split('T')[0] : '',
        payment_status: record.payment_status || 'pending',
        payment_date: record.payment_date ? record.payment_date.split('T')[0] : '',
        status: record.status || 'active'
      });
    }
    setShowEditModal(true);
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'esic') {
      setEsicFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'pf') {
      setPfFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'tds') {
      setTdsFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'medical') {
      setMedicalFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e, type) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let response;
      if (type === 'esic') {
        response = await esicAPI.update(editingRecord.id, {
          ...esicFormData,
          monthly_contribution: parseFloat(esicFormData.monthly_contribution) || 0,
          employer_contribution: parseFloat(esicFormData.employer_contribution) || 0,
          payment_date: esicFormData.payment_date || null
        });
        if (response.success) {
          loadESICRecords();
        }
      } else if (type === 'pf') {
        response = await pfAPI.update(editingRecord.id, {
          ...pfFormData,
          monthly_contribution: parseFloat(pfFormData.monthly_contribution) || 0
        });
        if (response.success) {
          loadPFRecords();
        }
      } else if (type === 'tds') {
        response = await tdsAPI.update(editingRecord.id, {
          ...tdsFormData,
          salary_amount: parseFloat(tdsFormData.salary_amount) || 0,
          tds_amount: parseFloat(tdsFormData.tds_amount) || 0
        });
        if (response.success) {
          loadTDSRecords();
        }
      } else if (type === 'medical') {
        response = await medicalInsuranceAPI.update(editingRecord.id, {
          ...medicalFormData,
          coverage_amount: parseFloat(medicalFormData.coverage_amount) || 0,
          premium_amount: parseFloat(medicalFormData.premium_amount) || 0,
          payment_date: medicalFormData.payment_date || null
        });
        if (response.success) {
          loadMedicalInsuranceRecords();
        }
      }
      if (response && response.success) {
        setShowEditModal(false);
        setEditingRecord(null);
      }
    } catch (error) {
      console.error('Error updating record:', error);
      alert(`Failed to update record: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderESICContent = () => (
    <>
      {loading.esic ? (
        <div className="status-message">Loading ESIC records...</div>
      ) : esicRecords.length > 0 ? (
        <div className="records-table">
          <h3 className="table-title">ESIC Records</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Employer Name</th>
                <th>ESIC Number</th>
                <th>Employee Contribution</th>
                <th>Employer Contribution</th>
                <th>Payment Status</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {esicRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{record.employer_name || 'N/A'}</td>
                  <td>{record.esic_number || 'N/A'}</td>
                  <td>₹{record.monthly_contribution || 0}</td>
                  <td>₹{record.employer_contribution || 0}</td>
                  <td>
                    <span className={`payment-badge ${record.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                      {record.payment_status === 'paid' ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(record, 'esic')}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="status-message">
          No ESIC records found. Records will appear here when candidates are enrolled in CSO.
        </div>
      )}
    </>
  );

  const renderPFContent = () => (
    <>
      {loading.pf ? (
        <div className="status-message">Loading PF records...</div>
      ) : pfRecords.length > 0 ? (
        <div className="records-table">
          <h3 className="table-title">PF Records</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>PF Number</th>
                <th>UAN Number</th>
                <th>Monthly Contribution</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pfRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{record.pf_number || 'N/A'}</td>
                  <td>{record.uan_number || 'N/A'}</td>
                  <td>₹{record.monthly_contribution || 0}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(record, 'pf')}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="status-message">
          No PF records found. Records will appear here when candidates are enrolled in CSO.
        </div>
      )}
    </>
  );

  const renderTDSContent = () => (
    <>
      {loading.tds ? (
        <div className="status-message">Loading TDS records...</div>
      ) : tdsRecords.length > 0 ? (
        <div className="records-table">
          <h3 className="table-title">TDS Records</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>PAN Number</th>
                <th>Salary Amount</th>
                <th>TDS Rate</th>
                <th>TDS Amount</th>
                <th>Financial Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tdsRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{record.pan_number || 'N/A'}</td>
                  <td>₹{record.salary_amount || 0}</td>
                  <td>{record.tds_rate ? `${record.tds_rate}%` : 'N/A'}</td>
                  <td>₹{record.tds_amount || 0}</td>
                  <td>{record.financial_year || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(record, 'tds')}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="status-message">
          No TDS records found. Records will appear here when candidates are enrolled in CSO.
        </div>
      )}
    </>
  );

  const renderMedicalInsuranceContent = () => (
    <>
      {loading.medicalInsurance ? (
        <div className="status-message">Loading Medical Insurance records...</div>
      ) : medicalInsuranceRecords.length > 0 ? (
        <div className="records-table">
          <h3 className="table-title">Medical Insurance Records</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Policy Number</th>
                <th>Insurance Provider</th>
                <th>Policy Type</th>
                <th>Coverage Amount</th>
                <th>Premium Amount</th>
                <th>Policy Start Date</th>
                <th>Policy End Date</th>
                <th>Payment Status</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicalInsuranceRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{record.policy_number || 'N/A'}</td>
                  <td>{record.insurance_provider || 'N/A'}</td>
                  <td>{record.policy_type || 'N/A'}</td>
                  <td>₹{record.coverage_amount || 0}</td>
                  <td>₹{record.premium_amount || 0}</td>
                  <td>{record.policy_start_date ? new Date(record.policy_start_date).toLocaleDateString() : '-'}</td>
                  <td>{record.policy_end_date ? new Date(record.policy_end_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`payment-badge ${record.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                      {record.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>{record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(record, 'medical')}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="status-message">
          No Medical Insurance records found. Records will appear here when candidates are enrolled in CSO.
        </div>
      )}
    </>
  );

  const renderEditModal = () => {
    if (!editingRecord) return null;

    if (editingRecord.type === 'esic') {
      return (
        <form onSubmit={(e) => handleUpdate(e, 'esic')} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={esicFormData.employee_id} disabled className="disabled-input" />
            </div>
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" value={esicFormData.employee_name} disabled className="disabled-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Employer Name</label>
              <input
                type="text"
                name="employer_name"
                value={esicFormData.employer_name}
                onChange={(e) => handleInputChange(e, 'esic')}
              />
            </div>
            <div className="form-group">
              <label>ESIC Number</label>
              <input
                type="text"
                name="esic_number"
                value={esicFormData.esic_number}
                onChange={(e) => handleInputChange(e, 'esic')}
                placeholder="Enter ESIC Number"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Employee Contribution (₹)</label>
              <input
                type="number"
                name="monthly_contribution"
                value={esicFormData.monthly_contribution}
                onChange={(e) => handleInputChange(e, 'esic')}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Employer Contribution (₹)</label>
              <input
                type="number"
                name="employer_contribution"
                value={esicFormData.employer_contribution}
                onChange={(e) => handleInputChange(e, 'esic')}
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Payment Status</label>
              <select
                name="payment_status"
                value={esicFormData.payment_status}
                onChange={(e) => handleInputChange(e, 'esic')}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Date</label>
              <input
                type="date"
                name="payment_date"
                value={esicFormData.payment_date}
                onChange={(e) => handleInputChange(e, 'esic')}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={esicFormData.status}
              onChange={(e) => handleInputChange(e, 'esic')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      );
    } else if (editingRecord.type === 'pf') {
      return (
        <form onSubmit={(e) => handleUpdate(e, 'pf')} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={pfFormData.employee_id} disabled className="disabled-input" />
            </div>
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" value={pfFormData.employee_name} disabled className="disabled-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>PF Number</label>
              <input
                type="text"
                name="pf_number"
                value={pfFormData.pf_number}
                onChange={(e) => handleInputChange(e, 'pf')}
                placeholder="Enter PF Number"
              />
            </div>
            <div className="form-group">
              <label>UAN Number</label>
              <input
                type="text"
                name="uan_number"
                value={pfFormData.uan_number}
                onChange={(e) => handleInputChange(e, 'pf')}
                placeholder="Enter UAN Number"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Monthly Contribution (₹)</label>
              <input
                type="number"
                name="monthly_contribution"
                value={pfFormData.monthly_contribution}
                onChange={(e) => handleInputChange(e, 'pf')}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={pfFormData.status}
                onChange={(e) => handleInputChange(e, 'pf')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      );
    } else if (editingRecord.type === 'tds') {
      return (
        <form onSubmit={(e) => handleUpdate(e, 'tds')} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={tdsFormData.employee_id} disabled className="disabled-input" />
            </div>
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" value={tdsFormData.employee_name} disabled className="disabled-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={tdsFormData.pan_number}
                onChange={(e) => handleInputChange(e, 'tds')}
                maxLength="10"
                placeholder="ABCDE1234F"
              />
            </div>
            <div className="form-group">
              <label>Financial Year</label>
              <input
                type="text"
                name="financial_year"
                value={tdsFormData.financial_year}
                onChange={(e) => handleInputChange(e, 'tds')}
                placeholder="2024-25"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Salary Amount (₹)</label>
              <input
                type="number"
                name="salary_amount"
                value={tdsFormData.salary_amount}
                onChange={(e) => handleInputChange(e, 'tds')}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>TDS Rate (%)</label>
              <div className="tds-rate-buttons">
                <button
                  type="button"
                  className={`tds-rate-btn ${tdsFormData.tds_rate === '2' ? 'active' : ''}`}
                  onClick={() => {
                    const salary = parseFloat(tdsFormData.salary_amount) || 0;
                    const tdsAmount = (salary * 2) / 100;
                    setTdsFormData(prev => ({
                      ...prev,
                      tds_rate: '2',
                      tds_amount: tdsAmount.toFixed(2)
                    }));
                  }}
                >
                  2%
                </button>
                <button
                  type="button"
                  className={`tds-rate-btn ${tdsFormData.tds_rate === '10' ? 'active' : ''}`}
                  onClick={() => {
                    const salary = parseFloat(tdsFormData.salary_amount) || 0;
                    const tdsAmount = (salary * 10) / 100;
                    setTdsFormData(prev => ({
                      ...prev,
                      tds_rate: '10',
                      tds_amount: tdsAmount.toFixed(2)
                    }));
                  }}
                >
                  10%
                </button>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>TDS Amount (₹)</label>
              <input
                type="number"
                name="tds_amount"
                value={tdsFormData.tds_amount}
                readOnly
                className="disabled-input"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={tdsFormData.status}
                onChange={(e) => handleInputChange(e, 'tds')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      );
    } else if (editingRecord.type === 'medical') {
      return (
        <form onSubmit={(e) => handleUpdate(e, 'medical')} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={medicalFormData.employee_id} disabled className="disabled-input" />
            </div>
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" value={medicalFormData.employee_name} disabled className="disabled-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Policy Number</label>
              <input
                type="text"
                name="policy_number"
                value={medicalFormData.policy_number}
                onChange={(e) => handleInputChange(e, 'medical')}
                placeholder="Enter Policy Number"
              />
            </div>
            <div className="form-group">
              <label>Insurance Provider</label>
              <input
                type="text"
                name="insurance_provider"
                value={medicalFormData.insurance_provider}
                onChange={(e) => handleInputChange(e, 'medical')}
                placeholder="e.g., HDFC Life"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Policy Type</label>
              <select
                name="policy_type"
                value={medicalFormData.policy_type}
                onChange={(e) => handleInputChange(e, 'medical')}
              >
                <option value="">Select Policy Type</option>
                <option value="Individual">Individual</option>
                <option value="Family">Family</option>
                <option value="Group">Group</option>
                <option value="Group Health">Group Health</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Coverage Amount (₹)</label>
              <input
                type="number"
                name="coverage_amount"
                value={medicalFormData.coverage_amount}
                onChange={(e) => handleInputChange(e, 'medical')}
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Premium Amount (₹)</label>
              <input
                type="number"
                name="premium_amount"
                value={medicalFormData.premium_amount}
                onChange={(e) => handleInputChange(e, 'medical')}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select
                name="payment_status"
                value={medicalFormData.payment_status}
                onChange={(e) => handleInputChange(e, 'medical')}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Policy Start Date</label>
              <input
                type="date"
                name="policy_start_date"
                value={medicalFormData.policy_start_date}
                onChange={(e) => handleInputChange(e, 'medical')}
              />
            </div>
            <div className="form-group">
              <label>Policy End Date</label>
              <input
                type="date"
                name="policy_end_date"
                value={medicalFormData.policy_end_date}
                onChange={(e) => handleInputChange(e, 'medical')}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Payment Date</label>
              <input
                type="date"
                name="payment_date"
                value={medicalFormData.payment_date}
                onChange={(e) => handleInputChange(e, 'medical')}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={medicalFormData.status}
                onChange={(e) => handleInputChange(e, 'medical')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      );
    }
  };

  const getModalTitle = () => {
    if (!editingRecord) return '';
    switch (editingRecord.type) {
      case 'esic': return 'Edit ESIC Record';
      case 'pf': return 'Edit PF Record';
      case 'tds': return 'Edit TDS Record';
      case 'medical': return 'Edit Medical Insurance Record';
      default: return 'Edit Record';
    }
  };

  return (
    <div className="esicpf-compliance-page">
      <div className="page-header">
        <h1>ESIC/PF Compliance</h1>
        <p className="page-subtitle">Records are automatically added when candidates are enrolled in CSO. Click Edit to update details.</p>
      </div>

      {/* Tabs */}
      <div className="compliance-tabs">
        <button
          className={`tab-button ${activeTab === 'ESIC' ? 'active' : ''}`}
          onClick={() => setActiveTab('ESIC')}
        >
          ESIC
        </button>
        <button
          className={`tab-button ${activeTab === 'PF' ? 'active' : ''}`}
          onClick={() => setActiveTab('PF')}
        >
          PF
        </button>
        <button
          className={`tab-button ${activeTab === 'TDS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TDS')}
        >
          TDS
        </button>
        <button
          className={`tab-button ${activeTab === 'Medical Insurance' ? 'active' : ''}`}
          onClick={() => setActiveTab('Medical Insurance')}
        >
          Medical Insurance
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'ESIC' && renderESICContent()}
        {activeTab === 'PF' && renderPFContent()}
        {activeTab === 'TDS' && renderTDSContent()}
        {activeTab === 'Medical Insurance' && renderMedicalInsuranceContent()}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            {renderEditModal()}
          </div>
        </div>
      )}
    </div>
  )
}

export default ESICPFCompliancePage
