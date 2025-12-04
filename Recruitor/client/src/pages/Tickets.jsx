import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Tickets() {
  const { apiBase, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    projectId: ''
  });
  const [comment, setComment] = useState('');
  const [selected, setSelected] = useState(null);

  const headers = { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' };

  const load = async () => {
    const res = await fetch(`${apiBase}/tickets`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    setTickets(json);
  };

  useEffect(() => {
    load();
  }, []);

  const submitTicket = async (e) => {
    e.preventDefault();
    await fetch(`${apiBase}/tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(form)
    });
    setForm({ title: '', description: '', priority: 'medium', projectId: '' });
    load();
  };

  const addComment = async (ticketId) => {
    if (!comment) return;
    await fetch(`${apiBase}/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ comment })
    });
    setComment('');
    load();
  };

  return (
    <div className="page-grid">
      <div className="card">
        <h3>Raise Ticket</h3>
        <form className="page-grid" style={{ gap: '10px' }} onSubmit={submitTicket}>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Project Id</label>
            <input
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              placeholder="p1"
              required
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            ></textarea>
          </div>
          <button className="btn-primary">Create Ticket</button>
        </form>
      </div>

      <div className="tickets-board">
        {tickets.map((ticket) => (
          <div className="ticket" key={ticket.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>{ticket.title}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{ticket.project?.title ?? ticket.projectId}</p>
              </div>
              <span className="pill">{ticket.priority}</span>
            </div>
            <p style={{ marginTop: '10px' }}>{ticket.description}</p>
            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
              Status: {ticket.status} • Raised by {ticket.createdBy}
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: '12px' }}
              onClick={() => setSelected(selected === ticket.id ? null : ticket.id)}
            >
              {selected === ticket.id ? 'Hide comments' : 'View comments'}
            </button>
            {selected === ticket.id && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  {ticket.comments?.length ? (
                    ticket.comments.map((c) => (
                      <div key={c.id} style={{ marginBottom: '6px', fontSize: '0.9rem' }}>
                        <strong>{c.user}</strong>: {c.comment}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8' }}>No comments yet</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Add Comment</label>
                  <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                  <button className="btn-primary" style={{ marginTop: '6px' }} onClick={() => addComment(ticket.id)}>
                    Submit Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


