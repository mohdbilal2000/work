import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const displayName = user?.username || 'CSM Admin';
  const roleLabel = user?.role === 'member' ? 'CSM Member' : 'CSM Admin';

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>CSM Portal</h2>
          <p>{roleLabel}</p>
        </div>
        <ul className="nav-menu">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/agreements" className={isActive('/agreements') ? 'active' : ''}>
              Project
            </Link>
          </li>
          <li>
            <Link to="/clients" className={isActive('/clients') ? 'active' : ''}>
              Clients
            </Link>
          </li>
          <li>
            <Link to="/services" className={isActive('/services') ? 'active' : ''}>
              Serviceable
            </Link>
          </li>
          <li>
            <Link to="/tickets" className={isActive('/tickets') ? 'active' : ''}>
              Tickets
            </Link>
          </li>
          <li>
            <Link to="/induction" className={isActive('/induction') ? 'active' : ''}>
              Induction
            </Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <div>
              <strong>{displayName}</strong>
              <p>{roleLabel}</p>
            </div>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
