"""
Candidate API Endpoints
Handles candidate profile, applications, and saved jobs
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.cv import CV
from app.models.user_job_interaction import UserJobInteraction
from app.models.corporate_job import CorporateJob
from app.models.small_job import SmallJob

router = APIRouter()


# ============================================================================
# CANDIDATE PROFILE
# ============================================================================

@router.get("/candidate/profile/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current candidate's profile
    
    Returns user information and their CV if available
    """
    # Look up CV by user's email
    cv = db.query(CV).filter(CV.email == current_user.email).first()
    
    if cv:
        # Return actual CV data
        profile_data = {
            "id": current_user.id,
            "user_id": current_user.id,
            "cv_id": cv.cv_id,
            "full_name": cv.full_name,
            "email": cv.email,
            "phone": cv.phone,
            "location": f"{cv.city}, {cv.province}" if cv.city else None,
            "bio": f"{cv.education_level} graduate with {cv.total_years_experience} years of experience in {cv.current_job_title}",
            "skills": cv.skills_technical.split(", ") if cv.skills_technical else [],
            "education": [{
                "degree": cv.education_level,
                "institution": cv.institution,
                "year": cv.graduation_year
            }] if cv.education_level else [],
            "experience": cv.work_experience_json if cv.work_experience_json else [],
            "profile_picture_url": None,
            "resume_url": None,
            "profile_strength": int(cv.resume_quality_score) if cv.resume_quality_score else 0
        }
    else:
        # Return mock profile if no CV found
        profile_data = {
            "id": current_user.id,
            "user_id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": None,
            "location": "Lusaka, Zambia",
            "bio": "Software professional looking for opportunities",
            "skills": ["Python", "JavaScript", "React", "Node.js"],
            "education": [{
                "degree": "Bachelor's Degree",
                "institution": "University of Zambia",
                "year": 2020
            }],
            "experience": [{
                "title": "Software Developer",
                "company": "Tech Company",
                "duration": "2 years",
                "description": "Full stack development"
            }],
            "profile_picture_url": None,
            "resume_url": None,
            "profile_strength": 50
        }
    
    return profile_data


@router.put("/candidate/profile/me")
def update_my_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current candidate's profile
    
    Updates user and CV information
    """
    # Update user fields
    if "full_name" in profile_data:
        current_user.full_name = profile_data["full_name"]
    
    # Get or create CV
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        # Create new CV if doesn't exist
        cv = CV(
            user_id=current_user.id,
            full_name=current_user.full_name,
            email=current_user.email
        )
        db.add(cv)
    
    # Update CV fields if provided
    if "location" in profile_data:
        cv.location = profile_data["location"]
    
    if "skills" in profile_data and isinstance(profile_data["skills"], list):
        # Split into technical and soft skills (simplified)
        cv.technical_skills = profile_data["skills"][:10]  # First 10 as technical
        cv.soft_skills = profile_data["skills"][10:]  # Rest as soft
    
    db.commit()
    db.refresh(current_user)
    
    # Return updated profile
    return get_my_profile(current_user, db)


# ============================================================================
# JOB APPLICATIONS
# ============================================================================

@router.get("/candidate/applications")
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current candidate's job applications
    
    Returns list of jobs the user has applied to with full job details
    """
    # Get all applications for current user
    applications = db.query(UserJobInteraction).filter(
        UserJobInteraction.user_id == str(current_user.id),
        UserJobInteraction.action == 'applied'
    ).all()
    
    result = []
    for app in applications:
        # Try to find the job in corporate_jobs first
        corporate_job = db.query(CorporateJob).filter(
            CorporateJob.job_id == app.job_id
        ).first()
        
        if corporate_job:
            # Corporate job found
            result.append({
                "id": app.event_id,  # Frontend expects 'id'
                "event_id": app.event_id,  # Keep backend field for compatibility
                "job_id": app.job_id,
                "status": "pending",  # Could be extended to track actual status
                "applied_at": app.timestamp.isoformat() if app.timestamp else None,
                "updated_at": app.timestamp.isoformat() if app.timestamp else None,
                "job": {
                    "id": corporate_job.job_id,
                    "title": corporate_job.title,
                    "company": corporate_job.company,
                    "location": f"{corporate_job.location_city}, {corporate_job.location_province}" if corporate_job.location_city else corporate_job.location_province,
                    "category": corporate_job.category,
                    "employment_type": corporate_job.employment_type,
                    "salary_range": f"ZMW {corporate_job.salary_min_zmw:,.0f} - {corporate_job.salary_max_zmw:,.0f}" if corporate_job.salary_min_zmw else None,
                    "job_type": "corporate"
                }
            })
        else:
            # Try small_jobs table
            small_job = db.query(SmallJob).filter(
                SmallJob.id == app.job_id
            ).first()
            
            if small_job:
                result.append({
                    "id": app.event_id,  # Frontend expects 'id'
                    "event_id": app.event_id,  # Keep backend field for compatibility
                    "job_id": app.job_id,
                    "status": "pending",
                    "applied_at": app.timestamp.isoformat() if app.timestamp else None,
                    "updated_at": app.timestamp.isoformat() if app.timestamp else None,
                    "job": {
                        "id": small_job.id,
                        "title": small_job.title,
                        "company": "Personal Employer",  # Small jobs don't have company names
                        "location": small_job.location if small_job.location else small_job.province,
                        "category": small_job.category,
                        "employment_type": "Task-based",
                        "salary_range": f"ZMW {small_job.budget:,.0f}" if small_job.budget else None,
                        "job_type": "personal"
                    }
                })
    
    return result


@router.post("/candidate/applications/{job_id}")
def apply_to_job(
    job_id: str,
    application_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply to a job
    
    Creates a job application for the current user
    """
    # Check if already applied
    existing = db.query(UserJobInteraction).filter(
        UserJobInteraction.user_id == str(current_user.id),
        UserJobInteraction.job_id == job_id,
        UserJobInteraction.action == 'applied'
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Create application
    import uuid
    application = UserJobInteraction(
        event_id=f"app_{uuid.uuid4().hex[:12]}",
        user_id=str(current_user.id),
        job_id=job_id,
        action='applied',
        job_type='corporate' if not job_id.startswith('SMALL') else 'small_job'
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return {
        "id": application.event_id,  # Frontend expects 'id'
        "event_id": application.event_id,  # Keep backend field for compatibility
        "job_id": job_id,
        "status": "pending",
        "applied_at": application.timestamp.isoformat() if application.timestamp else None,
        "updated_at": application.timestamp.isoformat() if application.timestamp else None
    }


@router.delete("/candidate/applications/{application_id}")
def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Withdraw a job application
    """
    application = db.query(UserJobInteraction).filter(
        UserJobInteraction.event_id == application_id,
        UserJobInteraction.user_id == str(current_user.id),
        UserJobInteraction.action == 'applied'
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application withdrawn successfully"}


# ============================================================================
# SAVED JOBS
# ============================================================================

@router.get("/candidate/saved-jobs")
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current candidate's saved jobs
    
    Returns list of jobs the user has bookmarked with full job details
    """
    # Get all saved jobs for current user
    saved_jobs = db.query(UserJobInteraction).filter(
        UserJobInteraction.user_id == str(current_user.id),
        UserJobInteraction.action == 'saved'
    ).all()
    
    result = []
    for saved in saved_jobs:
        # Try to find the job in corporate_jobs first
        corporate_job = db.query(CorporateJob).filter(
            CorporateJob.job_id == saved.job_id
        ).first()
        
        if corporate_job:
            # Corporate job found
            result.append({
                "id": saved.event_id,  # Frontend expects 'id'
                "event_id": saved.event_id,  # Keep backend field for compatibility
                "job_id": saved.job_id,
                "saved_at": saved.timestamp.isoformat() if saved.timestamp else None,
                "job": {
                    "id": corporate_job.job_id,
                    "title": corporate_job.title,
                    "company": corporate_job.company,
                    "category": corporate_job.category,
                    "location": f"{corporate_job.location_city}, {corporate_job.location_province}" if corporate_job.location_city else corporate_job.location_province,
                    "employment_type": corporate_job.employment_type,
                    "salary_range": f"ZMW {corporate_job.salary_min_zmw:,.0f} - {corporate_job.salary_max_zmw:,.0f}" if corporate_job.salary_min_zmw else None,
                    "posted_date": corporate_job.posted_date.isoformat() if corporate_job.posted_date else None,
                    "job_type": "corporate"
                }
            })
        else:
            # Try small_jobs table
            small_job = db.query(SmallJob).filter(
                SmallJob.id == saved.job_id
            ).first()
            
            if small_job:
                result.append({
                    "id": saved.event_id,  # Frontend expects 'id'
                    "event_id": saved.event_id,  # Keep backend field for compatibility
                    "job_id": saved.job_id,
                    "saved_at": saved.timestamp.isoformat() if saved.timestamp else None,
                    "job": {
                        "id": small_job.id,
                        "title": small_job.title,
                        "company": "Personal Employer",
                        "category": small_job.category,
                        "location": small_job.location if small_job.location else small_job.province,
                        "employment_type": "Task-based",
                        "salary_range": f"ZMW {small_job.budget:,.0f}" if small_job.budget else None,
                        "posted_date": small_job.date_posted.isoformat() if small_job.date_posted else None,
                        "job_type": "personal"
                    }
                })
    
    return result


@router.post("/candidate/saved-jobs/{job_id}")
def save_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save/bookmark a job
    """
    # Check if already saved
    existing = db.query(UserJobInteraction).filter(
        UserJobInteraction.user_id == str(current_user.id),
        UserJobInteraction.job_id == job_id,
        UserJobInteraction.action == 'saved'
    ).first()
    
    if existing:
        return {
            "id": existing.event_id,  # Frontend expects 'id'
            "event_id": existing.event_id,  # Keep backend field for compatibility
            "job_id": job_id,
            "saved_at": existing.timestamp.isoformat() if existing.timestamp else None
        }
    
    # Create bookmark
    import uuid
    bookmark = UserJobInteraction(
        event_id=f"save_{uuid.uuid4().hex[:12]}",
        user_id=str(current_user.id),
        job_id=job_id,
        action='saved',
        job_type='corporate' if not job_id.startswith('SMALL') else 'small_job'
    )
    
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    
    return {
        "id": bookmark.event_id,  # Frontend expects 'id'
        "event_id": bookmark.event_id,  # Keep backend field for compatibility
        "job_id": job_id,
        "saved_at": bookmark.timestamp.isoformat() if bookmark.timestamp else None
    }


@router.delete("/candidate/saved-jobs/{job_id}")
def unsave_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unsave/unbookmark a job
    """
    bookmark = db.query(UserJobInteraction).filter(
        UserJobInteraction.user_id == str(current_user.id),
        UserJobInteraction.job_id == job_id,
        UserJobInteraction.action == 'saved'
    ).first()
    
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found"
        )
    
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Job unsaved successfully"}


@router.get("/candidate/saved-jobs/{job_id}/check")
def check_job_saved(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a job is saved by the current user
    """
    saved = db.query(UserJobInteraction).filter(
        UserJobInteraction.user_id == str(current_user.id),
        UserJobInteraction.job_id == job_id,
        UserJobInteraction.action == 'saved'
    ).first()
    
    return {"is_saved": saved is not None}


# ============================================================================
# RESUME/CV UPLOAD
# ============================================================================

@router.post("/candidate/resume/upload")
async def upload_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload candidate resume/CV
    
    TODO: Implement file upload handling
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Resume upload not yet implemented"
    )
