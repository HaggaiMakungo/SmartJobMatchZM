"""
CV Service - Business logic for CV operations
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from datetime import datetime
import uuid

from app.models.cv import CV
from app.schemas.cv import CVCreate, CVUpdate, CVResponse


class CVService:
    """Service for CV operations"""
    
    @staticmethod
    def get_cv_by_id(db: Session, cv_id: str) -> Optional[CV]:
        """Get CV by ID"""
        return db.query(CV).filter(CV.cv_id == cv_id).first()
    
    @staticmethod
    def get_cv_by_email(db: Session, email: str) -> Optional[CV]:
        """Get CV by email"""
        return db.query(CV).filter(CV.email == email).first()
    
    @staticmethod
    def get_cv_by_user_id(db: Session, user_id: str) -> Optional[CV]:
        """Get CV associated with a user (assumes CV table has user_id field)"""
        # If your CV model links to users, use that relationship
        # For now, we'll search by email matching user email
        return db.query(CV).filter(CV.email == user_id).first()
    
    @staticmethod
    def create_cv(db: Session, cv_data: CVCreate, user_id: Optional[str] = None) -> CV:
        """
        Create a new CV
        
        Args:
            db: Database session
            cv_data: CV creation data
            user_id: Optional user ID to associate with CV
            
        Returns:
            Created CV object
            
        Raises:
            IntegrityError: If email already exists
        """
        # Generate unique CV ID
        cv_id = f"cv_{uuid.uuid4().hex[:12]}"
        
        # Create CV instance
        db_cv = CV(
            cv_id=cv_id,
            full_name=cv_data.full_name,
            email=cv_data.email,
            phone=cv_data.phone,
            gender=cv_data.gender,
            date_of_birth=cv_data.date_of_birth,
            nationality=cv_data.nationality,
            city=cv_data.city,
            province=cv_data.province,
            education_level=cv_data.education_level.value if cv_data.education_level else None,
            institution=cv_data.institution,
            graduation_year=cv_data.graduation_year,
            major=cv_data.major,
            certifications=cv_data.certifications,
            languages=cv_data.languages,
            language_proficiency=cv_data.language_proficiency,
            total_years_experience=cv_data.total_years_experience,
            current_job_title=cv_data.current_job_title,
            employment_status=cv_data.employment_status.value if cv_data.employment_status else None,
            preferred_job_type=cv_data.preferred_job_type,
            preferred_location=cv_data.preferred_location,
            salary_expectation_min=cv_data.salary_expectation_min,
            salary_expectation_max=cv_data.salary_expectation_max,
            availability=cv_data.availability,
            skills_technical=cv_data.skills_technical,
            skills_soft=cv_data.skills_soft,
            work_experience_json=cv_data.work_experience_json,
            projects_json=cv_data.projects_json,
            references_json=cv_data.references_json,
        )
        
        try:
            db.add(db_cv)
            db.commit()
            db.refresh(db_cv)
            return db_cv
        except IntegrityError:
            db.rollback()
            raise ValueError(f"CV with email {cv_data.email} already exists")
    
    @staticmethod
    def update_cv(db: Session, cv_id: str, cv_data: CVUpdate) -> Optional[CV]:
        """
        Update an existing CV
        
        Args:
            db: Database session
            cv_id: CV ID to update
            cv_data: Updated CV data
            
        Returns:
            Updated CV object or None if not found
        """
        db_cv = CVService.get_cv_by_id(db, cv_id)
        if not db_cv:
            return None
        
        # Update only provided fields
        update_data = cv_data.dict(exclude_unset=True)
        
        # Handle enums
        if 'education_level' in update_data and update_data['education_level']:
            update_data['education_level'] = update_data['education_level'].value
        if 'employment_status' in update_data and update_data['employment_status']:
            update_data['employment_status'] = update_data['employment_status'].value
        
        for field, value in update_data.items():
            setattr(db_cv, field, value)
        
        try:
            db.commit()
            db.refresh(db_cv)
            return db_cv
        except IntegrityError:
            db.rollback()
            raise ValueError("Failed to update CV - email may already exist")
    
    @staticmethod
    def delete_cv(db: Session, cv_id: str) -> bool:
        """
        Delete a CV
        
        Args:
            db: Database session
            cv_id: CV ID to delete
            
        Returns:
            True if deleted, False if not found
        """
        db_cv = CVService.get_cv_by_id(db, cv_id)
        if not db_cv:
            return False
        
        db.delete(db_cv)
        db.commit()
        return True
    
    @staticmethod
    def list_cvs(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        city: Optional[str] = None,
        province: Optional[str] = None,
        education_level: Optional[str] = None,
        min_experience: Optional[float] = None,
    ) -> tuple[List[CV], int]:
        """
        List CVs with optional filters
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            city: Filter by city
            province: Filter by province
            education_level: Filter by education level
            min_experience: Minimum years of experience
            
        Returns:
            Tuple of (list of CVs, total count)
        """
        query = db.query(CV)
        
        # Apply filters
        if city:
            query = query.filter(CV.city.ilike(f"%{city}%"))
        if province:
            query = query.filter(CV.province.ilike(f"%{province}%"))
        if education_level:
            query = query.filter(CV.education_level == education_level)
        if min_experience is not None:
            query = query.filter(CV.total_years_experience >= min_experience)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        cvs = query.offset(skip).limit(limit).all()
        
        return cvs, total
    
    @staticmethod
    def search_cvs(
        db: Session,
        query: str,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[CV], int]:
        """
        Search CVs by name, skills, or job title
        
        Args:
            db: Database session
            query: Search query string
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (list of CVs, total count)
        """
        search_filter = (
            CV.full_name.ilike(f"%{query}%") |
            CV.current_job_title.ilike(f"%{query}%") |
            CV.skills_technical.ilike(f"%{query}%") |
            CV.skills_soft.ilike(f"%{query}%")
        )
        
        query_obj = db.query(CV).filter(search_filter)
        total = query_obj.count()
        cvs = query_obj.offset(skip).limit(limit).all()
        
        return cvs, total
    
    @staticmethod
    def calculate_cv_quality_score(cv: CV) -> float:
        """
        Calculate a quality score for a CV based on completeness
        
        Args:
            cv: CV object
            
        Returns:
            Quality score between 0.0 and 1.0
        """
        score = 0.0
        max_score = 10.0
        
        # Basic info (2 points)
        if cv.full_name and cv.email and cv.phone:
            score += 1.0
        if cv.city and cv.province:
            score += 1.0
        
        # Education (2 points)
        if cv.education_level:
            score += 1.0
        if cv.institution and cv.graduation_year:
            score += 1.0
        
        # Experience (2 points)
        if cv.total_years_experience > 0:
            score += 1.0
        if cv.current_job_title:
            score += 1.0
        
        # Skills (2 points)
        if cv.skills_technical and len(cv.skills_technical) > 10:
            score += 1.0
        if cv.skills_soft and len(cv.skills_soft) > 10:
            score += 1.0
        
        # Structured data (2 points)
        if cv.work_experience_json and len(cv.work_experience_json) > 0:
            score += 1.0
        if cv.projects_json or cv.references_json:
            score += 1.0
        
        return round(score / max_score, 2)
