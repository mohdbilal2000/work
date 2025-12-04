import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AgreementWorkflow.css';

const AgreementWorkflow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({});

  const workflowSteps = [
    { num: 1, title: 'Closure of Negotiations', icon: '🤝', hint: 'Document the closure of negotiations with the client.' },
    { num: 2, title: 'Creation of Draft by Tendering', icon: '📝', hint: 'Create and upload the agreement draft document.', hasUpload: true, uploadLabel: 'Draft Agreement' },
    { num: 3, title: 'CEO Approval on Draft', icon: '✅', hint: 'Get CEO approval on the draft. Mark as approved once done.', hasApproval: true },
    { num: 4, title: 'Draft Shared with Client', icon: '📤', hint: 'Share the approved draft with the client.' },
    { num: 5, title: 'Post Client Approval on Draft', icon: '👍', hint: 'Record client approval on the draft.', hasApproval: true },
    { num: 6, title: 'E-Stamp Download by Tendering', icon: '📜', hint: 'Download and upload the E-Stamp document.', hasUpload: true, uploadLabel: 'E-Stamp Document' },
    { num: 7, title: 'Legality & Client Signatures', icon: '✍️', hint: 'Collect legal approvals and client signatures.', hasUpload: true, uploadLabel: 'Signed Documents' },
    { num: 8, title: 'Operations Handover', icon: '📋', hint: 'Hand over signed agreement & term sheet to Operations Lead.', hasUpload: true, uploadLabel: 'Final Documents' }
  ];

  useEffect(() => {
    loadAgreement();
  }, [id]);

  const loadAgreement = () => {
    const stored = localStorage.getItem('tendering_agreements');
    if (stored) {
      const agreements = JSON.parse(stored);
      const found = agreements.find(a => a.id === id);
      if (found) {
        setAgreement(found);
        setCurrentStep(found.currentStep || 1);
        setStepData(found.steps || {});
      }
    }
  };

  const saveAgreement = (updatedAgreement) => {
    const stored = localStorage.getItem('tendering_agreements');
    if (stored) {
      const agreements = JSON.parse(stored);
      const index = agreements.findIndex(a => a.id === id);
      if (index !== -1) {
        agreements[index] = updatedAgreement;
        localStorage.setItem('tendering_agreements', JSON.stringify(agreements));
        setAgreement(updatedAgreement);
      }
    }
  };

  const handleStepChange = (stepNum, field, value) => {
    const stepKey = `step${stepNum}`;
    const updatedStepData = {
      ...stepData,
      [stepKey]: {
        ...stepData[stepKey],
        [field]: value
      }
    };
    setStepData(updatedStepData);
  };

  const markStepComplete = (stepNum) => {
    const stepKey = `step${stepNum}`;
    const updatedSteps = {
      ...stepData,
      [stepKey]: {
        ...stepData[stepKey],
        completed: true,
        completedDate: new Date().toISOString()
      }
    };

    const newCurrentStep = Math.min(stepNum + 1, 8);
    
    const updatedAgreement = {
      ...agreement,
      currentStep: newCurrentStep,
      steps: updatedSteps,
      status: stepNum === 8 ? 'completed' : agreement.status
    };

    saveAgreement(updatedAgreement);
    setStepData(updatedSteps);
    setCurrentStep(newCurrentStep);

    // If final step (Operations Handover) is completed, transfer to Operations Lead
    if (stepNum === 8) {
      transferToOperationsLead(updatedAgreement);
    }
  };

  const transferToOperationsLead = (completedAgreement) => {
    // Create a new project for Operations Lead
    const newProject = {
      id: Date.now(),
      name: completedAgreement.title || `${completedAgreement.clientName} Agreement`,
      client: completedAgreement.clientName,
      status: 'active',
      startDate: completedAgreement.startDate || new Date().toISOString().split('T')[0],
      endDate: completedAgreement.endDate || '',
      description: `Agreement transferred from Tendering.\nType: ${completedAgreement.agreementType}\nAmount: ₹${completedAgreement.amount || 'N/A'}`,
      createdAt: new Date().toISOString(),
      sourceAgreementId: completedAgreement.id,
      transferredFrom: 'Tendering'
    };

    // Get existing Operations projects and add the new one
    const existingProjects = JSON.parse(localStorage.getItem('operations_projects') || '[]');
    existingProjects.unshift(newProject);
    localStorage.setItem('operations_projects', JSON.stringify(existingProjects));

    alert('🎉 Agreement completed! Project has been transferred to Operations Lead.');
  };

  const handleSaveProgress = () => {
    const updatedAgreement = {
      ...agreement,
      steps: stepData
    };
    saveAgreement(updatedAgreement);
    alert('Progress saved successfully!');
  };

  if (!agreement) {
    return (
      <div className="loading">
        <p>Loading agreement...</p>
      </div>
    );
  }

  const currentStepInfo = workflowSteps[currentStep - 1];
  const currentStepData = stepData[`step${currentStep}`] || {};

  return (
    <div className="workflow-page">
      {/* Header */}
      <div className="workflow-header">
        <button className="btn-back" onClick={() => navigate('/agreements')}>
          ← Back to Agreements
        </button>
        <div className="header-info">
          <h1>{agreement.clientName}</h1>
          <p>{agreement.title} • {agreement.agreementType}</p>
        </div>
        <div className="header-progress">
          <span className="progress-label">Progress</span>
          <span className="progress-value">{agreement.currentStep}/8</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {workflowSteps.map((step) => (
          <div 
            key={step.num}
            className={`step-item ${stepData[`step${step.num}`]?.completed ? 'completed' : ''} ${currentStep === step.num ? 'current' : ''} ${step.num < currentStep ? 'past' : ''}`}
            onClick={() => step.num <= agreement.currentStep && setCurrentStep(step.num)}
          >
            <div className="step-circle">
              {stepData[`step${step.num}`]?.completed ? '✓' : step.icon}
            </div>
            <div className="step-label">
              <span className="step-num">Step {step.num}</span>
              <span className="step-title">{step.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="workflow-content">
        <div className="step-panel">
          <div className="panel-header">
            <span className="step-icon-large">{currentStepInfo.icon}</span>
            <div>
              <h2>Step {currentStep}: {currentStepInfo.title}</h2>
              <p className="step-hint">{currentStepInfo.hint}</p>
            </div>
          </div>

          <div className="panel-body">
            {/* Date Field */}
            <div className="form-group">
              <label>📅 Completion Date</label>
              <input
                type="date"
                value={currentStepData.date || ''}
                onChange={(e) => handleStepChange(currentStep, 'date', e.target.value)}
              />
            </div>

            {/* Notes Field */}
            <div className="form-group">
              <label>📝 Notes & Details</label>
              <textarea
                value={currentStepData.notes || ''}
                onChange={(e) => handleStepChange(currentStep, 'notes', e.target.value)}
                placeholder={`Enter details for ${currentStepInfo.title}...`}
                rows="5"
              />
            </div>

            {/* File Upload (for applicable steps) */}
            {currentStepInfo.hasUpload && (
              <div className="form-group">
                <label>📎 {currentStepInfo.uploadLabel}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id={`file-${currentStep}`}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleStepChange(currentStep, 'fileName', file.name);
                      }
                    }}
                  />
                  <label htmlFor={`file-${currentStep}`} className="file-btn">
                    📎 Choose File
                  </label>
                  {currentStepData.fileName && (
                    <span className="file-name">✓ {currentStepData.fileName}</span>
                  )}
                </div>
              </div>
            )}

            {/* Approval Toggle (for applicable steps) */}
            {currentStepInfo.hasApproval && (
              <div className="form-group">
                <label>✅ Approval Status</label>
                <div className="approval-toggle">
                  <button
                    className={`approval-btn ${currentStepData.approved === true ? 'active approved' : ''}`}
                    onClick={() => handleStepChange(currentStep, 'approved', true)}
                  >
                    ✓ Approved
                  </button>
                  <button
                    className={`approval-btn ${currentStepData.approved === false ? 'active rejected' : ''}`}
                    onClick={() => handleStepChange(currentStep, 'approved', false)}
                  >
                    ✗ Pending
                  </button>
                </div>
              </div>
            )}

            {/* Step Completed Status */}
            {currentStepData.completed && (
              <div className="completed-badge">
                ✓ Step completed on {new Date(currentStepData.completedDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="panel-actions">
            <button className="btn-save" onClick={handleSaveProgress}>
              💾 Save Progress
            </button>
            
            {currentStep > 1 && (
              <button className="btn-prev" onClick={() => setCurrentStep(currentStep - 1)}>
                ← Previous Step
              </button>
            )}
            
            {!currentStepData.completed && currentStep === agreement.currentStep && (
              <button className="btn-complete" onClick={() => markStepComplete(currentStep)}>
                ✓ Mark Step Complete
              </button>
            )}
            
            {currentStep < agreement.currentStep && (
              <button className="btn-next" onClick={() => setCurrentStep(currentStep + 1)}>
                Next Step →
              </button>
            )}

            {currentStep === 8 && currentStepData.completed && (
              <div className="completion-message">
                🎉 Agreement workflow completed! All steps have been finished.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Agreement Info */}
        <div className="info-sidebar">
          <h3>📄 Agreement Details</h3>
          <div className="info-item">
            <span className="info-label">Client</span>
            <span className="info-value">{agreement.clientName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Type</span>
            <span className="info-value">{agreement.agreementType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Title</span>
            <span className="info-value">{agreement.title}</span>
          </div>
          {agreement.amount && (
            <div className="info-item">
              <span className="info-label">Amount</span>
              <span className="info-value">₹{agreement.amount}</span>
            </div>
          )}
          {agreement.startDate && (
            <div className="info-item">
              <span className="info-label">Start Date</span>
              <span className="info-value">{agreement.startDate}</span>
            </div>
          )}
          {agreement.endDate && (
            <div className="info-item">
              <span className="info-label">End Date</span>
              <span className="info-value">{agreement.endDate}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">Created</span>
            <span className="info-value">{new Date(agreement.createdAt).toLocaleDateString()}</span>
          </div>

          <h3 style={{ marginTop: '24px' }}>📊 Step Progress</h3>
          <div className="step-progress-list">
            {workflowSteps.map((step) => {
              const stepInfo = stepData[`step${step.num}`] || {};
              return (
                <div key={step.num} className={`step-progress-item ${stepInfo.completed ? 'done' : ''}`}>
                  <span className="step-mini-icon">{step.icon}</span>
                  <span className="step-mini-title">{step.title}</span>
                  <span className="step-status">{stepInfo.completed ? '✓' : '○'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementWorkflow;

