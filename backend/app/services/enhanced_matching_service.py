"""
CAMSS 2.0 - Enhanced Matching Service (Phases 1-3 Integrated)
==============================================================
Combines keyword extraction, skill normalization, category confidence,
irrelevance penalty, and skill rarity weighting for optimal matching.

Academic Version for Final Year Project
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
from app.services.keyword_extractor import KeywordExtractor
from app.services.skill_normalizer import SkillNormalizer
from app.services.category_confidence import CategoryConfidenceScorer
from app.services.skill_rarity_calculator import SkillRarityCalculator
from app.services.enhanced_skill_matcher import EnhancedSkillMatcher


# ============================================================================
# ENHANCED CONFIGURATION - All Phases Combined
# ============================================================================

ENHANCED_WEIGHTS = {
    'skills': 0.80,        # 80% - PRIMARY SIGNAL (boosted by rarity)
    'experience': 0.10,    # 10% - Secondary factor
    'location': 0.05,      # 5% - Minor factor
    'education': 0.05,     # 5% - Minor factor
    'salary': 0.00,        # 0% - Excluded
}

# Experience scoring
EXPERIENCE_RANGES = {
    'entry_level': (0, 2),
    'junior': (2, 5),
    'mid_level': (5, 8),
    'senior': (8, 15),
    'executive': (15, 100),
}


# ============================================================================
# ENHANCED MATCHING SERVICE
# ============================================================================

class EnhancedMatchingService:
    """
    Enhanced matching service integrating:
    - Phase 1: Keyword extraction + skill normalization
    - Phase 2: Category confidence + irrelevance penalty
    - Phase 3: Skill rarity weighting (TF-IDF)
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.keyword_extractor = KeywordExtractor()
        self.skill_normalizer = SkillNormalizer()
        self.category_scorer = CategoryConfidenceScorer()
        
        # Initialize enhanced skill matcher with semantic similarity
        self.skill_matcher = EnhancedSkillMatcher(skill_normalizer=self.skill_normalizer)
        print("✅ EnhancedSkillMatcher initialized with semantic matching")
        
        # Initialize skill rarity calculator with cache file path
        self.skill_rarity = SkillRarityCalculator(cache_file="datasets/skill_rarity_cache.json")
        
        # Compute skill weights if not cached
        if not self.skill_rarity.skill_weights:
            print("⏳ Computing skill rarity weights (first time only)...")
            self.skill_rarity.compute_weights_from_database(db)
        
    def match_job(
        self,
        job_id: str,
        job_type: str = 'corporate',
        filters: Optional[Dict] = None,
        limit: int = 20
    ) -> List[Dict]:
        """
        REVERSE MATCHING: Find best candidates for a job.
        
        Args:
            job_id: Job identifier
            job_type: 'corporate' or 'small'
            filters: Optional filtering criteria (location, etc.)
            limit: Maximum number of matches to return
            
        Returns:
            List of candidate matches with enhanced scoring
        """
        # Get job
        if job_type == 'corporate':
            job = self.db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
        else:
            job = self.db.query(SmallJob).filter(SmallJob.job_id == job_id).first()
        
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        # Get CVs
        cvs_query = self.db.query(CV)
        
        # Apply location filter if specified
        if filters and 'location' in filters:
            location = filters['location']
            cvs_query = cvs_query.filter(CV.city.ilike(f"%{location}%"))
        elif filters and 'province' in filters:
            province = filters['province']
            cvs_query = cvs_query.filter(CV.province.ilike(f"%{province}%"))
        
        cvs = cvs_query.all()
        
        # Extract job features
        job_features = self._extract_job_features(job, job_type)
        
        # Match each CV
        matches = []
        for cv in cvs:
            cv_features = self._extract_cv_features(cv)
            
            # Compute enhanced match score
            match_result = self._compute_enhanced_match(cv_features, job_features)
            
            # Add CV details
            match_result.update({
                'full_name': cv.full_name,
                'current_job_title': cv.current_job_title or 'N/A',
                'total_years_experience': cv.total_years_experience or 0,
                'city': cv.city or 'N/A',
                'email': cv.email,
                'phone': cv.phone,
            })
            
            matches.append(match_result)
        
        # Sort by final score
        matches.sort(key=lambda x: x['final_score'], reverse=True)
        
        return matches[:limit]
    
    def match_candidate(
        self,
        cv_id: str,
        job_type: str = 'corporate',
        filters: Optional[Dict] = None,
        limit: int = 20
    ) -> List[Dict]:
        """
        Enhanced matching with all three phases integrated.
        
        Args:
            cv_id: Candidate CV identifier
            job_type: 'corporate' or 'small'
            filters: Optional filtering criteria
            limit: Maximum number of matches to return
            
        Returns:
            List of job matches with enhanced scoring
        """
        # Get CV
        cv = self.db.query(CV).filter(CV.cv_id == cv_id).first()
        if not cv:
            raise ValueError(f"CV {cv_id} not found")
        
        # Get jobs
        if job_type == 'corporate':
            jobs_query = self.db.query(CorporateJob)
        else:
            jobs_query = self.db.query(SmallJob)
        
        # Apply filters
        if filters:
            jobs_query = self._apply_filters(jobs_query, filters, job_type)
        
        jobs = jobs_query.all()
        
        # Extract CV features
        cv_features = self._extract_cv_features(cv)
        
        # Match each job
        matches = []
        for job in jobs:
            job_features = self._extract_job_features(job, job_type)
            
            # Compute enhanced match score
            match_result = self._compute_enhanced_match(cv_features, job_features)
            
            # Add job details
            match_result.update({
                'job_id': job.job_id,
                'job_type': job_type,
                'title': job.title,
                'company': getattr(job, 'company', 'N/A'),
                'location_city': getattr(job, 'location_city', getattr(job, 'city', 'N/A')),
                'salary_min': getattr(job, 'salary_min_zmw', getattr(job, 'salary_amount', None)),
                'salary_max': getattr(job, 'salary_max_zmw', None),
            })
            
            matches.append(match_result)
        
        # Sort by final score
        matches.sort(key=lambda x: x['final_score'], reverse=True)
        
        return matches[:limit]
    
    def _extract_cv_features(self, cv: CV) -> Dict:
        """Extract and enhance CV features using Phase 1-3"""
        
        # Combine all skills
        all_skills = []
        if cv.skills_technical:
            all_skills.extend([s.strip() for s in cv.skills_technical.split(',')])
        if cv.skills_soft:
            all_skills.extend([s.strip() for s in cv.skills_soft.split(',')])
        
        # Phase 1: Normalize skills - returns dict with 'normalized' and 'clusters' keys
        skill_data = self.skill_normalizer.normalize_skill_list(all_skills)
        normalized_skills = skill_data['normalized']
        skill_clusters = skill_data['clusters']
        
        # Phase 1: Extract keywords from job title
        title_keywords = self.keyword_extractor.extract_keywords(
            cv.current_job_title or cv.job_title or ""
        )
        
        # Phase 2: Get category confidence
        # Phase 2: Get category confidence using score_cv method
        cluster_names = list(skill_clusters.keys())
        category_confidence = self.category_scorer.score_cv(
            job_title=cv.current_job_title or "General Worker",
            skills=normalized_skills,
            skill_clusters=cluster_names
        )
        
        return {
            'cv_id': cv.cv_id,
            'raw_skills': all_skills,
            'normalized_skills': normalized_skills,
            'skill_clusters': skill_clusters,
            'title_keywords': title_keywords,
            'category_confidence': category_confidence,
            'experience_years': cv.total_years_experience or 0,
            'location': cv.city,
            'education_level': cv.education_level,
            'salary_expectation_min': cv.salary_expectation_min or 0,
            'salary_expectation_max': cv.salary_expectation_max or 99999,
        }
    
    def _extract_job_features(self, job, job_type: str) -> Dict:
        """Extract and enhance job features using Phase 1-3"""
        
        # Get job skills
        if job_type == 'corporate':
            job_skills = []
            if job.required_skills:
                job_skills.extend([s.strip() for s in job.required_skills.split(',')])
            if job.preferred_skills:
                job_skills.extend([s.strip() for s in job.preferred_skills.split(',')])
        else:
            job_skills = []
            if job.required_skills:
                job_skills.extend([s.strip() for s in job.required_skills.split(',')])
        
        # Phase 1: Normalize skills - returns dict with 'normalized' and 'clusters' keys
        skill_data = self.skill_normalizer.normalize_skill_list(job_skills)
        normalized_skills = skill_data['normalized']
        skill_clusters = skill_data['clusters']
        
        # Phase 1: Extract keywords from job description
        description = getattr(job, 'description', '') or getattr(job, 'job_description', '') or ''
        desc_keywords = self.keyword_extractor.extract_keywords(description)
        title_keywords = self.keyword_extractor.extract_keywords(job.title)
        
        # Phase 2: Get category confidence
        # Phase 2: Get category confidence using score_job method
        cluster_names = list(skill_clusters.keys())
        description = getattr(job, 'description', '') or getattr(job, 'job_description', '') or ''
        declared_category = getattr(job, 'category', None)
        category_confidence = self.category_scorer.score_job(
            title=job.title,
            description=description,
            skills=normalized_skills,
            skill_clusters=cluster_names,
            declared_category=declared_category
        )
        
        return {
            'job_id': job.job_id,
            'title': job.title,
            'raw_skills': job_skills,
            'normalized_skills': normalized_skills,
            'skill_clusters': skill_clusters,
            'desc_keywords': desc_keywords,
            'title_keywords': title_keywords,
            'category_confidence': category_confidence,
            'experience_required': getattr(job, 'min_experience_years', 0),
            'location': getattr(job, 'location_city', getattr(job, 'city', 'N/A')),
            'education_required': getattr(job, 'education_level', None),
            'salary_min': getattr(job, 'salary_min_zmw', getattr(job, 'salary_amount', 0)),
            'salary_max': getattr(job, 'salary_max_zmw', 0),
        }
    
    def _compute_enhanced_match(self, cv_features: Dict, job_features: Dict) -> Dict:
        """
        Compute enhanced match score using all three phases:
        1. Skills score with rarity weighting (Phase 3)
        2. Experience compatibility
        3. Location match
        4. Education match
        5. Category confidence and irrelevance penalty (Phase 2)
        """
        
        # ========================================================================
        # PHASE 3: SKILL RARITY WEIGHTING (TF-IDF)
        # ========================================================================
        
        skills_result = self._compute_weighted_skills_score(
            cv_features['normalized_skills'],
            job_features['normalized_skills']
        )
        
        skills_score = skills_result['weighted_score']
        matched_skills = skills_result['matched_skills']
        missing_skills = skills_result['missing_skills']
        
        # ========================================================================
        # EXPERIENCE SCORING
        # ========================================================================
        
        experience_score = self._compute_experience_score(
            cv_features['experience_years'],
            job_features['experience_required']
        )
        
        # ========================================================================
        # LOCATION SCORING
        # ========================================================================
        
        location_score = self._compute_location_score(
            cv_features['location'],
            job_features['location']
        )
        
        # ========================================================================
        # EDUCATION SCORING
        # ========================================================================
        
        education_score = self._compute_education_score(
            cv_features['education_level'],
            job_features['education_required']
        )
        
        # ========================================================================
        # COMBINE SCORES WITH WEIGHTS
        # ========================================================================
        
        raw_score = (
            skills_score * ENHANCED_WEIGHTS['skills'] +
            experience_score * ENHANCED_WEIGHTS['experience'] +
            location_score * ENHANCED_WEIGHTS['location'] +
            education_score * ENHANCED_WEIGHTS['education']
        )
        
        # ========================================================================
        # PHASE 2: CATEGORY CONFIDENCE & IRRELEVANCE PENALTY
        # ========================================================================
        
        penalty_result = self.category_scorer.compute_irrelevance_penalty(
            cv_features['category_confidence'],
            job_features['category_confidence']
        )
        
        # Apply penalty
        final_score = raw_score * penalty_result['penalty_multiplier']
        
        # ========================================================================
        # RETURN COMPREHENSIVE RESULTS
        # ========================================================================
        
        return {
            'cv_id': cv_features['cv_id'],
            'job_id': job_features['job_id'],
            
            # Final scores
            'final_score': round(final_score * 100, 1),
            'raw_score': round(raw_score * 100, 1),
            
            # Component scores (before weighting)
            'skills_score': round(skills_score * 100, 1),
            'experience_score': round(experience_score * 100, 1),
            'location_score': round(location_score * 100, 1),
            'education_score': round(education_score * 100, 1),
            
            # Phase 2: Category analysis
            'cv_category': max(cv_features['category_confidence'].items(), key=lambda x: x[1])[0] if cv_features['category_confidence'] else 'Unknown',
            'job_category': max(job_features['category_confidence'].items(), key=lambda x: x[1])[0] if job_features['category_confidence'] else 'Unknown',
            'category_penalty': penalty_result['penalty_multiplier'],
            'penalty_severity': penalty_result['severity'],
            
            # Phase 3: Skill details
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'skills_match_rate': round(len(matched_skills) / max(len(job_features['normalized_skills']), 1) * 100, 1),
            
            # Explanation
            'explanation': self._generate_explanation(
                skills_score, experience_score, location_score, education_score,
                penalty_result, matched_skills, missing_skills
            )
        }
    
    def _compute_weighted_skills_score(
        self,
        cv_skills: List[str],
        job_skills: List[str]
    ) -> Dict:
        """
        Phase 3: Compute skills score with TF-IDF weighting
        """
        if not job_skills:
            return {
                'weighted_score': 0.0,
                'matched_skills': [],
                'missing_skills': []
            }
        
        # USE ENHANCED SKILL MATCHER with semantic similarity!
        match_results = self.skill_matcher.match_skill_lists(
            candidate_skills=cv_skills,
            job_skills=job_skills,
            debug=False  # Set to True for debugging
        )
        
        matched_skills = []
        missing_skills = []
        
        # Process matched skills with TF-IDF weights
        for detail in match_results['match_details']:
            skill = detail['job_skill']
            skill_lower = skill.lower()
            weight = self.skill_rarity.get_skill_weight(skill_lower)
            
            if detail['matched']:
                matched_skills.append({
                    'skill': skill,
                    'weight': weight,
                    'confidence': detail['confidence'],
                    'method': detail['method']
                })
            else:
                missing_skills.append({
                    'skill': skill,
                    'weight': weight
                })
        
        # Compute weighted score
        if not (matched_skills or missing_skills):
            return {
                'weighted_score': 0.0,
                'matched_skills': [],
                'missing_skills': []
            }
        
        total_weight = sum(s['weight'] for s in matched_skills) + sum(s['weight'] for s in missing_skills)
        matched_weight = sum(s['weight'] for s in matched_skills)
        
        weighted_score = matched_weight / total_weight if total_weight > 0 else 0.0
        
        return {
            'weighted_score': weighted_score,
            'matched_skills': [s['skill'] for s in matched_skills],
            'missing_skills': [s['skill'] for s in missing_skills]
        }
    
    def _compute_experience_score(self, cv_years: int, required_years: int) -> float:
        """Experience compatibility score"""
        if required_years == 0:
            return 1.0
        
        if cv_years >= required_years:
            # Perfect match or overqualified
            overage = cv_years - required_years
            if overage <= 2:
                return 1.0
            elif overage <= 5:
                return 0.9  # Slight penalty for overqualification
            else:
                return 0.8  # More penalty for significant overqualification
        else:
            # Underqualified
            shortage = required_years - cv_years
            if shortage <= 1:
                return 0.9
            elif shortage <= 2:
                return 0.7
            else:
                return 0.5
    
    def _compute_location_score(self, cv_location: str, job_location: str) -> float:
        """Location match score"""
        if not cv_location or not job_location:
            return 0.5
        
        cv_loc = cv_location.lower().strip()
        job_loc = job_location.lower().strip()
        
        # Exact match
        if cv_loc == job_loc:
            return 1.0
        
        # Same province (simplified)
        province_mapping = {
            'lusaka': 'lusaka',
            'kitwe': 'copperbelt',
            'ndola': 'copperbelt',
            'livingstone': 'southern',
            'chipata': 'eastern',
            'solwezi': 'northwestern',
        }
        
        cv_province = province_mapping.get(cv_loc, cv_loc)
        job_province = province_mapping.get(job_loc, job_loc)
        
        if cv_province == job_province:
            return 0.7
        
        # Different province
        return 0.3
    
    def _compute_education_score(self, cv_education: str, required_education: str) -> float:
        """Education level match score"""
        if not required_education:
            return 1.0
        
        if not cv_education:
            return 0.5
        
        education_levels = {
            'grade 12': 1,
            'certificate': 2,
            'diploma': 3,
            'bachelor': 4,
            'masters': 5,
            'phd': 6,
        }
        
        cv_level = education_levels.get(cv_education.lower(), 0)
        required_level = education_levels.get(required_education.lower(), 0)
        
        if cv_level >= required_level:
            return 1.0
        elif cv_level == required_level - 1:
            return 0.7
        else:
            return 0.4
    
    def _generate_explanation(
        self,
        skills_score: float,
        experience_score: float,
        location_score: float,
        education_score: float,
        penalty_result: Dict,
        matched_skills: List[str],
        missing_skills: List[str]
    ) -> str:
        """Generate human-readable explanation"""
        
        parts = []
        
        # Skills
        if skills_score >= 0.7:
            parts.append(f"✅ Strong skill match ({len(matched_skills)} matched)")
        elif skills_score >= 0.4:
            parts.append(f"⚠️ Partial skill match ({len(matched_skills)} matched, {len(missing_skills)} missing)")
        else:
            parts.append(f"❌ Weak skill match ({len(missing_skills)} key skills missing)")
        
        # Experience
        if experience_score >= 0.9:
            parts.append("✅ Experience level matches")
        elif experience_score >= 0.7:
            parts.append("⚠️ Close experience level")
        else:
            parts.append("❌ Experience gap")
        
        # Location
        if location_score == 1.0:
            parts.append("✅ Same city")
        elif location_score >= 0.7:
            parts.append("⚠️ Same province")
        else:
            parts.append("❌ Different region")
        
        # Category penalty
        if penalty_result['severity'] != 'none':
            parts.append(f"⚠️ Category mismatch penalty: {penalty_result['severity']}")
        
        return " | ".join(parts)
    
    def _apply_filters(self, query, filters: Dict, job_type: str):
        """Apply optional filters to job query"""
        
        if 'location' in filters:
            location = filters['location']
            if job_type == 'corporate':
                query = query.filter(CorporateJob.location_city.ilike(f"%{location}%"))
            else:
                query = query.filter(SmallJob.city.ilike(f"%{location}%"))
        
        if 'salary_min' in filters:
            if job_type == 'corporate':
                query = query.filter(CorporateJob.salary_min_zmw >= filters['salary_min'])
            else:
                query = query.filter(SmallJob.salary_amount >= filters['salary_min'])
        
        if 'category' in filters:
            category = filters['category']
            if job_type == 'corporate':
                query = query.filter(CorporateJob.category.ilike(f"%{category}%"))
        
        return query


# ============================================================================
# STANDALONE FUNCTIONS FOR TESTING
# ============================================================================

def match_candidate_enhanced(
    db: Session,
    cv_id: str,
    job_type: str = 'corporate',
    filters: Optional[Dict] = None,
    limit: int = 20
) -> List[Dict]:
    """
    Convenience function for enhanced matching
    """
    service = EnhancedMatchingService(db)
    return service.match_candidate(cv_id, job_type, filters, limit)
