"""
Find Duplicate Data in CSV Files
Shows all duplicate entries that would cause database conflicts
"""
import pandas as pd
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

print("=" * 80)
print("CSV DUPLICATE FINDER")
print("=" * 80)

def load_csv_with_encoding(filepath, encodings=['utf-8', 'latin-1', 'windows-1252', 'cp1252']):
    """Try loading CSV with different encodings"""
    for encoding in encodings:
        try:
            return pd.read_csv(filepath, encoding=encoding)
        except (UnicodeDecodeError, UnicodeError):
            continue
    raise Exception(f"Could not decode {filepath} with any encoding")


def find_duplicates_in_column(df, column_name, file_name):
    """Find and report duplicates in a specific column"""
    duplicates = df[df.duplicated(subset=[column_name], keep=False)]
    
    if len(duplicates) > 0:
        print(f"\n⚠️  Found {len(duplicates)} rows with duplicate {column_name} in {file_name}")
        print(f"   ({len(duplicates[column_name].unique())} unique duplicate values)")
        
        # Group by the duplicate value
        duplicate_groups = duplicates.groupby(column_name)
        
        print(f"\n   Showing first 10 duplicate groups:")
        for i, (value, group) in enumerate(duplicate_groups):
            if i >= 10:
                remaining = len(duplicate_groups) - 10
                print(f"\n   ... and {remaining} more duplicate groups")
                break
            
            print(f"\n   [{i+1}] {column_name}: {value}")
            print(f"       Appears {len(group)} times at rows: {list(group.index)}")
            
            # Show some fields from each duplicate
            for idx, row in group.iterrows():
                if column_name == 'email':
                    print(f"       Row {idx}: {row.get('full_name', 'N/A')} | CV ID: {row.get('cv_id', 'N/A')}")
                elif column_name == 'job_id':
                    print(f"       Row {idx}: {row.get('title', 'N/A')} | Company: {row.get('company', 'N/A')}")
                elif column_name == 'id':
                    print(f"       Row {idx}: {row.get('title', 'N/A')} | Category: {row.get('category', 'N/A')}")
        
        # Save full list to file
        output_file = f"duplicates_{file_name}_{column_name}.csv"
        duplicates.to_csv(output_file, index=True)
        print(f"\n   ✓ Full list saved to: {output_file}")
        
        return True
    else:
        print(f"✓ No duplicates found in {column_name} for {file_name}")
        return False


# Check CVs.csv
print("\n" + "=" * 80)
print("[1/3] Checking CVs.csv")
print("=" * 80)

try:
    df_cvs = load_csv_with_encoding('datasets/CVs.csv')
    print(f"Loaded {len(df_cvs)} rows")
    
    # Check for duplicate cv_id
    has_dup_id = find_duplicates_in_column(df_cvs, 'cv_id', 'CVs.csv')
    
    # Check for duplicate email
    has_dup_email = find_duplicates_in_column(df_cvs, 'email', 'CVs.csv')
    
    if not has_dup_id and not has_dup_email:
        print("\n✓ CVs.csv is clean - no duplicates found!")
    
except Exception as e:
    print(f"✗ Error checking CVs.csv: {e}")
    import traceback
    traceback.print_exc()


# Check Corp_jobs.csv
print("\n" + "=" * 80)
print("[2/3] Checking Corp_jobs.csv")
print("=" * 80)

try:
    df_corp = load_csv_with_encoding('datasets/Corp_jobs.csv')
    print(f"Loaded {len(df_corp)} rows")
    
    # Check for duplicate job_id
    has_dup = find_duplicates_in_column(df_corp, 'job_id', 'Corp_jobs.csv')
    
    if not has_dup:
        print("\n✓ Corp_jobs.csv is clean - no duplicates found!")
    
except Exception as e:
    print(f"✗ Error checking Corp_jobs.csv: {e}")
    import traceback
    traceback.print_exc()


# Check Small_jobs.csv
print("\n" + "=" * 80)
print("[3/3] Checking Small_jobs.csv")
print("=" * 80)

try:
    df_small = load_csv_with_encoding('datasets/Small_jobs.csv')
    print(f"Loaded {len(df_small)} rows")
    
    # Check for duplicate id
    has_dup = find_duplicates_in_column(df_small, 'id', 'Small_jobs.csv')
    
    if not has_dup:
        print("\n✓ Small_jobs.csv is clean - no duplicates found!")
    
except Exception as e:
    print(f"✗ Error checking Small_jobs.csv: {e}")
    import traceback
    traceback.print_exc()


# Summary
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("\nDuplicate CSV files have been created for any duplicates found.")
print("These files contain ONLY the duplicate rows for easy review.")
print("\nNext steps:")
print("1. Open the duplicates_*.csv files to see all duplicate entries")
print("2. Edit the original CSV files to fix the duplicates")
print("3. Re-run this script to verify all duplicates are fixed")
print("4. Run: python clear_tables.py")
print("5. Run: python seed_database_fixed.py")
print("\n" + "=" * 80)
