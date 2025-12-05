"""
CAMSS 2.0 - Match API Endpoints
================================
FastAPI endpoints for job matching functionality using improved matching algorithm.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.cv import CV
from app.services.matching_service import MatchingService
from app.schemas.matching import MatchRequest, MatchResponse
import time

router = APIRouter()


# ============================================================================
# NEW IMPROVED ENDPOINTS
# ============================================================================

@router.post(
    "/candidate/{cv_id}",
    response_model=MatchResponse,
    summary="Get job recommendations for a candidate",
    description="""
    Find and rank job matches for a specific candidate using CAMSS 2.0 algorithm.
    
    **Matching Factors:**
    - Location proximity (35% weight)
    - Salary alignment (30% weight)
    - Skills overlap (25% weight)
    - Experience match (10% weight)
    - Contextual boosts (mining sector, government jobs, remote work)
    """
)
async def get_candidate_matches(
    cv_id: str,
    request: MatchRequest,
    db: Session = Depends(get_db)
):
    """Get ranked job matches for a candidate."""
    try:
        matching_service = MatchingService(db)
        
        result = matching_service.find_matches(
            cv_id=cv_id,
            job_type=request.job_type,
            limit=request.limit,
            min_score=request.min_score,
            filters=request.filters
        )
        
        if 'error' in result:
            raise HTTPException(status_code=404, detail=result['error'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/candidate/{cv_id}/quick",
    response_model=MatchResponse,
    summary="Quick match with default parameters"
)
async def get_quick_matches(
    cv_id: str,
    db: Session = Depends(get_db)
):
    """Get top 20 job matches with default settings."""
    request = MatchRequest(job_type='both', limit=20, min_score=0.4)
    return await get_candidate_matches(cv_id, request, db)


@router.get(
    "/candidate/{cv_id}/filtered",
    response_model=MatchResponse,
    summary="Get filtered job matches"
)
async def get_filtered_matches(
    cv_id: str,
    job_type: str = Query(default='both'),
    limit: int = Query(default=20, ge=1, le=100),
    min_score: float = Query(default=0.3, ge=0.0, le=1.0),
    location_city: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    min_salary: Optional[float] = Query(default=None),
    db: Session = Depends(get_db)
):
    """Get matches with URL query parameter filters."""
    filters = {}
    if location_city:
        filters['location_city'] = location_city
    if category:
        filters['category'] = category
    if min_salary:
        filters['min_salary'] = min_salary
    
    request = MatchRequest(
        job_type=job_type,
        limit=limit,
        min_score=min_score,
        filters=filters if filters else None
    )
    
    return await get_candidate_matches(cv_id, request, db)


# ============================================================================
# USER-FACING ENDPOINTS (with authentication)
# ============================================================================

@router.get("/ai/jobs")
def get_ai_matched_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    top_k: int = Query(20, ge=1, le=50),
    job_type: str = Query('both')
):
    """
    Get AI-matched jobs for the current logged-in user.
    
    - **top_k**: Number of top matches to return (1-50)
    - **job_type**: 'corp', 'small', or 'both'
    
    Uses CAMSS 2.0 algorithm with Zambian market context.
    """
    try:
        # Find user's CV by email
        cv = db.query(CV).filter(CV.email == current_user.email).first()
        
        if not cv:
            return {
                "user_id": current_user.id,
                "matches": [],
                "total_jobs_scored": 0,
                "message": "No CV data available. Please upload your CV."
            }
        
        # Get matches using new service
        matching_service = MatchingService(db)
        result = matching_service.find_matches(
            cv_id=cv.cv_id,
            job_type=job_type,
            limit=top_k,
            min_score=0.3
        )
        
        if 'error' in result:
            return {
                "user_id": current_user.id,
                "matches": [],
                "total_jobs_scored": 0,
                "message": result['error']
            }
        
        # Transform to frontend-expected format
        formatted_matches = []
        for match in result['matches']:
            formatted_matches.append({
                "job": {
                    "id": match['job_id'],
                    "job_id": match['job_id'],
                    "type": match['job_type'],
                    "title": match['title'],
                    "company": match['company'],
                    "location": match.get('location_city', 'N/A'),
                    "salary_range": f"ZMW {match.get('salary_max_zmw', match.get('budget', 'N/A')):,.0f}" if match.get('salary_max_zmw') or match.get('budget') else 'N/A',
                    "category": match.get('category', 'Unknown'),
                    "is_active": True
                },
                "match_score": round(match['match_score'] * 100, 1),  # Convert to percentage
                "explanation": ", ".join(match['match_reasons']),
                "components": match['match_breakdown'],
                "matched_skills": match['matched_skills'],
                "missing_skills": match['missing_skills']
            })
        
        return {
            "user_id": current_user.id,
            "cv_id": cv.cv_id,
            "matches": formatted_matches,
            "total_jobs_scored": result['total_matches']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in get_ai_matched_jobs: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating AI matches: {str(e)}")


@router.get("/ai/job/{job_id}")
def get_job_match_score(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed match score for a specific job.
    
    Returns match breakdown and explanation.
    """
    try:
        # Find user's CV
        cv = db.query(CV).filter(CV.email == current_user.email).first()
        
        if not cv:
            return {
                "match_score": 0,
                "explanation": "No CV found. Please create your profile.",
                "components": {},
                "user_id": current_user.id,
                "job_id": job_id
            }
        
        # Get all matches and find this job
        matching_service = MatchingService(db)
        result = matching_service.find_matches(
            cv_id=cv.cv_id,
            job_type='both',
            limit=100,
            min_score=0.0
        )
        
        # Find specific job
        job_match = None
        for match in result.get('matches', []):
            if match['job_id'] == job_id:
                job_match = match
                break
        
        if not job_match:
            return {
                "match_score": 0,
                "explanation": "Match score not available for this job.",
                "components": {},
                "user_id": current_user.id,
                "job_id": job_id
            }
        
        return {
            "match_score": round(job_match['match_score'] * 100, 1),
            "explanation": ", ".join(job_match['match_reasons']),
            "components": job_match['match_breakdown'],
            "matched_skills": job_match['matched_skills'],
            "missing_skills": job_match['missing_skills'],
            "user_id": current_user.id,
            "job_id": job_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in get_job_match_score: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error getting job match score: {str(e)}")


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "matching",
        "version": "2.0.0",
        "algorithm": "CAMSS 2.0"
    }


@router.get("/test")
def test_matching(db: Session = Depends(get_db)):
    """Test endpoint to verify matching service is working."""
    try:
        matching_service = MatchingService(db)
        
        # Get first CV
        cv = db.query(CV).first()
        if not cv:
            return {"status": "error", "message": "No CVs found in database"}
        
        # Get one match
        result = matching_service.find_matches(cv.cv_id, limit=1, min_score=0.0)
        
        return {
            "status": "success",
            "message": "Matching service is working",
            "test_cv": result.get('candidate_name'),
            "test_matches": len(result.get('matches', []))
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
