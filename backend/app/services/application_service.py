"""
Application Service - Business logic for job applications
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional, List, Tuple
from datetime import datetime

from app.models.application import Application, ApplicationStatus
from app.models.cv import CV
from app.models.corporate_job import CorporateJob
from app.models.small_job import SmallJob
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationStats


class ApplicationService:
    """Service for managing job applications"""
    
    @staticmethod
    def create_application(
        db: Session,
        cv_id: str,
        application_data: ApplicationCreate,
        match_score: Optional[float] = None
    ) -> Application:
        """Create a new application"""
        application = Application(
            cv_id=cv_id,
            job_id=application_data.job_id,
            job_type=application_data.job_type,
            cover_letter=application_data.cover_letter,
            match_score=match_score,
            status=ApplicationStatus.NEW
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        
        return application
    
    @staticmethod
    def get_application(db: Session, application_id: int) -> Optional[Application]:
        """Get application by ID"""
        return db.query(Application).filter(Application.id == application_id).first()
    
    @staticmethod
    def list_applications(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: Optional[ApplicationStatus] = None,
        job_id: Optional[str] = None,
        cv_id: Optional[str] = None,
        min_match_score: Optional[float] = None
    ) -> Tuple[List[Application], int]:
        """List applications with filters"""
        query = db.query(Application)
        
        # Apply filters
        if status:
            query = query.filter(Application.status == status)
        if job_id:
            query = query.filter(Application.job_id == job_id)
        if cv_id:
            query = query.filter(Application.cv_id == cv_id)
        if min_match_score:
            query = query.filter(Application.match_score >= min_match_score)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        applications = query.order_by(Application.applied_at.desc()).offset(skip).limit(limit).all()
        
        return applications, total
    
    @staticmethod
    def update_application(
        db: Session,
        application_id: int,
        application_data: ApplicationUpdate
    ) -> Optional[Application]:
        """Update application"""
        application = db.query(Application).filter(Application.id == application_id).first()
        
        if not application:
            return None
        
        # Update fields
        update_dict = application_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(application, key, value)
        
        application.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(application)
        
        return application
    
    @staticmethod
    def delete_application(db: Session, application_id: int) -> bool:
        """Delete application"""
        application = db.query(Application).filter(Application.id == application_id).first()
        
        if not application:
            return False
        
        db.delete(application)
        db.commit()
        
        return True
    
    @staticmethod
    def get_application_with_details(db: Session, application_id: int) -> Optional[dict]:
        """Get application with candidate and job details"""
        application = db.query(Application).filter(Application.id == application_id).first()
        
        if not application:
            return None
        
        # Get candidate details
        cv = db.query(CV).filter(CV.cv_id == application.cv_id).first()
        
        # Get job details
        if application.job_type == 'corporate':
            job = db.query(CorporateJob).filter(CorporateJob.job_id == application.job_id).first()
        else:
            job = db.query(SmallJob).filter(SmallJob.job_id == application.job_id).first()
        
        result = {
            **application.__dict__,
            'candidate_name': cv.full_name if cv else None,
            'candidate_email': cv.email if cv else None,
            'candidate_phone': cv.phone if cv else None,
            'candidate_location': f"{cv.city}, {cv.province}" if cv and cv.city and cv.province else None,
            'job_title': job.title if job else None,
            'company': job.company if job and hasattr(job, 'company') else None
        }
        
        return result
    
    @staticmethod
    def list_applications_with_details(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: Optional[ApplicationStatus] = None,
        job_id: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        """List applications with candidate and job details"""
        query = db.query(Application, CV, CorporateJob).outerjoin(
            CV, Application.cv_id == CV.cv_id
        ).outerjoin(
            CorporateJob, and_(
                Application.job_id == CorporateJob.job_id,
                Application.job_type == 'corporate'
            )
        )
        
        # Apply filters
        if status:
            query = query.filter(Application.status == status)
        if job_id:
            query = query.filter(Application.job_id == job_id)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (CV.full_name.ilike(search_term)) |
                (CV.email.ilike(search_term)) |
                (CorporateJob.title.ilike(search_term))
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        results = query.order_by(Application.applied_at.desc()).offset(skip).limit(limit).all()
        
        # Format results
        applications = []
        for app, cv, job in results:
            applications.append({
                **app.__dict__,
                'candidate_name': cv.full_name if cv else None,
                'candidate_email': cv.email if cv else None,
                'candidate_phone': cv.phone if cv else None,
                'candidate_location': f"{cv.city}, {cv.province}" if cv and cv.city and cv.province else None,
                'job_title': job.title if job else None,
                'company': job.company if job else None
            })
        
        return applications, total
    
    @staticmethod
    def get_application_stats(db: Session, job_id: Optional[str] = None) -> ApplicationStats:
        """Get application statistics"""
        query = db.query(Application)
        
        if job_id:
            query = query.filter(Application.job_id == job_id)
        
        total = query.count()
        new = query.filter(Application.status == ApplicationStatus.NEW).count()
        screening = query.filter(Application.status == ApplicationStatus.SCREENING).count()
        interview = query.filter(Application.status == ApplicationStatus.INTERVIEW).count()
        offer = query.filter(Application.status == ApplicationStatus.OFFER).count()
        hired = query.filter(Application.status == ApplicationStatus.HIRED).count()
        rejected = query.filter(Application.status == ApplicationStatus.REJECTED).count()
        
        # Calculate average match score
        avg_score = db.query(func.avg(Application.match_score)).filter(
            Application.match_score.isnot(None)
        ).scalar()
        
        if job_id:
            query_with_job = query.filter(Application.job_id == job_id)
            avg_score = db.query(func.avg(Application.match_score)).filter(
                and_(
                    Application.job_id == job_id,
                    Application.match_score.isnot(None)
                )
            ).scalar()
        
        return ApplicationStats(
            total=total,
            new=new,
            screening=screening,
            interview=interview,
            offer=offer,
            hired=hired,
            rejected=rejected,
            avg_match_score=float(avg_score) if avg_score else None
        )
    
    @staticmethod
    def bulk_update_status(
        db: Session,
        application_ids: List[int],
        new_status: ApplicationStatus
    ) -> int:
        """Bulk update application status"""
        updated = db.query(Application).filter(
            Application.id.in_(application_ids)
        ).update(
            {
                Application.status: new_status,
                Application.updated_at: datetime.utcnow()
            },
            synchronize_session=False
        )
        
        db.commit()
        
        return updated
