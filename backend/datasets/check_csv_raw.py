"""
Check raw CSV structure to see if JSON is split across columns
"""
import csv

print("=" * 80)
print("RAW CSV STRUCTURE CHECK")
print("=" * 80)

with open('CVs.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    
    # Get header
    header = next(reader)
    print(f"\nTotal columns in CSV: {len(header)}")
    print(f"\nFirst 30 columns:")
    for i, col in enumerate(header[:30]):
        print(f"  {i:2d}. {col}")
    
    print(f"\n\nColumns 26-30 (around work_experience_json):")
    for i in range(26, min(31, len(header))):
        print(f"  {i:2d}. {header[i]}")
    
    # Check first data row
    print("\n" + "=" * 80)
    print("FIRST DATA ROW")
    print("=" * 80)
    
    first_row = next(reader)
    print(f"\nTotal values in first row: {len(first_row)}")
    
    # Find work_experience_json column
    work_exp_idx = header.index('work_experience_json')
    print(f"\nwork_experience_json is at index: {work_exp_idx}")
    print(f"Value: {first_row[work_exp_idx]}")
    
    # Check if JSON continues in "Unnamed" columns
    print(f"\n\nValues in columns around work_experience_json:")
    for i in range(max(0, work_exp_idx-1), min(work_exp_idx+10, len(first_row))):
        val = first_row[i][:100] if len(first_row[i]) > 100 else first_row[i]
        print(f"  [{i:2d}] {header[i]:30s}: {val}")
    
    # Try to reconstruct the full JSON
    print("\n" + "=" * 80)
    print("RECONSTRUCTION ATTEMPT")
    print("=" * 80)
    
    # Collect all values from work_experience_json onwards until we find the next real column
    json_parts = []
    for i in range(work_exp_idx, len(first_row)):
        if header[i].startswith('Unnamed:') or header[i] == 'work_experience_json':
            json_parts.append(first_row[i])
        else:
            break
    
    reconstructed = ','.join(json_parts)
    print(f"\nReconstructed JSON (first 500 chars):")
    print(reconstructed[:500])
    print("\n...")
    
    # Try to parse
    import json
    try:
        parsed = json.loads(reconstructed)
        print(f"\n✓ Valid JSON! Contains {len(parsed)} work experience entries")
        if len(parsed) > 0:
            print(f"\nFirst entry: {json.dumps(parsed[0], indent=2)}")
    except Exception as e:
        print(f"\n✗ Still not valid JSON: {e}")
