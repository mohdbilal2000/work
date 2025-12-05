#!/usr/bin/env node
/**
 * Startup script for Defitex Portal
 * Runs Prisma migrations before starting the server
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Defitex Portal...\n');

// Navigate to finance directory and run Prisma migrations
const financePath = path.join(__dirname, 'finance');
const prismaSchemaPath = path.join(financePath, 'prisma', 'schema.prisma');

if (fs.existsSync(prismaSchemaPath)) {
  console.log('📦 Running Prisma migrations...');
  
  try {
    process.chdir(financePath);
    
    console.log('   Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('   Deploying database migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations deployed successfully!\n');
    } catch (migrationError) {
      console.log('⚠️  Migration failed, but continuing...');
      console.log('   Error:', migrationError.message);
      console.log('   Make sure DATABASE_URL is set in environment variables.\n');
    }
    
    process.chdir(__dirname);
  } catch (error) {
    console.log('⚠️  Prisma setup failed, but continuing...');
    console.log('   Error:', error.message);
    process.chdir(__dirname);
  }
} else {
  console.log('⚠️  Prisma schema not found, skipping migrations...\n');
}

// Start the main server
console.log('🌐 Starting Express gateway server...\n');
require('./server.js');

