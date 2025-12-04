const connection = require('./connection');
const pool = connection.pool;
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const jsonDbPath = path.join(__dirname, 'csm.json');

function ensureJsonDefaults() {
  try {
    const defaultStructure = {
      users: [],
      clients: [],
      services: [],
      tickets: [],
      ticket_comments: []
    };
    const data = fs.existsSync(jsonDbPath)
      ? JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'))
      : defaultStructure;

    const getNextId = () => {
      const ids = data.users.map((u) => u.id || 0);
      return ids.length ? Math.max(...ids) + 1 : 1;
    };

    const ensureUser = (username, email, password, role) => {
      const exists = data.users.find((u) => u.username === username);
      if (!exists) {
        data.users.push({
          id: getNextId(),
          username,
          email,
          password: bcrypt.hashSync(password, 10),
          role,
          created_at: new Date().toISOString()
        });
        return true;
      }
      return false;
    };

    let updated = false;
    updated = ensureUser('admin', 'admin@csm.com', 'admin123', 'admin') || updated;
    updated = ensureUser('ritika.csm', 'ritika@csm.com', 'ritika@123', 'member') || updated;
    updated = ensureUser('deepti.csm', 'deepti@csm.com', 'deepti@123', 'member') || updated;

    if (updated) {
      fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
      console.log('✅ JSON user store updated with default accounts');
    }
  } catch (error) {
    console.error('Error ensuring JSON defaults:', error.message);
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    if (!pool) {
      console.warn('MySQL pool not available, skipping database initialization');
      return;
    }
    
    // Check if agreements table exists, if not create it
    const [agreementsTable] = await pool.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'agreements'"
    );

    if (agreementsTable[0].count === 0) {
      // Create agreements table with all required columns
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS agreements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          client_id INT NOT NULL,
          agreement_type VARCHAR(100) NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          start_date DATE,
          end_date DATE,
          status VARCHAR(20) DEFAULT 'active',
          amount DECIMAL(10, 2),
          terms TEXT,
          agreement_draft_approval TEXT,
          signed_agreement_upload VARCHAR(500),
          client_kicked_off TEXT,
          internal_kickoff TEXT,
          sourcing_note TEXT,
          recruiter_lead_initiate_sourcing TEXT,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_client_id (client_id),
          INDEX idx_status (status),
          INDEX idx_created_by (created_by)
        )
      `);
      console.log('✅ Agreements table created successfully');
    } else {
      // Check if all required columns exist, add missing ones
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'agreements'
      `);
      
      const existingColumns = columns.map(c => c.COLUMN_NAME);
      const requiredColumns = [
        { name: 'agreement_draft_approval', type: 'TEXT' },
        { name: 'signed_agreement_upload', type: 'VARCHAR(500)' },
        { name: 'client_kicked_off', type: 'TEXT' },
        { name: 'internal_kickoff', type: 'TEXT' },
        { name: 'sourcing_note', type: 'TEXT' },
        { name: 'recruiter_lead_initiate_sourcing', type: 'TEXT' }
      ];

      for (const col of requiredColumns) {
        if (!existingColumns.includes(col.name)) {
          await pool.execute(`ALTER TABLE agreements ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✅ Added column to agreements table: ${col.name}`);
        }
      }
    }

    // Check if other tables exist, if not create them
    const [tables] = await pool.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('users', 'clients', 'services', 'tickets', 'ticket_comments')"
    );

    if (tables[0].count === 0) {
      // Tables don't exist, create them
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        console.error('Schema file not found:', schemaPath);
        throw new Error('Schema file not found');
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema SQL statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
      
      for (const statement of statements) {
        if (statement) {
          try {
            await pool.execute(statement);
          } catch (err) {
            // Ignore errors for CREATE DATABASE IF NOT EXISTS and USE statements
            if (!err.message.includes('database') && !err.message.includes('USE')) {
              console.warn('Schema statement warning:', err.message);
            }
          }
        }
      }
      console.log('Database tables created successfully');
    }

    // Create induction table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS induction (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_name VARCHAR(100) NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        department VARCHAR(100),
        designation VARCHAR(100),
        joining_date DATE,
        induction_date DATE,
        induction_status VARCHAR(20) DEFAULT 'pending',
        trainer_name VARCHAR(100),
        training_topics TEXT,
        documents_submitted BOOLEAN DEFAULT FALSE,
        id_card_issued BOOLEAN DEFAULT FALSE,
        system_access_granted BOOLEAN DEFAULT FALSE,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id),
        INDEX idx_induction_status (induction_status)
      )
    `);
    console.log('✅ Induction table ready');

    // Initialize default users
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      await pool.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@csm.com', defaultPassword, 'admin']
      );
      console.log('Default admin user created: username=admin, password=admin123');
    }

    const defaultMembers = [
      { username: 'ritika.csm', email: 'ritika@csm.com', password: 'ritika@123' },
      { username: 'deepti.csm', email: 'deepti@csm.com', password: 'deepti@123' }
    ];

    for (const member of defaultMembers) {
      const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [member.username]);
      if (existing.length === 0) {
        const hashed = bcrypt.hashSync(member.password, 10);
        await pool.execute(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [member.username, member.email, hashed, 'member']
        );
        console.log(`Default member created: username=${member.username}, password=${member.password}`);
      }
    }

  } catch (error) {
    console.error('Error initializing database:', error.message);
    // Don't throw - allow server to start even if DB init fails
    // The connection test will catch it
  }

  ensureJsonDefaults();
}

// Initialize on module load
initializeDatabase().catch(console.error);

// Wrapper to match SQLite-like API for compatibility
const dbWrapper = {
  prepare: (query) => {
    return {
      get: async (...params) => {
        try {
          if (!pool) {
            console.error('MySQL pool not available');
            return undefined;
          }
          const [rows] = await pool.execute(query, params);
          return rows[0] || undefined;
        } catch (error) {
          console.error('Database query error:', error.message);
          return undefined;
        }
      },
      all: async (...params) => {
        try {
          if (!pool) {
            console.error('MySQL pool not available');
            return [];
          }
          const [rows] = await pool.execute(query, params);
          return rows;
        } catch (error) {
          console.error('Database query error:', error.message);
          return [];
        }
      },
      run: async (...params) => {
        try {
          if (!pool) {
            console.error('MySQL pool not available');
            return { changes: 0, lastInsertRowid: null };
          }
          // For INSERT queries, we need to get the last insert ID
          if (query.includes('INSERT INTO')) {
            const [result] = await pool.execute(query, params);
            return {
              lastInsertRowid: result.insertId,
              changes: result.affectedRows
            };
          }
          // For UPDATE and DELETE queries
          const [result] = await pool.execute(query, params);
          return {
            changes: result.affectedRows,
            lastInsertRowid: result.insertId || null
          };
        } catch (error) {
          console.error('Database query error:', error.message);
          return { changes: 0, lastInsertRowid: null };
        }
      }
    };
  },
  exec: async (sql) => {
    try {
      if (!pool) {
        console.error('MySQL pool not available');
        return;
      }
      await pool.execute(sql);
    } catch (error) {
      console.error('Database exec error:', error);
    }
  },
  // Helper function to get raw data (for compatibility with existing routes)
  getData: async (path) => {
    try {
      if (!pool) {
        if (fs.existsSync(jsonDbPath)) {
          const data = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
          if (path === '/users') return data.users || [];
          if (path === '/clients') return data.clients || [];
          if (path === '/services') return data.services || [];
          if (path === '/tickets') return data.tickets || [];
          if (path === '/ticket_comments') return data.ticket_comments || [];
          if (path === '/agreements') return data.agreements || [];
        }
        console.error('MySQL pool not available');
        return [];
      }
      if (path === '/users') {
        const [rows] = await pool.execute('SELECT * FROM users');
        return rows;
      } else if (path === '/clients') {
        const [rows] = await pool.execute('SELECT * FROM clients');
        return rows;
      } else if (path === '/services') {
        const [rows] = await pool.execute('SELECT * FROM services');
        return rows;
      } else if (path === '/tickets') {
        const [rows] = await pool.execute('SELECT * FROM tickets');
        return rows;
      } else if (path === '/ticket_comments') {
        const [rows] = await pool.execute('SELECT * FROM ticket_comments');
        return rows;
      } else if (path === '/agreements') {
        const [rows] = await pool.execute('SELECT * FROM agreements');
        return rows;
      }
      return [];
    } catch (error) {
      console.error('Database getData error:', error.message);
      return [];
    }
  }
};

// Direct query method for simpler usage
dbWrapper.query = async (sql, params = []) => {
  try {
    if (!pool) {
      console.error('MySQL pool not available');
      return [];
    }
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

module.exports = dbWrapper;
