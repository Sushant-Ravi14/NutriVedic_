# NutriVedic Deployment Guide

This guide walks you through deploying NutriVedic to production.

---

## Architecture Overview

- **Frontend**: React + Vite SPA (PWA enabled) -> Deploy to **Vercel** / **Netlify** / **Render Static**
- **Backend**: Node.js + Express API -> Deploy to **Render** / **Railway** / **Heroku** / **Docker VPS**
- **Database**: **MongoDB Atlas** (Free M0 or higher)
- **Cache / Rate Limit**: **Redis Cloud** / **Upstash Redis** (Free tier available)
- **AI Engine**: Google Gemini API

---

## 1. Prerequisites & Services Setup

### A. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a Shared M0 Cluster.
3. Under **Security > Database Access**, add a database user with password.
4. Under **Security > Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) or specific host IPs.
5. Click **Connect > Drivers (Node.js)** and copy your connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nutrivedic?retryWrites=true&w=majority
   ```

### B. Redis Cloud / Upstash (Caching & Rate Limiting)
1. Go to [Redis Cloud](https://redis.io/try-free/) or [Upstash Redis](https://upstash.com/).
2. Create a free database.
3. Copy the Redis URI:
   ```env
   REDIS_URL=redis://default:<password>@<host>:<port>
   ```

### C. Google Gemini AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create an API key and save it for `GEMINI_API_KEY`.

---

## 2. Deploying Backend (Render / Railway)

### Option A: Deploy on Render.com (Recommended Free Tier)

1. Sign in to [Render](https://render.com/).
2. Click **New + > Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install --production=false`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add:
   | Key | Value / Description |
   |-----|---------------------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (Render default) |
   | `CLIENT_URL` | Your frontend URL (e.g. `https://nutrivedic.vercel.app`) |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `REDIS_URL` | Your Redis Cloud URI |
   | `JWT_ACCESS_SECRET` | 32+ character random string |
   | `JWT_REFRESH_SECRET` | 32+ character random string |
   | `JWT_ACCESS_EXPIRY` | `15m` |
   | `JWT_REFRESH_EXPIRY` | `7d` |
   | `GEMINI_API_KEY` | Your Google Gemini API Key |
   | `USDA_API_KEY` | USDA FoodData Central API key (optional) |
   | `GOOGLE_CLIENT_ID` | Google OAuth Client ID (optional) |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret (optional) |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name (optional) |
   | `CLOUDINARY_API_KEY` | Cloudinary API Key (optional) |
   | `CLOUDINARY_API_SECRET` | Cloudinary API Secret (optional) |
6. Click **Deploy Web Service**.
7. Note down your backend URL (e.g. `https://nutrivedic-api.onrender.com`).

---

## 3. Deploying Frontend (Vercel)

### Deploy on Vercel (Recommended for Vite/React)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New... > Project** and import your repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Click Edit and select `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Your backend URL (e.g. `https://nutrivedic-api.onrender.com`) |
   | `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID (same as backend) |
5. Click **Deploy**.
6. Once deployed, copy your production frontend URL (e.g. `https://nutrivedic.vercel.app`) and update `CLIENT_URL` in your backend Render environment settings!

---

## 4. Deploying via Docker / Self-Hosted VPS

If you have an Ubuntu/Debian VPS with Docker and Docker Compose installed:

1. Clone your repository:
   ```bash
   git clone <repo-url>
   cd NutriVedic_
   ```
2. Create a `.env` file in the root directory:
   ```env
   JWT_ACCESS_SECRET=your_super_secret_access_key_32_chars
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_32_chars
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Start the entire stack:
   ```bash
   docker compose up -d --build
   ```
4. Check container status:
   ```bash
   docker compose ps
   ```
5. Frontend will be accessible on port `80`, Backend on port `5000`.

---

## 5. Post-Deployment Checklist

- [ ] Verify Backend Health: `https://your-backend.onrender.com/api/health` returns `{"status":"ok"}`.
- [ ] Verify Frontend: Access `https://your-app.vercel.app` and test user signup/login.
- [ ] Verify CORS: Ensure browser console does not show CORS blocked errors.
- [ ] Verify Gemini AI Scanner: Upload a food image and confirm meal analysis works.
- [ ] Verify PWA: Check that the web app is installable on mobile/desktop browsers.
