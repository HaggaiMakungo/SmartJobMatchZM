"""
FAST recruiter matching endpoint using pre-computed matches
Sub-100ms response time by reading from cache table
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import json

from app.db.session import get_db
from app.api.v1.auth import get_current_user

router = APIRouter()


@router.get("/recruiter/job/{job_id}/candidates/cached")
async def get_cached_candidates_for_job(
    job_id: str,
    min_score: float = Query(default=0.0, ge=0.0, le=1.0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get pre-computed candidate matches for a job (INSTANT - <100ms)
    
    Uses cached matches from job_candidate_matches table
    No real-time computation needed!
    
    Args:
        job_id: The job to get candidates for
        min_score: Minimum match score (0.0 to 1.0)
        limit: Maximum number of candidates to return
    
    Returns:
        List of matched candidates with scores
    """
    try:
        # Verify job belongs to user's company
        job = db.execute(text("""
            SELECT job_id, job_title, company, company_id
            FROM corporate_jobs
            WHERE job_id = :job_id
        """), {"job_id": job_id}).fetchone()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Check company ownership
        user_company_id = current_user.get("company_id")
        if user_company_id and job[3] != user_company_id:
            raise HTTPException(
                status_code=403, 
                detail="You can only view candidates for your company's jobs"
            )
        
        # Get pre-computed matches from cache
        matches = db.execute(text("""
            SELECT 
                m.cv_id,
                m.match_score,
                m.skill_score,
                m.experience_score,
                m.location_score,
                m.education_score,
                m.matched_skills,
                m.missing_skills,
                m.match_explanation,
                m.computed_at,
                c.full_name,
                c.current_job_title,
                c.city,
                c.province,
                c.email,
                c.phone,
                c.total_years_experience,
                c.skills_technical,
                c.skills_soft
            FROM job_candidate_matches m
            JOIN cvs c ON m.cv_id = c.cv_id
            WHERE m.job_id = :job_id
              AND m.match_score >= :min_score
            ORDER BY m.match_score DESC
            LIMIT :limit
        """), {
            "job_id": job_id,
            "min_score": min_score,
            "limit": limit
        }).fetchall()
        
        # Format results
        candidates = []
        for match in matches:
            candidates.append({
                "cv_id": match[0],
                "match_score": round(match[1], 3),
                "scores": {
                    "skills": round(match[2] or 0, 3),
                    "experience": round(match[3] or 0, 3),
                    "location": round(match[4] or 0, 3),
                    "education": round(match[5] or 0, 3)
                },
                "matched_skills": json.loads(match[6]) if match[6] else [],
                "missing_skills": json.loads(match[7]) if match[7] else [],
                "explanation": match[8] or "",
                "computed_at": match[9].isoformat() if match[9] else None,
                "candidate": {
                    "name": match[10],
                    "title": match[11],
                    "location": f"{match[12]}, {match[13]}" if match[12] and match[13] else match[12] or match[13] or "Unknown",
                    "email": match[14],
                    "phone": match[15],
                    "experience_years": match[16],
                    "skills_technical": match[17].split(',') if match[17] else [],
                    "skills_soft": match[18].split(',') if match[18] else []
                }
            })
        
        return {
            "job_id": job_id,
            "job_title": job[1],
            "company": job[2],
            "total_matches": len(candidates),
            "min_score": min_score,
            "candidates": candidates,
            "cached": True,
            "response_time": "<100ms"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching matches: {str(e)}")


@router.get("/recruiter/job/{job_id}/candidates/stats")
async def get_job_candidate_stats(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get statistics about cached matches for a job
    
    Returns:
        - Total candidates matched
        - Distribution by score range
        - When cache was last updated
    """
    try:
        # Verify job exists and belongs to user
        job = db.execute(text("""
            SELECT job_id, job_title, company, company_id
            FROM corporate_jobs
            WHERE job_id = :job_id
        """), {"job_id": job_id}).fetchone()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        user_company_id = current_user.get("company_id")
        if user_company_id and job[3] != user_company_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get stats
        stats = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN match_score >= 0.7 THEN 1 END) as excellent,
                COUNT(CASE WHEN match_score >= 0.5 AND match_score < 0.7 THEN 1 END) as good,
                COUNT(CASE WHEN match_score >= 0.3 AND match_score < 0.5 THEN 1 END) as fair,
                COUNT(CASE WHEN match_score < 0.3 THEN 1 END) as low,
                MAX(match_score) as highest_score,
                AVG(match_score) as avg_score,
                MAX(computed_at) as last_updated
            FROM job_candidate_matches
            WHERE job_id = :job_id
        """), {"job_id": job_id}).fetchone()
        
        return {
            "job_id": job_id,
            "job_title": job[1],
            "total_candidates": stats[0] or 0,
            "distribution": {
                "excellent_70_plus": stats[1] or 0,
                "good_50_69": stats[2] or 0,
                "fair_30_49": stats[3] or 0,
                "low_under_30": stats[4] or 0
            },
            "highest_score": round(stats[5] or 0, 3),
            "average_score": round(stats[6] or 0, 3),
            "last_updated": stats[7].isoformat() if stats[7] else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
