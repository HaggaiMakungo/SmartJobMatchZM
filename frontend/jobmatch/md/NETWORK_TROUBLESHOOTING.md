# 🔧 Network Connection Troubleshooting Guide

## ❌ Error: Network Error / Cannot Connect to Backend

You're seeing this error because your React Native app can't connect to your FastAPI backend.

---

## ✅ Quick Fix Checklist

### 1. **Is Your Backend Running?**

Open a terminal and run:
```bash
cd C:\Dev\ai-job-matching\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 2. **Test Backend from Browser**

Open your phone's browser (Chrome/Safari) and go to:
```
http://192.168.1.28:8000/health
```

**Expected Response:**
```json
{"status": "ok"}
```

**If this doesn't work:**
- Your backend isn't accessible from your phone
- Continue to Step 3

### 3. **Are You on the Same WiFi Network?**

✅ **CRITICAL**: Your phone and computer MUST be on the **same WiFi network**!

- Computer WiFi: Check your WiFi settings
- Phone WiFi: Make sure you're connected to the SAME network
- **NOT mobile data** - turn off mobile data on your phone!

### 4. **Check Your Computer's IP Address**

Your current IP is: `192.168.1.28`

**Verify this is correct:**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active WiFi adapter.

**Mac/Linux:**
```bash
ifconfig | grep inet
```

**If your IP changed:**
1. Update `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://YOUR_NEW_IP:8000/api'  // ← Update this
     : 'https://your-production-api.com/api';
   ```
2. Restart the app: `npm start -- --clear`

### 5. **Firewall Blocking?**

**Windows Firewall:**
1. Search "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Make sure Python is allowed for **Private networks**

**Or temporarily disable firewall to test:**
```bash
# Run as Administrator
netsh advfirewall set allprofiles state off
```

**Don't forget to turn it back on:**
```bash
netsh advfirewall set allprofiles state on
```

### 6. **Test with Network Diagnostic Tool**

In your app:
1. Go to Login screen
2. Tap "🔧 Network Diagnostic Tool"
3. Tap "Run Full Diagnostic"
4. Share the results with me

---

## 🔍 Common Issues & Solutions

### Issue: "Network Error" immediately

**Cause**: Backend not running or wrong IP

**Solution:**
```bash
# Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test from computer browser
http://localhost:8000/health

# Test from phone browser
http://192.168.1.28:8000/health
```

### Issue: Works on computer browser but not in app

**Cause**: Firewall blocking mobile connections

**Solution:**
1. Add Python to firewall exceptions
2. Or use `--tunnel` mode in Expo:
   ```bash
   npm start -- --tunnel
   ```

### Issue: "Connection refused" or "Timeout"

**Cause**: Backend not listening on all interfaces

**Solution:**
Make sure you're using `--host 0.0.0.0` when starting uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

NOT:
```bash
uvicorn app.main:app --reload  # ❌ Only localhost
```

### Issue: CORS Error

**Cause**: Backend CORS not configured for your IP

**Solution:**
Check `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://192.168.1.28:8000
```

Add your frontend origin if needed.

---

## 🧪 Testing Steps (Do These in Order)

### Step 1: Test Backend on Computer
```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
# Terminal 2: Test from computer
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### Step 2: Test from Phone Browser
Open phone browser → `http://192.168.1.28:8000/health`

**If this works**: Backend is accessible ✅  
**If this fails**: Network/firewall issue ❌

### Step 3: Test Login from Phone Browser
Try this URL in phone browser:
```
http://192.168.1.28:8000/docs
```

This opens FastAPI's interactive API documentation. Try logging in there.

### Step 4: Test in App
Use the "Network Diagnostic Tool" button on login screen.

---

## 🚀 Alternative: Use Expo Tunnel Mode

If nothing works, use Expo's tunnel mode (slower but bypasses network issues):

```bash
npm start -- --tunnel
```

This creates a public URL that works even if you're on different networks!

---

## 📱 Current Configuration

Your app is configured to connect to:
- **Development**: `http://192.168.1.28:8000/api`
- **Production**: `https://your-production-api.com/api`

Backend endpoints:
- Health: `/health`
- API Health: `/api/health`
- Login: `/api/auth/login`
- Register: `/api/auth/register`

---

## 🆘 Still Not Working?

Run these and share the output:

**1. Check backend is running:**
```bash
netstat -an | findstr :8000
```
Should show: `0.0.0.0:8000`

**2. Test backend:**
```bash
curl http://localhost:8000/health
```

**3. Test from your IP:**
```bash
curl http://192.168.1.28:8000/health
```

**4. Check firewall:**
```bash
netsh advfirewall show allprofiles state
```

**5. Get detailed error from app:**
Use the Network Diagnostic Tool and share the full output.

---

## ✅ Success Checklist

- [ ] Backend is running (`uvicorn ... --host 0.0.0.0`)
- [ ] Both devices on same WiFi
- [ ] Phone can access `http://192.168.1.28:8000/health` in browser
- [ ] Firewall allows Python through
- [ ] IP address in `api.ts` matches your computer's IP
- [ ] Network Diagnostic Tool shows all tests passing

---

**Once you complete these steps, let me know which test failed and I'll help you fix it!** 🚀
