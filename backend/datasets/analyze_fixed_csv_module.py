"""
Fixed Dataset Analysis - Handles JSON properly with csv module
"""

import json
from collections import Counter, defaultdict
import csv

# File paths
CVS_PATH = "CVs.csv"
CORP_JOBS_PATH = "Corp_jobs.csv"
SMALL_JOBS_PATH = "Small_jobs.csv"

print("=" * 80)
print("DATASET ANALYSIS - FIXED (CSV Module)")
print("=" * 80)

# ============================================================================
# 1. LOAD CVS WITH PROPER CSV MODULE
# ============================================================================
print("\n[1/6] Loading CVs with csv module...")

def load_cvs_properly():
    """Load CVs using csv module to handle JSON properly"""
    with open(CVS_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        cvs = list(reader)
    
    print(f"✓ Loaded {len(cvs)} CVs")
    print(f"  Columns: {len(cvs[0].keys())}")
    
    # Check work_experience_json
    if 'work_experience_json' in cvs[0]:
        print(f"  ✓ work_experience_json column found")
        
        # Check first few
        valid_count = 0
        for i, cv in enumerate(cvs[:5]):
            val = cv.get('work_experience_json', '')
            if val and val.strip():
                try:
                    parsed = json.loads(val)
                    valid_count += 1
                    if i == 0:
                        print(f"  Sample: {len(parsed)} work experiences")
                        if len(parsed) > 0:
                            print(f"    Keys: {list(parsed[0].keys())}")
                except:
                    pass
        
        print(f"  Valid JSON in first 5: {valid_count}/5")
    
    return cvs

cvs = load_cvs_properly()

# ============================================================================
# 2. LOAD OTHER DATASETS
# ============================================================================
print("\n[2/6] Loading other datasets...")

with open(CORP_JOBS_PATH, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    corp_jobs = list(reader)
    print(f"✓ Loaded {len(corp_jobs)} corp jobs")

with open(SMALL_JOBS_PATH, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    small_jobs = list(reader)
    print(f"✓ Loaded {len(small_jobs)} small jobs")

# ============================================================================
# 3. EXTRACT SKILLS TAXONOMY
# ============================================================================
print("\n[3/6] Extracting skills taxonomy...")

all_skills = []
for cv in cvs:
    skills_str = cv.get('skills_technical', '')
    if skills_str:
        skills = [s.strip() for s in skills_str.split(',')]
        all_skills.extend(skills)

skill_freq = Counter(all_skills)
print(f"\nTotal unique skills: {len(skill_freq)}")
print(f"Top 10 technical skills:")
for i, (skill, count) in enumerate(skill_freq.most_common(10), 1):
    print(f"  {i:2d}. {skill:30s} ({count:4d} occurrences)")

# Save skills taxonomy
top_500_skills = skill_freq.most_common(500)
skills_taxonomy_data = [
    {"skill": skill, "frequency": count, "percentage": count/len(cvs)*100}
    for skill, count in top_500_skills
]

with open('skills_taxonomy.json', 'w') as f:
    json.dump(skills_taxonomy_data, f, indent=2)
print(f"\n✓ Saved {len(skills_taxonomy_data)} skills to skills_taxonomy.json")

# ============================================================================
# 4. BUILD SKILL CO-OCCURRENCE MATRIX
# ============================================================================
print("\n[4/6] Building skill co-occurrence matrix...")

co_occurrence = defaultdict(int)
skill_counts = defaultdict(int)

for cv in cvs:
    skills_str = cv.get('skills_technical', '')
    if skills_str:
        skills = [s.strip() for s in skills_str.split(',')]
        
        # Count individual skills
        for skill in skills:
            skill_counts[skill] += 1
        
        # Count co-occurrences
        for i, skill_a in enumerate(skills):
            for skill_b in skills[i+1:]:
                pair = tuple(sorted([skill_a, skill_b]))
                co_occurrence[pair] += 1

# Calculate Jaccard similarity
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

print(f"Top 5 skill pairs:")
for i, pair in enumerate(co_occurrence_matrix[:5], 1):
    print(f"  {i}. {pair['skill_a']} + {pair['skill_b']}: "
          f"{pair['co_occurrences']} times (similarity: {pair['jaccard_similarity']:.2f})")

print(f"\n✓ Saved {len(co_occurrence_matrix)} pairs to skill_co_occurrence.json")

# ============================================================================
# 5. DERIVE INDUSTRY TRANSITION MATRIX
# ============================================================================
print("\n[5/6] Deriving industry transition matrix...")

transitions = defaultdict(int)
current_industries = []
total_cvs_checked = 0
cvs_with_work_exp = 0
cvs_with_industry = 0
parse_errors = 0

for cv in cvs:
    total_cvs_checked += 1
    work_exp_str = cv.get('work_experience_json', '')
    
    if not work_exp_str or not work_exp_str.strip():
        continue
    
    try:
        work_exp = json.loads(work_exp_str)
        
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
                    from_industry = work_exp[i].get('industry', '')
                    to_industry = work_exp[i+1].get('industry', '')
                    if from_industry and to_industry:
                        transitions[(from_industry, to_industry)] += 1
    except json.JSONDecodeError as e:
        parse_errors += 1
        if parse_errors <= 3:  # Show first 3 errors
            print(f"  Parse error in CV: {str(e)[:100]}")
    except Exception as e:
        if parse_errors <= 3:
            print(f"  Error: {str(e)[:100]}")

print(f"\nIndustry extraction statistics:")
print(f"  • Total CVs checked: {total_cvs_checked}")
print(f"  • CVs with work experience: {cvs_with_work_exp}")
print(f"  • CVs with industry field: {cvs_with_industry}")
print(f"  • Parse errors: {parse_errors}")
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
        print(f"  {i:2d}. {trans['from_industry']:25s} → {trans['to_industry']:25s}: "
              f"{trans['transitions']:3d} ({trans['probability']:.1%})")

    print(f"\n✓ Saved {len(transition_matrix)} transitions to industry_transitions.json")
else:
    print(f"\n⚠️  NO INDUSTRY TRANSITIONS FOUND!")
    print(f"   Reasons:")
    print(f"   - Work experience exists but no 'industry' field, OR")
    print(f"   - JSON parsing failed for all CVs")
    print(f"   Creating empty industry_transitions.json")
    
    with open('industry_transitions.json', 'w') as f:
        json.dump([], f)

# ============================================================================
# 6. SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSIS COMPLETE - SUMMARY")
print("=" * 80)

print(f"\n✓ Datasets loaded:")
print(f"  • {len(cvs):,} CVs")
print(f"  • {len(corp_jobs):,} Corp Jobs")
print(f"  • {len(small_jobs):,} Small Jobs")

print(f"\n✓ Matching intelligence extracted:")
print(f"  • skills_taxonomy.json ({len(skills_taxonomy_data)} skills)")
print(f"  • skill_co_occurrence.json ({len(co_occurrence_matrix)} pairs)")
print(f"  • industry_transitions.json ({len(transition_matrix)} transitions)")

if len(transition_matrix) == 0:
    print(f"\n⚠️  WARNING: No industry transitions found!")
    print(f"   Next steps:")
    print(f"   1. Check if work_experience_json has 'industry' field")
    print(f"   2. Use test_seed_manual.sql for sample data")
    print(f"   3. Or regenerate CVs with industry field")

print(f"\n🎯 Next Steps:")
print(f"  1. Review generated JSON files")
print(f"  2. Run: python seed_matching_tables.py")
print(f"  3. Verify database tables populated")

print("\n" + "=" * 80)
