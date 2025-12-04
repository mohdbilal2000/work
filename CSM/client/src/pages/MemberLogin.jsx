import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import './Login.css';

const quickMembers = [
  {
    name: 'Ritika',
    title: 'Client Success Lead',
    username: 'ritika.csm',
    password: 'ritika@123',
  },
  {
    name: 'Deepti',
    title: 'Client Success Lead',
    username: 'deepti.csm',
    password: 'deepti@123',
  }
];

const MemberLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getBasePath = () => {
    return window.location.pathname.startsWith('/csm') ? '/csm' : '';
  };

  const attemptLogin = async (creds) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/member/login', creds);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = getBasePath() + '/dashboard';
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    attemptLogin({ username, password });
  };

  const handleQuickLogin = (member) => {
    attemptLogin({ username: member.username, password: member.password });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Client Services Manager</h1>
        <h2>Member Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="quick-login-grid">
          {quickMembers.map((member) => (
            <div className="quick-login-card" key={member.username}>
              <div>
                <h3>{member.name}</h3>
                <p>{member.title}</p>
                <small>Username: {member.username}</small>
              </div>
              <button
                type="button"
                className="login-btn"
                disabled={loading}
                onClick={() => handleQuickLogin(member)}
              >
                {loading ? 'Please wait...' : `Login as ${member.name}`}
              </button>
            </div>
          ))}
        </div>
        <div className="login-info">
          <p>Member access for the CSM squad.</p>
          <p style={{ marginTop: '10px' }}>
            Need another account?{' '}
            <a href="/member-register" style={{ color: '#6c5ce7', textDecoration: 'none' }}>
              Register here
            </a>
          </p>
          <p style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
            <a href="/login" style={{ color: '#6c5ce7', textDecoration: 'none' }}>
              Admin Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberLogin;

