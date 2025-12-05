"""
CAMSS 2.0 - Recruiter Matching API (SIMPLIFIED)
================================================
Reverse matching: Find best candidates for a specific job posting.
Uses the existing enhanced matching service but inverts the logic.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
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
    phone: Optional[str]
    match_score: float
    match_percentage: float
    match_reason: str
    matched_skills: List[str]
    missing_skills: List[str]


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
    summary="Find best candidates for a job",
)
async def get_job_candidates(
    job_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    min_score: float = Query(default=0.3, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get ranked candidates for a job posting.
    
    Uses enhanced matching service to rank ALL CVs against this specific job.
    """
    try:
        # Import here to avoid circular dependencies
        from app.models.corporate_job import CorporateJob
        from app.models.small_job import SmallJob
        from app.models.cv import CV
        from app.services.enhanced_matching_service import EnhancedMatchingService
        
        # Get job details
        job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
        job_type = 'corporate'
        
        if not job:
            job = db.query(SmallJob).filter(SmallJob.job_id == job_id).first()
            job_type = 'small'
        
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        # Get all CVs
        all_cvs = db.query(CV).all()
        
        if not all_cvs:
            return JobMatchResponse(
                job_id=job_id,
                job_title=job.title,
                company=job.company if hasattr(job, 'company') else 'N/A',
                total_candidates=0,
                matched_candidates=[]
            )
        
        print(f"Processing {len(all_cvs)} CVs for job {job_id}...")
        
        # Initialize enhanced matching service
        matching_service = EnhancedMatchingService(db)
        
        # Match each CV against this job
        candidate_matches = []
        
        for cv in all_cvs:
            try:
                # Use the enhanced matching service for THIS SPECIFIC CV
                # It will return all job matches, we'll filter for our job
                matches = matching_service.match_candidate(
                    cv_id=cv.cv_id,
                    job_type=job_type,
                    filters=None,  # No filters - we want to find our specific job
                    limit=1000  # High limit to ensure we find our job
                )
                
                # Find this specific job in the matches
                job_match = None
                for match in matches:
                    if match['job_id'] == job_id:
                        job_match = match
                        break
                
                # If we found a match and it meets the threshold
                if job_match and job_match['final_score'] >= min_score:
                    # Extract matched and missing skills
                    matched_skills = []
                    missing_skills = []
                    
                    if 'matched_skills' in job_match:
                        matched_skills = job_match['matched_skills']
                    if 'missing_skills' in job_match:
                        missing_skills = job_match['missing_skills']
                    
                    candidate_matches.append({
                        'cv_id': cv.cv_id,
                        'full_name': cv.full_name,
                        'current_job_title': cv.current_job_title or 'N/A',
                        'total_years_experience': cv.total_years_experience or 0,
                        'city': cv.city or 'N/A',
                        'email': cv.email,
                        'phone': cv.phone,
                        'match_score': job_match['final_score'],
                        'match_percentage': round(job_match['final_score'] * 100, 1),
                        'match_reason': job_match.get('explanation', 'Skills and experience match'),
                        'matched_skills': matched_skills,
                        'missing_skills': missing_skills,
                    })
                    
            except Exception as e:
                # Skip problematic CVs but log the error
                print(f"Error matching CV {cv.cv_id}: {str(e)}")
                continue
        
        # Sort by match score (highest first)
        candidate_matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Limit results
        candidate_matches = candidate_matches[:limit]
        
        print(f"Found {len(candidate_matches)} matching candidates")
        
        return JobMatchResponse(
            job_id=job_id,
            job_title=job.title,
            company=job.company if hasattr(job, 'company') else 'N/A',
            total_candidates=len(candidate_matches),
            matched_candidates=candidate_matches
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_job_candidates: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error finding candidates: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "recruiter_matching",
        "version": "2.0.0"
    }
