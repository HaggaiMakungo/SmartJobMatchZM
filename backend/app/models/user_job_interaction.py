"""
User Job Interactions - Logs all matching events for ML training
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.db.session import Base


class UserJobInteraction(Base):
    __tablename__ = "user_job_interactions"
    
    event_id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # References
    user_id = Column(String, index=True)  # cv_id
    job_id = Column(String, index=True)
    job_type = Column(String, index=True)  # 'corp_job' or 'small_job'
    
    # Match scores
    match_score = Column(Float, index=True)
    sub_scores = Column(JSONB)  # {"qualification": 0.9, "experience": 0.85, ...}
    
    # User action
    action = Column(String, index=True)  # 'viewed', 'saved', 'applied', 'rejected', 'hidden'
    source = Column(String)  # 'search', 'notification', 'recommendation'
    session_id = Column(String, index=True)
    
    # Position in results
    rank_position = Column(Integer)  # Where in the list was this job?
    total_results = Column(Integer)  # How many jobs were shown?
    
    def __repr__(self):
        return f"<UserJobInteraction(user={self.user_id}, job={self.job_id}, action={self.action})>"
