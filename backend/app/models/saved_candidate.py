from sqlalchemy import Column, String, DateTime, Integer, Float, Text
from sqlalchemy.sql import func
from app.db.session import Base

class SavedCandidate(Base):
    __tablename__ = "saved_candidates"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(String, index=True, nullable=False)
    job_id = Column(String, index=True, nullable=True)
    recruiter_id = Column(String, index=True, nullable=False)  # For multi-recruiter support
    company_name = Column(String, nullable=True)
    
    # Stage in hiring pipeline
    stage = Column(String, default="saved", nullable=False)  # saved, invited, screening, interview, offer, hired, rejected
    
    # Match information
    match_score = Column(Float, nullable=True)
    
    # Metadata
    saved_date = Column(DateTime, server_default=func.now(), nullable=False)
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Tags and notes
    tags = Column(Text, nullable=True)  # JSON array stored as text
    notes = Column(Text, nullable=True)
    notes_count = Column(Integer, default=0)
    
    # Communication tracking
    last_contact = Column(DateTime, nullable=True)
    contact_count = Column(Integer, default=0)
