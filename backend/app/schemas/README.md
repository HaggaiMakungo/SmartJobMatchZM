# Pydantic Schemas Documentation

This directory contains all Pydantic schemas used for API request/response validation in the AI Job Matching System.

## Overview

The schemas are organized into three main modules:

1. **match.py** - Matching system schemas (CAMSS 2.0)
2. **cv.py** - Candidate CV/resume schemas
3. **job.py** - Job posting schemas (corporate and small jobs)

## Schema Modules

### 1. Match Schemas (`match.py`)

Implements the CAMSS 2.0 (Collar-Aware Multi-Score System) matching algorithm schemas.

#### Key Features:
- **Dual-track matching**: Corporate jobs (6 components) and Small jobs (3 components)
- **Explainability**: Component score breakdowns and match explanations
- **Filtering**: Advanced filters for categories, locations, salary, etc.
- **Analytics**: Match quality metrics and distributions

#### Main Schemas:

**Request Schemas:**
- `MatchRequest` - Main matching request with filters and pagination
- `SingleJobMatchRequest` - Match a specific job against a CV

**Response Schemas:**
- `MatchResponse` - List of matches with metadata
- `SingleJobMatchResponse` - Single job match details
- `MatchErrorResponse` - Error responses

**Match Result Schemas:**
- `CorporateJobMatch` - Corporate job match with 6-component scoring
- `SmallJobMatch` - Small job match with 3-component scoring
- `ComponentScores` - Individual component scores for explainability

**Enums:**
- `JobType` - corporate, small, both
- `CollarType` - white, blue, pink, grey, green
- `SortBy` - score, salary, posted_date, relevance

#### Example Usage:

```python
from app.schemas import MatchRequest, MatchResponse, JobType

# Create a match request
request = MatchRequest(
    job_type=JobType.CORPORATE,
    limit=20,
    min_score=0.4,
    categories=["Information Technology"],
    locations=["Lusaka"],
    salary_min=10000,
    salary_max=30000
)

# The response will be a MatchResponse with corporate_matches populated
```

#### Component Scoring:

**Corporate Jobs (CAMSS 2.0 - 6 components):**
```python
ComponentScores(
    qualification=0.85,    # Education match (16.67%)
    experience=0.72,       # Experience match (16.67%)
    skills=0.90,          # Skills match (16.67%)
    location=1.0,         # Location compatibility (16.67%)
    category=0.68,        # Category relevance (16.67%)
    personalization=0.55  # User preferences (16.67%)
)
# Final score = average of all components
```

**Small Jobs (3 components):**
```python
ComponentScores(
    skills=0.85,        # Skills match (40%)
    location=1.0,       # Location compatibility (30%)
    availability=0.60   # Availability match (30%)
)
```

---

### 2. CV Schemas (`cv.py`)

Schemas for candidate resumes and profiles.

#### Main Schemas:

**Request Schemas:**
- `CVCreate` - Create a new CV
- `CVUpdate` - Update existing CV (all fields optional)

**Response Schemas:**
- `CVResponse` - Single CV with all details
- `CVListResponse` - Paginated list of CVs

**Sub-Schemas:**
- `WorkExperience` - Work history entry
- `Project` - Project portfolio entry
- `Reference` - Professional reference

**Enums:**
- `EducationLevel` - Certificate, Diploma, Bachelor's, Master's, PhD
- `EmploymentStatus` - Employed, Unemployed, Self-Employed, Student, Freelancer

#### Example Usage:

```python
from app.schemas import CVCreate, EducationLevel, EmploymentStatus

# Create a new CV
new_cv = CVCreate(
    full_name="John Banda",
    email="john.banda@example.com",
    phone="260977123456",
    city="Lusaka",
    province="Lusaka",
    education_level=EducationLevel.BACHELORS,
    institution="University of Zambia",
    graduation_year=2015,
    major="Computer Science",
    total_years_experience=6.0,
    current_job_title="Software Developer",
    employment_status=EmploymentStatus.EMPLOYED,
    skills_technical="Python, JavaScript, React, SQL",
    skills_soft="Problem-solving, Communication, Teamwork",
    salary_expectation_min=15000.0,
    salary_expectation_max=22000.0
)
```

#### Validation Rules:

- **Email**: Must be valid email format
- **Phone**: Required, string format
- **Salary Range**: `salary_expectation_max` must be ≥ `salary_expectation_min`
- **Experience**: Must be between 0.0 and 50.0 years
- **Graduation Year**: Must be between 1950 and 2030
- **Name**: Minimum 2 characters, maximum 100 characters

---

### 3. Job Schemas (`job.py`)

Schemas for both corporate jobs and small jobs (gigs).

#### Corporate Job Schemas:

**Request Schemas:**
- `CorporateJobCreate` - Create a new corporate job posting
- `CorporateJobUpdate` - Update existing job (all fields optional)

**Response Schemas:**
- `CorporateJobResponse` - Single job with all details
- `CorporateJobListResponse` - Paginated list of jobs

**Enums:**
- `CollarType` - white, blue, pink, grey, green
- `EmploymentType` - Full-time, Part-time, Contract, Internship, Temporary

#### Small Job Schemas:

**Request Schemas:**
- `SmallJobCreate` - Create a new gig/task
- `SmallJobUpdate` - Update existing gig

**Response Schemas:**
- `SmallJobResponse` - Single gig with all details
- `SmallJobListResponse` - Paginated list of gigs

**Enums:**
- `PaymentType` - Fixed, Hourly, Daily, Milestone
- `JobStatus` - Open, In Progress, Completed, Cancelled, On Hold

#### Example Usage:

```python
from app.schemas import CorporateJobCreate, CollarType, EmploymentType

# Create a corporate job posting
new_job = CorporateJobCreate(
    title="Senior Software Engineer",
    company="TechZambia Ltd",
    category="Information Technology",
    collar_type=CollarType.GREY,
    description="We are seeking an experienced software engineer...",
    required_skills="Python, JavaScript, SQL, Git, Docker",
    preferred_skills="React, AWS, Kubernetes",
    required_experience_years=5.0,
    required_education="Bachelor's",
    location_city="Lusaka",
    location_province="Lusaka",
    salary_min_zmw=18000.0,
    salary_max_zmw=25000.0,
    employment_type=EmploymentType.FULL_TIME
)
```

#### Validation Rules:

**Corporate Jobs:**
- **Title**: Minimum 3 characters, maximum 200
- **Description**: Minimum 50 characters
- **Salary Range**: `salary_max_zmw` must be ≥ `salary_min_zmw`
- **Experience**: Must be between 0.0 and 30.0 years

**Small Jobs:**
- **Title**: Minimum 3 characters, maximum 200
- **Description**: Minimum 20 characters
- **Budget**: Must be ≥ 0

---

## Common Patterns

### Pagination

All list responses include pagination metadata:

```python
{
    "total": 150,           # Total number of items
    "items": [...],         # Current page items
    "page": 1,             # Current page number
    "page_size": 20,       # Items per page
    "has_more": True       # More pages available
}
```

### Error Responses

Consistent error response format:

```python
MatchErrorResponse(
    success=False,
    error_code="CV_NOT_FOUND",
    message="CV with ID 'cv_999' not found",
    details={
        "cv_id": "cv_999",
        "suggestion": "Check CV ID or create a new CV profile"
    }
)
```

### Explainability

All match results include explainable components:

```python
{
    "final_score": 0.87,
    "component_scores": {
        "qualification": 0.85,
        "experience": 0.90,
        ...
    },
    "explanation": "Strong technical background with matching skills",
    "match_reasons": [
        "Education matches requirements (Bachelor's)",
        "8 years experience exceeds requirement (5+ years)",
        "Strong skills match (92%)"
    ]
}
```

---

## Collar Type Classification

The system uses a 5-collar classification for jobs:

| Collar | Description | Example Jobs |
|--------|-------------|--------------|
| **White** | Professional/office work | Manager, Accountant, Lawyer |
| **Blue** | Manual/technical work | Mechanic, Electrician, Welder |
| **Pink** | Service/creative work | Nurse, Teacher, Designer |
| **Grey** | Tech/engineering work | Software Engineer, Data Scientist |
| **Green** | Environmental work | Sustainability Officer, Conservation |

---

## Usage in FastAPI Endpoints

### Example Endpoint Definition:

```python
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import MatchRequest, MatchResponse, MatchErrorResponse

router = APIRouter()

@router.post(
    "/match",
    response_model=MatchResponse,
    responses={
        200: {"model": MatchResponse},
        404: {"model": MatchErrorResponse},
        422: {"model": MatchErrorResponse}
    }
)
async def get_matches(
    request: MatchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-matched jobs for a candidate
    
    - **job_type**: Type of jobs to match (corporate/small/both)
    - **limit**: Maximum number of matches to return
    - **min_score**: Minimum match score threshold (0.0-1.0)
    - Supports filtering by categories, locations, salary, etc.
    """
    # Implementation here
    pass
```

---

## Schema Validation Features

All schemas include:

1. **Type validation** - Ensures correct data types
2. **Range validation** - Min/max values for numbers
3. **Length validation** - String length constraints
4. **Format validation** - Email, phone, date formats
5. **Custom validators** - Business logic validation
6. **Examples** - Schema examples for documentation
7. **Descriptions** - Field-level documentation

---

## Best Practices

1. **Use Enums for fixed choices** - Ensures consistency
2. **Provide examples** - Helps with documentation and testing
3. **Add descriptions** - Documents the purpose of each field
4. **Use Optional appropriately** - Required vs optional fields
5. **Validate ranges** - Use `ge`, `le` for numeric constraints
6. **Cross-field validation** - Use validators for dependent fields
7. **Keep schemas DRY** - Use base schemas and inheritance

---

## Testing Schemas

```python
import pytest
from app.schemas import MatchRequest, JobType

def test_match_request_validation():
    # Valid request
    request = MatchRequest(
        job_type=JobType.CORPORATE,
        limit=20,
        min_score=0.4
    )
    assert request.limit == 20
    
    # Invalid request (limit too high)
    with pytest.raises(ValueError):
        MatchRequest(
            job_type=JobType.CORPORATE,
            limit=200,  # Max is 100
            min_score=0.4
        )
```

---

## Future Enhancements

Planned schema improvements:

1. **ML Personalization** - Additional fields for ML-based personalization
2. **Skill Embeddings** - Support for semantic skill matching
3. **Feedback Loop** - Schemas for user feedback and learning
4. **Advanced Filters** - More sophisticated filtering options
5. **Batch Operations** - Schemas for bulk matching operations

---

## Related Documentation

- **Master Plan**: `MATCHING_SYSTEM_MASTER_PLAN.md` - System architecture
- **API Documentation**: Auto-generated from these schemas via FastAPI
- **Database Models**: `app/models/` - SQLAlchemy models
- **Matching Service**: `app/services/matching_service.py` - Business logic

---

## Support

For questions or issues with schemas:
1. Check the examples in each schema's `Config.schema_extra`
2. Review FastAPI auto-generated docs at `/docs`
3. Consult the Master Plan for business requirements
4. Check the database models for field definitions
