const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createMembers() {
  console.log('\n=== Creating Member Accounts ===\n');
  
  const password = process.env.DB_PASSWORD || 'Agra@123';
  
  const members = [
    {
      username: 'ritka.kashyap',
      email: 'ritka.kashyap@csm.com',
      password: 'ritka123',
      name: 'Ritka Kashyap'
    },
    {
      username: 'deepti.chauhan',
      email: 'deepti.chauhan@csm.com',
      password: 'deepti123',
      name: 'Deepti Chauhan'
    }
  ];

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password,
      database: process.env.DB_NAME || 'csm_db'
    });

    console.log('✅ Connected to MySQL database\n');

    for (const member of members) {
      try {
        // Check if user already exists
        const [existing] = await connection.execute(
          'SELECT * FROM users WHERE username = ? OR email = ?',
          [member.username, member.email]
        );

        if (existing.length > 0) {
          console.log(`⚠️  ${member.name} already exists (username: ${member.username})`);
          continue;
        }

        // Create user
        const hashedPassword = bcrypt.hashSync(member.password, 10);
        await connection.execute(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [member.username, member.email, hashedPassword, 'member']
        );

        console.log(`✅ Created account for ${member.name}`);
        console.log(`   Username: ${member.username}`);
        console.log(`   Email: ${member.email}`);
        console.log(`   Password: ${member.password}`);
        console.log(`   Role: member\n`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === 1062) {
          console.log(`⚠️  ${member.name} already exists`);
        } else {
          console.error(`❌ Error creating ${member.name}:`, error.message);
        }
      }
    }

    await connection.end();
    console.log('=== Complete! ===\n');
    console.log('Members can now login at: http://localhost:3000/member-login\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (connection) {
      await connection.end().catch(() => {});
    }
  }
}

createMembers();

