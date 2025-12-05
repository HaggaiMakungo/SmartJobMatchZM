# Data Seeding Fix - Execution Checklist

**Print this and check off as you go!**

---

## 📍 Pre-Flight Check

- [ ] I'm in the correct directory: `C:\Dev\ai-job-matchingV2\backend\datasets`
- [ ] I have Python installed and working
- [ ] I can connect to PostgreSQL
- [ ] I have the following files:
  - [ ] CVs.csv (2.7 MB)
  - [ ] Corp_jobs.csv (430 KB)
  - [ ] Small_jobs.csv (74 KB)

---

## 🔍 Step 1: Diagnose (2 minutes)

```bash
python full_diagnostic.py
```

**Check the output for:**
- [ ] All 3 CSV files found ✓
- [ ] skills_taxonomy.json has ~500 entries ✓
- [ ] skill_co_occurrence.json has ~100 entries ✓
- [ ] industry_transitions.json is EMPTY ❌ ← This is the problem
- [ ] work_experience_json column found
- [ ] JSON split across ~10-20 unnamed columns

**If everything looks as expected above, continue to Step 2.**

---

## 🔧 Step 2: Fix Data Extraction (3 minutes)

```bash
python analyze_datasets_fixed_v2.py
```

**Look for these success indicators:**
- [ ] "✓ CVs loaded: 2,500 records"
- [ ] "Found work_experience_json at index X"
- [ ] "Found Y unnamed columns to merge"
- [ ] "CVs with work experience: X" (should be > 2000)
- [ ] "CVs with industry field: Y" (should be > 100)
- [ ] "Total transitions found: Z" (should be > 20)
- [ ] "✓ Saved top 50 transitions to industry_transitions.json"

**If any of these fail, see Troubleshooting section below.**

---

## ✅ Step 3: Verify JSON Files (1 minute)

```bash
# Windows Command Prompt
type industry_transitions.json | more

# PowerShell
Get-Content industry_transitions.json | more
```

**Verify:**
- [ ] File is NOT empty (not just `[]`)
- [ ] Contains objects with these keys:
  - [ ] "from_industry"
  - [ ] "to_industry"
  - [ ] "transitions"
  - [ ] "probability"
- [ ] Has at least 20-30 transition entries

---

## 🗄️ Step 4: Update Database Config (1 minute)

Edit `seed_matching_tables.py`:

```python
DB_CONFIG = {
    'host': 'localhost',
    'database': 'job_match_db',  # ← Check this!
    'user': 'postgres',           # ← Check this!
    'password': 'Winter123'       # ← Check this!
}
```

**Verify:**
- [ ] Database name matches your actual database
- [ ] Username is correct
- [ ] Password is correct
- [ ] Can connect: `psql -U postgres -d job_match_db`

---

## 📊 Step 5: Seed Database (2 minutes)

```bash
python seed_matching_tables.py
```

**Expected output:**
```
✓ Connected to database
[1/4] Checking for analysis data files...
  ✓ Found: skills_taxonomy.json
  ✓ Found: skill_co_occurrence.json
  ✓ Found: industry_transitions.json

[2/4] Seeding skills_taxonomy...
  ✓ Inserted 500 skills

[3/4] Seeding skill_similarity...
  ✓ Inserted 100 skill pairs

[4/4] Seeding category_compatibility...
  ✓ Inserted 50 industry transitions  ← KEY SUCCESS!

VERIFICATION
  skills_taxonomy          : 500 rows
  skill_similarity         : 100 rows
  category_compatibility   : 50 rows   ← Should be > 0!
  collar_weights_config    : 6 rows
```

**Check:**
- [ ] All 4 seeding steps succeeded
- [ ] category_compatibility has > 0 rows
- [ ] No errors in output

---

## 🧪 Step 6: Database Verification (2 minutes)

Connect to database:
```bash
psql -U postgres -d job_match_db
```

Run these queries:

### Query 1: Row Counts
```sql
SELECT 
  (SELECT COUNT(*) FROM matching_metadata.skills_taxonomy) as skills,
  (SELECT COUNT(*) FROM matching_metadata.skill_similarity) as similarity,
  (SELECT COUNT(*) FROM matching_metadata.category_compatibility) as compatibility;
```

**Expected:**
- [ ] skills: 500
- [ ] similarity: 100
- [ ] compatibility: 30-50 ✅ (This was 0 before!)

### Query 2: Sample Data
```sql
SELECT 
    from_category,
    to_category,
    transition_probability
FROM matching_metadata.category_compatibility
ORDER BY transition_probability DESC
LIMIT 5;
```

**Verify:**
- [ ] Returns 5 rows
- [ ] Shows realistic transitions (e.g., Agriculture → Food Processing)
- [ ] Probabilities are between 0 and 1

### Query 3: Test Skill Similarity
```sql
SELECT * FROM matching_metadata.get_skill_similarity('Python');
```

**Verify:**
- [ ] Returns related skills (Django, Flask, Programming, etc.)
- [ ] Similarity scores make sense (0.0 to 1.0)

---

## 🎉 Step 7: Mark Complete

If all checks passed:

- [ ] Update `MATCHING_SYSTEM_PROGRESS.md`:
  ```markdown
  ### Week 1 Days 1-2: Database Schema & Data Seeding ✅ COMPLETE
  **Completion Date:** November 12, 2025
  ```

- [ ] Update project status:
  ```markdown
  Current Phase: Week 1 Days 3-4 - Algorithm Implementation
  ```

- [ ] Celebrate! 🎊

---

## 🚨 Troubleshooting

### If Step 2 fails with "CVs with industry field: 0"

**Option A:** Work experience doesn't have industry field
```bash
# Use manual test data
psql -U postgres -d job_match_db -f test_seed_manual.sql
```
Then mark as complete and proceed.

**Option B:** Regenerate CVs with industry field
- Contact CV generation team
- Request industry field in work_experience_json

### If Step 5 fails with database connection error

Check:
- [ ] PostgreSQL is running: `pg_ctl status`
- [ ] Database exists: `psql -l | grep job_match`
- [ ] Password is correct
- [ ] Update DB_CONFIG in seed_matching_tables.py

### If category_compatibility is still empty after Step 5

- [ ] Verify industry_transitions.json is not empty
- [ ] Check for error messages in seed output
- [ ] Try manual seeding: `psql -f test_seed_manual.sql`
- [ ] Contact support with diagnostic output

---

## 📸 Success Screenshot Checklist

Take these screenshots for your records:

- [ ] Screenshot 1: `full_diagnostic.py` output
- [ ] Screenshot 2: `analyze_datasets_fixed_v2.py` success message
- [ ] Screenshot 3: `seed_matching_tables.py` verification table
- [ ] Screenshot 4: SQL query showing category_compatibility rows

---

## ⏱️ Time Tracking

| Step | Planned | Actual | Notes |
|------|---------|--------|-------|
| 1. Diagnose | 2 min | ____ | |
| 2. Fix extraction | 3 min | ____ | |
| 3. Verify JSON | 1 min | ____ | |
| 4. Update config | 1 min | ____ | |
| 5. Seed DB | 2 min | ____ | |
| 6. Verify DB | 2 min | ____ | |
| 7. Mark complete | 1 min | ____ | |
| **Total** | **12 min** | **____** | |

---

## 🎯 Definition of Done

**Phase 1 is complete when:**

✅ All checkboxes above are checked  
✅ category_compatibility table has > 0 rows  
✅ Sample SQL queries return sensible data  
✅ Ready to implement matching algorithms  

---

## 📞 Need Help?

If stuck, provide this info:

1. Which step failed? _________________
2. Error message: _________________
3. Diagnostic output: (attach file)
4. Screenshots: (attach)

---

**Printed on:** ________________  
**Completed on:** ________________  
**Time taken:** ________________

**Signature:** ________________
