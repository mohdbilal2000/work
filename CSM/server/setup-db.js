const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  try {
    // First, connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'csm_db'}`);
    console.log('✅ Database created/verified');
    
    // Switch to the database
    await connection.execute(`USE ${process.env.DB_NAME || 'csm_db'}`);
    
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*') && !s.toLowerCase().includes('create database'));
      
      for (const statement of statements) {
        if (statement && !statement.toLowerCase().includes('use ')) {
          try {
            await connection.execute(statement);
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.warn('Schema warning:', err.message);
            }
          }
        }
      }
      console.log('✅ Tables created/verified');
    }
    
    // Check if admin user exists
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await connection.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@csm.com', hash, 'admin']
      );
      console.log('✅ Admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    await connection.end();
    console.log('\n✅ Database setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      await connection.end().catch(() => {});
    }
    return false;
  }
}

setupDatabase();

