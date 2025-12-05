"""
Pydantic schemas for Job models (Corporate and Small Jobs)
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# ============================================================================
# CORPORATE JOB SCHEMAS
# ============================================================================

class CollarType(str, Enum):
    """Collar classification for jobs"""
    WHITE = "white"  # Professional/office
    BLUE = "blue"    # Manual/technical
    PINK = "pink"    # Service/creative
    GREY = "grey"    # Tech/engineering
    GREEN = "green"  # Environmental


class EmploymentType(str, Enum):
    """Type of employment"""
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    TEMPORARY = "Temporary"


class CorporateJobBase(BaseModel):
    """Base schema for corporate jobs"""
    title: str = Field(..., min_length=3, max_length=200, description="Job title")
    company: str = Field(..., min_length=2, max_length=200, description="Company name")
    category: str = Field(..., description="Job category/industry")
    collar_type: CollarType = Field(..., description="Collar classification")
    
    # Job details
    description: str = Field(..., min_length=50, description="Job description")
    key_responsibilities: Optional[str] = Field(None, description="Key responsibilities")
    
    # Requirements
    required_skills: str = Field(..., description="Required skills (comma-separated)")
    preferred_skills: Optional[str] = Field(None, description="Preferred skills (comma-separated)")
    required_experience_years: float = Field(0.0, ge=0.0, le=30.0, description="Required years of experience")
    required_education: str = Field(..., description="Required education level")
    preferred_certifications: Optional[str] = Field(None, description="Preferred certifications")
    
    # Location
    location_city: str = Field(..., description="Job location city")
    location_province: str = Field(..., description="Job location province")
    
    # Compensation
    salary_min_zmw: float = Field(..., ge=0, description="Minimum salary (ZMW)")
    salary_max_zmw: float = Field(..., ge=0, description="Maximum salary (ZMW)")
    
    # Employment terms
    employment_type: EmploymentType = Field(..., description="Type of employment")
    work_schedule: Optional[str] = Field(None, description="Work schedule details")
    language_requirements: Optional[str] = Field("English", description="Language requirements")
    
    # Additional info
    benefits: Optional[str] = Field(None, description="Employee benefits")
    growth_opportunities: Optional[str] = Field(None, description="Career growth opportunities")
    company_size: Optional[str] = Field(None, description="Company size (Small/Medium/Large)")
    industry_sector: Optional[str] = Field(None, description="Industry sector")
    
    @validator('salary_max_zmw')
    def validate_salary_range(cls, v, values):
        """Ensure max salary is greater than min salary"""
        if 'salary_min_zmw' in values and v < values['salary_min_zmw']:
            raise ValueError('salary_max_zmw must be greater than or equal to salary_min_zmw')
        return v


class CorporateJobCreate(CorporateJobBase):
    """Schema for creating a corporate job"""
    application_deadline: Optional[date] = Field(None, description="Application deadline")
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Senior Software Engineer",
                "company": "TechZambia Ltd",
                "category": "Information Technology",
                "collar_type": "grey",
                "description": "We are seeking an experienced software engineer to join our growing team...",
                "key_responsibilities": "Design and develop scalable applications, Lead technical discussions, Mentor junior developers",
                "required_skills": "Python, JavaScript, SQL, Git, Docker",
                "preferred_skills": "React, AWS, Kubernetes",
                "required_experience_years": 5.0,
                "required_education": "Bachelor's",
                "preferred_certifications": "AWS Certified Developer, PMP",
                "location_city": "Lusaka",
                "location_province": "Lusaka",
                "salary_min_zmw": 18000.0,
                "salary_max_zmw": 25000.0,
                "employment_type": "Full-time",
                "work_schedule": "Monday-Friday, 8:00-17:00",
                "language_requirements": "English (Fluent)",
                "benefits": "Health insurance, Pension, Professional development budget",
                "growth_opportunities": "Path to Lead Engineer and Engineering Manager roles",
                "company_size": "Medium",
                "industry_sector": "Technology",
                "application_deadline": "2024-12-31"
            }
        }


class CorporateJobUpdate(BaseModel):
    """Schema for updating a corporate job (all fields optional)"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    company: Optional[str] = Field(None, min_length=2, max_length=200)
    category: Optional[str] = None
    collar_type: Optional[CollarType] = None
    description: Optional[str] = Field(None, min_length=50)
    key_responsibilities: Optional[str] = None
    required_skills: Optional[str] = None
    preferred_skills: Optional[str] = None
    required_experience_years: Optional[float] = Field(None, ge=0.0, le=30.0)
    required_education: Optional[str] = None
    preferred_certifications: Optional[str] = None
    location_city: Optional[str] = None
    location_province: Optional[str] = None
    salary_min_zmw: Optional[float] = Field(None, ge=0)
    salary_max_zmw: Optional[float] = Field(None, ge=0)
    employment_type: Optional[EmploymentType] = None
    work_schedule: Optional[str] = None
    language_requirements: Optional[str] = None
    application_deadline: Optional[date] = None
    benefits: Optional[str] = None
    growth_opportunities: Optional[str] = None
    company_size: Optional[str] = None
    industry_sector: Optional[str] = None


class CorporateJobResponse(CorporateJobBase):
    """Schema for corporate job response"""
    job_id: str = Field(..., description="Unique job identifier")
    posted_date: date = Field(..., description="Job posting date")
    application_deadline: Optional[date] = Field(None, description="Application deadline")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "job_id": "job_001",
                "title": "Senior Software Engineer",
                "company": "TechZambia Ltd",
                "category": "Information Technology",
                "collar_type": "grey",
                "description": "We are seeking an experienced software engineer...",
                "required_skills": "Python, JavaScript, SQL",
                "required_experience_years": 5.0,
                "required_education": "Bachelor's",
                "location_city": "Lusaka",
                "location_province": "Lusaka",
                "salary_min_zmw": 18000.0,
                "salary_max_zmw": 25000.0,
                "employment_type": "Full-time",
                "posted_date": "2024-11-01"
            }
        }


class CorporateJobListResponse(BaseModel):
    """Response schema for listing corporate jobs"""
    total: int = Field(..., description="Total number of jobs")
    jobs: List[CorporateJobResponse] = Field(..., description="List of jobs")
    page: int = Field(1, description="Current page number")
    page_size: int = Field(20, description="Number of items per page")
    has_more: bool = Field(False, description="More results available")


# ============================================================================
# SMALL JOB SCHEMAS
# ============================================================================

class PaymentType(str, Enum):
    """Payment type for small jobs"""
    FIXED = "Fixed"
    HOURLY = "Hourly"
    DAILY = "Daily"
    MILESTONE = "Milestone"


class JobStatus(str, Enum):
    """Status of small job"""
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    ON_HOLD = "On Hold"


class SmallJobBase(BaseModel):
    """Base schema for small jobs/gigs"""
    title: str = Field(..., min_length=3, max_length=200, description="Task/gig title")
    category: str = Field(..., description="Task category")
    description: str = Field(..., min_length=20, description="Task description")
    
    # Location
    province: str = Field(..., description="Province")
    location: str = Field(..., description="Specific location/area")
    
    # Compensation
    budget: float = Field(..., ge=0, description="Budget/payment for task (ZMW)")
    payment_type: PaymentType = Field(PaymentType.FIXED, description="Payment type")
    
    # Job details
    duration: Optional[str] = Field(None, description="Expected duration")
    status: JobStatus = Field(JobStatus.OPEN, description="Job status")


class SmallJobCreate(SmallJobBase):
    """Schema for creating a small job"""
    posted_by: str = Field(..., description="User ID of poster")
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Website Landing Page Design",
                "category": "Web Development",
                "description": "Need a modern, responsive landing page for a startup. Should include hero section, features, and contact form.",
                "province": "Lusaka",
                "location": "Lusaka CBD",
                "budget": 2500.0,
                "payment_type": "Fixed",
                "duration": "1 week",
                "status": "Open",
                "posted_by": "user_123"
            }
        }


class SmallJobUpdate(BaseModel):
    """Schema for updating a small job (all fields optional)"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    category: Optional[str] = None
    description: Optional[str] = Field(None, min_length=20)
    province: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[float] = Field(None, ge=0)
    payment_type: Optional[PaymentType] = None
    duration: Optional[str] = None
    status: Optional[JobStatus] = None


class SmallJobResponse(SmallJobBase):
    """Schema for small job response"""
    id: str = Field(..., description="Unique job identifier")
    posted_by: str = Field(..., description="User ID of poster")
    date_posted: date = Field(..., description="Posting date")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "gig_042",
                "title": "Website Landing Page Design",
                "category": "Web Development",
                "description": "Need a modern, responsive landing page...",
                "province": "Lusaka",
                "location": "Lusaka CBD",
                "budget": 2500.0,
                "payment_type": "Fixed",
                "duration": "1 week",
                "status": "Open",
                "posted_by": "user_123",
                "date_posted": "2024-11-10"
            }
        }


class SmallJobListResponse(BaseModel):
    """Response schema for listing small jobs"""
    total: int = Field(..., description="Total number of jobs")
    jobs: List[SmallJobResponse] = Field(..., description="List of jobs")
    page: int = Field(1, description="Current page number")
    page_size: int = Field(20, description="Number of items per page")
    has_more: bool = Field(False, description="More results available")


# ============================================================================
# COMMON SCHEMAS
# ============================================================================

class JobSearchRequest(BaseModel):
    """Request schema for searching jobs"""
    query: Optional[str] = Field(None, description="Search query")
    categories: Optional[List[str]] = Field(None, description="Filter by categories")
    locations: Optional[List[str]] = Field(None, description="Filter by locations")
    min_salary: Optional[float] = Field(None, ge=0, description="Minimum salary")
    max_salary: Optional[float] = Field(None, ge=0, description="Maximum salary")
    employment_types: Optional[List[str]] = Field(None, description="Filter by employment types")
    experience_min: Optional[float] = Field(None, ge=0, description="Minimum experience required")
    experience_max: Optional[float] = Field(None, ge=0, description="Maximum experience required")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    
    class Config:
        schema_extra = {
            "example": {
                "query": "software developer",
                "categories": ["Information Technology"],
                "locations": ["Lusaka", "Copperbelt"],
                "min_salary": 10000,
                "max_salary": 30000,
                "employment_types": ["Full-time"],
                "experience_min": 2,
                "experience_max": 10,
                "page": 1,
                "page_size": 20
            }
        }
