# 🔗 Frontend-Backend Connection Guide

## 📍 Current Configuration

**Your IP Address:** `192.168.1.28`  
**Backend URL:** `http://192.168.1.28:8000`  
**API Base URL:** `http://192.168.1.28:8000/api`

---

## 🔧 Changing Network IP (When You Switch WiFi/Network)

### Step 1: Find Your New IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address.

### Step 2: Update Frontend API Configuration

**File:** `frontend/jobmatch/src/services/api.ts`

**Line 5-7:** Update the IP address:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_NEW_IP:8000/api'  // 👈 Change this
  : 'https://your-production-api.com/api';
```

**Example:**
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.28:8000/api'  // Your current IP
  : 'https://your-production-api.com/api';
```

### Step 3: Restart Expo

```bash
cd frontend/jobmatch
# Kill the current Expo process (Ctrl+C)
npm start
```

---

## 👥 Test User Credentials

### 1. Mark Ziligone (Personal Employer)
- **Email:** `mark.ziligone@example.com`
- **Password:** `test123`
- **Role:** Personal Employer (posts small jobs/gigs)
- **Use for:** Testing employer features, posting jobs

### 2. Brian Mwale (Job Seeker)
- **Email:** `brian.mwale@example.com`
- **Password:** `test123`
- **Role:** Candidate/Job Seeker
- **Use for:** Testing job search, applications, matching

---

## 🚀 Quick Setup Steps

### 1. Seed Test Users (First Time Only)

```bash
cd C:\Dev\ai-job-matchingV2\backend
python seed_test_users.py
```

**Expected Output:**
```
✅ Added: Mark Ziligone (mark.ziligone@example.com)
✅ Added: Brian Mwale (brian.mwale@example.com)
```

### 2. Start Backend Server

```bash
cd C:\Dev\ai-job-matchingV2\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:**
- Local: `http://localhost:8000`
- Network: `http://192.168.1.28:8000`
- API Docs: `http://192.168.1.28:8000/docs`

### 3. Start Frontend (Expo)

```bash
cd C:\Dev\ai-job-matchingV2\frontend\jobmatch
npm start
```

### 4. Open on Phone

1. Install **Expo Go** app on your phone
2. Scan the QR code from the terminal
3. Make sure your phone is on the **same WiFi network** as your computer

---

## 🔍 Testing the Connection

### Test 1: Backend Health Check

Open in browser: `http://192.168.1.28:8000/docs`

You should see the FastAPI documentation page.

### Test 2: Login from Mobile App

1. Open app in Expo Go
2. Try logging in with:
   - **Email:** `brian.mwale@example.com`
   - **Password:** `test123`

### Test 3: Check Console Logs

**Backend logs should show:**
```
INFO:     192.168.1.X:XXXXX - "POST /api/auth/login HTTP/1.1" 200 OK
```

**Frontend logs should show:**
```
📡 API Base URL: http://192.168.1.28:8000/api
🔵 API Request: POST /auth/login
✅ API Response: POST /auth/login - 200
```

---

## 🐛 Troubleshooting

### Issue 1: "Network Error" in Mobile App

**Cause:** Phone can't reach backend

**Solutions:**
1. ✅ Verify phone and computer are on **same WiFi**
2. ✅ Check IP address is correct in `api.ts`
3. ✅ Make sure backend is running on `0.0.0.0` (not `127.0.0.1`)
4. ✅ Disable Windows Firewall temporarily to test
5. ✅ Try accessing `http://192.168.1.28:8000/docs` from phone browser

### Issue 2: "401 Unauthorized"

**Cause:** Invalid credentials or user doesn't exist

**Solutions:**
1. ✅ Run `python seed_test_users.py` to add users
2. ✅ Verify email/password are correct
3. ✅ Check backend logs for error details

### Issue 3: Backend Not Accessible from Phone

**Cause:** Firewall or network restrictions

**Solutions:**
1. ✅ Make sure you started backend with `--host 0.0.0.0`
2. ✅ Add firewall exception:
   ```bash
   # Windows Firewall
   netsh advfirewall firewall add rule name="FastAPI Dev" dir=in action=allow protocol=TCP localport=8000
   ```
3. ✅ Try connecting from another device to verify network works

### Issue 4: Can't Find IP Address

**Windows:**
```bash
ipconfig | findstr IPv4
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

Or check in:
- Windows: Settings > Network > WiFi > Properties
- Mac: System Preferences > Network
- Linux: Network Settings

---

## 📁 Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `frontend/jobmatch/src/services/api.ts` | API base URL | **Every network change** |
| `backend/seed_test_users.py` | Test user seeding | First time setup |
| `backend/.env` | Backend config | Database password, secrets |
| `backend/app/api/v1/auth.py` | Auth endpoints | Modify login logic |

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Get your IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Seed test users
cd backend
python seed_test_users.py

# Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend
cd frontend/jobmatch
npm start

# Check backend is accessible
curl http://192.168.1.28:8000/docs
```

---

## 🔐 Security Note

**⚠️ Test credentials are for development only!**

- Simple password: `test123`
- Never use in production
- Change passwords for production deployment
- Add proper password requirements

---

## 📞 Next Steps

1. ✅ Run `python seed_test_users.py`
2. ✅ Start backend with `--host 0.0.0.0`
3. ✅ Update IP in `api.ts` to `192.168.1.28`
4. ✅ Start frontend with `npm start`
5. ✅ Login with test credentials
6. ✅ Test job posting and matching!

---

**Last Updated:** November 12, 2025  
**Your IP:** 192.168.1.28  
**Status:** Ready to test! 🚀
