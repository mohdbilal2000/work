const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('\n=== MySQL Database Setup ===\n');
  
  // Get password from .env or prompt
  let password = process.env.DB_PASSWORD || '';
  
  if (!password) {
    console.log('MySQL root password is required.');
    console.log('(Leave empty if no password is set)\n');
    password = await question('Enter MySQL root password: ');
  }
  
  let connection;
  try {
    // First connect without database to create it
    console.log('\nConnecting to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password
    });
    
    console.log('✅ Connected to MySQL server');
    
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
            if (!err.message.includes('already exists')) {
              console.warn(`Warning: ${err.message}`);
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
    
    // Update .env file with password if it was entered
    if (password && !process.env.DB_PASSWORD) {
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
      const updatedLines = lines.map(line => {
        if (line.startsWith('DB_PASSWORD=')) {
          return `DB_PASSWORD=${password}`;
        }
        return line;
      });
      
      if (!envContent.includes('DB_PASSWORD=')) {
        updatedLines.push(`DB_PASSWORD=${password}`);
      }
      
      fs.writeFileSync(envPath, updatedLines.join('\n'));
      console.log('✅ .env file updated with password');
    }
    
    await connection.end();
    
    console.log('\n=== Setup Complete! ===\n');
    console.log('Login credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\n✅ Database is ready!');
    console.log('✅ You can now login to the application.\n');
    
    rl.close();
    return true;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Possible reasons:');
      console.error('   1. Wrong password');
      console.error('   2. MySQL root user doesn\'t have permissions');
      console.error('\n💡 To reset MySQL root password:');
      console.error('   1. Stop MySQL: net stop MySQL80');
      console.error('   2. Start in safe mode: mysqld --skip-grant-tables');
      console.error('   3. Connect and reset password');
    }
    
    if (connection) {
      await connection.end().catch(() => {});
    }
    rl.close();
    return false;
  }
}

setupDatabase();

