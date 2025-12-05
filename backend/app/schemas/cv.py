"""
Pydantic schemas for CV (Candidate Resume) models
"""
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict
from datetime import date, datetime
from enum import Enum


class EducationLevel(str, Enum):
    """Education level classifications"""
    GRADE_7 = "Grade 7"
    GRADE_9 = "Grade 9"
    GRADE_10 = "Grade 10"
    GRADE_12 = "Grade 12"
    CERTIFICATE = "Certificate"
    DIPLOMA = "Diploma"
    BACHELORS = "Bachelor's"
    MASTERS = "Master's"
    DOCTORATE = "Doctorate"
    PHD = "PhD"
    PROFESSIONAL = "Professional"
    OTHER = "Other"


class EmploymentStatus(str, Enum):
    """Current employment status"""
    EMPLOYED = "Employed"
    UNEMPLOYED = "Unemployed"
    SELF_EMPLOYED = "Self-Employed"
    STUDENT = "Student"
    FREELANCER = "Freelancer"


class CVBase(BaseModel):
    """Base CV schema with common attributes"""
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    
    # Demographics
    gender: Optional[str] = Field(None, description="Gender")
    date_of_birth: Optional[date] = Field(None, description="Date of birth")
    nationality: Optional[str] = Field("Zambian", description="Nationality")
    
    # Location
    city: str = Field(..., description="City of residence")
    province: str = Field(..., description="Province")
    
    # Education
    education_level: Optional[str] = Field(None, description="Highest education level")
    institution: Optional[str] = Field(None, description="Educational institution")
    graduation_year: Optional[int] = Field(None, ge=1950, le=2030, description="Graduation year")
    major: Optional[str] = Field(None, description="Field of study/major")
    certifications: Optional[str] = Field(None, description="Professional certifications")
    
    # Languages
    languages: Optional[str] = Field(None, description="Languages spoken (comma-separated)")
    language_proficiency: Optional[str] = Field(None, description="Language proficiency level")
    
    # Experience
    total_years_experience: float = Field(0.0, ge=0.0, le=50.0, description="Total years of experience")
    current_job_title: Optional[str] = Field(None, description="Current or most recent job title")
    employment_status: Optional[str] = Field(None, description="Current employment status")
    
    # Preferences
    preferred_job_type: Optional[str] = Field(None, description="Preferred job type")
    preferred_location: Optional[str] = Field(None, description="Preferred work location")
    salary_expectation_min: Optional[float] = Field(None, ge=0, description="Minimum salary expectation (ZMW)")
    salary_expectation_max: Optional[float] = Field(None, ge=0, description="Maximum salary expectation (ZMW)")
    availability: Optional[str] = Field(None, description="Availability to start")
    
    # Skills
    skills_technical: str = Field("", description="Technical skills (comma-separated)")
    skills_soft: str = Field("", description="Soft skills (comma-separated)")
    
    @validator('salary_expectation_max')
    def validate_salary_range(cls, v, values):
        """Ensure max salary is greater than min salary"""
        if v is not None and 'salary_expectation_min' in values and values['salary_expectation_min'] is not None:
            if v < values['salary_expectation_min']:
                raise ValueError('salary_expectation_max must be greater than or equal to salary_expectation_min')
        return v


class CVCreate(CVBase):
    """Schema for creating a new CV"""
    work_experience_json: Optional[List[Dict]] = Field(None, description="Structured work experience")
    projects_json: Optional[List[Dict]] = Field(None, description="Projects portfolio")
    references_json: Optional[List[Dict]] = Field(None, description="Professional references")
    
    class Config:
        schema_extra = {
            "example": {
                "full_name": "John Banda",
                "email": "john.banda@example.com",
                "phone": "260977123456",
                "gender": "Male",
                "date_of_birth": "1992-05-15",
                "nationality": "Zambian",
                "city": "Lusaka",
                "province": "Lusaka",
                "education_level": "Bachelor's",
                "institution": "University of Zambia",
                "graduation_year": 2015,
                "major": "Computer Science",
                "certifications": "AWS Certified Developer, PMP",
                "languages": "English,Bemba,Nyanja",
                "language_proficiency": "Fluent",
                "total_years_experience": 6.0,
                "current_job_title": "Software Developer",
                "employment_status": "Employed",
                "preferred_job_type": "Full-time",
                "preferred_location": "Lusaka",
                "salary_expectation_min": 15000.0,
                "salary_expectation_max": 22000.0,
                "availability": "1 month",
                "skills_technical": "Python, JavaScript, React, SQL, Docker",
                "skills_soft": "Problem-solving, Communication, Teamwork"
            }
        }


class CVUpdate(BaseModel):
    """Schema for updating an existing CV (all fields optional)"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    city: Optional[str] = None
    province: Optional[str] = None
    education_level: Optional[EducationLevel] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = Field(None, ge=1950, le=2030)
    major: Optional[str] = None
    certifications: Optional[str] = None
    languages: Optional[str] = None
    language_proficiency: Optional[str] = None
    total_years_experience: Optional[float] = Field(None, ge=0.0, le=50.0)
    current_job_title: Optional[str] = None
    employment_status: Optional[EmploymentStatus] = None
    preferred_job_type: Optional[str] = None
    preferred_location: Optional[str] = None
    salary_expectation_min: Optional[float] = Field(None, ge=0)
    salary_expectation_max: Optional[float] = Field(None, ge=0)
    availability: Optional[str] = None
    skills_technical: Optional[str] = None
    skills_soft: Optional[str] = None
    work_experience_json: Optional[List[Dict]] = None
    projects_json: Optional[List[Dict]] = None
    references_json: Optional[List[Dict]] = None


class CVResponse(CVBase):
    """Schema for CV response"""
    cv_id: str = Field(..., description="Unique CV identifier")
    work_experience_json: Optional[List[Dict]] = Field(None, description="Structured work experience")
    projects_json: Optional[List[Dict]] = Field(None, description="Projects portfolio")
    references_json: Optional[List[Dict]] = Field(None, description="Professional references")
    resume_quality_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="CV quality score")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "cv_id": "cv_001",
                "full_name": "John Banda",
                "email": "john.banda@example.com",
                "phone": "260977123456",
                "city": "Lusaka",
                "province": "Lusaka",
                "education_level": "Bachelor's",
                "institution": "University of Zambia",
                "graduation_year": 2015,
                "major": "Computer Science",
                "total_years_experience": 6.0,
                "current_job_title": "Software Developer",
                "employment_status": "Employed",
                "skills_technical": "Python, JavaScript, React",
                "resume_quality_score": 0.85
            }
        }


class CVListResponse(BaseModel):
    """Response schema for listing CVs"""
    total: int = Field(..., description="Total number of CVs")
    cvs: List[CVResponse] = Field(..., description="List of CVs")
    page: int = Field(1, description="Current page number")
    page_size: int = Field(20, description="Number of items per page")
    has_more: bool = Field(False, description="More results available")


class WorkExperience(BaseModel):
    """Schema for work experience entry"""
    company: str = Field(..., description="Company name")
    position: str = Field(..., description="Job position/title")
    start_date: date = Field(..., description="Start date")
    end_date: Optional[date] = Field(None, description="End date (null if current)")
    description: Optional[str] = Field(None, description="Job description and responsibilities")
    location: Optional[str] = Field(None, description="Job location")
    
    class Config:
        schema_extra = {
            "example": {
                "company": "TechCorp Zambia",
                "position": "Software Developer",
                "start_date": "2020-01-15",
                "end_date": "2023-06-30",
                "description": "Developed web applications using Python and React",
                "location": "Lusaka"
            }
        }


class Project(BaseModel):
    """Schema for project entry"""
    title: str = Field(..., description="Project title")
    description: str = Field(..., description="Project description")
    technologies: Optional[str] = Field(None, description="Technologies used")
    start_date: Optional[date] = Field(None, description="Start date")
    end_date: Optional[date] = Field(None, description="End date")
    url: Optional[str] = Field(None, description="Project URL/link")
    
    class Config:
        schema_extra = {
            "example": {
                "title": "E-commerce Platform",
                "description": "Built a full-stack e-commerce platform",
                "technologies": "Python, Django, PostgreSQL, React",
                "start_date": "2022-03-01",
                "end_date": "2022-08-30",
                "url": "https://github.com/user/ecommerce"
            }
        }


class Reference(BaseModel):
    """Schema for professional reference"""
    name: str = Field(..., description="Reference name")
    position: Optional[str] = Field(None, description="Their position/title")
    company: Optional[str] = Field(None, description="Their company")
    phone: Optional[str] = Field(None, description="Contact phone")
    email: Optional[EmailStr] = Field(None, description="Contact email")
    relationship: Optional[str] = Field(None, description="Relationship to candidate")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Mary Mwanza",
                "position": "Senior Manager",
                "company": "TechCorp Zambia",
                "phone": "260977987654",
                "email": "mary.mwanza@techcorp.zm",
                "relationship": "Former supervisor"
            }
        }
