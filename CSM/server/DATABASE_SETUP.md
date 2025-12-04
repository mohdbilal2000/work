# MySQL Database Setup

This application now uses MySQL instead of JSON file storage.

## Prerequisites

1. Install MySQL Server on your system
2. Create a MySQL database (or use the default `csm_db`)

## Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=csm_db

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-this-in-production
```

## Database Setup

### Option 1: Automatic Setup (Recommended)

The application will automatically create the database tables on first run if they don't exist. Just make sure:

1. MySQL server is running
2. The database specified in `DB_NAME` exists (or create it manually)
3. The user specified in `DB_USER` has permissions to create tables

To create the database manually:
```sql
CREATE DATABASE csm_db;
```

### Option 2: Manual Setup

Run the SQL schema file manually:

```bash
mysql -u root -p < server/database/schema.sql
```

Or import it through MySQL Workbench or phpMyAdmin.

## Default Admin User

On first run, the application will automatically create a default admin user:
- **Username:** admin
- **Password:** admin123

**Important:** Change this password immediately in production!

## Testing the Connection

The server will test the MySQL connection on startup. If you see:
- `MySQL database connected successfully` - Connection is working
- `Warning: Database connection failed` - Check your MySQL configuration

## Troubleshooting

1. **Connection refused**: Make sure MySQL server is running
2. **Access denied**: Check your `DB_USER` and `DB_PASSWORD` in `.env`
3. **Database doesn't exist**: Create the database manually or check `DB_NAME` in `.env`
4. **Table creation fails**: Ensure the user has CREATE TABLE permissions

