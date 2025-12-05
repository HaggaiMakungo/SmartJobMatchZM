"""
Debug: Show the exact reconstructed JSON
"""
import csv

print("=" * 80)
print("DEBUG: Reconstructed JSON Content")
print("=" * 80)

with open('CVs.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    
    work_exp_idx = 26
    
    print(f"\nColumns {work_exp_idx} onwards:")
    for i in range(work_exp_idx, min(work_exp_idx + 10, len(header))):
        print(f"  [{i}] {header[i]}")
    
    print("\n" + "=" * 80)
    print("First CV - Column by column:")
    print("=" * 80)
    
    first_row = next(reader)
    
    print(f"\nTotal row length: {len(first_row)}")
    print(f"\nColumns {work_exp_idx} to end:")
    
    for i in range(work_exp_idx, len(first_row)):
        val = first_row[i]
        print(f"\n[{i}] Length: {len(val):4d} | Content: {val[:100]}")
    
    print("\n" + "=" * 80)
    print("RECONSTRUCTION ATTEMPTS:")
    print("=" * 80)
    
    # Method 1: Join with comma
    method1 = ','.join([first_row[i] for i in range(work_exp_idx, len(first_row)) if first_row[i]])
    print(f"\nMethod 1 (comma join):")
    print(f"Length: {len(method1)}")
    print(f"Content: {method1}")
    
    # Method 2: Join with nothing
    method2 = ''.join([first_row[i] for i in range(work_exp_idx, len(first_row)) if first_row[i]])
    print(f"\nMethod 2 (no separator):")
    print(f"Length: {len(method2)}")
    print(f"First 500 chars: {method2[:500]}")
    print(f"Last 200 chars: ...{method2[-200:]}")
    
    # Try parsing
    import json
    for method_name, content in [("Method 1", method1), ("Method 2", method2)]:
        print(f"\n{method_name} parsing:")
        try:
            parsed = json.loads(content)
            print(f"  ✓ SUCCESS! {len(parsed)} entries")
            if len(parsed) > 0:
                print(f"  Keys: {list(parsed[0].keys())}")
        except Exception as e:
            print(f"  ✗ Error: {e}")
            # Show where it fails
            if len(content) > 100:
                fail_point = min(100, len(str(e).split('char')[-1].strip().rstrip(')')))
                print(f"  Around error: ...{content[max(0, fail_point-50):fail_point+50]}...")

print("\n" + "=" * 80)
