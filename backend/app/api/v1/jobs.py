"""
Jobs API Endpoints
Handles job listing, search, creation, and management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.job_service import JobService
from app.schemas.job import (
    CorporateJobCreate, CorporateJobUpdate, CorporateJobResponse, CorporateJobListResponse,
    SmallJobCreate, SmallJobUpdate, SmallJobResponse, SmallJobListResponse,
    JobSearchRequest
)

router = APIRouter()


# ============================================================================
# ALL JOBS (Combined)
# ============================================================================

@router.get("/jobs/all")
def get_all_jobs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    location: Optional[str] = None,
):
    """
    Get all jobs (both corporate and small jobs)
    
    Returns a combined list of corporate and small jobs with basic pagination
    """
    # Get corporate jobs
    corporate_jobs, corp_total = JobService.list_corporate_jobs(
        db=db,
        skip=skip,
        limit=limit // 2,  # Split limit between both types
        category=category,
        location_province=location
    )
    
    # Get small jobs
    small_jobs, small_total = JobService.list_small_jobs(
        db=db,
        skip=skip,
        limit=limit // 2,
        category=category,
        province=location
    )
    
    # Normalize collar_type and employment_type for corporate jobs
    employment_type_mapping = {
        "Permanent": "Full-time",
        "Full-time": "Full-time",
        "Part-time": "Part-time",
        "Contract": "Contract",
        "Internship": "Internship",
        "Temporary": "Temporary",
    }
    
    for job in corporate_jobs:
        if job.collar_type:
            job.collar_type = job.collar_type.lower()
        if job.employment_type:
            job.employment_type = employment_type_mapping.get(job.employment_type, "Full-time")
    
    return {
        "success": True,
        "total": corp_total + small_total,
        "corporate_count": corp_total,
        "small_job_count": small_total,
        "corporate_jobs": corporate_jobs,
        "small_jobs": small_jobs,
        "personal_jobs": small_jobs,  # Alias for frontend compatibility
        "page": (skip // limit) + 1,
        "page_size": limit
    }


@router.post("/jobs/search")
def search_jobs(
    search_request: JobSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Advanced job search with filters
    
    Search across both corporate and small jobs with multiple filter options:
    - Query text (searches title, description, skills)
    - Categories
    - Locations
    - Salary range
    - Experience requirements
    - Employment types
    """
    results = JobService.search_all_jobs(db, search_request)
    
    return {
        "success": True,
        "query": search_request.query,
        "total_matches": results['total_count'],
        "corporate_matches": results['corporate_count'],
        "small_job_matches": results['small_count'],
        "corporate_jobs": results['corporate_jobs'],
        "small_jobs": results['small_jobs'],
        "page": search_request.page,
        "page_size": search_request.page_size,
        "has_more": results['total_count'] > (search_request.page * search_request.page_size)
    }


# ============================================================================
# CORPORATE JOBS
# ============================================================================

@router.get("/jobs/corporate", response_model=CorporateJobListResponse)
def list_corporate_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # ✅ Added authentication
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    company: Optional[str] = None,  # ✅ Added company filter
    category: Optional[str] = None,
    location_province: Optional[str] = None,
    collar_type: Optional[str] = None,
    min_salary: Optional[float] = None,
    max_salary: Optional[float] = None,
    employment_type: Optional[str] = None,
):
    """
    List corporate jobs with filters
    
    Filter options:
    - company: Company name (exact match) - auto-detected from user if not provided
    - category: Job category/industry
    - location_province: Province
    - collar_type: white, blue, pink, grey, green
    - min_salary/max_salary: Salary range (ZMW)
    - employment_type: Full-time, Part-time, Contract, etc.
    """
    # ✅ Auto-detect company from user's name if not provided
    if not company:
        if "zedsafe" in current_user.full_name.lower():
            company = "Zedsafe Logistics"
    
    # ✅ Apply company filter if set
    from app.models.corporate_job import CorporateJob
    query = db.query(CorporateJob)
    
    if company:
        query = query.filter(CorporateJob.company == company)
    
    if category:
        query = query.filter(CorporateJob.category == category)
    
    if location_province:
        query = query.filter(CorporateJob.location_province == location_province)
    
    if collar_type:
        query = query.filter(CorporateJob.collar_type.ilike(collar_type))
    
    if min_salary:
        query = query.filter(CorporateJob.salary_min_zmw >= min_salary)
    
    if max_salary:
        query = query.filter(CorporateJob.salary_max_zmw <= max_salary)
    
    if employment_type:
        query = query.filter(CorporateJob.employment_type == employment_type)
    
    total = query.count()
    jobs = query.order_by(CorporateJob.posted_date.desc()).offset(skip).limit(limit).all()
    
    # Normalize collar_type and employment_type for schema validation
    employment_type_mapping = {
        "Permanent": "Full-time",
        "Full-time": "Full-time",
        "Part-time": "Part-time",
        "Contract": "Contract",
        "Internship": "Internship",
        "Temporary": "Temporary",
    }
    
    for job in jobs:
        if job.collar_type:
            job.collar_type = job.collar_type.lower()
        if job.employment_type:
            job.employment_type = employment_type_mapping.get(job.employment_type, "Full-time")
    
    # Convert SQLAlchemy models to Pydantic schemas
    job_responses = [CorporateJobResponse.from_orm(job) for job in jobs]
    
    return CorporateJobListResponse(
        total=total,
        jobs=job_responses,
        page=(skip // limit) + 1,
        page_size=limit,
        has_more=(skip + limit) < total
    )


@router.get("/jobs/corporate/{job_id}", response_model=CorporateJobResponse)
def get_corporate_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get specific corporate job details by ID"""
    job = JobService.get_corporate_job(db, job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Corporate job with ID {job_id} not found"
        )
    
    # Normalize collar_type and employment_type for schema validation
    if job.collar_type:
        job.collar_type = job.collar_type.lower()  # "White" -> "white"
    
    # Map database employment_type to schema values
    employment_type_mapping = {
        "Permanent": "Full-time",
        "Full-time": "Full-time",
        "Part-time": "Part-time",
        "Contract": "Contract",
        "Internship": "Internship",
        "Temporary": "Temporary",
    }
    if job.employment_type:
        job.employment_type = employment_type_mapping.get(job.employment_type, "Full-time")
    
    return CorporateJobResponse.from_orm(job)


@router.post("/jobs/corporate/create", response_model=CorporateJobResponse, status_code=status.HTTP_201_CREATED)
def create_corporate_job(
    job_data: CorporateJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Require authentication
):
    """
    Create a new corporate job posting
    
    Requires authentication. In production, should be restricted to employers/admins.
    """
    job = JobService.create_corporate_job(db, job_data)
    return CorporateJobResponse.from_orm(job)


@router.put("/jobs/corporate/{job_id}", response_model=CorporateJobResponse)
def update_corporate_job(
    job_id: str,
    job_data: CorporateJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a corporate job posting
    
    Requires authentication. Only job owner/admin should be able to update.
    """
    updated_job = JobService.update_corporate_job(db, job_id, job_data)
    
    if not updated_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Corporate job with ID {job_id} not found"
        )
    
    return CorporateJobResponse.from_orm(updated_job)


@router.delete("/jobs/corporate/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_corporate_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a corporate job posting
    
    Requires authentication. Only job owner/admin should be able to delete.
    """
    deleted = JobService.delete_corporate_job(db, job_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Corporate job with ID {job_id} not found"
        )
    
    return None


# ============================================================================
# PERSONAL/SMALL JOBS (Gigs/Tasks)
# Note: "personal" is frontend terminology, "small" is backend terminology
# ============================================================================

@router.get("/jobs/small", response_model=SmallJobListResponse)
def list_small_jobs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    province: Optional[str] = None,
    status: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
):
    """
    List small jobs/gigs with filters
    
    Filter options:
    - category: Task category
    - province: Location province
    - status: Open, In Progress, Completed, etc.
    - min_budget/max_budget: Budget range (ZMW)
    """
    jobs, total = JobService.list_small_jobs(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        province=province,
        status=status,
        min_budget=min_budget,
        max_budget=max_budget
    )
    
    # Convert SQLAlchemy models to Pydantic schemas
    job_responses = [SmallJobResponse.from_orm(job) for job in jobs]
    
    return SmallJobListResponse(
        total=total,
        jobs=job_responses,
        page=(skip // limit) + 1,
        page_size=limit,
        has_more=(skip + limit) < total
    )


@router.get("/jobs/small/{job_id}", response_model=SmallJobResponse)
def get_small_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get specific small job details by ID"""
    job = JobService.get_small_job(db, job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Small job with ID {job_id} not found"
        )
    
    return SmallJobResponse.from_orm(job)


@router.post("/jobs/small/create", response_model=SmallJobResponse, status_code=status.HTTP_201_CREATED)
def create_small_job(
    job_data: SmallJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new small job/gig posting
    
    Requires authentication. The job will be associated with the current user.
    """
    # Set posted_by to current user's ID
    job_data.posted_by = current_user.id
    
    job = JobService.create_small_job(db, job_data)
    return SmallJobResponse.from_orm(job)


@router.put("/jobs/small/{job_id}", response_model=SmallJobResponse)
def update_small_job(
    job_id: str,
    job_data: SmallJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a small job posting
    
    Requires authentication. Only job owner should be able to update.
    """
    # First get the job to check ownership
    job = JobService.get_small_job(db, job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Small job with ID {job_id} not found"
        )
    
    # Check if user owns this job
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this job"
        )
    
    updated_job = JobService.update_small_job(db, job_id, job_data)
    return SmallJobResponse.from_orm(updated_job)


@router.delete("/jobs/small/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_small_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a small job posting
    
    Requires authentication. Only job owner should be able to delete.
    """
    # First get the job to check ownership
    job = JobService.get_small_job(db, job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Small job with ID {job_id} not found"
        )
    
    # Check if user owns this job
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this job"
        )
    
    JobService.delete_small_job(db, job_id)
    return None


# ============================================================================
# PERSONAL JOBS ALIASES (Frontend Compatibility)
# ============================================================================

@router.get("/jobs/personal", response_model=SmallJobListResponse)
def list_personal_jobs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    province: Optional[str] = None,
    status: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
):
    """
    List personal jobs/gigs (ALIAS for /jobs/small)
    
    This endpoint is an alias for frontend compatibility.
    "Personal jobs" is frontend terminology for what backend calls "small jobs".
    """
    return list_small_jobs(db, skip, limit, category, province, status, min_budget, max_budget)


@router.get("/jobs/personal/{job_id}", response_model=SmallJobResponse)
def get_personal_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Get specific personal job details (ALIAS for /jobs/small/{job_id})
    
    This endpoint is an alias for frontend compatibility.
    """
    return get_small_job(job_id, db)


@router.post("/jobs/personal/create", response_model=SmallJobResponse, status_code=status.HTTP_201_CREATED)
def create_personal_job(
    job_data: SmallJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new personal job (ALIAS for /jobs/small/create)
    
    This endpoint is an alias for frontend compatibility.
    """
    return create_small_job(job_data, db, current_user)


@router.put("/jobs/personal/{job_id}", response_model=SmallJobResponse)
def update_personal_job(
    job_id: str,
    job_data: SmallJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a personal job (ALIAS for /jobs/small/{job_id})
    
    This endpoint is an alias for frontend compatibility.
    """
    return update_small_job(job_id, job_data, db, current_user)


@router.delete("/jobs/personal/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_personal_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a personal job (ALIAS for /jobs/small/{job_id})
    
    This endpoint is an alias for frontend compatibility.
    """
    return delete_small_job(job_id, db, current_user)


# ============================================================================
# UTILITY ENDPOINTS (Must come BEFORE /jobs/{job_id} to avoid conflicts)
# ============================================================================

@router.get("/jobs/categories")
def get_job_categories(db: Session = Depends(get_db)):
    """
    Get list of all available job categories
    
    Returns unique categories from both corporate and small jobs
    """
    from app.models.corporate_job import CorporateJob
    from app.models.small_job import SmallJob
    
    # Get unique corporate job categories
    corp_categories = db.query(CorporateJob.category).distinct().all()
    corp_categories = [c[0] for c in corp_categories if c[0]]
    
    # Get unique small job categories
    small_categories = db.query(SmallJob.category).distinct().all()
    small_categories = [c[0] for c in small_categories if c[0]]
    
    # Combine and sort
    all_categories = sorted(list(set(corp_categories + small_categories)))
    
    return {
        "success": True,
        "total": len(all_categories),
        "categories": all_categories
    }


@router.get("/jobs/locations")
def get_job_locations(db: Session = Depends(get_db)):
    """
    Get list of all available job locations (provinces)
    
    Returns unique provinces from both corporate and small jobs
    """
    from app.models.corporate_job import CorporateJob
    from app.models.small_job import SmallJob
    
    # Get unique corporate job provinces
    corp_provinces = db.query(CorporateJob.location_province).distinct().all()
    corp_provinces = [p[0] for p in corp_provinces if p[0]]
    
    # Get unique small job provinces
    small_provinces = db.query(SmallJob.province).distinct().all()
    small_provinces = [p[0] for p in small_provinces if p[0]]
    
    # Combine and sort
    all_provinces = sorted(list(set(corp_provinces + small_provinces)))
    
    return {
        "success": True,
        "total": len(all_provinces),
        "provinces": all_provinces
    }


# ============================================================================
# GENERIC JOB LOOKUP (Must come AFTER specific routes)
# ============================================================================

@router.get("/jobs/{job_id}")
def get_job_details(
    job_id: str,
    job_type: str = Query(..., regex="^(corporate|small)$"),
    db: Session = Depends(get_db)
):
    """
    Get job details by ID and type
    
    Universal endpoint that works for both corporate and small jobs.
    Requires job_type parameter ('corporate' or 'small').
    """
    job = JobService.get_job_by_id_and_type(db, job_id, job_type)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{job_type.capitalize()} job with ID {job_id} not found"
        )
    
    return {
        "success": True,
        "job_type": job_type,
        "job": job
    }

