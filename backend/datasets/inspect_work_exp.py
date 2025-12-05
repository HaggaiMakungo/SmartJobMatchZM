"""
Check actual content of work_experience_json
"""
import csv

print("=" * 80)
print("WORK EXPERIENCE JSON CONTENT INSPECTION")
print("=" * 80)

with open('CVs.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    print("\nFirst 5 CVs - work_experience_json content:\n")
    
    for i, row in enumerate(reader):
        if i >= 5:
            break
        
        work_exp = row.get('work_experience_json', '')
        
        print(f"\n--- CV {i+1} ---")
        print(f"Length: {len(work_exp)} characters")
        print(f"Content: {work_exp}")
        print(f"First 200 chars: {work_exp[:200]}")
        print(f"Last 100 chars: ...{work_exp[-100:]}")
        
        # Try to identify the issue
        if work_exp:
            if work_exp.startswith('['):
                print("✓ Starts with [")
            else:
                print("✗ Does NOT start with [")
            
            if work_exp.endswith(']'):
                print("✓ Ends with ]")
            else:
                print("✗ Does NOT end with ]")
            
            # Count brackets
            open_brackets = work_exp.count('[')
            close_brackets = work_exp.count(']')
            open_braces = work_exp.count('{')
            close_braces = work_exp.count('}')
            
            print(f"Brackets: [ = {open_brackets}, ] = {close_brackets}")
            print(f"Braces:   {{ = {open_braces}, }} = {close_braces}")
        else:
            print("✗ EMPTY or NULL")

print("\n" + "=" * 80)
print("COLUMN HEADERS CHECK")
print("=" * 80)

with open('CVs.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames
    
    print(f"\nTotal columns: {len(headers)}")
    print("\nAll column names:")
    for i, header in enumerate(headers):
        if 'work' in header.lower() or 'experience' in header.lower() or 'json' in header.lower():
            print(f"  {i:2d}. {header} ← RELEVANT")
        else:
            print(f"  {i:2d}. {header}")

print("\n" + "=" * 80)
