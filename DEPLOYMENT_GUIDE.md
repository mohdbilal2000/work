# Defitex Portal - Deployment Guide

## Project Overview

**Defitex** is a unified multi-module portal system consisting of:

1. **CSO (Candidate Service Operations)** - Next.js 14 application
2. **HR Admin** - React + Vite frontend with Express backend
3. **CSM (Client Service Manager)** - React + Vite frontend with Express backend
4. **Finance Portal** - Next.js 14 application with Prisma
5. **Main Gateway Server** - Express server (port 4000) that routes to all modules

### Technology Stack
- **Frontend**: React 18, Next.js 14, Vite
- **Backend**: Node.js, Express.js
- **Databases**: 
  - SQLite (HR Admin, Finance, CSM - fallback)
  - MySQL (CSM - primary)
  - CSV files (CSO)
- **Build Tools**: Vite, Next.js

---

## Architecture

```
Defitex Portal (Port 4000)
├── /cso          → CSO Next.js App
├── /hr-admin     → HR Admin React App
├── /csm          → CSM React App
├── /api/esic     → HR Admin API
├── /api/csm/*    → CSM API
└── /             → Landing Page
```

---

## Pre-Deployment Checklist

### 1. Build All Frontend Applications

Before deploying, you need to build all frontend applications:

```bash
# Build CSO (Next.js)
cd CSO
npm install
npm run build
# For static export (if needed)
# npm run export  # Add export script to package.json if using static export

# Build HR Admin (Vite)
cd "HR admin"
npm install
npm run build

# Build CSM Client (Vite)
cd CSM/client
npm install
npm run build

# Build Finance Portal (Next.js)
cd finance
npm install
npm run build
```

### 2. Environment Variables

Create `.env` files for each module that needs them:

#### Root `.env` (for main server.js)
```env
PORT=4000
NODE_ENV=production
```

#### CSM Server `.env` (CSM/server/.env)
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=csm_database
NODE_ENV=production
```

#### Finance Portal `.env` (finance/.env)
```env
DATABASE_URL="file:./prisma/dev.db"
# For production, use PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:5432/finance_db"
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

#### CSO `.env` (CSO/.env)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

---

## Deployment Options

## Option 1: Render.com (Recommended for Multi-Module Apps)

### Why Render?
- Free tier available
- Easy PostgreSQL/MySQL setup
- Automatic SSL
- Environment variable management
- Supports both static sites and web services

### Step-by-Step Deployment

#### 1. Prepare Your Repository
```bash
# Ensure all builds are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Deploy Main Gateway Server

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `defitex-portal`
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm install && 
     cd CSO && npm install && npm run build && cd .. &&
     cd "HR admin" && npm install && npm run build && cd .. &&
     cd CSM/client && npm install && npm run build && cd ../.. &&
     cd finance && npm install && npm run build && cd ..
     ```
   - **Start Command**: `node server.js`
   - **Instance Type**: Free or Starter ($7/month)

5. Add Environment Variables:
   ```
   PORT=4000
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   ```

#### 3. Deploy CSM Backend (Separate Service)

1. Create another **Web Service** on Render
2. Configure:
   - **Name**: `csm-api`
   - **Root Directory**: `CSM/server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment Variables**:
     ```
     PORT=5000
     JWT_SECRET=your-secret-key-here
     DB_HOST=your-mysql-host
     DB_USER=your-mysql-user
     DB_PASSWORD=your-mysql-password
     DB_NAME=csm_database
     NODE_ENV=production
     ```

#### 4. Setup MySQL Database on Render

1. Go to **"New +"** → **"PostgreSQL"** (or use external MySQL)
2. Or use **Render MySQL** (if available) or external service like:
   - [PlanetScale](https://planetscale.com) (Free tier)
   - [Railway](https://railway.app) (Free tier)
   - [Aiven](https://aiven.io) (Free tier)

#### 5. Update API URLs

After deployment, update frontend API URLs:
- CSM client: Update API base URL to your `csm-api` service URL
- HR Admin: Update API base URL if backend is separate

#### 6. Configure CORS

Update CORS settings in each backend to allow your frontend domains.

---

## Option 2: Hostinger Cloud Plan

### Why Hostinger?
- Full VPS control
- Good for complex multi-service setups
- Can run multiple Node.js processes
- More control over server configuration

### Step-by-Step Deployment

#### 1. Server Setup

**SSH into your Hostinger VPS:**
```bash
ssh root@your-server-ip
```

#### 2. Install Node.js and PM2

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (Reverse Proxy)
apt install -y nginx
```

#### 3. Clone Your Repository

```bash
cd /var/www
git clone https://github.com/yourusername/defitex-portal.git
cd defitex-portal
```

#### 4. Install Dependencies and Build

```bash
# Install root dependencies
npm install

# Build CSO
cd CSO
npm install
npm run build
cd ..

# Build HR Admin
cd "HR admin"
npm install
npm run build
cd ..

# Build CSM Client
cd CSM/client
npm install
npm run build
cd ../..

# Build Finance Portal
cd finance
npm install
npm run build
cd ..
```

#### 5. Setup MySQL Database

```bash
# Install MySQL
apt install -y mysql-server

# Secure MySQL
mysql_secure_installation

# Create database
mysql -u root -p
```

```sql
CREATE DATABASE csm_database;
CREATE USER 'csm_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON csm_database.* TO 'csm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 6. Setup Environment Variables

```bash
# Create .env files
nano /var/www/defitex-portal/.env
```

Add:
```env
PORT=4000
NODE_ENV=production
```

```bash
nano /var/www/defitex-portal/CSM/server/.env
```

Add:
```env
PORT=5000
JWT_SECRET=your-secret-key-here
DB_HOST=localhost
DB_USER=csm_user
DB_PASSWORD=strong_password_here
DB_NAME=csm_database
NODE_ENV=production
```

#### 7. Start Services with PM2

```bash
cd /var/www/defitex-portal

# Start main gateway server
pm2 start server.js --name "defitex-portal"

# Start CSM backend (if separate)
cd CSM/server
pm2 start index.js --name "csm-api"
cd ../..

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 8. Configure Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/defitex
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Main portal
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CSM API
    location /api/csm {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/defitex /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 9. Setup SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 10. Firewall Configuration

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Option 3: Railway.app

### Why Railway?
- Very easy deployment
- Automatic SSL
- PostgreSQL included
- Good for Next.js apps

### Step-by-Step Deployment

1. **Connect Repository**
   - Go to [Railway.app](https://railway.app)
   - Click **"New Project"** → **"Deploy from GitHub"**
   - Select your repository

2. **Add PostgreSQL Database**
   - Click **"New"** → **"Database"** → **"Add PostgreSQL"**

3. **Configure Main Service**
   - **Root Directory**: `/` (root)
   - **Build Command**: 
     ```bash
     npm install && 
     cd CSO && npm install && npm run build && cd .. &&
     cd "HR admin" && npm install && npm run build && cd .. &&
     cd CSM/client && npm install && npm run build && cd ../.. &&
     cd finance && npm install && npm run build && cd ..
     ```
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     ```
     PORT=${{PORT}}
     NODE_ENV=production
     JWT_SECRET=your-secret-key
     ```

4. **Add MySQL Service** (for CSM)
   - Use Railway MySQL or external service
   - Or deploy CSM backend as separate service

---

## Option 4: Vercel (For Next.js Apps) + Separate Backend

### Why Vercel?
- Best for Next.js applications
- Free tier
- Automatic deployments
- Edge network

### Deployment Strategy

1. **Deploy CSO to Vercel**
   ```bash
   cd CSO
   vercel
   ```

2. **Deploy Finance to Vercel**
   ```bash
   cd finance
   vercel
   ```

3. **Deploy Backends Separately**
   - Use Render/Railway for Express backends
   - Update frontend API URLs

---

## Database Migration Guide

### SQLite to PostgreSQL/MySQL

#### For Finance Portal (Prisma)

1. Update `finance/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/finance_db"
```

3. Run migrations:
```bash
cd finance
npx prisma migrate deploy
npx prisma generate
```

#### For CSM (MySQL)

The CSM module already supports MySQL. Just update the connection string in `.env`.

#### For HR Admin (SQLite to PostgreSQL)

You'll need to:
1. Export SQLite data
2. Create PostgreSQL schema
3. Import data
4. Update database connection in `HR admin/server/database.js`

---

## Production Checklist

- [ ] All frontend apps built (`npm run build`)
- [ ] Environment variables set
- [ ] Database configured and migrated
- [ ] CORS configured for production domains
- [ ] SSL certificate installed
- [ ] PM2/process manager configured (if VPS)
- [ ] File upload directories have write permissions
- [ ] Logging configured
- [ ] Error handling in place
- [ ] Default passwords changed
- [ ] JWT secrets are strong and unique
- [ ] Database backups configured
- [ ] Monitoring set up

---

## Troubleshooting

### Build Failures
- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall
- Check for missing dependencies

### Database Connection Issues
- Verify database credentials
- Check firewall rules
- Ensure database is accessible from server

### CORS Errors
- Update CORS settings in backend
- Add production domain to allowed origins

### File Upload Issues
- Check directory permissions
- Ensure upload directories exist
- Verify file size limits

### Port Conflicts
- Ensure ports are not in use
- Update port numbers in `.env` files
- Check firewall settings

---

## Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild frontends
cd CSO && npm run build && cd ..
cd "HR admin" && npm run build && cd ..
cd CSM/client && npm run build && cd ../..
cd finance && npm run build && cd ..

# Restart services (PM2)
pm2 restart all

# Or on Render/Railway, just push to trigger rebuild
```

### Database Backups

```bash
# MySQL backup
mysqldump -u user -p csm_database > backup.sql

# SQLite backup
cp finance/prisma/dev.db finance/prisma/dev.db.backup
```

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Hostinger Docs**: https://www.hostinger.com/tutorials
- **PM2 Docs**: https://pm2.keymetrics.io/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Recommended Hosting Strategy

**For Best Results:**
1. **Frontend (CSO, Finance)**: Deploy to Vercel (free, optimized for Next.js)
2. **Backend APIs**: Deploy to Render or Railway (easy setup)
3. **Main Gateway**: Deploy to Render or Hostinger VPS
4. **Database**: Use managed PostgreSQL/MySQL (Render, Railway, or PlanetScale)

This hybrid approach gives you:
- Best performance for Next.js apps
- Easy backend management
- Scalable database
- Cost-effective (mostly free tier)

---

## Quick Start Commands

```bash
# Local development
npm install
cd CSO && npm install && cd ..
cd "HR admin" && npm install && cd ..
cd CSM/client && npm install && cd ../..
cd finance && npm install && cd ..
node server.js

# Production build
npm run build:all  # (create this script in package.json)

# PM2 management
pm2 list
pm2 logs
pm2 restart all
pm2 stop all
```

---

**Last Updated**: 2024
**Project**: Defitex Portal
**Version**: 1.0.0

