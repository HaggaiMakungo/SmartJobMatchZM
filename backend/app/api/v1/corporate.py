"""
Corporate Jobs API for Recruiters/Employers
Handles corporate job management and candidate matching
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date
import re

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.corporate_job import CorporateJob
from app.models.cv import CV
from app.services.enhanced_matching_service import EnhancedMatchingService
from app.services.semantic_company_matcher import SemanticCompanyMatcher
from app.schemas.job import CorporateJobCreate, CorporateJobUpdate, CorporateJobResponse

router = APIRouter()

# 🏢 Initialize semantic company matcher (load once at startup)
company_matcher_cache = {}

def get_semantic_company_matcher(db: Session) -> SemanticCompanyMatcher:
    """Get or create cached semantic company matcher"""
    if 'matcher' not in company_matcher_cache:
        print("🔄 Initializing semantic company matcher (first time only)...")
        company_matcher_cache['matcher'] = SemanticCompanyMatcher(similarity_threshold=0.70)
        print("✅ Semantic company matcher ready!")
    return company_matcher_cache['matcher']


def extract_company_from_user(user) -> str:
    """
    Get company name from user object
    
    For CompanyUser (from corp_users table): Use company_name field
    For regular User: Extract from email
    
    Examples:
    - CompanyUser.company_name = "Zesco" -> "Zesco"
    - CompanyUser.company_name = "Zanaco" -> "Zanaco"
    - User with email dhl@company.zm -> "DHL"
    """
    # Use company_name field directly if available (CompanyUser from corp_users)
    if hasattr(user, 'company_name') and user.company_name:
        return user.company_name
    
    # Fallback: Extract from email prefix (legacy User table)
    if hasattr(user, 'email') and user.email:
        prefix = user.email.split('@')[0]
        return prefix.upper() if len(prefix) <= 4 else prefix.capitalize()
    
    return "Unknown Company"


def generate_job_id(company: str, db: Session) -> str:
    """
    Generate unique job ID based on company name
    
    Format: COMPANY_XXX (e.g., ZEDSAFE_001, ZEDSAFE_002)
    """
    # Clean company name for ID
    company_prefix = re.sub(r'[^A-Za-z0-9]', '', company).upper()[:10]
    
    # Find highest existing number for this company
    existing_jobs = db.query(CorporateJob).filter(
        CorporateJob.job_id.like(f"{company_prefix}_%")
    ).all()
    
    if existing_jobs:
        numbers = []
        for job in existing_jobs:
            try:
                num = int(job.job_id.split('_')[-1])
                numbers.append(num)
            except:
                continue
        next_num = max(numbers) + 1 if numbers else 1
    else:
        next_num = 1
    
    return f"{company_prefix}_{next_num:03d}"


# ============================================================================
# CREATE JOB (POST)
# ============================================================================

@router.post("/jobs", response_model=CorporateJobResponse, status_code=status.HTTP_201_CREATED)
def create_corporate_job(
    job_data: CorporateJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new corporate job posting
    
    - Validates job data
    - Extracts company from user's profile
    - Generates unique job_id
    - Sets status to 'draft' by default
    - Sets posted_date to today
    """
    # Extract company from user
    company = extract_company_from_user(current_user)
    
    # Generate job_id
    job_id = generate_job_id(company, db)
    
    # Create job
    new_job = CorporateJob(
        job_id=job_id,
        company=company,
        status='draft',  # Default to draft
        created_by=current_user.id,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        posted_date=date.today(),
        **job_data.dict()
    )
    
    try:
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        
        return new_job
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create job: {str(e)}"
        )


# ============================================================================
# UPDATE JOB (PUT)
# ============================================================================

@router.put("/jobs/{job_id}", response_model=CorporateJobResponse)
def update_corporate_job(
    job_id: str,
    job_data: CorporateJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing corporate job
    
    - Validates ownership (user's company = job's company)
    - Updates only provided fields (partial update)
    - Updates updated_at timestamp
    """
    # Get the job
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    # Verify ownership
    user_company = extract_company_from_user(current_user)
    if job.company != user_company:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this job"
        )
    
    # Update fields (only those provided)
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    # Update timestamp
    job.updated_at = datetime.now()
    
    try:
        db.commit()
        db.refresh(job)
        
        return job
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job: {str(e)}"
        )


# ============================================================================
# UPDATE JOB STATUS (PATCH)
# ============================================================================

@router.patch("/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    status_value: str = Query(..., alias="status", description="New status: draft, published, closed, archived"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update job status (publish, unpublish, close, archive)
    
    Valid status values:
    - draft: Job is being edited, not visible to candidates
    - published: Job is live and visible to candidates
    - closed: Job is no longer accepting applications
    - archived: Job is hidden from all lists
    """
    # Validate status
    valid_statuses = ['draft', 'published', 'closed', 'archived']
    if status_value not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Get the job
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    # Verify ownership
    user_company = extract_company_from_user(current_user)
    if job.company != user_company:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this job"
        )
    
    # Update status
    old_status = job.status
    job.status = status_value
    job.updated_at = datetime.now()
    
    try:
        db.commit()
        
        return {
            "success": True,
            "message": f"Job status updated from '{old_status}' to '{status_value}'",
            "job_id": job_id,
            "old_status": old_status,
            "new_status": status_value,
            "updated_at": job.updated_at.isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job status: {str(e)}"
        )


# ============================================================================
# DELETE JOB (DELETE)
# ============================================================================

@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_corporate_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a corporate job (soft delete by archiving)
    
    Note: This doesn't actually delete from database, just sets status to 'archived'
    """
    # Get the job
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    # Verify ownership
    user_company = extract_company_from_user(current_user)
    if job.company != user_company:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this job"
        )
    
    # Soft delete (archive)
    job.status = 'archived'
    job.updated_at = datetime.now()
    
    try:
        db.commit()
        return None  # 204 No Content
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete job: {str(e)}"
        )


# ============================================================================
# GET JOBS (LIST)
# ============================================================================

@router.get("/jobs")
def get_corporate_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    category: Optional[str] = None,
    location: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    Get corporate jobs for employer
    
    🎯 COMPANY ISOLATION:
    - Each user sees only their company's jobs
    - Uses user.company field for filtering
    
    Filter by:
    - status: Job status (draft, published, closed, archived)
    - category: Job category
    - location: City/province
    """
    # Extract company from authenticated user
    user_company = extract_company_from_user(current_user)
    
    print(f"\n🎯 User company: '{user_company}'")
    print(f"   📧 User email: {current_user.email}")
    
    # Build query - ONLY show jobs from user's company
    query = db.query(CorporateJob).filter(CorporateJob.company == user_company)
    
    if status_filter:
        query = query.filter(CorporateJob.status == status_filter)
    else:
        # By default, exclude archived jobs
        query = query.filter(CorporateJob.status != 'archived')
    
    if category:
        query = query.filter(CorporateJob.category == category)
    
    if location:
        query = query.filter(
            (CorporateJob.location_city.ilike(f"%{location}%")) |
            (CorporateJob.location_province.ilike(f"%{location}%"))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    jobs = query.order_by(CorporateJob.created_at.desc()).offset(skip).limit(limit).all()
    
    print(f"   📊 Total jobs found: {total}\n")
    
    return {
        "success": True,
        "total": total,
        "company": user_company,
        "status_filter": status_filter,
        "jobs": jobs,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "has_more": (skip + limit) < total
    }


@router.get("/jobs/{job_id}")
def get_corporate_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get specific corporate job details
    """
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    return {
        "success": True,
        "job": job
    }


@router.get("/jobs/{job_id}/matches")
def get_job_matches(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    min_score: float = Query(0.3, ge=0, le=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get candidate matches for a corporate job
    
    Uses the enhanced matching algorithm (Phase 1-3)
    """
    # Get the job
    job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    # Initialize matching service
    matching_service = EnhancedMatchingService(db)
    
    # Get all CVs
    all_cvs = db.query(CV).all()
    
    # Score each candidate
    matches = []
    for cv in all_cvs:
        try:
            result = matching_service.match_cv_to_job(cv, job)
            
            if result['final_score'] >= min_score:
                matches.append({
                    "cv_id": cv.cv_id,
                    "user_id": cv.user_id,
                    "candidate_name": cv.full_name,
                    "email": cv.email,
                    "phone": cv.phone,
                    "location": f"{cv.city}, {cv.province}" if cv.city else cv.province,
                    "current_title": cv.current_job_title,
                    "experience_years": cv.total_years_experience,
                    "education": cv.education_level,
                    "match_score": result['final_score'],
                    "category_match": result['category_match'],
                    "penalty_applied": result['penalty_applied'],
                    "explanation": result['explanation'],
                    "skill_details": result['skill_details'],
                    "scores_breakdown": result['scores']
                })
        except Exception as e:
            # Skip CVs that cause errors
            continue
    
    # Sort by match score
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Limit results
    matches = matches[:limit]
    
    return {
        "success": True,
        "job_id": job_id,
        "job_title": job.title,
        "company": job.company,
        "total_matches": len(matches),
        "min_score_threshold": min_score,
        "matches": matches
    }


@router.get("/stats")
def get_corporate_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Optional[str] = None
):
    """
    Get statistics for corporate jobs
    """
    # Extract company from authenticated user
    user_company = extract_company_from_user(current_user)
    
    if not company:
        company = user_company
    
    # Query jobs (exclude archived)
    query = db.query(CorporateJob).filter(
        CorporateJob.company == company,
        CorporateJob.status != 'archived'
    )
    
    total_jobs = query.count()
    
    # Count by status
    status_counts = {
        'draft': query.filter(CorporateJob.status == 'draft').count(),
        'published': query.filter(CorporateJob.status == 'published').count(),
        'closed': query.filter(CorporateJob.status == 'closed').count(),
    }
    
    # Get jobs by category
    category_counts = {}
    jobs = query.all()
    for job in jobs:
        category = job.category or "Uncategorized"
        category_counts[category] = category_counts.get(category, 0) + 1
    
    # Get jobs by location
    location_counts = {}
    for job in jobs:
        location = job.location_city or job.location_province or "Unknown"
        location_counts[location] = location_counts.get(location, 0) + 1
    
    return {
        "success": True,
        "company": company,
        "total_jobs": total_jobs,
        "by_status": status_counts,
        "by_category": category_counts,
        "by_location": location_counts,
        "recent_jobs": jobs[:5] if jobs else []
    }


@router.get("/categories")
def get_corporate_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of job categories
    """
    categories = db.query(CorporateJob.category).distinct().all()
    categories = [c[0] for c in categories if c[0]]
    
    return {
        "success": True,
        "categories": sorted(categories),
        "total": len(categories)
    }
