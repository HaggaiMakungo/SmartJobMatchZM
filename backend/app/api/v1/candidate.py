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
    db: Session = Depends(get_db)
):
    """
    Get candidate profile (DEMO MODE - NO AUTH)
    
    Returns mock profile data for demonstration
    """
    # Return mock profile data for demo
    profile_data = {
        "id": 1,
        "user_id": 1,
        "cv_id": "CV_000001",
        "full_name": "Brian Mwale",
        "email": "brian.mwale@example.com",
        "phone": "+260 977 123 456",
        "location": "Lusaka, Zambia",
        "bio": "Bachelor's Degree graduate with 3 years of experience in Software Development",
        "skills": ["Python", "JavaScript", "React", "Node.js", "SQL", "Git"],
        "education": [{
            "degree": "Bachelor's Degree in Computer Science",
            "institution": "University of Zambia",
            "year": 2020
        }],
        "experience": [{
            "title": "Software Developer",
            "company": "Tech Solutions Ltd",
            "duration": "2020 - 2023",
            "description": "Full stack web development using React and Node.js"
        }],
        "profile_picture_url": None,
        "resume_url": None,
        "profile_strength": 75
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
    db: Session = Depends(get_db)
):
    """
    Get candidate's job applications (DEMO MODE - NO AUTH)
    
    Returns mock application data for demonstration
    """
    # Return mock applications for demo
    return [
        {
            "id": "app_001",
            "event_id": "app_001",
            "job_id": "JOB000001",
            "status": "pending",
            "applied_at": "2025-12-15T10:30:00",
            "updated_at": "2025-12-15T10:30:00",
            "job": {
                "id": "JOB000001",
                "title": "Software Developer",
                "company": "Tech Solutions Ltd",
                "location": "Lusaka, Lusaka Province",
                "category": "Technology",
                "employment_type": "Full-time",
                "salary_range": "ZMW 8,000 - 15,000",
                "job_type": "corporate"
            }
        },
        {
            "id": "app_002",
            "event_id": "app_002",
            "job_id": "JOB000003",
            "status": "pending",
            "applied_at": "2025-12-18T14:20:00",
            "updated_at": "2025-12-18T14:20:00",
            "job": {
                "id": "JOB000003",
                "title": "Data Analyst",
                "company": "Zambia Analytics Corp",
                "location": "Lusaka, Lusaka Province",
                "category": "Technology",
                "employment_type": "Full-time",
                "salary_range": "ZMW 6,500 - 12,000",
                "job_type": "corporate"
            }
        }
    ]


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
    db: Session = Depends(get_db)
):
    """
    Get candidate's saved jobs (DEMO MODE - NO AUTH)
    
    Returns mock saved jobs data for demonstration
    """
    # Return mock saved jobs for demo
    return [
        {
            "id": "save_001",
            "event_id": "save_001",
            "job_id": "JOB000002",
            "saved_at": "2025-12-10T09:15:00",
            "job": {
                "id": "JOB000002",
                "title": "Marketing Manager",
                "company": "Zambia Marketing Solutions",
                "category": "Marketing",
                "location": "Lusaka, Lusaka Province",
                "employment_type": "Full-time",
                "salary_range": "ZMW 10,000 - 18,000",
                "posted_date": "2025-12-01",
                "job_type": "corporate"
            }
        },
        {
            "id": "save_002",
            "event_id": "save_002",
            "job_id": "JOB000005",
            "saved_at": "2025-12-12T16:45:00",
            "job": {
                "id": "JOB000005",
                "title": "Network Engineer",
                "company": "Zambia Online",
                "category": "Technology",
                "location": "Lusaka, Lusaka Province",
                "employment_type": "Full-time",
                "salary_range": "ZMW 10,000 - 19,000",
                "posted_date": "2025-11-25",
                "job_type": "corporate"
            }
        }
    ]


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
