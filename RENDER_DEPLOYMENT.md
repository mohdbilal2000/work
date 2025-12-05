# Render.com Deployment Configuration

## ✅ Updated Build & Start Commands

### Build Command
```
npm install && npm run build:all
```

This will:
- Install all dependencies
- Build all 4 modules (CSO, HR Admin, CSM Client, Finance Portal)
- Generate Prisma Client for Finance Portal

**Note:** Prisma migrations are NOT run during build (they run at startup instead).

---

### Start Command
```
npm start
```

This will:
- Run Prisma migrations (`prisma migrate deploy`)
- Start the Express gateway server

---

## 🔧 Environment Variables Required

Add these in Render Dashboard → Your Service → Environment:

### Required Variables:
1. **`PORT`** - Server port (usually auto-set by Render, but can be `4000`)
2. **`NODE_ENV`** - Set to `production`
3. **`JWT_SECRET`** - Your JWT secret key (use a strong random string)
4. **`DATABASE_URL`** - PostgreSQL connection string for Finance Portal
   - Format: `postgresql://user:password@host:port/dbname?schema=public`
   - Get this from your Render PostgreSQL database → Connections tab

### Optional Variables:
- **`RECRUITOR_JWT`** - If using Recruitor module

---

## 📋 Step-by-Step Render Setup

1. **Create PostgreSQL Database** (if not already created):
   - Go to Render Dashboard → New + → PostgreSQL
   - Create database
   - Copy the connection string from Connections tab

2. **Create Web Service**:
   - Go to Render Dashboard → New + → Web Service
   - Connect your GitHub repository
   - Set the following:

   **Build Command:**
   ```
   npm install && npm run build:all
   ```

   **Start Command:**
   ```
   npm start
   ```

3. **Add Environment Variables**:
   - Go to Environment tab
   - Add all required variables listed above

4. **Deploy**:
   - Click "Deploy" or "Manual Deploy"
   - Wait for build to complete
   - Check logs to ensure migrations ran successfully

---

## 🚨 Troubleshooting

### Build Fails with "DATABASE_URL not found"
- **Solution:** This is expected! Prisma migrations now run at startup, not during build.
- Make sure `DATABASE_URL` is set in Environment Variables
- The build should complete successfully, migrations will run when the service starts

### Service Won't Start
- Check logs for Prisma migration errors
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL database is accessible

### Prisma Migration Errors
- Check that `DATABASE_URL` is correctly formatted
- Verify database credentials are correct
- Check that database exists and is accessible

---

## 📝 What Changed

**Before:**
- Build command included `prisma migrate deploy`
- Migrations ran during build (could fail if DB not ready)

**After:**
- Build command only generates Prisma Client
- Migrations run at startup via `start.js`
- More resilient: service won't start if migrations fail (better than build failing)

---

## ✅ Benefits

1. **Faster builds** - No database connection needed during build
2. **More resilient** - Migrations run when service starts, not during build
3. **Better error handling** - Service won't start if migrations fail (clearer errors)
4. **Easier debugging** - Migration errors appear in service logs, not build logs

