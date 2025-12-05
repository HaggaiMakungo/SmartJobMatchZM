# ✅ Frontend-Backend Connection - Complete!

## What Was Done

### 1. ✅ Updated API Base URL
**File:** `frontend/jobmatch/src/services/api.ts`
- Changed IP from `192.168.169.60` to `192.168.1.28`
- Added clear comment for future network changes

### 2. ✅ Created Test User Seeding Script
**File:** `backend/seed_test_users.py`
- Adds Mark Ziligone (personal employer)
- Adds Brian Mwale (job seeker)
- Simple password: `test123` for both

### 3. ✅ Created Setup Scripts
**File:** `backend/start_dev.bat`
- One-click setup for development
- Seeds users + starts backend

### 4. ✅ Created Documentation
**File:** `NETWORK_SETUP.md` (project root)
- Complete guide for network changes
- Troubleshooting steps
- Quick command reference

---

## 🚀 How to Start

### Option 1: Quick Start (Automated)

```bash
cd C:\Dev\ai-job-matchingV2\backend
start_dev.bat
```

This will:
1. Seed test users
2. Start backend server
3. Show login credentials

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd C:\Dev\ai-job-matchingV2\backend
python seed_test_users.py  # First time only
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd C:\Dev\ai-job-matchingV2\frontend\jobmatch
npm start
```

---

## 👥 Test User Credentials

### Mark Ziligone (Personal Employer)
```
Email: mark.ziligone@example.com
Password: test123
Role: employer_personal
```

### Brian Mwale (Job Seeker)
```
Email: brian.mwale@example.com
Password: test123
Role: candidate
```

---

## 📱 Testing on Phone

1. ✅ Make sure phone is on **same WiFi** as computer
2. ✅ Backend running at `http://192.168.1.28:8000`
3. ✅ Frontend started with `npm start`
4. ✅ Scan QR code with **Expo Go** app
5. ✅ Login with test credentials

---

## 🔧 When You Change Networks

### Quick Steps:

1. **Find your new IP:**
   ```bash
   ipconfig  # Windows
   ```

2. **Update frontend API file:**
   - File: `frontend/jobmatch/src/services/api.ts`
   - Line 7: Change to your new IP
   ```typescript
   ? 'http://YOUR_NEW_IP:8000/api'
   ```

3. **Restart frontend:**
   ```bash
   # Kill current process (Ctrl+C)
   npm start
   ```

**That's it!** Backend doesn't need changes.

---

## 🎯 Current Configuration

| Component | Value |
|-----------|-------|
| Your IP | `192.168.1.28` |
| Backend URL | `http://192.168.1.28:8000` |
| API Docs | `http://192.168.1.28:8000/docs` |
| Frontend Config File | `frontend/jobmatch/src/services/api.ts` |
| Test Password | `test123` |

---

## 🐛 Quick Troubleshooting

### Can't connect from phone?

1. ✅ Phone on same WiFi?
2. ✅ Backend started with `--host 0.0.0.0`?
3. ✅ IP correct in `api.ts`?
4. ✅ Try opening `http://192.168.1.28:8000/docs` in phone browser

### Login fails?

1. ✅ Run `python seed_test_users.py`
2. ✅ Check backend logs for errors
3. ✅ Verify credentials are exactly:
   - Email: `mark.ziligone@example.com` or `brian.mwale@example.com`
   - Password: `test123`

---

## 📁 Files Modified/Created

```
ai-job-matchingV2/
├── NETWORK_SETUP.md ✨ (New - Complete guide)
├── backend/
│   ├── seed_test_users.py ✨ (New - Adds test users)
│   └── start_dev.bat ✨ (New - Quick start script)
└── frontend/jobmatch/src/services/
    └── api.ts ✅ (Updated - New IP: 192.168.1.28)
```

---

## 🎉 You're Ready!

Everything is configured and ready to test. Follow the **Quick Start** steps above and you'll be connected in minutes!

**Need help?** Check `NETWORK_SETUP.md` for detailed troubleshooting.

---

**Status:** ✅ Complete  
**Date:** November 12, 2025  
**Next Step:** Run `start_dev.bat` and start testing! 🚀
