const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'invoices');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: vendorId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `invoice_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow PDF, images, and documents
    const allowedExtensions = /\.(pdf|jpg|jpeg|png|gif|bmp|webp|doc|docx|xls|xlsx|txt)$/i;
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    const extname = allowedExtensions.test(path.extname(file.originalname));
    const mimetype = allowedMimeTypes.includes(file.mimetype) || 
                     file.mimetype.startsWith('image/') ||
                     file.mimetype.includes('pdf') ||
                     file.mimetype.includes('document') ||
                     file.mimetype.includes('spreadsheet');
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: PDF, JPG, JPEG, PNG, GIF, BMP, WEBP, DOC, DOCX, XLS, XLSX, TXT`));
    }
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload route (before other routes) - with error handling for multer
app.post('/api/vendors/:id/upload-invoice', (req, res, next) => {
  upload.single('invoice')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request params:', req.params);
    console.log('Request file:', req.file ? 'File received' : 'No file');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const vendorId = parseInt(req.params.id);
    if (!vendorId || isNaN(vendorId)) {
      return res.status(400).json({ success: false, error: 'Invalid vendor ID' });
    }

    const filePath = `/uploads/invoices/${req.file.filename}`;
    const originalFileName = req.file.originalname;

    console.log('Uploading invoice for vendor:', vendorId);
    console.log('File:', originalFileName, 'Size:', req.file.size);
    console.log('File path:', filePath);

    // Get database instance
    const database = db.getDb();
    if (!database) {
      console.error('Database not initialized');
      return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    
    const dbRun = (sql, params) => {
      return new Promise((resolve, reject) => {
        database.run(sql, params, function(err) {
          if (err) {
            console.error('Database run error:', err);
            console.error('SQL:', sql);
            console.error('Params:', params);
            reject(err);
          } else {
            console.log('Database update successful, changes:', this.changes);
            resolve({ lastID: this.lastID, changes: this.changes });
          }
        });
      });
    };

    const dbGet = (sql, params) => {
      return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
          if (err) {
            console.error('Database get error:', err);
            console.error('SQL:', sql);
            console.error('Params:', params);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    };

    // Check if vendor exists first
    const existingVendor = await dbGet('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    if (!existingVendor) {
      console.error('Vendor not found:', vendorId);
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    console.log('Updating vendor in database...');
    
    // Try to update with invoice_original_name, if column doesn't exist, update without it
    try {
      await dbRun(
        `UPDATE vendors 
         SET invoice_uploaded = 1, 
             invoice_file_path = ?,
             invoice_original_name = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [filePath, originalFileName, vendorId]
      );
    } catch (updateError) {
      // If invoice_original_name column doesn't exist, update without it
      if (updateError.message.includes('no such column: invoice_original_name')) {
        console.log('invoice_original_name column not found, updating without it');
        await dbRun(
          `UPDATE vendors 
           SET invoice_uploaded = 1, 
               invoice_file_path = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [filePath, vendorId]
        );
        // Try to add the column for future use
        try {
          await dbRun('ALTER TABLE vendors ADD COLUMN invoice_original_name TEXT', []);
          // Update again with the original name
          await dbRun(
            `UPDATE vendors 
             SET invoice_original_name = ?
             WHERE id = ?`,
            [originalFileName, vendorId]
          );
        } catch (alterError) {
          console.log('Could not add invoice_original_name column:', alterError.message);
        }
      } else {
        throw updateError;
      }
    }

    console.log('Fetching updated vendor...');
    const updatedVendor = await dbGet('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    
    if (!updatedVendor) {
      console.error('Vendor not found after update');
      return res.status(404).json({ success: false, error: 'Vendor not found after update' });
    }

    console.log('Invoice upload successful');
    res.json({ 
      success: true, 
      data: updatedVendor,
      file: {
        path: filePath,
        originalName: originalFileName,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading invoice:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload invoice',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Routes (will be available after DB init)
app.use('/api/esic', require('./routes/esic'));
app.use('/api/pf', require('./routes/pf'));
app.use('/api/tds', require('./routes/tds'));
app.use('/api/medical-insurance', require('./routes/medicalInsurance'));
app.use('/api/interior-payroll', require('./routes/interiorPayroll'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/utilities', require('./routes/utilities'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/cso', require('./routes/cso-enrollment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HR Admin Portal API is running' });
});

// Initialize database first, then start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});

