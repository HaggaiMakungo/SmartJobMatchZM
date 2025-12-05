"""
CAMSS 2.0 - Matching API Schemas
=================================
Pydantic models for matching API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class MatchRequest(BaseModel):
    """Request parameters for finding job matches."""
    
    job_type: str = Field(
        default='both',
        description="Type of jobs to match: 'corp', 'small', or 'both'"
    )
    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of matches to return (1-100)"
    )
    min_score: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Minimum match score threshold (0.0-1.0)"
    )
    filters: Optional[Dict] = Field(
        default=None,
        description="Additional filters (location_city, category, min_salary)"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "job_type": "both",
                "limit": 20,
                "min_score": 0.4,
                "filters": {
                    "location_city": "Lusaka",
                    "min_salary": 5000
                }
            }
        }


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class MatchBreakdown(BaseModel):
    """Breakdown of match score components."""
    
    location: float = Field(..., description="Location match score (0.0-1.0)")
    salary: float = Field(..., description="Salary alignment score (0.0-1.0)")
    skills: float = Field(..., description="Skills overlap score (0.0-1.0)")
    experience: float = Field(..., description="Experience match score (0.0-1.0)")
    context_boost: float = Field(..., description="Contextual boost multiplier")


class JobMatch(BaseModel):
    """Individual job match result."""
    
    # Job identification
    job_id: str = Field(..., description="Unique job identifier")
    job_type: str = Field(..., description="'corp' or 'small'")
    title: str = Field(..., description="Job title")
    company: str = Field(..., description="Company/employer name")
    
    # Location
    location_city: Optional[str] = Field(None, description="City location")
    
    # Compensation (one of these will be present)
    salary_max_zmw: Optional[float] = Field(None, description="Max salary (corporate jobs)")
    budget: Optional[float] = Field(None, description="Budget (small jobs)")
    
    # Job details
    employment_type: Optional[str] = Field(None, description="Full-time, Part-time, Contract")
    duration: Optional[str] = Field(None, description="Duration (small jobs)")
    
    # Match scoring
    match_score: float = Field(..., description="Overall match score (0.0-1.0)")
    match_breakdown: MatchBreakdown = Field(..., description="Score breakdown by component")
    match_reasons: List[str] = Field(..., description="Top reasons for match")
    
    # Skills analysis
    matched_skills: List[str] = Field(..., description="Skills that candidate has")
    missing_skills: List[str] = Field(..., description="Skills that candidate lacks")
    
    # Ranking
    rank: int = Field(..., description="Position in ranked results (1-based)")
    
    class Config:
        schema_extra = {
            "example": {
                "job_id": "JOB000123",
                "job_type": "corp",
                "title": "Software Engineer",
                "company": "Tech Corp Zambia",
                "location_city": "Lusaka",
                "salary_max_zmw": 15000,
                "employment_type": "Full-time",
                "match_score": 0.82,
                "match_breakdown": {
                    "location": 1.0,
                    "salary": 0.95,
                    "skills": 0.72,
                    "experience": 0.7,
                    "context_boost": 1.0
                },
                "match_reasons": [
                    "Located in same city (Lusaka)",
                    "Salary matches expectations (ZMW 15,000)",
                    "Good skills match (8 relevant skills)"
                ],
                "matched_skills": ["Python", "Django", "PostgreSQL", "REST API"],
                "missing_skills": ["Docker", "Kubernetes"],
                "rank": 1
            }
        }


class MatchResponse(BaseModel):
    """Complete response for match request."""
    
    # Candidate info
    cv_id: str = Field(..., description="Candidate CV ID")
    candidate_name: str = Field(..., description="Candidate full name")
    candidate_location: str = Field(..., description="Candidate location")
    
    # Results
    matches: List[JobMatch] = Field(..., description="List of matched jobs")
    total_matches: int = Field(..., description="Total number of matches found")
    
    # Metadata
    filters_applied: Dict = Field(..., description="Filters that were applied")
    generated_at: str = Field(..., description="Timestamp of response generation")
    
    class Config:
        schema_extra = {
            "example": {
                "cv_id": "1127",
                "candidate_name": "John Mwansa",
                "candidate_location": "Lusaka, Lusaka Province",
                "matches": [
                    {
                        "job_id": "JOB000123",
                        "job_type": "corp",
                        "title": "Software Engineer",
                        "company": "Tech Corp Zambia",
                        "location_city": "Lusaka",
                        "salary_max_zmw": 15000,
                        "employment_type": "Full-time",
                        "match_score": 0.82,
                        "match_breakdown": {
                            "location": 1.0,
                            "salary": 0.95,
                            "skills": 0.72,
                            "experience": 0.7,
                            "context_boost": 1.0
                        },
                        "match_reasons": [
                            "Located in same city (Lusaka)",
                            "Salary matches expectations",
                            "Good skills match"
                        ],
                        "matched_skills": ["Python", "Django"],
                        "missing_skills": ["Docker"],
                        "rank": 1
                    }
                ],
                "total_matches": 87,
                "filters_applied": {},
                "generated_at": "2024-11-18T10:30:00"
            }
        }


class ErrorResponse(BaseModel):
    """Error response."""
    
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    
    class Config:
        schema_extra = {
            "example": {
                "error": "CV not found",
                "detail": "No CV exists with ID: 1234"
            }
        }
