"""
CAMSS 2.0 - Core Matching Service
=================================
Matches candidates (CVs) to jobs (corporate & small) with weighted scoring.

Key Features:
- Location-aware matching (Zambian provinces/cities)
- Salary alignment scoring
- Skills overlap calculation with FUZZY MATCHING
- Experience requirements matching
- Contextual boosts (mining, government, etc.)
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
# CONFIGURATION - Matching Weights
# ============================================================================

MATCHING_WEIGHTS = {
    'skills': 0.50,        # 50% - Skills overlap (MOST IMPORTANT)
    'location': 0.30,      # 30% - Location proximity
    'experience': 0.20,    # 20% - Experience match
    'salary': 0.00,        # 0% - Removed from weighted scoring (use as filter instead)
}

# ============================================================================
# SKILL SYNONYMS - Zambian Job Market Context
# ============================================================================
SKILL_SYNONYMS = {
    # Hospitality & Tourism
    'hotel operations': ['hospitality management', 'hotel management', 'guest services'],
    'hospitality management': ['hotel operations', 'hotel management', 'guest services'],
    'revenue management': ['financial management', 'budgeting', 'revenue optimization'],
    'front office operations': ['hotel reception', 'guest services', 'customer service'],
    'guest services': ['customer service', 'hospitality', 'client relations'],
    
    # IT & Technology
    'it support': ['technical support', 'helpdesk', 'tech support'],
    'network administration': ['network management', 'it infrastructure'],
    'software development': ['programming', 'coding', 'software engineering'],
    'web development': ['website design', 'frontend development', 'backend development'],
    
    # Management
    'staff training': ['team development', 'employee training', 'capacity building'],
    'team leadership': ['leadership', 'team management', 'supervision'],
    'project management': ['project coordination', 'program management'],
    
    # Customer Service
    'customer service': ['client relations', 'customer care', 'client service'],
    'client relations': ['customer service', 'account management'],
    
    # Finance
    'financial management': ['budgeting', 'financial planning', 'accounting'],
    'accounting': ['bookkeeping', 'financial records', 'financial management'],
    
    # Sales & Marketing
    'sales': ['business development', 'revenue generation', 'selling'],
    'marketing': ['digital marketing', 'brand management', 'promotions'],
}

# Zambian Location Data
ZAMBIAN_PROVINCES = {
    'Lusaka Province': ['Lusaka', 'Kafue', 'Chilanga'],
    'Copperbelt Province': ['Kitwe', 'Ndola', 'Chingola', 'Mufulira', 'Luanshya'],
    'Central Province': ['Kabwe', 'Kapiri Mposhi', 'Mkushi'],
    'Southern Province': ['Livingstone', 'Choma', 'Mazabuka'],
    'Eastern Province': ['Chipata', 'Katete', 'Lundazi'],
    'Northern Province': ['Kasama', 'Mbala', 'Mpika'],
    'Northwestern Province': ['Solwezi', 'Mwinilunga', 'Kasempa'],
    'Western Province': ['Mongu', 'Senanga', 'Kaoma'],
    'Muchinga Province': ['Chinsali', 'Nakonde', 'Isoka'],
    'Luapula Province': ['Mansa', 'Kawambwa', 'Nchelenge'],
}

# Context Boosts
CONTEXT_BOOSTS = {
    'mining_sector': 1.25,       # 25% boost for mining jobs in Copperbelt
    'government_job': 1.15,      # 15% boost for government/parastatal
    'remote_work': 1.10,         # 10% boost for remote-friendly candidates
}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def normalize_skills(skills_str: str) -> Set[str]:
    """Convert comma-separated skills string to normalized set."""
    if not skills_str or pd.isna(skills_str):
        return set()
    return set([s.strip().lower() for s in str(skills_str).split(',')])


def get_skill_synonyms(skill: str) -> Set[str]:
    """Get all synonyms for a skill, including the skill itself."""
    skill_lower = skill.strip().lower()
    synonyms = {skill_lower}
    
    # Check if skill has defined synonyms
    if skill_lower in SKILL_SYNONYMS:
        synonyms.update(SKILL_SYNONYMS[skill_lower])
    
    return synonyms


def calculate_word_overlap(skill1: str, skill2: str, threshold: float = 0.6) -> bool:
    """
    Check if two skills have significant word overlap.
    
    Example:
        "Hotel Management" vs "Hospitality Management" = 50% overlap (1 of 2 words)
        "Software Development" vs "Web Development" = 50% overlap (1 of 2 words)
    
    Args:
        skill1: First skill string
        skill2: Second skill string  
        threshold: Minimum overlap ratio (0.0 to 1.0)
    
    Returns:
        True if overlap exceeds threshold
    """
    words1 = set(skill1.lower().split())
    words2 = set(skill2.lower().split())
    
    # Remove common stop words
    stop_words = {'and', 'or', 'the', 'a', 'an', 'of', 'in', 'to', 'for'}
    words1 = words1 - stop_words
    words2 = words2 - stop_words
    
    if not words1 or not words2:
        return False
    
    # Calculate Jaccard similarity
    intersection = len(words1 & words2)
    union = len(words1 | words2)
    
    if union == 0:
        return False
    
    similarity = intersection / union
    return similarity >= threshold


def is_skill_match(cv_skill: str, job_skill: str) -> bool:
    """
    Check if CV skill matches job skill using:
    1. Exact match
    2. Synonym match
    3. Fuzzy word overlap
    
    Args:
        cv_skill: Candidate's skill
        job_skill: Job requirement
    
    Returns:
        True if skills match
    """
    cv_skill_lower = cv_skill.strip().lower()
    job_skill_lower = job_skill.strip().lower()
    
    # 1. Exact match
    if cv_skill_lower == job_skill_lower:
        return True
    
    # 2. Synonym match
    cv_synonyms = get_skill_synonyms(cv_skill_lower)
    job_synonyms = get_skill_synonyms(job_skill_lower)
    
    if cv_synonyms & job_synonyms:  # Any overlap in synonyms
        return True
    
    # 3. Fuzzy word overlap (60% threshold)
    if calculate_word_overlap(cv_skill_lower, job_skill_lower, threshold=0.6):
        return True
    
    return False


def calculate_location_score(cv_city: str, cv_province: str,
                             job_city: str, job_province: str,
                             is_remote: bool = False) -> Tuple[float, str]:
    """
    Calculate location match score (0.0 to 1.0) with explanation.
    
    Returns:
        (score, explanation)
    """
    # Handle remote jobs
    if is_remote:
        return 0.9, "Remote job - location flexible"
    
    # Handle missing data
    if not cv_city or not job_city:
        return 0.5, "Location information incomplete"
    
    cv_city = str(cv_city).strip().lower()
    job_city = str(job_city).strip().lower()
    cv_province = str(cv_province).strip().lower() if cv_province else ""
    job_province = str(job_province).strip().lower() if job_province else ""
    
    # Same city - perfect match
    if cv_city == job_city:
        return 1.0, f"Located in same city ({cv_city.title()})"
    
    # Same province - good match (commutable)
    if cv_province and job_province and cv_province == job_province:
        return 0.7, f"Within same province ({cv_province.title()})"
    
    # Both in Copperbelt (interconnected cities)
    if 'copperbelt' in cv_province and 'copperbelt' in job_province:
        return 0.6, "Within Copperbelt region"
    
    # Different province - poor match
    return 0.3, f"Different location ({job_city.title()} vs {cv_city.title()})"


def calculate_salary_score(cv_min: float, cv_max: float,
                           job_min: float, job_max: float) -> Tuple[float, str]:
    """
    Calculate salary alignment score (0.0 to 1.0) with explanation.
    
    Returns:
        (score, explanation)
    """
    try:
        cv_min = float(cv_min) if cv_min else 0
        cv_max = float(cv_max) if cv_max else 999999
        job_min = float(job_min) if job_min else 0
        job_max = float(job_max) if job_max else 999999
        
        # Job max within CV range - perfect
        if cv_min <= job_max <= cv_max:
            return 1.0, f"Salary matches expectations (ZMW {job_max:,.0f})"
        
        # Job offers more than expected - great!
        if job_max > cv_max:
            return 0.95, f"Salary exceeds expectations (ZMW {job_max:,.0f})"
        
        # Job offers less - calculate penalty
        if job_max < cv_min:
            shortfall = (cv_min - job_max) / cv_min
            if shortfall < 0.2:
                return 0.6, f"Salary slightly below expectations (ZMW {job_max:,.0f})"
            elif shortfall < 0.4:
                return 0.3, f"Salary below expectations (ZMW {job_max:,.0f})"
            else:
                return 0.1, f"Salary significantly below expectations (ZMW {job_max:,.0f})"
        
        return 0.5, f"Partial salary match (ZMW {job_max:,.0f})"
        
    except (ValueError, TypeError):
        return 0.5, "Salary information incomplete"


def calculate_skills_score(cv_technical: str, cv_soft: str,
                           job_required: str, job_preferred: str) -> Tuple[float, List[str], List[str]]:
    """
    Calculate skills overlap score (0.0 to 1.0) with matched and missing skills.
    NOW WITH FUZZY MATCHING AND SYNONYMS!
    
    Returns:
        (score, matched_skills, missing_skills)
    """
    # Normalize all skills
    cv_tech = normalize_skills(cv_technical)
    cv_soft = normalize_skills(cv_soft)
    job_req = normalize_skills(job_required)
    job_pref = normalize_skills(job_preferred)
    
    # Combine all CV skills (technical + soft)
    all_cv_skills = cv_tech.union(cv_soft)
    
    # No requirements specified
    if len(job_req) == 0 and len(job_pref) == 0:
        return 0.5, [], []
    
    # Find matched required skills (with fuzzy matching)
    matched_required = set()
    matched_required_display = []
    
    for job_skill in job_req:
        for cv_skill in all_cv_skills:
            if is_skill_match(cv_skill, job_skill):
                matched_required.add(job_skill)
                matched_required_display.append(job_skill.title())
                break
    
    # Calculate required skills match (70% weight)
    if len(job_req) > 0:
        required_match = len(matched_required) / len(job_req)
    else:
        required_match = 1.0
    
    # Find matched preferred skills (with fuzzy matching)
    matched_preferred = set()
    matched_preferred_display = []
    
    for job_skill in job_pref:
        for cv_skill in all_cv_skills:
            if is_skill_match(cv_skill, job_skill):
                matched_preferred.add(job_skill)
                matched_preferred_display.append(job_skill.title())
                break
    
    # Calculate preferred skills match (30% weight)
    if len(job_pref) > 0:
        preferred_match = len(matched_preferred) / len(job_pref)
    else:
        preferred_match = 0.5
    
    # Final score
    final_score = (required_match * 0.7) + (preferred_match * 0.3)
    
    # Get all matched skills (deduplicated)
    all_matched_display = list(set(matched_required_display + matched_preferred_display))
    
    # Get missing skills (skills in job but not matched)
    all_matched_normalized = matched_required.union(matched_preferred)
    all_required = job_req.union(job_pref)
    missing = all_required - all_matched_normalized
    missing_display = sorted([s.title() for s in missing])
    
    return (
        min(1.0, final_score),
        sorted(all_matched_display),
        missing_display[:5]  # Top 5 missing
    )


def calculate_experience_score(cv_years: float, job_required_str: str) -> Tuple[float, str]:
    """
    Calculate experience match score (0.0 to 1.0) with explanation.
    
    Returns:
        (score, explanation)
    """
    try:
        cv_years = float(cv_years) if cv_years else 0
        
        # No requirement specified
        if not job_required_str or pd.isna(job_required_str):
            return 0.8, "No specific experience requirement"
        
        # Parse job requirement (e.g., "3-5 years", "5+ years")
        job_req_str = str(job_required_str).lower()
        
        # Extract minimum years required
        if '+' in job_req_str:
            min_required = float(job_req_str.split('+')[0].strip())
        elif '-' in job_req_str:
            min_required = float(job_req_str.split('-')[0].strip())
        else:
            numbers = re.findall(r'\d+', job_req_str)
            min_required = float(numbers[0]) if numbers else 0
        
        # Calculate match
        if cv_years >= min_required:
            # Check for overqualification
            if cv_years > min_required + 5:
                return 0.7, f"Highly experienced ({cv_years} years, may be overqualified)"
            return 1.0, f"Meets experience requirement ({cv_years} years)"
        else:
            # Under-qualified
            gap = min_required - cv_years
            if gap <= 1:
                return 0.7, f"Close to requirement ({cv_years} years, need {min_required})"
            elif gap <= 2:
                return 0.5, f"Slightly under-qualified ({cv_years} years, need {min_required})"
            else:
                return 0.3, f"Under-qualified ({cv_years} years, need {min_required})"
    
    except (ValueError, TypeError):
        return 0.5, "Experience information incomplete"


def apply_context_boost(job_data: Dict, cv_data: Dict) -> Tuple[float, List[str]]:
    """
    Apply Zambian market-specific boosts.
    
    Returns:
        (boost_multiplier, boost_reasons)
    """
    boost = 1.0
    reasons = []
    
    job_location = str(job_data.get('location_province', '')).lower()
    job_skills = str(job_data.get('required_skills', '')).lower()
    job_company = str(job_data.get('company', '')).lower()
    
    # Mining sector boost (Copperbelt)
    if 'copperbelt' in job_location:
        mining_keywords = ['mining', 'geology', 'metallurgy', 'extraction', 'mineral']
        if any(word in job_skills for word in mining_keywords):
            boost *= CONTEXT_BOOSTS['mining_sector']
            reasons.append("Mining sector in Copperbelt (+25%)")
    
    # Government/Parastatal preference
    gov_keywords = ['government', 'ministry', 'public service', 'parastatal']
    if any(word in job_company for word in gov_keywords):
        boost *= CONTEXT_BOOSTS['government_job']
        reasons.append("Government/Parastatal job (+15%)")
    
    # Remote work preference
    if 'remote' in job_location:
        boost *= CONTEXT_BOOSTS['remote_work']
        reasons.append("Remote work opportunity (+10%)")
    
    return boost, reasons


# ============================================================================
# MAIN MATCHING SERVICE
# ============================================================================

class MatchingService:
    """Core service for matching CVs to jobs."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_cv(self, cv_id: str) -> Optional[CV]:
        """Retrieve CV by ID."""
        return self.db.query(CV).filter(CV.cv_id == cv_id).first()
    
    def get_corporate_jobs(self, filters: Dict = None) -> List[CorporateJob]:
        """Retrieve corporate jobs with optional filters."""
        query = self.db.query(CorporateJob)
        
        if filters:
            if 'location_city' in filters:
                query = query.filter(CorporateJob.location_city == filters['location_city'])
            if 'category' in filters:
                query = query.filter(CorporateJob.category == filters['category'])
            if 'min_salary' in filters:
                query = query.filter(CorporateJob.salary_max_zmw >= filters['min_salary'])
        
        return query.all()
    
    def get_small_jobs(self, filters: Dict = None) -> List[SmallJob]:
        """Retrieve small jobs with optional filters."""
        query = self.db.query(SmallJob)
        
        if filters:
            if 'location' in filters:
                query = query.filter(SmallJob.location == filters['location'])
            if 'category' in filters:
                query = query.filter(SmallJob.category == filters['category'])
        
        return query.all()
    
    def calculate_match_score(self, cv: CV, job: Dict, job_type: str) -> Dict:
        """
        Calculate comprehensive match score for CV-Job pair.
        
        Args:
            cv: CV object
            job: Job dict (from CorporateJob or SmallJob)
            job_type: 'corp' or 'small'
        
        Returns:
            Dict with score, breakdown, reasons, and missing skills
        """
        # Location scoring
        is_remote = 'remote' in str(job.get('location_city', '')).lower()
        location_score, location_reason = calculate_location_score(
            cv.city, cv.province,
            job.get('location_city'), job.get('location_province'),
            is_remote
        )
        
        # Salary scoring
        if job_type == 'corp':
            salary_score, salary_reason = calculate_salary_score(
                cv.salary_expectation_min, cv.salary_expectation_max,
                job.get('salary_min_zmw'), job.get('salary_max_zmw')
            )
        else:  # small job
            salary_score, salary_reason = calculate_salary_score(
                cv.salary_expectation_min, cv.salary_expectation_max,
                job.get('budget'), job.get('budget')
            )
        
        # Skills scoring (NOW WITH FUZZY MATCHING!)
        skills_score, matched_skills, missing_skills = calculate_skills_score(
            cv.skills_technical, cv.skills_soft,
            job.get('required_skills', ''), job.get('preferred_skills', '')
        )
        skills_reason = f"{len(matched_skills)} skills matched"
        if missing_skills:
            skills_reason += f", {len(missing_skills)} missing"
        
        # Experience scoring
        exp_score, exp_reason = calculate_experience_score(
            cv.total_years_experience,
            job.get('required_experience_years') if job_type == 'corp' else None
        )
        
        # Base weighted score
        base_score = (
            location_score * MATCHING_WEIGHTS['location'] +
            salary_score * MATCHING_WEIGHTS['salary'] +
            skills_score * MATCHING_WEIGHTS['skills'] +
            exp_score * MATCHING_WEIGHTS['experience']
        )
        
        # Apply context boost
        cv_dict = {
            'city': cv.city,
            'province': cv.province,
            'employment_status': cv.employment_status
        }
        context_boost, boost_reasons = apply_context_boost(job, cv_dict)
        
        # Final score (capped at 1.0)
        final_score = min(1.0, base_score * context_boost)
        
        # Build match reasons
        match_reasons = []
        if location_score >= 0.7:
            match_reasons.append(location_reason)
        if salary_score >= 0.7:
            match_reasons.append(salary_reason)
        if skills_score >= 0.6:
            match_reasons.append(f"Good skills match ({len(matched_skills)} relevant skills)")
        if exp_score >= 0.7:
            match_reasons.append(exp_reason)
        match_reasons.extend(boost_reasons)
        
        return {
            'match_score': round(final_score, 3),
            'match_breakdown': {
                'location': round(location_score, 3),
                'salary': round(salary_score, 3),
                'skills': round(skills_score, 3),
                'experience': round(exp_score, 3),
                'context_boost': round(context_boost, 3)
            },
            'match_reasons': match_reasons[:3],  # Top 3 reasons
            'matched_skills': matched_skills[:10],  # Top 10
            'missing_skills': missing_skills[:5],    # Top 5
        }
    
    def find_matches(self, cv_id: str, 
                     job_type: str = 'both',
                     limit: int = 20,
                     min_score: float = 0.3,
                     filters: Dict = None) -> Dict:
        """
        Find and rank job matches for a candidate.
        
        Args:
            cv_id: Candidate CV ID
            job_type: 'corp', 'small', or 'both'
            limit: Maximum number of results
            min_score: Minimum match score threshold
            filters: Additional filters (location, category, etc.)
        
        Returns:
            Dict with matches and metadata
        """
        # Get CV
        cv = self.get_cv(cv_id)
        if not cv:
            return {
                'error': 'CV not found',
                'cv_id': cv_id
            }
        
        all_matches = []
        
        # Match corporate jobs
        if job_type in ['corp', 'both']:
            corp_jobs = self.get_corporate_jobs(filters)
            for job in corp_jobs:
                job_dict = {
                    'job_id': job.job_id,
                    'location_city': job.location_city,
                    'location_province': job.location_province,
                    'salary_min_zmw': job.salary_min_zmw,
                    'salary_max_zmw': job.salary_max_zmw,
                    'required_skills': job.required_skills,
                    'preferred_skills': job.preferred_skills,
                    'required_experience_years': job.required_experience_years,
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
        
        # Match small jobs
        if job_type in ['small', 'both']:
            small_jobs = self.get_small_jobs(filters)
            for job in small_jobs:
                job_dict = {
                    'job_id': job.id,
                    'location_city': job.location,
                    'location_province': job.province,
                    'budget': job.budget,
                    'required_skills': '',  # Small jobs don't have detailed skills
                    'preferred_skills': '',
                    'company': job.posted_by,
                }
                
                match_result = self.calculate_match_score(cv, job_dict, 'small')
                
                if match_result['match_score'] >= min_score:
                    all_matches.append({
                        'job_id': job.id,
                        'job_type': 'small',
                        'title': job.title,
                        'company': job.posted_by,
                        'location_city': job.location,
                        'budget': job.budget,
                        'duration': job.duration,
                        **match_result
                    })
        
        # Sort by match score (descending)
        all_matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Add rank
        for i, match in enumerate(all_matches[:limit], 1):
            match['rank'] = i
        
        return {
            'cv_id': cv_id,
            'candidate_name': cv.full_name,
            'candidate_location': f"{cv.city}, {cv.province}",
            'matches': all_matches[:limit],
            'total_matches': len(all_matches),
            'filters_applied': filters or {},
            'generated_at': datetime.now().isoformat()
        }
