"""
Small Job Model - Gig economy/task-based work
Updated to match ACTUAL database schema
"""
from sqlalchemy import Column, String, Text, Numeric, Date, DateTime
from app.db.session import Base


class SmallJob(Base):
    __tablename__ = "small_jobs"
    
    # Primary key
    job_id = Column(String, primary_key=True, index=True)
    
    # Job details
    title = Column(Text, nullable=False, index=True)
    description = Column(Text)
    
    # Location
    location_city = Column(Text, index=True)
    location_area = Column(Text)
    
    # Employer
    employer_name = Column(Text)
    employer_phone = Column(Text)
    
    # Requirements
    required_skills = Column(Text)
    experience_level = Column(Text)
    work_type = Column(Text)
    
    # Compensation
    salary_amount = Column(Numeric)
    salary_type = Column(Text)
    
    # Dates
    start_date = Column(Date)
    created_at = Column(DateTime)
    
    # Embeddings
    embedding_text = Column(Text)
    
    def __repr__(self):
        return f"<SmallJob(job_id={self.job_id}, title={self.title})>"
