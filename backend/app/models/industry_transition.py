"""
Industry Transitions - Tracks career path transitions between industries
"""
from sqlalchemy import Column, String, Integer, Float
from app.db.session import Base


class IndustryTransition(Base):
    __tablename__ = "industry_transitions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    from_industry = Column(String, nullable=False, index=True)
    to_industry = Column(String, nullable=False, index=True)
    transitions = Column(Integer)  # Number of people who made this transition
    probability = Column(Float)  # Likelihood of this transition
    
    def __repr__(self):
        return f"<IndustryTransition({self.from_industry} → {self.to_industry}: {self.probability:.1%})>"
