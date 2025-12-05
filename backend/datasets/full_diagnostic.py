"""
Full diagnostic: Check all data structures and identify issues
"""
import pandas as pd
import json
import csv

print("=" * 80)
print("FULL DIAGNOSTIC REPORT")
print("=" * 80)

# ============================================================================
# 1. CHECK CSV FILES EXIST AND SIZES
# ============================================================================
print("\n1. FILE CHECK")
print("-" * 80)

import os
files = ['CVs.csv', 'Corp_jobs.csv', 'Small_jobs.csv', 
         'industry_transitions.json', 'skills_taxonomy.json', 'skill_co_occurrence.json']

for filename in files:
    if os.path.exists(filename):
        size = os.path.getsize(filename) / (1024 * 1024)  # MB
        print(f"  ✓ {filename:30s} {size:8.2f} MB")
    else:
        print(f"  ✗ {filename:30s} MISSING")

# ============================================================================
# 2. CHECK JSON FILES CONTENT
# ============================================================================
print("\n2. JSON FILES CONTENT")
print("-" * 80)

for json_file in ['industry_transitions.json', 'skills_taxonomy.json', 'skill_co_occurrence.json']:
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"  {json_file:30s}: {len(data):6d} entries")
            if len(data) > 0 and len(data) < 3:
                print(f"    Sample: {data}")
    except Exception as e:
        print(f"  {json_file:30s}: ERROR - {e}")

# ============================================================================
# 3. CHECK CVS.CSV STRUCTURE
# ============================================================================
print("\n3. CVs.csv STRUCTURE")
print("-" * 80)

# Quick check with pandas
try:
    cvs = pd.read_csv('CVs.csv', nrows=1)
    print(f"  Pandas columns: {len(cvs.columns)}")
    print(f"  Has 'work_experience_json': {'work_experience_json' in cvs.columns}")
except Exception as e:
    print(f"  Pandas ERROR: {e}")

# Check raw CSV structure
with open('CVs.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    first_row = next(reader)
    
    print(f"\n  Raw CSV columns: {len(header)}")
    print(f"  Raw CSV first row values: {len(first_row)}")
    
    # Find work_experience_json
    if 'work_experience_json' in header:
        idx = header.index('work_experience_json')
        print(f"  work_experience_json at index: {idx}")
        
        # Check for unnamed columns after it
        unnamed_count = 0
        for i in range(idx + 1, len(header)):
            if 'Unnamed:' in header[i]:
                unnamed_count += 1
            else:
                break
        print(f"  Unnamed columns after: {unnamed_count}")
        
        # Try to reconstruct JSON
        json_parts = [first_row[idx]]
        for i in range(idx + 1, idx + 1 + unnamed_count):
            if i < len(first_row):
                json_parts.append(first_row[i])
        
        reconstructed = ','.join(json_parts)
        print(f"\n  Reconstructed JSON length: {len(reconstructed)} chars")
        print(f"  First 200 chars: {reconstructed[:200]}")
        
        # Try to parse
        try:
            parsed = json.loads(reconstructed)
            print(f"  ✓ Valid JSON: {len(parsed)} work experiences")
            if len(parsed) > 0:
                print(f"  First entry keys: {list(parsed[0].keys())}")
                if 'industry' in parsed[0]:
                    print(f"  First industry: {parsed[0]['industry']}")
                else:
                    print(f"  ✗ NO 'industry' FIELD IN WORK EXPERIENCE")
        except Exception as e:
            print(f"  ✗ Invalid JSON: {e}")
    else:
        print(f"  ✗ 'work_experience_json' NOT FOUND in header")

# ============================================================================
# 4. CHECK IF WORK EXPERIENCE DATA EXISTS
# ============================================================================
print("\n4. WORK EXPERIENCE DATA CHECK (First 5 CVs)")
print("-" * 80)

with open('CVs.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    
    if 'work_experience_json' in header:
        idx = header.index('work_experience_json')
        
        # Count unnamed columns
        unnamed_count = 0
        for i in range(idx + 1, len(header)):
            if 'Unnamed:' in header[i]:
                unnamed_count += 1
            else:
                break
        
        for row_num in range(5):
            try:
                row = next(reader)
                
                # Reconstruct JSON
                json_parts = [row[idx]]
                for i in range(idx + 1, idx + 1 + unnamed_count):
                    if i < len(row):
                        json_parts.append(row[i])
                
                reconstructed = ','.join(json_parts)
                
                if not reconstructed or reconstructed.strip() == '':
                    print(f"  Row {row_num + 1}: EMPTY")
                    continue
                
                parsed = json.loads(reconstructed)
                
                # Check for industry
                industries = []
                for exp in parsed:
                    if 'industry' in exp:
                        industries.append(exp['industry'])
                
                print(f"  Row {row_num + 1}: {len(parsed)} experiences, industries: {industries if industries else 'NONE'}")
                
            except StopIteration:
                print(f"  Row {row_num + 1}: No more rows")
                break
            except Exception as e:
                print(f"  Row {row_num + 1}: ERROR - {e}")

# ============================================================================
# 5. ANALYZE WHY industry_transitions.json IS EMPTY
# ============================================================================
print("\n5. ROOT CAUSE ANALYSIS")
print("-" * 80)

print("\nPossible reasons industry_transitions.json is empty:")
print("  1. Work experience JSON is empty/null for all CVs")
print("  2. Work experience exists but has no 'industry' field")
print("  3. analyze_datasets.py failed to extract the data")
print("  4. JSON is split across columns and not reconstructed properly")

print("\nRecommended next steps:")
print("  1. Check if analyze_datasets.py handles column splitting")
print("  2. Fix the data extraction script")
print("  3. Re-run the analysis")
print("  4. Use manual test data as temporary workaround")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)
