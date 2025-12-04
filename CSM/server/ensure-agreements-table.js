const mysql = require('mysql2/promise');
require('dotenv').config();

async function ensureAgreementsTable() {
  console.log('\n=== Ensuring Agreements Table Exists ===\n');
  
  const password = process.env.DB_PASSWORD || 'Agra@123';
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password,
      database: process.env.DB_NAME || 'csm_db'
    });

    console.log('✅ Connected to MySQL database\n');

    // Check if table exists
    const [tables] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'agreements'",
      [process.env.DB_NAME || 'csm_db']
    );

    if (tables[0].count === 0) {
      console.log('Creating agreements table...');
      // Create agreements table with all required columns
      await connection.execute(`
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
      console.log('✅ Agreements table already exists');
      
      // Check if all required columns exist
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'agreements'
      `, [process.env.DB_NAME || 'csm_db']);
      
      const existingColumns = columns.map(c => c.COLUMN_NAME);
      const requiredColumns = [
        { name: 'agreement_draft_approval', type: 'TEXT' },
        { name: 'signed_agreement_upload', type: 'VARCHAR(500)' },
        { name: 'client_kicked_off', type: 'TEXT' },
        { name: 'internal_kickoff', type: 'TEXT' },
        { name: 'sourcing_note', type: 'TEXT' },
        { name: 'recruiter_lead_initiate_sourcing', type: 'TEXT' }
      ];

      let addedColumns = false;
      for (const col of requiredColumns) {
        if (!existingColumns.includes(col.name)) {
          await connection.execute(`ALTER TABLE agreements ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✅ Added column: ${col.name}`);
          addedColumns = true;
        }
      }
      
      if (!addedColumns) {
        console.log('✅ All required columns exist');
      }
    }

    await connection.end();
    console.log('\n=== Complete! ===\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    if (connection) {
      await connection.end().catch(() => {});
    }
    process.exit(1);
  }
}

ensureAgreementsTable();

