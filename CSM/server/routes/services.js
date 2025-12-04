const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Helper function to enrich services with client and user data
async function enrichServices(services) {
  const clients = await db.getData('/clients');
  const users = await db.getData('/users');
  
  return services.map(service => {
    const client = clients.find(c => c.id === service.client_id);
    const assignedUser = service.assigned_to ? users.find(u => u.id === service.assigned_to) : null;
    const createdByUser = service.created_by ? users.find(u => u.id === service.created_by) : null;
    
    return {
      ...service,
      client_name: client ? client.name : null,
      client_email: client ? client.email : null,
      assigned_to_name: assignedUser ? assignedUser.username : null,
      created_by_name: createdByUser ? createdByUser.username : null,
      created_by_role: createdByUser ? createdByUser.role : null
    };
  });
}

// Helper to ensure members only access their assigned data
function memberNotAllowed(res) {
  return res.status(403).json({ error: 'Members are not allowed to perform this action' });
}

// Get all services
router.get('/', async (req, res) => {
  try {
    const isMember = req.user.role === 'member';
    const statement = isMember
      ? db.prepare('SELECT * FROM services WHERE assigned_to = ? ORDER BY created_at DESC')
      : db.prepare('SELECT * FROM services ORDER BY created_at DESC');
    const services = isMember ? await statement.all(req.user.id) : await statement.all();
    const enriched = await enrichServices(services);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching services' });
  }
});

// Get services by client
router.get('/client/:clientId', async (req, res) => {
  try {
    const isMember = req.user.role === 'member';
    const services = await db.prepare('SELECT * FROM services WHERE client_id = ? ORDER BY created_at DESC')
      .all(parseInt(req.params.clientId));
    
    const filtered = isMember
      ? services.filter(service => service.assigned_to === req.user.id)
      : services;
    
    const users = await db.getData('/users');
    const enriched = filtered.map(service => {
      const assignedUser = service.assigned_to ? users.find(u => u.id === service.assigned_to) : null;
      return {
        ...service,
        assigned_to_name: assignedUser ? assignedUser.username : null
      };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching services' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(parseInt(req.params.id));
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    if (req.user.role === 'member' && service.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this service' });
    }
    const enriched = await enrichServices([service]);
    res.json(enriched[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching service' });
  }
});

// Create service
router.post('/', async (req, res) => {
  if (req.user.role === 'member') {
    return memberNotAllowed(res);
  }
  const { client_id, service_type, description, status = 'warm', priority = 'medium', assigned_to } = req.body;

  if (!client_id || !service_type) {
    return res.status(400).json({ error: 'Client ID and service type are required' });
  }

  try {
    const result = await db.prepare(`
      INSERT INTO services (client_id, service_type, description, status, priority, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(client_id, service_type, description || null, status, priority, assigned_to || null);

    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    const enriched = await enrichServices([service]);
    
    // Add creator info
    const creator = await db.prepare('SELECT username, role FROM users WHERE id = ?').get(req.user.id);
    if (creator && enriched[0]) {
      enriched[0].created_by_name = creator.username;
      enriched[0].created_by_role = creator.role;
    }
    
    res.status(201).json(enriched[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating service' });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  if (req.user.role === 'member') {
    return memberNotAllowed(res);
  }
  const { service_type, description, status, priority, assigned_to } = req.body;

  try {
    await db.prepare(`
      UPDATE services
      SET service_type = ?, description = ?, status = ?, priority = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(service_type, description, status, priority, assigned_to, parseInt(req.params.id));

    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(parseInt(req.params.id));
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    const enriched = await enrichServices([service]);
    res.json(enriched[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating service' });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  if (req.user.role === 'member') {
    return memberNotAllowed(res);
  }
  try {
    const result = await db.prepare('DELETE FROM services WHERE id = ?').run(parseInt(req.params.id));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting service' });
  }
});

module.exports = router;
