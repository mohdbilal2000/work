import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickAccounts = [
  { username: 'recruitor.lead', label: 'Lead Recruiter', password: 'ritika@123' },
  { username: 'recruitor.ops', label: 'Recruiter', password: 'deepti@123' }
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (account) => {
    setForm({ username: account.username, password: account.password });
    setTimeout(() => submit({ preventDefault: () => {} }), 0);
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <h2 style={{ marginBottom: '12px' }}>Recruitor Portal</h2>
        <p style={{ marginBottom: '24px', color: '#94a3b8' }}>Sign in to continue.</p>
        <form className="page-grid" onSubmit={submit}>
          {error && (
            <div className="card" style={{ borderColor: '#f87171', color: '#fecaca' }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="recruitor.lead"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '24px', display: 'grid', gap: '10px' }}>
          {quickAccounts.map((account) => (
            <button
              key={account.username}
              className="btn-primary"
              style={{ background: 'rgba(99,102,241,0.2)' }}
              onClick={() => quickLogin(account)}
            >
              Login as {account.username}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

