# NEXT STEPS: Week 1 Days 3-4 - CAMSS 2.0 Implementation

**Start Date:** November 13, 2025  
**Objective:** Implement dual-track matching algorithms with CAMSS 2.0 scoring

---

## 📋 Context for Next Chat Session

### Current System State

✅ **Phase 1 Complete (Week 1 Days 1-2)**
- Database schema created with 8 tables
- Metadata seeded:
  - 500 skills with frequencies
  - 100 skill similarity pairs
  - 18 category transition patterns
  - 5 collar-type weight configurations
- Ready for algorithm implementation

### Data Available

**CVs:** 2,500 candidates in `backend/datasets/CVs.csv`
- Fields: cv_id, skills_technical, education_level, total_years_experience, city, etc.
- Note: work_experience_json is incomplete (only has titles)

**Corp Jobs:** 500 jobs in `backend/datasets/Corp_jobs.csv`
- Fields: job_id, required_skills, required_education, category, location, salary, etc.
- 6-component CAMSS scoring required

**Small Jobs:** 400 gigs in `backend/datasets/Small_jobs.csv`
- Fields: id, title, category, location, budget, duration, etc.
- 3-component simplified scoring required

**Database:** PostgreSQL with `matching_metadata` schema
- Connection: localhost, database: `job_matching`, user: `postgres`

---

## 🎯 Phase 2 Goals (Week 1 Days 3-4)

### Day 3: Corp Job Matching Engine

**Implement 6-Component CAMSS 2.0 Scoring:**

1. **Qualification Match (16.67%)**
   - Compare CV education_level vs required_education
   - Scoring: exact match = 1.0, one level below = 0.7, two levels below = 0.4

2. **Experience Match (16.67%)**
   - Compare total_years_experience vs required_experience_years
   - Scoring: meets requirement = 1.0, 80% = 0.8, 60% = 0.5, below 60% = 0.2

3. **Skills Match (16.67%)**
   - Required skills: Must-have match
   - Preferred skills: Bonus points
   - Use `matching_metadata.get_skill_similarity()` for fuzzy matching
   - Scoring: (required_matched / required_total) * 0.7 + (preferred_matched / preferred_total) * 0.3

4. **Location Match (16.67%)**
   - Compare CV city vs job location_city
   - Scoring: same city = 1.0, same province = 0.6, different province = 0.3

5. **Category Compatibility (16.67%)**
   - Use `matching_metadata.category_compatibility` table
   - Get transition probability from CV's current category to job category
   - Scoring: use compatibility_score from table

6. **Personalization (16.67%)**
   - Salary fit: CV salary_expectation vs job salary range
   - Job type preference: CV preferred_job_type vs job employment_type
   - Scoring: both match = 1.0, one matches = 0.5, neither = 0.2

**Final Score:** Weighted sum of all 6 components (should equal ~1.0)

### Day 4: Small Job Matching Engine

**Implement 3-Component Simplified Scoring:**

1. **Skills Match (40%)**
   - Extract required skills from job description
   - Match against CV skills_technical
   - Use skill similarity for fuzzy matching

2. **Location Match (30%)**
   - Same location = 1.0, same province = 0.6, different = 0.3

3. **Availability (30%)**
   - CV availability vs job duration
   - Scoring: available = 1.0, partially available = 0.5, unavailable = 0.3

**Final Score:** Weighted sum (skills * 0.4 + location * 0.3 + availability * 0.3)

---

## 🛠️ Implementation Steps

### Step 1: Create Service Structure

Create `backend/app/services/matching_service.py`:

```python
from typing import List, Dict, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import json

class MatchingService:
    def __init__(self):
        self.conn = psycopg2.connect(
            host="localhost",
            database="job_matching",
            user="postgres",
            password="Winter123"
        )
    
    def get_corp_matches(
        self, 
        cv_id: str, 
        limit: int = 20,
        min_score: float = 0.3
    ) -> List[Dict]:
        """
        Get top corp job matches for a CV
        Returns list of jobs with scores and explanations
        """
        pass  # Implement
    
    def get_small_job_matches(
        self, 
        cv_id: str, 
        limit: int = 20,
        min_score: float = 0.2
    ) -> List[Dict]:
        """
        Get top small job matches for a CV
        Returns list of gigs with scores
        """
        pass  # Implement
```

### Step 2: Implement Scoring Functions

Create helper functions for each component:

```python
def calculate_qualification_score(
    cv_education: str, 
    required_education: str
) -> float:
    """Calculate qualification match score"""
    pass

def calculate_experience_score(
    cv_years: int, 
    required_years: int
) -> float:
    """Calculate experience match score"""
    pass

def calculate_skills_score(
    cv_skills: List[str],
    required_skills: List[str],
    preferred_skills: List[str],
    cursor
) -> Dict[str, any]:
    """
    Calculate skills match with similarity
    Returns: {score, matched_required, matched_preferred}
    """
    pass

def calculate_location_score(
    cv_city: str,
    cv_province: str,
    job_city: str,
    job_province: str
) -> float:
    """Calculate location match score"""
    pass

def calculate_category_score(
    cv_category: str,
    job_category: str,
    cursor
) -> float:
    """Get category compatibility from database"""
    pass

def calculate_personalization_score(
    cv: Dict,
    job: Dict
) -> float:
    """Calculate personalization fit"""
    pass
```

### Step 3: Load and Process Data

```python
def load_cv(cv_id: str) -> Dict:
    """Load CV from CSV or database"""
    import pandas as pd
    cvs = pd.read_csv('backend/datasets/CVs.csv')
    cv = cvs[cvs['cv_id'] == cv_id].iloc[0].to_dict()
    return cv

def load_all_corp_jobs() -> List[Dict]:
    """Load all corp jobs"""
    import pandas as pd
    jobs = pd.read_csv('backend/datasets/Corp_jobs.csv')
    return jobs.to_dict('records')
```

### Step 4: Implement Matching Logic

```python
def get_corp_matches(self, cv_id: str, limit: int = 20, min_score: float = 0.3):
    # 1. Load CV
    cv = load_cv(cv_id)
    
    # 2. Load all corp jobs
    jobs = load_all_corp_jobs()
    
    # 3. Score each job
    scored_jobs = []
    for job in jobs:
        # Calculate 6 components
        qual_score = calculate_qualification_score(
            cv['education_level'], 
            job['required_education']
        )
        
        exp_score = calculate_experience_score(
            cv['total_years_experience'],
            job['required_experience_years']
        )
        
        # ... calculate other components
        
        # Weighted sum
        final_score = (
            qual_score * 0.1667 +
            exp_score * 0.1667 +
            skills_score['score'] * 0.1667 +
            location_score * 0.1667 +
            category_score * 0.1667 +
            personalization_score * 0.1667
        )
        
        if final_score >= min_score:
            scored_jobs.append({
                'job_id': job['job_id'],
                'title': job['title'],
                'company': job['company'],
                'final_score': final_score,
                'component_scores': {
                    'qualification': qual_score,
                    'experience': exp_score,
                    'skills': skills_score['score'],
                    'location': location_score,
                    'category': category_score,
                    'personalization': personalization_score
                },
                'explanation': generate_explanation(...)
            })
    
    # 4. Sort and return top matches
    scored_jobs.sort(key=lambda x: x['final_score'], reverse=True)
    return scored_jobs[:limit]
```

### Step 5: Create Test Script

Create `backend/test_matching.py`:

```python
from app.services.matching_service import MatchingService

# Test corp matching
service = MatchingService()

# Test with first CV
matches = service.get_corp_matches('CV_001', limit=10)

print(f"Top 10 matches for CV_001:")
for i, match in enumerate(matches, 1):
    print(f"\n{i}. {match['title']} at {match['company']}")
    print(f"   Score: {match['final_score']:.2%}")
    print(f"   Components:")
    for comp, score in match['component_scores'].items():
        print(f"     - {comp}: {score:.2%}")
    print(f"   Explanation: {match['explanation']}")
```

---

## 🧪 Testing Criteria

### Corp Job Matching Tests

**Test 1: High-Quality Match**
- CV: Software Engineer, 5 years, Python/Django
- Expected: High scores for tech jobs requiring similar skills
- Min score: 0.7+

**Test 2: Career Transition**
- CV: Agriculture Engineer transitioning to Agribusiness
- Expected: Category compatibility bonus for related industries
- Min score: 0.5+

**Test 3: Entry Level**
- CV: Fresh Graduate, 0 years experience
- Expected: Match junior positions, lower scores for senior roles
- Min score: 0.4+

### Small Job Matching Tests

**Test 1: Location Match**
- CV: Lusaka-based candidate
- Expected: Lusaka gigs score higher than Kitwe
- Location weight: 30%

**Test 2: Skills Match**
- CV: Plumber with pipe installation skills
- Expected: High scores for plumbing gigs
- Skills weight: 40%

---

## 📊 Success Metrics

### Phase 2 Complete When:

- [ ] Corp matching returns results for any CV
- [ ] Small job matching returns results for any CV
- [ ] Scores are between 0.0 and 1.0
- [ ] Component scores sum to approximately 1.0
- [ ] Test cases pass with reasonable scores
- [ ] Match explanations are generated
- [ ] Top 10 matches make intuitive sense

### Quality Targets:

- Average match score > 0.4 for top 10 results
- At least 5 matches per CV with score > 0.3
- Skills matching uses similarity (not just exact)
- Category compatibility uses database transitions
- No errors or crashes

---

## 🔍 Database Helper Functions

You'll use these existing functions:

```sql
-- Get similar skills
SELECT * FROM matching_metadata.get_skill_similarity('Python');

-- Get category compatibility
SELECT compatibility_score 
FROM matching_metadata.category_compatibility 
WHERE from_category = 'Technology' 
  AND to_category = 'Finance';

-- Get collar weights (if needed)
SELECT * FROM matching_metadata.collar_weights_config 
WHERE collar_type = 'white_collar';
```

---

## 🚨 Common Pitfalls

1. **Don't hard-code weights** - Use collar_weights_config table
2. **Handle missing data** - CVs/jobs may have null fields
3. **Normalize strings** - "Software Engineer" vs "software engineer"
4. **Skills parsing** - Split comma-separated skill lists properly
5. **Category mapping** - CV current_job_title → category mapping needed

---

## 📁 File Structure

After Phase 2, you should have:

```
backend/
├── app/
│   ├── services/
│   │   ├── __init__.py
│   │   ├── matching_service.py      ← Main implementation
│   │   ├── scoring_utils.py         ← Helper functions
│   │   └── data_loader.py           ← CSV loading utilities
│   └── ...
├── datasets/
│   ├── CVs.csv
│   ├── Corp_jobs.csv
│   ├── Small_jobs.csv
│   └── ...
├── test_matching.py                  ← Test script
└── requirements.txt
```

---

## 💬 How to Start Next Chat

**Copy this prompt:**

```
I'm continuing the CAMSS 2.0 job matching system implementation.

Current Status:
✅ Phase 1 Complete (Database schema + data seeding)
- 500 skills in taxonomy
- 100 skill similarity pairs
- 18 category transitions
- All tables ready

Next Phase: Week 1 Days 3-4 - Implement Matching Algorithms

Tasks:
1. Create MatchingService class with corp and small job matching
2. Implement 6-component CAMSS scoring for corp jobs
3. Implement 3-component scoring for small jobs
4. Test with sample CVs

Files:
- CVs: backend/datasets/CVs.csv (2,500 candidates)
- Corp Jobs: backend/datasets/Corp_jobs.csv (500 jobs)
- Small Jobs: backend/datasets/Small_jobs.csv (400 gigs)
- Database: job_matching on localhost

Reference: backend/datasets/NEXT_STEPS_PHASE2.md

Let's start by creating the MatchingService class structure.
```

---

## 🎯 Expected Timeline

- **Hour 1:** Create service structure and helper functions
- **Hour 2:** Implement corp job scoring logic
- **Hour 3:** Implement small job scoring logic
- **Hour 4:** Testing and refinement

**Total:** 4-6 hours for Phase 2

---

## 📚 Key References

- **Master Plan:** `backend/MATCHING_SYSTEM_MASTER_PLAN.md`
- **Progress Tracker:** `backend/MATCHING_SYSTEM_PROGRESS.md`
- **Phase 1 Summary:** `backend/datasets/PHASE1_COMPLETE.md`
- **Database Schema:** `backend/migrations/001_create_matching_tables.sql`

---

## ✅ Pre-Flight Checklist

Before starting Phase 2, verify:

- [ ] Database is running and accessible
- [ ] All 3 CSV files are present in backend/datasets/
- [ ] matching_metadata schema has data:
  - [ ] skills_taxonomy: 500 rows
  - [ ] skill_similarity: 100 rows
  - [ ] category_compatibility: 18 rows
- [ ] Python environment is set up
- [ ] Required packages: pandas, psycopg2, python-dotenv

**Run this to verify:**
```bash
cd C:\Dev\ai-job-matchingV2\backend
python -c "
import psycopg2
conn = psycopg2.connect('host=localhost dbname=job_matching user=postgres password=Winter123')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM matching_metadata.skills_taxonomy')
print(f'Skills: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(*) FROM matching_metadata.category_compatibility')
print(f'Transitions: {cur.fetchone()[0]}')
print('✓ Database ready!')
"
```

---

**Ready to implement!** 🚀

Good luck with Phase 2!
