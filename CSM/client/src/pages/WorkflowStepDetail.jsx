import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import './WorkflowStepDetail.css';

const WorkflowStepDetail = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [kickoffStatus, setKickoffStatus] = useState(null);
  const [markingDone, setMarkingDone] = useState(false);
  const [actionStatuses, setActionStatuses] = useState({});
  const [updatingAction, setUpdatingAction] = useState(null);

  const steps = {
    1: {
      title: 'Agreement Draft Approval',
      description: 'Review and approve the draft agreement',
      details: 'This step involves reviewing the initial draft of the agreement, ensuring all terms and conditions are correct, and obtaining necessary approvals before proceeding to the next stage.',
      actions: [
        'Review draft agreement document',
        'Verify all terms and conditions',
        'Get stakeholder approvals',
        'Document any required changes',
        'Finalize draft for signing'
      ]
    },
    2: {
      title: 'Signed Agreement Upload',
      description: 'Upload the signed agreement document',
      details: 'Once the agreement has been signed by all parties, upload the final signed document to the system for record keeping and future reference.',
      actions: [
        'Collect signed agreement from all parties',
        'Scan or digitize the signed document',
        'Upload to the system',
        'Verify document completeness',
        'Store in secure location'
      ]
    },
    3: {
      title: 'Client Kicked Off',
      description: 'Client onboarding and kickoff process',
      details: 'This step marks the official start of the engagement with the client. It involves introducing the client to the team, setting expectations, and establishing communication channels.',
      actions: [
        'Schedule kickoff meeting with client',
        'Introduce team members and roles',
        'Review project scope and timeline',
        'Establish communication protocols',
        'Set up project management tools'
      ]
    },
    4: {
      title: 'Internal Kickoff',
      description: 'Internal team kickoff and alignment',
      details: 'Ensure all internal team members are aligned on the project requirements, understand their roles, and have access to all necessary resources and information.',
      actions: [
        'Conduct internal team meeting',
        'Assign roles and responsibilities',
        'Share project documentation',
        'Set up internal communication channels',
        'Establish project timeline and milestones'
      ]
    },
    5: {
      title: 'Sourcing Note',
      description: 'Document sourcing requirements and notes',
      details: 'Document all sourcing requirements, candidate profiles, job descriptions, and any specific notes or preferences for the recruitment process.',
      actions: [
        'Document job requirements',
        'Define candidate profiles',
        'Note any special requirements',
        'Set sourcing priorities',
        'Create sourcing strategy'
      ]
    },
    6: {
      title: 'Recruiter Lead to Initiate Sourcing',
      description: 'Assign recruiter lead and initiate sourcing',
      details: 'Assign a lead recruiter to the project and officially begin the sourcing process. The recruiter will start identifying and engaging with potential candidates.',
      actions: [
        'Assign lead recruiter',
        'Provide access to job requirements',
        'Initiate candidate search',
        'Begin candidate outreach',
        'Track sourcing progress'
      ]
    }
  };

  const step = steps[parseInt(stepId)];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (PDF, DOC, DOCX, TXT for sourcing notes)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      const errorMsg = parseInt(stepId) === 5 
        ? 'Please upload a PDF, DOC, DOCX, or TXT file'
        : 'Please upload a PDF, DOC, or DOCX file';
      setUploadError(errorMsg);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('stepId', stepId);
    formData.append('stepType', step.title);

    // Determine upload endpoint based on step
    let uploadEndpoint;
    if (parseInt(stepId) === 1) {
      uploadEndpoint = '/agreements/upload-draft';
    } else if (parseInt(stepId) === 2) {
      uploadEndpoint = '/agreements/upload-signed';
    } else if (parseInt(stepId) === 5) {
      uploadEndpoint = '/agreements/upload-sourcing-note';
    } else {
      setUploadError('File upload not available for this step');
      setUploading(false);
      return;
    }

    try {
      const response = await api.post(uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess('File uploaded successfully!');
      setUploadedFiles([...uploadedFiles, response.data.file]);
      event.target.value = ''; // Reset file input
    } catch (error) {
      setUploadError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const fetchUploadedFiles = async () => {
    if (parseInt(stepId) === 1 || parseInt(stepId) === 2 || parseInt(stepId) === 5) {
      try {
        let endpoint;
        if (parseInt(stepId) === 1) {
          endpoint = `/agreements/draft-files?stepId=${stepId}`;
        } else if (parseInt(stepId) === 2) {
          endpoint = `/agreements/signed-files?stepId=${stepId}`;
        } else if (parseInt(stepId) === 5) {
          endpoint = `/agreements/sourcing-note-files?stepId=${stepId}`;
        }
        const response = await api.get(endpoint);
        setUploadedFiles(response.data.files || []);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    }
  };

  const fetchKickoffStatus = async () => {
    if (parseInt(stepId) === 3 || parseInt(stepId) === 4) {
      try {
        const response = await api.get(`/agreements/kickoff-status?stepId=${stepId}`);
        setKickoffStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching kickoff status:', error);
      }
    }
  };

  const fetchActionStatuses = async () => {
    try {
      const response = await api.get(`/agreements/action-statuses?stepId=${stepId}`);
      if (response.data && response.data.statuses) {
        const statusMap = {};
        response.data.statuses.forEach(status => {
          // Handle both boolean and numeric (0/1) values
          const completed = status.completed === true || status.completed === 1 || status.completed === '1';
          statusMap[status.action_index] = completed;
        });
        setActionStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error fetching action statuses:', error);
      // Don't show error to user, just log it
    }
  };

  const handleActionToggle = async (actionIndex) => {
    setUpdatingAction(actionIndex);
    try {
      const newStatus = !actionStatuses[actionIndex];
      const response = await api.post('/agreements/toggle-action', {
        stepId: stepId,
        actionIndex: actionIndex,
        actionText: step.actions[actionIndex],
        completed: newStatus
      });

      if (response.data && response.data.completed !== undefined) {
        setActionStatuses(prev => ({
          ...prev,
          [actionIndex]: newStatus
        }));
      }
    } catch (error) {
      console.error('Error toggling action:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to update action status';
      alert(errorMessage);
    } finally {
      setUpdatingAction(null);
    }
  };

  const handleKickoffDone = async () => {
    if (!window.confirm(`Mark ${step.title} as completed?`)) {
      return;
    }

    setMarkingDone(true);
    try {
      const response = await api.post('/agreements/mark-kickoff-done', {
        stepId: stepId,
        stepType: step.title
      });
      
      setKickoffStatus(response.data.status);
      alert(`${step.title} marked as completed!`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to mark kickoff as done');
    } finally {
      setMarkingDone(false);
    }
  };

  useEffect(() => {
    if (parseInt(stepId) === 1 || parseInt(stepId) === 2 || parseInt(stepId) === 5) {
      fetchUploadedFiles();
    }
    if (parseInt(stepId) === 3 || parseInt(stepId) === 4) {
      fetchKickoffStatus();
    }
    // Fetch action statuses for all steps
    fetchActionStatuses();
  }, [stepId]);

  if (!step) {
    return (
      <div className="workflow-step-detail">
        <div className="error-message">
          <h2>Step not found</h2>
          <button onClick={() => navigate('/agreements')} className="btn-primary">
            Back to Agreements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-step-detail">
      <div className="step-detail-header">
        <button onClick={() => navigate('/agreements')} className="back-button">
          ← Back to Agreements
        </button>
        <div className="step-number-large">{stepId}</div>
        <h1>{step.title}</h1>
        <p className="step-description">{step.description}</p>
      </div>

      <div className="step-detail-content">
        <div className="detail-section">
          <h2>Overview</h2>
          <p>{step.details}</p>
        </div>

        <div className="detail-section">
          <h2>Key Actions</h2>
          <ul className="actions-list">
            {step.actions.map((action, index) => {
              const isCompleted = actionStatuses[index] || false;
              const isUpdating = updatingAction === index;
              return (
                <li 
                  key={index} 
                  className={isCompleted ? 'action-completed' : ''}
                  onClick={() => !isUpdating && handleActionToggle(index)}
                  style={{ cursor: isUpdating ? 'wait' : 'pointer' }}
                >
                  <div className="action-checkbox">
                    {isUpdating ? (
                      <span className="loading-spinner">⟳</span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleActionToggle(index)}
                        onClick={(e) => e.stopPropagation()}
                        className="action-checkbox-input"
                      />
                    )}
                  </div>
                  <span className="action-number">{index + 1}</span>
                  <span className={`action-text ${isCompleted ? 'completed-text' : ''}`}>
                    {action}
                  </span>
                  {isCompleted && <span className="completed-badge">✓ Done</span>}
                </li>
              );
            })}
          </ul>
        </div>

        {(parseInt(stepId) === 1 || parseInt(stepId) === 2 || parseInt(stepId) === 5) && (
          <div className="detail-section">
            <h2>
              {parseInt(stepId) === 1 ? 'Upload Draft Agreement' : 
               parseInt(stepId) === 2 ? 'Upload Signed Agreement' : 
               'Upload Sourcing Note'}
            </h2>
            <div className="upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  id={parseInt(stepId) === 1 ? "draft-upload" : parseInt(stepId) === 2 ? "signed-upload" : "sourcing-note-upload"}
                  accept={parseInt(stepId) === 5 ? ".pdf,.doc,.docx,.txt" : ".pdf,.doc,.docx"}
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor={parseInt(stepId) === 1 ? "draft-upload" : parseInt(stepId) === 2 ? "signed-upload" : "sourcing-note-upload"} className="upload-button">
                  {uploading ? 'Uploading...' : '📄 Choose File to Upload'}
                </label>
                <p className="upload-hint">
                  Accepted formats: {parseInt(stepId) === 5 ? 'PDF, DOC, DOCX, TXT' : 'PDF, DOC, DOCX'} (Max 10MB)
                </p>
              </div>

              {uploadError && (
                <div className="upload-message error">
                  ❌ {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="upload-message success">
                  ✅ {uploadSuccess}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h3>Uploaded Files:</h3>
                  <ul className="files-list">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="file-item">
                        <span className="file-icon">📎</span>
                        <span className="file-name">{file.filename}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                        <span className="file-date">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-download">
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {(parseInt(stepId) === 3 || parseInt(stepId) === 4) && (
          <div className="detail-section">
            <h2>Kickoff Status</h2>
            <div className="kickoff-section">
              {kickoffStatus && kickoffStatus.completed ? (
                <div className="kickoff-completed">
                  <div className="status-badge-completed">
                    <span className="checkmark">✓</span>
                    <span>Kickoff Completed</span>
                  </div>
                  <p className="completion-info">
                    Completed on: {new Date(kickoffStatus.completedAt).toLocaleString()}
                    {kickoffStatus.completedBy && (
                      <span> by {kickoffStatus.completedBy}</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="kickoff-pending">
                  <p className="status-text">This kickoff has not been completed yet.</p>
                  <button 
                    onClick={handleKickoffDone}
                    disabled={markingDone}
                    className="kickoff-done-button"
                  >
                    {markingDone ? 'Marking...' : '✓ Mark Kickoff as Done'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h2>Next Steps</h2>
          <p>
            {parseInt(stepId) < 6 ? (
              <>
                After completing this step, proceed to{' '}
                <button 
                  className="link-button"
                  onClick={() => navigate(`/agreements/workflow-step/${parseInt(stepId) + 1}`)}
                >
                  Step {parseInt(stepId) + 1}: {steps[parseInt(stepId) + 1].title}
                </button>
              </>
            ) : (
              'This is the final step in the workflow. Once completed, the agreement process is fully initiated.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepDetail;

