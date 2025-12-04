const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    
    // Enrich with creator information if available
    const enrichedClients = await Promise.all(clients.map(async (client) => {
      // Note: clients table doesn't have created_by column yet, but we can add it in future
      // For now, we'll just return the client as-is
      return client;
    }));
    
    res.json(enrichedClients);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clients' });
  }
});

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const client = await db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching client' });
  }
});

// Create client
router.post('/', async (req, res) => {
  const { name, email, phone, company, address, status = 'active' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // Track who created the client (if created_by column exists, otherwise just create)
    const result = await db.prepare(`
      INSERT INTO clients (name, email, phone, company, address, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, phone || null, company || null, address || null, status);

    const client = await db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    
    // Add creator info if available
    const creator = await db.prepare('SELECT username, role FROM users WHERE id = ?').get(req.user.id);
    if (creator) {
      client.created_by_name = creator.username;
      client.created_by_role = creator.role;
    }
    
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error creating client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  const { name, email, phone, company, address, status } = req.body;

  try {
    await db.prepare(`
      UPDATE clients
      SET name = ?, email = ?, phone = ?, company = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, phone, company, address, status, req.params.id);

    const client = await db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error updating client' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting client' });
  }
});

// Export clients to CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const clients = await db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    
    // Create CSV header
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Address', 'Status', 'Created At', 'Updated At'];
    const csvRows = [headers.join(',')];
    
    // Add data rows
    clients.forEach(client => {
      const row = [
        client.id || '',
        `"${(client.name || '').replace(/"/g, '""')}"`,
        `"${(client.email || '').replace(/"/g, '""')}"`,
        `"${(client.phone || '').replace(/"/g, '""')}"`,
        `"${(client.company || '').replace(/"/g, '""')}"`,
        `"${(client.address || '').replace(/"/g, '""')}"`,
        client.status || '',
        client.created_at || '',
        client.updated_at || ''
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const filename = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting clients to CSV:', error);
    res.status(500).json({ error: 'Error exporting clients to CSV' });
  }
});

// Export clients to Excel (JSON format that can be opened in Excel)
router.get('/export/excel', authenticateToken, async (req, res) => {
  try {
    const clients = await db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    
    // Convert to Excel-compatible JSON format
    const excelData = clients.map(client => ({
      'ID': client.id,
      'Name': client.name,
      'Email': client.email,
      'Phone': client.phone || '',
      'Company': client.company || '',
      'Address': client.address || '',
      'Status': client.status,
      'Created At': client.created_at,
      'Updated At': client.updated_at
    }));
    
    const filename = `clients_export_${new Date().toISOString().split('T')[0]}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(excelData);
  } catch (error) {
    console.error('Error exporting clients to Excel:', error);
    res.status(500).json({ error: 'Error exporting clients to Excel' });
  }
});

module.exports = router;

