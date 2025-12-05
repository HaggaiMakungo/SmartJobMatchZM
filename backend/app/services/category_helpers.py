"""
Helper functions for Enhanced Matching Service
Bridges CV/Job model data to Phase 2 category scorer
"""

from typing import Dict, List
from app.models.cv import CV
from app.models.corporate_job import CorporateJob
from app.models.small_job import SmallJob


def get_cv_category_confidence(scorer, cv: CV, skill_data: Dict) -> Dict[str, float]:
    """
    Extract category confidence from CV using CategoryConfidenceScorer
    
    Args:
        scorer: CategoryConfidenceScorer instance
        cv: CV model object
        skill_data: Dict with 'normalized' skills and 'clusters'
    
    Returns:
        Category confidence scores
    """
    # Get all skills
    all_skills = skill_data.get('normalized', [])
    
    # Get cluster names
    cluster_names = list(skill_data.get('clusters', {}).keys())
    
    # Build experience text from job title
    experience_text = cv.current_job_title or cv.job_title if hasattr(cv, 'job_title') else None
    
    return scorer.score_cv(
        job_title=experience_text or "General Worker",
        skills=all_skills,
        skill_clusters=cluster_names,
        experience_text=None
    )


def get_job_category_confidence(scorer, job, job_type: str, skill_data: Dict) -> Dict[str, float]:
    """
    Extract category confidence from Job using CategoryConfidenceScorer
    
    Args:
        scorer: CategoryConfidenceScorer instance  
        job: CorporateJob or SmallJob model object
        job_type: 'corporate' or 'small'
        skill_data: Dict with 'normalized' skills and 'clusters'
    
    Returns:
        Category confidence scores
    """
    # Get description
    if job_type == 'corporate':
        description = getattr(job, 'description', '') or getattr(job, 'job_description', '')
    else:
        description = getattr(job, 'description', '')
    
    # Get all skills
    all_skills = skill_data.get('normalized', [])
    
    # Get cluster names
    cluster_names = list(skill_data.get('clusters', {}).keys())
    
    # Get declared category (if exists)
    declared_category = getattr(job, 'category', None)
    
    return scorer.score_job(
        title=job.title,
        description=description,
        skills=all_skills,
        skill_clusters=cluster_names,
        declared_category=declared_category
    )
