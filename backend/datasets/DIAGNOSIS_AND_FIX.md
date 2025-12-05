# Data Seeding Issue: Diagnosis & Fix

**Date:** November 12, 2025  
**Issue:** `category_compatibility` table is empty after seeding attempt  
**Root Cause:** CSV parsing issue with JSON columns split across multiple columns

---

## 🔍 Problem Summary

The `industry_transitions.json` file is empty (`[]`), which causes the `category_compatibility` table to have no data after seeding.

### Why This Happened

The `CVs.csv` file contains a `work_experience_json` column with JSON data. When this JSON contains commas (which it always does), standard CSV parsers like `pandas.read_csv()` split the JSON across multiple "Unnamed" columns.

**Example:**
```
Column 27: work_experience_json
Column 28: Unnamed: 28
Column 29: Unnamed: 29
... (more unnamed columns with JSON fragments)
```

The original `analyze_datasets.py` script used `pd.read_csv()` which:
1. Didn't reconstruct the split JSON
2. Resulted in incomplete or invalid JSON parsing
3. Failed to extract `industry` fields
4. Produced an empty `industry_transitions.json`

---

## 📋 Step-by-Step Fix

### Step 1: Run Full Diagnostic

```bash
cd C:\Dev\ai-job-matchingV2\backend\datasets
python full_diagnostic.py
```

**What it does:**
- Checks all file sizes
- Validates JSON files have data
- Examines CSV structure
- Tests JSON reconstruction
- Identifies if `industry` field exists in work experience

**Expected output:**
- Shows work_experience_json is split across ~10-20 unnamed columns
- Confirms JSON can be reconstructed
- Reveals whether `industry` field exists or not

---

### Step 2: Run Fixed Analysis Script

```bash
python analyze_datasets_fixed_v2.py
```

**What it does:**
- Properly reconstructs JSON from split CSV columns
- Extracts work experience data correctly
- Looks for `industry` field in work experience
- Generates new `industry_transitions.json` with actual data

**Expected output:**
```
✓ CVs loaded: 2,500 records
✓ Work experience reconstruction successful
✓ Found X CVs with industry data
✓ Generated Y industry transitions
✓ Saved top 50 transitions to industry_transitions.json
```

---

### Step 3: Verify JSON Files

Check that all three JSON files now have data:

```bash
# Windows
dir *.json

# Check content
type industry_transitions.json | more
```

**Should see:**
- `skills_taxonomy.json`: ~500 entries ✓
- `skill_co_occurrence.json`: ~100 entries ✓
- `industry_transitions.json`: Now has data! ✓

---

### Step 4: Re-run Database Seeding

```bash
python seed_matching_tables.py
```

**Expected output:**
```
Loading JSON files...
✓ skills_taxonomy.json: 500 skills
✓ skill_co_occurrence.json: 100 pairs
✓ industry_transitions.json: 50 transitions

Seeding skills_taxonomy... ✓ 500 rows
Seeding skill_similarity... ✓ 100 rows
Seeding category_compatibility... ✓ 50 rows

All tables seeded successfully!
```

---

### Step 5: Verify Database

Connect to PostgreSQL and check:

```sql
-- Check row counts
SELECT 
  (SELECT COUNT(*) FROM matching_metadata.skills_taxonomy) as skills_count,
  (SELECT COUNT(*) FROM matching_metadata.skill_similarity) as similarity_count,
  (SELECT COUNT(*) FROM matching_metadata.category_compatibility) as compatibility_count;

-- Sample data
SELECT * FROM matching_metadata.category_compatibility LIMIT 5;
```

**Should see:**
- skills_taxonomy: 500 rows
- skill_similarity: 100 rows
- category_compatibility: 50 rows ✅

---

## 🚨 If Work Experience Has No Industry Field

If the diagnostic reveals that `work_experience_json` **doesn't contain an `industry` field**, you have two options:

### Option A: Use Manual Test Data (Quick Fix)

```bash
# Run the manual seeding script
psql -U postgres -d job_matching -f test_seed_manual.sql
```

This inserts realistic sample transition data:
- Agriculture → Manufacturing
- Retail → Healthcare
- Construction → Technology
- etc.

**Pros:** Immediate solution, allows system testing  
**Cons:** Not based on actual CV data

### Option B: Regenerate CVs with Industry Field (Proper Fix)

If you want real data, you need to regenerate `CVs.csv` with the `industry` field in work experience:

```python
# In your CV generation script
work_experience = [
    {
        "company": "MTN Zambia",
        "position": "Sales Manager",
        "industry": "Telecommunications",  # ADD THIS
        "start_date": "2020-01",
        "end_date": "2023-06",
        "responsibilities": "..."
    }
]
```

Then re-run the analysis.

---

## 📊 Testing the Fix

Once seeding is complete, test the matching system:

### 1. Test Skill Similarity
```sql
SELECT * FROM matching_metadata.get_skill_similarity('Python');
```

Should return related skills like Django, Flask, Programming, etc.

### 2. Test Category Compatibility
```sql
SELECT * FROM matching_metadata.category_compatibility 
WHERE from_category = 'Agriculture'
ORDER BY compatibility_score DESC
LIMIT 5;
```

Should show realistic transitions like Agriculture → Food Processing

### 3. Test Complete Matching
```python
# In your matching algorithm
from app.services.matching import MatchingService

service = MatchingService()
matches = service.get_corp_matches(cv_id="CV_001", limit=10)

# Should return:
# - Matches with scores
# - Proper skill overlap
# - Category compatibility considered
```

---

## 🎯 Success Criteria

✅ **Phase 1 Complete When:**

1. All three JSON files contain data:
   - `skills_taxonomy.json`: 500+ skills
   - `skill_co_occurrence.json`: 100+ pairs
   - `industry_transitions.json`: 30+ transitions (or manual data)

2. All database tables populated:
   - `skills_taxonomy`: 500+ rows
   - `skill_similarity`: 100+ rows
   - `category_compatibility`: 30+ rows

3. Sample queries return sensible results

4. Ready to implement matching algorithms in Phase 2

---

## 📁 Files Created for This Fix

| File | Purpose |
|------|---------|
| `full_diagnostic.py` | Comprehensive diagnostic script |
| `analyze_datasets_fixed_v2.py` | Fixed analysis with proper JSON reconstruction |
| `test_seed_manual.sql` | Manual transition data as backup |
| `DIAGNOSIS_AND_FIX.md` | This document |

---

## 🔄 Next Steps After Fix

1. ✅ Update `MATCHING_SYSTEM_PROGRESS.md` to mark Week 1 Day 2 complete
2. 🚀 Move to Week 1 Day 3-4: Implement CAMSS 2.0 matching algorithms
3. 🧪 Begin testing with real CV-job pairs
4. 📊 Measure baseline matching accuracy

---

## 📞 Need Help?

If issues persist:

1. **Share diagnostic output:**
   ```bash
   python full_diagnostic.py > diagnostic_output.txt
   ```

2. **Share first 5 lines of work_experience_json:**
   ```python
   import pandas as pd
   cvs = pd.read_csv('CVs.csv', nrows=5)
   print(cvs['work_experience_json'].iloc[0])
   ```

3. **Check if alternate work experience columns exist:**
   ```python
   print([col for col in cvs.columns if 'work' in col.lower()])
   ```

---

**Last Updated:** November 12, 2025  
**Status:** Ready for testing
