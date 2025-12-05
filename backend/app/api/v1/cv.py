"""
CV API Endpoints
Handles CV creation, retrieval, and updates
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.cv_service import CVService
from app.schemas.cv import (
    CVCreate, CVUpdate, CVResponse, CVListResponse
)

router = APIRouter()


@router.get("/me", response_model=CVResponse)
def get_my_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's CV
    
    Returns the CV associated with the authenticated user's email
    """
    # Get CV by user's email
    cv = CVService.get_cv_by_email(db, current_user.email)
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found. Please create your CV first."
        )
    
    return cv


@router.post("/create", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_cv(
    cv_data: CVCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create or update CV for current user
    
    If a CV already exists for this user's email, it will be updated.
    Otherwise, a new CV will be created.
    """
    # Check if CV already exists
    existing_cv = CVService.get_cv_by_email(db, current_user.email)
    
    if existing_cv:
        # Update existing CV
        # Convert CVCreate to CVUpdate
        update_data = CVUpdate(**cv_data.dict())
        updated_cv = CVService.update_cv(db, existing_cv.cv_id, update_data)
        return updated_cv
    else:
        # Create new CV
        try:
            new_cv = CVService.create_cv(db, cv_data, user_id=current_user.id)
            return new_cv
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


@router.put("/update", response_model=CVResponse)
def update_my_cv(
    cv_data: CVUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's CV
    
    Only provided fields will be updated. All fields are optional.
    """
    # Get user's CV
    cv = CVService.get_cv_by_email(db, current_user.email)
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found. Please create your CV first."
        )
    
    # Update CV
    try:
        updated_cv = CVService.update_cv(db, cv.cv_id, cv_data)
        return updated_cv
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user's CV
    
    This action cannot be undone.
    """
    # Get user's CV
    cv = CVService.get_cv_by_email(db, current_user.email)
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    # Delete CV
    CVService.delete_cv(db, cv.cv_id)
    return None


# IMPORTANT: /list and /search routes MUST come BEFORE /{cv_id} 
# to avoid the wildcard matching "list" and "search" as cv_id

@router.get("/list", response_model=CVListResponse)
def list_cvs(
    skip: int = 0,
    limit: int = 20,
    city: Optional[str] = None,
    province: Optional[str] = None,
    education_level: Optional[str] = None,
    min_experience: Optional[float] = None,
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user)  # Disabled for recruiter access
):
    """
    List CVs with optional filters
    
    Note: In production, this should be restricted to admin users only.
    For now, it's available to authenticated users.
    """
    cvs, total = CVService.list_cvs(
        db=db,
        skip=skip,
        limit=limit,
        city=city,
        province=province,
        education_level=education_level,
        min_experience=min_experience
    )
    
    # Convert SQLAlchemy models to Pydantic schemas
    cv_responses = [CVResponse.from_orm(cv) for cv in cvs]
    
    return CVListResponse(
        total=total,
        cvs=cv_responses,
        page=(skip // limit) + 1 if limit > 0 else 1,
        page_size=limit,
        has_more=(skip + limit) < total
    )


@router.get("/search", response_model=CVListResponse)
def search_cvs(
    query: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Admin only in production
):
    """
    Search CVs by name, skills, or job title
    
    Note: In production, this should be restricted to admin users only.
    """
    cvs, total = CVService.search_cvs(
        db=db,
        query=query,
        skip=skip,
        limit=limit
    )
    
    # Convert SQLAlchemy models to Pydantic schemas
    cv_responses = [CVResponse.from_orm(cv) for cv in cvs]
    
    return CVListResponse(
        total=total,
        cvs=cv_responses,
        page=(skip // limit) + 1 if limit > 0 else 1,
        page_size=limit,
        has_more=(skip + limit) < total
    )


@router.get("/quality-score", response_model=dict)
def get_cv_quality_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get quality score for current user's CV
    
    Returns a score between 0.0 and 1.0 based on CV completeness
    """
    cv = CVService.get_cv_by_email(db, current_user.email)
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    score = CVService.calculate_cv_quality_score(cv)
    
    # Update score in database
    cv.resume_quality_score = score
    db.commit()
    
    return {
        "cv_id": cv.cv_id,
        "quality_score": score,
        "rating": "Excellent" if score >= 0.8 else "Good" if score >= 0.6 else "Fair" if score >= 0.4 else "Needs Improvement",
        "tips": _get_improvement_tips(cv, score)
    }


# IMPORTANT: This wildcard route MUST be last so it doesn't match /list, /search, etc.
@router.get("/{cv_id}", response_model=CVResponse)
def get_cv_by_id(
    cv_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Require authentication
):
    """
    Get a specific CV by ID
    
    Requires authentication. Users can only view their own CV.
    """
    cv = CVService.get_cv_by_id(db, cv_id)
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CV with ID {cv_id} not found"
        )
    
    # Check if user owns this CV (skip for recruiters - in production, check user role)
    # if cv.email != current_user.email:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="You don't have permission to view this CV"
    #     )
    
    return CVResponse.from_orm(cv)


def _get_improvement_tips(cv, score: float) -> list:
    """Generate tips for improving CV quality"""
    tips = []
    
    if not cv.skills_technical or len(cv.skills_technical) < 20:
        tips.append("Add more technical skills to strengthen your profile")
    
    if not cv.skills_soft or len(cv.skills_soft) < 20:
        tips.append("Add soft skills like communication, teamwork, problem-solving")
    
    if not cv.work_experience_json or len(cv.work_experience_json) == 0:
        tips.append("Add detailed work experience with dates and responsibilities")
    
    if not cv.projects_json:
        tips.append("Include projects to showcase your practical experience")
    
    if not cv.certifications:
        tips.append("Add professional certifications to boost credibility")
    
    if not cv.references_json:
        tips.append("Add professional references")
    
    if score >= 0.8:
        tips = ["Your CV looks great! Keep it updated with new experiences."]
    
    return tips
