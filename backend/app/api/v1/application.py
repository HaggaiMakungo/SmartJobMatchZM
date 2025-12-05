"""
Application API Endpoints
Handles job application management for recruiters
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Application
from app.services.application_service import ApplicationService
from app.schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    ApplicationListResponse, ApplicationStats, ApplicationStatus
)

router = APIRouter()


@router.post("/applications/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Apply to a job (candidate endpoint)
    
    Creates a new application for the current user's CV
    """
    from app.services.cv_service import CVService
    
    # Get user's CV
    cv = CVService.get_cv_by_email(db, current_user.email)
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found. Please create your CV before applying."
        )
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.cv_id == cv.cv_id,
        Application.job_id == application_data.job_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Calculate match score (placeholder - integrate with matching service)
    match_score = 75.0  # TODO: Calculate actual match score
    
    application = ApplicationService.create_application(
        db=db,
        cv_id=cv.cv_id,
        application_data=application_data,
        match_score=match_score
    )
    
    return application


@router.get("/applications", response_model=ApplicationListResponse)
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[ApplicationStatus] = None,
    job_id: Optional[str] = None,
    search: Optional[str] = None,
    min_match_score: Optional[float] = None
):
    """
    List all applications (recruiter endpoint)
    
    Returns applications with candidate and job details
    """
    applications, total = ApplicationService.list_applications_with_details(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        job_id=job_id,
        search=search
    )
    
    # Filter by match score if provided
    if min_match_score:
        applications = [app for app in applications if app.get('match_score', 0) >= min_match_score]
        total = len(applications)
    
    return ApplicationListResponse(
        total=total,
        applications=applications,
        page=(skip // limit) + 1,
        page_size=limit,
        has_more=(skip + limit) < total
    )


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get application details by ID
    
    Returns full application with candidate and job details
    """
    application = ApplicationService.get_application_with_details(db, application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    return application


@router.patch("/applications/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status: ApplicationStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update application status (recruiter endpoint)
    
    Move application through hiring pipeline: new -> screening -> interview -> offer -> hired/rejected
    """
    from app.schemas.application import ApplicationUpdate
    
    update_data = ApplicationUpdate(status=status)
    application = ApplicationService.update_application(db, application_id, update_data)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    return ApplicationService.get_application_with_details(db, application_id)


@router.patch("/applications/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    application_data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update application details (recruiter endpoint)
    
    Update notes, interview date, rating, tags, etc.
    """
    application = ApplicationService.update_application(db, application_id, application_data)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    return ApplicationService.get_application_with_details(db, application_id)


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete application (recruiter endpoint)
    
    Permanently removes application from database
    """
    deleted = ApplicationService.delete_application(db, application_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    return None


@router.get("/applications/stats/overview", response_model=ApplicationStats)
def get_application_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    job_id: Optional[str] = None
):
    """
    Get application statistics (recruiter endpoint)
    
    Returns counts by status and average match score
    """
    stats = ApplicationService.get_application_stats(db, job_id)
    return stats


@router.post("/applications/bulk/update-status")
def bulk_update_status(
    application_ids: List[int],
    new_status: ApplicationStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk update application status (recruiter endpoint)
    
    Update multiple applications at once
    """
    updated_count = ApplicationService.bulk_update_status(db, application_ids, new_status)
    
    return {
        "success": True,
        "updated_count": updated_count,
        "new_status": new_status
    }


@router.get("/applications/job/{job_id}", response_model=ApplicationListResponse)
def get_job_applications(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[ApplicationStatus] = None
):
    """
    Get all applications for a specific job (recruiter endpoint)
    
    Returns applications with candidate details
    """
    applications, total = ApplicationService.list_applications_with_details(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        job_id=job_id
    )
    
    return ApplicationListResponse(
        total=total,
        applications=applications,
        page=(skip // limit) + 1,
        page_size=limit,
        has_more=(skip + limit) < total
    )


@router.get("/applications/my-applications", response_model=ApplicationListResponse)
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[ApplicationStatus] = None
):
    """
    Get current user's applications (candidate endpoint)
    
    Returns all applications submitted by the logged-in candidate
    """
    from app.services.cv_service import CVService
    
    # Get user's CV
    cv = CVService.get_cv_by_email(db, current_user.email)
    
    if not cv:
        return ApplicationListResponse(
            total=0,
            applications=[],
            page=1,
            page_size=limit,
            has_more=False
        )
    
    applications, total = ApplicationService.list_applications_with_details(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        job_id=None  # Get all jobs
    )
    
    # Filter to only this user's applications
    my_apps = [app for app in applications if app['cv_id'] == cv.cv_id]
    
    return ApplicationListResponse(
        total=len(my_apps),
        applications=my_apps,
        page=(skip // limit) + 1,
        page_size=limit,
        has_more=len(my_apps) > (skip + limit)
    )
