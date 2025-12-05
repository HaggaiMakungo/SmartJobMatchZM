# Schema Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Request/Response Flow                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Pydantic Schemas                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   match.py   │  │    cv.py     │  │   job.py     │         │
│  │              │  │              │  │              │         │
│  │  CAMSS 2.0   │  │  Candidate   │  │  Job Posts   │         │
│  │  Matching    │  │  Profiles    │  │  (Corp+Gig)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Endpoints                             │
│                   (Validated & Documented)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Match Schemas (match.py) - CAMSS 2.0

```
MatchRequest                          MatchResponse
├─ job_type: JobType                 ├─ success: bool
├─ limit: int (1-100)                ├─ job_type: JobType
├─ min_score: float (0.0-1.0)       ├─ total_matches: int
├─ Filters:                          ├─ returned_matches: int
│  ├─ categories: List[str]          ├─ corporate_matches: List[CorporateJobMatch]
│  ├─ locations: List[str]           ├─ small_job_matches: List[SmallJobMatch]
│  ├─ salary_min/max: float          ├─ cv_id: str
│  ├─ collar_types: List[CollarType] ├─ filters_applied: Dict
│  └─ employment_types: List[str]    ├─ execution_time_ms: float
├─ Sorting:                          └─ has_more: bool
│  ├─ sort_by: SortBy
│  └─ sort_order: "asc"|"desc"
└─ Pagination:
   └─ offset: int

            │
            ▼
┌───────────────────────────────────────────┐
│         CorporateJobMatch                  │
│                                           │
│  ├─ job_id, title, company               │
│  ├─ category, collar_type                │
│  ├─ location, salary_range               │
│  ├─ final_score: float                   │
│  ├─ component_scores: ComponentScores    │───┐
│  ├─ explanation: str                     │   │
│  ├─ match_reasons: List[str]             │   │
│  └─ employment_type, requirements        │   │
└───────────────────────────────────────────┘   │
                                                 │
┌───────────────────────────────────────────┐   │
│          SmallJobMatch                     │   │
│                                           │   │
│  ├─ job_id, title, category              │   │
│  ├─ location, budget, duration           │   │
│  ├─ final_score: float                   │   │
│  ├─ component_scores: ComponentScores    │───┤
│  ├─ explanation: str                     │   │
│  ├─ match_reasons: List[str]             │   │
│  └─ status, payment_type                 │   │
└───────────────────────────────────────────┘   │
                                                 │
            ┌────────────────────────────────────┘
            ▼
┌───────────────────────────────────────────┐
│        ComponentScores                     │
│                                           │
│  Corporate Jobs (6 components):           │
│  ├─ qualification: float (0.0-1.0)       │
│  ├─ experience: float (0.0-1.0)          │
│  ├─ skills: float (0.0-1.0)              │
│  ├─ location: float (0.0-1.0)            │
│  ├─ category: float (0.0-1.0)            │
│  └─ personalization: float (0.0-1.0)     │
│                                           │
│  Small Jobs (3 components):               │
│  ├─ skills: float (0.0-1.0)              │
│  ├─ location: float (0.0-1.0)            │
│  └─ availability: float (0.0-1.0)        │
└───────────────────────────────────────────┘
```

## CV Schemas (cv.py)

```
CVCreate / CVUpdate                    CVResponse
├─ full_name: str                     ├─ cv_id: str
├─ email: EmailStr                    ├─ All CVCreate fields
├─ phone: str                         ├─ resume_quality_score: float
├─ Demographics:                      └─ (ORM mode enabled)
│  ├─ gender, date_of_birth
│  └─ nationality
├─ Location:
│  ├─ city
│  └─ province
├─ Education:
│  ├─ education_level: EducationLevel
│  ├─ institution
│  ├─ graduation_year (1950-2030)
│  ├─ major
│  └─ certifications
├─ Languages:
│  ├─ languages
│  └─ language_proficiency
├─ Experience:
│  ├─ total_years_experience (0-50)
│  ├─ current_job_title
│  └─ employment_status: EmploymentStatus
├─ Preferences:
│  ├─ preferred_job_type
│  ├─ preferred_location
│  ├─ salary_expectation_min/max
│  └─ availability
├─ Skills:
│  ├─ skills_technical
│  └─ skills_soft
└─ Structured Data:
   ├─ work_experience_json: List[WorkExperience]
   ├─ projects_json: List[Project]
   └─ references_json: List[Reference]

Sub-Schemas:
├─ WorkExperience           ├─ Project                 ├─ Reference
│  ├─ company              │  ├─ title                │  ├─ name
│  ├─ position             │  ├─ description          │  ├─ position
│  ├─ start_date           │  ├─ technologies         │  ├─ company
│  ├─ end_date             │  ├─ start/end_date       │  ├─ phone
│  ├─ description          │  └─ url                  │  ├─ email
│  └─ location             │                          │  └─ relationship
```

## Job Schemas (job.py)

```
┌─────────────────────────────────────────────────────────────┐
│                    Corporate Jobs                            │
└─────────────────────────────────────────────────────────────┘

CorporateJobCreate / CorporateJobUpdate     CorporateJobResponse
├─ title: str (3-200 chars)                ├─ job_id: str
├─ company: str                            ├─ All CorporateJobCreate fields
├─ category: str                           ├─ posted_date: date
├─ collar_type: CollarType                 └─ (ORM mode enabled)
├─ description: str (min 50 chars)
├─ key_responsibilities: str
├─ Requirements:
│  ├─ required_skills: str
│  ├─ preferred_skills: str
│  ├─ required_experience_years (0-30)
│  ├─ required_education: str
│  └─ preferred_certifications: str
├─ Location:
│  ├─ location_city
│  └─ location_province
├─ Compensation:
│  ├─ salary_min_zmw
│  └─ salary_max_zmw
├─ Employment:
│  ├─ employment_type: EmploymentType
│  ├─ work_schedule
│  └─ language_requirements
└─ Additional:
   ├─ benefits
   ├─ growth_opportunities
   ├─ company_size
   ├─ industry_sector
   └─ application_deadline

┌─────────────────────────────────────────────────────────────┐
│                     Small Jobs (Gigs)                        │
└─────────────────────────────────────────────────────────────┘

SmallJobCreate / SmallJobUpdate            SmallJobResponse
├─ title: str (3-200 chars)               ├─ id: str
├─ category: str                          ├─ All SmallJobCreate fields
├─ description: str (min 20 chars)        ├─ date_posted: date
├─ Location:                              └─ (ORM mode enabled)
│  ├─ province
│  └─ location
├─ Compensation:
│  ├─ budget: float
│  └─ payment_type: PaymentType
└─ Details:
   ├─ duration: str
   ├─ status: JobStatus
   └─ posted_by: str
```

## Enums Hierarchy

```
JobType              CollarType           SortBy
├─ CORPORATE        ├─ WHITE             ├─ SCORE
├─ SMALL            ├─ BLUE              ├─ SALARY
└─ BOTH             ├─ PINK              ├─ POSTED_DATE
                    ├─ GREY              └─ RELEVANCE
                    └─ GREEN

EducationLevel       EmploymentStatus     EmploymentType
├─ CERTIFICATE      ├─ EMPLOYED          ├─ FULL_TIME
├─ DIPLOMA          ├─ UNEMPLOYED        ├─ PART_TIME
├─ BACHELORS        ├─ SELF_EMPLOYED     ├─ CONTRACT
├─ MASTERS          ├─ STUDENT           ├─ INTERNSHIP
├─ DOCTORATE        └─ FREELANCER        └─ TEMPORARY
├─ PHD
└─ PROFESSIONAL

PaymentType          JobStatus
├─ FIXED            ├─ OPEN
├─ HOURLY           ├─ IN_PROGRESS
├─ DAILY            ├─ COMPLETED
└─ MILESTONE        ├─ CANCELLED
                    └─ ON_HOLD
```

## Validation Flow

```
┌──────────────────┐
│  API Request     │
│  (JSON data)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Pydantic Schema  │
│   Validation     │◄─── Type checking
│                  │◄─── Range validation
│                  │◄─── Format validation
│                  │◄─── Custom validators
│                  │◄─── Cross-field validation
└────────┬─────────┘
         │
         ├─────── ✅ Valid
         │        │
         │        ▼
         │   ┌──────────────┐
         │   │   Schema     │
         │   │   Object     │
         │   └──────────────┘
         │
         └─────── ❌ Invalid
                  │
                  ▼
             ┌──────────────┐
             │ ValidationError│
             │ (422 response)│
             └──────────────┘
```

## CAMSS 2.0 Scoring Flow

```
┌────────────────────────────────────────────────────────────┐
│                   Corporate Job Matching                    │
└────────────────────────────────────────────────────────────┘

CV Data + Job Data
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│               Calculate 6 Components                      │
│                                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │ Qualification │  │  Experience   │  │   Skills    │ │
│  │    (16.67%)   │  │   (16.67%)    │  │  (16.67%)   │ │
│  └───────┬───────┘  └───────┬───────┘  └──────┬──────┘ │
│          │                  │                  │        │
│          └──────────────────┴──────────────────┘        │
│                            │                            │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │   Location    │  │   Category    │  │Personal-    │ │
│  │   (16.67%)    │  │   (16.67%)    │  │ization      │ │
│  └───────┬───────┘  └───────┬───────┘  │ (16.67%)    │ │
│          │                  │           └──────┬──────┘ │
│          └──────────────────┴──────────────────┘        │
└───────────────────────────────┬──────────────────────────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │   Final Score    │
                      │   (Average of    │
                      │   all 6 scores)  │
                      └────────┬─────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  CorporateJobMatch   │
                    │  with ComponentScores│
                    └──────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    Small Job Matching                       │
└────────────────────────────────────────────────────────────┘

CV Data + Gig Data
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│               Calculate 3 Components                      │
│                                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │    Skills     │  │   Location    │  │Availability │ │
│  │     (40%)     │  │     (30%)     │  │    (30%)    │ │
│  └───────┬───────┘  └───────┬───────┘  └──────┬──────┘ │
│          │                  │                  │        │
│          └──────────────────┴──────────────────┘        │
└───────────────────────────────┬──────────────────────────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │  Weighted Score  │
                      │  (Weighted avg   │
                      │   of 3 scores)   │
                      └────────┬─────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   SmallJobMatch      │
                    │  with ComponentScores│
                    └──────────────────────┘
```

## Data Flow Example

```
1. User Request
   └─> POST /api/v1/match
       Body: MatchRequest {
         job_type: "corporate",
         limit: 20,
         min_score: 0.4,
         categories: ["IT"]
       }

2. Pydantic Validation
   ├─> Validates job_type is valid enum ✓
   ├─> Validates limit is 1-100 ✓
   ├─> Validates min_score is 0.0-1.0 ✓
   └─> Returns validated MatchRequest object

3. Matching Service
   ├─> Gets CV from database
   ├─> Gets all jobs matching filters
   ├─> Scores each job (CAMSS 2.0)
   └─> Returns list of matches

4. Schema Conversion
   ├─> Convert to CorporateJobMatch objects
   ├─> Include ComponentScores
   ├─> Add explanations and reasons
   └─> Wrap in MatchResponse

5. API Response
   └─> MatchResponse {
         success: true,
         job_type: "corporate",
         total_matches: 45,
         corporate_matches: [
           CorporateJobMatch { ... },
           ...
         ]
       }

6. FastAPI Auto-Documentation
   └─> OpenAPI spec at /docs
       Shows all schemas, validations, examples
```
