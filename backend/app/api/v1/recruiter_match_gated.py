"""
SPRINT A - Updated Recruiter Match API
=======================================
Uses new GatedMatchingService with hard gates
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()


class CandidateMatch(BaseModel):
    """Schema for candidate match response"""
    cv_id: str
    full_name: str
    current_job_title: str
    total_years_experience: int
    city: str
    email: str
    phone: str
    match_score: float  # Percentage (0-100)
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str


class JobMatchResponse(BaseModel):
    """Response schema for job matching"""
    job_id: str
    job_title: str
    company: str
    total_candidates: int
    matched_candidates: List[CandidateMatch]


@router.get(
    "/job/{job_id}/candidates",
    response_model=JobMatchResponse,
    summary="Find best candidates for a job (GATED)",
)
async def get_job_candidates(
    job_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    min_score: float = Query(default=0.45, ge=0.0, le=1.0, description="Minimum match score (0-1)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get ranked candidates for a job with HARD GATING.
    
    **Sprint A Changes:**
    - Hard gate: 0 matched skills → excluded
    - No base score padding
    - Min score filter applied early
    - Transparent scoring
    
    **Performance:**
    - Fast: Early exits save computation
    - Quality: Only relevant candidates
    """
    try:
        from app.models.corporate_job import CorporateJob
        from app.services.gated_matching_service import match_job_with_gates
        
        # Get job details
        job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
        
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        print(f"🔍 Matching candidates for job: {job.title}")
        print(f"   Min score threshold: {min_score * 100}%")
        
        # Use gated matching service
        matches = match_job_with_gates(
            db=db,
            job_id=job_id,
            min_score=min_score,
            limit=limit
        )
        
        print(f"✅ Found {len(matches)} candidates passing gates")
        
        # Convert to response model
        candidates = [
            CandidateMatch(
                cv_id=m['cv_id'],
                full_name=m['full_name'],
                current_job_title=m['current_job_title'],
                total_years_experience=m['total_years_experience'],
                city=m['city'],
                email=m['email'],
                phone=m['phone'] or '',
                match_score=m['match_score'],
                matched_skills=m['matched_skills'],
                missing_skills=m['missing_skills'],
                explanation=m['explanation']
            )
            for m in matches
        ]
        
        return JobMatchResponse(
            job_id=job_id,
            job_title=job.title,
            company=job.company if hasattr(job, 'company') else 'N/A',
            total_candidates=len(candidates),
            matched_candidates=candidates
        )
        
    except Exception as e:
        print(f"❌ Error matching candidates: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error matching candidates: {str(e)}"
        )


@router.get(
    "/job/{job_id}/candidates/debug",
    summary="Debug endpoint - shows gating stats"
)
async def debug_job_matching(
    job_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Debug endpoint to see how many candidates pass each gate.
    
    Useful for understanding why certain candidates are excluded.
    """
    from app.models.corporate_job import CorporateJob
    from app.models.cv import CV
    from app.services.gated_matching_service import GatedMatchingService
    
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    service = GatedMatchingService(db)
    
    # Get job skills
    job_skills = service._extract_job_skills(job)
    
    # Stats
    total_cvs = db.query(CV).count()
    passed_gate_1 = 0  # Has at least 1 matched skill
    passed_gate_2 = 0  # Score >= 0.45
    
    cvs = db.query(CV).all()
    for cv in cvs:
        cv_skills = service._extract_cv_skills(cv)
        matched_skills, missing_skills = service._intersect_skills(cv_skills, job_skills)
        
        if len(matched_skills) > 0:
            passed_gate_1 += 1
            
            # Compute score
            score = service._compute_gated_score(
                cv, job, cv_skills, job_skills, matched_skills, missing_skills
            )
            
            if score >= 0.45:
                passed_gate_2 += 1
    
    return {
        "job_id": job_id,
        "job_title": job.title,
        "job_skills": job_skills,
        "stats": {
            "total_cvs": total_cvs,
            "gate_1_passed": passed_gate_1,
            "gate_1_failed": total_cvs - passed_gate_1,
            "gate_1_pass_rate": f"{(passed_gate_1 / total_cvs * 100) if total_cvs > 0 else 0:.1f}%",
            "gate_2_passed": passed_gate_2,
            "gate_2_failed": passed_gate_1 - passed_gate_2,
            "gate_2_pass_rate": f"{(passed_gate_2 / passed_gate_1 * 100) if passed_gate_1 > 0 else 0:.1f}%",
        },
        "explanation": {
            "gate_1": "0 matched skills → excluded",
            "gate_2": "Score < 45% → excluded"
        }
    }
