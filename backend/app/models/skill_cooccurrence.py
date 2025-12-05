"""
Skill Co-occurrence - Tracks which skills appear together in CVs
"""
from sqlalchemy import Column, String, Integer, Float
from app.db.session import Base


class SkillCooccurrence(Base):
    __tablename__ = "skill_cooccurrence"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_a = Column(String, nullable=False, index=True)
    skill_b = Column(String, nullable=False, index=True)
    co_occurrences = Column(Integer)  # How many times they appear together
    jaccard_similarity = Column(Float)  # intersection / union
    
    def __repr__(self):
        return f"<SkillCooccurrence({self.skill_a} + {self.skill_b}: {self.jaccard_similarity:.2f})>"
