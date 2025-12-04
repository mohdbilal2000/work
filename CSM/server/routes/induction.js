const express = require('express');
const router = express.Router();
const inductionDb = require('../database/inductionDb');

// Initialize database on first load
let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await inductionDb.init();
    dbInitialized = true;
  }
}

// Get all induction records
router.get('/', async (req, res) => {
  try {
    await ensureDb();
    const records = await inductionDb.dbAll('SELECT * FROM induction ORDER BY created_at DESC');
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching induction records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single induction record
router.get('/:id', async (req, res) => {
  try {
    await ensureDb();
    const record = await inductionDb.dbGet('SELECT * FROM induction WHERE id = ?', [req.params.id]);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error fetching induction record:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new induction record
router.post('/', async (req, res) => {
  try {
    await ensureDb();
    const {
      employee_name,
      employee_id,
      department,
      designation,
      joining_date,
      induction_date,
      induction_status,
      trainer_name,
      training_topics,
      documents_submitted,
      id_card_issued,
      system_access_granted,
      remarks
    } = req.body;

    const result = await inductionDb.dbRun(
      `INSERT INTO induction 
      (employee_name, employee_id, department, designation, joining_date, induction_date, 
       induction_status, trainer_name, training_topics, documents_submitted, id_card_issued, 
       system_access_granted, remarks, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        employee_name,
        employee_id,
        department || '',
        designation || '',
        joining_date || null,
        induction_date || null,
        induction_status || 'pending',
        trainer_name || '',
        training_topics || '',
        documents_submitted ? 1 : 0,
        id_card_issued ? 1 : 0,
        system_access_granted ? 1 : 0,
        remarks || ''
      ]
    );

    res.status(201).json({ 
      success: true, 
      data: { id: result.lastID, ...req.body }
    });
  } catch (error) {
    console.error('Error creating induction record:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update induction record
router.put('/:id', async (req, res) => {
  try {
    await ensureDb();
    const {
      employee_name,
      employee_id,
      department,
      designation,
      joining_date,
      induction_date,
      induction_status,
      trainer_name,
      training_topics,
      documents_submitted,
      id_card_issued,
      system_access_granted,
      remarks
    } = req.body;

    await inductionDb.dbRun(
      `UPDATE induction SET 
       employee_name = ?, employee_id = ?, department = ?, designation = ?,
       joining_date = ?, induction_date = ?, induction_status = ?, trainer_name = ?,
       training_topics = ?, documents_submitted = ?, id_card_issued = ?,
       system_access_granted = ?, remarks = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        employee_name,
        employee_id,
        department || '',
        designation || '',
        joining_date || null,
        induction_date || null,
        induction_status || 'pending',
        trainer_name || '',
        training_topics || '',
        documents_submitted ? 1 : 0,
        id_card_issued ? 1 : 0,
        system_access_granted ? 1 : 0,
        remarks || '',
        req.params.id
      ]
    );

    res.json({ success: true, data: { id: req.params.id, ...req.body } });
  } catch (error) {
    console.error('Error updating induction record:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete induction record
router.delete('/:id', async (req, res) => {
  try {
    await ensureDb();
    await inductionDb.dbRun('DELETE FROM induction WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting induction record:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Receive enrollment from CSO and create induction record
router.post('/cso-enroll', async (req, res) => {
  try {
    await ensureDb();
    const {
      candidateId,
      employeeName,
      email,
      phone,
      position,
      esicStatus,
      pfStatus,
      tdsStatus,
      medicalStatus
    } = req.body;

    // Generate employee ID from candidate ID
    const employeeId = `CSO-${candidateId}`;

    // Check if record already exists for this candidate
    const existing = await inductionDb.dbGet('SELECT * FROM induction WHERE employee_id = ?', [employeeId]);
    
    // Create enrollments list for remarks
    const enrollments = [];
    if (esicStatus) enrollments.push('ESIC');
    if (pfStatus) enrollments.push('PF');
    if (tdsStatus) enrollments.push('TDS');
    if (medicalStatus) enrollments.push('Medical Insurance');

    const remarks = `Enrolled for: ${enrollments.join(', ')}. Contact: ${email}, ${phone}`;

    if (existing) {
      // Update existing record with enrollment info
      await inductionDb.dbRun(
        `UPDATE induction SET remarks = ?, updated_at = datetime('now') WHERE employee_id = ?`,
        [remarks, employeeId]
      );
      
      return res.json({ 
        success: true, 
        message: 'Induction record updated',
        data: { id: existing.id, status: 'updated' }
      });
    }

    // Create new induction record
    const result = await inductionDb.dbRun(
      `INSERT INTO induction 
      (employee_name, employee_id, department, designation, joining_date, induction_date, 
       induction_status, trainer_name, training_topics, documents_submitted, id_card_issued, 
       system_access_granted, remarks, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        employeeName,
        employeeId,
        'From CSO',
        position || '',
        new Date().toISOString().split('T')[0], // Today as joining date
        null,
        'pending',
        '',
        'Pending induction training',
        0,
        0,
        0,
        remarks
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Induction record created from CSO enrollment',
      data: { id: result.lastID, status: 'created' }
    });
  } catch (error) {
    console.error('CSO Enrollment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
