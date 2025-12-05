"""
Scoring Utilities - Helper functions for CAMSS 2.0 component scoring
"""

import re
from typing import List, Set, Dict, Optional, Any
import pandas as pd

# ============================================================================
# CORP JOB SCORING FUNCTIONS (6 Components)
# ============================================================================

def calculate_qualification_score(cv_education: str, required_education: str) -> float:
    """
    Calculate qualification match score based on education level
    
    Education hierarchy (Zambian system):
    - PhD/Doctorate
    - Master's Degree
    - Bachelor's Degree
    - Diploma
    - Certificate
    - Grade 12
    - Grade 9
    - None
    
    Scoring:
    - Exact match or higher: 1.0
    - One level below: 0.7
    - Two levels below: 0.4
    - Three+ levels below: 0.2
    
    Args:
        cv_education: Candidate's education level
        required_education: Job's required education level
        
    Returns:
        Score between 0.0 and 1.0
    """
    # Education hierarchy mapping
    education_levels = {
        'phd': 7, 'doctorate': 7,
        'master': 6, 'masters': 6,
        'bachelor': 5, 'degree': 5,
        'diploma': 4,
        'certificate': 3, 'cert': 3,
        'grade 12': 2, 'grade12': 2,
        'grade 9': 1, 'grade9': 1,
        'none': 0, 'no formal': 0
    }
    
    def get_level(education: str) -> int:
        """Extract education level from string"""
        if not education or pd.isna(education):
            return 0
        
        education = str(education).lower().strip()
        
        for key, level in education_levels.items():
            if key in education:
                return level
        
        return 0
    
    cv_level = get_level(cv_education)
    required_level = get_level(required_education)
    
    # Calculate score based on difference
    difference = cv_level - required_level
    
    if difference >= 0:
        return 1.0  # Meets or exceeds requirement
    elif difference == -1:
        return 0.7  # One level below
    elif difference == -2:
        return 0.4  # Two levels below
    else:
        return 0.2  # Three or more levels below


def calculate_experience_score(cv_years: Any, required_years: Any) -> float:
    """
    Calculate experience match score
    
    Scoring:
    - Meets or exceeds: 1.0
    - 80-99% of required: 0.8
    - 60-79% of required: 0.5
    - 40-59% of required: 0.3
    - Below 40%: 0.2
    
    Args:
        cv_years: Candidate's years of experience
        required_years: Job's required years
        
    Returns:
        Score between 0.0 and 1.0
    """
    # Handle missing or invalid data
    try:
        cv_years = float(cv_years) if cv_years and not pd.isna(cv_years) else 0
        required_years = float(required_years) if required_years and not pd.isna(required_years) else 0
    except (ValueError, TypeError):
        return 0.5  # Neutral score if data is invalid
    
    # If no experience required, everyone matches
    if required_years == 0:
        return 1.0
    
    # Calculate percentage of requirement met
    percentage = cv_years / required_years
    
    if percentage >= 1.0:
        return 1.0
    elif percentage >= 0.8:
        return 0.8
    elif percentage >= 0.6:
        return 0.5
    elif percentage >= 0.4:
        return 0.3
    else:
        return 0.2


def calculate_skills_score(
    cv_skills: str, 
    required_skills: str, 
    preferred_skills: str,
    db_conn
) -> float:
    """
    Calculate skills match score with fuzzy matching using skill similarity
    
    Scoring:
    - Required skills: 70% weight
    - Preferred skills: 30% weight
    - Uses database skill similarity for fuzzy matching
    
    Args:
        cv_skills: Comma-separated CV skills
        required_skills: Comma-separated required skills
        preferred_skills: Comma-separated preferred skills
        db_conn: Database connection for similarity lookups
        
    Returns:
        Score between 0.0 and 1.0
    """
    def parse_skills(skills_str: str) -> Set[str]:
        """Parse comma-separated skills into normalized set"""
        if not skills_str or pd.isna(skills_str):
            return set()
        
        return {
            skill.strip().lower() 
            for skill in str(skills_str).split(',') 
            if skill.strip()
        }
    
    def check_skill_match(cv_skill: str, job_skill: str, db_conn) -> float:
        """
        Check if CV skill matches job skill (with similarity)
        
        Returns:
        - 1.0 for exact match
        - 0.7-0.9 for high similarity (>0.6)
        - 0.0 for no match
        """
        if cv_skill == job_skill:
            return 1.0
        
        # Check database for similarity
        try:
            cursor = db_conn.cursor()
            cursor.execute("""
                SELECT jaccard_similarity 
                FROM matching_metadata.skill_similarity s
                JOIN matching_metadata.skills_taxonomy t1 ON s.skill_a_id = t1.id
                JOIN matching_metadata.skills_taxonomy t2 ON s.skill_b_id = t2.id
                WHERE (LOWER(t1.skill_name) = %s AND LOWER(t2.skill_name) = %s)
                   OR (LOWER(t1.skill_name) = %s AND LOWER(t2.skill_name) = %s)
                LIMIT 1
            """, (cv_skill, job_skill, job_skill, cv_skill))
            
            result = cursor.fetchone()
            if result and result[0] >= 0.6:
                return 0.7 + (result[0] - 0.6) * 0.5  # Map 0.6-1.0 to 0.7-0.9
        except Exception:
            pass
        
        return 0.0
    
    # Parse skills
    cv_skill_set = parse_skills(cv_skills)
    required_skill_set = parse_skills(required_skills)
    preferred_skill_set = parse_skills(preferred_skills)
    
    # Calculate required skills match
    required_score = 0.0
    if required_skill_set:
        required_matches = sum(
            max(check_skill_match(cv_skill, req_skill, db_conn) 
                for cv_skill in cv_skill_set)
            if cv_skill_set else 0
            for req_skill in required_skill_set
        )
        required_score = required_matches / len(required_skill_set)
    else:
        required_score = 1.0  # No required skills = everyone matches
    
    # Calculate preferred skills match
    preferred_score = 0.0
    if preferred_skill_set:
        preferred_matches = sum(
            max(check_skill_match(cv_skill, pref_skill, db_conn) 
                for cv_skill in cv_skill_set)
            if cv_skill_set else 0
            for pref_skill in preferred_skill_set
        )
        preferred_score = preferred_matches / len(preferred_skill_set)
    else:
        preferred_score = 1.0  # No preferred skills = bonus for everyone
    
    # Weighted combination (70% required, 30% preferred)
    final_score = (required_score * 0.7) + (preferred_score * 0.3)
    
    return min(final_score, 1.0)  # Cap at 1.0


def calculate_location_score(
    cv_city: str,
    cv_province: str,
    job_city: str,
    job_province: str
) -> float:
    """
    Calculate location match score
    
    Scoring:
    - Same city: 1.0
    - Same province, different city: 0.6
    - Different province: 0.3
    
    Args:
        cv_city: Candidate's city
        cv_province: Candidate's province
        job_city: Job's city
        job_province: Job's province
        
    Returns:
        Score between 0.0 and 1.0
    """
    def normalize(location: str) -> str:
        """Normalize location string"""
        if not location or pd.isna(location):
            return ''
        return str(location).strip().lower()
    
    cv_city = normalize(cv_city)
    cv_province = normalize(cv_province)
    job_city = normalize(job_city)
    job_province = normalize(job_province)
    
    # Same city
    if cv_city and job_city and cv_city == job_city:
        return 1.0
    
    # Same province
    if cv_province and job_province and cv_province == job_province:
        return 0.6
    
    # Different province
    return 0.3


def calculate_category_score(cv_job_title: str, job_category: str, db_conn) -> float:
    """
    Calculate category compatibility score using transition probabilities
    
    Uses the category_compatibility table to find career transition likelihood
    
    Args:
        cv_job_title: Current job title (used to infer category)
        job_category: Job's category
        db_conn: Database connection
        
    Returns:
        Score between 0.0 and 1.0
    """
    # Map job titles to categories (simplified)
    def infer_category(job_title: str) -> str:
        """Infer category from job title"""
        if not job_title or pd.isna(job_title):
            return 'General'
        
        title = str(job_title).lower()
        
        # Technology
        if any(word in title for word in ['software', 'developer', 'engineer', 'programmer', 'it', 'tech', 'data']):
            return 'Technology'
        
        # Healthcare
        if any(word in title for word in ['nurse', 'doctor', 'medical', 'health', 'clinical']):
            return 'Healthcare'
        
        # Education
        if any(word in title for word in ['teacher', 'instructor', 'professor', 'educator', 'tutor']):
            return 'Education'
        
        # Finance
        if any(word in title for word in ['accountant', 'finance', 'banking', 'auditor']):
            return 'Finance'
        
        # Mining
        if any(word in title for word in ['mining', 'geologist', 'metallurg']):
            return 'Mining'
        
        # Agriculture
        if any(word in title for word in ['agriculture', 'farm', 'agronomist']):
            return 'Agriculture'
        
        # Business/General
        return 'Business'
    
    cv_category = infer_category(cv_job_title)
    
    # Query database for compatibility score
    try:
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT compatibility_score
            FROM matching_metadata.category_compatibility
            WHERE from_category = %s AND to_category = %s
        """, (cv_category, job_category))
        
        result = cursor.fetchone()
        if result:
            return float(result[0])
    except Exception:
        pass
    
    # Default: same category = 1.0, different = 0.5
    if cv_category.lower() == str(job_category).lower():
        return 1.0
    else:
        return 0.5


def calculate_personalization_score(cv: Dict, job: Dict) -> float:
    """
    Calculate personalization fit score
    
    Factors:
    - Salary fit (50%): Does salary meet expectations?
    - Job type fit (50%): Does employment type match preference?
    
    Args:
        cv: CV data dict
        job: Job data dict
        
    Returns:
        Score between 0.0 and 1.0
    """
    score = 0.0
    
    # Salary fit (50%)
    try:
        cv_min = float(cv.get('salary_expectation_min', 0) or 0)
        cv_max = float(cv.get('salary_expectation_max', 999999999) or 999999999)
        job_min = float(job.get('salary_min_zmw', 0) or 0)
        job_max = float(job.get('salary_max_zmw', 0) or 0)
        
        # Check if ranges overlap
        if job_max >= cv_min and job_min <= cv_max:
            # Salary ranges overlap
            score += 0.5
        elif job_min >= cv_min * 0.8:
            # Close enough (within 20%)
            score += 0.3
    except (ValueError, TypeError):
        score += 0.25  # Neutral if data invalid
    
    # Job type fit (50%)
    cv_preferred = str(cv.get('preferred_job_type', '')).lower()
    job_type = str(job.get('employment_type', '')).lower()
    
    if cv_preferred and job_type:
        if cv_preferred in job_type or job_type in cv_preferred:
            score += 0.5
        else:
            score += 0.1  # Minor score for having a preference
    else:
        score += 0.25  # Neutral if no preference
    
    return min(score, 1.0)


# ============================================================================
# SMALL JOB SCORING FUNCTIONS (3 Components)
# ============================================================================

def calculate_skills_score_simple(cv_skills: str, job_description: str, db_conn) -> float:
    """
    Simplified skills matching for small jobs
    
    Extracts likely required skills from job description and matches against CV
    
    Args:
        cv_skills: Comma-separated CV skills
        job_description: Job description text
        db_conn: Database connection
        
    Returns:
        Score between 0.0 and 1.0
    """
    def parse_skills(skills_str: str) -> Set[str]:
        if not skills_str or pd.isna(skills_str):
            return set()
        return {s.strip().lower() for s in str(skills_str).split(',') if s.strip()}
    
    cv_skill_set = parse_skills(cv_skills)
    
    if not cv_skill_set:
        return 0.3  # Minimal score if no skills listed
    
    # Extract potential skills from description (simple keyword matching)
    description = str(job_description).lower() if job_description else ''
    
    # Count skill mentions in description
    matches = sum(1 for skill in cv_skill_set if skill in description)
    
    if not cv_skill_set:
        return 0.5
    
    return min(matches / max(len(cv_skill_set) * 0.3, 1), 1.0)


def calculate_availability_score(cv_availability: str, job_duration: str) -> float:
    """
    Calculate availability match score
    
    Scoring:
    - "Immediate" + any duration: 1.0
    - "Available" + short duration: 0.8
    - Partial match: 0.5
    - Unknown: 0.6 (neutral)
    
    Args:
        cv_availability: CV availability status
        job_duration: Job duration
        
    Returns:
        Score between 0.0 and 1.0
    """
    if not cv_availability or pd.isna(cv_availability):
        return 0.6  # Neutral
    
    availability = str(cv_availability).lower()
    duration = str(job_duration).lower() if job_duration and not pd.isna(job_duration) else ''
    
    # Immediate availability
    if 'immediate' in availability:
        return 1.0
    
    # Available
    if 'available' in availability:
        if any(term in duration for term in ['short', 'quick', 'urgent']):
            return 0.8
        return 0.7
    
    # Notice period
    if 'notice' in availability or 'week' in availability or 'month' in availability:
        if 'long' in duration or 'permanent' in duration:
            return 0.8
        return 0.5
    
    return 0.6  # Default neutral
