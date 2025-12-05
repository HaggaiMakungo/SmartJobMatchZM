# 🚀 QUICK START - Login Fix

## ⚡ 3-Step Fix

### 1️⃣ Create Test User
```bash
cd C:\Dev\ai-job-matchingV2\backend
python -m scripts.create_test_recruiter
```

**You'll see:**
```
✅ Test recruiter account created successfully!
   Email: recruiter@zedsafe.com
   ID: 1
   Full Name: ZedSafe Recruiter

🔐 Credentials:
   Email: recruiter@zedsafe.com
   Password: test123
```

---

### 2️⃣ Test Backend (Optional but Recommended)
```bash
python -m scripts.test_login
```

**You should see:**
```
✅ SUCCESS! Login endpoint is working!
📦 Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "recruiter@zedsafe.com",
    ...
  }
}
```

---

### 3️⃣ Try Logging In
1. Make sure backend is running:
   ```bash
   cd C:\Dev\ai-job-matchingV2\backend
   uvicorn app.main:app --reload
   ```

2. Make sure frontend is running:
   ```bash
   cd C:\Dev\ai-job-matchingV2\frontend\recruiter
   npm run dev
   ```

3. Go to http://localhost:3000/login

4. Enter:
   - **Email**: `recruiter@zedsafe.com`
   - **Password**: `test123`

5. Click **"Sign In"**

6. You should see:
   - ✅ "Login successful! Redirecting..." toast
   - ✅ Redirect to `/dashboard`

---

## ✅ Success Checklist

- [ ] Test user created
- [ ] Backend running (http://localhost:8000/docs)
- [ ] Frontend running (http://localhost:3000)
- [ ] Login works (no 422 error)
- [ ] Redirects to dashboard
- [ ] Browser console shows success logs
- [ ] Backend terminal shows login attempt logs

---

## 🐛 Troubleshooting

### Still getting 422 error?
```bash
# Make sure frontend code is updated
cd C:\Dev\ai-job-matchingV2\frontend\recruiter
# Hard refresh browser (Ctrl + Shift + R)
# Or restart dev server
npm run dev
```

### User not found?
```bash
cd C:\Dev\ai-job-matchingV2\backend
python -m scripts.create_test_recruiter
```

### Backend not responding?
```bash
# Check if backend is running
curl http://localhost:8000/docs
# Or visit in browser: http://localhost:8000/docs
```

### Need detailed help?
Read: `LOGIN_DEBUG_GUIDE.md` for comprehensive debugging

---

## 📝 What Was Changed?

### Fixed Files:
1. ✅ `auth.service.ts` - Now sends form data instead of JSON
2. ✅ `auth.py` - Added detailed logging

### New Files:
1. ✅ `create_test_recruiter.py` - Creates test user
2. ✅ `test_login.py` - Tests login endpoint
3. ✅ `LOGIN_DEBUG_GUIDE.md` - Full debugging guide

---

## 🎉 That's It!

Your login should work now. If it doesn't:
1. Check the browser console (F12)
2. Check the backend terminal
3. Read `LOGIN_DEBUG_GUIDE.md`
4. Run `test_login.py` to verify backend

**Happy coding! 🚀**
