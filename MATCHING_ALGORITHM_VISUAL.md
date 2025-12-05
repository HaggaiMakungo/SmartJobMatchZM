# 🎨 CAMSS 2.0 Matching Algorithm - Visual Flow Diagrams

## 🐌 CURRENT SYSTEM (How It Works Now)

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECRUITER CLICKS "FIND CANDIDATES"           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  GET /api/recruiter/job/{job_id}/candidates                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Fetch job details from DB                            │   │
│  │ 2. Fetch ALL 2,500 CVs from DB                          │   │
│  │ 3. Loop through EVERY CV:                               │   │
│  │    ┌─────────────────────────────────────────────────┐  │   │
│  │    │ For CV #1:                                      │  │   │
│  │    │   → Run match_candidate(cv_id)                 │  │   │
│  │    │   → This matches CV against ALL 1,600 jobs!    │  │   │
│  │    │   → Find our job_id in results                 │  │   │
│  │    │   → Extract match score                         │  │   │
│  │    └─────────────────────────────────────────────────┘  │   │
│  │    ┌─────────────────────────────────────────────────┐  │   │
│  │    │ For CV #2:                                      │  │   │
│  │    │   → Run match_candidate(cv_id) again           │  │   │
│  │    │   → Matches against ALL 1,600 jobs again!      │  │   │
│  │    │   → Find our job_id                             │  │   │
│  │    └─────────────────────────────────────────────────┘  │   │
│  │    ... repeat 2,500 times! ...                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ⏰ 30-60 SECONDS LATER
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN TOP 20 CANDIDATES                      │
└─────────────────────────────────────────────────────────────────┘
```

### **THE PROBLEM:**
```
2,500 CVs × 1,600 jobs = 4,000,000 comparisons!
Each comparison takes ~500ms
Total time: 2,000,000 seconds = 23 DAYS! 😱
(Caching reduces this to 30-60s, but still terrible)
```

---

## 🔄 WHAT HAPPENS IN EACH MATCH

```
┌─────────────────────────────────────────────────────────────────┐
│            match_candidate(cv_id, job_type="corporate")         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Keyword Extraction + Skill Normalization (100ms)     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Extract CV skills: ["Python", "Py", "python dev"]      │   │
│  │ Normalize: ["Python"]                                   │   │
│  │ Group into clusters: {"Programming": ["Python"]}        │   │
│  │ Extract job title keywords                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: Category Confidence + Irrelevance Penalty (50ms)     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Calculate CV category:                                   │   │
│  │   {"IT": 0.85, "Healthcare": 0.10}                      │   │
│  │ Calculate Job category:                                  │   │
│  │   {"IT": 0.90, "Healthcare": 0.05}                      │   │
│  │ Check if categories match                                │   │
│  │ Apply penalty if mismatch (0.5x to 1.0x)                │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: Skill Rarity Weighting + Semantic Matching (200ms)   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Load sentence-transformers model (420MB)                │   │
│  │ For each CV skill:                                       │   │
│  │   → Encode to 768-dim vector (50ms each)                │   │
│  │   → Compare with job skills (cosine similarity)         │   │
│  │   → Threshold: >0.75 = match                            │   │
│  │ Calculate TF-IDF weights:                                │   │
│  │   Common skills (Python) = low weight (0.3)             │   │
│  │   Rare skills (Blockchain) = high weight (0.9)          │   │
│  │ Compute weighted score                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  FINAL SCORE CALCULATION                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ raw_score = (                                            │   │
│  │     skills_score * 0.80 +        # 80%                   │   │
│  │     experience_score * 0.10 +    # 10%                   │   │
│  │     location_score * 0.05 +      # 5%                    │   │
│  │     education_score * 0.05       # 5%                    │   │
│  │ )                                                         │   │
│  │ final_score = raw_score * category_penalty               │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                   Total: ~350ms per CV
```

---

## 🚀 PROPOSED SYSTEM (How It Should Work)

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPANY POSTS JOB (POST /api/jobs)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Create job in database with company_id (foreign key!)       │
│  2. Trigger background task: compute_matches_for_job()          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKGROUND TASK (Runs async, no user waiting)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Fetch ALL CVs once                                    │   │
│  │ 2. Run unified matching (NOT 3 phases!)                  │   │
│  │ 3. For each CV (2,500):                                  │   │
│  │    → Calculate match score (10ms each)                   │   │
│  │    → Total: 25 seconds                                   │   │
│  │ 4. Store top 100 matches in cache table                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         job_candidate_matches TABLE (Cache)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ job_id   | cv_id    | match_score | computed_at         │   │
│  │──────────┼──────────┼─────────────┼─────────────────────│   │
│  │ JOB_001  | CV_1234  | 0.92        | 2025-12-05 10:30    │   │
│  │ JOB_001  | CV_5678  | 0.88        | 2025-12-05 10:30    │   │
│  │ JOB_001  | CV_9012  | 0.85        | 2025-12-05 10:30    │   │
│  │ ...      | ...      | ...         | ...                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ✅ MATCHES READY!
                           │
              (Hours/Days later...)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              RECRUITER CLICKS "FIND CANDIDATES"                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  GET /api/recruiter/job/{job_id}/candidates                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SELECT * FROM job_candidate_matches                      │   │
│  │ WHERE job_id = 'JOB_001'                                 │   │
│  │ ORDER BY match_score DESC                                │   │
│  │ LIMIT 20;                                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ⚡ <100ms RESPONSE!
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN TOP 20 CANDIDATES                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 SIMPLIFIED MATCHING ALGORITHM

```
┌─────────────────────────────────────────────────────────────────┐
│               UNIFIED MATCHING (Single Phase)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PREPROCESSING (Done once per CV/Job, cached)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Normalize skills → ["Python", "Java"]                │   │
│  │ 2. Encode skills with semantic model                     │   │
│  │    → Cache embeddings in memory                          │   │
│  │ 3. Extract experience, location, education               │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  MATCHING (Real-time, fast)                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Load pre-computed embeddings (instant)                │   │
│  │ 2. Cosine similarity between CV & Job skills (10ms)      │   │
│  │ 3. Apply skill rarity weights (1ms)                      │   │
│  │ 4. Experience match (1ms)                                │   │
│  │ 5. Location match (1ms)                                  │   │
│  │ 6. Compute final score (1ms)                             │   │
│  │                                                           │   │
│  │ Total: ~15ms per CV                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  FINAL SCORE                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ score = (                                                 │   │
│  │     skill_similarity * 0.80 +                            │   │
│  │     experience_match * 0.20                               │   │
│  │ )                                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 PERFORMANCE COMPARISON

```
┌──────────────────┬─────────────────┬─────────────────┬─────────────┐
│   Approach       │  First Load     │  Cached Load    │  Complexity │
├──────────────────┼─────────────────┼─────────────────┼─────────────┤
│ CURRENT          │                                                  │
│ (3 phases)       │  ▓▓▓▓▓▓▓▓▓▓▓▓   │  ▓▓▓▓▓▓▓▓       │  Very High  │
│                  │  30-60 seconds  │  8-10 seconds   │             │
├──────────────────┼─────────────────┼─────────────────┼─────────────┤
│ PROPOSED         │                                                  │
│ (pre-computed)   │  ▓              │  ▓              │  Medium     │
│                  │  <100ms         │  <100ms         │             │
├──────────────────┼─────────────────┼─────────────────┼─────────────┤
│ SIMPLIFIED       │                                                  │
│ (1 phase)        │  ▓▓▓            │  ▓              │  Low        │
│                  │  5-10 seconds   │  2-3 seconds    │             │
└──────────────────┴─────────────────┴─────────────────┴─────────────┘
```

---

## 🏗️ DATABASE SCHEMA CHANGES

### **BEFORE (Current):**
```sql
-- No company relationship!
corporate_jobs:
  job_id VARCHAR PRIMARY KEY
  title VARCHAR
  company VARCHAR  ⚠️ Just a string, not a foreign key!
  ...

-- Company extracted at runtime from JWT token
-- No database constraint
```

### **AFTER (Proposed):**
```sql
-- Add foreign key relationship
corporate_jobs:
  job_id VARCHAR PRIMARY KEY
  company_id INTEGER REFERENCES corp_users(id)  ✅ Foreign key!
  company_name VARCHAR  -- Denormalized for display
  ...

-- New cache table
job_candidate_matches:
  job_id VARCHAR REFERENCES corporate_jobs(job_id)
  cv_id VARCHAR REFERENCES cvs(cv_id)
  match_score FLOAT
  matched_skills TEXT[]
  missing_skills TEXT[]
  computed_at TIMESTAMP
  PRIMARY KEY (job_id, cv_id)
  INDEX (job_id, match_score DESC)  -- Fast sorting
```

---

**This visual guide should make it crystal clear for the other AIs!** 🎨
