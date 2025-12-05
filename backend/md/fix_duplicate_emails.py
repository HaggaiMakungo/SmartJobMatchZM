"""
Automatically Fix Duplicate Emails in CVs.csv
Creates a backup and fixes duplicates intelligently based on names and domains
"""
import pandas as pd
import sys
import io
from pathlib import Path
from datetime import datetime
import random

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

print("=" * 80)
print("INTELLIGENT DUPLICATE EMAIL FIXER")
print("=" * 80)

def load_csv_with_encoding(filepath, encodings=['utf-8', 'latin-1', 'windows-1252', 'cp1252']):
    """Try loading CSV with different encodings"""
    for encoding in encodings:
        try:
            return pd.read_csv(filepath, encoding=encoding), encoding
        except (UnicodeDecodeError, UnicodeError):
            continue
    raise Exception(f"Could not decode {filepath} with any encoding")


def get_name_parts(full_name):
    """Extract first and last name from full name"""
    if pd.isna(full_name) or not full_name:
        return None, None
    
    parts = str(full_name).strip().split()
    if len(parts) >= 2:
        first_name = parts[0].lower()
        last_name = parts[-1].lower()
        return first_name, last_name
    elif len(parts) == 1:
        return parts[0].lower(), parts[0].lower()
    else:
        return None, None


def generate_unique_email(full_name, base_email, occurrence_number, total_duplicates):
    """
    Generate a unique email based on the person's name and occurrence number
    
    Strategies:
    1. If ≤3 duplicates: Use different domains (@gmail.com, @outlook.com, @yahoo.com)
    2. If >3 duplicates: Add name-based variations (firstname.lastname, firstlast, etc.)
    """
    first_name, last_name = get_name_parts(full_name)
    
    # Extract current domain
    if '@' in base_email:
        current_handle, current_domain = base_email.rsplit('@', 1)
    else:
        current_handle = base_email
        current_domain = "email.com"
    
    # Strategy 1: Use different email providers (for small duplicate groups)
    if total_duplicates <= 3:
        domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com']
        
        if occurrence_number == 1:
            # Keep first one as-is
            return base_email
        elif occurrence_number <= len(domains):
            # Use different domains for the rest
            new_domain = domains[occurrence_number - 2]  # -2 because we skip first occurrence
            new_email = f"{current_handle}@{new_domain}"
            print(f"      Strategy: Different domain → {new_email}")
            return new_email
        else:
            # Fallback if somehow we have more than domains available
            new_email = f"{current_handle}_{occurrence_number}@{current_domain}"
            print(f"      Strategy: Numbered fallback → {new_email}")
            return new_email
    
    # Strategy 2: Name-based variations (for larger duplicate groups)
    else:
        if not first_name or not last_name:
            # Fallback if name parsing fails
            new_email = f"{current_handle}_{occurrence_number}@{current_domain}"
            print(f"      Strategy: Numbered (no name available) → {new_email}")
            return new_email
        
        # Create variations based on occurrence
        variations = [
            base_email,  # Keep first one
            f"{first_name}.{last_name}@{current_domain}",  # firstname.lastname
            f"{first_name}{last_name}@{current_domain}",   # firstnamelastname
            f"{first_name[0]}{last_name}@{current_domain}", # flastname (first initial + last)
            f"{first_name}{last_name[0]}@{current_domain}", # firstnamel (first + last initial)
            f"{last_name}.{first_name}@{current_domain}",  # lastname.firstname
            f"{last_name}{first_name}@{current_domain}",   # lastnamefirstname
            f"{first_name}_{last_name}@{current_domain}",  # firstname_lastname
            f"{first_name}.{last_name}2@{current_domain}", # firstname.lastname2
            f"{first_name}{occurrence_number}@{current_domain}", # firstname + number
        ]
        
        if occurrence_number < len(variations):
            new_email = variations[occurrence_number]
            if occurrence_number == 1:
                print(f"      Strategy: Keep original → {new_email}")
            else:
                print(f"      Strategy: Name variation #{occurrence_number} → {new_email}")
            return new_email
        else:
            # If we run out of variations, use numbered suffix
            new_email = f"{first_name}.{last_name}{occurrence_number}@{current_domain}"
            print(f"      Strategy: Name + number → {new_email}")
            return new_email


# Load CVs.csv
print("\n[1/4] Loading CVs.csv...")
try:
    df, encoding = load_csv_with_encoding('datasets/CVs.csv')
    print(f"✓ Loaded {len(df)} rows (encoding: {encoding})")
except Exception as e:
    print(f"✗ Error loading CVs.csv: {e}")
    sys.exit(1)


# Find duplicates
print("\n[2/4] Finding duplicate emails...")
duplicate_emails = df[df.duplicated(subset=['email'], keep=False)]

if len(duplicate_emails) == 0:
    print("✓ No duplicate emails found! CVs.csv is already clean.")
    sys.exit(0)

print(f"⚠️  Found {len(duplicate_emails)} rows with duplicate emails")
print(f"   ({len(duplicate_emails['email'].unique())} unique duplicate email addresses)")

# Show sample with names
print("\n   Sample duplicates:")
for i, email in enumerate(duplicate_emails['email'].unique()[:5]):
    dup_rows = df[df['email'] == email]
    count = len(dup_rows)
    names = ', '.join([str(name) for name in dup_rows['full_name'].head(3)])
    if count > 3:
        names += f", ... ({count-3} more)"
    print(f"   - {email} (appears {count} times)")
    print(f"     Names: {names}")

if len(duplicate_emails['email'].unique()) > 5:
    print(f"   ... and {len(duplicate_emails['email'].unique()) - 5} more")


# Ask for confirmation
print("\n" + "=" * 80)
print("This script will:")
print("1. Create a backup of CVs.csv")
print("2. Fix duplicates intelligently:")
print("   • For ≤3 duplicates: Use different domains (gmail.com, outlook.com, etc.)")
print("   • For >3 duplicates: Use name-based variations (firstname.lastname, etc.)")
print("\nExamples:")
print("   mary.phiri@email.com (3 people)")
print("   → mary.phiri@email.com")
print("   → mary.phiri@gmail.com")
print("   → mary.phiri@outlook.com")
print()
print("   john.banda@email.com (5 people)")
print("   → john.banda@email.com")
print("   → john.banda@email.com (becomes john.banda@email.com)")
print("   → johnbanda@email.com")
print("   → jbanda@email.com")
print("   → john.banda2@email.com")
print("=" * 80)

response = input("\nProceed with fixing duplicates? (yes/no): ")

if response.lower() != 'yes':
    print("Aborted.")
    sys.exit(0)


# Create backup
print("\n[3/4] Creating backup...")
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_file = f"datasets/CVs_backup_{timestamp}.csv"

try:
    df.to_csv(backup_file, index=False, encoding='utf-8')
    print(f"✓ Backup created: {backup_file}")
except Exception as e:
    print(f"✗ Error creating backup: {e}")
    sys.exit(1)


# Fix duplicates
print("\n[4/4] Fixing duplicate emails intelligently...")
print()

# First, count how many times each email appears
email_occurrence_count = df.groupby('email').size().to_dict()

# Track which occurrence we're on for each email
email_occurrence_tracker = {}
fixed_count = 0
shown_fixes = 0
max_shown = 15

for idx, row in df.iterrows():
    email = row['email']
    full_name = row.get('full_name', 'Unknown')
    
    # Initialize tracker for this email
    if email not in email_occurrence_tracker:
        email_occurrence_tracker[email] = 0
    
    email_occurrence_tracker[email] += 1
    current_occurrence = email_occurrence_tracker[email]
    total_occurrences = email_occurrence_count[email]
    
    # Only fix if this email has duplicates
    if total_occurrences > 1:
        # Generate new email based on occurrence and strategy
        new_email = generate_unique_email(
            full_name, 
            email, 
            current_occurrence,
            total_occurrences
        )
        
        # Update the dataframe
        if new_email != email:
            df.at[idx, 'email'] = new_email
            fixed_count += 1
            
            if shown_fixes < max_shown:
                print(f"   [{current_occurrence}/{total_occurrences}] {full_name}")
                print(f"      {email} → {new_email}")
                print()
                shown_fixes += 1

if fixed_count > max_shown:
    print(f"   ... and {fixed_count - max_shown} more fixes")

print(f"\n✓ Fixed {fixed_count} duplicate emails")


# Verify no duplicates remain
print("\n[5/5] Verifying fix...")
remaining_duplicates = df[df.duplicated(subset=['email'], keep=False)]

if len(remaining_duplicates) == 0:
    print("✓ Verification passed - no duplicates remaining!")
    
    # Save fixed file
    output_file = 'datasets/CVs.csv'
    try:
        df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"\n✓ Fixed file saved: {output_file}")
        print(f"✓ Backup available at: {backup_file}")
        
        print("\n" + "=" * 80)
        print("SUCCESS!")
        print("=" * 80)
        print(f"\n📊 Statistics:")
        print(f"   • Total CVs: {len(df)}")
        print(f"   • Emails fixed: {fixed_count}")
        print(f"   • Unique emails now: {df['email'].nunique()}")
        
        print("\n🎯 Next steps:")
        print("1. Review the changes (compare with backup if needed)")
        print("2. Run: python clear_tables.py")
        print("3. Run: python seed_database_fixed.py")
        print("\nOr just run: python setup_database.py")
        
    except Exception as e:
        print(f"✗ Error saving fixed file: {e}")
        print(f"Your backup is safe at: {backup_file}")
        sys.exit(1)
else:
    print(f"⚠️  Warning: {len(remaining_duplicates)} duplicates still remain")
    print("   This might happen if name variations created new duplicates.")
    print("   Re-running the script may resolve this, or you can edit manually.")
    
    # Show which ones remain
    print("\n   Remaining duplicates:")
    for email in remaining_duplicates['email'].unique()[:5]:
        count = len(df[df['email'] == email])
        print(f"   - {email} (appears {count} times)")
    
    # Still save the file
    output_file = 'datasets/CVs.csv'
    df.to_csv(output_file, index=False, encoding='utf-8')
    print(f"\n✓ File saved anyway: {output_file}")
    print(f"✓ Backup available at: {backup_file}")
    print("\n💡 Tip: Run the script again to apply different strategies to remaining duplicates.")
