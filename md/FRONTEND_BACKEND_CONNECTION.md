# 🔗 Frontend-Backend Connection Guide

## Current Setup

Your frontend is already configured! Here's what we have:

### ✅ Frontend API Configuration
**File:** `frontend/jobmatch/src/services/api.ts`

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.28:8000/api'  // Your local network IP
  : 'https://your-production-api.com/api';
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start the Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Important:** Use `--host 0.0.0.0` so it's accessible from your mobile device!

### Step 2: Update Frontend IP Address

Find your computer's local IP address:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.28`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

Then update `frontend/jobmatch/src/services/api.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_IP_HERE:8000/api'  // Replace with your IP
  : 'https://your-production-api.com/api';
```

### Step 3: Start the Frontend
```bash
cd frontend/jobmatch
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

---

## ✅ Testing the Connection

### 1. Check Backend is Running
Open in browser: **http://localhost:8000/docs**

You should see the FastAPI Swagger UI.

### 2. Test Backend from Network
Open in browser: **http://YOUR_IP:8000/docs**

If this doesn't work, check your firewall!

### 3. Test from Frontend
In your app, try:
- Login/Register
- Browse jobs
- View CV list

Check the Expo console for API logs:
- 🔵 API Request logs
- ✅ Success responses
- ❌ Error messages

---

## 🔧 Common Issues & Solutions

### Issue 1: "Network Error" in App
**Symptoms:** App shows network error, can't reach backend

**Solutions:**

**A. Check Backend is Running**
```bash
curl http://localhost:8000/api/health
```
Should return: `{"status":"healthy"}`

**B. Check Firewall**
Windows Firewall might be blocking port 8000:
1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules
3. New Rule → Port → TCP → 8000 → Allow

**C. Verify IP Address**
Make sure the IP in `api.ts` matches your computer's current IP.

**D. Use Correct Host**
Backend MUST start with `--host 0.0.0.0`:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Issue 2: CORS Errors
**Symptoms:** Browser console shows CORS error

**Solution:** Backend already configured! Check `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

For mobile, add your IP:
```env
CORS_ORIGINS=http://localhost:3000,http://192.168.1.28:8000
```

### Issue 3: 401 Unauthorized
**Symptoms:** All API calls return 401

**Solutions:**
- **For protected endpoints:** You need to login first
- **For public endpoints:** Check backend route protection

### Issue 4: 404 Not Found
**Symptoms:** Specific endpoint returns 404

**Solutions:**
- Check the endpoint exists in backend
- Verify the URL path is correct
- Check Swagger docs: http://localhost:8000/docs

---

## 📱 Development Workflow

### Recommended Setup

**Terminal 1 - Backend:**
```bash
cd C:\Dev\ai-job-matchingV2\backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd C:\Dev\ai-job-matchingV2\frontend\jobmatch
npx expo start
```

**Browser:**
- http://localhost:8000/docs (Backend API)
- Expo Dev Tools (Frontend)

---

## 🔌 API Endpoints Available

Based on your backend, you should have:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs` - Create job (requires auth)

### CVs
- `GET /api/cvs` - List all CVs
- `GET /api/cvs/{id}` - Get CV details
- `POST /api/cvs` - Create CV (requires auth)

### Matching
- `POST /api/match/cv-to-jobs` - Match CV to jobs
- `POST /api/match/job-to-cvs` - Match job to CVs

### Health
- `GET /api/health` - Health check

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Backend starts without errors
- [ ] Swagger UI loads at http://localhost:8000/docs
- [ ] Health endpoint returns 200
- [ ] Can access from network IP

### Frontend Tests
- [ ] App starts in Expo
- [ ] Can see job listings
- [ ] Can register/login
- [ ] API logs appear in console
- [ ] No network errors

### Integration Tests
- [ ] Login works end-to-end
- [ ] Job list loads from backend
- [ ] Job details show correctly
- [ ] Matching algorithm works
- [ ] Images/assets load

---

## 📊 Monitoring API Calls

Your frontend already has logging! Check the Expo console:

```
📡 API Base URL: http://192.168.1.28:8000/api
🔵 API Request: GET /jobs
✅ API Response: GET /jobs - 200
```

Or errors:
```
❌ API Error 404: Not Found
❌ Network Error: No response from server
```

---

## 🎯 Next Steps

1. **Start Both Servers**
   ```bash
   # Terminal 1
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0
   
   # Terminal 2
   cd frontend/jobmatch
   npx expo start
   ```

2. **Verify Connection**
   - Open http://YOUR_IP:8000/docs in browser
   - Should see FastAPI Swagger UI
   - Test `/health` endpoint

3. **Test in App**
   - Open app in Expo Go
   - Try browsing jobs
   - Check console for API logs

4. **Fix Any Issues**
   - Check firewall if network error
   - Update IP if changed
   - Review logs for specific errors

---

## 🔒 Security Notes

### Development
- Using `__DEV__` flag for development URL
- HTTP is fine for local development
- Tokens stored in SecureStore

### Production
- Update `API_BASE_URL` for production
- Use HTTPS
- Set proper CORS origins
- Use environment variables

---

## 📝 Quick Reference

**Backend Port:** 8000  
**Frontend:** Expo (Metro bundler)  
**API Base:** `/api`  
**Auth:** Bearer token in Authorization header  
**Timeout:** 15 seconds  

**Environment:** Development uses local IP, Production uses your API domain

---

## Need Help?

**Check logs in:**
- Backend: Terminal running uvicorn
- Frontend: Expo terminal
- Network: Browser DevTools (for CORS)

**Common commands:**
```bash
# Get your IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Test backend
curl http://localhost:8000/api/health

# Restart backend
# Ctrl+C then re-run uvicorn command

# Clear Expo cache
npx expo start -c
```

---

Your frontend is ready to connect! Just start the backend and verify the IP address. 🚀
