"""
Quick diagnostic: Check CV structure and work_experience_json
"""
import pandas as pd
import json

print("=" * 80)
print("DIAGNOSTIC: CV Data Structure")
print("=" * 80)

# Load CVs
cvs = pd.read_csv('CVs.csv', nrows=5)  # Just first 5 rows

print(f"\n1. Total columns: {len(cvs.columns)}")
print(f"   Columns: {list(cvs.columns)}")

print("\n2. Checking work_experience_json field...")

if 'work_experience_json' in cvs.columns:
    print("   ✓ Column exists")
    
    # Check first 3 rows
    for idx, row in cvs.head(3).iterrows():
        print(f"\n   Row {idx + 1}:")
        work_exp = row['work_experience_json']
        
        if pd.isna(work_exp):
            print("     ✗ NULL/Empty")
        else:
            print(f"     Type: {type(work_exp)}")
            print(f"     Length: {len(str(work_exp))}")
            print(f"     Sample: {str(work_exp)[:200]}...")
            
            # Try to parse as JSON
            try:
                parsed = json.loads(work_exp)
                print(f"     ✓ Valid JSON: {len(parsed)} entries")
                if len(parsed) > 0:
                    print(f"     First entry keys: {list(parsed[0].keys())}")
                    if 'industry' in parsed[0]:
                        print(f"     Industry: {parsed[0]['industry']}")
            except:
                print("     ✗ Not valid JSON")
else:
    print("   ✗ Column does not exist!")
    print(f"   Available columns: {list(cvs.columns)}")

print("\n" + "=" * 80)
