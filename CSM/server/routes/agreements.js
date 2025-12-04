const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads - Draft Agreements
const draftStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/draft-agreements');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'draft-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for file uploads - Signed Agreements
const signedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/signed-agreements');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'signed-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for file uploads - Sourcing Notes
const sourcingNoteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/sourcing-notes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sourcing-note-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype === 'application/msword' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.mimetype === 'text/plain';
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
  }
};

const uploadDraft = multer({
  storage: draftStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

const uploadSigned = multer({
  storage: signedStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

const uploadSourcingNote = multer({
  storage: sourcingNoteStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// All routes require authentication
router.use(authenticateToken);

// Helper function to enrich agreements with client data
async function enrichAgreements(agreements) {
  const clients = await db.getData('/clients');
  const users = await db.getData('/users');
  
  return agreements.map(agreement => {
    const client = clients.find(c => c.id === agreement.client_id);
    const createdByUser = agreement.created_by ? users.find(u => u.id === agreement.created_by) : null;
    
    return {
      ...agreement,
      client_name: client ? client.name : null,
      client_email: client ? client.email : null,
      created_by_name: createdByUser ? createdByUser.username : null,
      created_by_role: createdByUser ? createdByUser.role : null
    };
  });
}

// Get all agreements
router.get('/', async (req, res) => {
  try {
    const pool = require('../database/db').pool;
    const [agreements] = await pool.execute('SELECT * FROM agreements ORDER BY created_at DESC');
    const enriched = await enrichAgreements(agreements);
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching agreements:', error);
    res.status(500).json({ error: 'Error fetching agreements' });
  }
});

// Get single agreement
router.get('/:id', async (req, res) => {
  try {
    const agreement = await db.prepare('SELECT * FROM agreements WHERE id = ?').get(parseInt(req.params.id));
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    const enriched = await enrichAgreements([agreement]);
    res.json(enriched[0]);
  } catch (error) {
    console.error('Error fetching agreement:', error);
    res.status(500).json({ error: 'Error fetching agreement' });
  }
});

// Create agreement
router.post('/', async (req, res) => {
  const { 
    client_id, agreement_type, title, description, start_date, end_date, status = 'active', amount, terms,
    agreement_draft_approval, signed_agreement_upload, client_kicked_off, internal_kickoff, sourcing_note, recruiter_lead_initiate_sourcing
  } = req.body;

  if (!client_id || !agreement_type || !title) {
    return res.status(400).json({ error: 'Client, agreement type, and title are required' });
  }

  try {
    // Handle client_id - it might be a name (string) or an ID (number)
    let actualClientId = client_id;
    
    // If client_id is not a number, try to find the client by name
    if (isNaN(client_id) || (typeof client_id === 'string' && client_id.trim() !== '' && isNaN(parseInt(client_id)))) {
      const clients = await db.getData('/clients');
      const clientName = String(client_id).trim();
      const client = clients.find(c => 
        c.name === clientName || 
        c.name.toLowerCase() === clientName.toLowerCase() ||
        String(c.id) === clientName
      );
      
      if (client) {
        actualClientId = client.id;
      } else {
        // Client doesn't exist, create a new one
        const pool = require('../database/db').pool;
        try {
          const [newClientResult] = await pool.execute(
            'INSERT INTO clients (name, email, status) VALUES (?, ?, ?)',
            [clientName, `${clientName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}@example.com`, 'active']
          );
          actualClientId = newClientResult.insertId;
          console.log(`Created new client: ${clientName} with ID: ${actualClientId}`);
        } catch (clientError) {
          console.error('Error creating client:', clientError);
          // Try to find by ID if it was a string number
          const numericId = parseInt(clientName);
          if (!isNaN(numericId)) {
            actualClientId = numericId;
          } else {
            throw new Error(`Could not create or find client: ${clientName}`);
          }
        }
      }
    } else {
      // It's already a number, use it directly
      actualClientId = parseInt(client_id);
    }

    // Verify client exists before inserting
    const pool = require('../database/db').pool;
    const [clientCheck] = await pool.execute('SELECT id FROM clients WHERE id = ?', [actualClientId]);
    if (clientCheck.length === 0) {
      throw new Error(`Client with ID ${actualClientId} does not exist`);
    }

    const result = await db.prepare(`
      INSERT INTO agreements (client_id, agreement_type, title, description, start_date, end_date, status, amount, terms, 
        agreement_draft_approval, signed_agreement_upload, client_kicked_off, internal_kickoff, sourcing_note, recruiter_lead_initiate_sourcing, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      actualClientId,
      agreement_type,
      title,
      description || null,
      start_date || null,
      end_date || null,
      status || 'active',
      amount || null,
      terms || null,
      agreement_draft_approval || null,
      signed_agreement_upload || null,
      client_kicked_off || null,
      internal_kickoff || null,
      sourcing_note || null,
      recruiter_lead_initiate_sourcing || null,
      req.user ? req.user.id : null
    );

    if (!result || !result.lastInsertRowid) {
      throw new Error('Failed to create agreement - no insert ID returned');
    }

    const agreement = await db.prepare('SELECT * FROM agreements WHERE id = ?').get(result.lastInsertRowid);
    if (!agreement) {
      throw new Error('Failed to retrieve created agreement');
    }
    const enriched = await enrichAgreements([agreement]);
    res.status(201).json(enriched[0]);
  } catch (error) {
    console.error('Error creating agreement:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      error: 'Error creating agreement: ' + (error.message || 'Unknown error'),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update agreement
router.put('/:id', async (req, res) => {
  const { 
    client_id, agreement_type, title, description, start_date, end_date, status, amount, terms,
    agreement_draft_approval, signed_agreement_upload, client_kicked_off, internal_kickoff, sourcing_note, recruiter_lead_initiate_sourcing
  } = req.body;

  try {
    await db.prepare(`
      UPDATE agreements
      SET client_id = ?, agreement_type = ?, title = ?, description = ?, start_date = ?, end_date = ?, status = ?, amount = ?, terms = ?,
        agreement_draft_approval = ?, signed_agreement_upload = ?, client_kicked_off = ?, internal_kickoff = ?, sourcing_note = ?, recruiter_lead_initiate_sourcing = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      client_id,
      agreement_type,
      title,
      description,
      start_date,
      end_date,
      status,
      amount,
      terms,
      agreement_draft_approval,
      signed_agreement_upload,
      client_kicked_off,
      internal_kickoff,
      sourcing_note,
      recruiter_lead_initiate_sourcing,
      parseInt(req.params.id)
    );

    const agreement = await db.prepare('SELECT * FROM agreements WHERE id = ?').get(parseInt(req.params.id));
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    const enriched = await enrichAgreements([agreement]);
    res.json(enriched[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating agreement' });
  }
});

// Delete agreement
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM agreements WHERE id = ?').run(parseInt(req.params.id));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    res.json({ message: 'Agreement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting agreement' });
  }
});

// Upload draft agreement file
router.post('/upload-draft', authenticateToken, uploadDraft.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.originalname,
      storedFilename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/draft-agreements/${req.file.filename}`,
      stepId: req.body.stepId,
      stepType: req.body.stepType,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    };

    // Store file info in database (create table if needed)
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS agreement_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          stored_filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INT NOT NULL,
          mime_type VARCHAR(100),
          file_url VARCHAR(500) NOT NULL,
          step_id INT,
          step_type VARCHAR(200),
          uploaded_by INT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `).run();
    } catch (err) {
      // Table might already exist, continue
    }

    const result = await db.prepare(`
      INSERT INTO agreement_files (filename, stored_filename, file_path, file_size, mime_type, file_url, step_id, step_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fileInfo.filename,
      fileInfo.storedFilename,
      fileInfo.path,
      fileInfo.size,
      fileInfo.mimetype,
      fileInfo.url,
      fileInfo.stepId,
      fileInfo.stepType,
      fileInfo.uploadedBy
    );

    fileInfo.id = result.lastInsertRowid;
    res.status(201).json({ 
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Delete uploaded file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error uploading file: ' + error.message });
  }
});

// Upload signed agreement file
router.post('/upload-signed', authenticateToken, uploadSigned.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.originalname,
      storedFilename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/signed-agreements/${req.file.filename}`,
      stepId: req.body.stepId,
      stepType: req.body.stepType,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    };

    // Store file info in database (create table if needed)
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS agreement_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          stored_filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INT NOT NULL,
          mime_type VARCHAR(100),
          file_url VARCHAR(500) NOT NULL,
          step_id INT,
          step_type VARCHAR(200),
          uploaded_by INT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `).run();
    } catch (err) {
      // Table might already exist, continue
    }

    const result = await db.prepare(`
      INSERT INTO agreement_files (filename, stored_filename, file_path, file_size, mime_type, file_url, step_id, step_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fileInfo.filename,
      fileInfo.storedFilename,
      fileInfo.path,
      fileInfo.size,
      fileInfo.mimetype,
      fileInfo.url,
      fileInfo.stepId,
      fileInfo.stepType,
      fileInfo.uploadedBy
    );

    fileInfo.id = result.lastInsertRowid;
    res.status(201).json({ 
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Delete uploaded file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error uploading file: ' + error.message });
  }
});

// Get uploaded draft files
router.get('/draft-files', authenticateToken, async (req, res) => {
  try {
    const stepId = req.query.stepId || 1;
    
    // Create table if it doesn't exist
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS agreement_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          stored_filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INT NOT NULL,
          mime_type VARCHAR(100),
          file_url VARCHAR(500) NOT NULL,
          step_id INT,
          step_type VARCHAR(200),
          uploaded_by INT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `).run();
    } catch (err) {
      // Table might already exist
    }

    const files = await db.prepare(`
      SELECT id, filename, stored_filename, file_size, mime_type, file_url, step_id, step_type, uploaded_at
      FROM agreement_files
      WHERE step_id = ?
      ORDER BY uploaded_at DESC
    `).all(parseInt(stepId));

    // Format files for response
    const formattedFiles = files.map(file => ({
      id: file.id,
      filename: file.filename,
      size: file.file_size,
      url: file.file_url,
      uploadedAt: file.uploaded_at
    }));

    res.json({ files: formattedFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Get uploaded signed files
router.get('/signed-files', authenticateToken, async (req, res) => {
  try {
    const stepId = req.query.stepId || 2;
    
    // Create table if it doesn't exist
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS agreement_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          stored_filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INT NOT NULL,
          mime_type VARCHAR(100),
          file_url VARCHAR(500) NOT NULL,
          step_id INT,
          step_type VARCHAR(200),
          uploaded_by INT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `).run();
    } catch (err) {
      // Table might already exist
    }

    const files = await db.prepare(`
      SELECT id, filename, stored_filename, file_size, mime_type, file_url, step_id, step_type, uploaded_at
      FROM agreement_files
      WHERE step_id = ?
      ORDER BY uploaded_at DESC
    `).all(parseInt(stepId));

    // Format files for response
    const formattedFiles = files.map(file => ({
      id: file.id,
      filename: file.filename,
      size: file.file_size,
      url: file.file_url,
      uploadedAt: file.uploaded_at
    }));

    res.json({ files: formattedFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Mark kickoff as done
router.post('/mark-kickoff-done', authenticateToken, async (req, res) => {
  try {
    const { stepId, stepType } = req.body;
    const userId = req.user.id;

    if (!stepId || (parseInt(stepId) !== 3 && parseInt(stepId) !== 4)) {
      return res.status(400).json({ error: 'Invalid step ID. Only steps 3 and 4 are allowed.' });
    }

    // Create kickoff_status table if it doesn't exist
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS kickoff_status (
          id INT AUTO_INCREMENT PRIMARY KEY,
          step_id INT NOT NULL,
          step_type VARCHAR(200) NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          completed_by INT,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE KEY unique_step (step_id)
        )
      `).run();
    } catch (err) {
      // Table might already exist
    }

    // Check if status already exists
    const existing = await db.prepare(`
      SELECT * FROM kickoff_status WHERE step_id = ?
    `).get(parseInt(stepId));

    let result;
    if (existing) {
      // Update existing status
      result = await db.prepare(`
        UPDATE kickoff_status 
        SET completed = TRUE, completed_by = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE step_id = ?
      `).run(userId, parseInt(stepId));
    } else {
      // Insert new status
      result = await db.prepare(`
        INSERT INTO kickoff_status (step_id, step_type, completed, completed_by, completed_at)
        VALUES (?, ?, TRUE, ?, CURRENT_TIMESTAMP)
      `).run(parseInt(stepId), stepType, userId);
    }

    // Get updated status
    const status = await db.prepare(`
      SELECT ks.*, u.username as completed_by_name
      FROM kickoff_status ks
      LEFT JOIN users u ON ks.completed_by = u.id
      WHERE ks.step_id = ?
    `).get(parseInt(stepId));

    res.json({
      message: 'Kickoff marked as completed successfully',
      status: {
        completed: status.completed,
        completedAt: status.completed_at,
        completedBy: status.completed_by_name || null
      }
    });
  } catch (error) {
    console.error('Error marking kickoff as done:', error);
    res.status(500).json({ error: 'Error marking kickoff as done: ' + error.message });
  }
});

// Get kickoff status
router.get('/kickoff-status', authenticateToken, async (req, res) => {
  try {
    const stepId = req.query.stepId;

    if (!stepId || (parseInt(stepId) !== 3 && parseInt(stepId) !== 4)) {
      return res.status(400).json({ error: 'Invalid step ID. Only steps 3 and 4 are allowed.' });
    }

    // Create table if it doesn't exist
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS kickoff_status (
          id INT AUTO_INCREMENT PRIMARY KEY,
          step_id INT NOT NULL,
          step_type VARCHAR(200) NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          completed_by INT,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE KEY unique_step (step_id)
        )
      `).run();
    } catch (err) {
      // Table might already exist
    }

    const status = await db.prepare(`
      SELECT ks.*, u.username as completed_by_name
      FROM kickoff_status ks
      LEFT JOIN users u ON ks.completed_by = u.id
      WHERE ks.step_id = ?
    `).get(parseInt(stepId));

    if (!status) {
      return res.json({
        status: {
          completed: false,
          completedAt: null,
          completedBy: null
        }
      });
    }

    res.json({
      status: {
        completed: status.completed,
        completedAt: status.completed_at,
        completedBy: status.completed_by_name || null
      }
    });
  } catch (error) {
    console.error('Error fetching kickoff status:', error);
    res.status(500).json({ error: 'Error fetching kickoff status' });
  }
});

// Get action statuses for a step
router.get('/action-statuses', authenticateToken, async (req, res) => {
  try {
    const stepId = req.query.stepId;

    if (!stepId) {
      return res.status(400).json({ error: 'Step ID is required' });
    }

    // Create table if it doesn't exist
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS action_statuses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          step_id INT NOT NULL,
          action_index INT NOT NULL,
          action_text VARCHAR(500) NOT NULL,
          completed TINYINT(1) DEFAULT 0,
          completed_by INT,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE KEY unique_action (step_id, action_index)
        )
      `).run();
    } catch (err) {
      console.error('Error creating action_statuses table:', err);
      // Table might already exist, continue
    }

    const statuses = await db.prepare(`
      SELECT step_id, action_index, action_text, completed, completed_at
      FROM action_statuses
      WHERE step_id = ?
      ORDER BY action_index ASC
    `).all(parseInt(stepId));

    // Convert TINYINT(1) to boolean for frontend
    const formattedStatuses = (statuses || []).map(status => ({
      ...status,
      completed: status.completed === 1 || status.completed === true
    }));

    res.json({ statuses: formattedStatuses });
  } catch (error) {
    console.error('Error fetching action statuses:', error);
    res.status(500).json({ error: 'Error fetching action statuses: ' + error.message });
  }
});

// Toggle action status
router.post('/toggle-action', authenticateToken, async (req, res) => {
  try {
    const { stepId, actionIndex, actionText, completed } = req.body;
    const userId = req.user.id;

    if (!stepId || actionIndex === undefined) {
      return res.status(400).json({ error: 'Step ID and action index are required' });
    }

    // Create table if it doesn't exist
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS action_statuses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          step_id INT NOT NULL,
          action_index INT NOT NULL,
          action_text VARCHAR(500) NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          completed_by INT,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE KEY unique_action (step_id, action_index)
        )
      `).run();
    } catch (err) {
      // Table might already exist
    }

    // Check if status already exists
    const existing = await db.prepare(`
      SELECT * FROM action_statuses WHERE step_id = ? AND action_index = ?
    `).get(parseInt(stepId), parseInt(actionIndex));

    if (existing) {
      // Update existing status
      const updateResult = await db.prepare(`
        UPDATE action_statuses 
        SET completed = ?, completed_by = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE step_id = ? AND action_index = ?
      `).run(
        completed ? 1 : 0,
        completed ? userId : null,
        completed ? new Date() : null,
        parseInt(stepId),
        parseInt(actionIndex)
      );
      
      if (updateResult.changes === 0) {
        throw new Error('Failed to update action status');
      }
    } else {
      // Insert new status
      const insertResult = await db.prepare(`
        INSERT INTO action_statuses (step_id, action_index, action_text, completed, completed_by, completed_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        parseInt(stepId),
        parseInt(actionIndex),
        actionText || '',
        completed ? 1 : 0,
        completed ? userId : null,
        completed ? new Date() : null
      );
      
      if (!insertResult.lastInsertRowid) {
        throw new Error('Failed to insert action status');
      }
    }

    res.json({
      message: 'Action status updated successfully',
      stepId: parseInt(stepId),
      actionIndex: parseInt(actionIndex),
      completed: completed
    });
  } catch (error) {
    console.error('Error toggling action status:', error);
    res.status(500).json({ 
      error: 'Error updating action status: ' + (error.message || 'Unknown error'),
      details: error.message
    });
  }
});

// Upload sourcing note file
router.post('/upload-sourcing-note', authenticateToken, uploadSourcingNote.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.originalname,
      storedFilename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/sourcing-notes/${req.file.filename}`,
      stepId: req.body.stepId,
      stepType: req.body.stepType,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    };

    // Store file info in database (create table if needed)
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS agreement_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          stored_filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INT NOT NULL,
          mime_type VARCHAR(100),
          file_url VARCHAR(500) NOT NULL,
          step_id INT,
          step_type VARCHAR(200),
          uploaded_by INT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `).run();
    } catch (err) {
      // Table might already exist, continue
    }

    const result = await db.prepare(`
      INSERT INTO agreement_files (filename, stored_filename, file_path, file_size, mime_type, file_url, step_id, step_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fileInfo.filename,
      fileInfo.storedFilename,
      fileInfo.path,
      fileInfo.size,
      fileInfo.mimetype,
      fileInfo.url,
      fileInfo.stepId,
      fileInfo.stepType,
      fileInfo.uploadedBy
    );

    fileInfo.id = result.lastInsertRowid;
    res.status(201).json({ 
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Delete uploaded file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error uploading file: ' + error.message });
  }
});

// Get uploaded sourcing note files
router.get('/sourcing-note-files', authenticateToken, async (req, res) => {
  try {
    const stepId = req.query.stepId || 5;
    
    // Create table if it doesn't exist
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS agreement_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          stored_filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INT NOT NULL,
          mime_type VARCHAR(100),
          file_url VARCHAR(500) NOT NULL,
          step_id INT,
          step_type VARCHAR(200),
          uploaded_by INT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `).run();
    } catch (err) {
      // Table might already exist
    }

    const files = await db.prepare(`
      SELECT id, filename, stored_filename, file_size, mime_type, file_url, step_id, step_type, uploaded_at
      FROM agreement_files
      WHERE step_id = ?
      ORDER BY uploaded_at DESC
    `).all(parseInt(stepId));

    // Format files for response
    const formattedFiles = files.map(file => ({
      id: file.id,
      filename: file.filename,
      size: file.file_size,
      url: file.file_url,
      uploadedAt: file.uploaded_at
    }));

    res.json({ files: formattedFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});

module.exports = router;

