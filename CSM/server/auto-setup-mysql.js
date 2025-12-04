const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('\n=== MySQL Database Auto Setup ===\n');
  
  // Try common passwords or empty
  const passwordsToTry = [
    process.env.DB_PASSWORD || '',
    'root',
    'password',
    'admin',
    '123456',
    ''
  ];
  
  let connection;
  let connected = false;
  let usedPassword = '';
  
  for (const password of passwordsToTry) {
    try {
      console.log(`Trying to connect${password ? ' with password' : ' without password'}...`);
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: password,
        connectTimeout: 2000
      });
      
      console.log('✅ Connected to MySQL server!');
      connected = true;
      usedPassword = password;
      break;
    } catch (error) {
      // Continue to next password
      continue;
    }
  }
  
  if (!connected) {
    console.error('\n❌ Could not connect to MySQL with common passwords.');
    console.error('\n💡 Please run the interactive setup:');
    console.error('   node setup-mysql-complete.js');
    console.error('\n💡 Or manually set up:');
    console.error('   1. Open MySQL Command Line');
    console.error('   2. Run: CREATE DATABASE csm_db;');
    console.error('   3. Update .env file with your MySQL password');
    console.error('   4. Restart the backend server');
    return false;
  }
  
  try {
    // Create database
    const dbName = process.env.DB_NAME || 'csm_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/verified`);
    
    // Switch to database
    await connection.execute(`USE ${dbName}`);
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Creating tables...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => 
          s.length > 0 && 
          !s.startsWith('--') && 
          !s.startsWith('/*') &&
          !s.toLowerCase().includes('create database') &&
          !s.toLowerCase().includes('use ')
        );
      
      for (const statement of statements) {
        if (statement) {
          try {
            await connection.execute(statement);
          } catch (err) {
            if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
              // Ignore table already exists errors
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
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Update .env file with password
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    } else {
      envContent = `PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=csm_db
JWT_SECRET=csm-secret-key-change-in-production
`;
    }
    
    // Update password in .env
    const lines = envContent.split('\n');
    let passwordUpdated = false;
    const updatedLines = lines.map(line => {
      if (line.startsWith('DB_PASSWORD=')) {
        passwordUpdated = true;
        return `DB_PASSWORD=${usedPassword}`;
      }
      return line;
    });
    
    if (!passwordUpdated) {
      // Find DB_USER line and add password after it
      const newLines = [];
      for (let i = 0; i < updatedLines.length; i++) {
        newLines.push(updatedLines[i]);
        if (updatedLines[i].startsWith('DB_USER=')) {
          newLines.push(`DB_PASSWORD=${usedPassword}`);
        }
      }
      if (!updatedLines.some(l => l.startsWith('DB_USER='))) {
        newLines.push(`DB_PASSWORD=${usedPassword}`);
      }
      fs.writeFileSync(envPath, newLines.join('\n'));
    } else {
      fs.writeFileSync(envPath, updatedLines.join('\n'));
    }
    
    await connection.end();
    
    console.log('\n=== Setup Complete! ===\n');
    console.log('Login credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\n✅ Database is ready!');
    console.log('✅ You can now login to the application.\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    if (connection) {
      await connection.end().catch(() => {});
    }
    return false;
  }
}

setupDatabase();

