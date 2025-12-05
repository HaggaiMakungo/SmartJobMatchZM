# 🎯 Matching Engine Integration Guide

## Overview
The ZedSafe backend includes a sophisticated CAMSS 2.0 matching engine that calculates compatibility scores between candidates and jobs.

---

## 📊 How Matching Works

### Corporate Jobs (6-Component CAMSS 2.0)
Each component weighted at **16.67%**:

1. **Qualification** - Education level match
2. **Experience** - Years of experience vs. required
3. **Skills** - Technical skills overlap (with semantic matching)
4. **Location** - Geographic proximity
5. **Category** - Career path alignment
6. **Personalization** - Candidate preferences (role types, collar types)

### Small Jobs (3-Component Simplified)
Weighted for gig economy:

1. **Skills** (40%) - Task-specific abilities
2. **Location** (30%) - Geographic availability
3. **Availability** (30%) - Time and commitment match

---

## 🔧 Current Integration Status

### Backend (✅ Complete)
- **File:** `backend/app/services/matching_service.py`
- **Status:** Fully implemented
- **Methods:**
  - `get_corp_matches(cv_id, limit, min_score)` - Get top corp job matches
  - `get_small_job_matches(cv_id, limit, min_score)` - Get top gig matches
  - Component scoring functions for each factor

### Frontend (⚠️ Using Simplified Logic)
**Files using frontend matching:**
- `src/app/dashboard/jobs/page.tsx` (lines 120-150)
- `src/app/dashboard/candidates/page.tsx` (similar logic)

**Current Frontend Calculation:**
```typescript
const calculateMatchScore = (candidate, job) => {
  let score = 0;
  
  // Skills match (40%)
  const candidateSkills = candidate.skills_technical?.split(',').map(s => s.trim().toLowerCase()) || [];
  const jobSkills = job.required_skills?.split(',').map(s => s.trim().toLowerCase()) || [];
  const skillOverlap = candidateSkills.filter(s => jobSkills.includes(s)).length;
  score += (skillOverlap / Math.max(jobSkills.length, 1)) * 40;
  
  // Experience (25%)
  const expDiff = Math.abs((candidate.total_experience_years || 0) - (job.required_experience_years || 0));
  score += Math.max(0, 25 - (expDiff * 5));
  
  // Location (20%)
  if (candidate.province === job.location_province) score += 20;
  else if (candidate.city === job.location_city) score += 15;
  
  // Availability (15%)
  if (candidate.availability_status === 'actively_looking') score += 15;
  else if (candidate.availability_status === 'open_to_offers') score += 10;
  
  return Math.min(Math.round(score), 100);
};
```

**Limitations:**
- No semantic matching (only exact string matches)
- No education/qualification scoring
- No category/personalization
- Missing 2 of 6 CAMSS components

---

## 🚀 How to Integrate Backend Matching

### Option 1: Call Matching API Directly (Recommended)

#### Step 1: Create Matching API Endpoint
Add to `backend/app/api/v1/match.py`:

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.matching_service import MatchingService

router = APIRouter()

@router.get("/match/candidate/{cv_id}/corporate-jobs")
def match_candidate_to_corp_jobs(
    cv_id: str,
    limit: int = Query(20, ge=1, le=100),
    min_score: float = Query(0.3, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Get best corporate job matches for a candidate
    
    Returns:
        List of jobs with match scores and explanations
    """
    matcher = MatchingService()
    matches = matcher.get_corp_matches(cv_id, limit, min_score)
    
    return {
        "success": True,
        "cv_id": cv_id,
        "total_matches": len(matches),
        "matches": matches
    }

@router.get("/match/job/{job_id}/candidates")
def match_job_to_candidates(
    job_id: str,
    limit: int = Query(20, ge=1, le=100),
    min_score: float = Query(0.3, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Get best candidate matches for a job (reverse matching)
    
    Returns:
        List of candidates with match scores
    """
    # TODO: Implement reverse matching
    # For now, get all CVs and score them
    matcher = MatchingService()
    
    # This would need optimization for production
    return {
        "success": True,
        "job_id": job_id,
        "message": "Reverse matching coming soon"
    }
```

#### Step 2: Register Router
In `backend/app/api/v1/__init__.py`:
```python
from .match import router as match_router

# In main.py:
app.include_router(match_router, prefix="/api/match", tags=["matching"])
```

#### Step 3: Update Frontend API Service
Add to `src/lib/api/matching.ts`:

```typescript
import apiClient from './client';

export interface MatchResult {
  job_id: string;
  title: string;
  company: string;
  final_score: number;
  component_scores: {
    qualification: number;
    experience: number;
    skills: number;
    location: number;
    category: number;
    personalization: number;
  };
  explanation: string;
}

export const matchingApi = {
  /**
   * Get job matches for a candidate
   */
  getCandidateMatches: async (cvId: string, params?: {
    limit?: number;
    min_score?: number;
  }): Promise<MatchResult[]> => {
    const response = await apiClient.get(
      `/api/match/candidate/${cvId}/corporate-jobs`,
      { params }
    );
    return response.data.matches;
  },

  /**
   * Get candidate matches for a job
   */
  getJobMatches: async (jobId: string, params?: {
    limit?: number;
    min_score?: number;
  }) => {
    const response = await apiClient.get(
      `/api/match/job/${jobId}/candidates`,
      { params }
    );
    return response.data;
  },
};
```

#### Step 4: Use in Jobs Page
Update `src/app/dashboard/jobs/page.tsx`:

```typescript
import { matchingApi } from '@/lib/api/matching';

// Inside component:
const loadMatchedCandidates = async (jobId: string) => {
  try {
    setLoading(true);
    
    // Get all candidates
    const { cvs } = await candidatesApi.list({ limit: 100 });
    
    // Get match scores from backend
    const matches = await matchingApi.getJobMatches(jobId, {
      limit: 100,
      min_score: matchScoreRange[0] / 100
    });
    
    // Merge candidate data with match scores
    const candidatesWithScores = cvs.map(cv => {
      const match = matches.find(m => m.cv_id === cv.cv_id);
      return {
        ...cv,
        match_score: match ? match.final_score * 100 : 0,
        match_explanation: match?.explanation
      };
    });
    
    setCandidates(candidatesWithScores);
  } catch (error) {
    toast.error('Failed to load candidates');
  } finally {
    setLoading(false);
  }
};
```

---

### Option 2: Store Match Scores in Applications Table (Better)

When an application is created, calculate and store the match score:

```python
# In application_service.py
def create_application(db, cv_id, application_data, match_score=None):
    # Calculate match score if not provided
    if match_score is None:
        matcher = MatchingService()
        # Get job details
        job = db.query(CorporateJob).filter_by(job_id=application_data.job_id).first()
        if job:
            matches = matcher.get_corp_matches(cv_id, limit=1, min_score=0.0)
            if matches and matches[0]['job_id'] == application_data.job_id:
                match_score = matches[0]['final_score'] * 100  # Store as 0-100
        
        if match_score is None:
            match_score = 75.0  # Fallback
    
    # Create application with score
    application = Application(
        cv_id=cv_id,
        job_id=application_data.job_id,
        match_score=match_score,
        # ... other fields
    )
    
    db.add(application)
    db.commit()
    return application
```

---

## 📈 Performance Considerations

### Current Issues
- Matching engine loads CSVs (slow for large datasets)
- No caching of match results
- Batch matching not optimized

### Recommended Optimizations

1. **Cache Match Scores**
```python
# Use Redis or similar
@cache(ttl=3600)  # Cache for 1 hour
def get_corp_matches(cv_id, limit, min_score):
    # ... matching logic
```

2. **Precompute Scores**
```sql
-- Create match_scores table
CREATE TABLE match_scores (
    cv_id VARCHAR(50),
    job_id VARCHAR(50),
    match_score DECIMAL(5,2),
    component_scores JSONB,
    updated_at TIMESTAMP,
    PRIMARY KEY (cv_id, job_id)
);

-- Update scores periodically (daily job)
```

3. **Batch Processing**
```python
def batch_calculate_matches(cv_ids, job_ids):
    """Calculate matches for multiple CV-job pairs at once"""
    # Vectorized operations for speed
```

---

## 🎯 Integration Priority

### Phase 1: Basic Integration (1-2 hours)
1. ✅ Create matching API endpoints
2. ✅ Update frontend to call matching API
3. ✅ Replace frontend calculation in Jobs page

### Phase 2: Store Scores (2-3 hours)
1. ✅ Calculate match score on application creation
2. ✅ Store in applications table
3. ✅ Use stored scores for filtering/sorting

### Phase 3: Optimization (4-6 hours)
1. Add caching layer
2. Create match_scores table for precomputation
3. Implement batch matching
4. Add background jobs for score updates

---

## 🧪 Testing the Matching Engine

### Test from Python Console
```python
from app.services.matching_service import MatchingService

matcher = MatchingService()

# Test with a CV
matches = matcher.get_corp_matches('CV000004', limit=5, min_score=0.5)

for match in matches:
    print(f"\n{match['title']} at {match['company']}")
    print(f"Score: {match['final_score']:.2%}")
    print(f"Breakdown: {match['component_scores']}")
    print(f"Why: {match['explanation']}")
```

### Test via API (after adding endpoints)
```bash
curl http://localhost:8000/api/match/candidate/CV000004/corporate-jobs?limit=5&min_score=0.5
```

---

## 📝 Next Steps

1. **Immediate:** Use Option 2 (store scores in applications)
2. **Short-term:** Add matching API endpoints
3. **Medium-term:** Implement caching and precomputation
4. **Long-term:** Add ML-based semantic matching

---

## 🔍 Match Score Breakdown Example

```json
{
  "job_id": "JID-002-FE-001",
  "title": "Senior Frontend Developer",
  "final_score": 0.8567,
  "component_scores": {
    "qualification": 1.0,     // Perfect education match
    "experience": 0.92,       // 8 years vs 7 required
    "skills": 0.75,           // 75% skills overlap
    "location": 1.0,          // Same city
    "category": 0.85,         // Good career fit
    "personalization": 0.62   // Moderate preference match
  },
  "explanation": "✓ Education matches requirements (Bachelor's Degree) • ✓ 8 years experience meets requirement (7+ years) • ✓ Strong skills match (75%) • ✓ Same location (Lusaka) • ✓ Good career transition fit"
}
```

---

**Ready to integrate?** Start with Option 2 (storing scores) for immediate results! 🚀
