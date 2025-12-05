"""
Job Service - Business logic for job operations (Corporate and Small Jobs)
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List, Union
from datetime import datetime, date
import uuid

from app.models.corporate_job import CorporateJob
from app.models.small_job import SmallJob
from app.schemas.job import (
    CorporateJobCreate, CorporateJobUpdate, CorporateJobResponse,
    SmallJobCreate, SmallJobUpdate, SmallJobResponse,
    JobSearchRequest
)


class JobService:
    """Service for job operations"""
    
    # ========================================================================
    # CORPORATE JOBS
    # ========================================================================
    
    @staticmethod
    def get_corporate_job(db: Session, job_id: str) -> Optional[CorporateJob]:
        """Get corporate job by ID"""
        return db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    @staticmethod
    def create_corporate_job(db: Session, job_data: CorporateJobCreate) -> CorporateJob:
        """Create a new corporate job"""
        job_id = f"corp_{uuid.uuid4().hex[:12]}"
        
        db_job = CorporateJob(
            job_id=job_id,
            title=job_data.title,
            company=job_data.company,
            category=job_data.category,
            collar_type=job_data.collar_type.value,
            description=job_data.description,
            key_responsibilities=job_data.key_responsibilities,
            required_skills=job_data.required_skills,
            preferred_skills=job_data.preferred_skills,
            required_experience_years=job_data.required_experience_years,
            required_education=job_data.required_education,
            preferred_certifications=job_data.preferred_certifications,
            location_city=job_data.location_city,
            location_province=job_data.location_province,
            salary_min_zmw=job_data.salary_min_zmw,
            salary_max_zmw=job_data.salary_max_zmw,
            employment_type=job_data.employment_type.value,
            work_schedule=job_data.work_schedule,
            language_requirements=job_data.language_requirements,
            application_deadline=job_data.application_deadline,
            posted_date=date.today(),
            benefits=job_data.benefits,
            growth_opportunities=job_data.growth_opportunities,
            company_size=job_data.company_size,
            industry_sector=job_data.industry_sector
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job
    
    @staticmethod
    def update_corporate_job(
        db: Session, 
        job_id: str, 
        job_data: CorporateJobUpdate
    ) -> Optional[CorporateJob]:
        """Update a corporate job"""
        db_job = JobService.get_corporate_job(db, job_id)
        if not db_job:
            return None
        
        update_data = job_data.dict(exclude_unset=True)
        
        # Handle enums
        if 'collar_type' in update_data and update_data['collar_type']:
            update_data['collar_type'] = update_data['collar_type'].value
        if 'employment_type' in update_data and update_data['employment_type']:
            update_data['employment_type'] = update_data['employment_type'].value
        
        for field, value in update_data.items():
            setattr(db_job, field, value)
        
        db.commit()
        db.refresh(db_job)
        return db_job
    
    @staticmethod
    def delete_corporate_job(db: Session, job_id: str) -> bool:
        """Delete a corporate job"""
        db_job = JobService.get_corporate_job(db, job_id)
        if not db_job:
            return False
        
        db.delete(db_job)
        db.commit()
        return True
    
    @staticmethod
    def list_corporate_jobs(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        location_province: Optional[str] = None,
        collar_type: Optional[str] = None,
        min_salary: Optional[float] = None,
        max_salary: Optional[float] = None,
        employment_type: Optional[str] = None,
    ) -> tuple[List[CorporateJob], int]:
        """List corporate jobs with filters"""
        query = db.query(CorporateJob)
        
        # Apply filters
        if category:
            query = query.filter(CorporateJob.category.ilike(f"%{category}%"))
        if location_province:
            query = query.filter(CorporateJob.location_province.ilike(f"%{location_province}%"))
        if collar_type:
            query = query.filter(CorporateJob.collar_type == collar_type)
        if min_salary is not None:
            query = query.filter(CorporateJob.salary_min_zmw >= min_salary)
        if max_salary is not None:
            query = query.filter(CorporateJob.salary_max_zmw <= max_salary)
        if employment_type:
            query = query.filter(CorporateJob.employment_type == employment_type)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and sort by posted date (newest first)
        jobs = query.order_by(CorporateJob.posted_date.desc()).offset(skip).limit(limit).all()
        
        return jobs, total
    
    # ========================================================================
    # SMALL JOBS
    # ========================================================================
    
    @staticmethod
    def get_small_job(db: Session, job_id: str) -> Optional[SmallJob]:
        """Get small job by ID"""
        return db.query(SmallJob).filter(SmallJob.id == job_id).first()
    
    @staticmethod
    def create_small_job(db: Session, job_data: SmallJobCreate) -> SmallJob:
        """Create a new small job"""
        job_id = f"gig_{uuid.uuid4().hex[:12]}"
        
        db_job = SmallJob(
            id=job_id,
            title=job_data.title,
            category=job_data.category,
            description=job_data.description,
            province=job_data.province,
            location=job_data.location,
            budget=job_data.budget,
            payment_type=job_data.payment_type.value,
            duration=job_data.duration,
            posted_by=job_data.posted_by,
            date_posted=date.today(),
            status=job_data.status.value
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job
    
    @staticmethod
    def update_small_job(
        db: Session, 
        job_id: str, 
        job_data: SmallJobUpdate
    ) -> Optional[SmallJob]:
        """Update a small job"""
        db_job = JobService.get_small_job(db, job_id)
        if not db_job:
            return None
        
        update_data = job_data.dict(exclude_unset=True)
        
        # Handle enums
        if 'payment_type' in update_data and update_data['payment_type']:
            update_data['payment_type'] = update_data['payment_type'].value
        if 'status' in update_data and update_data['status']:
            update_data['status'] = update_data['status'].value
        
        for field, value in update_data.items():
            setattr(db_job, field, value)
        
        db.commit()
        db.refresh(db_job)
        return db_job
    
    @staticmethod
    def delete_small_job(db: Session, job_id: str) -> bool:
        """Delete a small job"""
        db_job = JobService.get_small_job(db, job_id)
        if not db_job:
            return False
        
        db.delete(db_job)
        db.commit()
        return True
    
    @staticmethod
    def list_small_jobs(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        province: Optional[str] = None,
        status: Optional[str] = None,
        min_budget: Optional[float] = None,
        max_budget: Optional[float] = None,
    ) -> tuple[List[SmallJob], int]:
        """List small jobs with filters"""
        query = db.query(SmallJob)
        
        # Apply filters
        if category:
            query = query.filter(SmallJob.category.ilike(f"%{category}%"))
        if province:
            query = query.filter(SmallJob.province.ilike(f"%{province}%"))
        if status:
            query = query.filter(SmallJob.status == status)
        if min_budget is not None:
            query = query.filter(SmallJob.budget >= min_budget)
        if max_budget is not None:
            query = query.filter(SmallJob.budget <= max_budget)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and sort by posted date (newest first)
        jobs = query.order_by(SmallJob.date_posted.desc()).offset(skip).limit(limit).all()
        
        return jobs, total
    
    # ========================================================================
    # COMBINED OPERATIONS
    # ========================================================================
    
    @staticmethod
    def search_all_jobs(
        db: Session,
        search_request: JobSearchRequest
    ) -> dict:
        """
        Search both corporate and small jobs with filters
        
        Returns:
            Dict with 'corporate_jobs', 'small_jobs', and 'total_count'
        """
        results = {
            'corporate_jobs': [],
            'small_jobs': [],
            'total_count': 0,
            'corporate_count': 0,
            'small_count': 0
        }
        
        # Search corporate jobs
        corp_query = db.query(CorporateJob)
        
        if search_request.query:
            search_term = f"%{search_request.query}%"
            corp_query = corp_query.filter(
                or_(
                    CorporateJob.title.ilike(search_term),
                    CorporateJob.description.ilike(search_term),
                    CorporateJob.required_skills.ilike(search_term),
                    CorporateJob.category.ilike(search_term)
                )
            )
        
        if search_request.categories:
            corp_query = corp_query.filter(CorporateJob.category.in_(search_request.categories))
        
        if search_request.locations:
            corp_query = corp_query.filter(
                or_(
                    CorporateJob.location_city.in_(search_request.locations),
                    CorporateJob.location_province.in_(search_request.locations)
                )
            )
        
        if search_request.min_salary:
            corp_query = corp_query.filter(CorporateJob.salary_min_zmw >= search_request.min_salary)
        
        if search_request.max_salary:
            corp_query = corp_query.filter(CorporateJob.salary_max_zmw <= search_request.max_salary)
        
        if search_request.employment_types:
            corp_query = corp_query.filter(CorporateJob.employment_type.in_(search_request.employment_types))
        
        if search_request.experience_min is not None:
            corp_query = corp_query.filter(
                CorporateJob.required_experience_years >= search_request.experience_min
            )
        
        if search_request.experience_max is not None:
            corp_query = corp_query.filter(
                CorporateJob.required_experience_years <= search_request.experience_max
            )
        
        results['corporate_count'] = corp_query.count()
        
        # Search small jobs
        small_query = db.query(SmallJob)
        
        if search_request.query:
            search_term = f"%{search_request.query}%"
            small_query = small_query.filter(
                or_(
                    SmallJob.title.ilike(search_term),
                    SmallJob.description.ilike(search_term),
                    SmallJob.category.ilike(search_term)
                )
            )
        
        if search_request.categories:
            small_query = small_query.filter(SmallJob.category.in_(search_request.categories))
        
        if search_request.locations:
            small_query = small_query.filter(SmallJob.province.in_(search_request.locations))
        
        results['small_count'] = small_query.count()
        results['total_count'] = results['corporate_count'] + results['small_count']
        
        # Apply pagination
        skip = (search_request.page - 1) * search_request.page_size
        
        # Get results
        results['corporate_jobs'] = corp_query.order_by(
            CorporateJob.posted_date.desc()
        ).offset(skip).limit(search_request.page_size).all()
        
        remaining = search_request.page_size - len(results['corporate_jobs'])
        if remaining > 0:
            results['small_jobs'] = small_query.order_by(
                SmallJob.date_posted.desc()
            ).offset(max(0, skip - results['corporate_count'])).limit(remaining).all()
        
        return results
    
    @staticmethod
    def get_job_by_id_and_type(
        db: Session, 
        job_id: str, 
        job_type: str
    ) -> Union[CorporateJob, SmallJob, None]:
        """
        Get a job by ID and type
        
        Args:
            db: Database session
            job_id: Job ID
            job_type: 'corporate' or 'small'
            
        Returns:
            Job object or None
        """
        if job_type == 'corporate':
            return JobService.get_corporate_job(db, job_id)
        elif job_type == 'small':
            return JobService.get_small_job(db, job_id)
        return None
