# 🎯 QUICK START - Corp Users Migration

## ⚡ 3-Minute Setup

### **Step 1: Run Migration**
```bash
cd C:\Dev\ai-job-matchingV2\backend
python migrate_to_corp_users.py
```

### **Step 2: Verify It Worked**
```bash
psql -U postgres -d job_match_db
# Password: Winter123

SELECT email, company_name FROM corp_users;
```

**Should see:**
```
         email          | company_name 
------------------------+--------------
 dhl@company.zm         | DHL
 zanaco@company.zm      | ZANACO
 choppies@company.zm    | CHOPPIES
 ...
```

### **Step 3: Tell Me the Results**

Paste the output from both commands and we'll wire up the backend together!

---

## 🎯 Why This is Better

**Old Way (❌ Broken):**
- Job seekers + companies in ONE table
- Company field missing/inconsistent
- Complex extraction logic
- Only 1 job showing instead of 18

**New Way (✅ Clean):**
- Separate `corp_users` table
- Company name always set
- Simple queries
- All jobs will show!

---

## 📚 Full Details

See `CORP_USERS_ARCHITECTURE.md` for complete documentation.

---

**Run the migration now! It's safe and reversible.** 🚀
