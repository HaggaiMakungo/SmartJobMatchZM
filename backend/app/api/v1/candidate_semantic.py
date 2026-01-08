"""
Candidate Semantic Matching API
Fast semantic job matching for job seekers using pre-computed embeddings
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import time

from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.services.fast_gated_matching_service import FastGatedMatchingService

router = APIRouter()


@router.get("/semantic/cv/{cv_id}/jobs")
def get_semantic_job_matches(
    cv_id: str,
    min_score: float = Query(0.0, ge=0.0, le=1.0, description="Minimum match score (0-1)"),
    top_k: int = Query(20, ge=1, le=100, description="Number of matches to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get semantic job matches for a candidate's CV
    
    Uses pre-computed embeddings for fast matching (<1 second)
    Returns jobs ranked by semantic similarity
    
    Args:
        cv_id: Candidate CV ID
        min_score: Minimum match score (0-1)
        top_k: Maximum number of matches to return
        
    Returns:
        {
            "cv_id": "CV123",
            "jobs": [...],
            "total_matches": 42,
            "processing_time": 0.65,
            "method": "semantic_matching",
            "model_used": "all-MiniLM-L6-v2"
        }
    """
    start_time = time.time()
    
    try:
        # Initialize fast semantic matching service
        service = FastSemanticMatchingService()
        
        # Get CV from database
        from app.models.cv import CV
        cv = db.query(CV).filter(CV.cv_id == cv_id).first()
        if not cv:
            raise HTTPException(status_code=404, detail=f"CV not found: {cv_id}")
        
        # Get all active jobs
        from app.models.corporate_job import CorporateJob
        jobs = db.query(CorporateJob).filter(CorporateJob.is_active == True).all()
        
        if not jobs:
            return {
                "cv_id": cv_id,
                "jobs": [],
                "total_matches": 0,
                "processing_time": time.time() - start_time,
                "method": "semantic_matching",
                "model_used": "all-MiniLM-L6-v2"
            }
        
        # Match CV against all jobs (reverse matching)
        all_matches = []
        
        for job in jobs:
            # Get semantic similarity
            similarity = service._compute_similarity(cv, job, db)
            
            if similarity >= min_score:
                # Extract skills
                cv_skills = service._extract_skills(cv.skills or "")
                job_skills = service._extract_skills(job.requirements or "")
                
                matched_skills = list(set(cv_skills) & set(job_skills))
                missing_skills = list(set(job_skills) - set(cv_skills))
                
                # Create match reason
                match_reason = f"Semantic similarity: {similarity:.1%}"
                if matched_skills:
                    match_reason += f" | Matched skills: {', '.join(matched_skills[:3])}"
                
                all_matches.append({
                    "job_id": job.job_id,
                    "title": job.title,
                    "company": job.company,
                    "location": job.location,
                    "salary_range": job.salary_range or "Negotiable",
                    "job_type": getattr(job, 'job_type', 'Full-time'),
                    "category": job.category,
                    "posted_date": job.posted_date.isoformat() if job.posted_date else None,
                    "match_score": round(similarity, 3),
                    "match_reason": match_reason,
                    "matched_skills": matched_skills,
                    "missing_skills": missing_skills[:5]  # Limit to 5
                })
        
        # Sort by match score (highest first)
        all_matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Limit to top_k
        top_matches = all_matches[:top_k]
        
        processing_time = time.time() - start_time
        
        return {
            "cv_id": cv_id,
            "jobs": top_matches,
            "total_matches": len(top_matches),
            "processing_time": round(processing_time, 2),
            "method": "semantic_matching",
            "model_used": "all-MiniLM-L6-v2"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")


@router.get("/semantic/cv/{cv_id}/stats")
def get_semantic_match_stats(
    cv_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get statistics about semantic matching readiness
    
    Returns:
        {
            "cv_has_embedding": true,
            "total_job_embeddings": 1011,
            "estimated_time": "~0.6s"
        }
    """
    try:
        # Check if CV exists
        from app.models.cv import CV
        cv = db.query(CV).filter(CV.cv_id == cv_id).first()
        if not cv:
            raise HTTPException(status_code=404, detail=f"CV not found: {cv_id}")
        
        # Check CV embedding
        from app.models.embedding import EmbeddingCache
        cv_embedding = db.query(EmbeddingCache).filter(
            EmbeddingCache.entity_id == cv_id,
            EmbeddingCache.entity_type == "cv"
        ).first()
        
        # Count job embeddings
        job_embedding_count = db.query(EmbeddingCache).filter(
            EmbeddingCache.entity_type == "job"
        ).count()
        
        # Count active jobs
        from app.models.corporate_job import CorporateJob
        active_job_count = db.query(CorporateJob).filter(
            CorporateJob.is_active == True
        ).count()
        
        # Estimate time (based on empirical measurements)
        # ~0.6s for 2500 CVs, scales roughly linearly
        estimated_time = f"~{max(0.3, active_job_count * 0.0002):.1f}s"
        
        return {
            "cv_has_embedding": cv_embedding is not None,
            "total_job_embeddings": job_embedding_count,
            "total_active_jobs": active_job_count,
            "estimated_time": estimated_time
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Stats failed: {str(e)}")
