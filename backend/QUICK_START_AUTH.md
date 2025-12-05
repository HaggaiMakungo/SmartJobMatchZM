# 🚀 QUICK START - Auth System Update

## ⏱️ 3-Minute Setup

### **Step 1: Fix Orphaned Companies (30 seconds)**
```bash
cd C:\Dev\ai-job-matchingV2\backend
python fix_orphaned_companies.py
```

### **Step 2: Restart Backend (10 seconds)**
```bash
# Ctrl+C to stop current backend
python -m uvicorn app.main:app --reload
```

### **Step 3: Test Auth (1 minute)**
```bash
python test_new_auth.py
```

**Look for:** `✅ Login successful!` and `✅ All jobs belong to...`

### **Step 4: Test in Browser (1 minute)**
1. **Clear browser cache!** F12 → Application → Clear Storage → Clear site data
2. Go to `http://localhost:3000/login`
3. Login: `zesco@company.zm` / `password123`
4. Click "Jobs" in sidebar
5. **Should see 18 Zesco jobs** (not 999 total jobs!)

---

## ✅ Success = Company Isolation Working!

You should see:
- ✅ Login works
- ✅ Dashboard shows "Zesco"
- ✅ Jobs page shows 18 jobs (all Zesco)
- ✅ No jobs from other companies

---

## ❌ If It Doesn't Work

**Run diagnostics:**
```bash
# Check if accounts exist
psql -U postgres -d job_match_db -c "SELECT email, company_name FROM corp_users WHERE email = 'zesco@company.zm';"

# Check if jobs exist
psql -U postgres -d job_match_db -c "SELECT COUNT(*) FROM corporate_jobs WHERE company = 'Zesco';"

# Check backend logs
# Look at terminal running uvicorn - should show login attempts
```

**Common issues:**
1. **Account doesn't exist** → Run `python populate_all_corp_users.py`
2. **Company names don't match** → Check `AUTH_UPDATE_GUIDE.md` for fix
3. **Still seeing all jobs** → Clear browser cache!
4. **Backend errors** → Check uvicorn terminal for errors

---

## 📝 Test Accounts

| Email | Password | Jobs |
|-------|----------|------|
| `zesco@company.zm` | `password123` | 18 |
| `zanaco@company.zm` | `password123` | ? |
| `zesco limited@company.zm` | `password123` | ? |
| `avic international@company.zm` | `password123` | ? |

**All 545 companies use:** `password123`

---

## 🎯 What Changed

**Before:**
- Used `companies` table
- Manual company extraction from email
- No centralized account system

**After:**
- Uses `corp_users` table
- 545 pre-created accounts
- Exact company name matching
- Token includes `company_name` field

---

## 📚 Full Documentation

- **AUTH_UPDATE_GUIDE.md** - Complete troubleshooting
- **test_new_auth.py** - Automated testing
- **fix_orphaned_companies.py** - Fix missing accounts
- **populate_all_corp_users.py** - Recreate all accounts

---

**Go run Step 1-4 now!** 🚀
