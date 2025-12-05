# 🔐 Backend Auth Update - Complete Guide

## 📋 What Was Done

We've successfully migrated the authentication system from the old `companies` table to the new `corp_users` table with 545+ company accounts.

---

## ✅ Files Updated

### 1. **auth.py** - Login & User Info
**Path:** `backend/app/api/v1/auth.py`

**Changes:**
- ✅ Now queries `corp_users` table instead of `companies`
- ✅ Uses `passlib` for password verification (same as migration script)
- ✅ Returns `company_name` (for DB queries) AND `company_display_name` (for UI)
- ✅ JWT token includes both company fields
- ✅ `/auth/me` endpoint includes job count

### 2. **deps.py** - Current User Dependency
**Path:** `backend/app/api/deps.py`

**Changes:**
- ✅ `CompanyUser` dataclass updated with new fields
- ✅ `get_current_user()` queries `corp_users` table
- ✅ Checks `is_active` status
- ✅ Returns `company_name` for exact DB matching

### 3. **corporate.py** - Company Jobs API
**Path:** `backend/app/api/v1/corporate.py`

**Changes:**
- ✅ `extract_company_from_user()` uses `company_name` field
- ✅ No longer relies on email parsing
- ✅ Works with `CompanyUser` from `corp_users` table

---

## 🚀 How to Test

### **Step 1: Fix Orphaned Companies (Optional)**

If you saw 6 orphaned companies in the output, run:

```bash
cd C:\Dev\ai-job-matchingV2\backend
python fix_orphaned_companies.py
```

This creates accounts for:
- Avic International
- Multichoice
- Zambia National Commercial Bank (Zanaco)
- Zanaco
- Zesco
- Zesco Limited

---

### **Step 2: Restart Backend**

```bash
cd C:\Dev\ai-job-matchingV2\backend

# Stop current backend (Ctrl+C)

# Start with new auth system
python -m uvicorn app.main:app --reload
```

---

### **Step 3: Test Login**

```bash
# Run automated test
python test_new_auth.py
```

**Expected Output:**
```
✅ Login successful!
   Company: Zesco
   Company Name (DB): Zesco
   Email: zesco@company.zm
   
   📋 User Info:
      Full Name: Zesco
      Company: Zesco
      Role: recruiter
      Job Count: 18
   
   💼 Jobs: 18 jobs found
      ✅ All jobs belong to Zesco
```

---

### **Step 4: Test in Browser**

1. **Clear browser cache!** (F12 → Application → Clear Storage)
2. Go to `http://localhost:3000/login`
3. Try these accounts:

| Email | Password | Expected Jobs |
|-------|----------|---------------|
| `zesco@company.zm` | `password123` | 18 Zesco jobs |
| `zanaco@company.zm` | `password123` | Zanaco jobs |
| `zesco limited@company.zm` | `password123` | Zesco Limited jobs |

4. **Verify:**
   - ✅ Login works
   - ✅ Dashboard shows company name
   - ✅ Jobs page shows ONLY that company's jobs
   - ✅ No jobs from other companies

---

## 🔧 Company Name Matching

### **How It Works:**

1. **User logs in** → JWT token contains `company_name: "Zesco"`
2. **Frontend calls** `/api/corporate/jobs`
3. **Backend extracts** company from token: `user.company_name = "Zesco"`
4. **Query filters** jobs: `WHERE company = 'Zesco'`
5. **Returns** only Zesco jobs

### **Critical:** Company names MUST match exactly!

```sql
-- ✅ WORKS - Exact match
user.company_name = "Zesco"
corporate_jobs.company = "Zesco"

-- ❌ FAILS - Case mismatch
user.company_name = "zesco"
corporate_jobs.company = "Zesco"

-- ❌ FAILS - Different names
user.company_name = "Zesco"
corporate_jobs.company = "Zesco Limited"
```

---

## ⚠️ Troubleshooting

### **Issue 1: Login fails with "Incorrect email or password"**

**Check:**
```bash
# Verify account exists
psql -U postgres -d job_match_db

SELECT email, company_name, is_active FROM corp_users WHERE email = 'zesco@company.zm';
```

**Should show:**
```
         email          | company_name | is_active 
------------------------+--------------+-----------
 zesco@company.zm       | Zesco        | t
```

**Fix if missing:**
```bash
python populate_all_corp_users.py
```

---

### **Issue 2: Login works but no jobs appear**

**Check company name matching:**
```bash
psql -U postgres -d job_match_db

-- Check user's company name
SELECT email, company_name FROM corp_users WHERE email = 'zesco@company.zm';

-- Check jobs for that company
SELECT COUNT(*), company FROM corporate_jobs WHERE company = 'Zesco' GROUP BY company;
```

**If company names don't match:**
```sql
-- Option 1: Update user to match jobs
UPDATE corp_users SET company_name = 'Exact Job Company Name' WHERE email = 'user@company.zm';

-- Option 2: Update jobs to match user
UPDATE corporate_jobs SET company = 'User Company Name' WHERE company = 'Job Company Name';
```

---

### **Issue 3: See jobs from other companies**

**This means company isolation isn't working.**

**Check backend logs:**
```bash
# Look for this in uvicorn terminal:
"✅ User found: Zesco (ID: 123)"
"Company extracted: Zesco"
```

**Verify token:**
```javascript
// In browser console (F12):
localStorage.getItem('token')
// Copy token

// Decode at jwt.io - should show:
{
  "company_name": "Zesco",
  "company_display_name": "Zesco"
}
```

---

### **Issue 4: Password verification fails**

**The migration script uses `passlib.CryptContext` and so does the updated auth.py.**

**If passwords still fail:**
```bash
# Regenerate all passwords
cd C:\Dev\ai-job-matchingV2\backend
python populate_all_corp_users.py
# This will update existing accounts with fresh password hashes
```

---

## 📊 Database Schema

### **corp_users Table:**
```sql
CREATE TABLE corp_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,      -- For DB queries (exact match)
    company_display_name VARCHAR(255),        -- For UI display
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **JWT Token Structure:**
```json
{
  "sub": "123",
  "email": "zesco@company.zm",
  "company_name": "Zesco",           // For filtering jobs
  "company_display_name": "Zesco",   // For UI display
  "role": "recruiter"
}
```

---

## ✅ Success Criteria

After updating auth, verify:

- [ ] Can login with any `company@company.zm` account
- [ ] Password `password123` works for all accounts
- [ ] Dashboard shows correct company name
- [ ] Jobs page shows ONLY that company's jobs
- [ ] `/auth/me` returns company info with job count
- [ ] Token includes `company_name` field
- [ ] No 401 errors in console
- [ ] Company isolation works (Zesco can't see Zanaco jobs)

---

## 🎯 Quick Commands

```bash
# Fix orphaned companies
python fix_orphaned_companies.py

# Restart backend
python -m uvicorn app.main:app --reload

# Test auth system
python test_new_auth.py

# Check database
psql -U postgres -d job_match_db

# View all companies
SELECT email, company_name, is_active FROM corp_users ORDER BY company_name;

# Count jobs per company
SELECT company, COUNT(*) FROM corporate_jobs GROUP BY company ORDER BY company;

# Verify matching
SELECT 
    cu.company_name as user_company,
    COUNT(cj.job_id) as job_count
FROM corp_users cu
LEFT JOIN corporate_jobs cj ON cu.company_name = cj.company
GROUP BY cu.company_name
ORDER BY user_company;
```

---

## 🚀 Next Steps

Once auth is working:

1. ✅ Test candidate matching
2. ✅ Add company logo display
3. ✅ Add job posting feature
4. ✅ Polish UI/UX

---

## 💡 Key Points

- **545+ company accounts** created automatically
- **All use same password:** `password123`
- **Company isolation** via exact name matching
- **Two company fields:**
  - `company_name` = For DB queries (exact)
  - `company_display_name` = For UI display (pretty)
- **Job count** included in `/auth/me` response
- **Active status** checked on every request

---

**Run the test script and let's make sure everything works!** 🎉
