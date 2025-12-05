# 🚀 Quick Start - Connect Frontend to Backend

## ⚡ Super Quick (3 Steps)

### 1. Start Backend
```bash
START_BACKEND.bat
```
Or manually:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test Connection
```bash
cd backend
python test_connection.py
```

This will show you your IP address and test if the backend is accessible.

### 3. Update Frontend & Start
1. Copy your IP from the test output
2. Update `frontend/jobmatch/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://YOUR_IP:8000/api'  // Paste your IP here
     : 'https://your-production-api.com/api';
   ```
3. Start frontend:
   ```bash
   START_FRONTEND.bat
   ```

**Done!** 🎉

---

## 📋 Current Status

✅ Backend database seeded with 2,500 CVs  
✅ Backend database seeded with 500 Corporate Jobs  
✅ Backend database seeded with 400 Small Jobs  
✅ Frontend already configured with API service  
✅ Axios interceptors for auth setup  
✅ Error handling in place  

**Just need to connect them!**

---

## 🎯 What Happens Next

When you start both servers:

**Backend (Terminal 1):**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started server process
INFO:     Application startup complete
```

**Frontend (Terminal 2):**
```
› Metro waiting on exp://192.168.1.28:8081
› Scan the QR code above with Expo Go (Android) or Camera (iOS)
```

**In your app:**
```
📡 API Base URL: http://192.168.1.28:8000/api
🔵 API Request: GET /jobs
✅ API Response: GET /jobs - 200
```

---

## 🧪 Testing

### 1. Test Backend First
```bash
# In browser
http://localhost:8000/docs
```
Should show FastAPI Swagger UI with all endpoints.

### 2. Test Network Access
```bash
# In browser (use your IP)
http://192.168.1.28:8000/docs
```
Should show same Swagger UI - means mobile can reach it!

### 3. Test from App
- Open app in Expo Go
- Try viewing jobs
- Check console for API logs

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F
```

### Frontend can't connect
1. Check backend is running
2. Verify IP address is correct
3. Check firewall (Windows Security)
4. Make sure backend started with `--host 0.0.0.0`

### CORS errors
Backend `.env` should have:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

For mobile, might need to add your IP.

---

## 📱 Development Workflow

### Daily Startup
1. Double-click `START_BACKEND.bat`
2. Wait for "Application startup complete"
3. Double-click `START_FRONTEND.bat`
4. Press `a` for Android or `i` for iOS
5. Start coding! 🎨

### When IP Changes
If your computer gets a new IP (common with WiFi):
1. Run `python backend/test_connection.py`
2. Update IP in `frontend/jobmatch/src/services/api.ts`
3. Restart frontend (Ctrl+C then `npx expo start`)

---

## 🎊 You're Ready!

Your setup:
- ✅ Backend with seeded database
- ✅ Frontend with API integration  
- ✅ Authentication ready
- ✅ Error handling setup
- ✅ Logging configured

Just start both servers and you're live! 🚀

---

## 📚 Documentation

- **Full Guide:** `FRONTEND_BACKEND_CONNECTION.md`
- **API Service:** `frontend/jobmatch/src/services/api.ts`
- **Backend Docs:** http://localhost:8000/docs (when running)

---

**Need help?** Check logs in both terminals for errors!
