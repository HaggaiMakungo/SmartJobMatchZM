# 🔧 Recruiter Dashboard Login Fix

**Issue:** Cannot login to recruiter dashboard  
**Status:** 🔍 DIAGNOSING  
**Date:** November 14, 2025, 3:45 AM

---

## 🎯 Issues Found

### Issue #1: HR Manager User Not Created ❌
**Problem:** The seed script `seed_hr_manager.py` hasn't been run yet.

**Solution:**
```bash
cd C:\Dev\ai-job-matchingV2\backend
python seed_hr_manager.py
```

**Expected Output:**
```
🎉 HR Manager Created Successfully!

==================================================
LOGIN CREDENTIALS
==================================================
Name:     Chipo Musonda
Email:    chipo.musonda@zedsafe.co.zm
Password: ZedSafe2024
Company:  ZedSafe Logistics
Role:     HR Manager
==================================================
```

---

### Issue #2: Backend Auth Response Mismatch ⚠️
**Problem:** The backend `/auth/login` endpoint returns:
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": { ... }  // ✅ This is good
}
```

But the frontend expects:
```typescript
// useAuth.tsx line 62-63
const { access_token, user: userData } = response.data;
```

**Status:** ✅ This is actually CORRECT! The destructuring matches.

---

### Issue #3: API URL Configuration ⚠️
**Current:** `http://localhost:8000/api`  
**Backend Endpoints:** 
- ✅ `/api/auth/login` (correct)
- ✅ `/api/auth/me` (correct)

**Status:** ✅ Configuration is CORRECT!

---

### Issue #4: CORS Issues? 🤔
**Check:** Does the backend allow the Next.js origin?

**Backend CORS Config:**
```python
# Should be in app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✅ Step-by-Step Fix

### Step 1: Verify Backend is Running
```bash
# Terminal 1
cd C:\Dev\ai-job-matchingV2\backend
python -m uvicorn app.main:app --reload

# Should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

### Step 2: Create HR Manager User
```bash
# Same terminal or new one
python seed_hr_manager.py

# Expected: Success message with login credentials
```

### Step 3: Verify User Created
```bash
# Test login with curl
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=chipo.musonda@zedsafe.co.zm&password=ZedSafe2024"

# Expected: JSON with access_token and user data
```

### Step 4: Start Recruiter Dashboard
```bash
# Terminal 2
cd C:\Dev\ai-job-matchingV2\frontend\recruiter
npm run dev

# Open: http://localhost:3000/login
```

### Step 5: Login
```
Email:    chipo.musonda@zedsafe.co.zm
Password: ZedSafe2024
```

---

## 🐛 Debugging Tips

### If you see "Network Error":
1. Check backend is running on port 8000
2. Check browser console for CORS errors
3. Verify .env.local has correct API URL

### If you see "Invalid email or password":
1. Verify HR Manager user was created (run seed script)
2. Check email spelling (zedsafe.co.zm NOT zedsafe.com)
3. Try Brian's credentials as fallback:
   - Email: brian.mwale@example.com
   - Password: Brian123

### If you see "401 Unauthorized":
1. Check token is being sent in request headers
2. Check backend logs for authentication errors
3. Clear browser localStorage and try again

### Browser Console Commands:
```javascript
// Check if token is stored
localStorage.getItem('access_token')

// Check stored user
JSON.parse(localStorage.getItem('user'))

// Clear auth and retry
localStorage.clear()
location.reload()
```

---

## 📊 Expected Login Flow

```
1. User enters email/password
   ↓
2. Frontend sends POST to /api/auth/login
   Headers: Content-Type: application/x-www-form-urlencoded
   Body: username=...&password=...
   ↓
3. Backend verifies credentials
   ↓
4. Backend returns:
   {
     "access_token": "eyJ...",
     "token_type": "bearer",
     "user": {
       "id": 123,
       "email": "chipo.musonda@zedsafe.co.zm",
       "full_name": "Chipo Musonda",
       "role": "candidate",
       "profile_completed": true
     }
   }
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend stores user in localStorage
   ↓
7. Frontend redirects to /dashboard
   ↓
8. Dashboard makes API calls with token in headers:
   Authorization: Bearer eyJ...
```

---

## 🔍 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| HR Manager not created | "Invalid email or password" | Run `seed_hr_manager.py` |
| Backend not running | "Network Error" | Start backend with uvicorn |
| Wrong port | Connection refused | Check backend port 8000 |
| CORS error | Console error | Add localhost:3000 to CORS |
| Token not saved | Login works but redirects back | Check localStorage code |
| Wrong API URL | 404 errors | Verify .env.local |

---

## ✅ Verification Checklist

After fix, verify:
- [ ] Backend running on http://localhost:8000
- [ ] HR Manager user created
- [ ] Can login with chipo.musonda@zedsafe.co.zm
- [ ] Token stored in localStorage
- [ ] User stored in localStorage
- [ ] Redirects to /dashboard
- [ ] Dashboard shows data (no 401 errors)

---

## 📝 Test Accounts

### HR Manager (Corporate Jobs)
- **Name:** Chipo Musonda
- **Email:** chipo.musonda@zedsafe.co.zm
- **Password:** ZedSafe2024
- **Company:** ZedSafe Logistics
- **Use For:** Recruiter Dashboard

### Job Seeker (Testing)
- **Name:** Brian Mwale
- **Email:** brian.mwale@example.com
- **Password:** Brian123
- **Use For:** Mobile App

### Employer (Personal Jobs)
- **Name:** Mark Ziligone
- **Email:** mark.ziligone@example.com
- **Password:** Mark123
- **Use For:** Mobile App (Employer)

---

**Status:** Ready to fix! Start with Step 1 above.  
**Time to Fix:** 5-10 minutes  
**Made in Zambia** 🇿🇲
