const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool with error handling
let pool;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'csm_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
} catch (error) {
  console.error('Error creating MySQL pool:', error.message);
  pool = null;
}

// Test connection
async function testConnection() {
  try {
    if (!pool) {
      console.warn('⚠️  MySQL pool not initialized. Please check your MySQL server and .env configuration.');
      return false;
    }
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MySQL database:', error.message);
    console.error('💡 Make sure MySQL server is running and the database "csm_db" exists.');
    console.error('💡 You can create it with: CREATE DATABASE csm_db;');
    return false;
  }
}

module.exports = { pool, testConnection };

