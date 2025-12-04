const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'hr_admin.db');
let db = null;

function init() {
  return new Promise((resolve, reject) => {
    // Create database file if it doesn't exist
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err);
        }
      });
      
      // Create tables
      createTables()
        .then(() => {
          console.log('✅ Database initialized at:', dbPath);
          resolve(db);
        })
        .catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS esic_compliance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        employer_name TEXT,
        esic_number TEXT,
        monthly_contribution REAL,
        employer_contribution REAL,
        payment_status TEXT DEFAULT 'pending',
        payment_date DATE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS pf_compliance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        pf_number TEXT,
        uan_number TEXT,
        monthly_contribution REAL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS tds_compliance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        pan_number TEXT,
        salary_amount REAL,
        tds_amount REAL,
        tds_rate TEXT,
        financial_year TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS medical_insurance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        policy_number TEXT,
        insurance_provider TEXT,
        policy_type TEXT,
        coverage_amount REAL,
        premium_amount REAL,
        policy_start_date DATE,
        policy_end_date DATE,
        payment_status TEXT DEFAULT 'pending',
        payment_date DATE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS interior_payroll (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        designation TEXT,
        pay_period TEXT,
        pay_month TEXT,
        pay_year TEXT,
        basic_salary REAL,
        allowances REAL DEFAULT 0,
        deductions REAL DEFAULT 0,
        net_salary REAL,
        payment_status TEXT DEFAULT 'pending',
        payment_date DATE,
        payment_method TEXT,
        bank_account TEXT,
        ifsc_code TEXT,
        remarks TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        service_type TEXT,
        contract_start_date DATE,
        contract_end_date DATE,
        invoice_uploaded INTEGER DEFAULT 0,
        invoice_file_path TEXT,
        invoice_original_name TEXT,
        ticket_raised INTEGER DEFAULT 0,
        ticket_id TEXT,
        ticket_status TEXT DEFAULT 'pending',
        ceo_approved INTEGER DEFAULT 0,
        ceo_approval_date DATE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS office_utilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utility_type TEXT NOT NULL,
        vendor_id INTEGER,
        employee_name TEXT,
        department TEXT,
        description TEXT,
        request_date DATE DEFAULT CURRENT_DATE,
        status TEXT DEFAULT 'pending',
        amount REAL,
        due_date DATE,
        paid_date DATE,
        item_received INTEGER DEFAULT 0,
        item_received_date DATE,
        ticket_raised INTEGER DEFAULT 0,
        ticket_id TEXT,
        ticket_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      )`,
      `CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number TEXT UNIQUE NOT NULL,
        vendor_id INTEGER,
        utility_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        raised_by TEXT,
        assigned_to TEXT DEFAULT 'CEO',
        resolution_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id),
        FOREIGN KEY (utility_id) REFERENCES office_utilities(id)
      )`,
      `CREATE TABLE IF NOT EXISTS dashboard_stats (
        id INTEGER PRIMARY KEY,
        total_employees INTEGER DEFAULT 0,
        active_vendors INTEGER DEFAULT 0,
        pending_utilities INTEGER DEFAULT 0,
        total_compliance_records INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    tables.forEach((sql) => {
      db.run(sql, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }
        completed++;
        if (completed === tables.length) {
          // Add new columns to existing esic_compliance table if they don't exist
          db.run('ALTER TABLE esic_compliance ADD COLUMN employer_name TEXT', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE esic_compliance ADD COLUMN employer_contribution REAL', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE esic_compliance ADD COLUMN payment_status TEXT DEFAULT "pending"', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE esic_compliance ADD COLUMN payment_date DATE', (err) => {
            // Ignore error if column already exists
          });
          // Migrate old payment_done to payment_status if exists
          db.run('UPDATE esic_compliance SET payment_status = CASE WHEN payment_done = 1 THEN "paid" ELSE "pending" END WHERE payment_status IS NULL', (err) => {
            // Ignore error
          });
          // Add new columns to tds_compliance table if they don't exist
          db.run('ALTER TABLE tds_compliance ADD COLUMN salary_amount REAL', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE tds_compliance ADD COLUMN tds_rate TEXT', (err) => {
            // Ignore error if column already exists
          });
          
          // Medical insurance table is created above, no migration needed
          
          // Add new columns to vendors table if they don't exist
          db.run('ALTER TABLE vendors ADD COLUMN invoice_uploaded INTEGER DEFAULT 0', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE vendors ADD COLUMN invoice_file_path TEXT', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE vendors ADD COLUMN invoice_original_name TEXT', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE vendors ADD COLUMN ticket_raised INTEGER DEFAULT 0', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE vendors ADD COLUMN ticket_id TEXT', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE vendors ADD COLUMN ticket_status TEXT DEFAULT "pending"', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE vendors ADD COLUMN ceo_approved INTEGER DEFAULT 0', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE vendors ADD COLUMN ceo_approval_date DATE', (err) => {
            // Ignore error if column already exists
          });
          
          // Add new columns to office_utilities table if they don't exist
          db.run('ALTER TABLE office_utilities ADD COLUMN ticket_raised INTEGER DEFAULT 0', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE office_utilities ADD COLUMN ticket_id TEXT', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE office_utilities ADD COLUMN ticket_status TEXT DEFAULT "pending"', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE office_utilities ADD COLUMN item_received INTEGER DEFAULT 0', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE office_utilities ADD COLUMN item_received_date DATE', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE office_utilities ADD COLUMN employee_name TEXT', (err) => {
            // Ignore error if column already exists
          });
          db.run('ALTER TABLE office_utilities ADD COLUMN department TEXT', (err) => {
            // Ignore error if column already exists
          });
          
          // Interior payroll table is created above, no migration needed
          
          // Add utility_id column to tickets table if it doesn't exist
          db.run('ALTER TABLE tickets ADD COLUMN utility_id INTEGER', (err) => {
            // Ignore error if column already exists
          });
          
          // Insert default dashboard stats if not exists
          db.get('SELECT COUNT(*) as count FROM dashboard_stats', (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            if (row.count === 0) {
              db.run('INSERT INTO dashboard_stats (id) VALUES (1)', (err) => {
                if (err) {
                  reject(err);
                } else {
                  console.log('✅ Database tables created successfully');
                  resolve();
                }
              });
            } else {
              console.log('✅ Database tables created successfully');
              resolve();
            }
          });
        }
      });
    });
  });
}

function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath);
  }
  return db;
}

function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

// Helper function to promisify db methods
function promisify(method, ...args) {
  return new Promise((resolve, reject) => {
    const callback = (err, result) => {
      if (err) reject(err);
      else resolve(result);
    };
    method.apply(db, [...args, callback]);
  });
}

module.exports = {
  init,
  getDb,
  close,
  promisify
};
