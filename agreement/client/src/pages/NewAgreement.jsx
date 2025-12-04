import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewAgreement.css';

const NewAgreement = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    agreementType: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newAgreement = {
      id: Date.now().toString(),
      ...formData,
      currentStep: 1,
      createdAt: new Date().toISOString(),
      steps: {
        step1: { completed: false, date: '', notes: '' },
        step2: { completed: false, date: '', notes: '', draftFile: null },
        step3: { completed: false, date: '', notes: '', approved: false },
        step4: { completed: false, date: '', notes: '' },
        step5: { completed: false, date: '', notes: '', approved: false },
        step6: { completed: false, date: '', notes: '', estampFile: null },
        step7: { completed: false, date: '', notes: '', signedFile: null },
        step8: { completed: false, date: '', notes: '', handoverFile: null }
      }
    };

    // Save to localStorage
    const existing = localStorage.getItem('tendering_agreements');
    const agreements = existing ? JSON.parse(existing) : [];
    agreements.unshift(newAgreement);
    localStorage.setItem('tendering_agreements', JSON.stringify(agreements));

    // Navigate to workflow
    navigate(`/agreements/${newAgreement.id}/workflow`);
  };

  return (
    <div className="new-agreement-page">
      <div className="page-header">
        <div>
          <h1>Create New Agreement</h1>
          <p className="page-subtitle">Start a new agreement workflow</p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>📋 Agreement Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Agreement Type *</label>
                <input
                  type="text"
                  name="agreementType"
                  value={formData.agreementType}
                  onChange={handleChange}
                  placeholder="e.g., Service Agreement, NDA, MSA"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Agreement Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter agreement title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter agreement description"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter contract amount"
              />
            </div>
          </div>

          <div className="workflow-preview">
            <h2>📊 Workflow Steps</h2>
            <p>Once created, this agreement will go through the following 8-step process:</p>
            <div className="steps-preview">
              <div className="step-item">
                <span className="step-num">1</span>
                <span className="step-icon">🤝</span>
                <span className="step-name">Closure of Negotiations</span>
              </div>
              <div className="step-item">
                <span className="step-num">2</span>
                <span className="step-icon">📝</span>
                <span className="step-name">Creation of Draft by Tendering</span>
              </div>
              <div className="step-item">
                <span className="step-num">3</span>
                <span className="step-icon">✅</span>
                <span className="step-name">CEO Approval on Draft</span>
              </div>
              <div className="step-item">
                <span className="step-num">4</span>
                <span className="step-icon">📤</span>
                <span className="step-name">Draft Shared with Client</span>
              </div>
              <div className="step-item">
                <span className="step-num">5</span>
                <span className="step-icon">👍</span>
                <span className="step-name">Post Client Approval on Draft</span>
              </div>
              <div className="step-item">
                <span className="step-num">6</span>
                <span className="step-icon">📜</span>
                <span className="step-name">E-Stamp Download by Tendering</span>
              </div>
              <div className="step-item">
                <span className="step-num">7</span>
                <span className="step-icon">✍️</span>
                <span className="step-name">Legality & Client Signatures</span>
              </div>
              <div className="step-item">
                <span className="step-num">8</span>
                <span className="step-icon">📋</span>
                <span className="step-name">Operations Handover</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/agreements')}>
              Cancel
            </button>
            <button type="submit" className="btn-create">
              Create Agreement & Start Workflow →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAgreement;


