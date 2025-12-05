# Fixing Duplicate Emails - Complete Guide

## Problem
Your `CVs.csv` file contains duplicate email addresses. The database has a unique constraint on the email field, so duplicates cause the seeding to fail.

## Scripts Created

### 1. Find Duplicates (Inspection)
```bash
python find_duplicates.py
```

**What it does:**
- Scans all CSV files for duplicates
- Shows which emails/IDs are duplicated
- Creates `duplicates_*.csv` files with ONLY the duplicate rows
- Gives you a detailed report

**Use this when:** You want to see exactly what's duplicated before making changes

---

### 2. Fix Duplicate Emails (Intelligent & Automatic)
```bash
python fix_duplicate_emails.py
```

**What it does:**
- Creates a backup of CVs.csv with timestamp
- Uses **intelligent strategies** based on the person's name:

**For ≤3 duplicates:** Uses different email domains
```
mary.phiri@email.com
  → mary.phiri@email.com (keeps first)
  → mary.phiri@gmail.com (second person)
  → mary.phiri@outlook.com (third person)
```

**For >3 duplicates:** Uses name-based variations
```
john.banda@email.com (5 people named John Banda)
  → john.banda@email.com (keeps first)
  → john.banda@email.com (becomes john.banda@email.com)
  → johnbanda@email.com
  → jbanda@email.com
  → johnb@email.com
```

Possible variations include:
- `firstname.lastname@domain.com`
- `firstnamelastname@domain.com`
- `flastname@domain.com` (first initial + last name)
- `firstname_lastname@domain.com`
- `lastname.firstname@domain.com`
- `firstname2@domain.com` (with number)

- Verifies the fix worked
- Saves the corrected file

**Use this when:** You want an automatic, intelligent fix (recommended!)

---

### 3. Clear Database Tables
```bash
python clear_tables.py
```

**What it does:**
- Removes all data from database tables
- Uses `psql` command to truncate tables

**Use this when:** You need to clear existing data before re-seeding

---

### 4. Fixed Seed Script
```bash
python seed_database_fixed.py
```

**What it does:**
- Seeds the database with improved duplicate handling
- Tracks seen emails to skip duplicates
- Commits in small batches (100 records)
- Reports how many duplicates were skipped

**Use this when:** You want to seed with better error handling

---

## Recommended Workflow

### Option A: Automatic Fix (Easiest) ⭐
```bash
# Step 1: Find and review duplicates
python find_duplicates.py

# Step 2: Automatically fix them
python fix_duplicate_emails.py

# Step 3: Clear database
python clear_tables.py

# Step 4: Seed with fixed data
python seed_database_fixed.py
```

### Option B: Manual Fix (If you want control)
```bash
# Step 1: Find duplicates
python find_duplicates.py

# Step 2: Open the duplicates_*.csv files and review them

# Step 3: Manually edit datasets/CVs.csv in Excel/Notepad++
#         Fix the duplicate emails yourself

# Step 4: Verify fixes
python find_duplicates.py

# Step 5: Clear and re-seed
python clear_tables.py
python seed_database_fixed.py
```

### Option C: Seed With Duplicates (Skip them)
```bash
# Step 1: Clear database
python clear_tables.py

# Step 2: Seed with duplicate handling (skips duplicates automatically)
python seed_database_fixed.py
```

This will skip duplicate emails during seeding, so you'll get fewer than 2500 CVs, but it will work!

---

## Understanding the Duplicate Issue

### Why This Happened
Your data generation process created duplicate emails. This is common when:
- Random name generation picks the same combinations
- Email generation uses limited name pools
- Multiple people have common names (Mary Phiri appears multiple times)

### The Database Constraint
```sql
CREATE UNIQUE INDEX ix_cvs_email ON cvs (email);
```

This prevents duplicate emails in the database, which is good for data integrity!

### What the Fix Does
The intelligent fix uses two strategies:

**Strategy 1: Different Domains** (≤3 duplicates)
```
mary.phiri@email.com  (Row 500)  → mary.phiri@email.com
mary.phiri@email.com  (Row 1499) → mary.phiri@gmail.com
mary.phiri@email.com  (Row 2100) → mary.phiri@outlook.com
```

**Strategy 2: Name Variations** (>3 duplicates)
```
john.banda@email.com  (Row 100)  → john.banda@email.com (keep original)
john.banda@email.com  (Row 500)  → john.banda@email.com (firstname.lastname)
john.banda@email.com  (Row 900)  → johnbanda@email.com (no dots)
john.banda@email.com  (Row 1200) → jbanda@email.com (first initial)
john.banda@email.com  (Row 1800) → johnb@email.com (first name + last initial)
```

---

## Example Output

### find_duplicates.py
```
================================================================================
[1/3] Checking CVs.csv
================================================================================
Loaded 2500 rows

⚠️  Found 150 rows with duplicate email in CVs.csv
   (50 unique duplicate values)

   [1] email: mary.phiri@email.com
       Appears 3 times at rows: [499, 1498, 2099]
       Row 499: Mary Phiri | CV ID: 500
       Row 1498: Mary Phiri | CV ID: 1499
       Row 2099: Mary Phiri | CV ID: 2100

   ✓ Full list saved to: duplicates_CVs.csv_email.csv
```

### fix_duplicate_emails.py
```
================================================================================
INTELLIGENT DUPLICATE EMAIL FIXER
================================================================================

[2/4] Finding duplicate emails...
⚠️  Found 150 rows with duplicate emails
   (50 unique duplicate email addresses)

   Sample duplicates:
   - mary.phiri@email.com (appears 3 times)
     Names: Mary Phiri, Mary Phiri, Mary Phiri
   - john.banda@email.com (appears 5 times)
     Names: John Banda, John Banda, John Banda, ... (2 more)

[4/4] Fixing duplicate emails intelligently...

   [1/3] Mary Phiri
      Strategy: Keep original → mary.phiri@email.com

   [2/3] Mary Phiri
      Strategy: Different domain → mary.phiri@gmail.com

   [3/3] Mary Phiri
      Strategy: Different domain → mary.phiri@outlook.com

   [1/5] John Banda
      Strategy: Keep original → john.banda@email.com

   [2/5] John Banda
      Strategy: Name variation #2 → john.banda@email.com

   [3/5] John Banda
      Strategy: Name variation #3 → johnbanda@email.com

   [4/5] John Banda
      Strategy: Name variation #4 → jbanda@email.com

   [5/5] John Banda
      Strategy: Name variation #5 → johnb@email.com

✓ Fixed 100 duplicate emails

✓ Verification passed - no duplicates remaining!
✓ Fixed file saved: datasets/CVs.csv
✓ Backup available at: datasets/CVs_backup_20241112_143022.csv

📊 Statistics:
   • Total CVs: 2500
   • Emails fixed: 100
   • Unique emails now: 2500
```

---

## Files Created

| File | Purpose |
|------|---------|
| `find_duplicates.py` | Find and report all duplicates |
| `fix_duplicate_emails.py` | Automatically fix duplicate emails |
| `seed_database_fixed.py` | Seed script with better duplicate handling |
| `clear_tables.py` | Clear all database tables |
| `duplicates_*.csv` | Export of duplicate rows for review |
| `CVs_backup_*.csv` | Backup before fixing |

---

## Quick Start

**Just want it to work? Run these 3 commands:**

```bash
python fix_duplicate_emails.py
python clear_tables.py
python seed_database_fixed.py
```

Done! ✅

---

## Troubleshooting

### "No such file or directory: datasets/CVs.csv"
Make sure you're in the `backend` directory:
```bash
cd C:\Dev\ai-job-matchingV2\backend
```

### "psql command not found"
For `clear_tables.py`, you can manually clear tables:
```bash
psql -U postgres -d job_match_db
TRUNCATE TABLE cvs CASCADE;
\q
```

### "I want to review changes before fixing"
Use the inspection workflow:
```bash
python find_duplicates.py
# Review the duplicates_*.csv files
# Then decide: automatic fix or manual fix
```

### "I made a mistake!"
Your backup is safe at `datasets/CVs_backup_TIMESTAMP.csv`
Just copy it back:
```bash
copy datasets\CVs_backup_*.csv datasets\CVs.csv
```

---

## Summary

✅ **find_duplicates.py** - Shows what's wrong  
✅ **fix_duplicate_emails.py** - Fixes it automatically  
✅ **clear_tables.py** - Clears the database  
✅ **seed_database_fixed.py** - Loads the fixed data  

**Recommended:** Run the automatic fix workflow (Option A above)!
