const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAgreementSections() {
  console.log('\n=== Adding Agreement Sections ===\n');
  
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

    // Check if columns exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'agreements' 
      AND COLUMN_NAME IN ('agreement_draft_approval', 'signed_agreement_upload', 'client_kicked_off', 'internal_kickoff', 'sourcing_note', 'recruiter_lead_initiate_sourcing')
    `, [process.env.DB_NAME || 'csm_db']);

    const existingColumns = columns.map(c => c.COLUMN_NAME);
    const columnsToAdd = [
      { name: 'agreement_draft_approval', type: 'TEXT' },
      { name: 'signed_agreement_upload', type: 'VARCHAR(500)' },
      { name: 'client_kicked_off', type: 'TEXT' },
      { name: 'internal_kickoff', type: 'TEXT' },
      { name: 'sourcing_note', type: 'TEXT' },
      { name: 'recruiter_lead_initiate_sourcing', type: 'TEXT' }
    ];

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        await connection.query(`ALTER TABLE agreements ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      } else {
        console.log(`⚠️  Column already exists: ${col.name}`);
      }
    }

    await connection.end();
    console.log('\n=== Complete! ===\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (connection) {
      await connection.end().catch(() => {});
    }
  }
}

addAgreementSections();

