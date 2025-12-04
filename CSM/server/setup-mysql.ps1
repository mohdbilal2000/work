# MySQL Setup Script
Write-Host "=== MySQL Database Setup ===" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (-not (Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL not found at expected location" -ForegroundColor Red
    exit 1
}

Write-Host "✅ MySQL found" -ForegroundColor Green
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Create the database 'csm_db'" -ForegroundColor White
Write-Host "2. Create all required tables" -ForegroundColor White
Write-Host "3. Create admin user (username: admin, password: admin123)" -ForegroundColor White
Write-Host ""

# Try to get password from .env or prompt
$password = ""
$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match "^DB_PASSWORD=(.+)$") {
            $password = $matches[1].Trim()
            break
        }
    }
}

if ([string]::IsNullOrEmpty($password)) {
    Write-Host "Enter MySQL root password (or press Enter if no password):" -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$passwordArg = if ([string]::IsNullOrEmpty($password)) { "" } else { "-p$password" }

Write-Host ""
Write-Host "Creating database and tables..." -ForegroundColor Cyan

# Create database
$createDbCmd = "CREATE DATABASE IF NOT EXISTS csm_db;"
& $mysqlPath -u root $passwordArg -e $createDbCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to connect to MySQL. Please check your password." -ForegroundColor Red
    Write-Host ""
    Write-Host "To reset MySQL root password:" -ForegroundColor Yellow
    Write-Host "1. Stop MySQL service: net stop MySQL80" -ForegroundColor White
    Write-Host "2. Start MySQL in safe mode: mysqld --skip-grant-tables" -ForegroundColor White
    Write-Host "3. Connect and reset password" -ForegroundColor White
    exit 1
}

Write-Host "✅ Database created" -ForegroundColor Green

# Read and execute schema
$schemaPath = Join-Path $PSScriptRoot "database\schema.sql"
if (Test-Path $schemaPath) {
    Write-Host "Creating tables..." -ForegroundColor Cyan
    $schema = Get-Content $schemaPath -Raw
    
    # Filter out CREATE DATABASE and USE statements, execute the rest
    $statements = $schema -split ';' | Where-Object { 
        $_.Trim() -ne '' -and 
        $_ -notmatch 'CREATE DATABASE' -and 
        $_ -notmatch 'USE ' -and
        $_ -notmatch '^--' 
    }
    
    foreach ($stmt in $statements) {
        $stmt = $stmt.Trim()
        if ($stmt) {
            & $mysqlPath -u root $passwordArg csm_db -e $stmt 2>$null
        }
    }
    Write-Host "✅ Tables created" -ForegroundColor Green
}

# Create admin user
Write-Host "Creating admin user..." -ForegroundColor Cyan
$nodeScript = @"
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const password = '$password';
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      database: 'csm_db'
    });
    const [users] = await conn.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await conn.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@csm.com', hash, 'admin']
      );
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    await conn.end();
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
"@

$nodeScript | node
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Setup Complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login credentials:" -ForegroundColor Cyan
    Write-Host "  Username: admin" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Database is ready!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create admin user" -ForegroundColor Red
}

