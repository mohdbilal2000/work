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

// Get all medical insurance records
router.get('/', async (req, res) => {
  try {
    const records = await dbAll('SELECT * FROM medical_insurance ORDER BY created_at DESC');
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await dbGet('SELECT * FROM medical_insurance WHERE id = ?', [req.params.id]);
    if (record) {
      res.json({ success: true, data: record });
    } else {
      res.status(404).json({ success: false, error: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new medical insurance record
router.post('/', async (req, res) => {
  try {
    const { 
      employee_id, 
      employee_name, 
      policy_number, 
      insurance_provider, 
      policy_type, 
      coverage_amount, 
      premium_amount, 
      policy_start_date, 
      policy_end_date, 
      payment_status, 
      payment_date, 
      status 
    } = req.body;
    
    const result = await dbRun(
      `INSERT INTO medical_insurance 
      (employee_id, employee_name, policy_number, insurance_provider, policy_type, coverage_amount, premium_amount, policy_start_date, policy_end_date, payment_status, payment_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id, 
        employee_name, 
        policy_number, 
        insurance_provider, 
        policy_type, 
        coverage_amount, 
        premium_amount, 
        policy_start_date, 
        policy_end_date, 
        payment_status || 'pending', 
        payment_date, 
        status || 'active'
      ]
    );
    
    const newRecord = await dbGet('SELECT * FROM medical_insurance WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update medical insurance record
router.put('/:id', async (req, res) => {
  try {
    const { 
      employee_id, 
      employee_name, 
      policy_number, 
      insurance_provider, 
      policy_type, 
      coverage_amount, 
      premium_amount, 
      policy_start_date, 
      policy_end_date, 
      payment_status, 
      payment_date, 
      status 
    } = req.body;
    
    await dbRun(
      `UPDATE medical_insurance 
      SET employee_id = ?, employee_name = ?, policy_number = ?, insurance_provider = ?, 
          policy_type = ?, coverage_amount = ?, premium_amount = ?, policy_start_date = ?, 
          policy_end_date = ?, payment_status = ?, payment_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        employee_id, 
        employee_name, 
        policy_number, 
        insurance_provider, 
        policy_type, 
        coverage_amount, 
        premium_amount, 
        policy_start_date, 
        policy_end_date, 
        payment_status, 
        payment_date, 
        status, 
        req.params.id
      ]
    );
    
    const updatedRecord = await dbGet('SELECT * FROM medical_insurance WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete medical insurance record
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM medical_insurance WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


