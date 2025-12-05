"""
Skills Taxonomy - Normalized skills with synonyms and frequency data
"""
from sqlalchemy import Column, String, Integer, Float, ARRAY
from app.db.session import Base


class SkillTaxonomy(Base):
    __tablename__ = "skills_taxonomy"
    
    skill_id = Column(Integer, primary_key=True, autoincrement=True)
    skill_name = Column(String, unique=True, nullable=False, index=True)
    normalized_name = Column(String, index=True)  # Lowercase, trimmed version
    synonyms = Column(ARRAY(String))  # Alternative names
    frequency = Column(Integer)  # How often it appears in CVs
    percentage = Column(Float)  # Percentage of CVs with this skill
    category = Column(String)  # Technical, Soft, Domain-specific, etc.
    
    def __repr__(self):
        return f"<SkillTaxonomy(skill_name={self.skill_name}, freq={self.frequency})>"
