"""
Match Feedback - User feedback on match quality
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text
from datetime import datetime
from app.db.session import Base


class MatchFeedback(Base):
    __tablename__ = "match_feedback"
    
    feedback_id = Column(String, primary_key=True, index=True)
    match_event_id = Column(String, index=True)  # References UserJobInteraction.event_id
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # References
    user_id = Column(String, index=True)
    job_id = Column(String, index=True)
    
    # Feedback
    helpful = Column(Boolean, index=True)  # Was this match helpful?
    reason = Column(String)  # 'skills_mismatch', 'experience_mismatch', 'location_issue', etc.
    comment = Column(Text)  # Optional free text
    
    def __repr__(self):
        return f"<MatchFeedback(user={self.user_id}, helpful={self.helpful})>"
