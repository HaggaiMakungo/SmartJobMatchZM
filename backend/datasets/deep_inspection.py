"""
Deep inspection of CVs.csv work_experience_json column
"""
import csv
import pandas as pd

print("=" * 80)
print("DEEP CSV INSPECTION")
print("=" * 80)

# Method 1: Check raw CSV line
print("\n1. RAW CSV INSPECTION (First 3 lines)")
print("-" * 80)

with open('CVs.csv', 'r', encoding='utf-8', newline='') as f:
    for i, line in enumerate(f):
        if i == 0:
            print(f"HEADER (length: {len(line)} chars):")
            # Find work_experience_json position
            headers = line.strip().split(',')
            for idx, h in enumerate(headers):
                if 'work_experience' in h.lower():
                    print(f"  Found at position {idx}: {h}")
        elif i <= 3:
            print(f"\nDATA ROW {i} (length: {len(line)} chars):")
            print(f"First 500 chars: {line[:500]}")
            print(f"Last 200 chars: ...{line[-200:]}")
        else:
            break

# Method 2: Use pandas with different quoting
print("\n\n2. PANDAS WITH QUOTECHAR")
print("-" * 80)

try:
    # Try reading with quote handling
    df = pd.read_csv('CVs.csv', quotechar='"', escapechar='\\')
    print(f"✓ Loaded with quotechar: {len(df)} rows, {len(df.columns)} columns")
    
    if 'work_experience_json' in df.columns:
        print(f"\nFirst work_experience_json value:")
        val = df['work_experience_json'].iloc[0]
        print(f"Type: {type(val)}")
        print(f"Length: {len(str(val)) if pd.notna(val) else 0}")
        print(f"Content: {str(val)[:500]}")
        
        # Try to parse
        import json
        try:
            parsed = json.loads(val)
            print(f"✓ Valid JSON: {len(parsed)} entries")
            if len(parsed) > 0:
                print(f"First entry: {parsed[0]}")
        except Exception as e:
            print(f"✗ Parse error: {e}")
            
except Exception as e:
    print(f"✗ Error: {e}")

# Method 3: Check if it's a quoting issue
print("\n\n3. MANUAL PARSING WITH CSV MODULE")
print("-" * 80)

with open('CVs.csv', 'r', encoding='utf-8') as f:
    # Try different csv dialects
    sample = f.read(10000)
    f.seek(0)
    
    try:
        dialect = csv.Sniffer().sniff(sample)
        print(f"Detected dialect:")
        print(f"  delimiter: {repr(dialect.delimiter)}")
        print(f"  quotechar: {repr(dialect.quotechar)}")
        print(f"  doublequote: {dialect.doublequote}")
        print(f"  escapechar: {repr(dialect.escapechar)}")
        
        f.seek(0)
        reader = csv.reader(f, dialect=dialect)
        header = next(reader)
        first_row = next(reader)
        
        work_exp_idx = header.index('work_experience_json')
        print(f"\nwork_experience_json column index: {work_exp_idx}")
        print(f"Value length: {len(first_row[work_exp_idx])}")
        print(f"Value: {first_row[work_exp_idx][:500]}")
        
        # Check if it's valid JSON
        import json
        try:
            parsed = json.loads(first_row[work_exp_idx])
            print(f"✓ Valid JSON with {len(parsed)} entries")
            if len(parsed) > 0:
                print(f"Keys: {list(parsed[0].keys())}")
        except Exception as e:
            print(f"✗ JSON error: {e}")
            
    except Exception as e:
        print(f"Dialect detection failed: {e}")

# Method 4: Check actual file encoding
print("\n\n4. FILE ENCODING CHECK")
print("-" * 80)

import chardet

with open('CVs.csv', 'rb') as f:
    raw = f.read(10000)
    result = chardet.detect(raw)
    print(f"Detected encoding: {result}")

print("\n" + "=" * 80)
