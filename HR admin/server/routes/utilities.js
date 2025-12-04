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

// Get all office utilities
router.get('/', async (req, res) => {
  try {
    const utilities = await dbAll(
      `SELECT u.*, v.vendor_name 
      FROM office_utilities u 
      LEFT JOIN vendors v ON u.vendor_id = v.id 
      ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: utilities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single utility by ID
router.get('/:id', async (req, res) => {
  try {
    const utility = await dbGet(
      `SELECT u.*, v.vendor_name 
      FROM office_utilities u 
      LEFT JOIN vendors v ON u.vendor_id = v.id 
      WHERE u.id = ?`,
      [req.params.id]
    );
    if (utility) {
      res.json({ success: true, data: utility });
    } else {
      res.status(404).json({ success: false, error: 'Utility not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new utility request
router.post('/', async (req, res) => {
  try {
    const { utility_type, vendor_id, employee_name, department, description, request_date, status, amount, due_date } = req.body;
    
    console.log('Received data:', JSON.stringify({ utility_type, vendor_id, employee_name, department, description, request_date, status, amount, due_date }, null, 2)); // Debug log
    
    // Validate required fields
    if (!employee_name || employee_name === '' || (typeof employee_name === 'string' && !employee_name.trim())) {
      console.log('Validation failed: Employee Name is missing or empty. Value:', employee_name, 'Type:', typeof employee_name);
      return res.status(400).json({ success: false, error: 'Employee Name is required' });
    }
    if (!department || department === '' || (typeof department === 'string' && !department.trim())) {
      console.log('Validation failed: Department is missing or empty. Value:', department, 'Type:', typeof department);
      return res.status(400).json({ success: false, error: 'Department is required' });
    }
    
    const employeeNameValue = String(employee_name).trim();
    const departmentValue = String(department).trim();
    
    console.log('Inserting with values:', { employeeNameValue, departmentValue, employeeNameLength: employeeNameValue.length, departmentLength: departmentValue.length }); // Debug log
    
    const result = await dbRun(
      `INSERT INTO office_utilities 
      (utility_type, vendor_id, employee_name, department, description, request_date, status, amount, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        utility_type, 
        vendor_id || null, 
        employeeNameValue, 
        departmentValue, 
        description || null, 
        request_date, 
        status || 'pending', 
        amount || 0, 
        due_date || null
      ]
    );
    
    console.log('Insert result:', result); // Debug log
    
    const newUtility = await dbGet(
      `SELECT u.*, v.vendor_name 
      FROM office_utilities u 
      LEFT JOIN vendors v ON u.vendor_id = v.id 
      WHERE u.id = ?`,
      [result.lastID]
    );
    
    console.log('Created utility record:', JSON.stringify(newUtility, null, 2)); // Debug log
    console.log('Employee Name in created record:', newUtility?.employee_name);
    console.log('Department in created record:', newUtility?.department);
    
    res.status(201).json({ success: true, data: newUtility });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update utility
router.put('/:id', async (req, res) => {
  try {
    const { utility_type, vendor_id, employee_name, department, description, request_date, status, amount, due_date, paid_date, item_received, item_received_date } = req.body;
    
    // Validate required fields
    if (!employee_name || !employee_name.trim()) {
      return res.status(400).json({ success: false, error: 'Employee Name is required' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, error: 'Department is required' });
    }
    
    await dbRun(
      `UPDATE office_utilities 
      SET utility_type = ?, vendor_id = ?, employee_name = ?, department = ?, description = ?, request_date = ?, 
          status = ?, amount = ?, due_date = ?, paid_date = ?, 
          item_received = ?, item_received_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        utility_type, 
        vendor_id || null, 
        employee_name.trim(), 
        department.trim(), 
        description || null, 
        request_date, 
        status, 
        amount || 0, 
        due_date || null, 
        paid_date || null, 
        item_received !== undefined ? item_received : null, 
        item_received_date || null, 
        req.params.id
      ]
    );
    
    const updatedUtility = await dbGet(
      `SELECT u.*, v.vendor_name 
      FROM office_utilities u 
      LEFT JOIN vendors v ON u.vendor_id = v.id 
      WHERE u.id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: updatedUtility });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete utility
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM office_utilities WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Utility deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
