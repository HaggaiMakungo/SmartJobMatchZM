"""
Save Fixed CVs - Handles locked file situations
"""
import pandas as pd
import sys
import io
from pathlib import Path
import time

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

print("=" * 80)
print("SAVE FIXED CVs FILE")
print("=" * 80)

# Find the most recent backup
backup_dir = Path("datasets")
backup_files = list(backup_dir.glob("CVs_backup_*.csv"))

if not backup_files:
    print("✗ No backup files found!")
    print("Looking for: datasets/CVs_backup_*.csv")
    sys.exit(1)

# Get the most recent backup
latest_backup = max(backup_files, key=lambda p: p.stat().st_mtime)
print(f"\n📁 Found latest backup: {latest_backup.name}")
print(f"   Created: {time.ctime(latest_backup.stat().st_mtime)}")

# Load the fixed data from backup
print("\n[1/2] Loading fixed data from backup...")
try:
    df = pd.read_csv(latest_backup)
    print(f"✓ Loaded {len(df)} rows")
    print(f"✓ Unique emails: {df['email'].nunique()}")
except Exception as e:
    print(f"✗ Error loading backup: {e}")
    sys.exit(1)

# Verify no duplicates
duplicates = df[df.duplicated(subset=['email'], keep=False)]
if len(duplicates) > 0:
    print(f"⚠️  Warning: This backup still has {len(duplicates)} duplicate emails")
    print("You may want to run fix_duplicate_emails.py again")
else:
    print("✓ Verified: No duplicate emails in this backup")

# Try to save
print("\n[2/2] Attempting to save to datasets/CVs.csv...")

output_file = Path("datasets/CVs.csv")
max_attempts = 5

for attempt in range(1, max_attempts + 1):
    try:
        df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"\n✓ Successfully saved to: {output_file}")
        print("\n" + "=" * 80)
        print("SUCCESS!")
        print("=" * 80)
        print("\n🎯 Next steps:")
        print("1. Run: python clear_tables.py")
        print("2. Run: python seed_database_fixed.py")
        print("\nOr just run: python setup_database.py")
        sys.exit(0)
        
    except PermissionError:
        if attempt < max_attempts:
            print(f"\n⚠️  Attempt {attempt}/{max_attempts} failed - file is locked")
            print("\n📋 Please:")
            print("   1. Close Excel or any program that has CVs.csv open")
            print("   2. Don't open it in File Explorer")
            print(f"   3. Retrying in 3 seconds...")
            time.sleep(3)
        else:
            print(f"\n✗ All {max_attempts} attempts failed")
            break
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        break

# If we get here, saving failed
print("\n" + "=" * 80)
print("ALTERNATIVE SOLUTION")
print("=" * 80)

print("\nSince the file is locked, here are your options:")

print("\n📝 Option 1: Manual File Management")
print("   1. Close any programs that have CVs.csv open (Excel, Notepad, etc.)")
print("   2. Delete or rename the old datasets/CVs.csv")
print("   3. Run this script again:")
print("      python save_fixed_cvs.py")

print("\n📝 Option 2: Use the Backup Directly")
print("   1. Close any programs that have CVs.csv open")
print("   2. Delete datasets/CVs.csv")
print("   3. Copy the backup:")
print(f"      copy \"{latest_backup}\" datasets\\CVs.csv")
print("   4. Continue with seeding:")
print("      python clear_tables.py")
print("      python seed_database_fixed.py")

print("\n📝 Option 3: Rename and Use Backup")
print("   1. Rename the locked file:")
print("      ren datasets\\CVs.csv CVs_old.csv")
print("   2. Copy the backup:")
print(f"      copy \"{latest_backup}\" datasets\\CVs.csv")
print("   3. Continue with seeding")

print("\n📝 Option 4: Restart and Retry")
print("   1. Close ALL programs (Excel, File Explorer, VSCode, etc.)")
print("   2. Run this script again:")
print("      python save_fixed_cvs.py")

print("\n💡 Quick fix if nothing works:")
print("   Just use the backup file for seeding - it has all the fixes!")
print(f"   The file is: {latest_backup}")

print("\n" + "=" * 80)
