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

// Receive enrollment from CSO and create compliance records
router.post('/enroll', async (req, res) => {
  try {
    const { 
      candidateId,
      employeeName,
      email,
      phone,
      position,
      esicStatus,
      pfStatus,
      tdsStatus,
      medicalStatus,
      panCard,
      aadharCard,
      bankAccountNumber
    } = req.body;

    const results = {
      esic: null,
      pf: null,
      tds: null,
      medical: null
    };

    // Generate employee ID from candidate ID
    const employeeId = `CSO-${candidateId}`;

    // Check if records already exist for this candidate
    const existingEsic = await dbGet('SELECT id FROM esic_compliance WHERE employee_id = ?', [employeeId]);
    const existingPf = await dbGet('SELECT id FROM pf_compliance WHERE employee_id = ?', [employeeId]);
    const existingTds = await dbGet('SELECT id FROM tds_compliance WHERE employee_id = ?', [employeeId]);
    const existingMedical = await dbGet('SELECT id FROM medical_insurance WHERE employee_id = ?', [employeeId]);

    // Create ESIC record if enrolled
    if (esicStatus && !existingEsic) {
      const esicResult = await dbRun(
        `INSERT INTO esic_compliance 
        (employee_id, employee_name, employer_name, esic_number, monthly_contribution, employer_contribution, payment_status, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, employeeName, 'Defitex', '', 0, 0, 'pending', 'active']
      );
      results.esic = { id: esicResult.lastID, status: 'created' };
    } else if (esicStatus && existingEsic) {
      results.esic = { id: existingEsic.id, status: 'already_exists' };
    }

    // Create PF record if enrolled
    if (pfStatus && !existingPf) {
      const pfResult = await dbRun(
        `INSERT INTO pf_compliance 
        (employee_id, employee_name, pf_number, uan_number, monthly_contribution, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [employeeId, employeeName, '', '', 0, 'active']
      );
      results.pf = { id: pfResult.lastID, status: 'created' };
    } else if (pfStatus && existingPf) {
      results.pf = { id: existingPf.id, status: 'already_exists' };
    }

    // Create TDS record if enrolled
    if (tdsStatus && !existingTds) {
      const tdsResult = await dbRun(
        `INSERT INTO tds_compliance 
        (employee_id, employee_name, pan_number, salary_amount, tds_amount, tds_rate, financial_year, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, employeeName, panCard || '', 0, 0, '0%', '2024-25', 'active']
      );
      results.tds = { id: tdsResult.lastID, status: 'created' };
    } else if (tdsStatus && existingTds) {
      results.tds = { id: existingTds.id, status: 'already_exists' };
    }

    // Create Medical Insurance record if enrolled
    if (medicalStatus && !existingMedical) {
      const medicalResult = await dbRun(
        `INSERT INTO medical_insurance 
        (employee_id, employee_name, policy_number, insurance_provider, policy_type, coverage_amount, premium_amount, payment_status, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, employeeName, '', 'Pending Assignment', 'Group Health', 0, 0, 'pending', 'active']
      );
      results.medical = { id: medicalResult.lastID, status: 'created' };
    } else if (medicalStatus && existingMedical) {
      results.medical = { id: existingMedical.id, status: 'already_exists' };
    }

    res.status(201).json({ 
      success: true, 
      message: 'Enrollment records processed successfully',
      data: results 
    });
  } catch (error) {
    console.error('CSO Enrollment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all CSO enrollments (for tracking)
router.get('/enrollments', async (req, res) => {
  try {
    const esicRecords = await dbAll("SELECT * FROM esic_compliance WHERE employee_id LIKE 'CSO-%'");
    const pfRecords = await dbAll("SELECT * FROM pf_compliance WHERE employee_id LIKE 'CSO-%'");
    const tdsRecords = await dbAll("SELECT * FROM tds_compliance WHERE employee_id LIKE 'CSO-%'");
    const medicalRecords = await dbAll("SELECT * FROM medical_insurance WHERE employee_id LIKE 'CSO-%'");
    
    res.json({ 
      success: true, 
      data: {
        esic: esicRecords,
        pf: pfRecords,
        tds: tdsRecords,
        medical: medicalRecords
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

