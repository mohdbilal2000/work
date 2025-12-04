import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/config';
import './Agreements.css';

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    client_id: '',
    agreement_type: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
    amount: ''
  });
  const [showWorkflowSteps, setShowWorkflowSteps] = useState(null);

  const projectSteps = [
    { num: 1, title: 'Client Kickoff Mail', icon: '🤝', key: 'client_kickoff', hasUpload: true },
    { num: 2, title: 'PIS Signed Upload', icon: '📝', key: 'pis_signed_upload', hasUpload: true },
    { num: 3, title: 'Project Priority Assigning', icon: '⭐', key: 'priority_assigning', hasPriority: true },
    { num: 4, title: 'Sourcing Note Upload', icon: '📋', key: 'sourcing_note', hasUpload: true }
  ];
  const [workflowData, setWorkflowData] = useState({
    step1_closure_negotiations: '',
    step1_date: '',
    step2_draft_creation: '',
    step2_date: '',
    step3_ceo_approval: '',
    step3_date: '',
    step4_draft_to_client: '',
    step4_date: '',
    step5_client_approval: '',
    step5_date: '',
    step6_estamp_download: '',
    step6_date: '',
    step7_signatures: '',
    step7_date: '',
    step8_operations_handover: '',
    step8_date: ''
  });

  const totalSteps = 8;

  const stepInfo = [
    { num: 1, title: 'Closure of Negotiations', icon: '🤝', key: 'step1_closure_negotiations', dateKey: 'step1_date', hint: 'Document the closure of negotiations with the client.' },
    { num: 2, title: 'Creation of Draft by Tendering', icon: '📝', key: 'step2_draft_creation', dateKey: 'step2_date', hint: 'Tendering team creates the agreement draft.' },
    { num: 3, title: 'CEO Approval on Draft', icon: '✅', key: 'step3_ceo_approval', dateKey: 'step3_date', hint: 'Tendering to get CEO approval on the draft.' },
    { num: 4, title: 'Draft Shared with Client', icon: '📤', key: 'step4_draft_to_client', dateKey: 'step4_date', hint: 'Draft to be shared by Tendering to client.' },
    { num: 5, title: 'Post Client Approval on Draft', icon: '👍', key: 'step5_client_approval', dateKey: 'step5_date', hint: 'Client approval received on the draft.' },
    { num: 6, title: 'E-Stamp Download by Tendering', icon: '📜', key: 'step6_estamp_download', dateKey: 'step6_date', hint: 'E-stamp downloaded by tendering team.' },
    { num: 7, title: 'Legality & Client Signatures', icon: '✍️', key: 'step7_signatures', dateKey: 'step7_date', hint: 'Legality share & client signatures by tendering.' },
    { num: 8, title: 'Operations Handover', icon: '📋', key: 'step8_operations_handover', dateKey: 'step8_date', hint: 'Signed agreement & term sheet shared with Operations Lead.' }
  ];

  useEffect(() => {
    // Check if there's a new project from Operations Lead
    const newProjectParam = searchParams.get('newProject');
    if (newProjectParam) {
      try {
        const projectData = JSON.parse(decodeURIComponent(newProjectParam));
        addProjectFromOperations(projectData);
        setSearchParams({});
      } catch (e) {
        console.error('Error parsing project data:', e);
      }
    }
    fetchAgreements();
    fetchClients();
  }, []);

  const addProjectFromOperations = async (projectData) => {
    try {
      const newAgreement = {
        id: Date.now(),
        client_id: projectData.client_name,
        client_name: projectData.client_name,
        agreement_type: projectData.agreement_type || 'Operations',
        title: projectData.title,
        description: `Assigned from Operations Lead. ${projectData.description || ''}`,
        start_date: projectData.start_date || '',
        end_date: projectData.end_date || '',
        status: 'active',
        amount: '',
        createdAt: new Date().toISOString()
      };
      
      // Try API first
      try {
        await api.post('/agreements', newAgreement);
      } catch (apiError) {
        console.log('API unavailable, using localStorage');
      }
      
      // Also save to localStorage as backup
      const storedProjects = JSON.parse(localStorage.getItem('csm_projects') || '[]');
      const exists = storedProjects.some(p => p.title === newAgreement.title && p.client_name === newAgreement.client_name);
      if (!exists) {
        storedProjects.unshift(newAgreement);
        localStorage.setItem('csm_projects', JSON.stringify(storedProjects));
      }
      
      alert('🎉 Project received from Operations Lead!');
      fetchAgreements();
    } catch (error) {
      console.error('Error adding project from Operations:', error);
    }
  };

  const transferToClients = async (agreement) => {
    try {
      // Create client data
      const clientData = {
        id: Date.now(),
        name: agreement.client_name || agreement.title,
        email: `${(agreement.client_name || agreement.title).toLowerCase().replace(/\s+/g, '')}@client.com`,
        phone: '',
        company: agreement.agreement_type || 'Operations',
        address: `Project: ${agreement.title}. ${agreement.description || ''}`,
        status: 'active',
        fromProjectJourney: true,
        projectTitle: agreement.title,
        createdAt: new Date().toISOString()
      };

      // Try API first
      try {
        await api.post('/clients', clientData);
      } catch (apiError) {
        console.log('API unavailable');
      }

      // Save to localStorage for clients
      const storedClients = JSON.parse(localStorage.getItem('csm_clients') || '[]');
      const exists = storedClients.some(c => c.name === clientData.name && c.projectTitle === clientData.projectTitle);
      if (!exists) {
        storedClients.unshift(clientData);
        localStorage.setItem('csm_clients', JSON.stringify(storedClients));
      }

      // Mark as transferred in agreements
      const updatedAgreements = agreements.map(a =>
        a.id === agreement.id ? { ...a, transferredToClients: true } : a
      );
      setAgreements(updatedAgreements);

      // Update localStorage for projects
      const storedProjects = JSON.parse(localStorage.getItem('csm_projects') || '[]');
      const updatedStored = storedProjects.map(p =>
        p.id === agreement.id ? { ...p, transferredToClients: true } : p
      );
      localStorage.setItem('csm_projects', JSON.stringify(updatedStored));

      alert('🎉 Project journey completed! Client transferred to Clients page.');
    } catch (error) {
      console.error('Error transferring to clients:', error);
      alert('Error transferring. Please try again.');
    }
  };

  const handleStepComplete = async (agreementId, stepKey, value) => {
    try {
      // Try API first
      try {
        const updateData = { [stepKey]: value };
        await api.put(`/agreements/${agreementId}`, updateData);
      } catch (apiError) {
        console.log('API unavailable, using localStorage');
      }
      
      // Update local state
      const updatedAgreements = agreements.map(a => 
        a.id === agreementId ? { ...a, [stepKey]: value } : a
      );
      setAgreements(updatedAgreements);
      
      // Update localStorage
      const storedProjects = JSON.parse(localStorage.getItem('csm_projects') || '[]');
      const updatedStored = storedProjects.map(p => 
        p.id === agreementId ? { ...p, [stepKey]: value } : p
      );
      localStorage.setItem('csm_projects', JSON.stringify(updatedStored));
      
      // Update the modal state
      if (showWorkflowSteps && showWorkflowSteps.id === agreementId) {
        setShowWorkflowSteps({ ...showWorkflowSteps, [stepKey]: value });
      }
    } catch (error) {
      console.error('Error updating step:', error);
      alert('Error saving step. Please try again.');
    }
  };

  const fetchAgreements = async () => {
    try {
      let apiAgreements = [];
      try {
        const response = await api.get('/agreements');
        apiAgreements = response.data || [];
      } catch (apiError) {
        console.log('API unavailable, using localStorage only');
      }
      
      // Get localStorage projects
      const storedProjects = JSON.parse(localStorage.getItem('csm_projects') || '[]');
      
      // Merge and dedupe (prefer API data)
      const allAgreements = [...apiAgreements];
      storedProjects.forEach(sp => {
        const exists = allAgreements.some(a => 
          (a.title === sp.title && a.client_name === sp.client_name) || a.id === sp.id
        );
        if (!exists) {
          allAgreements.push(sp);
        }
      });
      
      setAgreements(allAgreements);
    } catch (error) {
      console.error('Error fetching agreements:', error);
      // Fallback to localStorage only
      const storedProjects = JSON.parse(localStorage.getItem('csm_projects') || '[]');
      setAgreements(storedProjects);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAgreement) {
        await api.put(`/agreements/${editingAgreement.id}`, formData);
      } else {
        await api.post('/agreements', formData);
      }
      fetchAgreements();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving agreement');
    }
  };

  const handleWorkflowSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/agreements/${selectedAgreement.id}`, {
        ...selectedAgreement,
        ...workflowData
      });
      fetchAgreements();
      setShowWorkflowModal(false);
      setSelectedAgreement(null);
      resetWorkflowData();
      alert('Workflow completed successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving workflow');
    }
  };

  const handleWorkflowSave = async () => {
    try {
      await api.put(`/agreements/${selectedAgreement.id}`, {
        ...selectedAgreement,
        ...workflowData
      });
      fetchAgreements();
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert(error.response?.data?.error || 'Error saving workflow');
    }
  };

  const openWorkflow = (agreement) => {
    setSelectedAgreement(agreement);
    setWorkflowData({
      step1_closure_negotiations: agreement.step1_closure_negotiations || '',
      step1_date: agreement.step1_date || '',
      step2_draft_creation: agreement.step2_draft_creation || '',
      step2_date: agreement.step2_date || '',
      step3_ceo_approval: agreement.step3_ceo_approval || '',
      step3_date: agreement.step3_date || '',
      step4_draft_to_client: agreement.step4_draft_to_client || '',
      step4_date: agreement.step4_date || '',
      step5_client_approval: agreement.step5_client_approval || '',
      step5_date: agreement.step5_date || '',
      step6_estamp_download: agreement.step6_estamp_download || '',
      step6_date: agreement.step6_date || '',
      step7_signatures: agreement.step7_signatures || '',
      step7_date: agreement.step7_date || '',
      step8_operations_handover: agreement.step8_operations_handover || '',
      step8_date: agreement.step8_date || ''
    });
    setCurrentStep(1);
    setShowWorkflowModal(true);
  };

  const handleEdit = (agreement) => {
    setEditingAgreement(agreement);
    setFormData({
      client_id: agreement.client_name || agreement.client_id || '',
      agreement_type: agreement.agreement_type || '',
      title: agreement.title,
      description: agreement.description || '',
      start_date: agreement.start_date ? agreement.start_date.split('T')[0] : '',
      end_date: agreement.end_date ? agreement.end_date.split('T')[0] : '',
      status: agreement.status,
      amount: agreement.amount || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        // Try API first
        try {
          await api.delete(`/agreements/${id}`);
        } catch (apiError) {
          console.log('API unavailable');
        }
        
        // Also delete from localStorage
        const storedProjects = JSON.parse(localStorage.getItem('csm_projects') || '[]');
        const filtered = storedProjects.filter(p => p.id !== id);
        localStorage.setItem('csm_projects', JSON.stringify(filtered));
        
        fetchAgreements();
      } catch (error) {
        alert('Error deleting project');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      agreement_type: '',
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'active',
      amount: ''
    });
    setEditingAgreement(null);
  };

  const resetWorkflowData = () => {
    setWorkflowData({
      step1_closure_negotiations: '',
      step1_date: '',
      step2_draft_creation: '',
      step2_date: '',
      step3_ceo_approval: '',
      step3_date: '',
      step4_draft_to_client: '',
      step4_date: '',
      step5_client_approval: '',
      step5_date: '',
      step6_estamp_download: '',
      step6_date: '',
      step7_signatures: '',
      step7_date: '',
      step8_operations_handover: '',
      step8_date: ''
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const getCompletedSteps = (agreement) => {
    let count = 0;
    if (agreement.step1_closure_negotiations) count++;
    if (agreement.step2_draft_creation) count++;
    if (agreement.step3_ceo_approval) count++;
    if (agreement.step4_draft_to_client) count++;
    if (agreement.step5_client_approval) count++;
    if (agreement.step6_estamp_download) count++;
    if (agreement.step7_signatures) count++;
    if (agreement.step8_operations_handover) count++;
    return count;
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="agreements-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🚀 Project Journey</h1>
          <p className="header-subtitle">Track and manage projects from Operations Lead</p>
        </div>
      </div>

      <div className="agreements-grid">
        {agreements.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Projects will appear here when assigned from Operations Lead.</p>
          </div>
        ) : (
          agreements.map((agreement) => {
            const completedSteps = projectSteps.filter(step => agreement[step.key]).length;
            return (
              <div key={agreement.id} className={`agreement-card ${agreement.description?.includes('Operations Lead') ? 'from-operations' : ''}`}>
                <div className="agreement-header">
                  <h3>📁 {agreement.title}</h3>
                  <span className={`status-badge ${agreement.status}`}>{agreement.status}</span>
                </div>
                {agreement.description?.includes('Operations Lead') && (
                  <div className="ops-badge-large">📋 Assigned from Operations Lead</div>
                )}
                <div className="agreement-info">
                  {agreement.client_name && <p><strong>🏢 Client:</strong> {agreement.client_name}</p>}
                  {agreement.agreement_type && <p><strong>📄 Type:</strong> {agreement.agreement_type}</p>}
                  {agreement.start_date && <p><strong>📅 Start:</strong> {agreement.start_date}</p>}
                </div>

                {/* Project Journey Steps */}
                <div className="project-journey">
                  <div className="journey-header">
                    <h4>🚀 Project Journey</h4>
                    <span className="journey-progress">{completedSteps}/4 Steps</span>
                  </div>
                  <div className="journey-steps">
                    {projectSteps.map((step) => (
                      <div key={step.num} className={`journey-step ${agreement[step.key] ? 'completed' : ''}`}>
                        <span className="step-icon">{agreement[step.key] ? '✅' : step.icon}</span>
                        <span className="step-title">{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="agreement-actions">
                  <button onClick={() => setShowWorkflowSteps(agreement)} className="btn-workflow">
                    🚀 Manage Journey
                  </button>
                  {completedSteps === 4 && !agreement.transferredToClients ? (
                    <button onClick={() => transferToClients(agreement)} className="btn-transfer-client">
                      📤 Transfer to Clients
                    </button>
                  ) : agreement.transferredToClients ? (
                    <span className="transferred-badge">✅ Transferred to Clients</span>
                  ) : null}
                  <button onClick={() => handleDelete(agreement.id)} className="btn-delete">🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Agreement Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-new">
              <h2>{editingAgreement ? 'Edit Agreement' : 'Create New Agreement'}</h2>
              <button type="button" className="modal-close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="agreement-form-new">
              <div className="form-section-new">
                <div className="form-row">
                  <div className="form-group-new">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="form-input-new"
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  <div className="form-group-new">
                    <label>Type of Agreement *</label>
                    <input
                      type="text"
                      value={formData.agreement_type}
                      onChange={(e) => setFormData({ ...formData, agreement_type: e.target.value })}
                      className="form-input-new"
                      placeholder="Enter agreement type"
                      required
                    />
                  </div>
                </div>

                <div className="form-group-new">
                  <label>Agreement Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input-new"
                    placeholder="Enter agreement title"
                    required
                  />
                </div>

                <div className="form-group-new">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input-new"
                    rows="3"
                    placeholder="Enter agreement description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group-new">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="form-input-new"
                    />
                  </div>
                  <div className="form-group-new">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="form-input-new"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group-new">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="form-input-new"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="form-group-new">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="form-input-new"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions-new">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-cancel-new">Cancel</button>
                <button type="submit" className="btn-save-new">{editingAgreement ? 'Update Agreement' : 'Create Agreement'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Management Modal - 8 Steps */}
      {showWorkflowModal && selectedAgreement && (
        <div className="modal-overlay" onClick={() => { setShowWorkflowModal(false); resetWorkflowData(); }}>
          <div className="modal-content-workflow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-new">
              <h2>📋 Agreement Workflow - {selectedAgreement.title}</h2>
              <button type="button" className="modal-close-btn" onClick={() => { setShowWorkflowModal(false); resetWorkflowData(); }}>×</button>
            </div>
            
            {/* Step Indicator - 8 Steps */}
            <div className="step-indicator-container">
              <div className="step-indicator eight-steps">
                {stepInfo.map((step) => (
                  <div 
                    key={step.num} 
                    className={`step-indicator-item ${workflowData[step.key] ? 'completed' : ''} ${currentStep === step.num ? 'current' : ''}`}
                    onClick={() => goToStep(step.num)}
                  >
                    <div className="step-indicator-circle">{step.icon}</div>
                    <div className="step-indicator-label">{step.num}. {step.title}</div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleWorkflowSubmit} className="agreement-form-new">
              {stepInfo.map((step) => (
                currentStep === step.num && (
                  <div key={step.num} className="form-section-new step-content">
                    <div className="section-header-new">
                      <span className="section-icon">{step.icon}</span>
                      <h3>Step {step.num}: {step.title}</h3>
                    </div>
                    <div className="form-group-new">
                      <label>Completion Date</label>
                      <input
                        type="date"
                        value={workflowData[step.dateKey]}
                        onChange={(e) => setWorkflowData({ ...workflowData, [step.dateKey]: e.target.value })}
                        className="form-input-new"
                      />
                    </div>
                    <div className="form-group-new">
                      <label>Details & Notes</label>
                      <textarea
                        value={workflowData[step.key]}
                        onChange={(e) => setWorkflowData({ ...workflowData, [step.key]: e.target.value })}
                        rows="6"
                        placeholder={`Enter details for ${step.title}...`}
                        className="form-input-new"
                      />
                    </div>
                    {step.num === 6 && (
                      <div className="form-group-new">
                        <label>📎 Upload E-Stamp Document</label>
                        <div className="file-upload-container">
                          <input type="file" id="estamp-upload" accept=".pdf,.png,.jpg,.jpeg" className="file-input" />
                          <label htmlFor="estamp-upload" className="file-upload-btn">📎 Choose File</label>
                        </div>
                      </div>
                    )}
                    {step.num === 7 && (
                      <div className="form-group-new">
                        <label>📎 Upload Signed Documents</label>
                        <div className="file-upload-container">
                          <input type="file" id="signed-upload" accept=".pdf,.png,.jpg,.jpeg" className="file-input" multiple />
                          <label htmlFor="signed-upload" className="file-upload-btn">📎 Choose Files</label>
                        </div>
                      </div>
                    )}
                    {step.num === 8 && (
                      <div className="form-group-new">
                        <label>📎 Upload Final Agreement & Term Sheet</label>
                        <div className="file-upload-container">
                          <input type="file" id="final-upload" accept=".pdf,.doc,.docx" className="file-input" multiple />
                          <label htmlFor="final-upload" className="file-upload-btn">📎 Choose Files</label>
                        </div>
                      </div>
                    )}
                    <div className="step-info">
                      <p>📌 {step.hint}</p>
                    </div>
                  </div>
                )
              ))}

              <div className="form-actions-new">
                <button type="button" onClick={() => { setShowWorkflowModal(false); resetWorkflowData(); }} className="btn-cancel-new">Cancel</button>
                <div className="step-navigation">
                  <button type="button" onClick={handleWorkflowSave} className="btn-save-draft-new">💾 Save Progress</button>
                  {currentStep > 1 && (
                    <button type="button" onClick={prevStep} className="btn-prev-new">← Previous</button>
                  )}
                  {currentStep < totalSteps ? (
                    <button type="button" onClick={nextStep} className="btn-next-new">Next Step →</button>
                  ) : (
                    <button type="submit" className="btn-save-new">✓ Complete Workflow</button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Journey Modal */}
      {showWorkflowSteps && (
        <div className="modal-overlay" onClick={() => setShowWorkflowSteps(null)}>
          <div className="journey-modal" onClick={(e) => e.stopPropagation()}>
            <div className="journey-modal-header">
              <h2>🚀 Project Journey - {showWorkflowSteps.title}</h2>
              <button className="modal-close-btn" onClick={() => setShowWorkflowSteps(null)}>×</button>
            </div>
            <div className="journey-modal-body">
              <p className="client-info">🏢 Client: {showWorkflowSteps.client_name}</p>
              
              <div className="journey-steps-modal">
                {projectSteps.map((step) => (
                  <div key={step.num} className={`journey-step-card ${showWorkflowSteps[step.key] ? 'completed' : ''}`}>
                    <div className="step-header">
                      <span className="step-number">Step {step.num}</span>
                      <span className="step-icon-large">{step.icon}</span>
                    </div>
                    <h3>{step.title}</h3>
                    
                    {step.hasUpload ? (
                      <div className="step-upload">
                        <input 
                          type="file" 
                          id={`file-${step.key}`}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleStepComplete(showWorkflowSteps.id, step.key, e.target.files[0].name);
                            }
                          }}
                        />
                        <label htmlFor={`file-${step.key}`} className="upload-btn">
                          📎 {showWorkflowSteps[step.key] ? 'Re-upload' : 'Upload File'}
                        </label>
                        {showWorkflowSteps[step.key] && (
                          <span className="file-uploaded">✅ {showWorkflowSteps[step.key]}</span>
                        )}
                      </div>
                    ) : step.hasPriority ? (
                      <div className="step-priority">
                        <select
                          value={showWorkflowSteps[step.key] || ''}
                          onChange={(e) => handleStepComplete(showWorkflowSteps.id, step.key, e.target.value)}
                          className="priority-select"
                        >
                          <option value="">Select Priority</option>
                          <option value="High">🔴 High Priority</option>
                          <option value="Medium">🟡 Medium Priority</option>
                          <option value="Low">🟢 Low Priority</option>
                        </select>
                        {showWorkflowSteps[step.key] && (
                          <span className="priority-set">Priority: {showWorkflowSteps[step.key]}</span>
                        )}
                      </div>
                    ) : (
                      <div className="step-action">
                        <button 
                          className={`complete-btn ${showWorkflowSteps[step.key] ? 'completed' : ''}`}
                          onClick={() => handleStepComplete(showWorkflowSteps.id, step.key, new Date().toISOString())}
                        >
                          {showWorkflowSteps[step.key] ? '✅ Completed' : '✓ Mark Complete'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agreements;
