const express = require('express');
const router = express.Router();
const db = require('../database');

// Helper functions
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    database.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Generate unique ticket number
function generateTicketNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TKT-${timestamp}-${random}`;
}

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const { status, vendor_id, utility_id } = req.query;
    let sql = `SELECT t.*, v.vendor_name, u.utility_type, u.description as utility_description, u.employee_name, u.department
               FROM tickets t 
               LEFT JOIN vendors v ON t.vendor_id = v.id 
               LEFT JOIN office_utilities u ON t.utility_id = u.id
               WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (vendor_id) {
      sql += ' AND t.vendor_id = ?';
      params.push(vendor_id);
    }

    if (utility_id) {
      sql += ' AND t.utility_id = ?';
      params.push(utility_id);
    }

    sql += ' ORDER BY t.created_at DESC';

    const tickets = await dbAll(sql, params);
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await dbGet(
      `SELECT t.*, v.vendor_name, u.utility_type, u.description as utility_description, u.employee_name, u.department
       FROM tickets t 
       LEFT JOIN vendors v ON t.vendor_id = v.id 
       LEFT JOIN office_utilities u ON t.utility_id = u.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (ticket) {
      res.json({ success: true, data: ticket });
    } else {
      res.status(404).json({ success: false, error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new ticket
router.post('/', async (req, res) => {
  try {
    const { vendor_id, utility_id, title, description, priority, raised_by, assigned_to } = req.body;
    
    const ticket_number = generateTicketNumber();
    
    const result = await dbRun(
      `INSERT INTO tickets 
      (ticket_number, vendor_id, utility_id, title, description, priority, status, raised_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
      [ticket_number, vendor_id || null, utility_id || null, title, description, priority || 'medium', raised_by || 'Admin', assigned_to || 'CEO']
    );
    
    // Update vendor record to reflect ticket raised
    if (vendor_id) {
      await dbRun(
        `UPDATE vendors 
         SET ticket_raised = 1, ticket_id = ?, ticket_status = 'open', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [ticket_number, vendor_id]
      );
    }
    
    // Update utility record to reflect ticket raised
    if (utility_id) {
      try {
        const updateResult = await dbRun(
          `UPDATE office_utilities 
           SET ticket_raised = 1, ticket_id = ?, ticket_status = 'open', updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [ticket_number, utility_id]
        );
        console.log('Updated utility ticket status:', updateResult);
      } catch (updateError) {
        console.error('Error updating utility ticket status:', updateError);
        // Continue even if update fails - ticket is still created
      }
    }
    
    const newTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [result.lastID]);
    
    // Also return the updated utility if utility_id exists
    let updatedUtility = null;
    if (utility_id) {
      updatedUtility = await dbGet(
        `SELECT u.*, v.vendor_name 
         FROM office_utilities u 
         LEFT JOIN vendors v ON u.vendor_id = v.id 
         WHERE u.id = ?`,
        [utility_id]
      );
    }
    
    res.status(201).json({ 
      success: true, 
      data: newTicket,
      utility: updatedUtility 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, status, assigned_to, resolution_notes } = req.body;
    
    let sql = `UPDATE tickets 
               SET title = ?, description = ?, priority = ?, status = ?, 
                   assigned_to = ?, updated_at = CURRENT_TIMESTAMP`;
    const params = [title, description, priority, status, assigned_to];
    
    if (resolution_notes) {
      sql += ', resolution_notes = ?';
      params.push(resolution_notes);
    }
    
    if (status === 'closed' || status === 'resolved') {
      sql += ', closed_at = CURRENT_TIMESTAMP';
      // Update vendor ticket status
      const ticket = await dbGet('SELECT vendor_id, utility_id, ticket_number FROM tickets WHERE id = ?', [req.params.id]);
      if (ticket && ticket.vendor_id) {
        await dbRun(
          `UPDATE vendors 
           SET ticket_status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [status === 'closed' ? 'closed' : 'resolved', ticket.vendor_id]
        );
      }
      // Update utility ticket status
      if (ticket && ticket.utility_id) {
        await dbRun(
          `UPDATE office_utilities 
           SET ticket_status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [status === 'closed' ? 'closed' : 'resolved', ticket.utility_id]
        );
      }
    }
    
    sql += ' WHERE id = ?';
    params.push(req.params.id);
    
    await dbRun(sql, params);
    
    const updatedTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Close ticket
router.post('/:id/close', async (req, res) => {
  try {
    const { resolution_notes } = req.body;
    
    await dbRun(
      `UPDATE tickets 
       SET status = 'closed', resolution_notes = ?, closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [resolution_notes || 'Ticket closed', req.params.id]
    );
    
    // Update vendor ticket status
    const ticket = await dbGet('SELECT vendor_id, utility_id FROM tickets WHERE id = ?', [req.params.id]);
    if (ticket && ticket.vendor_id) {
      await dbRun(
        `UPDATE vendors 
         SET ticket_status = 'closed', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [ticket.vendor_id]
      );
    }
    // Update utility ticket status
    if (ticket && ticket.utility_id) {
      await dbRun(
        `UPDATE office_utilities 
         SET ticket_status = 'closed', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [ticket.utility_id]
      );
    }
    
    const closedTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: closedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve ticket
router.post('/:id/resolve', async (req, res) => {
  try {
    const { resolution_notes } = req.body;
    
    await dbRun(
      `UPDATE tickets 
       SET status = 'resolved', resolution_notes = ?, closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [resolution_notes || 'Ticket resolved', req.params.id]
    );
    
    // Update vendor ticket status
    const ticket = await dbGet('SELECT vendor_id, utility_id FROM tickets WHERE id = ?', [req.params.id]);
    if (ticket && ticket.vendor_id) {
      await dbRun(
        `UPDATE vendors 
         SET ticket_status = 'resolved', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [ticket.vendor_id]
      );
    }
    // Update utility ticket status
    if (ticket && ticket.utility_id) {
      await dbRun(
        `UPDATE office_utilities 
         SET ticket_status = 'resolved', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [ticket.utility_id]
      );
    }
    
    const resolvedTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: resolvedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

