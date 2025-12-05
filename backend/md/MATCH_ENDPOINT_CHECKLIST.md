# Implementation Checklist - Match Endpoint

## ✅ Phase 1: Schemas (COMPLETED)

- [x] Create match.py with all matching schemas
- [x] Create cv.py with CV schemas  
- [x] Create job.py with job schemas
- [x] Create __init__.py for exports
- [x] Write comprehensive documentation (README.md)
- [x] Write quick reference guide
- [x] Write implementation summary
- [x] Create unit tests (test_schemas.py)
- [x] Create architecture diagrams

**Status**: ✅ **COMPLETE** - All schemas ready for use

---

## 📋 Phase 2: Endpoint Implementation (NEXT)

### 2.1 Update Match Endpoint File

File: `app/api/v1/match.py`

- [ ] Import all necessary schemas
- [ ] Import MatchingService
- [ ] Add error handling utilities
- [ ] Add telemetry/logging setup

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import time

from app.schemas import (
    MatchRequest, MatchResponse, SingleJobMatchRequest,
    SingleJobMatchResponse, MatchErrorResponse, JobType
)
from app.services.matching_service import MatchingService
from app.api.deps import get_current_user, get_db
from app.models.user import User
```

### 2.2 Implement Main Match Endpoint

- [ ] Create POST `/api/v1/match` endpoint
- [ ] Add proper response models
- [ ] Add error responses (404, 422, 500)
- [ ] Implement request validation
- [ ] Get CV ID from request or current user
- [ ] Initialize MatchingService
- [ ] Handle corporate job matching
- [ ] Handle small job matching
- [ ] Handle "both" job type
- [ ] Apply filters from request
- [ ] Apply sorting
- [ ] Apply pagination
- [ ] Calculate execution time
- [ ] Return MatchResponse

**Endpoint signature:**
```python
@router.post(
    "/match",
    response_model=MatchResponse,
    responses={
        404: {"model": MatchErrorResponse, "description": "CV not found"},
        422: {"model": MatchErrorResponse, "description": "Validation error"},
        500: {"model": MatchErrorResponse, "description": "Server error"}
    },
    summary="Get AI-matched jobs",
    description="Get personalized job matches using CAMSS 2.0 algorithm"
)
async def get_matches(
    request: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MatchResponse:
    """Implementation here"""
    pass
```

### 2.3 Implement Single Job Match Endpoint

- [ ] Create POST `/api/v1/match/job/{job_id}` endpoint
- [ ] Add proper response models
- [ ] Validate job_id exists
- [ ] Get match score for specific job
- [ ] Return SingleJobMatchResponse

**Endpoint signature:**
```python
@router.post(
    "/match/job/{job_id}",
    response_model=SingleJobMatchResponse,
    responses={
        404: {"model": MatchErrorResponse, "description": "Job not found"}
    },
    summary="Get match score for specific job",
    description="Calculate match score between CV and specific job"
)
async def get_single_job_match(
    job_id: str,
    request: SingleJobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> SingleJobMatchResponse:
    """Implementation here"""
    pass
```

### 2.4 Error Handling

- [ ] Create error handler for CV not found
- [ ] Create error handler for job not found
- [ ] Create error handler for validation errors
- [ ] Create error handler for database errors
- [ ] Return proper MatchErrorResponse for each

**Helper function:**
```python
def create_error_response(
    error_code: str,
    message: str,
    details: Optional[dict] = None
) -> MatchErrorResponse:
    return MatchErrorResponse(
        success=False,
        error_code=error_code,
        message=message,
        details=details or {}
    )
```

### 2.5 Telemetry & Logging

- [ ] Log all match requests
- [ ] Log execution times
- [ ] Log filter usage
- [ ] Log errors and exceptions
- [ ] Track which components score highest
- [ ] Track which filters are used most

**Logging structure:**
```python
logger.info(
    "Match request",
    extra={
        "cv_id": cv_id,
        "job_type": request.job_type,
        "limit": request.limit,
        "filters": {
            "categories": request.categories,
            "locations": request.locations,
            "salary_range": (request.salary_min, request.salary_max)
        }
    }
)
```

---

## 📋 Phase 3: Service Layer Updates

File: `app/services/matching_service.py`

### 3.1 Update Return Types

- [ ] Change `get_corp_matches` to return List[CorporateJobMatch]
- [ ] Change `get_small_job_matches` to return List[SmallJobMatch]
- [ ] Update internal methods to use schemas

**Before:**
```python
def get_corp_matches(self, cv_id: str, limit: int = 20) -> List[Dict]:
    # Returns dicts
    return [{"job_id": "...", "title": "...", ...}]
```

**After:**
```python
def get_corp_matches(self, cv_id: str, limit: int = 20) -> List[CorporateJobMatch]:
    # Returns Pydantic schemas
    from app.schemas import CorporateJobMatch, ComponentScores
    return [CorporateJobMatch(...)]
```

### 3.2 Add Match Reasons Generation

- [ ] Create `_generate_match_reasons()` method
- [ ] Generate reasons based on component scores
- [ ] Add specific reasons for high-scoring components
- [ ] Format reasons as user-friendly strings

**Implementation:**
```python
def _generate_match_reasons(self, cv: Dict, job: Dict, scores: Dict) -> List[str]:
    reasons = []
    
    if scores['qualification'] >= 0.8:
        reasons.append(f"Education matches requirements ({cv['education_level']})")
    
    if scores['experience'] >= 0.8:
        exp = cv['total_years_experience']
        req = job['required_experience_years']
        reasons.append(f"{exp} years experience exceeds requirement ({req}+ years)")
    
    # ... more reasons
    
    return reasons
```

### 3.3 Add Match Confidence Calculation

- [ ] Create `_calculate_match_confidence()` method
- [ ] Return "High" if score >= 0.8
- [ ] Return "Medium" if score >= 0.6
- [ ] Return "Low" if score < 0.6

**Implementation:**
```python
def _calculate_match_confidence(self, final_score: float) -> str:
    if final_score >= 0.8:
        return "High"
    elif final_score >= 0.6:
        return "Medium"
    else:
        return "Low"
```

### 3.4 Add Filtering Support

- [ ] Add category filtering
- [ ] Add location filtering
- [ ] Add salary range filtering
- [ ] Add collar type filtering
- [ ] Add employment type filtering

**Implementation:**
```python
def _apply_filters(self, jobs: pd.DataFrame, filters: Dict) -> pd.DataFrame:
    if filters.get('categories'):
        jobs = jobs[jobs['category'].isin(filters['categories'])]
    
    if filters.get('salary_min'):
        jobs = jobs[jobs['salary_max_zmw'] >= filters['salary_min']]
    
    # ... more filters
    
    return jobs
```

### 3.5 Add Sorting Support

- [ ] Add sort by score
- [ ] Add sort by salary
- [ ] Add sort by posted date
- [ ] Support ascending/descending

---

## 📋 Phase 4: Testing

### 4.1 Unit Tests

File: `tests/test_match_endpoint.py`

- [ ] Test valid match request
- [ ] Test with different job types
- [ ] Test with filters
- [ ] Test with sorting
- [ ] Test with pagination
- [ ] Test error cases (CV not found, invalid params)
- [ ] Test single job match endpoint

### 4.2 Integration Tests

- [ ] Test complete match flow
- [ ] Test with real database data
- [ ] Test filtering behavior
- [ ] Test pagination behavior
- [ ] Test error handling

### 4.3 Performance Tests

- [ ] Test with large result sets
- [ ] Measure execution time
- [ ] Test concurrent requests
- [ ] Optimize slow queries

---

## 📋 Phase 5: Documentation

### 5.1 API Documentation

- [ ] Add detailed docstrings to endpoints
- [ ] Add usage examples
- [ ] Add response examples
- [ ] Document all possible errors

### 5.2 Update Master Plan

- [ ] Mark Phase 2A matching implementation as complete
- [ ] Update progress tracker
- [ ] Document any deviations from plan

---

## 📋 Phase 6: Deployment Prep

### 6.1 Configuration

- [ ] Add environment variables for matching params
- [ ] Add feature flags for filtering options
- [ ] Configure logging levels

### 6.2 Monitoring

- [ ] Add metrics for match requests
- [ ] Add metrics for execution time
- [ ] Add metrics for error rates
- [ ] Add metrics for filter usage

### 6.3 Database

- [ ] Ensure all indexes are in place
- [ ] Optimize slow queries
- [ ] Add database connection pooling

---

## 🎯 Success Criteria

### Functionality
- [ ] Endpoint returns valid matches for corporate jobs
- [ ] Endpoint returns valid matches for small jobs
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Pagination works correctly
- [ ] Error handling works correctly

### Performance
- [ ] Execution time < 500ms for 20 matches
- [ ] Can handle 10 concurrent requests
- [ ] Database queries are optimized

### Quality
- [ ] All tests pass
- [ ] Code coverage > 80%
- [ ] No linting errors
- [ ] Documentation is complete

### Alignment
- [ ] Implements CAMSS 2.0 correctly
- [ ] Equal weights (16.67% each) for corporate jobs
- [ ] Correct weights (40/30/30) for small jobs
- [ ] Explainability included in all matches
- [ ] Follows Master Plan specifications

---

## 📝 Code Templates

### Basic Endpoint Structure

```python
@router.post("/match", response_model=MatchResponse)
async def get_matches(
    request: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MatchResponse:
    """Get AI-matched jobs for current user"""
    
    start_time = time.time()
    
    try:
        # Get CV ID
        cv_id = request.cv_id or current_user.cv_id
        if not cv_id:
            raise HTTPException(
                status_code=404,
                detail=create_error_response(
                    "CV_NOT_FOUND",
                    "No CV associated with user"
                ).dict()
            )
        
        # Initialize matching service
        matcher = MatchingService()
        
        # Get matches based on job type
        if request.job_type == JobType.CORPORATE:
            matches = matcher.get_corp_matches(
                cv_id=cv_id,
                limit=request.limit,
                min_score=request.min_score,
                filters={
                    'categories': request.categories,
                    'locations': request.locations,
                    'salary_min': request.salary_min,
                    'salary_max': request.salary_max,
                    'collar_types': request.collar_types,
                    'employment_types': request.employment_types
                }
            )
            
            # Apply sorting and pagination
            matches = apply_sorting(matches, request.sort_by, request.sort_order)
            total_matches = len(matches)
            matches = matches[request.offset:request.offset + request.limit]
            
            execution_time = (time.time() - start_time) * 1000
            
            return MatchResponse(
                success=True,
                job_type=JobType.CORPORATE,
                total_matches=total_matches,
                returned_matches=len(matches),
                corporate_matches=matches,
                cv_id=cv_id,
                filters_applied={
                    'categories': request.categories,
                    'locations': request.locations,
                    'salary_range': [request.salary_min, request.salary_max]
                },
                execution_time_ms=execution_time,
                offset=request.offset,
                has_more=(request.offset + request.limit) < total_matches
            )
        
        # Similar for small jobs...
        
    except Exception as e:
        logger.error(f"Match request failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=create_error_response(
                "INTERNAL_ERROR",
                "Failed to process match request",
                {"error": str(e)}
            ).dict()
        )
```

---

## 📊 Progress Tracking

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| 1. Schemas | 9 | 9 | ✅ COMPLETE |
| 2. Endpoint | 21 | 0 | 🔄 NEXT |
| 3. Service Updates | 11 | 0 | ⏳ Pending |
| 4. Testing | 8 | 0 | ⏳ Pending |
| 5. Documentation | 3 | 0 | ⏳ Pending |
| 6. Deployment | 6 | 0 | ⏳ Pending |
| **TOTAL** | **58** | **9** | **16% Complete** |

---

## 🚀 Next Steps

1. **Start with Phase 2.1**: Update match.py with imports
2. **Implement Phase 2.2**: Main match endpoint
3. **Test incrementally**: Test each feature as you build it
4. **Update Phase 3**: Service layer changes
5. **Write tests**: Phase 4
6. **Document**: Phase 5
7. **Deploy**: Phase 6

---

## 💡 Tips for Implementation

1. **Start simple**: Get basic matching working first, then add filters
2. **Test early**: Test each component as you build it
3. **Use the schemas**: Let Pydantic do the validation work
4. **Log everything**: You'll need the data for debugging and optimization
5. **Follow the Master Plan**: Stick to equal weights for Phase 2A
6. **Explainability first**: Make sure every match has clear explanations
7. **Handle errors gracefully**: Always return proper error responses

---

## ✅ Definition of Done

The match endpoint is complete when:

- ✅ All checkboxes in this document are checked
- ✅ All tests pass
- ✅ Code is reviewed and merged
- ✅ Documentation is updated
- ✅ API docs are generated and accurate
- ✅ Performance meets requirements
- ✅ Error handling is comprehensive
- ✅ Logging and monitoring are in place
- ✅ Aligns with Master Plan Phase 2A requirements
