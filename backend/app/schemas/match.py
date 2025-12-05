"""
Pydantic schemas for matching API
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Literal, Optional
from datetime import datetime


class MatchRequest(BaseModel):
    """Request schema for matching endpoint"""
    cv_id: str = Field(..., description="CV identifier")
    job_type: Literal["corporate", "small"] = Field(..., description="Type of jobs to match")
    limit: int = Field(default=20, ge=1, le=100, description="Maximum number of matches")
    min_score: float = Field(default=0.3, ge=0.0, le=1.0, description="Minimum match score threshold")


class JobMatch(BaseModel):
    """Individual job match"""
    job_id: str
    title: str
    company: Optional[str] = None
    category: str
    location: str
    salary_range: Optional[str] = None
    budget: Optional[str] = None
    duration: Optional[str] = None
    final_score: float
    component_scores: Dict[str, float]
    explanation: str


class MatchResponse(BaseModel):
    """Response schema for matching endpoint"""
    cv_id: str
    cv_name: str
    job_type: str
    matches: List[JobMatch]
    total: int
    execution_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class InteractionCreate(BaseModel):
    """Schema for logging user interactions"""
    cv_id: str
    job_id: str
    action: Literal["viewed", "saved", "applied", "rejected"]
    match_score: Optional[float] = None
    source: Literal["recommendation", "search", "notification"] = "recommendation"


class FeedbackCreate(BaseModel):
    """Schema for match feedback"""
    interaction_id: Optional[str] = None
    cv_id: str
    job_id: str
    helpful: bool
    reason: Optional[Literal["skills_mismatch", "location_wrong", "salary_mismatch", "other"]] = None
    comment: Optional[str] = None
