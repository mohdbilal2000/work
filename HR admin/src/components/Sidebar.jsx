import React from 'react'
import './Sidebar.css'

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    'Dashboard',
    'Vendor Management',
    'Internal Payroll',
    'ESIC/PF Compliance',
    'Office Utilities',
    'Ticket Management'
  ]

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>HR Admin Portal</h1>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item}
            className={`nav-item ${activePage === item ? 'active' : ''}`}
            onClick={() => setActivePage(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">admin.user</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar

