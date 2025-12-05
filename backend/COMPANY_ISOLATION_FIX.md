# 🎯 COMPANY ISOLATION FIX - Setup Guide

## Problem
Users see ALL jobs from ALL companies instead of just their own company's jobs.

## Solution
Add `company` field to users table and filter jobs by `user.company == job.company`.

---

## 📋 Step-by-Step Instructions

### **Step 1: Check Current Job Company Names**

First, let's see what company names exist in the jobs table:

```bash
cd C:\Dev\ai-job-matchingV2\backend
python check_job_companies.py
```

**Expected Output:**
```
COMPANY NAMES IN CORPORATE_JOBS TABLE
============================================================

Found X unique companies:

  DHL                                      - 12 jobs
  Zanaco                                   - 8 jobs
  Choppies                                 - 10 jobs
  MTN                                      - 6 jobs
  ...
```

📝 **Note down the exact company names** - we'll need to match these exactly in the users table.

---

### **Step 2: Add Company Column to Users Table**

Run the migration script:

```bash
cd C:\Dev\ai-job-matchingV2\backend
python add_company_to_users.py
```

**What it does:**
1. ✅ Adds `company` column to users table
2. ✅ Extracts company from each user's email
3. ✅ Updates all user records with company name
4. ✅ Creates index for performance

**Expected Output:**
```
============================================================
ADDING COMPANY COLUMN TO USERS TABLE
============================================================
Adding company column to users table...
✅ Column added!

Extracting company names from emails...
  ✅ dhl@company.zm -> Company: DHL
  ✅ zanaco@company.zm -> Company: ZANACO
  ✅ choppies@company.zm -> Company: CHOPPIES
  ...

✅ Updated X users with company names!

📊 Final user-company mapping:
  dhl@company.zm                    -> DHL
  zanaco@company.zm                 -> ZANACO
  choppies@company.zm               -> CHOPPIES
  ...

✅ Migration complete!
```

---

### **Step 3: Verify Company Matching**

Now check if user companies match job companies:

```bash
cd C:\Dev\ai-job-matchingV2\backend
python verify_company_matching.py
```

This will show:
- ✅ Companies that match perfectly
- ⚠️ Companies that don't match (case mismatch, etc.)
- 🔧 Suggested fixes

---

### **Step 4: Fix Any Mismatches**

If companies don't match exactly, you have two options:

#### **Option A: Fix User Companies** (Recommended)
Update users table to match job company names:

```sql
-- Example: If jobs use "Zanaco" but users have "ZANACO"
UPDATE users SET company = 'Zanaco' WHERE company = 'ZANACO';
```

#### **Option B: Fix Job Companies**
Update jobs table to match user company names:

```sql
-- Example: If users have "DHL" but jobs use "DHL Express"
UPDATE corporate_jobs SET company = 'DHL' WHERE company = 'DHL Express';
```

---

### **Step 5: Restart Backend**

```bash
cd C:\Dev\ai-job-matchingV2\backend

# Stop current backend (Ctrl+C)

# Start fresh
python -m uvicorn app.main:app --reload
```

---

### **Step 6: Test in Frontend**

```bash
cd C:\Dev\ai-job-matchingV2\frontend\recruiter

# Clear browser cache first! (F12 -> Application -> Clear Storage)

# Login and test
1. Go to http://localhost:3000/login
2. Login: dhl@company.zm / password123
3. Click "Jobs" in sidebar
4. CHECK: Do you see ONLY DHL jobs? ✅
5. Logout
6. Login: zanaco@company.zm / password123
7. CHECK: Do you see ONLY Zanaco jobs? ✅
```

---

## 🔍 Troubleshooting

### **Issue: Users still see all jobs**

**Check 1:** Verify user.company is set
```bash
python -c "from app.db.session import SessionLocal; from app.models.user import User; db = SessionLocal(); users = db.query(User).all(); print([(u.email, u.company) for u in users])"
```

**Check 2:** Verify job.company values
```bash
python check_job_companies.py
```

**Check 3:** Check backend logs
Look for this in terminal:
```
🎯 User company: 'DHL'
   📧 User email: dhl@company.zm
   📊 Total jobs found: 12
```

If it shows "Total jobs found: 0", companies don't match!

---

### **Issue: Company names don't match**

**Example Problem:**
- User has: `company = 'DHL'`
- Jobs have: `company = 'DHL Express'`
- Result: No matches! ❌

**Solution:**
Make them match exactly:
```sql
-- Option 1: Update users
UPDATE users SET company = 'DHL Express' WHERE company = 'DHL';

-- Option 2: Update jobs
UPDATE corporate_jobs SET company = 'DHL' WHERE company = 'DHL Express';
```

---

## 📝 Files Modified

```
✅ backend/app/models/user.py          - Added company field
✅ backend/app/api/v1/corporate.py     - Filters by user.company
🆕 backend/add_company_to_users.py     - Migration script
🆕 backend/check_job_companies.py      - Diagnostic tool
🆕 backend/verify_company_matching.py  - Verification tool
```

---

## ✅ Success Criteria

After these steps:
- ✅ Each user has a `company` value in database
- ✅ User companies match job companies exactly
- ✅ DHL user sees only DHL jobs (12 jobs)
- ✅ Zanaco user sees only Zanaco jobs (8 jobs)
- ✅ No user sees jobs from other companies

---

## 🚀 Next Steps

Once company isolation works:
1. ✅ Move to candidate matching investigation
2. ✅ Check why no candidates appear
3. ✅ Verify CV data quality
4. ✅ Polish UI/UX

---

## 💡 Quick Reference

```bash
# Check job companies
python check_job_companies.py

# Run migration
python add_company_to_users.py

# Verify matching
python verify_company_matching.py

# Restart backend
python -m uvicorn app.main:app --reload

# Test frontend
# Login -> Jobs page -> Should see only YOUR company's jobs
```
