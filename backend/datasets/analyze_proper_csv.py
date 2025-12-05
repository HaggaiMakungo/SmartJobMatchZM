"""
PROPER FIX: Handle CSV with quoted fields containing commas
The issue is that work_experience_json contains commas but may not be properly quoted
"""
import csv
import json
from collections import Counter, defaultdict

print("=" * 80)
print("DATASET ANALYSIS - PROPER CSV HANDLING")
print("=" * 80)

# ============================================================================
# 1. INVESTIGATE CSV STRUCTURE
# ============================================================================
print("\n[Investigation] Checking CSV quoting...")

with open('CVs.csv', 'r', encoding='utf-8-sig') as f:  # utf-8-sig to handle BOM
    # Read first line raw
    first_line = f.readline()
    print(f"First line length: {len(first_line)}")
    print(f"First 200 chars: {first_line[:200]}")
    
    # Check delimiter
    f.seek(0)
    sample = f.read(50000)
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=',\t')
        print(f"\nDetected CSV dialect:")
        print(f"  Delimiter: {repr(dialect.delimiter)}")
        print(f"  Quote char: {repr(dialect.quotechar)}")
        print(f"  Double quote: {dialect.doublequote}")
    except:
        print("Could not detect dialect")

# ============================================================================
# 2. TRY DIFFERENT READING METHODS
# ============================================================================
print("\n[1/6] Loading CVs with proper quoting...")

def load_cvs_proper():
    """Load CVs with proper CSV quoting handling"""
    cvs = []
    
    # Try with QUOTE_ALL to handle quoted fields
    with open('CVs.csv', 'r', encoding='utf-8-sig', newline='') as f:
        # Use DictReader with proper quoting
        reader = csv.DictReader(f, quoting=csv.QUOTE_MINIMAL)
        
        # Get fieldnames
        print(f"  Fieldnames detected: {len(reader.fieldnames)}")
        print(f"  Fields: {reader.fieldnames}")
        
        for i, row in enumerate(reader):
            # Clean the row keys (remove BOM if present)
            clean_row = {}
            for key, value in row.items():
                clean_key = key.strip().replace('\ufeff', '')
                clean_row[clean_key] = value
            
            cvs.append(clean_row)
            
            if i == 0:
                # Check first work_experience_json
                work_exp = clean_row.get('work_experience_json', '')
                print(f"\n  First work_experience_json:")
                print(f"    Length: {len(work_exp)}")
                print(f"    First 200 chars: {work_exp[:200]}")
                print(f"    Last 100 chars: ...{work_exp[-100:]}")
                
                # Try to parse
                try:
                    parsed = json.loads(work_exp)
                    print(f"    ✓ Valid JSON: {len(parsed)} entries")
                    if len(parsed) > 0:
                        print(f"    Keys: {list(parsed[0].keys())}")
                        if 'industry' in parsed[0]:
                            print(f"    ✓ Has industry: {parsed[0]['industry']}")
                except Exception as e:
                    print(f"    ✗ Parse error: {e}")
            
            if (i + 1) % 500 == 0:
                print(f"  Processed {i + 1} CVs...")
    
    print(f"✓ Loaded {len(cvs)} CVs")
    return cvs

cvs = load_cvs_proper()

# Quick validation
print("\nValidating first 10 CVs:")
valid = 0
has_industry = 0
for i, cv in enumerate(cvs[:10]):
    work_exp_str = cv.get('work_experience_json', '')
    if work_exp_str and work_exp_str.strip():
        try:
            parsed = json.loads(work_exp_str)
            valid += 1
            if len(parsed) > 0 and 'industry' in parsed[0]:
                has_industry += 1
        except:
            pass

print(f"  Valid JSON: {valid}/10")
print(f"  Has industry field: {has_industry}/10")

# ============================================================================
# 3. LOAD OTHER DATASETS
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
# 4. EXTRACT SKILLS TAXONOMY
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

top_500_skills = skill_freq.most_common(500)
skills_taxonomy_data = [
    {"skill": skill, "frequency": count, "percentage": round(count/len(cvs)*100, 2)}
    for skill, count in top_500_skills
]

with open('skills_taxonomy.json', 'w', encoding='utf-8') as f:
    json.dump(skills_taxonomy_data, f, indent=2)
print(f"✓ Saved {len(skills_taxonomy_data)} skills")

# ============================================================================
# 5. BUILD SKILL CO-OCCURRENCE MATRIX
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

with open('skill_co_occurrence.json', 'w', encoding='utf-8') as f:
    json.dump(co_occurrence_matrix, f, indent=2)
print(f"✓ Saved {len(co_occurrence_matrix)} pairs")

# ============================================================================
# 6. DERIVE INDUSTRY TRANSITION MATRIX
# ============================================================================
print("\n[5/6] Deriving industry transition matrix...")

transitions = defaultdict(int)
current_industries = []
stats = {
    'total': len(cvs),
    'has_work_exp': 0,
    'has_industry': 0,
    'parse_errors': 0,
    'empty': 0
}

for cv in cvs:
    work_exp_str = cv.get('work_experience_json', '')
    
    if not work_exp_str or not work_exp_str.strip():
        stats['empty'] += 1
        continue
    
    try:
        work_exp = json.loads(work_exp_str)
        
        if work_exp and len(work_exp) > 0:
            stats['has_work_exp'] += 1
            
            # Check for industry
            has_industry = any('industry' in exp and exp.get('industry') for exp in work_exp)
            
            if has_industry:
                stats['has_industry'] += 1
                
                # Most recent industry
                if 'industry' in work_exp[0] and work_exp[0].get('industry'):
                    current_industries.append(work_exp[0]['industry'])
                
                # Track transitions (chronological order)
                for i in range(len(work_exp) - 1):
                    from_ind = work_exp[i].get('industry', '')
                    to_ind = work_exp[i+1].get('industry', '')
                    if from_ind and to_ind and from_ind != to_ind:
                        transitions[(from_ind, to_ind)] += 1
    
    except json.JSONDecodeError as e:
        stats['parse_errors'] += 1
    except Exception as e:
        stats['parse_errors'] += 1

print(f"\nExtraction statistics:")
print(f"  Total CVs: {stats['total']}")
print(f"  Empty work_experience: {stats['empty']}")
print(f"  Has work experience: {stats['has_work_exp']}")
print(f"  Has industry field: {stats['has_industry']}")
print(f"  Parse errors: {stats['parse_errors']}")
print(f"  Unique industries: {len(set(current_industries))}")
print(f"  Total transitions: {sum(transitions.values())}")
print(f"  Unique transitions: {len(transitions)}")

# Calculate transition probabilities
industry_counts = Counter(current_industries)
transition_matrix = []

if len(transitions) > 0:
    print(f"\nTop 10 industries by frequency:")
    for ind, count in industry_counts.most_common(10):
        print(f"  {ind:30s}: {count:4d} CVs")
    
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
    
    with open('industry_transitions.json', 'w', encoding='utf-8') as f:
        json.dump(transition_matrix, f, indent=2)
    print(f"\n✓ Saved {len(transition_matrix)} transitions")
else:
    print(f"\n⚠️  No transitions found")
    with open('industry_transitions.json', 'w', encoding='utf-8') as f:
        json.dump([], f)

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)

print(f"\n✓ Files generated:")
print(f"  • skills_taxonomy.json: {len(skills_taxonomy_data)} skills")
print(f"  • skill_co_occurrence.json: {len(co_occurrence_matrix)} pairs")
print(f"  • industry_transitions.json: {len(transition_matrix)} transitions")

if len(transition_matrix) > 0:
    print(f"\n✅ SUCCESS! Industry data extracted.")
    print(f"\n📋 Next step:")
    print(f"   python seed_matching_tables.py")
else:
    print(f"\n⚠️  No industry transitions found.")
    print(f"\n📋 Options:")
    print(f"   1. Check if work_experience_json actually has 'industry' field")
    print(f"   2. Use manual sample data: psql -f test_seed_manual.sql")
    print(f"   3. Regenerate CVs with industry field included")

print("\n" + "=" * 80)
