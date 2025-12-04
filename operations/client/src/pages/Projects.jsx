import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check if there's a new project in URL params (from Tendering transfer)
    const newProjectParam = searchParams.get('newProject');
    if (newProjectParam) {
      try {
        const newProject = JSON.parse(decodeURIComponent(newProjectParam));
        // Check if project already exists
        const existingProjects = JSON.parse(localStorage.getItem('operations_projects') || '[]');
        const exists = existingProjects.some(p => p.sourceAgreementId === newProject.sourceAgreementId);
        
        if (!exists) {
          existingProjects.unshift(newProject);
          localStorage.setItem('operations_projects', JSON.stringify(existingProjects));
          alert('🎉 Project received from Tendering!');
        }
        
        // Clear the URL parameter
        setSearchParams({});
      } catch (e) {
        console.error('Error parsing project data:', e);
      }
    }
    
    loadProjects();
  }, [searchParams]);

  const loadProjects = () => {
    const stored = localStorage.getItem('operations_projects');
    if (stored) {
      setProjects(JSON.parse(stored));
    }
  };

  const saveProjects = (data) => {
    localStorage.setItem('operations_projects', JSON.stringify(data));
    setProjects(data);
  };

  const updateStatus = (id, status) => {
    const updated = projects.map(p => p.id === id ? { ...p, status } : p);
    saveProjects(updated);
  };

  const deleteProject = (id) => {
    const filtered = projects.filter(p => p.id !== id);
    saveProjects(filtered);
  };

  const assignToCSM = (project) => {
    // Create CSM agreement/project data
    const csmProject = {
      id: Date.now(),
      client_name: project.client,
      title: project.name,
      agreement_type: 'Operations',
      status: 'active',
      start_date: project.startDate || new Date().toISOString().split('T')[0],
      end_date: project.endDate || '',
      description: project.description || '',
      assignedFrom: 'Operations Lead',
      sourceProjectId: project.id,
      createdAt: new Date().toISOString()
    };

    // Mark project as assigned
    const updatedProjects = projects.map(p => 
      p.id === project.id ? { ...p, assignedToCSM: true } : p
    );
    saveProjects(updatedProjects);

    // Open CSM Projects/Agreements page with data
    const projectData = encodeURIComponent(JSON.stringify(csmProject));
    window.open(`https://csm.defitex2.0.org/agreements?newProject=${projectData}`, '_blank');
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>📋 Agreements</h1>
          <p className="page-subtitle">Agreements transferred from Tendering</p>
        </div>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No Agreements Yet</h3>
            <p>Agreements will appear here when transferred from Tendering</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className={`project-card ${project.transferredFrom ? 'transferred' : ''}`}>
              <div className="card-header">
                <span className={`status-badge ${project.status}`}>{project.status}</span>
                {project.transferredFrom && (
                  <span className="source-badge">📋 From {project.transferredFrom}</span>
                )}
              </div>
              <h3 className="project-name">{project.name}</h3>
              <p className="project-client">🏢 Client: {project.client}</p>
              <div className="project-dates">
                <span>📅 {project.startDate || 'N/A'} - {project.endDate || 'Ongoing'}</span>
              </div>
              {project.transferredFrom && (
                <div className="transfer-info">
                  <span className="transfer-label">🔄 Agreement transferred from Tendering</span>
                </div>
              )}
              {project.description && <p className="project-desc">{project.description}</p>}
              <div className="card-actions">
                <select 
                  value={project.status} 
                  onChange={(e) => updateStatus(project.id, e.target.value)}
                  className="status-select"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
                {!project.assignedToCSM ? (
                  <button className="btn-assign" onClick={() => assignToCSM(project)}>
                    📤 Assign to CSM
                  </button>
                ) : (
                  <span className="assigned-badge">✅ Assigned to CSM</span>
                )}
                <button className="btn-delete" onClick={() => deleteProject(project.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;

