# Quick Deployment Guide - Defitex Portal

## 🚀 Fastest Deployment Options

### Option 1: Render.com (Recommended - 15 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect GitHub repo
   - Settings:
     - **Build Command**: `npm run build:all`
     - **Start Command**: `node server.js`
     - **Environment**: Node
   - Add environment variables (see `.env.example`)

3. **Add PostgreSQL Database** (for Finance)
   - Click "New PostgreSQL"
   - Copy connection string
   - Add to `finance/.env` as `DATABASE_URL`

4. **Done!** Your app will be live at `https://your-app.onrender.com`

---

### Option 2: Railway.app (10 minutes)

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub"

2. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"

3. **Configure Service**
   - Root: `/`
   - Build: `npm run build:all`
   - Start: `node server.js`
   - Add env vars from `.env.example`

4. **Done!** Railway auto-generates URL

---

### Option 3: Vercel + Render (Best Performance)

**Frontend (Vercel):**
```bash
# Deploy CSO
cd CSO
vercel

# Deploy Finance
cd ../finance
vercel
```

**Backend (Render):**
- Deploy main server.js to Render
- Deploy CSM/server to Render
- Update frontend API URLs

---

## 📋 Pre-Deployment Checklist

- [ ] Run `npm run build:all` locally to test
- [ ] Update all `.env` files with production values
- [ ] Change default passwords
- [ ] Set strong JWT_SECRET
- [ ] Configure database (PostgreSQL/MySQL)
- [ ] Test all modules locally

---

## 🔧 Build Commands

```bash
# Build everything
npm run build:all

# Install all dependencies
npm run install:all

# Start production server
npm start
```

---

## 🌐 Environment Variables Needed

See `.env.example` for complete list. Minimum required:

- `PORT` (default: 4000)
- `JWT_SECRET` (required)
- `DATABASE_URL` (for Finance portal)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (for CSM)

---

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## ⚡ Quick Troubleshooting

**Build fails?**
- Check Node.js version (need 18+)
- Run `npm run install:all` first
- Check for missing dependencies

**Database connection fails?**
- Verify credentials
- Check firewall rules
- Ensure database is accessible

**CORS errors?**
- Update CORS settings in backend
- Add production domain to allowed origins

---

**Need Help?** Check the full `DEPLOYMENT_GUIDE.md` for detailed instructions.

