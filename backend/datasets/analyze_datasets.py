"""
Dataset Analysis Script
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
print("DATASET ANALYSIS - AI Job Matching System")
print("=" * 80)

# ============================================================================
# 1. LOAD DATASETS
# ============================================================================
print("\n[1/6] Loading datasets...")

def load_csv_with_encoding(filepath, encodings=['utf-8', 'latin-1', 'windows-1252', 'cp1252']):
    """Try loading CSV with different encodings"""
    for encoding in encodings:
        try:
            return pd.read_csv(filepath, encoding=encoding)
        except UnicodeDecodeError:
            continue
        except Exception as e:
            raise e
    raise Exception(f"Could not decode file with any of these encodings: {encodings}")

try:
    cvs = load_csv_with_encoding(CVS_PATH)
    print(f"✓ CVs loaded: {len(cvs):,} records")
except Exception as e:
    print(f"✗ Error loading CVs: {e}")
    exit(1)

try:
    corp_jobs = load_csv_with_encoding(CORP_JOBS_PATH)
    print(f"✓ Corp Jobs loaded: {len(corp_jobs):,} records")
except Exception as e:
    print(f"✗ Error loading Corp Jobs: {e}")
    exit(1)

try:
    small_jobs = load_csv_with_encoding(SMALL_JOBS_PATH)
    print(f"✓ Small Jobs loaded: {len(small_jobs):,} records")
except Exception as e:
    print(f"✗ Error loading Small Jobs: {e}")
    exit(1)

# ============================================================================
# 2. SCHEMA VALIDATION
# ============================================================================
print("\n[2/6] Validating schemas...")

# Expected CV columns
expected_cv_columns = [
    'cv_id', 'full_name', 'phone', 'email', 'gender', 'date_of_birth',
    'nationality', 'city', 'province', 'education_level', 'institution',
    'graduation_year', 'major', 'certifications', 'languages',
    'language_proficiency', 'total_years_experience', 'current_job_title',
    'employment_status', 'preferred_job_type', 'preferred_location',
    'salary_expectation_min', 'salary_expectation_max', 'availability',
    'skills_technical', 'skills_soft', 'work_experience_json',
    'projects_json', 'references_json', 'resume_quality_score'
]

cv_columns_match = set(cvs.columns) == set(expected_cv_columns)
print(f"{'✓' if cv_columns_match else '✗'} CV schema: {len(cvs.columns)} columns")
if not cv_columns_match:
    missing = set(expected_cv_columns) - set(cvs.columns)
    extra = set(cvs.columns) - set(expected_cv_columns)
    if missing:
        print(f"  Missing: {missing}")
    if extra:
        print(f"  Extra: {extra}")

# Expected Corp Jobs columns
expected_corp_columns = [
    'job_id', 'title', 'company', 'category', 'collar_type', 'description',
    'key_responsibilities', 'required_skills', 'preferred_skills',
    'required_experience_years', 'required_education', 'preferred_certifications',
    'location_city', 'location_province', 'salary_min_zmw', 'salary_max_zmw',
    'employment_type', 'work_schedule', 'language_requirements',
    'application_deadline', 'posted_date', 'benefits', 'growth_opportunities',
    'company_size', 'industry_sector'
]

corp_columns_match = set(corp_jobs.columns) == set(expected_corp_columns)
print(f"{'✓' if corp_columns_match else '✗'} Corp Jobs schema: {len(corp_jobs.columns)} columns")
if not corp_columns_match:
    missing = set(expected_corp_columns) - set(corp_jobs.columns)
    extra = set(corp_jobs.columns) - set(expected_corp_columns)
    if missing:
        print(f"  Missing: {missing}")
    if extra:
        print(f"  Extra: {extra}")

# Expected Small Jobs columns
expected_small_columns = [
    'id', 'title', 'category', 'description', 'province', 'location',
    'budget', 'paymentType', 'duration', 'postedBy', 'datePosted', 'status'
]

small_columns_match = set(small_jobs.columns) == set(expected_small_columns)
print(f"{'✓' if small_columns_match else '✗'} Small Jobs schema: {len(small_jobs.columns)} columns")
if not small_columns_match:
    missing = set(expected_small_columns) - set(small_jobs.columns)
    extra = set(small_jobs.columns) - set(expected_small_columns)
    if missing:
        print(f"  Missing: {missing}")
    if extra:
        print(f"  Extra: {extra}")

# ============================================================================
# 3. DATA QUALITY CHECKS
# ============================================================================
print("\n[3/6] Running data quality checks...")

# CV Quality Checks
print("\nCV Dataset:")
print(f"  • Null values in critical fields:")
print(f"    - skills_technical: {cvs['skills_technical'].isna().sum()}")
print(f"    - total_years_experience: {cvs['total_years_experience'].isna().sum()}")
print(f"    - education_level: {cvs['education_level'].isna().sum()}")
print(f"    - city: {cvs['city'].isna().sum()}")

print(f"  • Employment status distribution:")
for status, count in cvs['employment_status'].value_counts().head(5).items():
    print(f"    - {status}: {count} ({count/len(cvs)*100:.1f}%)")

print(f"  • Education level distribution:")
for level, count in cvs['education_level'].value_counts().items():
    print(f"    - {level}: {count} ({count/len(cvs)*100:.1f}%)")

print(f"  • Experience distribution:")
print(f"    - Mean: {cvs['total_years_experience'].mean():.1f} years")
print(f"    - Median: {cvs['total_years_experience'].median():.1f} years")
print(f"    - Max: {cvs['total_years_experience'].max():.0f} years")

# Corp Jobs Quality Checks
print("\nCorp Jobs Dataset:")
print(f"  • Null values in critical fields:")
print(f"    - required_skills: {corp_jobs['required_skills'].isna().sum()}")
print(f"    - collar_type: {corp_jobs['collar_type'].isna().sum()}")
print(f"    - category: {corp_jobs['category'].isna().sum()}")

print(f"  • Collar type distribution:")
for collar, count in corp_jobs['collar_type'].value_counts().items():
    print(f"    - {collar}: {count} ({count/len(corp_jobs)*100:.1f}%)")

print(f"  • Salary ranges:")
print(f"    - Min avg: ZMW {corp_jobs['salary_min_zmw'].mean():.0f}")
print(f"    - Max avg: ZMW {corp_jobs['salary_max_zmw'].mean():.0f}")

# Small Jobs Quality Checks
print("\nSmall Jobs Dataset:")
print(f"  • Null values in critical fields:")
print(f"    - category: {small_jobs['category'].isna().sum()}")
print(f"    - location: {small_jobs['location'].isna().sum()}")
print(f"    - budget: {small_jobs['budget'].isna().sum()}")

print(f"  • Category distribution:")
for category, count in small_jobs['category'].value_counts().head(5).items():
    print(f"    - {category}: {count} ({count/len(small_jobs)*100:.1f}%)")

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

for work_exp_str in cvs['work_experience_json'].dropna():
    try:
        work_exp = json.loads(work_exp_str) if isinstance(work_exp_str, str) else []
        
        if len(work_exp) > 0:
            # Most recent industry
            current_industries.append(work_exp[0].get('industry', 'Unknown'))
            
            # Track transitions
            for i in range(len(work_exp) - 1):
                from_industry = work_exp[i].get('industry', 'Unknown')
                to_industry = work_exp[i+1].get('industry', 'Unknown')
                transitions[(from_industry, to_industry)] += 1
    except:
        pass

# Calculate transition probabilities
industry_counts = Counter(current_industries)
transition_matrix = []

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

print(f"Top 10 industry transitions:")
for i, trans in enumerate(transition_matrix[:10], 1):
    print(f"  {i:2d}. {trans['from_industry']:20s} → {trans['to_industry']:20s}: "
          f"{trans['transitions']:3d} transitions ({trans['probability']:.1%})")

print(f"\n✓ Saved top 50 transitions to industry_transitions.json")

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
print(f"  • skills_taxonomy.json (500 skills)")
print(f"  • skill_co_occurrence.json (100 pairs)")
print(f"  • industry_transitions.json (50 transitions)")

print(f"\n🎯 Next Steps:")
print(f"  1. Review generated JSON files")
print(f"  2. Load data into PostgreSQL database")
print(f"  3. Begin implementing matching algorithms")
print(f"  4. Update MATCHING_SYSTEM_PROGRESS.md with completion status")

print("\n" + "=" * 80)
