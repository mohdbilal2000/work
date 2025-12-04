const express = require('express');
const router = express.Router();
const db = require('../database');

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

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalEmployees = await dbGet('SELECT COUNT(*) as count FROM esicpf_compliance');
    const activeVendors = await dbGet("SELECT COUNT(*) as count FROM vendors WHERE status = 'active'");
    const pendingUtilities = await dbGet("SELECT COUNT(*) as count FROM office_utilities WHERE status = 'pending'");
    const totalCompliance = await dbGet('SELECT COUNT(*) as count FROM esicpf_compliance');
    
    const stats = {
      total_employees: totalEmployees.count,
      active_vendors: activeVendors.count,
      pending_utilities: pendingUtilities.count,
      total_compliance_records: totalCompliance.count
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
