import React from 'react'
import './EmployeesPage.css'

function EmployeesPage() {
  const workflowSteps = [
    {
      number: 1,
      title: 'Employee Onboarding',
      description: 'Complete new employee registration and documentation'
    },
    {
      number: 2,
      title: 'Documentation',
      description: 'Upload and verify employee documents and credentials'
    },
    {
      number: 3,
      title: 'Department Assignment',
      description: 'Assign employee to appropriate department and role'
    },
    {
      number: 4,
      title: 'Access Setup',
      description: 'Configure system access and permissions'
    },
    {
      number: 5,
      title: 'Training Initiation',
      description: 'Schedule and assign required training programs'
    },
    {
      number: 6,
      title: 'Final Approval',
      description: 'Review and approve employee onboarding completion'
    }
  ]

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employees</h1>
        <button className="add-button">Add Employee</button>
      </div>

      <div className="workflow-section">
        <h2 className="workflow-title">Employee Onboarding Workflow Steps</h2>
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

      <div className="status-message">
        No employees found. Add your first employee!
      </div>
    </div>
  )
}

export default EmployeesPage

