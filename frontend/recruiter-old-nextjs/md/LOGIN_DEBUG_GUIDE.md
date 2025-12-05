# 🔍 LOGIN DEBUG GUIDE

## The Problem
You were getting a **422 Unprocessable Content** error when trying to log in.

## The Root Cause
The backend uses FastAPI's `OAuth2PasswordRequestForm` which expects:
- **Content-Type**: `application/x-www-form-urlencoded` (not JSON!)
- **Fields**: `username` and `password` (sent as form data)

The frontend was sending:
- **Content-Type**: `application/json` ❌
- **Body**: JSON object ❌

---

## ✅ What I Fixed

### 1. Frontend Auth Service (`auth.service.ts`)
**Changed from:**
```typescript
const payload = {
  username: credentials.email,
  password: credentials.password
};

await axios.post(url, payload, {
  headers: { 'Content-Type': 'application/json' }
});
```

**To:**
```typescript
const formData = new URLSearchParams();
formData.append('username', credentials.email);
formData.append('password', credentials.password);

await axios.post(url, formData, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
```

### 2. Added Detailed Logging
**Frontend (`auth.service.ts`):**
- Logs the exact payload being sent
- Shows full error responses
- Displays headers and status codes

**Backend (`auth.py`):**
- Logs every login attempt
- Shows username received
- Lists all users if login fails
- Verifies password validation
- Confirms token creation

---

## 🚀 How to Test

### Step 1: Create Test User
```bash
cd C:\Dev\ai-job-matchingV2\backend
python -m scripts.create_test_recruiter
```

**Test Credentials:**
- Email: `recruiter@zedsafe.com`
- Password: `test123`

### Step 2: Start Backend (with logs)
```bash
cd C:\Dev\ai-job-matchingV2\backend
uvicorn app.main:app --reload --log-level info
```

### Step 3: Start Frontend
```bash
cd C:\Dev\ai-job-matchingV2\frontend\recruiter
npm run dev
```

### Step 4: Try Logging In
1. Go to http://localhost:3000/login
2. Enter: `recruiter@zedsafe.com` / `test123`
3. Click "Sign In"

### Step 5: Check Browser Console
Open Developer Tools (F12) and check the Console tab:

**Success looks like:**
```
=== LOGIN DEBUG INFO ===
API URL: http://localhost:8000/api/auth/login
Form Data being sent: { username: "recruiter@zedsafe.com", password: "***hidden***" }
Content-Type: application/x-www-form-urlencoded
✅ Login successful!
Response status: 200
Response data: { access_token: "...", token_type: "bearer", user: {...} }
```

**Error looks like:**
```
=== LOGIN ERROR DEBUG ===
❌ Server responded with error
Status code: 422
Response data: { detail: [...] }
```

### Step 6: Check Backend Terminal
You should see:

**Success:**
```
INFO: === LOGIN ATTEMPT ===
INFO: Username (email) received: recruiter@zedsafe.com
INFO: Password received: ***hidden***
INFO: ✅ User found: recruiter@zedsafe.com (ID: 1)
INFO: Password verification result: True
INFO: ✅ Password verified successfully
INFO: ✅ Access token created for user: recruiter@zedsafe.com
```

**Failure (user not found):**
```
INFO: === LOGIN ATTEMPT ===
INFO: Username (email) received: recruiter@zedsafe.com
WARNING: ❌ User not found with email: recruiter@zedsafe.com
INFO: Available users in database:
INFO:   - existing@user.com (ID: 1)
```

**Failure (wrong password):**
```
INFO: === LOGIN ATTEMPT ===
INFO: Username (email) received: recruiter@zedsafe.com
INFO: ✅ User found: recruiter@zedsafe.com (ID: 1)
INFO: Password verification result: False
WARNING: ❌ Invalid password for user: recruiter@zedsafe.com
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "422 Unprocessable Entity"
**Cause**: Wrong Content-Type or malformed data
**Solution**: Already fixed! Make sure you're using the updated `auth.service.ts`

### Issue 2: "User not found"
**Cause**: No user exists with that email
**Solution**: Run the test user script:
```bash
cd C:\Dev\ai-job-matchingV2\backend
python -m scripts.create_test_recruiter
```

### Issue 3: "Incorrect email or password"
**Causes:**
- Wrong password
- User's password hash is corrupted
**Solution**: Recreate the user (delete old one first):
```python
# In Python shell or script
from app.db.session import SessionLocal
from app.models.user import User

db = SessionLocal()
old_user = db.query(User).filter(User.email == "recruiter@zedsafe.com").first()
if old_user:
    db.delete(old_user)
    db.commit()

# Then run the create_test_recruiter.py script again
```

### Issue 4: "No response from server"
**Causes:**
- Backend not running
- Wrong API URL
- CORS issues

**Solution:**
1. Check backend is running: http://localhost:8000/docs
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```
3. Restart both servers

### Issue 5: Cookie/Token Issues
**Symptoms**: Login succeeds but user is logged out immediately
**Solution**: Check cookie settings in `auth.service.ts`:
```typescript
// For local development (HTTP)
document.cookie = `${this.TOKEN_KEY}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

// For production (HTTPS)
document.cookie = `${this.TOKEN_KEY}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
```

---

## 📊 Debugging Checklist

Before asking for help, check:

- [ ] Backend is running (http://localhost:8000/docs works)
- [ ] Frontend is running (http://localhost:3000 works)
- [ ] Test user exists (run create_test_recruiter.py)
- [ ] Correct credentials: `recruiter@zedsafe.com` / `test123`
- [ ] Browser console shows detailed logs
- [ ] Backend terminal shows login attempt logs
- [ ] No CORS errors in browser console
- [ ] `.env.local` has correct `NEXT_PUBLIC_API_URL`

---

## 🎯 What to Check Next

### Browser Console (F12 → Console)
Look for:
```
=== LOGIN DEBUG INFO ===
```

### Backend Terminal
Look for:
```
INFO: === LOGIN ATTEMPT ===
```

### Network Tab (F12 → Network)
1. Click "Sign In"
2. Find the `login` request
3. Check:
   - **Request URL**: Should be `http://localhost:8000/api/auth/login`
   - **Request Method**: POST
   - **Request Headers**: `Content-Type: application/x-www-form-urlencoded`
   - **Form Data**: `username=recruiter@zedsafe.com&password=test123`
   - **Status Code**: Should be 200 (not 422!)

---

## 🔬 Advanced Debugging

### Test Backend Directly with cURL
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=recruiter@zedsafe.com&password=test123"
```

**Expected Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "recruiter@zedsafe.com",
    "full_name": "ZedSafe Recruiter",
    "role": "candidate",
    "profile_completed": true
  }
}
```

### Test with Postman
1. Create POST request to `http://localhost:8000/api/auth/login`
2. Set Body type to `x-www-form-urlencoded`
3. Add:
   - Key: `username` Value: `recruiter@zedsafe.com`
   - Key: `password` Value: `test123`
4. Send

---

## 📝 Summary

**Problem**: 422 error due to wrong Content-Type
**Solution**: Changed from JSON to form-urlencoded
**Testing**: Detailed logs in both frontend and backend
**Next Steps**: Create test user → Try logging in → Check logs

The login should work now! 🎉
