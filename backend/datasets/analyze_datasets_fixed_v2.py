"""
Dataset Analysis Script - FIXED VERSION
Properly handles CSV with JSON columns that may be split
"""

import pandas as pd
import json
from collections import Counter, defaultdict
import csv
import re

# File paths
CVS_PATH = "CVs.csv"
CORP_JOBS_PATH = "Corp_jobs.csv"
SMALL_JOBS_PATH = "Small_jobs.csv"

print("=" * 80)
print("DATASET ANALYSIS - AI Job Matching System (FIXED)")
print("=" * 80)

# ============================================================================
# 1. LOAD DATASETS WITH PROPER JSON HANDLING
# ============================================================================
print("\n[1/6] Loading datasets with JSON reconstruction...")

def load_cvs_with_json_reconstruction(filepath):
    """
    Load CVs CSV with proper JSON reconstruction for work_experience_json
    that may be split across multiple columns
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        # Find work_experience_json column and unnamed columns after it
        work_exp_idx = header.index('work_experience_json')
        
        # Count consecutive Unnamed columns
        unnamed_indices = []
        for i in range(work_exp_idx + 1, len(header)):
            if 'Unnamed:' in header[i]:
                unnamed_indices.append(i)
            else:
                break
        
        print(f"  Found work_experience_json at index {work_exp_idx}")
        print(f"  Found {len(unnamed_indices)} unnamed columns to merge")
        
        # Build clean header (remove unnamed columns)
        clean_header = [col for col in header if not col.startswith('Unnamed:')]
        
        # Process rows
        data = []
        for row in reader:
            # Reconstruct JSON from split columns
            if work_exp_idx < len(row):
                json_parts = [row[work_exp_idx]]
                for idx in unnamed_indices:
                    if idx < len(row):
                        json_parts.append(row[idx])
                reconstructed_json = ','.join(json_parts)
                
                # Build clean row (excluding unnamed columns)
                clean_row = []
                for i, val in enumerate(row):
                    if i == work_exp_idx:
                        clean_row.append(reconstructed_json)
                    elif i not in unnamed_indices:
                        clean_row.append(val)
                
                data.append(clean_row)
        
        # Create DataFrame
        df = pd.DataFrame(data, columns=clean_header)
        
        # Convert numeric columns
        numeric_cols = ['total_years_experience', 'salary_expectation_min', 
                       'salary_expectation_max', 'resume_quality_score']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df

try:
    cvs = load_cvs_with_json_reconstruction(CVS_PATH)
    print(f"✓ CVs loaded: {len(cvs):,} records")
    print(f"  Columns: {list(cvs.columns)}")
except Exception as e:
    print(f"✗ Error loading CVs: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Load other datasets normally
try:
    corp_jobs = pd.read_csv(CORP_JOBS_PATH, encoding='utf-8')
    print(f"✓ Corp Jobs loaded: {len(corp_jobs):,} records")
except Exception as e:
    print(f"✗ Error loading Corp Jobs: {e}")
    exit(1)

try:
    small_jobs = pd.read_csv(SMALL_JOBS_PATH, encoding='utf-8')
    print(f"✓ Small Jobs loaded: {len(small_jobs):,} records")
except Exception as e:
    print(f"✗ Error loading Small Jobs: {e}")
    exit(1)

# ============================================================================
# 2. SCHEMA VALIDATION
# ============================================================================
print("\n[2/6] Validating schemas...")

print(f"✓ CV schema: {len(cvs.columns)} columns")
print(f"✓ Corp Jobs schema: {len(corp_jobs.columns)} columns")
print(f"✓ Small Jobs schema: {len(small_jobs.columns)} columns")

# ============================================================================
# 3. DATA QUALITY CHECKS
# ============================================================================
print("\n[3/6] Running data quality checks...")

print("\nCV Dataset:")
print(f"  • Total records: {len(cvs):,}")
print(f"  • Has work_experience_json: {'work_experience_json' in cvs.columns}")

if 'work_experience_json' in cvs.columns:
    # Check if work experience data exists
    non_empty = cvs['work_experience_json'].notna().sum()
    print(f"  • Non-empty work_experience: {non_empty} ({non_empty/len(cvs)*100:.1f}%)")
    
    # Sample first few entries
    print(f"\n  Sample work_experience_json entries:")
    for idx, val in enumerate(cvs['work_experience_json'].head(3)):
        if pd.notna(val) and val:
            try:
                parsed = json.loads(val)
                print(f"    Row {idx + 1}: {len(parsed)} experiences")
                if len(parsed) > 0:
                    keys = list(parsed[0].keys())
                    print(f"      Keys: {keys}")
                    if 'industry' in keys:
                        print(f"      Industry: {parsed[0]['industry']}")
                    else:
                        print(f"      ⚠️  NO 'industry' field!")
            except Exception as e:
                print(f"    Row {idx + 1}: Invalid JSON - {e}")
                print(f"      Sample: {str(val)[:100]}")
        else:
            print(f"    Row {idx + 1}: Empty")

# ============================================================================
# 4. EXTRACT SKILLS TAXONOMY
# ============================================================================
print("\n[4/6] Extracting skills taxonomy...")

all_skills = []
for skills_str in cvs['skills_technical'].dropna():
    if isinstance(skills_str, str):
        skills = [s.strip() for s in skills_str.split(',')]
        all_skills.extend(skills)

skill_freq = Counter(all_skills)
print(f"\nTotal unique skills: {len(skill_freq)}")
print(f"Top 20 technical skills:")
for i, (skill, count) in enumerate(skill_freq.most_common(20), 1):
    print(f"  {i:2d}. {skill:30s} ({count:4d} occurrences, {count/len(cvs)*100:5.1f}%)")

# Save skills taxonomy
top_500_skills = skill_freq.most_common(500)
skills_taxonomy_data = [
    {"skill": skill, "frequency": count, "percentage": count/len(cvs)*100}
    for skill, count in top_500_skills
]

with open('skills_taxonomy.json', 'w') as f:
    json.dump(skills_taxonomy_data, f, indent=2)
print(f"\n✓ Saved top 500 skills to skills_taxonomy.json")

# ============================================================================
# 5. BUILD SKILL CO-OCCURRENCE MATRIX
# ============================================================================
print("\n[5/6] Building skill co-occurrence matrix...")

co_occurrence = defaultdict(int)
skill_counts = defaultdict(int)

for skills_str in cvs['skills_technical'].dropna():
    if isinstance(skills_str, str):
        skills = [s.strip() for s in skills_str.split(',')]
        
        # Count individual skills
        for skill in skills:
            skill_counts[skill] += 1
        
        # Count co-occurrences
        for i, skill_a in enumerate(skills):
            for skill_b in skills[i+1:]:
                pair = tuple(sorted([skill_a, skill_b]))
                co_occurrence[pair] += 1

# Calculate co-occurrence percentages (Jaccard similarity)
co_occurrence_matrix = []
for (skill_a, skill_b), co_count in sorted(co_occurrence.items(), key=lambda x: x[1], reverse=True)[:100]:
    a_count = skill_counts[skill_a]
    b_count = skill_counts[skill_b]
    
    # Jaccard similarity: intersection / union
    jaccard = co_count / (a_count + b_count - co_count)
    
    co_occurrence_matrix.append({
        "skill_a": skill_a,
        "skill_b": skill_b,
        "co_occurrences": co_count,
        "jaccard_similarity": round(jaccard, 3)
    })

with open('skill_co_occurrence.json', 'w') as f:
    json.dump(co_occurrence_matrix, f, indent=2)

print(f"Top 10 skill pairs (by co-occurrence):")
for i, pair in enumerate(co_occurrence_matrix[:10], 1):
    print(f"  {i:2d}. {pair['skill_a']} + {pair['skill_b']}: "
          f"{pair['co_occurrences']} times (similarity: {pair['jaccard_similarity']:.2f})")

print(f"\n✓ Saved top 100 co-occurrence pairs to skill_co_occurrence.json")

# ============================================================================
# 6. DERIVE INDUSTRY TRANSITION MATRIX
# ============================================================================
print("\n[6/6] Deriving industry transition matrix...")

transitions = defaultdict(int)
current_industries = []
total_cvs_checked = 0
cvs_with_work_exp = 0
cvs_with_industry = 0

for work_exp_str in cvs['work_experience_json'].dropna():
    total_cvs_checked += 1
    try:
        if pd.isna(work_exp_str) or not work_exp_str or work_exp_str.strip() == '':
            continue
            
        work_exp = json.loads(work_exp_str) if isinstance(work_exp_str, str) else []
        
        if len(work_exp) > 0:
            cvs_with_work_exp += 1
            
            # Check if industry field exists
            has_industry = False
            for exp in work_exp:
                if 'industry' in exp and exp['industry']:
                    has_industry = True
                    break
            
            if has_industry:
                cvs_with_industry += 1
                
                # Most recent industry
                if 'industry' in work_exp[0]:
                    current_industries.append(work_exp[0]['industry'])
                
                # Track transitions
                for i in range(len(work_exp) - 1):
                    from_industry = work_exp[i].get('industry', 'Unknown')
                    to_industry = work_exp[i+1].get('industry', 'Unknown')
                    if from_industry != 'Unknown' and to_industry != 'Unknown':
                        transitions[(from_industry, to_industry)] += 1
    except Exception as e:
        pass

print(f"\nIndustry extraction statistics:")
print(f"  • Total CVs checked: {total_cvs_checked}")
print(f"  • CVs with work experience: {cvs_with_work_exp}")
print(f"  • CVs with industry field: {cvs_with_industry}")
print(f"  • Total transitions found: {len(transitions)}")

# Calculate transition probabilities
industry_counts = Counter(current_industries)
transition_matrix = []

if len(transitions) > 0:
    for (from_ind, to_ind), count in sorted(transitions.items(), key=lambda x: x[1], reverse=True)[:50]:
        from_total = industry_counts[from_ind]
        probability = count / from_total if from_total > 0 else 0
        
        transition_matrix.append({
            "from_industry": from_ind,
            "to_industry": to_ind,
            "transitions": count,
            "probability": round(probability, 3)
        })

    with open('industry_transitions.json', 'w') as f:
        json.dump(transition_matrix, f, indent=2)

    print(f"\nTop 10 industry transitions:")
    for i, trans in enumerate(transition_matrix[:10], 1):
        print(f"  {i:2d}. {trans['from_industry']:20s} → {trans['to_industry']:20s}: "
              f"{trans['transitions']:3d} transitions ({trans['probability']:.1%})")

    print(f"\n✓ Saved top 50 transitions to industry_transitions.json")
else:
    print(f"\n⚠️  NO INDUSTRY TRANSITIONS FOUND!")
    print(f"   This means work_experience_json exists but has no 'industry' field")
    print(f"   Creating empty industry_transitions.json as placeholder")
    
    with open('industry_transitions.json', 'w') as f:
        json.dump([], f)

# ============================================================================
# 7. SUMMARY & RECOMMENDATIONS
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSIS COMPLETE - SUMMARY")
print("=" * 80)

print(f"\n✓ Datasets validated:")
print(f"  • {len(cvs):,} CVs")
print(f"  • {len(corp_jobs):,} Corp Jobs")
print(f"  • {len(small_jobs):,} Small Jobs")

print(f"\n✓ Matching intelligence extracted:")
print(f"  • skills_taxonomy.json ({len(skills_taxonomy_data)} skills)")
print(f"  • skill_co_occurrence.json ({len(co_occurrence_matrix)} pairs)")
print(f"  • industry_transitions.json ({len(transition_matrix)} transitions)")

if len(transition_matrix) == 0:
    print(f"\n⚠️  WARNING: Industry transitions is empty!")
    print(f"   This is likely because work_experience_json doesn't have an 'industry' field")
    print(f"   You can use test_seed_manual.sql to insert sample transition data")

print(f"\n🎯 Next Steps:")
print(f"  1. Review generated JSON files")
print(f"  2. Run: python seed_matching_tables.py")
print(f"  3. If category_compatibility is empty, run test_seed_manual.sql")
print(f"  4. Begin implementing matching algorithms")

print("\n" + "=" * 80)
