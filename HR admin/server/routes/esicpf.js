const express = require('express');
const router = express.Router();
const db = require('../database');

// Helper function to promisify db.all
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Helper function to promisify db.get
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper function to promisify db.run
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    database.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Get all ESIC/PF compliance records
router.get('/', async (req, res) => {
  try {
    const records = await dbAll('SELECT * FROM esicpf_compliance ORDER BY created_at DESC');
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await dbGet('SELECT * FROM esicpf_compliance WHERE id = ?', [req.params.id]);
    if (record) {
      res.json({ success: true, data: record });
    } else {
      res.status(404).json({ success: false, error: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new compliance record
router.post('/', async (req, res) => {
  try {
    const { employee_id, employee_name, esic_number, pf_number, monthly_contribution, status } = req.body;
    
    const result = await dbRun(
      `INSERT INTO esicpf_compliance 
      (employee_id, employee_name, esic_number, pf_number, monthly_contribution, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, employee_name, esic_number, pf_number, monthly_contribution, status || 'active']
    );
    
    const newRecord = await dbGet('SELECT * FROM esicpf_compliance WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update compliance record
router.put('/:id', async (req, res) => {
  try {
    const { employee_id, employee_name, esic_number, pf_number, monthly_contribution, status } = req.body;
    
    await dbRun(
      `UPDATE esicpf_compliance 
      SET employee_id = ?, employee_name = ?, esic_number = ?, pf_number = ?, 
          monthly_contribution = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [employee_id, employee_name, esic_number, pf_number, monthly_contribution, status, req.params.id]
    );
    
    const updatedRecord = await dbGet('SELECT * FROM esicpf_compliance WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete compliance record
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM esicpf_compliance WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
