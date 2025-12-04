import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Agreements.css';

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [filter, setFilter] = useState('all');

  const workflowSteps = [
    { num: 1, title: 'Closure of Negotiations', icon: '🤝' },
    { num: 2, title: 'Creation of Draft', icon: '📝' },
    { num: 3, title: 'CEO Approval', icon: '✅' },
    { num: 4, title: 'Draft to Client', icon: '📤' },
    { num: 5, title: 'Client Approval', icon: '👍' },
    { num: 6, title: 'E-Stamp Download', icon: '📜' },
    { num: 7, title: 'Signatures', icon: '✍️' },
    { num: 8, title: 'Operations Handover', icon: '📋' }
  ];

  useEffect(() => {
    loadAgreements();
  }, []);

  const loadAgreements = () => {
    const stored = localStorage.getItem('tendering_agreements');
    if (stored) {
      setAgreements(JSON.parse(stored));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this agreement?')) {
      const updated = agreements.filter(a => a.id !== id);
      localStorage.setItem('tendering_agreements', JSON.stringify(updated));
      setAgreements(updated);
    }
  };

  const handleTransferToOperations = (agreement) => {
    // Check if already transferred
    if (agreement.transferredToOperations) {
      alert('This agreement has already been transferred to Operations Lead.');
      return;
    }

    // Create a new project for Operations Lead
    const newProject = {
      id: Date.now(),
      name: agreement.title || `${agreement.clientName} Agreement`,
      client: agreement.clientName,
      status: 'active',
      startDate: agreement.startDate || new Date().toISOString().split('T')[0],
      endDate: agreement.endDate || '',
      description: `Agreement transferred from Tendering. Type: ${agreement.agreementType}. Amount: Rs ${agreement.amount || 'N/A'}`,
      createdAt: new Date().toISOString(),
      sourceAgreementId: agreement.id,
      transferredFrom: 'Tendering'
    };

    // Mark agreement as transferred
    const updatedAgreements = agreements.map(a => 
      a.id === agreement.id ? { ...a, transferredToOperations: true, status: 'completed' } : a
    );
    localStorage.setItem('tendering_agreements', JSON.stringify(updatedAgreements));
    setAgreements(updatedAgreements);

    // Open Operations Lead with project data in URL
    const projectData = encodeURIComponent(JSON.stringify(newProject));
    window.open(`https://operations.defitex2.0.org/projects?newProject=${projectData}`, '_blank');
  };

  const filteredAgreements = agreements.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'inProgress') return a.currentStep > 0 && a.currentStep < 8;
    if (filter === 'completed') return a.currentStep === 8;
    if (filter === 'pending') return a.currentStep === 3;
    return true;
  });

  return (
    <div className="agreements-page">
      <div className="page-header">
        <div>
          <h1>Agreements</h1>
          <p className="page-subtitle">Manage all agreement workflows</p>
        </div>
        <Link to="/agreements/new" className="btn-primary">
          + New Agreement
        </Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({agreements.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'inProgress' ? 'active' : ''}`}
          onClick={() => setFilter('inProgress')}
        >
          In Progress ({agreements.filter(a => a.currentStep > 0 && a.currentStep < 8).length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Approval ({agreements.filter(a => a.currentStep === 3).length})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({agreements.filter(a => a.currentStep === 8).length})
        </button>
      </div>

      {/* Agreements Grid */}
      {filteredAgreements.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No Agreements Found</h3>
          <p>Create your first agreement to start the workflow process.</p>
          <Link to="/agreements/new" className="btn-primary">+ Create Agreement</Link>
        </div>
      ) : (
        <div className="agreements-grid">
          {filteredAgreements.map((agreement) => (
            <div key={agreement.id} className="agreement-card">
              <div className="card-header">
                <h3>{agreement.clientName}</h3>
                <span className={`status-badge ${agreement.currentStep === 8 ? 'completed' : 'in-progress'}`}>
                  {agreement.currentStep === 8 ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="card-body">
                <div className="info-row">
                  <span className="label">Agreement Type:</span>
                  <span className="value">{agreement.agreementType}</span>
                </div>
                <div className="info-row">
                  <span className="label">Title:</span>
                  <span className="value">{agreement.title}</span>
                </div>
                <div className="info-row">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(agreement.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="current-step">
                  <span className="label">Current Step:</span>
                  <div className="step-info">
                    <span className="step-icon">{workflowSteps[agreement.currentStep - 1]?.icon || '📄'}</span>
                    <span className="step-name">{workflowSteps[agreement.currentStep - 1]?.title || 'Not Started'}</span>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{agreement.currentStep}/8 Steps</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(agreement.currentStep / 8) * 100}%` }}></div>
                  </div>
                </div>

                <div className="step-dots">
                  {workflowSteps.map((step) => (
                    <div 
                      key={step.num} 
                      className={`step-dot ${agreement.currentStep >= step.num ? 'completed' : ''} ${agreement.currentStep === step.num ? 'current' : ''}`}
                      title={step.title}
                    >
                      {step.num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-actions">
                <Link to={`/agreements/${agreement.id}/workflow`} className="btn-workflow">
                  📋 Manage Workflow
                </Link>
                {agreement.currentStep === 8 && !agreement.transferredToOperations && (
                  <button 
                    onClick={() => handleTransferToOperations(agreement)} 
                    className="btn-transfer"
                  >
                    🚀 Transfer to Operations
                  </button>
                )}
                {agreement.transferredToOperations && (
                  <span className="transferred-badge">✅ Transferred</span>
                )}
                <button onClick={() => handleDelete(agreement.id)} className="btn-delete">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agreements;

