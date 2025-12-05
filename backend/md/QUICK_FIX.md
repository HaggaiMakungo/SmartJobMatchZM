# 🚀 Quick Fix - Database Setup with Duplicates

## Problem
Your CSV has duplicate emails → Database setup fails

## Solution (3 Commands)

```bash
# 1. Fix duplicates intelligently (uses names + domains)
python fix_duplicate_emails.py

# 2. Clear database tables
python clear_tables.py

# 3. Seed the database
python seed_database_fixed.py
```

**Done!** ✅

---

## What Each Script Does

### `fix_duplicate_emails.py`
- Creates backup automatically
- **≤3 duplicates:** Uses different domains (gmail.com, outlook.com, etc.)
- **>3 duplicates:** Uses name variations (john.banda, johnbanda, jbanda, etc.)
- Shows which strategy for each fix
- Verifies success

### `clear_tables.py`
- Empties all database tables
- Uses psql command

### `seed_database_fixed.py`
- Seeds with better error handling
- Skips any remaining duplicates
- Reports statistics

---

## Example Fix

**Before:**
```
mary.phiri@email.com (3 people)
mary.phiri@email.com
mary.phiri@email.com
```

**After:**
```
mary.phiri@email.com
mary.phiri@gmail.com
mary.phiri@outlook.com
```

---

## If You Want to Review First

```bash
# See what's duplicated
python find_duplicates.py

# Review the duplicates_*.csv files

# Then fix
python fix_duplicate_emails.py
```

---

## Full Documentation

- `FIX_DUPLICATES_GUIDE.md` - Complete guide
- `INTELLIGENT_FIX_SUMMARY.md` - Feature explanation
- This file - Quick reference

---

## Safety

✅ Automatic backup created  
✅ Original file preserved with timestamp  
✅ Can undo by copying backup back  
✅ Verification checks built-in  

---

**Your backup will be at:**
`datasets/CVs_backup_YYYYMMDD_HHMMSS.csv`

**To undo:**
```bash
copy datasets\CVs_backup_*.csv datasets\CVs.csv
```
