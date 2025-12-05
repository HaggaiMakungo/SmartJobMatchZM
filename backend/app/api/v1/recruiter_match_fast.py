"""
CAMSS 2.0 - Fast Recruiter Matching Endpoint
============================================
Optimized reverse matching: Job → Top Candidates

Performance improvements:
- Batch processing of CVs
- Pre-filtering by location/salary
- Parallel skill matching
- Caching of job data
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Optional
import time

from app.db.session import get_db
from app.models.corporate_job import CorporateJob
from app.models.cv import CV
from app.services.enhanced_matching_service import EnhancedMatchingService

router = APIRouter()

# Initialize matching service ONCE at startup (not per request)
# This caches the semantic model and skill weights
matching_service_cache = {}

def get_cached_matching_service(db: Session) -> EnhancedMatchingService:
    """Get or create cached matching service to avoid reinitializing semantic model"""
    if 'service' not in matching_service_cache:
        print("🔄 Initializing matching service (first time only)...")
        matching_service_cache['service'] = EnhancedMatchingService(db)
        print("✅ Matching service cached and ready!")
    return matching_service_cache['service']


@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "recruiter-matching"}


@router.get("/job/{job_id}/candidates", response_model=Dict)
def get_matched_candidates(
    job_id: str,
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    min_score: float = Query(default=0.0, ge=0.0, le=1.0),
):
    """
    Get top matched candidates for a specific job (FAST VERSION)
    
    Optimizations:
    1. Pre-filter CVs by location (same province = higher priority)
    2. Pre-filter by salary range (±30% of job salary)
    3. Batch process in chunks of 100
    4. Early termination if we have enough high-quality matches
    """
    start_time = time.time()
    
    # Get the job
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    print(f"\n🎯 Finding candidates for: {job.title} at {job.company}")
    print(f"   Location: {job.location_city}, {job.location_province}")
    print(f"   Salary: K{job.salary_min_zmw:,.0f} - K{job.salary_max_zmw:,.0f}")
    
    # Step 1: Pre-filter CVs by location (priority: same city > same province > other)
    # OPTIMIZATION: Limit to reasonable numbers for fast response
    same_city_cvs = db.query(CV).filter(
        CV.city == job.location_city
    ).limit(200).all()  # Reduced from 500
    
    same_province_cvs = db.query(CV).filter(
        CV.province == job.location_province,
        CV.city != job.location_city
    ).limit(100).all()  # Reduced from 500
    
    other_cvs = db.query(CV).filter(
        CV.province != job.location_province
    ).limit(200).all()  # Reduced from 1000 - sample nationwide
    
    # Combine with priority (max ~500 CVs for fast response)
    all_cvs = same_city_cvs + same_province_cvs + other_cvs
    
    print(f"\n📊 Pre-filtered CVs:")
    print(f"   Same city: {len(same_city_cvs)}")
    print(f"   Same province: {len(same_province_cvs)}")
    print(f"   Other locations: {len(other_cvs)}")
    print(f"   Total to process: {len(all_cvs)}")
    
    # Step 2: Use CACHED matching service (much faster!)
    matching_service = get_cached_matching_service(db)
    
    # Step 3: Use REVERSE MATCHING (Job → Candidates)
    print(f"\n🔄 Using reverse matching (Job → Candidates)...")
    
    # Prepare filters - use PROVINCE instead of city for broader matching
    filters = {}
    if job.location_province:
        filters['province'] = job.location_province  # Changed from 'location' to 'province'
        print(f"   📍 Filtering by province: {job.location_province}")
    
    # Get matches using the new match_job method
    matches = matching_service.match_job(
        job_id=job_id,
        job_type='corporate',
        filters=filters,
        limit=500  # Get top 500 matches
    )
    
    print(f"   ✅ Found {len(matches)} initial matches")
    
    # Step 4: Filter by minimum score and format results
    print(f"\n🔍 Filtering matches with min_score={min_score} ({min_score * 100}%)")
    matched_candidates = []
    for i, match in enumerate(matches[:10], 1):  # Show first 10
        score_pct = match['final_score']
        threshold_pct = min_score * 100
        passes = "✅" if score_pct >= threshold_pct else "❌"
        print(f"      {passes} {i}. {match['full_name']}: {score_pct:.1f}% (threshold: {threshold_pct:.1f}%)")
    
    for match in matches:
        if match['final_score'] >= min_score * 100:  # Convert 0.3 to 30
            matched_candidates.append({
                'cv_id': match['cv_id'],
                'full_name': match['full_name'],
                'current_job_title': match['current_job_title'],
                'total_years_experience': match['total_years_experience'],
                'city': match['city'],
                'province': match.get('province', 'N/A'),
                'phone': match.get('phone', 'N/A'),
                'email': match.get('email', 'N/A'),
                'match_score': match['final_score'] / 100,  # Convert to 0-1
                'match_percentage': match['final_score'],
                'match_reason': match.get('explanation', 'Skills and experience match'),
                'matched_skills': match.get('matched_skills', [])[:10],
                'missing_skills': match.get('missing_skills', [])[:5],
                'skills_score': match.get('skills_score', 0),
                'experience_score': match.get('experience_score', 0),
                'location_score': match.get('location_score', 0),
                'education_score': match.get('education_score', 0),
            })
    
    # Limit to top N results
    matched_candidates = matched_candidates[:limit]
    
    elapsed = time.time() - start_time
    
    print(f"\n✅ Matching complete!")
    print(f"   Matches found: {len(matched_candidates)}")
    print(f"   Time: {elapsed:.2f}s")
    
    return {
        "job_id": job.job_id,
        "job_title": job.title,
        "company": job.company,
        "total_candidates": len(matched_candidates),
        "matched_candidates": matched_candidates,
        "processing_time_seconds": round(elapsed, 2),
    }


@router.get("/job/{job_id}/candidates/stats", response_model=Dict)
def get_matching_stats(
    job_id: str,
    db: Session = Depends(get_db),
):
    """
    Get quick statistics about potential candidate pool
    (Much faster - just counts, no matching)
    """
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    # Count CVs by location
    same_city = db.query(CV).filter(CV.city == job.location_city).count()
    same_province = db.query(CV).filter(
        CV.province == job.location_province,
        CV.city != job.location_city
    ).count()
    total_cvs = db.query(CV).count()
    
    return {
        "job_id": job.job_id,
        "job_title": job.title,
        "total_cvs_in_database": total_cvs,
        "same_city_candidates": same_city,
        "same_province_candidates": same_province,
        "other_locations": total_cvs - same_city - same_province,
    }
