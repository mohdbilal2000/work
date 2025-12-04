import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.RECRUITOR_PORT || 5100;
const JWT_SECRET = process.env.RECRUITOR_JWT;
if (!JWT_SECRET) {
  throw new Error('RECRUITOR_JWT environment variable is required');
}
const DATA_PATH = path.join(__dirname, 'database', 'recruitor.json');

const app = express();
app.use(cors());
app.use(express.json());

function nanoid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    return {
      users: [],
      candidates: [],
      projects: [],
      tickets: [],
      ticketComments: []
    };
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  try {
    const token = header.replace('Bearer ', '');
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Recruitor API' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const data = readData();
  const user = data.users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    }
  });
});

app.get('/api/dashboard', authenticate, (_req, res) => {
  const data = readData();
  const openProjects = data.projects.filter((p) => p.status !== 'completed');
  const activeCandidates = data.candidates.filter((c) => c.status !== 'Hired');
  const openTickets = data.tickets.filter((t) => t.status !== 'resolved');

  res.json({
    stats: {
      totalProjects: data.projects.length,
      openProjects: openProjects.length,
      candidates: data.candidates.length,
      activeCandidates: activeCandidates.length,
      tickets: data.tickets.length,
      openTickets: openTickets.length
    },
    highlights: {
      urgentProject: openProjects.find((p) => p.priority === 'urgent') ?? null,
      newestCandidate: data.candidates[0] ?? null,
      urgentTicket: openTickets.find((t) => t.priority === 'urgent') ?? null
    }
  });
});

app.get('/api/candidates', authenticate, (req, res) => {
  const data = readData();
  let results = data.candidates;
  if (req.query.projectId) {
    results = results.filter((c) => c.projectId === req.query.projectId);
  }
  if (req.query.status) {
    results = results.filter((c) => c.status === req.query.status);
  }
  res.json(results);
});

app.post('/api/candidates', authenticate, (req, res) => {
  const { name, role, projectId, status = 'Sourcing', notes = '' } = req.body;
  if (!name || !role || !projectId) {
    return res.status(400).json({ error: 'Name, role and projectId required' });
  }
  const data = readData();
  const candidate = {
    id: nanoid(),
    name,
    role,
    projectId,
    status,
    notes,
    lastUpdated: new Date().toISOString(),
    recruiterId: req.user.id
  };
  data.candidates.unshift(candidate);
  writeData(data);
  res.status(201).json(candidate);
});

app.get('/api/projects', authenticate, (_req, res) => {
  const data = readData();
  res.json(data.projects);
});

app.post('/api/projects/:id/start', authenticate, (req, res) => {
  const data = readData();
  const project = data.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  project.status = 'sourcing';
  project.startedBy = req.user.username;
  project.startedAt = new Date().toISOString();
  writeData(data);
  res.json(project);
});

app.get('/api/tickets', authenticate, (_req, res) => {
  const data = readData();
  const enriched = data.tickets.map((ticket) => ({
    ...ticket,
    project: data.projects.find((p) => p.id === ticket.projectId) || null,
    comments: data.ticketComments.filter((c) => c.ticketId === ticket.id)
  }));
  res.json(enriched);
});

app.post('/api/tickets', authenticate, (req, res) => {
  const { title, description, priority = 'medium', projectId } = req.body;
  if (!title || !projectId) {
    return res.status(400).json({ error: 'Title and projectId required' });
  }
  const data = readData();
  const ticket = {
    id: nanoid(),
    title,
    description,
    priority,
    status: 'open',
    projectId,
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.tickets.unshift(ticket);
  writeData(data);
  res.status(201).json(ticket);
});

app.post('/api/tickets/:id/comments', authenticate, (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Comment is required' });
  }
  const data = readData();
  const ticket = data.tickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  const newComment = {
    id: nanoid(),
    ticketId: ticket.id,
    user: req.user.username,
    comment,
    createdAt: new Date().toISOString()
  };
  data.ticketComments.push(newComment);
  ticket.updatedAt = new Date().toISOString();
  writeData(data);
  res.status(201).json(newComment);
});

app.listen(PORT, () => {
  console.log(`Recruitor API running on http://localhost:${PORT}`);
});


