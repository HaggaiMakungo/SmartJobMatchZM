from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime
import json

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.saved_candidate import SavedCandidate
from app.models.cv import CV
from pydantic import BaseModel

router = APIRouter(prefix="/api/saved-candidates", tags=["saved_candidates"])


# Request/Response models
class SaveCandidateRequest(BaseModel):
    cv_id: str
    job_id: Optional[str] = None
    company_name: Optional[str] = None
    match_score: Optional[float] = None
    tags: Optional[List[str]] = None


class SaveCandidateResponse(BaseModel):
    success: bool
    message: str
    saved_candidate_id: Optional[int] = None


class UpdateStageRequest(BaseModel):
    stage: str  # saved, invited, screening, interview, offer, hired, rejected


@router.post("/save", response_model=SaveCandidateResponse)
async def save_candidate(
    request: SaveCandidateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a candidate to the recruiter's saved list"""
    
    # Get recruiter ID from authenticated user
    recruiter_id = str(current_user.id)
    company_name = current_user.company_name if hasattr(current_user, 'company_name') else None
    
    # Check if already saved
    existing = db.query(SavedCandidate).filter(
        and_(
            SavedCandidate.cv_id == request.cv_id,
            SavedCandidate.recruiter_id == recruiter_id
        )
    ).first()
    
    if existing:
        return SaveCandidateResponse(
            success=False,
            message="Candidate already saved",
            saved_candidate_id=existing.id
        )
    
    # Create new saved candidate
    saved_candidate = SavedCandidate(
        cv_id=request.cv_id,
        job_id=request.job_id,
        recruiter_id=recruiter_id,
        company_name=company_name or request.company_name,
        match_score=request.match_score,
        stage="saved",
        tags=json.dumps(request.tags) if request.tags else None,
        notes_count=0,
        contact_count=0
    )
    
    db.add(saved_candidate)
    db.commit()
    db.refresh(saved_candidate)
    
    return SaveCandidateResponse(
        success=True,
        message="Candidate saved successfully",
        saved_candidate_id=saved_candidate.id
    )


@router.delete("/unsave/{cv_id}")
async def unsave_candidate(
    cv_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a candidate from saved list"""
    
    recruiter_id = str(current_user.id)
    
    saved_candidate = db.query(SavedCandidate).filter(
        and_(
            SavedCandidate.cv_id == cv_id,
            SavedCandidate.recruiter_id == recruiter_id
        )
    ).first()
    
    if not saved_candidate:
        raise HTTPException(status_code=404, detail="Saved candidate not found")
    
    db.delete(saved_candidate)
    db.commit()
    
    return {"success": True, "message": "Candidate removed from saved list"}


@router.get("/list")
async def list_saved_candidates(
    current_user = Depends(get_current_user),
    stage: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    """Get all saved candidates for a recruiter"""
    
    recruiter_id = str(current_user.id)
    
    query = db.query(SavedCandidate).filter(
        SavedCandidate.recruiter_id == recruiter_id
    )
    
    if stage:
        query = query.filter(SavedCandidate.stage == stage)
    
    saved_candidates = query.order_by(SavedCandidate.saved_date.desc()).limit(limit).all()
    
    # Fetch CV details for each saved candidate
    result = []
    for saved in saved_candidates:
        cv = db.query(CV).filter(CV.cv_id == saved.cv_id).first()
        if cv:
            result.append({
                "saved_id": saved.id,
                "cv_id": saved.cv_id,
                "full_name": cv.full_name,
                "email": cv.email,
                "phone": cv.phone,
                "current_job_title": cv.current_job_title,
                "city": cv.city,
                "province": cv.province,
                "total_years_experience": cv.total_years_experience,
                "skills_technical": cv.skills_technical,
                "skills_soft": cv.skills_soft,
                "education_level": cv.education_level,
                "match_score": saved.match_score,
                "stage": saved.stage,
                "saved_date": saved.saved_date.isoformat() if saved.saved_date else None,
                "linked_job": saved.job_id,
                "company_name": saved.company_name,
                "tags": json.loads(saved.tags) if saved.tags else [],
                "notes_count": saved.notes_count,
                "last_contact": saved.last_contact.isoformat() if saved.last_contact else None,
                "contact_count": saved.contact_count
            })
    
    return {
        "success": True,
        "count": len(result),
        "candidates": result
    }


@router.patch("/{cv_id}/stage", response_model=SaveCandidateResponse)
async def update_candidate_stage(
    cv_id: str,
    request: UpdateStageRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the stage of a saved candidate"""
    
    recruiter_id = str(current_user.id)
    
    saved_candidate = db.query(SavedCandidate).filter(
        and_(
            SavedCandidate.cv_id == cv_id,
            SavedCandidate.recruiter_id == recruiter_id
        )
    ).first()
    
    if not saved_candidate:
        raise HTTPException(status_code=404, detail="Saved candidate not found")
    
    saved_candidate.stage = request.stage
    saved_candidate.last_updated = datetime.now()
    
    db.commit()
    
    return SaveCandidateResponse(
        success=True,
        message=f"Candidate stage updated to {request.stage}",
        saved_candidate_id=saved_candidate.id
    )


@router.get("/check/{cv_id}")
async def check_if_saved(
    cv_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if a candidate is saved"""
    
    recruiter_id = str(current_user.id)
    
    saved_candidate = db.query(SavedCandidate).filter(
        and_(
            SavedCandidate.cv_id == cv_id,
            SavedCandidate.recruiter_id == recruiter_id
        )
    ).first()
    
    return {
        "is_saved": saved_candidate is not None,
        "stage": saved_candidate.stage if saved_candidate else None,
        "saved_id": saved_candidate.id if saved_candidate else None
    }
