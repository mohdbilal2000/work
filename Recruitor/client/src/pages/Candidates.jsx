import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const statuses = ['Sourcing', 'Interview', 'Offer', 'Hired'];

export default function Candidates() {
  const { apiBase, token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    role: '',
    projectId: '',
    status: 'Sourcing',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch(`${apiBase}/candidates`, {
      headers: { Authorization: `Bearer ${token()}` }
    });
    const json = await response.json();
    setList(json);
    setLoading(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    const response = await fetch(`${apiBase}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify(form)
    });
    if (response.ok) {
      setForm({ name: '', role: '', projectId: '', status: 'Sourcing', notes: '' });
      fetchData();
    }
  };

  if (loading) return <div className="loading">Loading candidates…</div>;

  return (
    <div className="page-grid">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>Add Candidate</h3>
        <form className="page-grid" style={{ gap: '12px' }} onSubmit={submit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Project ID</label>
            <input value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            ></textarea>
          </div>
          <button className="btn-primary" type="submit">
            Save Candidate
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Pipeline</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Project</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {list.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.role}</td>
                <td>{candidate.projectId}</td>
                <td>
                  <span className="pill">{candidate.status}</span>
                </td>
                <td>{candidate.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


