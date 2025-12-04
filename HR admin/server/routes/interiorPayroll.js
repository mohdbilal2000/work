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

// Get all interior payroll records
router.get('/', async (req, res) => {
  try {
    const { pay_month, pay_year, department, payment_status } = req.query;
    let sql = 'SELECT * FROM interior_payroll WHERE 1=1';
    const params = [];

    if (pay_month) {
      sql += ' AND pay_month = ?';
      params.push(pay_month);
    }
    if (pay_year) {
      sql += ' AND pay_year = ?';
      params.push(pay_year);
    }
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    if (payment_status) {
      sql += ' AND payment_status = ?';
      params.push(payment_status);
    }

    sql += ' ORDER BY pay_year DESC, pay_month DESC, created_at DESC';

    const records = await dbAll(sql, params);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await dbGet('SELECT * FROM interior_payroll WHERE id = ?', [req.params.id]);
    if (record) {
      res.json({ success: true, data: record });
    } else {
      res.status(404).json({ success: false, error: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new interior payroll record
router.post('/', async (req, res) => {
  try {
    const { 
      employee_id, 
      employee_name, 
      department, 
      designation, 
      pay_period, 
      pay_month, 
      pay_year, 
      basic_salary, 
      allowances, 
      deductions, 
      net_salary, 
      payment_status, 
      payment_date, 
      payment_method, 
      bank_account, 
      ifsc_code, 
      remarks, 
      status 
    } = req.body;
    
    // Calculate net salary if not provided
    const calculatedNetSalary = net_salary || ((basic_salary || 0) + (allowances || 0) - (deductions || 0));
    
    const result = await dbRun(
      `INSERT INTO interior_payroll 
      (employee_id, employee_name, department, designation, pay_period, pay_month, pay_year, 
       basic_salary, allowances, deductions, net_salary, payment_status, payment_date, 
       payment_method, bank_account, ifsc_code, remarks, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id, 
        employee_name, 
        department || null, 
        designation || null, 
        pay_period || null, 
        pay_month || null, 
        pay_year || null, 
        basic_salary || 0, 
        allowances || 0, 
        deductions || 0, 
        calculatedNetSalary, 
        payment_status || 'pending', 
        payment_date || null, 
        payment_method || null, 
        bank_account || null, 
        ifsc_code || null, 
        remarks || null, 
        status || 'active'
      ]
    );
    
    const newRecord = await dbGet('SELECT * FROM interior_payroll WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update interior payroll record
router.put('/:id', async (req, res) => {
  try {
    const { 
      employee_id, 
      employee_name, 
      department, 
      designation, 
      pay_period, 
      pay_month, 
      pay_year, 
      basic_salary, 
      allowances, 
      deductions, 
      net_salary, 
      payment_status, 
      payment_date, 
      payment_method, 
      bank_account, 
      ifsc_code, 
      remarks, 
      status 
    } = req.body;
    
    // Calculate net salary if not provided
    const calculatedNetSalary = net_salary || ((basic_salary || 0) + (allowances || 0) - (deductions || 0));
    
    await dbRun(
      `UPDATE interior_payroll 
      SET employee_id = ?, employee_name = ?, department = ?, designation = ?, pay_period = ?, 
          pay_month = ?, pay_year = ?, basic_salary = ?, allowances = ?, deductions = ?, 
          net_salary = ?, payment_status = ?, payment_date = ?, payment_method = ?, 
          bank_account = ?, ifsc_code = ?, remarks = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        employee_id, 
        employee_name, 
        department || null, 
        designation || null, 
        pay_period || null, 
        pay_month || null, 
        pay_year || null, 
        basic_salary || 0, 
        allowances || 0, 
        deductions || 0, 
        calculatedNetSalary, 
        payment_status || 'pending', 
        payment_date || null, 
        payment_method || null, 
        bank_account || null, 
        ifsc_code || null, 
        remarks || null, 
        status || 'active', 
        req.params.id
      ]
    );
    
    const updatedRecord = await dbGet('SELECT * FROM interior_payroll WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete interior payroll record
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM interior_payroll WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


