# MySQL Setup Instructions

## Quick Setup for Windows

### Option 1: Install MySQL (if not installed)

1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default"
3. During installation, set root password (or leave blank)
4. Complete the installation

### Option 2: Start MySQL Service (if already installed)

1. Open PowerShell as Administrator
2. Run: `net start MySQL80` (or `MySQL` depending on your version)
3. Or use Services app: Press Win+R, type `services.msc`, find MySQL, and click Start

### Option 3: Use XAMPP (Easier Alternative)

1. Download XAMPP from: https://www.apachefriends.org/
2. Install and start MySQL from XAMPP Control Panel
3. Default settings work with our .env file

## After MySQL is Running

1. Open MySQL Command Line or phpMyAdmin
2. Run: `CREATE DATABASE csm_db;`
3. Or run our setup script: `node setup-db.js` in the server folder

## Quick Test

Run this in PowerShell to test MySQL:
```powershell
mysql -u root -e "CREATE DATABASE IF NOT EXISTS csm_db;"
```

Then restart the backend server.

