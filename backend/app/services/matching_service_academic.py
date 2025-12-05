"""
CAMSS 2.0 - Academic Matching Service (Thesis Version)
======================================================
Simplified, skills-first matching for final year project demonstration.

Key Differences from Production Version:
- Skills weight: 80% (vs 50% in production)
- Experience weight: 10% (vs 20% in production)
- Location weight: 5% (vs 30% in production)
- Education weight: 5% (new)
- Category filtering: Matches same-category jobs preferentially

Academic Rationale:
"This configuration prioritizes job-relevant skills over geographic proximity,
reflecting the hypothesis that skill alignment is the primary predictor of
job-candidate compatibility in specialized professions."
"""

from typing import List, Dict, Optional, Tuple, Set
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
import pandas as pd
from datetime import datetime, date
import re

from app.models.cv import CV
from app.models.corporate_job import CorporateJob
from app.models.small_job import SmallJob


# ============================================================================
# ACADEMIC CONFIGURATION - Thesis Weights
# ============================================================================

ACADEMIC_WEIGHTS = {
    'skills': 0.80,        # 80% - PRIMARY SIGNAL (skills define the job)
    'experience': 0.10,    # 10% - Secondary (years matter, but less)
    'location': 0.05,      # 5% - Minor (candidate can relocate)
    'education': 0.05,     # 5% - Minor (degree level match)
    'salary': 0.00,        # 0% - Excluded (market factor, not capability)
}

# Category-based filtering
CATEGORY_BOOST = {
    'same_category': 1.15,      # +15% boost for matching category
    'different_category': 0.85,  # -15% penalty for wrong category
}

# Job categorization keywords
JOB_CATEGORIES = {
    'Education': ['teacher', 'educator', 'instructor', 'tutor', 'lecturer', 'professor', 'academic'],
    'Healthcare': ['nurse', 'doctor', 'medical', 'health', 'clinical', 'physician', 'therapist'],
    'Technology': ['developer', 'engineer', 'software', 'programmer', 'it support', 'data analyst', 'tech'],
    'Hospitality': ['hotel', 'restaurant', 'chef', 'bartender', 'waiter', 'hospitality', 'catering'],
    'Trades': ['plumber', 'electrician', 'mechanic', 'welder', 'carpenter', 'technician', 'fitter'],
    'Business': ['manager', 'ceo', 'director', 'executive', 'consultant', 'analyst', 'accountant'],
    'Sales': ['sales', 'marketing', 'business development', 'account manager', 'representative'],
    'Agriculture': ['agriculture', 'farming', 'agronomist', 'crop', 'livestock', 'veterinary'],
    'Transport': ['driver', 'logistics', 'courier', 'transport', 'delivery', 'dispatch'],
    'Construction': ['construction', 'civil engineer', 'architect', 'surveyor', 'foreman', 'builder'],
}

# Skill synonyms (same as production, but noted for thesis documentation)
SKILL_SYNONYMS = {
    # Teaching
    'mathematics teaching': ['math teaching', 'mathematics education', 'math education'],
    'science teaching': ['science education', 'stem teaching'],
    'classroom management': ['class management', 'student management'],
    'curriculum development': ['curriculum design', 'curriculum planning'],
    
    # Hospitality
    'hotel operations': ['hospitality management', 'hotel management', 'guest services'],
    'customer service': ['client relations', 'customer care', 'client service'],
    
    # IT
    'software development': ['programming', 'coding', 'software engineering'],
    'it support': ['technical support', 'helpdesk', 'tech support'],
    
    # General
    'project management': ['project coordination', 'program management'],
    'financial management': ['budgeting', 'financial planning', 'accounting'],
}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def categorize_job(job_title: str, job_category: str = None) -> str:
    """
    Categorize a job based on title and category field.
    Returns primary category or 'General' if unmatched.
    """
    if job_category and job_category in JOB_CATEGORIES:
        return job_category
    
    title_lower = job_title.lower()
    
    for category, keywords in JOB_CATEGORIES.items():
        if any(keyword in title_lower for keyword in keywords):
            return category
    
    return 'General'


def categorize_cv(job_title: str, skills: str) -> str:
    """
    Categorize a CV based on current job title and skills.
    """
    title_lower = job_title.lower()
    skills_lower = skills.lower() if skills else ''
    
    for category, keywords in JOB_CATEGORIES.items():
        if any(keyword in title_lower for keyword in keywords):
            return category
        if any(keyword in skills_lower for keyword in keywords):
            return category
    
    return 'General'


def normalize_skills(skills_str: str) -> Set[str]:
    """Convert comma-separated skills string to normalized set."""
    if not skills_str or pd.isna(skills_str):
        return set()
    return set([s.strip().lower() for s in str(skills_str).split(',')])


def is_skill_match(cv_skill: str, job_skill: str) -> bool:
    """
    Check if CV skill matches job skill using:
    1. Exact match
    2. Synonym match
    3. Word overlap (60% threshold)
    """
    cv_skill_lower = cv_skill.strip().lower()
    job_skill_lower = job_skill.strip().lower()
    
    # Exact match
    if cv_skill_lower == job_skill_lower:
        return True
    
    # Synonym match
    cv_synonyms = SKILL_SYNONYMS.get(cv_skill_lower, [cv_skill_lower])
    job_synonyms = SKILL_SYNONYMS.get(job_skill_lower, [job_skill_lower])
    
    if set(cv_synonyms) & set(job_synonyms):
        return True
    
    # Word overlap
    cv_words = set(cv_skill_lower.split()) - {'and', 'or', 'the', 'a'}
    job_words = set(job_skill_lower.split()) - {'and', 'or', 'the', 'a'}
    
    if cv_words and job_words:
        intersection = len(cv_words & job_words)
        union = len(cv_words | job_words)
        if union > 0 and (intersection / union) >= 0.6:
            return True
    
    return False


def calculate_skills_score(cv_technical: str, cv_soft: str,
                           job_required: str, job_preferred: str) -> Tuple[float, List[str], List[str]]:
    """
    Calculate skills overlap score (0.0 to 1.0) with matched and missing skills.
    Academic version: Emphasizes required skills heavily.
    """
    cv_tech = normalize_skills(cv_technical)
    cv_soft = normalize_skills(cv_soft)
    job_req = normalize_skills(job_required)
    job_pref = normalize_skills(job_preferred)
    
    all_cv_skills = cv_tech.union(cv_soft)
    
    if len(job_req) == 0 and len(job_pref) == 0:
        return 0.5, [], []
    
    # Match required skills
    matched_required = set()
    matched_required_display = []
    
    for job_skill in job_req:
        for cv_skill in all_cv_skills:
            if is_skill_match(cv_skill, job_skill):
                matched_required.add(job_skill)
                matched_required_display.append(job_skill.title())
                break
    
    # Match preferred skills
    matched_preferred = set()
    matched_preferred_display = []
    
    for job_skill in job_pref:
        for cv_skill in all_cv_skills:
            if is_skill_match(cv_skill, job_skill):
                matched_preferred.add(job_skill)
                matched_preferred_display.append(job_skill.title())
                break
    
    # Academic scoring: Required skills = 85%, Preferred = 15%
    required_match = len(matched_required) / len(job_req) if job_req else 1.0
    preferred_match = len(matched_preferred) / len(job_pref) if job_pref else 0.5
    
    final_score = (required_match * 0.85) + (preferred_match * 0.15)
    
    all_matched = list(set(matched_required_display + matched_preferred_display))
    all_required = job_req.union(job_pref)
    all_matched_normalized = matched_required.union(matched_preferred)
    missing = all_required - all_matched_normalized
    missing_display = sorted([s.title() for s in missing])[:5]
    
    return (min(1.0, final_score), sorted(all_matched), missing_display)


def calculate_education_score(cv_education: str, job_education: str) -> Tuple[float, str]:
    """
    Calculate education match score (0.0 to 1.0).
    Academic version: Simple degree level matching.
    """
    if not job_education or pd.isna(job_education):
        return 0.8, "No specific requirement"
    
    education_hierarchy = {
        'phd': 5, 'doctorate': 5,
        'masters': 4, 'msc': 4, 'mba': 4,
        'bachelor': 3, 'degree': 3, 'bsc': 3,
        'diploma': 2,
        'certificate': 1,
    }
    
    cv_edu_lower = str(cv_education).lower() if cv_education else ''
    job_edu_lower = str(job_education).lower()
    
    cv_level = 0
    for key, level in education_hierarchy.items():
        if key in cv_edu_lower:
            cv_level = max(cv_level, level)
    
    job_level = 0
    for key, level in education_hierarchy.items():
        if key in job_edu_lower:
            job_level = max(job_level, level)
    
    if cv_level >= job_level:
        return 1.0, f"Meets requirement ({cv_education})"
    elif cv_level == job_level - 1:
        return 0.7, f"Close to requirement"
    else:
        return 0.3, f"Below requirement"


def calculate_experience_score(cv_years: float, job_required_str: str) -> Tuple[float, str]:
    """Calculate experience match score (academic version)."""
    try:
        cv_years = float(cv_years) if cv_years else 0
        
        if not job_required_str or pd.isna(job_required_str):
            return 0.8, "No specific requirement"
        
        job_req_str = str(job_required_str).lower()
        
        if '+' in job_req_str:
            min_required = float(job_req_str.split('+')[0].strip())
        elif '-' in job_req_str:
            min_required = float(job_req_str.split('-')[0].strip())
        else:
            numbers = re.findall(r'\d+', job_req_str)
            min_required = float(numbers[0]) if numbers else 0
        
        if cv_years >= min_required:
            if cv_years > min_required + 10:
                return 0.8, f"Highly experienced ({cv_years} years)"
            return 1.0, f"Meets requirement ({cv_years} years)"
        else:
            gap = min_required - cv_years
            if gap <= 1:
                return 0.7, f"Close ({cv_years} years, need {min_required})"
            elif gap <= 2:
                return 0.5, f"Slightly under ({cv_years} years)"
            else:
                return 0.3, f"Under-qualified ({cv_years} years)"
    
    except (ValueError, TypeError):
        return 0.5, "Experience unclear"


def calculate_location_score(cv_city: str, cv_province: str,
                             job_city: str, job_province: str) -> Tuple[float, str]:
    """Calculate location match (academic version - less important)."""
    if not cv_city or not job_city:
        return 0.5, "Location information incomplete"
    
    cv_city = str(cv_city).strip().lower()
    job_city = str(job_city).strip().lower()
    cv_province = str(cv_province).strip().lower() if cv_province else ""
    job_province = str(job_province).strip().lower() if job_province else ""
    
    if cv_city == job_city:
        return 1.0, f"Same city ({cv_city.title()})"
    elif cv_province and job_province and cv_province == job_province:
        return 0.7, f"Same province"
    else:
        return 0.3, f"Different location"


# ============================================================================
# ACADEMIC MATCHING SERVICE
# ============================================================================

class AcademicMatchingService:
    """
    Academic version of matching service for thesis demonstration.
    Prioritizes skills (80%) over location/experience.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_cv(self, cv_id: str) -> Optional[CV]:
        """Retrieve CV by ID."""
        return self.db.query(CV).filter(CV.cv_id == cv_id).first()
    
    def calculate_match_score(self, cv: CV, job: Dict, job_type: str) -> Dict:
        """
        Calculate academic match score emphasizing skills.
        """
        # Skills scoring (80% weight)
        skills_score, matched_skills, missing_skills = calculate_skills_score(
            cv.skills_technical, cv.skills_soft,
            job.get('required_skills', ''), job.get('preferred_skills', '')
        )
        
        # Experience scoring (10% weight)
        exp_score, exp_reason = calculate_experience_score(
            cv.total_years_experience,
            job.get('required_experience_years') if job_type == 'corp' else None
        )
        
        # Location scoring (5% weight)
        location_score, location_reason = calculate_location_score(
            cv.city, cv.province,
            job.get('location_city'), job.get('location_province')
        )
        
        # Education scoring (5% weight)
        education_score, education_reason = calculate_education_score(
            cv.education_level,
            job.get('required_education') if job_type == 'corp' else None
        )
        
        # Base weighted score
        base_score = (
            skills_score * ACADEMIC_WEIGHTS['skills'] +
            exp_score * ACADEMIC_WEIGHTS['experience'] +
            location_score * ACADEMIC_WEIGHTS['location'] +
            education_score * ACADEMIC_WEIGHTS['education']
        )
        
        # Category boost/penalty
        cv_category = categorize_cv(cv.current_job_title, cv.skills_technical)
        job_category = categorize_job(job.get('title', ''), job.get('category'))
        
        category_multiplier = (
            CATEGORY_BOOST['same_category'] if cv_category == job_category 
            else CATEGORY_BOOST['different_category']
        )
        
        final_score = min(1.0, base_score * category_multiplier)
        
        # Build reasons
        reasons = []
        if skills_score >= 0.7:
            reasons.append(f"Strong skills match ({len(matched_skills)} relevant skills)")
        if location_score >= 0.7:
            reasons.append(location_reason)
        if exp_score >= 0.7:
            reasons.append(exp_reason)
        if cv_category == job_category:
            reasons.append(f"Same category ({cv_category})")
        
        return {
            'match_score': round(final_score, 3),
            'match_breakdown': {
                'skills': round(skills_score, 3),
                'experience': round(exp_score, 3),
                'location': round(location_score, 3),
                'education': round(education_score, 3),
                'category_multiplier': round(category_multiplier, 3),
            },
            'categories': {
                'cv_category': cv_category,
                'job_category': job_category,
            },
            'match_reasons': reasons[:3],
            'matched_skills': matched_skills[:10],
            'missing_skills': missing_skills[:5],
        }
    
    def find_matches(self, cv_id: str, 
                     job_type: str = 'both',
                     limit: int = 20,
                     min_score: float = 0.3) -> Dict:
        """Find and rank job matches using academic weights."""
        cv = self.get_cv(cv_id)
        if not cv:
            return {'error': 'CV not found', 'cv_id': cv_id}
        
        all_matches = []
        
        # Match corporate jobs
        if job_type in ['corp', 'both']:
            corp_jobs = self.db.query(CorporateJob).all()
            for job in corp_jobs:
                job_dict = {
                    'job_id': job.job_id,
                    'title': job.title,
                    'category': job.category,
                    'location_city': job.location_city,
                    'location_province': job.location_province,
                    'required_skills': job.required_skills,
                    'preferred_skills': job.preferred_skills,
                    'required_experience_years': job.required_experience_years,
                    'required_education': job.required_education,
                    'salary_max_zmw': job.salary_max_zmw,
                    'company': job.company,
                }
                
                match_result = self.calculate_match_score(cv, job_dict, 'corp')
                
                if match_result['match_score'] >= min_score:
                    all_matches.append({
                        'job_id': job.job_id,
                        'job_type': 'corp',
                        'title': job.title,
                        'company': job.company,
                        'location_city': job.location_city,
                        'salary_max_zmw': job.salary_max_zmw,
                        'employment_type': job.employment_type,
                        **match_result
                    })
        
        # Sort by match score
        all_matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        for i, match in enumerate(all_matches[:limit], 1):
            match['rank'] = i
        
        return {
            'cv_id': cv_id,
            'candidate_name': cv.full_name,
            'candidate_category': categorize_cv(cv.current_job_title, cv.skills_technical),
            'matches': all_matches[:limit],
            'total_matches': len(all_matches),
            'matching_config': {
                'weights': ACADEMIC_WEIGHTS,
                'version': 'academic_thesis'
            },
            'generated_at': datetime.now().isoformat()
        }
