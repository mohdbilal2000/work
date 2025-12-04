import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token, apiBase } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`${apiBase}/dashboard`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const json = await response.json();
      setData(json);
      setLoading(false);
    };
    load();
  }, [apiBase, token]);

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div className="page-grid">
      <div className="stats-grid">
        <Stat label="Projects" value={data.stats.totalProjects} />
        <Stat label="Open Projects" value={data.stats.openProjects} />
        <Stat label="Active Candidates" value={data.stats.activeCandidates} />
        <Stat label="Open Tickets" value={data.stats.openTickets} />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>Highlights</h3>
        <div className="page-grid" style={{ gap: '12px' }}>
          <Highlight title="Urgent Project" item={data.highlights.urgentProject} />
          <Highlight title="Newest Candidate" item={data.highlights.newestCandidate} />
          <Highlight title="Urgent Ticket" item={data.highlights.urgentTicket} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <p style={{ color: '#94a3b8', marginBottom: '8px' }}>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Highlight({ title, item }) {
  if (!item) {
    return (
      <div className="card" style={{ minHeight: '80px' }}>
        <p style={{ color: '#94a3b8' }}>{title}</p>
        <p>No updates yet.</p>
      </div>
    );
  }
  return (
    <div className="card" style={{ minHeight: '80px' }}>
      <p style={{ color: '#94a3b8' }}>{title}</p>
      <h4 style={{ marginTop: '8px' }}>{item.title || item.name}</h4>
      {item.client && <p style={{ color: '#bae6fd' }}>{item.client}</p>}
      {item.status && <span className="pill" style={{ marginTop: '8px' }}>{item.status}</span>}
    </div>
  );
}


