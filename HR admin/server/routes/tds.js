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

// Get all TDS records
router.get('/', async (req, res) => {
  try {
    const records = await dbAll('SELECT * FROM tds_compliance ORDER BY created_at DESC');
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await dbGet('SELECT * FROM tds_compliance WHERE id = ?', [req.params.id]);
    if (record) {
      res.json({ success: true, data: record });
    } else {
      res.status(404).json({ success: false, error: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new TDS record
router.post('/', async (req, res) => {
  try {
    const { employee_id, employee_name, pan_number, salary_amount, tds_amount, tds_rate, financial_year, status } = req.body;
    
    const result = await dbRun(
      `INSERT INTO tds_compliance 
      (employee_id, employee_name, pan_number, salary_amount, tds_amount, tds_rate, financial_year, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, employee_name, pan_number, salary_amount, tds_amount, tds_rate, financial_year, status || 'active']
    );
    
    const newRecord = await dbGet('SELECT * FROM tds_compliance WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update TDS record
router.put('/:id', async (req, res) => {
  try {
    const { employee_id, employee_name, pan_number, salary_amount, tds_amount, tds_rate, financial_year, status } = req.body;
    
    await dbRun(
      `UPDATE tds_compliance 
      SET employee_id = ?, employee_name = ?, pan_number = ?, 
          salary_amount = ?, tds_amount = ?, tds_rate = ?, financial_year = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [employee_id, employee_name, pan_number, salary_amount, tds_amount, tds_rate, financial_year, status, req.params.id]
    );
    
    const updatedRecord = await dbGet('SELECT * FROM tds_compliance WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete TDS record
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM tds_compliance WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

