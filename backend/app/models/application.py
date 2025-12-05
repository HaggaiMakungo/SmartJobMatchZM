"""
Application Model - Job applications from candidates
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class ApplicationStatus(str, enum.Enum):
    """Application status enum"""
    NEW = "new"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    HIRED = "hired"
    REJECTED = "rejected"


class Application(Base):
    """Job application from a candidate"""
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Candidate info
    cv_id = Column(String, ForeignKey("cvs.cv_id"), nullable=False, index=True)
    
    # Job info
    job_id = Column(String, nullable=False, index=True)
    job_type = Column(String, nullable=False)  # 'corporate' or 'small'
    
    # Application details
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.NEW, index=True)
    match_score = Column(Float, index=True)  # 0-100
    cover_letter = Column(Text)
    notes = Column(Text)  # Recruiter notes
    
    # Metadata
    applied_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional data
    interview_date = Column(DateTime)
    interview_notes = Column(Text)
    rating = Column(Integer)  # 1-5 stars
    tags = Column(JSONB)  # Custom tags for organization
    
    def __repr__(self):
        return f"<Application(id={self.id}, cv_id={self.cv_id}, job_id={self.job_id}, status={self.status})>"
