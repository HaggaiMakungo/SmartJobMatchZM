"""
CV Model - Candidate resumes/profiles
"""
from sqlalchemy import Column, String, Integer, Float, Date, Text, ARRAY, JSON
from sqlalchemy.dialects.postgresql import JSONB
from app.db.session import Base


class CV(Base):
    __tablename__ = "cvs"
    
    cv_id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String, unique=True, index=True)
    gender = Column(String)
    date_of_birth = Column(Date)
    nationality = Column(String)
    city = Column(String, index=True)
    province = Column(String, index=True)
    
    # Education
    education_level = Column(String, index=True)
    institution = Column(String)
    graduation_year = Column(Integer)
    major = Column(String)
    certifications = Column(Text)
    
    # Languages
    languages = Column(String)
    language_proficiency = Column(String)
    
    # Experience
    total_years_experience = Column(Float, index=True)
    current_job_title = Column(String)
    employment_status = Column(String, index=True)
    
    # Preferences
    preferred_job_type = Column(String)
    preferred_location = Column(String)
    salary_expectation_min = Column(Float)
    salary_expectation_max = Column(Float)
    availability = Column(String, index=True)
    
    # Skills
    skills_technical = Column(Text)  # Comma-separated
    skills_soft = Column(Text)  # Comma-separated
    
    # Structured data
    work_experience_json = Column(JSONB)
    projects_json = Column(JSONB)
    references_json = Column(JSONB)
    
    # Quality score
    resume_quality_score = Column(Float)
    
    def __repr__(self):
        return f"<CV(cv_id={self.cv_id}, name={self.full_name})>"
