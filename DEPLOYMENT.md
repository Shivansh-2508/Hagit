# HabitFlow Deployment Guide

## Overview
This guide will help you deploy your HabitFlow application with a backend on Render and frontend on Vercel.

## Prerequisites
- GitHub account
- [Render.com](https://render.com) account (free tier available)
- [Vercel.com](https://vercel.com) account (already have)
- MongoDB Atlas connection string (you already have this)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Backend

1. Make sure you've pushed all code to GitHub:
   ```bash
   cd /Users/akshadgawde/Desktop/Developer/Hagit
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `habitflow-backend` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend/server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Set Environment Variables on Render

In the "Environment" section, add these variables:

```env
MONGODB_URI=mongodb+srv://shivanshkukreti2004_db_user:yMItbYveQszVSJ42@cluster1.y053sqm.mongodb.net/?appName=Cluster1

JWT_SECRET=habitflow-secure-production-key-2026-change-this-to-random-string

PORT=3001

NODE_ENV=production

FRONTEND_URL=https://your-vercel-app.vercel.app
```

**IMPORTANT**: Generate a strong random string for `JWT_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Click **"Create Web Service"**
5. Wait for deployment (5-10 minutes)
6. Copy your deployed URL (e.g., `https://habitflow-backend.onrender.com`)

---

## Part 2: Update Vercel Frontend

### Step 1: Update Environment Variables on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your HabitFlow project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```env
VITE_API_URL=https://habitflow-backend.onrender.com/api

GEMINI_API_KEY=your-gemini-api-key-here
```

**Replace** `https://habitflow-backend.onrender.com` with your actual Render URL from Step 6 above.

### Step 2: Redeploy on Vercel

1. In Vercel dashboard, go to **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"** to trigger a new build with updated environment variables

---

## Part 3: Update Backend CORS

### Update Allowed Origins

1. After getting your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Go back to Render dashboard
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your actual Vercel URL
5. Click **"Save Changes"** (this will trigger a redeploy)

---

## Part 4: Test Your Deployment

### Backend Health Check
Visit: `https://your-render-url.onrender.com/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T...",
  "environment": "production",
  "version": "1.0.0"
}
```

### Frontend Test
1. Visit your Vercel URL
2. Sign up / Log in
3. Create a habit
4. Refresh the page
5. Habit should persist (data saved to MongoDB)

---

## Part 5: Local Development Setup

### Backend
```bash
cd backend/server
npm install
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

Make sure your frontend `.env.local` has:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Troubleshooting

### Backend Issues

**Problem**: "MongoDB connection error"
- Check `MONGODB_URI` is correct in Render environment variables
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0) in Network Access

**Problem**: "CORS error"
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check Render logs for CORS-related errors

**Problem**: "JWT errors"
- Ensure `JWT_SECRET` is set in Render environment variables
- Make sure it's a strong random string

### Frontend Issues

**Problem**: "Failed to fetch"
- Check `VITE_API_URL` in Vercel matches your Render backend URL
- Make sure backend is deployed and running (check health endpoint)

**Problem**: "401 Unauthorized"
- Clear browser localStorage
- Sign up again with a new account
- Check backend logs in Render

### Render Free Tier Note

⚠️ **Important**: Render's free tier spins down after 15 minutes of inactivity. First request after inactivity takes 30-60 seconds.

To keep it active:
- Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 10 minutes
- Upgrade to paid tier ($7/month) for always-on service

---

## Monitoring

### Backend Logs
- Go to Render dashboard → Your service → **Logs** tab
- Monitor for errors and connection issues

### Frontend Logs
- Use browser console (F12)
- Check Vercel deployment logs in dashboard

---

## Security Best Practices

✅ **Done**:
- MongoDB connection string not exposed to frontend
- JWT tokens for authentication
- CORS configured for specific origins
- HTTPS on both frontend and backend (via Vercel and Render)

🔒 **Additional Recommendations**:
1. Generate a strong JWT_SECRET (32+ random characters)
2. Never commit `.env` or `.env.local` files to Git
3. Rotate JWT_SECRET periodically
4. Set up MongoDB IP whitelist if possible
5. Enable MongoDB authentication if not already done

---

## Quick Reference

### Your URLs
- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Render)**: `https://habitflow-backend.onrender.com`
- **MongoDB**: `cluster1.y053sqm.mongodb.net`

### Environment Variables Summary

**Render (Backend)**:
```
MONGODB_URI
JWT_SECRET
PORT
NODE_ENV
FRONTEND_URL
```

**Vercel (Frontend)**:
```
VITE_API_URL
GEMINI_API_KEY
```

---

## Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test the backend health endpoint directly
5. Ensure MongoDB Atlas network access is configured

---

## Next Steps

After successful deployment:
- [ ] Test all features (signup, login, create habit, etc.)
- [ ] Set up monitoring/alerting
- [ ] Add custom domain (optional)
- [ ] Set up CI/CD for automatic deployments
- [ ] Consider upgrading to paid tiers for better performance

Good luck! 🚀
