# 🚀 COMPANY ISOLATION FIX - Quick Start

## 🎯 What We're Doing
Adding `company` field to users table so we can filter jobs by company.

---

## ⚡ 3-Step Quick Fix

### 1️⃣ Check What Companies Exist
```bash
cd C:\Dev\ai-job-matchingV2\backend
python check_job_companies.py
```
👀 **Look at the output** - note the exact company names

---

### 2️⃣ Run Migration
```bash
python add_company_to_users.py
```
✅ Adds `company` column to users table  
✅ Sets company from email (dhl@company.zm → "DHL")

---

### 3️⃣ Verify It Worked
```bash
python verify_company_matching.py
```
👀 **Check output:**
- ✅ Perfect matches = Good!
- ⚠️ Mismatches = Need to fix (see below)

---

## 🔧 If Companies Don't Match

**Example:** Users have "DHL" but jobs have "DHL Express"

**Fix:** Make them match exactly
```bash
# Connect to PostgreSQL
psql -U postgres -d camss_db

# Update users to match jobs
UPDATE users SET company = 'DHL Express' WHERE company = 'DHL';

# OR update jobs to match users
UPDATE corporate_jobs SET company = 'DHL' WHERE company = 'DHL Express';

# Exit
\q
```

---

## ✅ Test It

```bash
# 1. Restart backend
cd C:\Dev\ai-job-matchingV2\backend
python -m uvicorn app.main:app --reload

# 2. Clear browser cache (IMPORTANT!)
# F12 -> Application -> Clear Storage -> Clear site data

# 3. Test
# Login: dhl@company.zm / password123
# Go to Jobs page
# Should see ONLY DHL jobs (not all companies)
```

---

## 📊 Expected Results

| User Login | Should See | Should NOT See |
|------------|-----------|----------------|
| dhl@company.zm | 12 DHL jobs | Zanaco, Choppies, MTN jobs |
| zanaco@company.zm | 8 Zanaco jobs | DHL, Choppies, MTN jobs |
| choppies@company.zm | 10 Choppies jobs | DHL, Zanaco, MTN jobs |

---

## ❌ Troubleshooting

### "I still see all companies' jobs"

1. **Check user.company is set:**
   ```bash
   python -c "from app.db.session import SessionLocal; from sqlalchemy import text; db = SessionLocal(); result = db.execute(text('SELECT email, company FROM users')).fetchall(); print(result)"
   ```

2. **Check backend logs** for:
   ```
   🎯 User company: 'DHL'
      📊 Total jobs found: 12
   ```
   If it says "0 jobs", companies don't match!

3. **Run verification again:**
   ```bash
   python verify_company_matching.py
   ```

---

## 🆘 Still Broken?

**Paste this in chat:**
```
Still seeing all companies' jobs. Here's my output from:

1. python check_job_companies.py
[paste output]

2. python verify_company_matching.py
[paste output]

3. Backend logs when I visit Jobs page
[paste logs]
```

---

## 📝 Files Created

```
✅ add_company_to_users.py         - Migration script
✅ check_job_companies.py          - See job companies
✅ verify_company_matching.py      - Verify matching
✅ COMPANY_ISOLATION_FIX.md        - Full guide
✅ QUICK_FIX.md                    - This file
```

---

## 💡 Commands Cheat Sheet

```bash
# Check companies
python check_job_companies.py

# Run migration
python add_company_to_users.py

# Verify
python verify_company_matching.py

# Restart backend
python -m uvicorn app.main:app --reload

# Check user companies (SQL)
psql -U postgres -d camss_db -c "SELECT email, company FROM users;"

# Check job companies (SQL)
psql -U postgres -d camss_db -c "SELECT company, COUNT(*) FROM corporate_jobs GROUP BY company;"
```
