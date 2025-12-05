# The Problem & Solution - Visual Guide

## 🔴 THE PROBLEM

```
CVs.csv Structure (What pandas.read_csv() sees):
┌─────────────────────────────────────────────────────────────────┐
│ Column 26: work_experience_json                                 │
│ Column 27: Unnamed: 27                                          │
│ Column 28: Unnamed: 28                                          │
│ Column 29: Unnamed: 29                                          │
│ ... (10-20 more unnamed columns with JSON fragments)            │
└─────────────────────────────────────────────────────────────────┘

What the data actually looks like:
┌─────────────────────────────────────────────────────────────────┐
│ [{"company": "MTN"                                              │ ← Column 26
│ "position": "Manager"                                           │ ← Column 27
│ "start": "2020-01"                                              │ ← Column 28
│ "end": "2023-06"}]                                              │ ← Column 29
└─────────────────────────────────────────────────────────────────┘
      ↓
JSON is SPLIT because commas in JSON confuse CSV parser!
      ↓
analyze_datasets.py only reads Column 26: [{"company": "MTN"
      ↓
Invalid JSON → Can't parse → No industry data → Empty transitions
```

## ✅ THE SOLUTION

```
Fixed Script (analyze_datasets_fixed_v2.py):

Step 1: Read CSV with Python csv module (not pandas)
┌─────────────────────────────────────────────────────────────────┐
│ with open('CVs.csv') as f:                                      │
│     reader = csv.reader(f)                                      │
│     header = next(reader)  # Get all columns                    │
└─────────────────────────────────────────────────────────────────┘

Step 2: Find work_experience_json and unnamed columns
┌─────────────────────────────────────────────────────────────────┐
│ work_exp_idx = 26  # Found at index 26                          │
│ unnamed_indices = [27, 28, 29, ..., 45]  # All unnamed after    │
└─────────────────────────────────────────────────────────────────┘

Step 3: Reconstruct JSON for each row
┌─────────────────────────────────────────────────────────────────┐
│ json_parts = []                                                 │
│ json_parts.append(row[26])  # [{"company": "MTN"               │
│ json_parts.append(row[27])  # "position": "Manager"            │
│ json_parts.append(row[28])  # "start": "2020-01"               │
│ json_parts.append(row[29])  # "end": "2023-06"}]               │
│                                                                 │
│ full_json = ','.join(json_parts)                                │
│ # Result: [{"company":"MTN","position":"Manager",...}]          │
└─────────────────────────────────────────────────────────────────┘

Step 4: Parse and extract industry
┌─────────────────────────────────────────────────────────────────┐
│ work_exp = json.loads(full_json)                                │
│ if 'industry' in work_exp[0]:                                   │
│     industry = work_exp[0]['industry']  # "Telecommunications"  │
│     transitions[(prev_ind, industry)] += 1                      │
└─────────────────────────────────────────────────────────────────┘

Step 5: Save to industry_transitions.json
┌─────────────────────────────────────────────────────────────────┐
│ [                                                               │
│   {                                                             │
│     "from_industry": "Agriculture",                             │
│     "to_industry": "Manufacturing",                             │
│     "transitions": 45,                                          │
│     "probability": 0.23                                         │
│   },                                                            │
│   ...                                                           │
│ ]                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 BEFORE vs AFTER

### BEFORE (Broken)
```
File: industry_transitions.json
Content: []

Database Query:
SELECT COUNT(*) FROM category_compatibility;
Result: 0 rows ❌
```

### AFTER (Fixed)
```
File: industry_transitions.json
Content: [
  {"from_industry": "Agriculture", "to_industry": "Manufacturing", ...},
  {"from_industry": "Retail", "to_industry": "Healthcare", ...},
  {"from_industry": "Construction", "to_industry": "Technology", ...},
  ... (50 transitions)
]

Database Query:
SELECT COUNT(*) FROM category_compatibility;
Result: 50 rows ✅
```

## 🔄 THE FIX WORKFLOW

```
┌─────────────────┐
│  START HERE     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 1. Run full_diagnostic.py        │ ← Identify the problem
│    Shows CSV structure & issue    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 2. Run analyze_datasets_fixed.py │ ← Extract data correctly
│    Reconstructs JSON properly     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 3. Verify JSON files             │ ← Confirm data exists
│    industry_transitions.json ✓   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 4. Run seed_matching_tables.py   │ ← Load into database
│    Populates all tables           │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 5. Verify in database            │ ← Confirm success
│    SELECT COUNT(*) ... ✓         │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  ✅ PHASE 1 COMPLETE             │
│  Ready for Phase 2: Algorithms   │
└──────────────────────────────────┘
```

## 🎯 QUICK COMMANDS

```bash
# 1. Diagnose
python full_diagnostic.py

# 2. Fix extraction
python analyze_datasets_fixed_v2.py

# 3. Verify output
type industry_transitions.json | more

# 4. Seed database
python seed_matching_tables.py

# 5. Test in SQL
psql -U postgres -d job_match_db
SELECT * FROM matching_metadata.category_compatibility LIMIT 5;
```

## 💡 WHY THIS MATTERS

```
Without Industry Transitions:
┌─────────────────────────────────────────────────┐
│ CV: Agricultural Engineer (3 years)             │
│ Job: Food Processing Manager                    │
│                                                 │
│ Score: 45% (Only skills + experience match)     │
│ ❌ Missing: Category compatibility bonus       │
└─────────────────────────────────────────────────┘

With Industry Transitions:
┌─────────────────────────────────────────────────┐
│ CV: Agricultural Engineer (3 years)             │
│ Job: Food Processing Manager                    │
│                                                 │
│ Base Score: 45%                                 │
│ + Category Bonus: +15% (Ag→Food is common)     │
│ Final Score: 60% ✅ Better match!              │
└─────────────────────────────────────────────────┘
```

## 📈 DATA FLOW

```
CVs.csv (2,500 rows)
    ↓ [JSON reconstruction]
Work Experience Data
    ↓ [Extract industries]
Current Industries (2,300 CVs)
    ↓ [Track transitions]
Industry Transitions (50 patterns)
    ↓ [Calculate probabilities]
industry_transitions.json
    ↓ [Load into DB]
category_compatibility table
    ↓ [Use in matching]
Better Job Recommendations! 🎉
```

## 🔍 WHAT EACH FILE DOES

```
full_diagnostic.py
├─ Checks CSV structure
├─ Tests JSON parsing
├─ Identifies missing fields
└─ Reports detailed findings

analyze_datasets_fixed_v2.py
├─ Reads CSV with csv module
├─ Reconstructs split JSON
├─ Extracts all work experience
├─ Finds industry fields
├─ Calculates transitions
└─ Generates JSON files

seed_matching_tables.py
├─ Connects to PostgreSQL
├─ Reads JSON files
├─ Inserts into tables
├─ Handles conflicts
└─ Verifies counts

test_seed_manual.sql (Backup)
└─ Manual transition data if needed
```

## 🎓 KEY LEARNING

**CSV + JSON = 💥 Be Careful!**

When CSVs contain JSON with commas:
- ❌ Standard parsers split columns
- ✅ Use csv module + manual reconstruction
- ✅ Always verify JSON is complete
- ✅ Test with sample data first

---

**Time to Fix:** 5-10 minutes  
**Difficulty:** Easy (just run scripts)  
**Impact:** Critical (unblocks Phase 2)
