"""
Corporate User Model - Separate from job seekers
"""
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class CorpUser(Base):
    """
    Corporate/Recruiter users - completely separate from job seekers
    """
    __tablename__ = "corp_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    company_name = Column(String, index=True, nullable=False)  # e.g., "DHL", "Zanaco"
    company_display_name = Column(String, nullable=True)  # e.g., "DHL Express Zambia"
    
    # Contact info
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<CorpUser(email={self.email}, company={self.company_name})>"
