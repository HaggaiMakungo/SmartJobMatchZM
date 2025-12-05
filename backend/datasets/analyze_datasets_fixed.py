"""
Dataset Analysis Script - FIXED for split JSON columns
Validates data quality and extracts matching intelligence from generated datasets
"""

import pandas as pd
import json
from collections import Counter, defaultdict
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
print("\n[1/6] Loading datasets...")

try:
    # Load CVs with special handling for JSON columns
    cvs = pd.read_csv(CVS_PATH, low_memory=False)
    print(f"✓ CVs loaded: {len(cvs):,} records, {len(cvs.columns)} columns")
    
    # Find and reconstruct JSON columns that got split
    work_exp_col_idx = cvs.columns.get_loc('work_experience_json')
    projects_col_idx = cvs.columns.get_loc('projects_json')
    references_col_idx = cvs.columns.get_loc('references_json')
    
    # Find where unnamed columns start
    unnamed_start = None
    for i, col in enumerate(cvs.columns):
        if col.startswith('Unnamed:'):
            unnamed_start = i
            break
    
    if unnamed_start:
        print(f"  Found {len(cvs.columns) - unnamed_start} unnamed columns - reconstructing JSON...")
        
        # Reconstruct work_experience_json
        def reconstruct_json_row(row, start_idx, unnamed_start):
            parts = [str(row.iloc[start_idx])]
            for i in range(unnamed_start, len(row)):
                if pd.notna(row.iloc[i]) and str(row.iloc[i]).strip():
                    parts.append(str(row.iloc[i]))
                else:
                    break
            combined = ','.join(parts)
            # Clean up any double commas
            combined = re.sub(r',+', ',', combined)
            return combined
        
        # Reconstruct for all rows
        cvs['work_experience_json_fixed'] = cvs.apply(
            lambda row: reconstruct_json_row(row, work_exp_col_idx, unnamed_start),
            axis=1
        )
        print(f"  ✓ Reconstructed work_experience_json")
        
        # Use fixed column
        cvs['work_experience_json'] = cvs['work_experience_json_fixed']
    
except Exception as e:
    print(f"✗ Error loading CVs: {e}")
    exit(1)

try:
    corp_jobs = pd.read_csv(CORP_JOBS_PATH)
    print(f"✓ Corp Jobs loaded: {len(corp_jobs):,} records")
except Exception as e:
    print(f"✗ Error loading Corp Jobs: {e}")
    exit(1)

try:
    small_jobs = pd.read_csv(SMALL_JOBS_PATH)
    print(f"✓ Small Jobs loaded: {len(small_jobs):,} records")
except Exception as e:
    print(f"✗ Error loading Small Jobs: {e}")
    exit(1)

# ============================================================================
# 2. DATA QUALITY CHECKS
# ============================================================================
print("\n[2/6] Running data quality checks...")

print("\nCV Dataset:")
print(f"  • Total records: {len(cvs):,}")
print(f"  • Columns: {len(cvs.columns)}")
print(f"  • Null work_experience_json: {cvs['work_experience_json'].isna().sum()}")

# ============================================================================
# 3. EXTRACT SKILLS TAXONOMY
# ============================================================================
print("\n[3/6] Extracting skills taxonomy...")

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
# 4. BUILD SKILL CO-OCCURRENCE MATRIX
# ============================================================================
print("\n[4/6] Building skill co-occurrence matrix...")

co_occurrence = defaultdict(int)
skill_counts = defaultdict(int)

for skills_str in cvs['skills_technical'].dropna():
    if isinstance(skills_str, str):
        skills = [s.strip() for s in skills_str.split(',')]
        
        for skill in skills:
            skill_counts[skill] += 1
        
        for i, skill_a in enumerate(skills):
            for skill_b in skills[i+1:]:
                pair = tuple(sorted([skill_a, skill_b]))
                co_occurrence[pair] += 1

co_occurrence_matrix = []
for (skill_a, skill_b), co_count in co_occurrence.most_common(100):
    a_count = skill_counts[skill_a]
    b_count = skill_counts[skill_b]
    
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
# 5. DERIVE INDUSTRY TRANSITION MATRIX (FIXED)
# ============================================================================
print("\n[5/6] Deriving industry transition matrix...")

transitions = defaultdict(int)
current_industries = []

successful_parses = 0
failed_parses = 0

for idx, work_exp_str in enumerate(cvs['work_experience_json'].dropna()):
    if not isinstance(work_exp_str, str) or not work_exp_str.strip():
        continue
    
    try:
        # Clean up the JSON string
        work_exp_str = work_exp_str.strip()
        
        # Try to parse
        work_exp = json.loads(work_exp_str)
        
        if isinstance(work_exp, list) and len(work_exp) > 0:
            successful_parses += 1
            
            # Get most recent industry
            if 'industry' in work_exp[0]:
                current_industries.append(work_exp[0]['industry'])
            
            # Track transitions
            for i in range(len(work_exp) - 1):
                if 'industry' in work_exp[i] and 'industry' in work_exp[i+1]:
                    from_industry = work_exp[i]['industry']
                    to_industry = work_exp[i+1]['industry']
                    transitions[(from_industry, to_industry)] += 1
                    
    except json.JSONDecodeError as e:
        failed_parses += 1
        if failed_parses <= 5:  # Show first 5 errors
            print(f"  ⚠ Row {idx}: JSON parse error - {str(work_exp_str)[:100]}...")
    except Exception as e:
        failed_parses += 1

print(f"\nParsing results:")
print(f"  ✓ Successfully parsed: {successful_parses}")
print(f"  ✗ Failed to parse: {failed_parses}")

# Calculate transition probabilities
industry_counts = Counter(current_industries)
transition_matrix = []

for (from_ind, to_ind), count in sorted(transitions.items(), key=lambda x: x[1], reverse=True)[:50]:
    from_total = industry_counts.get(from_ind, count)
    probability = count / from_total if from_total > 0 else 0
    
    transition_matrix.append({
        "from_industry": from_ind,
        "to_industry": to_ind,
        "transitions": count,
        "probability": round(probability, 3)
    })

with open('industry_transitions.json', 'w') as f:
    json.dump(transition_matrix, f, indent=2)

if len(transition_matrix) > 0:
    print(f"\nTop 10 industry transitions:")
    for i, trans in enumerate(transition_matrix[:10], 1):
        print(f"  {i:2d}. {trans['from_industry']:20s} → {trans['to_industry']:20s}: "
              f"{trans['transitions']:3d} transitions ({trans['probability']:.1%})")
    print(f"\n✓ Saved {len(transition_matrix)} transitions to industry_transitions.json")
else:
    print(f"\n⚠ No transitions found - check work_experience_json format")

# ============================================================================
# 6. SUMMARY
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
    print(f"\n⚠ WARNING: No industry transitions found!")
    print(f"  This means work_experience_json doesn't have 'industry' field.")
    print(f"  You can still use the matching system, but category_compatibility")
    print(f"  will need to be populated manually or with sample data.")

print("\n" + "=" * 80)
