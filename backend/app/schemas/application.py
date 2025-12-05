"""
Application Schemas - Pydantic models for API validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    """Application status enum"""
    NEW = "new"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    HIRED = "hired"
    REJECTED = "rejected"


class ApplicationCreate(BaseModel):
    """Create new application"""
    job_id: str = Field(..., description="Job ID")
    job_type: str = Field(..., description="Job type: corporate or small")
    cover_letter: Optional[str] = Field(None, description="Cover letter text")
    
    class Config:
        from_attributes = True


class ApplicationUpdate(BaseModel):
    """Update application"""
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None
    interview_notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    tags: Optional[List[str]] = None
    
    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    """Application response"""
    id: int
    cv_id: str
    job_id: str
    job_type: str
    status: ApplicationStatus
    match_score: Optional[float] = None
    cover_letter: Optional[str] = None
    notes: Optional[str] = None
    applied_at: datetime
    updated_at: datetime
    interview_date: Optional[datetime] = None
    interview_notes: Optional[str] = None
    rating: Optional[int] = None
    tags: Optional[List[str]] = None
    
    # Populated from joins
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    candidate_location: Optional[str] = None
    candidate_photo: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    
    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    """List of applications"""
    total: int
    applications: List[ApplicationResponse]
    page: int
    page_size: int
    has_more: bool
    
    class Config:
        from_attributes = True


class ApplicationStats(BaseModel):
    """Application statistics"""
    total: int
    new: int
    screening: int
    interview: int
    offer: int
    hired: int
    rejected: int
    avg_match_score: Optional[float] = None
    
    class Config:
        from_attributes = True
