const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAgreementsTable() {
  console.log('\n=== Adding Agreements Table ===\n');
  
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

    if (tables[0].count > 0) {
      console.log('✅ Agreements table already exists');
    } else {
      // Create agreements table
      await connection.query(`
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
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_client_id (client_id),
          INDEX idx_status (status),
          INDEX idx_created_by (created_by)
        )
      `);
      console.log('✅ Agreements table created successfully');
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

addAgreementsTable();

