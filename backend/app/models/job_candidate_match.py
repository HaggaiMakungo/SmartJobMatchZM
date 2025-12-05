"""
Pre-computed job-candidate matches table model
Stores pre-calculated match scores for instant retrieval
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, Index, Text
from sqlalchemy.sql import func
from app.db.database import Base


class JobCandidateMatch(Base):
    """
    Pre-computed matches between jobs and candidates
    Enables sub-100ms response times by avoiding real-time computation
    """
    __tablename__ = "job_candidate_matches"
    
    # Composite primary key
    job_id = Column(String, primary_key=True)
    cv_id = Column(String, primary_key=True)
    
    # Match scores
    match_score = Column(Float, nullable=False, index=True)  # 0.0 to 1.0
    skill_score = Column(Float)
    experience_score = Column(Float)
    location_score = Column(Float)
    education_score = Column(Float)
    
    # Match details (JSON stored as text)
    matched_skills = Column(Text)  # JSON array of matched skills
    missing_skills = Column(Text)  # JSON array of missing skills
    match_explanation = Column(Text)  # Why they match
    
    # Metadata
    computed_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Indexes for fast queries
    __table_args__ = (
        Index('idx_job_score', 'job_id', 'match_score'),  # Get top matches for a job
        Index('idx_cv_score', 'cv_id', 'match_score'),    # Get top jobs for a CV
        Index('idx_computed_at', 'computed_at'),          # Find stale matches
    )
