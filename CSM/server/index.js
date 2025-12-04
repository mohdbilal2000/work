const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Induction routes (uses JSON database, always works)
app.use('/api/induction', require('./routes/induction'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Try to load MySQL-dependent routes
let mysqlConnected = false;
try {
  const db = require('./database/db');
  const { testConnection } = require('./database/connection');
  
  // Routes that need MySQL
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/agreements', require('./routes/agreements'));
  app.use('/api/clients', require('./routes/clients'));
  app.use('/api/services', require('./routes/services'));
  app.use('/api/tickets', require('./routes/tickets'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  
  // Test connection
  testConnection().then(connected => {
    mysqlConnected = connected;
  });
} catch (error) {
  console.warn('⚠️  MySQL routes not loaded:', error.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`✅ Induction API is ready (uses JSON database)`);
  if (!mysqlConnected) {
    console.warn(`⚠️  MySQL not connected - some features may not work`);
  }
});

