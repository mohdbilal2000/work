const express = require('express');
const router = express.Router();
const db = require('../database');

// Helper functions
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    if (!database) {
      reject(new Error('Database not initialized'));
      return;
    }
    database.all(sql, params, (err, rows) => {
      if (err) {
        console.error('dbAll error:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    if (!database) {
      reject(new Error('Database not initialized'));
      return;
    }
    database.get(sql, params, (err, row) => {
      if (err) {
        console.error('dbGet error:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    if (!database) {
      reject(new Error('Database not initialized'));
      return;
    }
    database.run(sql, params, function(err) {
      if (err) {
        console.error('dbRun error:', err);
        console.error('SQL:', sql);
        console.error('Params:', params);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await dbAll('SELECT * FROM vendors ORDER BY created_at DESC');
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await dbGet('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
    if (vendor) {
      res.json({ success: true, data: vendor });
    } else {
      res.status(404).json({ success: false, error: 'Vendor not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new vendor
router.post('/', async (req, res) => {
  try {
    console.log('=== Creating new vendor ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { vendor_name, contact_person, email, phone, address, service_type, contract_start_date, contract_end_date, status } = req.body;
    
    // Validate required fields
    if (!vendor_name || (typeof vendor_name === 'string' && vendor_name.trim() === '')) {
      console.error('Validation failed: Vendor name is required');
      return res.status(400).json({ success: false, error: 'Vendor name is required' });
    }
    
    // Check database connection
    const database = db.getDb();
    if (!database) {
      console.error('Database not initialized');
      return res.status(500).json({ success: false, error: 'Database not initialized. Please restart the server.' });
    }
    
    console.log('Database connection OK');
    console.log('Preparing to insert vendor...');
    
    // Prepare values - handle empty strings as null
    const values = [
      vendor_name ? String(vendor_name).trim() : null,
      contact_person ? String(contact_person).trim() : null,
      email ? String(email).trim() : null,
      phone ? String(phone).trim() : null,
      address ? String(address).trim() : null,
      service_type ? String(service_type).trim() : null,
      contract_start_date || null,
      contract_end_date || null,
      status || 'active'
    ];
    
    console.log('Values to insert:', values);
    
    const result = await dbRun(
      `INSERT INTO vendors 
      (vendor_name, contact_person, email, phone, address, service_type, contract_start_date, contract_end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );
    
    console.log('Vendor inserted successfully, ID:', result.lastID);
    console.log('Rows affected:', result.changes);
    
    if (!result.lastID) {
      console.error('No lastID returned from insert');
      return res.status(500).json({ success: false, error: 'Failed to create vendor - no ID returned' });
    }
    
    const newVendor = await dbGet('SELECT * FROM vendors WHERE id = ?', [result.lastID]);
    
    if (!newVendor) {
      console.error('Vendor not found after creation, ID:', result.lastID);
      return res.status(500).json({ success: false, error: 'Vendor created but could not be retrieved' });
    }
    
    console.log('Vendor created successfully:', newVendor.vendor_name);
    console.log('=== Vendor creation complete ===');
    
    res.status(201).json({ success: true, data: newVendor });
  } catch (error) {
    console.error('=== ERROR CREATING VENDOR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body was:', JSON.stringify(req.body, null, 2));
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create vendor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update vendor
router.put('/:id', async (req, res) => {
  try {
    const { vendor_name, contact_person, email, phone, address, service_type, contract_start_date, contract_end_date, 
            invoice_uploaded, invoice_file_path, invoice_original_name, ticket_raised, ticket_id, ticket_status, ceo_approved, ceo_approval_date, status } = req.body;
    
    // Get existing vendor data first
    const existingVendor = await dbGet('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
    if (!existingVendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    
    // Use provided values or keep existing ones
    // Explicitly convert invoice_uploaded to integer (1 or 0)
    let finalInvoiceUploaded = 0;
    if (invoice_uploaded !== undefined) {
      finalInvoiceUploaded = invoice_uploaded === 1 || invoice_uploaded === true || invoice_uploaded === '1' ? 1 : 0;
    } else {
      finalInvoiceUploaded = existingVendor.invoice_uploaded === 1 || existingVendor.invoice_uploaded === true || existingVendor.invoice_uploaded === '1' ? 1 : 0;
    }
    const finalInvoiceFilePath = invoice_file_path !== undefined ? invoice_file_path : existingVendor.invoice_file_path;
    const finalInvoiceOriginalName = invoice_original_name !== undefined ? invoice_original_name : existingVendor.invoice_original_name;
    const finalTicketRaised = ticket_raised !== undefined ? ticket_raised : (existingVendor.ticket_raised || 0);
    const finalTicketId = ticket_id !== undefined ? ticket_id : existingVendor.ticket_id;
    const finalTicketStatus = ticket_status !== undefined ? ticket_status : (existingVendor.ticket_status || 'pending');
    const finalCeoApproved = ceo_approved !== undefined ? ceo_approved : (existingVendor.ceo_approved || 0);
    const finalCeoApprovalDate = ceo_approval_date !== undefined ? ceo_approval_date : existingVendor.ceo_approval_date;
    
    await dbRun(
      `UPDATE vendors 
      SET vendor_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, 
          service_type = ?, contract_start_date = ?, contract_end_date = ?,
          invoice_uploaded = ?, invoice_file_path = ?, invoice_original_name = ?, ticket_raised = ?, ticket_id = ?, 
          ticket_status = ?, ceo_approved = ?, ceo_approval_date = ?,
          status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        vendor_name || existingVendor.vendor_name,
        contact_person !== undefined ? contact_person : existingVendor.contact_person,
        email !== undefined ? email : existingVendor.email,
        phone !== undefined ? phone : existingVendor.phone,
        address !== undefined ? address : existingVendor.address,
        service_type !== undefined ? service_type : existingVendor.service_type,
        contract_start_date || existingVendor.contract_start_date,
        contract_end_date || existingVendor.contract_end_date,
        finalInvoiceUploaded,
        finalInvoiceFilePath,
        finalInvoiceOriginalName,
        finalTicketRaised,
        finalTicketId,
        finalTicketStatus,
        finalCeoApproved,
        finalCeoApprovalDate,
        status || existingVendor.status,
        req.params.id
      ]
    );
    
    const updatedVendor = await dbGet('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedVendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete vendor
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM vendors WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
