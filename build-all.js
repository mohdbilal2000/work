const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting build process for all Defitex modules...\n');

const modules = [
  {
    name: 'CSO',
    path: 'CSO',
    buildCmd: 'npm run build',
    installFirst: true
  },
  {
    name: 'HR Admin',
    path: path.join('HR admin'),
    buildCmd: 'npm run build',
    installFirst: true
  },
  {
    name: 'CSM Client',
    path: path.join('CSM', 'client'),
    buildCmd: 'npm run build',
    installFirst: true
  },
  {
    name: 'Finance Portal',
    path: 'finance',
    buildCmd: 'npm run build',
    installFirst: true
  }
];

function buildModule(module) {
  const modulePath = path.join(process.cwd(), module.path);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`⚠️  Skipping ${module.name} - directory not found: ${modulePath}`);
    return false;
  }

  console.log(`\n📦 Building ${module.name}...`);
  console.log(`   Path: ${modulePath}\n`);

  try {
    process.chdir(modulePath);

    // Install dependencies if needed
    if (module.installFirst) {
      console.log(`   Installing dependencies for ${module.name}...`);
      execSync('npm install', { stdio: 'inherit' });
    }

    // Run build command
    console.log(`   Running build for ${module.name}...`);
    execSync(module.buildCmd, { stdio: 'inherit' });
    
    console.log(`✅ ${module.name} built successfully!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to build ${module.name}:`, error.message);
    return false;
  } finally {
    process.chdir(process.cwd().split(path.sep).slice(0, -module.path.split(path.sep).length).join(path.sep) || process.cwd());
  }
}

// Build all modules
let successCount = 0;
let failCount = 0;

for (const module of modules) {
  const success = buildModule(module);
  if (success) {
    successCount++;
  } else {
    failCount++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Build Summary');
console.log('='.repeat(50));
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log('='.repeat(50) + '\n');

if (failCount > 0) {
  console.log('⚠️  Some modules failed to build. Please check the errors above.');
  process.exit(1);
} else {
  console.log('🎉 All modules built successfully!');
  console.log('   You can now start the server with: npm start\n');
}

