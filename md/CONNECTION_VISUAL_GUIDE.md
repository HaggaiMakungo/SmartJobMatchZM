# 🎯 Frontend-Backend Connection - Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  YOUR SETUP (Ready to Go!)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        BACKEND                          FRONTEND
    ┌──────────────┐                ┌──────────────┐
    │   FastAPI    │                │  React Native│
    │              │◄───────────────┤   Expo App   │
    │ Port: 8000   │    HTTP/API    │              │
    │              │                │  api.ts      │
    └──────┬───────┘                └──────────────┘
           │
           │
    ┌──────▼───────┐
    │  PostgreSQL  │
    │   Database   │
    │              │
    │  ✓ 2,500 CVs │
    │  ✓ 500 Jobs  │
    └──────────────┘
```

## 🚦 Status Check

```
┌─────────────────────────────────────────────────────────────┐
│ Component                │ Status  │ Action                 │
├─────────────────────────┼─────────┼────────────────────────┤
│ Database                 │ ✅ READY│ Already seeded         │
│ Backend API              │ ⚠️ START│ Run START_BACKEND.bat  │
│ Frontend App             │ ⚠️ CONFIG│ Update IP, then start  │
│ API Connection           │ ⚠️ TEST │ Run test_connection.py │
└─────────────────────────────────────────────────────────────┘
```

## 📋 3-Step Checklist

```
[ ] Step 1: START BACKEND
    └─> Double-click START_BACKEND.bat
    └─> Wait for "Application startup complete"
    └─> Test: http://localhost:8000/docs

[ ] Step 2: GET YOUR IP & TEST
    └─> Run: python backend/test_connection.py
    └─> Note your IP address
    └─> Verify network test passes

[ ] Step 3: UPDATE FRONTEND & START
    └─> Edit: frontend/jobmatch/src/services/api.ts
    └─> Replace IP: http://YOUR_IP:8000/api
    └─> Double-click START_FRONTEND.bat
    └─> Test app
```

## 🔗 Connection Flow

```
┌────────────┐
│  Your App  │ "Show me jobs"
└──────┬─────┘
       │
       │ GET /api/jobs
       │ Authorization: Bearer token
       ▼
┌────────────────┐
│  API Service   │ axios.get('/jobs')
│  (api.ts)      │
└──────┬─────────┘
       │
       │ HTTP Request
       │ http://192.168.1.28:8000/api/jobs
       ▼
┌────────────────┐
│  FastAPI       │ @app.get("/api/jobs")
│  Backend       │
└──────┬─────────┘
       │
       │ SQL Query
       │ SELECT * FROM corporate_jobs
       ▼
┌────────────────┐
│  PostgreSQL    │ Returns 500 jobs
│  Database      │
└──────┬─────────┘
       │
       │ JSON Response
       ▼
┌────────────────┐
│  Your App      │ Displays jobs!
└────────────────┘
```

## 🌐 Network Setup

```
YOUR COMPUTER (192.168.1.28)
├── Backend Server (Port 8000)
│   ├── http://localhost:8000 (local only)
│   └── http://192.168.1.28:8000 (network accessible)
│
└── Expo Dev Server (Port 8081)
    ├── Metro Bundler
    └── Serves app to devices

YOUR PHONE/EMULATOR
└── Expo Go App
    └── Connects to: http://192.168.1.28:8000/api
```

## 📡 API Endpoints Map

```
BASE: http://YOUR_IP:8000/api

Authentication
├── POST /auth/register    → Create account
├── POST /auth/login       → Get token
└── GET  /auth/me          → Current user

Jobs
├── GET  /jobs             → List all jobs
├── GET  /jobs/{id}        → Job details
└── POST /jobs             → Create job (auth required)

CVs
├── GET  /cvs              → List all CVs
├── GET  /cvs/{id}         → CV details
└── POST /cvs              → Create CV (auth required)

Matching
├── POST /match/cv-to-jobs → Match CV to jobs
└── POST /match/job-to-cvs → Match job to CVs

System
└── GET  /health           → Health check
```

## 🎨 Frontend API Integration

```typescript
// Already configured in: frontend/jobmatch/src/services/api.ts

import { api } from '@/services/api';

// Example: Get all jobs
const response = await api.get('/jobs');
const jobs = response.data;

// Example: Login
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});
const token = response.data.token;

// Token automatically added to future requests!
```

## 🔐 Authentication Flow

```
┌────────────┐
│  Login     │ Enter email/password
│  Screen    │
└──────┬─────┘
       │
       │ POST /auth/login
       ▼
┌────────────┐
│  Backend   │ Verify credentials
└──────┬─────┘
       │
       │ Return JWT token
       ▼
┌────────────┐
│  Frontend  │ Store in SecureStore
│  (api.ts)  │
└──────┬─────┘
       │
       │ Add to all future requests:
       │ Authorization: Bearer <token>
       ▼
┌────────────┐
│  Protected │ Backend verifies token
│  Routes    │
└────────────┘
```

## 🎬 Quick Start Commands

```bash
# Terminal 1: Start Backend
cd C:\Dev\ai-job-matchingV2
START_BACKEND.bat

# Terminal 2: Test Connection
cd backend
python test_connection.py

# Terminal 3: Start Frontend
cd C:\Dev\ai-job-matchingV2
START_FRONTEND.bat

# Your Browser
http://localhost:8000/docs  → View API documentation
```

## ✅ Success Indicators

```
Backend Console:
✓ INFO:     Uvicorn running on http://0.0.0.0:8000
✓ INFO:     Application startup complete

Frontend Console:
✓ 📡 API Base URL: http://192.168.1.28:8000/api
✓ 🔵 API Request: GET /jobs
✓ ✅ API Response: GET /jobs - 200

Your App:
✓ Jobs loading
✓ Can login
✓ No "Network Error" messages
```

## 🆘 Quick Fixes

```
Problem: Backend won't start
Fix: Check if port 8000 is in use
     → netstat -ano | findstr :8000

Problem: Frontend can't connect
Fix: Verify IP address in api.ts
     → Run test_connection.py to get correct IP

Problem: Firewall blocking
Fix: Allow port 8000 in Windows Firewall
     → Windows Security → Advanced settings

Problem: CORS error
Fix: Check backend/.env has correct CORS_ORIGINS
     → Should include your frontend URL
```

---

**You're all set! Start the backend, update the IP, and you're live!** 🚀
