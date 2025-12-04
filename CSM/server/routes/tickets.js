const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Helper function to enrich tickets with related data
async function enrichTickets(tickets) {
  const services = await db.getData('/services');
  const clients = await db.getData('/clients');
  const users = await db.getData('/users');
  
  return tickets.map(ticket => {
    const service = services.find(s => s.id === ticket.service_id);
    const client = service ? clients.find(c => c.id === service.client_id) : null;
    const createdByUser = ticket.created_by ? users.find(u => u.id === ticket.created_by) : null;
    const assignedUser = ticket.assigned_to ? users.find(u => u.id === ticket.assigned_to) : null;
    
    return {
      ...ticket,
      service_type: service ? service.service_type : null,
      client_name: client ? client.name : null,
      created_by_name: createdByUser ? createdByUser.username : null,
      assigned_to_name: assignedUser ? assignedUser.username : null
    };
  });
}

const canAccessTicket = (ticket, user) => {
  if (user.role === 'member') {
    return ticket.assigned_to === user.id;
  }
  return true;
};

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const isMember = req.user.role === 'member';
    const statement = isMember
      ? db.prepare('SELECT * FROM tickets WHERE assigned_to = ? ORDER BY created_at DESC')
      : db.prepare('SELECT * FROM tickets ORDER BY created_at DESC');
    const tickets = isMember ? await statement.all(req.user.id) : await statement.all();
    const enriched = await enrichTickets(tickets);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tickets' });
  }
});

// Get single ticket with comments
router.get('/:id', async (req, res) => {
  try {
    const ticket = await db.prepare('SELECT * FROM tickets WHERE id = ?').get(parseInt(req.params.id));

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ error: 'Not authorized to view this ticket' });
    }

    const enrichedTickets = await enrichTickets([ticket]);
    const enrichedTicket = enrichedTickets[0];
    
    const comments = await db.prepare('SELECT * FROM ticket_comments WHERE ticket_id = ? ORDER BY created_at ASC').all(parseInt(req.params.id));
    const users = await db.getData('/users');
    const enrichedComments = comments.map(comment => {
      const user = users.find(u => u.id === comment.user_id);
      return {
        ...comment,
        user_name: user ? user.username : null
      };
    });

    res.json({ ...enrichedTicket, comments: enrichedComments });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ticket' });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  if (req.user.role === 'member') {
    return res.status(403).json({ error: 'Members cannot create tickets' });
  }
  const { service_id, title, description, status = 'open', priority = 'medium', assigned_to } = req.body;

  if (!service_id || !title) {
    return res.status(400).json({ error: 'Service ID and title are required' });
  }

  try {
    const result = await db.prepare(`
      INSERT INTO tickets (service_id, title, description, status, priority, created_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(service_id, title, description || null, status, priority, req.user.id, assigned_to || null);

    const ticket = await db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);
    const enriched = await enrichTickets([ticket]);
    res.status(201).json(enriched[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating ticket' });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  const { title, description, status, priority, assigned_to } = req.body;

  try {
    const ticket = await db.prepare('SELECT * FROM tickets WHERE id = ?').get(parseInt(req.params.id));
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ error: 'Not authorized to update this ticket' });
    }

    // Handle resolved_at for MySQL
    if ((status === 'resolved' || status === 'closed') && !ticket.resolved_at) {
      await db.prepare(`
        UPDATE tickets
        SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP, resolved_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, description, status, priority, assigned_to, parseInt(req.params.id));
    } else {
      await db.prepare(`
        UPDATE tickets
        SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, description, status, priority, assigned_to, parseInt(req.params.id));
    }

    const updatedTicket = await db.prepare('SELECT * FROM tickets WHERE id = ?').get(parseInt(req.params.id));
    const enriched = await enrichTickets([updatedTicket]);
    res.json(enriched[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating ticket' });
  }
});

// Add comment to ticket
router.post('/:id/comments', async (req, res) => {
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  try {
    const ticket = await db.prepare('SELECT * FROM tickets WHERE id = ?').get(parseInt(req.params.id));
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ error: 'Not authorized to comment on this ticket' });
    }

    const result = await db.prepare(`
      INSERT INTO ticket_comments (ticket_id, user_id, comment)
      VALUES (?, ?, ?)
    `).run(parseInt(req.params.id), req.user.id, comment);

    const comments = await db.prepare('SELECT * FROM ticket_comments WHERE id = ?').get(result.lastInsertRowid);
    const users = await db.getData('/users');
    const user = users.find(u => u.id === comments.user_id);
    
    res.status(201).json({
      ...comments,
      user_name: user ? user.username : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  if (req.user.role === 'member') {
    return res.status(403).json({ error: 'Members cannot delete tickets' });
  }
  try {
    const result = await db.prepare('DELETE FROM tickets WHERE id = ?').run(parseInt(req.params.id));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting ticket' });
  }
});

module.exports = router;
