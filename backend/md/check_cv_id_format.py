"""
Check CV ID format in CSV
"""
import pandas as pd

df = pd.read_csv('datasets/CVs.csv', nrows=10)

print("=" * 80)
print("CV ID FORMAT CHECK")
print("=" * 80)

print("\nFirst 10 CV IDs:")
print(df[['cv_id', 'full_name']].to_string())

print(f"\nCV ID data type: {df['cv_id'].dtype}")
print(f"\nSample cv_id values:")
for i in range(min(5, len(df))):
    cv_id = df['cv_id'].iloc[i]
    print(f"  {i+1}. cv_id = {cv_id} (type: {type(cv_id).__name__})")

print("\n" + "=" * 80)
