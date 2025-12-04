const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get password from command line argument or environment
const password = process.argv[2] || process.env.DB_PASSWORD || '';

if (!password) {
  console.log('\n=== MySQL Database Setup ===\n');
  console.log('Usage: node setup-with-password.js <your-mysql-root-password>');
  console.log('Example: node setup-with-password.js mypassword123\n');
  process.exit(1);
}

async function setupDatabase() {
  console.log('\n=== MySQL Database Setup ===\n');
  console.log('Connecting to MySQL...');
  
  let connection;
  try {
    // First connect without database to create it
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
    await connection.query(`USE ${dbName}`);
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Creating tables...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Use query instead of execute for DDL statements
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
            // Use query for DDL statements (CREATE TABLE, etc.)
            await connection.query(statement);
          } catch (err) {
            // Only show errors that aren't about tables already existing
            if (!err.message.includes('already exists') && 
                !err.message.includes('Duplicate') &&
                !err.message.includes('Table') &&
                !err.message.includes('table')) {
              console.warn(`Warning: ${err.message}`);
            }
          }
        }
      }
      
      // Verify tables were created
      const [tables] = await connection.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name IN ('users', 'clients', 'services', 'tickets', 'ticket_comments')",
        [dbName]
      );
      
      if (tables[0].count >= 5) {
        console.log('✅ Tables created/verified');
      } else {
        console.log(`⚠️  Only ${tables[0].count} tables found. Re-running schema...`);
        // Try creating tables one by one
        const createUsers = `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email)
        )`;
        
        const createClients = `CREATE TABLE IF NOT EXISTS clients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          company VARCHAR(100),
          address TEXT,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_status (status)
        )`;
        
        const createServices = `CREATE TABLE IF NOT EXISTS services (
          id INT AUTO_INCREMENT PRIMARY KEY,
          client_id INT NOT NULL,
          service_type VARCHAR(100) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          priority VARCHAR(20) DEFAULT 'medium',
          assigned_to INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_client_id (client_id),
          INDEX idx_status (status),
          INDEX idx_assigned_to (assigned_to)
        )`;
        
        const createTickets = `CREATE TABLE IF NOT EXISTS tickets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          service_id INT NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'open',
          priority VARCHAR(20) DEFAULT 'medium',
          created_by INT,
          assigned_to INT,
          resolved_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_service_id (service_id),
          INDEX idx_status (status),
          INDEX idx_created_by (created_by),
          INDEX idx_assigned_to (assigned_to)
        )`;
        
        const createComments = `CREATE TABLE IF NOT EXISTS ticket_comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_id INT NOT NULL,
          user_id INT NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_ticket_id (ticket_id),
          INDEX idx_user_id (user_id)
        )`;
        
        await connection.query(createUsers);
        await connection.query(createClients);
        await connection.query(createServices);
        await connection.query(createTickets);
        await connection.query(createComments);
        console.log('✅ Tables created successfully');
      }
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
        return `DB_PASSWORD=${password}`;
      }
      return line;
    });
    
    if (!passwordUpdated) {
      // Add password line after DB_USER
      const newLines = [];
      for (let i = 0; i < updatedLines.length; i++) {
        newLines.push(updatedLines[i]);
        if (updatedLines[i].startsWith('DB_USER=')) {
          newLines.push(`DB_PASSWORD=${password}`);
        }
      }
      fs.writeFileSync(envPath, newLines.join('\n'));
    } else {
      fs.writeFileSync(envPath, updatedLines.join('\n'));
    }
    
    await connection.end();
    
    console.log('\n=== Setup Complete! ===\n');
    console.log('✅ Database is ready!');
    console.log('✅ .env file updated with your MySQL password');
    console.log('\nLogin credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\n✅ You can now login to the application!\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. The password might be incorrect.');
      console.error('💡 Please check your MySQL root password and try again.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Could not connect to MySQL server.');
      console.error('💡 Make sure MySQL service is running: net start MySQL80');
    }
    
    if (connection) {
      await connection.end().catch(() => {});
    }
    return false;
  }
}

setupDatabase();

