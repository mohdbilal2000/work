import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { apiBase, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${token()}` }
    });
    setProjects(await res.json());
    setLoading(false);
  };

  const startSourcing = async (id) => {
    await fetch(`${apiBase}/projects/${id}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` }
    });
    load();
  };

  if (loading) return <div className="loading">Loading projects…</div>;

  return (
    <div className="page-grid">
      {projects.map((project) => (
        <div className="card" key={project.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{project.title}</h3>
              <p style={{ color: '#94a3b8' }}>{project.client}</p>
            </div>
            <span className="pill">{project.priority}</span>
          </div>
          <p style={{ margin: '12px 0', color: '#cbd5f5' }}>{project.details}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Open roles: {project.openRoles} • Status: {project.status}
          </p>
          {project.status === 'briefed' ? (
            <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => startSourcing(project.id)}>
              Start Sourcing
            </button>
          ) : (
            <p style={{ marginTop: '12px', color: '#10b981' }}>
              In progress by {project.startedBy ?? 'unassigned'}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}


