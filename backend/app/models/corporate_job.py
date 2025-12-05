"""
Corporate Job Model - Traditional employment opportunities
"""
from sqlalchemy import Column, String, Integer, Float, Date, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.db.session import Base


class CorporateJob(Base):
    __tablename__ = "corporate_jobs"
    
    job_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    collar_type = Column(String, nullable=False, index=True)  # white, blue, pink, grey, green
    
    # Job details
    description = Column(Text)
    key_responsibilities = Column(Text)
    
    # Requirements
    required_skills = Column(Text)  # Comma-separated
    preferred_skills = Column(Text)  # Comma-separated
    required_experience_years = Column(Float, index=True)
    required_education = Column(String, index=True)
    preferred_certifications = Column(Text)
    
    # Location
    location_city = Column(String, index=True)
    location_province = Column(String, index=True)
    
    # Compensation
    salary_min_zmw = Column(Float)
    salary_max_zmw = Column(Float)
    
    # Employment terms
    employment_type = Column(String, index=True)  # Full-time, Part-time, Contract
    work_schedule = Column(String)
    language_requirements = Column(String)
    
    # Metadata
    application_deadline = Column(Date)
    posted_date = Column(Date, index=True)
    
    # Job lifecycle management (NEW)
    status = Column(String(20), nullable=False, default='draft', index=True)  # draft, published, closed, archived
    created_by = Column(Integer, index=True)  # User ID of recruiter who created the job
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    # Additional info
    benefits = Column(Text)
    growth_opportunities = Column(Text)
    company_size = Column(String)
    industry_sector = Column(String, index=True)
    
    def __repr__(self):
        return f"<CorporateJob(job_id={self.job_id}, title={self.title}, status={self.status})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'job_id': self.job_id,
            'title': self.title,
            'company': self.company,
            'category': self.category,
            'collar_type': self.collar_type,
            'description': self.description,
            'key_responsibilities': self.key_responsibilities,
            'required_skills': self.required_skills,
            'preferred_skills': self.preferred_skills,
            'required_experience_years': self.required_experience_years,
            'required_education': self.required_education,
            'preferred_certifications': self.preferred_certifications,
            'location_city': self.location_city,
            'location_province': self.location_province,
            'salary_min_zmw': self.salary_min_zmw,
            'salary_max_zmw': self.salary_max_zmw,
            'employment_type': self.employment_type,
            'work_schedule': self.work_schedule,
            'language_requirements': self.language_requirements,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'posted_date': self.posted_date.isoformat() if self.posted_date else None,
            'status': self.status,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'benefits': self.benefits,
            'growth_opportunities': self.growth_opportunities,
            'company_size': self.company_size,
            'industry_sector': self.industry_sector,
        }
