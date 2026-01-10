<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HabitFlow 🎯

A full-stack habit tracking application with AI-powered insights and real-time database synchronization.

View your app in AI Studio: https://ai.studio/apps/drive/13Jdlz_qWqtlWZObhLIB33m5ZPbvuzxvV

## Architecture

- **Frontend**: React + TypeScript + Vite (Deployed on Vercel)
- **Backend**: Node.js + Express (Ready for Render deployment)  
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API

## Project Structure

```
Hagit/
├── frontend/                # React frontend application
│   ├── components/         # React components
│   ├── services/          # API services (dbService, geminiService)
│   ├── App.tsx           # Main app component
│   └── vite.config.ts    # Vite configuration
│
├── backend/               # Node.js backend
│   └── server/           # Express server
│       ├── index.js      # Main server file with API routes
│       ├── db.js         # MongoDB connection
│       ├── models.js     # User models and DB operations
│       ├── middleware.js # JWT authentication
│       └── package.json  # Backend dependencies
│
├── .env                  # Root environment variables
└── DEPLOYMENT.md         # Comprehensive deployment guide
```

## Quick Start - Local Development

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend/server
   npm install
   ```

2. Create `.env.local` from `.env.example`:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB URI and JWT secret
   ```

3. Start server:
   ```bash
   npm run dev
   ```
   Server runs on: http://localhost:3001

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```
   App runs on: http://localhost:3000

## 🚀 Production Deployment

**Ready to deploy!** See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions:
- Deploy Backend to Render (free tier available)
- Connect Frontend on Vercel to deployed backend
- MongoDB Atlas already configured

## Features

- ✅ User authentication (signup/login with JWT)
- ✅ Create and manage habits
- ✅ Daily checklist with streak tracking
- ✅ XP and gamification system
- ✅ Master goals
- ✅ AI-powered insights with Gemini
- ✅ Heatmap visualization
- ✅ Real-time data sync with MongoDB
- ✅ Production-ready with proper CORS and security

## Tech Stack

**Frontend:** React 18 • TypeScript • Vite  
**Backend:** Node.js • Express • MongoDB Native Driver  
**Security:** JWT • bcryptjs • CORS  
**Deployment:** Vercel (Frontend) • Render (Backend) • MongoDB Atlas

## API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

**User Data:**
- `GET /api/user` - Get user's habits and data (protected)
- `POST /api/user` - Update user's habits and data (protected)

**Utilities:**
- `GET /api/health` - Server health check
- `GET /` - API info

## Environment Variables

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secure-random-string
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
GEMINI_API_KEY=your-gemini-key
```

## Security Features

- ✅ JWT-based authentication with 7-day expiry
- ✅ Password hashing with bcryptjs
- ✅ CORS configured for specific origins
- ✅ Environment variables for sensitive data
- ✅ HTTPS on all production endpoints
- ✅ MongoDB connection with TLS
- ✅ Input validation on all endpoints

## Author

Built with ❤️ by Akshad Gawde

---

📖 **For complete deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)**
