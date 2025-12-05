"""
Employer API Endpoints
Handles employer-specific job management (personal/small jobs)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.small_job import SmallJob
from app.models.user_job_interaction import UserJobInteraction
from app.models.cv import CV
from app.schemas.job import SmallJobCreate, SmallJobUpdate, SmallJobResponse

router = APIRouter()


# ============================================================================
# EMPLOYER JOB MANAGEMENT
# ============================================================================

@router.get("/employer/jobs")
def get_employer_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    Get all jobs posted by the current employer
    
    Filter options:
    - status: Filter by job status (Open, In Progress, Completed, Cancelled)
    - skip/limit: Pagination
    """
    # Build query for jobs posted by current user
    query = db.query(SmallJob).filter(SmallJob.posted_by == str(current_user.id))
    
    # Apply status filter if provided
    if status:
        query = query.filter(SmallJob.status == status)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and get results
    jobs = query.order_by(SmallJob.date_posted.desc()).offset(skip).limit(limit).all()
    
    # Calculate stats
    active_count = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id),
        SmallJob.status == "Open"
    ).count()
    
    draft_count = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id),
        SmallJob.status == "Draft"
    ).count()
    
    completed_count = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id),
        SmallJob.status == "Completed"
    ).count()
    
    return {
        "success": True,
        "total": total,
        "active_count": active_count,
        "draft_count": draft_count,
        "completed_count": completed_count,
        "jobs": jobs,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "has_more": (skip + limit) < total
    }


@router.get("/employer/jobs/{job_id}", response_model=SmallJobResponse)
def get_employer_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get specific job details for employer
    
    Only returns jobs owned by the current employer
    """
    job = db.query(SmallJob).filter(
        SmallJob.id == job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found or you don't have permission to access it"
        )
    
    return job


@router.post("/employer/jobs", response_model=SmallJobResponse, status_code=status.HTTP_201_CREATED)
def create_employer_job(
    job_data: SmallJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job posting
    
    The job will be automatically associated with the current employer
    """
    # Generate job ID
    import uuid
    job_id = f"JOB-P{str(uuid.uuid4())[:8].upper()}"
    
    # Create job instance
    new_job = SmallJob(
        id=job_id,
        title=job_data.title,
        category=job_data.category,
        description=job_data.description,
        province=job_data.province,
        location=job_data.location,
        budget=job_data.budget,
        payment_type=job_data.payment_type,
        duration=job_data.duration,
        posted_by=str(current_user.id),  # Set to current user
        date_posted=datetime.utcnow().date(),
        status=job_data.status or "Open"  # Default to "Open" if not specified
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    return new_job


@router.put("/employer/jobs/{job_id}", response_model=SmallJobResponse)
def update_employer_job(
    job_id: str,
    job_data: SmallJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a job posting
    
    Only the job owner can update the job
    """
    # Get job and verify ownership
    job = db.query(SmallJob).filter(
        SmallJob.id == job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found or you don't have permission to update it"
        )
    
    # Update fields (only update if provided)
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    return job


@router.delete("/employer/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employer_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a job posting
    
    Only the job owner can delete the job
    """
    # Get job and verify ownership
    job = db.query(SmallJob).filter(
        SmallJob.id == job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found or you don't have permission to delete it"
        )
    
    db.delete(job)
    db.commit()
    
    return None


@router.patch("/employer/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    status: str = Query(..., regex="^(Open|In Progress|Completed|Cancelled|Draft)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update job status
    
    Valid statuses: Open, In Progress, Completed, Cancelled, Draft
    """
    # Get job and verify ownership
    job = db.query(SmallJob).filter(
        SmallJob.id == job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found or you don't have permission to update it"
        )
    
    job.status = status
    db.commit()
    db.refresh(job)
    
    return {
        "success": True,
        "message": f"Job status updated to {status}",
        "job": job
    }


@router.get("/employer/stats")
def get_employer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get employer statistics
    
    Returns overview of all jobs, applications, and activity
    """
    # Count jobs by status
    total_jobs = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id)
    ).count()
    
    active_jobs = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id),
        SmallJob.status == "Open"
    ).count()
    
    in_progress_jobs = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id),
        SmallJob.status == "In Progress"
    ).count()
    
    completed_jobs = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id),
        SmallJob.status == "Completed"
    ).count()
    
    draft_jobs = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id),
        SmallJob.status == "Draft"
    ).count()
    
    # Get recent jobs
    recent_jobs = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id)
    ).order_by(SmallJob.date_posted.desc()).limit(5).all()
    
    return {
        "success": True,
        "stats": {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "in_progress_jobs": in_progress_jobs,
            "completed_jobs": completed_jobs,
            "draft_jobs": draft_jobs,
            "total_applications": 0,  # TODO: Implement when applications model exists
            "unread_messages": 0,  # TODO: Implement when messages model exists
        },
        "recent_jobs": recent_jobs
    }


@router.get("/employer/categories")
def get_employer_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of categories used by employer
    
    Returns categories from employer's own jobs plus all available categories
    """
    # Get employer's used categories
    employer_categories = db.query(SmallJob.category).filter(
        SmallJob.posted_by == str(current_user.id)
    ).distinct().all()
    employer_categories = [c[0] for c in employer_categories if c[0]]
    
    # Get all available categories
    all_categories = db.query(SmallJob.category).distinct().all()
    all_categories = [c[0] for c in all_categories if c[0]]
    
    return {
        "success": True,
        "employer_categories": sorted(employer_categories),
        "all_categories": sorted(all_categories),
        "total": len(all_categories)
    }


# ============================================================================
# APPLICANT MANAGEMENT
# ============================================================================

@router.get("/employer/jobs/{job_id}/applicants")
def get_job_applicants(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    Get all applicants for a specific job
    
    Only returns applicants if the current user owns the job.
    
    Filter options:
    - status: Filter by application status (pending, reviewing, accepted, rejected)
    - skip/limit: Pagination
    """
    # Verify job ownership
    job = db.query(SmallJob).filter(
        SmallJob.id == job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found or you don't have permission to view applicants"
        )
    
    # Get all applications for this job
    query = db.query(UserJobInteraction).filter(
        UserJobInteraction.job_id == job_id,
        UserJobInteraction.action == 'applied'
    )
    
    # Apply status filter if provided
    # Note: Currently status is not stored in UserJobInteraction, so we'll add it dynamically
    # In production, you'd want to add a status column to the model
    
    total = query.count()
    applications = query.order_by(UserJobInteraction.timestamp.desc()).offset(skip).limit(limit).all()
    
    # Build applicant list with CV details
    applicants = []
    for app in applications:
        # Get applicant's CV
        cv = db.query(CV).filter(CV.user_id == app.user_id).first()
        
        if cv:
            applicant_data = {
                "application_id": app.event_id,
                "applied_at": app.timestamp.isoformat() if app.timestamp else None,
                "status": "pending",  # Default status (can be enhanced)
                "match_score": app.match_score if app.match_score else 0,
                "applicant": {
                    "id": app.user_id,
                    "name": cv.full_name,
                    "email": cv.email,
                    "phone": cv.phone,
                    "location": f"{cv.city}, {cv.province}" if cv.city else cv.province,
                    "education": cv.education_level,
                    "experience_years": cv.total_years_experience,
                    "current_title": cv.current_job_title,
                    "skills": cv.skills_technical.split(", ") if cv.skills_technical else [],
                    "cv_id": cv.cv_id,
                    "resume_quality_score": int(cv.resume_quality_score) if cv.resume_quality_score else 0
                },
                "cover_letter": None  # Can be added if you store cover letters
            }
        else:
            # Fallback if CV not found
            applicant_data = {
                "application_id": app.event_id,
                "applied_at": app.timestamp.isoformat() if app.timestamp else None,
                "status": "pending",
                "match_score": app.match_score if app.match_score else 0,
                "applicant": {
                    "id": app.user_id,
                    "name": "Unknown Applicant",
                    "email": None,
                    "phone": None,
                    "location": None,
                    "education": None,
                    "experience_years": 0,
                    "current_title": None,
                    "skills": [],
                    "cv_id": None,
                    "resume_quality_score": 0
                },
                "cover_letter": None
            }
        
        applicants.append(applicant_data)
    
    return {
        "success": True,
        "job_id": job_id,
        "job_title": job.title,
        "total_applicants": total,
        "applicants": applicants,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "has_more": (skip + limit) < total
    }


@router.get("/employer/applicants/{application_id}")
def get_applicant_details(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific applicant
    
    Returns full CV/profile information for an applicant.
    Only accessible if the current user owns the job.
    """
    # Get application
    application = db.query(UserJobInteraction).filter(
        UserJobInteraction.event_id == application_id,
        UserJobInteraction.action == 'applied'
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Verify job ownership
    job = db.query(SmallJob).filter(
        SmallJob.id == application.job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this applicant"
        )
    
    # Get applicant's full CV
    cv = db.query(CV).filter(CV.user_id == application.user_id).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant CV not found"
        )
    
    # Build detailed applicant profile
    applicant_details = {
        "application_id": application.event_id,
        "job_id": application.job_id,
        "job_title": job.title,
        "applied_at": application.timestamp.isoformat() if application.timestamp else None,
        "status": "pending",
        "match_score": application.match_score if application.match_score else 0,
        "sub_scores": application.sub_scores if application.sub_scores else {},
        "applicant": {
            "id": application.user_id,
            "cv_id": cv.cv_id,
            "full_name": cv.full_name,
            "email": cv.email,
            "phone": cv.phone,
            "location": {
                "city": cv.city,
                "province": cv.province,
                "full": f"{cv.city}, {cv.province}" if cv.city else cv.province
            },
            "education": {
                "level": cv.education_level,
                "institution": cv.institution,
                "graduation_year": cv.graduation_year,
                "field_of_study": cv.field_of_study
            },
            "experience": {
                "current_title": cv.current_job_title,
                "total_years": cv.total_years_experience,
                "work_history": cv.work_experience_json if cv.work_experience_json else []
            },
            "skills": {
                "technical": cv.skills_technical.split(", ") if cv.skills_technical else [],
                "soft": cv.skills_soft.split(", ") if cv.skills_soft else [],
                "languages": cv.languages.split(", ") if cv.languages else []
            },
            "certifications": cv.certifications.split(", ") if cv.certifications else [],
            "resume_quality_score": int(cv.resume_quality_score) if cv.resume_quality_score else 0,
            "availability": cv.availability,
            "salary_expectation": {
                "min": cv.desired_salary_min,
                "max": cv.desired_salary_max
            }
        },
        "cover_letter": None  # Can be added if stored
    }
    
    return applicant_details


@router.post("/employer/applicants/{application_id}/accept")
def accept_applicant(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    notes: Optional[str] = None
):
    """
    Accept an applicant
    
    Marks the application as accepted. In a full implementation,
    this would trigger notifications to the applicant.
    """
    # Get application
    application = db.query(UserJobInteraction).filter(
        UserJobInteraction.event_id == application_id,
        UserJobInteraction.action == 'applied'
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Verify job ownership
    job = db.query(SmallJob).filter(
        SmallJob.id == application.job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to accept this applicant"
        )
    
    # Update application action to 'accepted'
    # Note: In production, you'd add a separate status field or create an ApplicationStatus model
    application.action = 'accepted'
    
    # Store notes in sub_scores as temporary solution
    if notes:
        if not application.sub_scores:
            application.sub_scores = {}
        application.sub_scores['employer_notes'] = notes
        application.sub_scores['accepted_at'] = datetime.utcnow().isoformat()
    
    db.commit()
    db.refresh(application)
    
    # Get applicant info for response
    cv = db.query(CV).filter(CV.user_id == application.user_id).first()
    
    return {
        "success": True,
        "message": "Applicant accepted successfully",
        "application_id": application.event_id,
        "status": "accepted",
        "applicant_name": cv.full_name if cv else "Unknown",
        "applicant_email": cv.email if cv else None,
        "accepted_at": datetime.utcnow().isoformat()
    }


@router.post("/employer/applicants/{application_id}/reject")
def reject_applicant(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    reason: Optional[str] = None
):
    """
    Reject an applicant
    
    Marks the application as rejected. In a full implementation,
    this would trigger notifications to the applicant.
    """
    # Get application
    application = db.query(UserJobInteraction).filter(
        UserJobInteraction.event_id == application_id,
        UserJobInteraction.action == 'applied'
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Verify job ownership
    job = db.query(SmallJob).filter(
        SmallJob.id == application.job_id,
        SmallJob.posted_by == str(current_user.id)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to reject this applicant"
        )
    
    # Update application action to 'rejected'
    application.action = 'rejected'
    
    # Store rejection reason
    if reason:
        if not application.sub_scores:
            application.sub_scores = {}
        application.sub_scores['rejection_reason'] = reason
        application.sub_scores['rejected_at'] = datetime.utcnow().isoformat()
    
    db.commit()
    db.refresh(application)
    
    # Get applicant info for response
    cv = db.query(CV).filter(CV.user_id == application.user_id).first()
    
    return {
        "success": True,
        "message": "Applicant rejected",
        "application_id": application.event_id,
        "status": "rejected",
        "applicant_name": cv.full_name if cv else "Unknown",
        "rejected_at": datetime.utcnow().isoformat()
    }


@router.get("/employer/applicants/summary")
def get_applicants_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get summary of all applicants across all employer's jobs
    
    Returns counts by status and recent applications.
    """
    # Get all jobs for employer
    employer_jobs = db.query(SmallJob).filter(
        SmallJob.posted_by == str(current_user.id)
    ).all()
    
    job_ids = [job.id for job in employer_jobs]
    
    if not job_ids:
        return {
            "success": True,
            "total_applicants": 0,
            "pending": 0,
            "accepted": 0,
            "rejected": 0,
            "recent_applications": []
        }
    
    # Get all applications for these jobs
    all_applications = db.query(UserJobInteraction).filter(
        UserJobInteraction.job_id.in_(job_ids),
        UserJobInteraction.action.in_(['applied', 'accepted', 'rejected'])
    ).all()
    
    # Count by status
    pending_count = sum(1 for app in all_applications if app.action == 'applied')
    accepted_count = sum(1 for app in all_applications if app.action == 'accepted')
    rejected_count = sum(1 for app in all_applications if app.action == 'rejected')
    
    # Get recent applications (last 10)
    recent_apps = db.query(UserJobInteraction).filter(
        UserJobInteraction.job_id.in_(job_ids),
        UserJobInteraction.action.in_(['applied', 'accepted', 'rejected'])
    ).order_by(UserJobInteraction.timestamp.desc()).limit(10).all()
    
    recent_applications = []
    for app in recent_apps:
        cv = db.query(CV).filter(CV.user_id == app.user_id).first()
        job = db.query(SmallJob).filter(SmallJob.id == app.job_id).first()
        
        recent_applications.append({
            "application_id": app.event_id,
            "applicant_name": cv.full_name if cv else "Unknown",
            "job_title": job.title if job else "Unknown Job",
            "job_id": app.job_id,
            "status": app.action,
            "applied_at": app.timestamp.isoformat() if app.timestamp else None,
            "match_score": app.match_score if app.match_score else 0
        })
    
    return {
        "success": True,
        "total_applicants": len(all_applications),
        "pending": pending_count,
        "accepted": accepted_count,
        "rejected": rejected_count,
        "recent_applications": recent_applications
    }
