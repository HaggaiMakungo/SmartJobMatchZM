"""
FINAL FIX: Reconstruct JSON from all columns including unnamed ones
"""
import csv
import json
from collections import Counter, defaultdict

print("=" * 80)
print("DATASET ANALYSIS - FINAL FIX (Reconstructing Split JSON)")
print("=" * 80)

# ============================================================================
# 1. LOAD CVS WITH FULL JSON RECONSTRUCTION
# ============================================================================
print("\n[1/6] Loading CVs with full JSON reconstruction...")

def load_cvs_with_reconstruction():
    """Load CVs and reconstruct split JSON columns"""
    cvs = []
    
    with open('CVs.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        # Find key column indices
        work_exp_idx = header.index('work_experience_json')
        projects_idx = header.index('projects_json')
        references_idx = header.index('references_json')
        
        print(f"  Found work_experience_json at column {work_exp_idx}")
        print(f"  Found projects_json at column {projects_idx}")
        print(f"  Found references_json at column {references_idx}")
        print(f"  Total columns in CSV: {len(header)}")
        
        # Determine where JSON splits
        # All columns after references_json until end are JSON fragments
        last_named_idx = references_idx
        unnamed_start = last_named_idx + 1
        unnamed_count = len(header) - unnamed_start
        
        print(f"  Unnamed columns containing JSON: {unnamed_count} (columns {unnamed_start}-{len(header)-1})")
        
        # Process each row
        for row_num, row in enumerate(reader, start=2):
            if len(row) < len(header):
                print(f"  Warning: Row {row_num} has {len(row)} columns, expected {len(header)}")
                continue
            
            # Build CV dict with named columns
            cv = {}
            for i, col_name in enumerate(header[:unnamed_start]):
                if col_name:  # Skip empty column names
                    cv[col_name] = row[i] if i < len(row) else ''
            
            # Reconstruct work_experience_json
            # Collect all values from work_exp_idx to end of row
            json_parts = []
            for i in range(work_exp_idx, len(row)):
                if row[i]:  # Only add non-empty parts
                    json_parts.append(row[i])
            
            reconstructed = ','.join(json_parts)
            cv['work_experience_json'] = reconstructed
            
            cvs.append(cv)
            
            # Show progress
            if row_num % 500 == 0:
                print(f"  Processed {row_num-1} CVs...")
    
    print(f"✓ Loaded {len(cvs)} CVs")
    
    # Test first few reconstructions
    valid_count = 0
    for i, cv in enumerate(cvs[:5]):
        work_exp_str = cv.get('work_experience_json', '')
        if work_exp_str:
            try:
                parsed = json.loads(work_exp_str)
                valid_count += 1
                if i == 0:
                    print(f"  Sample: {len(parsed)} work experiences")
                    if len(parsed) > 0:
                        print(f"    Keys: {list(parsed[0].keys())}")
                        if 'industry' in parsed[0]:
                            print(f"    ✓ Has 'industry' field: {parsed[0]['industry']}")
            except Exception as e:
                if i < 3:
                    print(f"  CV {i+1} parse error: {str(e)[:80]}")
    
    print(f"  Valid JSON in first 5: {valid_count}/5")
    
    return cvs

cvs = load_cvs_with_reconstruction()

# ============================================================================
# 2. LOAD OTHER DATASETS
# ============================================================================
print("\n[2/6] Loading other datasets...")

with open('Corp_jobs.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    corp_jobs = list(reader)
    print(f"✓ Loaded {len(corp_jobs)} corp jobs")

with open('Small_jobs.csv', 'r', encoding='utf-8') as f:
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
print(f"Total unique skills: {len(skill_freq)}")

# Save skills taxonomy
top_500_skills = skill_freq.most_common(500)
skills_taxonomy_data = [
    {"skill": skill, "frequency": count, "percentage": round(count/len(cvs)*100, 2)}
    for skill, count in top_500_skills
]

with open('skills_taxonomy.json', 'w') as f:
    json.dump(skills_taxonomy_data, f, indent=2)
print(f"✓ Saved {len(skills_taxonomy_data)} skills to skills_taxonomy.json")

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
        
        for skill in skills:
            skill_counts[skill] += 1
        
        for i, skill_a in enumerate(skills):
            for skill_b in skills[i+1:]:
                pair = tuple(sorted([skill_a, skill_b]))
                co_occurrence[pair] += 1

co_occurrence_matrix = []
for (skill_a, skill_b), co_count in sorted(co_occurrence.items(), key=lambda x: x[1], reverse=True)[:100]:
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
print(f"✓ Saved {len(co_occurrence_matrix)} pairs to skill_co_occurrence.json")

# ============================================================================
# 5. DERIVE INDUSTRY TRANSITION MATRIX
# ============================================================================
print("\n[5/6] Deriving industry transition matrix...")

transitions = defaultdict(int)
current_industries = []
stats = {
    'total': len(cvs),
    'has_work_exp': 0,
    'has_industry': 0,
    'parse_errors': 0
}

for cv in cvs:
    work_exp_str = cv.get('work_experience_json', '')
    
    if not work_exp_str or not work_exp_str.strip():
        continue
    
    try:
        work_exp = json.loads(work_exp_str)
        
        if len(work_exp) > 0:
            stats['has_work_exp'] += 1
            
            # Check for industry field
            has_industry = any('industry' in exp and exp['industry'] for exp in work_exp)
            
            if has_industry:
                stats['has_industry'] += 1
                
                # Most recent industry
                if 'industry' in work_exp[0] and work_exp[0]['industry']:
                    current_industries.append(work_exp[0]['industry'])
                
                # Track transitions
                for i in range(len(work_exp) - 1):
                    from_industry = work_exp[i].get('industry', '')
                    to_industry = work_exp[i+1].get('industry', '')
                    if from_industry and to_industry:
                        transitions[(from_industry, to_industry)] += 1
    except json.JSONDecodeError:
        stats['parse_errors'] += 1
    except Exception:
        stats['parse_errors'] += 1

print(f"\nStatistics:")
print(f"  Total CVs: {stats['total']}")
print(f"  CVs with work experience: {stats['has_work_exp']}")
print(f"  CVs with industry field: {stats['has_industry']}")
print(f"  Parse errors: {stats['parse_errors']}")
print(f"  Unique industries: {len(set(current_industries))}")
print(f"  Total transitions: {len(transitions)}")

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

    print(f"\nTop 10 industry transitions:")
    for i, trans in enumerate(transition_matrix[:10], 1):
        print(f"  {i:2d}. {trans['from_industry']:25s} → {trans['to_industry']:25s}: "
              f"{trans['transitions']:3d} ({trans['probability']:.1%})")
    
    with open('industry_transitions.json', 'w') as f:
        json.dump(transition_matrix, f, indent=2)
    print(f"\n✓ Saved {len(transition_matrix)} transitions to industry_transitions.json")
else:
    print(f"\n⚠️  No transitions found - creating empty file")
    with open('industry_transitions.json', 'w') as f:
        json.dump([], f)

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)

print(f"\n✓ Generated files:")
print(f"  • skills_taxonomy.json: {len(skills_taxonomy_data)} skills")
print(f"  • skill_co_occurrence.json: {len(co_occurrence_matrix)} pairs")
print(f"  • industry_transitions.json: {len(transition_matrix)} transitions")

if len(transition_matrix) > 0:
    print(f"\n✅ SUCCESS! Ready to seed database.")
    print(f"\nNext step: python seed_matching_tables.py")
else:
    print(f"\n⚠️  No industry data found.")
    print(f"   Use test_seed_manual.sql for sample transitions")

print("\n" + "=" * 80)
