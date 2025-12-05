# Quick Reference Guide - Pydantic Schemas

## Import Patterns

```python
# Match schemas
from app.schemas import (
    MatchRequest, MatchResponse,
    CorporateJobMatch, SmallJobMatch,
    ComponentScores, JobType, CollarType
)

# CV schemas
from app.schemas import (
    CVCreate, CVUpdate, CVResponse,
    EducationLevel, EmploymentStatus
)

# Job schemas
from app.schemas import (
    CorporateJobCreate, CorporateJobResponse,
    SmallJobCreate, SmallJobResponse,
    EmploymentType, PaymentType
)
```

## Common Usage Patterns

### 1. Match Request (Full Example)

```python
request = MatchRequest(
    job_type=JobType.CORPORATE,      # or JobType.SMALL, JobType.BOTH
    limit=20,                        # Max 100
    min_score=0.4,                   # 0.0 to 1.0
    
    # Filters
    categories=["Information Technology", "Engineering"],
    locations=["Lusaka", "Copperbelt"],
    salary_min=10000,
    salary_max=30000,
    collar_types=[CollarType.GREY, CollarType.WHITE],
    employment_types=["Full-time"],
    
    # Sorting
    sort_by=SortBy.SCORE,            # SCORE, SALARY, POSTED_DATE
    sort_order="desc",               # "asc" or "desc"
    
    # Pagination
    offset=0
)
```

### 2. Match Response Structure

```python
response = MatchResponse(
    success=True,
    job_type=JobType.CORPORATE,
    total_matches=45,
    returned_matches=20,
    
    corporate_matches=[
        CorporateJobMatch(
            job_id="job_001",
            title="Senior Software Engineer",
            company="TechZambia Ltd",
            final_score=0.87,
            
            component_scores=ComponentScores(
                qualification=0.85,
                experience=0.90,
                skills=0.92,
                location=1.0,
                category=0.75,
                personalization=0.60
            ),
            
            explanation="Strong technical background...",
            match_reasons=[
                "Education matches requirements (Bachelor's)",
                "8 years experience exceeds requirement",
                "Strong skills match (92%)"
            ]
        )
    ],
    
    cv_id="cv_001",
    execution_time_ms=245.6,
    has_more=True
)
```

### 3. Create CV

```python
new_cv = CVCreate(
    # Required
    full_name="John Banda",
    email="john@example.com",
    phone="260977123456",
    city="Lusaka",
    province="Lusaka",
    education_level=EducationLevel.BACHELORS,
    employment_status=EmploymentStatus.EMPLOYED,
    
    # Optional but recommended
    total_years_experience=6.0,
    current_job_title="Software Developer",
    skills_technical="Python, JavaScript, React",
    skills_soft="Problem-solving, Communication",
    
    # Preferences
    salary_expectation_min=15000.0,
    salary_expectation_max=22000.0,
    preferred_job_type="Full-time",
    availability="1 month"
)
```

### 4. Create Corporate Job

```python
new_job = CorporateJobCreate(
    # Required
    title="Senior Software Engineer",
    company="TechZambia Ltd",
    category="Information Technology",
    collar_type=CollarType.GREY,
    description="Detailed job description (min 50 chars)...",
    
    # Requirements
    required_skills="Python, JavaScript, SQL, Git",
    preferred_skills="React, AWS, Kubernetes",
    required_experience_years=5.0,
    required_education="Bachelor's",
    
    # Location & Compensation
    location_city="Lusaka",
    location_province="Lusaka",
    salary_min_zmw=18000.0,
    salary_max_zmw=25000.0,
    
    # Employment
    employment_type=EmploymentType.FULL_TIME
)
```

### 5. Create Small Job (Gig)

```python
new_gig = SmallJobCreate(
    # Required
    title="Website Landing Page Design",
    category="Web Development",
    description="Need a modern landing page (min 20 chars)...",
    
    # Location
    province="Lusaka",
    location="Lusaka CBD",
    
    # Payment
    budget=2500.0,
    payment_type=PaymentType.FIXED,
    
    # Details
    duration="1 week",
    status=JobStatus.OPEN,
    posted_by="user_123"
)
```

## Validation Examples

### ✅ Valid Requests

```python
# Valid salary range
request = MatchRequest(
    salary_min=10000,
    salary_max=30000  # Greater than min
)

# Valid experience range
cv = CVCreate(
    total_years_experience=15.0  # 0-50 years
)

# Valid education level
cv = CVCreate(
    education_level=EducationLevel.BACHELORS  # Enum value
)
```

### ❌ Invalid Requests (Will Raise ValidationError)

```python
# Invalid: max < min
request = MatchRequest(
    salary_min=30000,
    salary_max=10000  # Error!
)

# Invalid: limit too high
request = MatchRequest(
    limit=200  # Max is 100, Error!
)

# Invalid: score out of range
request = MatchRequest(
    min_score=1.5  # Must be 0.0-1.0, Error!
)

# Invalid: experience out of range
cv = CVCreate(
    total_years_experience=60.0  # Max is 50, Error!
)
```

## Enum Values Reference

### JobType
```python
JobType.CORPORATE  # Corporate jobs only
JobType.SMALL      # Small jobs/gigs only
JobType.BOTH       # Both types
```

### CollarType
```python
CollarType.WHITE   # Professional/office
CollarType.BLUE    # Manual/technical
CollarType.PINK    # Service/creative
CollarType.GREY    # Tech/engineering
CollarType.GREEN   # Environmental
```

### EducationLevel
```python
EducationLevel.CERTIFICATE
EducationLevel.DIPLOMA
EducationLevel.BACHELORS
EducationLevel.MASTERS
EducationLevel.DOCTORATE
EducationLevel.PHD
EducationLevel.PROFESSIONAL
```

### EmploymentStatus
```python
EmploymentStatus.EMPLOYED
EmploymentStatus.UNEMPLOYED
EmploymentStatus.SELF_EMPLOYED
EmploymentStatus.STUDENT
EmploymentStatus.FREELANCER
```

### EmploymentType
```python
EmploymentType.FULL_TIME
EmploymentType.PART_TIME
EmploymentType.CONTRACT
EmploymentType.INTERNSHIP
EmploymentType.TEMPORARY
```

### PaymentType (Small Jobs)
```python
PaymentType.FIXED
PaymentType.HOURLY
PaymentType.DAILY
PaymentType.MILESTONE
```

### JobStatus (Small Jobs)
```python
JobStatus.OPEN
JobStatus.IN_PROGRESS
JobStatus.COMPLETED
JobStatus.CANCELLED
JobStatus.ON_HOLD
```

### SortBy
```python
SortBy.SCORE
SortBy.SALARY
SortBy.POSTED_DATE
SortBy.RELEVANCE
```

## Error Handling

```python
from fastapi import HTTPException
from app.schemas import MatchErrorResponse

# Custom error response
error = MatchErrorResponse(
    success=False,
    error_code="CV_NOT_FOUND",
    message="CV with ID 'cv_999' not found",
    details={
        "cv_id": "cv_999",
        "suggestion": "Check CV ID or create a new CV profile"
    }
)

# Raise HTTP exception
raise HTTPException(
    status_code=404,
    detail=error.dict()
)
```

## Component Score Calculation Reference

### Corporate Jobs (Equal Weights - Phase 2A)
```python
final_score = (
    qualification * 0.1667 +
    experience * 0.1667 +
    skills * 0.1667 +
    location * 0.1667 +
    category * 0.1667 +
    personalization * 0.1667
)
```

### Small Jobs
```python
final_score = (
    skills * 0.40 +
    location * 0.30 +
    availability * 0.30
)
```

## Testing Patterns

```python
import pytest
from app.schemas import MatchRequest, JobType

def test_valid_match_request():
    request = MatchRequest(
        job_type=JobType.CORPORATE,
        limit=20,
        min_score=0.4
    )
    assert request.limit == 20
    assert request.min_score == 0.4

def test_invalid_limit():
    with pytest.raises(ValueError):
        MatchRequest(
            job_type=JobType.CORPORATE,
            limit=200  # Exceeds max of 100
        )

def test_invalid_salary_range():
    with pytest.raises(ValueError):
        MatchRequest(
            salary_min=30000,
            salary_max=10000  # Less than min
        )
```

## FastAPI Integration

```python
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import MatchRequest, MatchResponse, MatchErrorResponse

router = APIRouter()

@router.post(
    "/match",
    response_model=MatchResponse,
    responses={
        404: {"model": MatchErrorResponse},
        422: {"model": MatchErrorResponse}
    }
)
async def get_matches(
    request: MatchRequest,
    current_user: User = Depends(get_current_user)
):
    """Get AI-matched jobs"""
    try:
        # Your logic here
        return MatchResponse(...)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=MatchErrorResponse(
                success=False,
                error_code="VALIDATION_ERROR",
                message=str(e)
            ).dict()
        )
```

## Tips & Best Practices

1. **Always use Enums** for fixed choices (don't use strings directly)
2. **Check optional fields** before accessing: `if cv.certifications:`
3. **Use .dict()** to convert to dictionary: `response.dict()`
4. **Use .json()** to convert to JSON string: `response.json()`
5. **Validate early** - Let Pydantic catch errors at the API boundary
6. **Use orm_mode** for database models: `Config: orm_mode = True`
7. **Provide examples** in responses for documentation
8. **Handle ValidationError** from Pydantic for custom error messages

## Common Gotchas

1. **Enum comparison**: Use `==` not `is`
   ```python
   # ✅ Correct
   if request.job_type == JobType.CORPORATE:
   
   # ❌ Wrong
   if request.job_type is JobType.CORPORATE:
   ```

2. **Optional fields**: Check for None
   ```python
   # ✅ Correct
   if match.match_confidence:
       print(match.match_confidence)
   
   # ❌ Wrong (may raise AttributeError)
   print(match.match_confidence.upper())
   ```

3. **Validation**: Use try-except
   ```python
   # ✅ Correct
   try:
       request = MatchRequest(**data)
   except ValidationError as e:
       handle_error(e)
   ```

## Documentation Access

- **Auto-generated API docs**: `/docs` (Swagger UI)
- **Alternative docs**: `/redoc` (ReDoc)
- **Schema details**: `app/schemas/README.md`
- **Implementation notes**: `app/schemas/IMPLEMENTATION_SUMMARY.md`
