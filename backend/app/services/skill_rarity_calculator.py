"""
CAMSS 2.0 - Phase 3: Skill Rarity Calculator
============================================
Uses TF-IDF (Term Frequency-Inverse Document Frequency) to weight skills
based on their rarity in the job market.

Academic Rationale:
"Common skills like 'Communication' provide weak signal for job matching
because they appear in 90% of jobs. Rare skills like 'Pipe Installation'
are strong discriminators and should receive higher weight."

TF-IDF Formula:
    weight(skill) = log(total_jobs / jobs_with_skill)
    
Example:
    "Communication" appears in 900/1000 jobs → weight = log(1000/900) = 0.05
    "Plumbing" appears in 20/1000 jobs → weight = log(1000/20) = 1.70
    
Result: Rare skills get 34x more weight than common skills!
"""

from typing import Dict, List, Set
from collections import Counter
import math
import json
from pathlib import Path
from app.services.skill_normalizer import SkillNormalizer


class SkillRarityCalculator:
    """
    Calculates skill importance weights based on inverse document frequency.
    
    The rarer a skill is in the job market, the more important it is
    for matching candidates to those specialized positions.
    """
    
    def __init__(self, cache_file: str = "datasets/skill_rarity_cache.json"):
        """
        Initialize the calculator.
        
        Args:
            cache_file: Path to cache computed weights (for performance)
        """
        self.cache_file = Path(cache_file)
        self.skill_weights: Dict[str, float] = {}
        self.total_jobs: int = 0
        self.skill_document_frequency: Dict[str, int] = {}
        self.normalizer = SkillNormalizer()  # NEW: Integrate skill normalization
        
        # Load cached weights if available
        if self.cache_file.exists():
            self._load_cache()
    
    def compute_weights_from_database(self, db_session) -> Dict[str, float]:
        """
        Compute skill rarity weights from actual job postings in database.
        
        Args:
            db_session: SQLAlchemy database session
            
        Returns:
            Dictionary mapping skill → rarity weight
        """
        from app.models.corporate_job import CorporateJob
        from app.models.small_job import SmallJob
        
        print("📊 Computing skill rarity weights from database...")
        
        # Get all jobs
        corporate_jobs = db_session.query(CorporateJob).all()
        small_jobs = db_session.query(SmallJob).all()
        
        self.total_jobs = len(corporate_jobs) + len(small_jobs)
        print(f"   Found {self.total_jobs} total jobs")
        
        # Count how many jobs each skill appears in
        skill_counts = Counter()
        
        for job in corporate_jobs:
            job_skills = self._extract_skills_from_job(job)
            # Normalize skills before counting
            norm_result = self.normalizer.normalize_skill_list(job_skills)
            normalized_skills = norm_result['normalized']  # FIXED: Extract normalized list
            # Each skill counts once per job (not multiple times)
            for skill in set(normalized_skills):
                skill_counts[skill.lower()] += 1
        
        for job in small_jobs:
            job_skills = self._extract_skills_from_job(job)
            # Normalize skills before counting
            norm_result = self.normalizer.normalize_skill_list(job_skills)
            normalized_skills = norm_result['normalized']  # FIXED: Extract normalized list
            for skill in set(normalized_skills):
                skill_counts[skill.lower()] += 1
        
        print(f"   Found {len(skill_counts)} unique skills")
        
        # Compute TF-IDF weights
        self.skill_weights = {}
        for skill, doc_freq in skill_counts.items():
            # IDF = log(total_docs / docs_with_term)
            # Add 1 to avoid log(1) = 0 for skills in all jobs
            idf = math.log((self.total_jobs + 1) / (doc_freq + 1))
            self.skill_weights[skill] = idf
        
        self.skill_document_frequency = dict(skill_counts)
        
        # Cache the results
        self._save_cache()
        
        print(f"   ✅ Computed {len(self.skill_weights)} skill weights")
        return self.skill_weights
    
    def get_skill_weight(self, skill: str) -> float:
        """
        Get the rarity weight for a specific skill.
        
        Args:
            skill: Skill name (case-insensitive)
            
        Returns:
            Weight value (higher = rarer/more important)
            Default weight of 4.5 for unknown skills (assumed specialized)
        """
        skill_lower = skill.lower().strip()
        # FIXED: Default weight is now 4.5 (assumed specialized/rare)
        # Rationale: Unknown skills are likely niche/specialized
        return self.skill_weights.get(skill_lower, 4.5)
    
    def get_weighted_skill_score(
        self,
        cv_skills: List[str],
        job_skills: List[str]
    ) -> Dict[str, any]:
        """
        Compute skill match score with rarity weighting.
        
        Args:
            cv_skills: List of candidate's skills
            job_skills: List of job's required skills
            
        Returns:
            Dictionary with:
                - weighted_score: 0-1 score weighted by skill rarity
                - raw_score: 0-1 score without weighting
                - matched_skills: List of matched skills with weights
                - missing_skills: List of missing skills with weights
        """
        # Normalize skills using SkillNormalizer first
        cv_norm_result = self.normalizer.normalize_skill_list(cv_skills)
        job_norm_result = self.normalizer.normalize_skill_list(job_skills)
        
        # Extract the normalized skill lists
        cv_skills_normalized = cv_norm_result['normalized']  # FIXED: Extract list
        job_skills_normalized = job_norm_result['normalized']  # FIXED: Extract list
        
        # Then lowercase for matching
        cv_skills_lower = set(s.lower().strip() for s in cv_skills_normalized if s)
        job_skills_lower = set(s.lower().strip() for s in job_skills_normalized if s)
        
        if not job_skills_lower:
            return {
                'weighted_score': 0.0,
                'raw_score': 0.0,
                'matched_skills': [],
                'missing_skills': []
            }
        
        # Find matched and missing skills
        matched = cv_skills_lower & job_skills_lower
        missing = job_skills_lower - cv_skills_lower
        
        # Compute weighted score
        total_weight = sum(self.get_skill_weight(s) for s in job_skills_lower)
        matched_weight = sum(self.get_skill_weight(s) for s in matched)
        
        weighted_score = matched_weight / total_weight if total_weight > 0 else 0.0
        raw_score = len(matched) / len(job_skills_lower) if job_skills_lower else 0.0
        
        # Prepare detailed results
        matched_details = [
            {
                'skill': skill,
                'weight': self.get_skill_weight(skill),
                'frequency': self.skill_document_frequency.get(skill, 0),
                'frequency_pct': (self.skill_document_frequency.get(skill, 0) / self.total_jobs * 100) if self.total_jobs > 0 else 0
            }
            for skill in matched
        ]
        
        missing_details = [
            {
                'skill': skill,
                'weight': self.get_skill_weight(skill),
                'frequency': self.skill_document_frequency.get(skill, 0),
                'frequency_pct': (self.skill_document_frequency.get(skill, 0) / self.total_jobs * 100) if self.total_jobs > 0 else 0
            }
            for skill in missing
        ]
        
        # Sort by weight (rarest first)
        matched_details.sort(key=lambda x: x['weight'], reverse=True)
        missing_details.sort(key=lambda x: x['weight'], reverse=True)
        
        return {
            'weighted_score': weighted_score,
            'raw_score': raw_score,
            'matched_skills': matched_details,
            'missing_skills': missing_details,
            'total_required': len(job_skills_lower),
            'total_matched': len(matched)
        }
    
    def get_top_discriminating_skills(self, n: int = 20) -> List[Dict]:
        """
        Get the top N most discriminating (rare) skills.
        
        Args:
            n: Number of skills to return
            
        Returns:
            List of dictionaries with skill info
        """
        sorted_skills = sorted(
            self.skill_weights.items(),
            key=lambda x: x[1],
            reverse=True
        )[:n]
        
        return [
            {
                'skill': skill,
                'weight': weight,
                'frequency': self.skill_document_frequency.get(skill, 0),
                'frequency_pct': (self.skill_document_frequency.get(skill, 0) / self.total_jobs * 100) if self.total_jobs > 0 else 0
            }
            for skill, weight in sorted_skills
        ]
    
    def get_most_common_skills(self, n: int = 20) -> List[Dict]:
        """
        Get the top N most common (least discriminating) skills.
        
        Args:
            n: Number of skills to return
            
        Returns:
            List of dictionaries with skill info
        """
        sorted_skills = sorted(
            self.skill_weights.items(),
            key=lambda x: x[1]
        )[:n]
        
        return [
            {
                'skill': skill,
                'weight': weight,
                'frequency': self.skill_document_frequency.get(skill, 0),
                'frequency_pct': (self.skill_document_frequency.get(skill, 0) / self.total_jobs * 100) if self.total_jobs > 0 else 0
            }
            for skill, weight in sorted_skills
        ]
    
    def _extract_skills_from_job(self, job) -> List[str]:
        """Extract all skills from a job posting."""
        skills = []
        
        # Corporate jobs
        if hasattr(job, 'required_skills') and job.required_skills:
            skills.extend([s.strip() for s in job.required_skills.split(',')])
        if hasattr(job, 'preferred_skills') and job.preferred_skills:
            skills.extend([s.strip() for s in job.preferred_skills.split(',')])
        
        # Small jobs
        if hasattr(job, 'skills') and job.skills:
            skills.extend([s.strip() for s in job.skills.split(',')])
        
        return [s for s in skills if s]  # Remove empty strings
    
    def _save_cache(self):
        """Save computed weights to cache file."""
        cache_data = {
            'total_jobs': self.total_jobs,
            'skill_weights': self.skill_weights,
            'skill_document_frequency': self.skill_document_frequency
        }
        
        self.cache_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.cache_file, 'w') as f:
            json.dump(cache_data, f, indent=2)
        
        print(f"   💾 Cached weights to {self.cache_file}")
    
    def _load_cache(self):
        """Load cached weights from file."""
        try:
            with open(self.cache_file, 'r') as f:
                cache_data = json.load(f)
            
            self.total_jobs = cache_data.get('total_jobs', 0)
            self.skill_weights = cache_data.get('skill_weights', {})
            self.skill_document_frequency = cache_data.get('skill_document_frequency', {})
            
            print(f"   ✅ Loaded {len(self.skill_weights)} cached skill weights")
        except Exception as e:
            print(f"   ⚠️ Could not load cache: {e}")


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    """
    Example: Compute and analyze skill rarity weights
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    # Create database session
    DATABASE_URL = "postgresql://postgres:Winter123@localhost/job_match_db"
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    # Initialize calculator
    calculator = SkillRarityCalculator()
    
    # Compute weights from database
    calculator.compute_weights_from_database(db)
    
    print("\n" + "=" * 80)
    print("🎯 TOP 20 MOST DISCRIMINATING (RARE) SKILLS")
    print("=" * 80)
    print("These skills are strong signals for specialized matching:")
    print()
    
    for i, skill_info in enumerate(calculator.get_top_discriminating_skills(20), 1):
        print(f"{i:2d}. {skill_info['skill']:30s} "
              f"(weight: {skill_info['weight']:.2f}, "
              f"appears in {skill_info['frequency_pct']:.1f}% of jobs)")
    
    print("\n" + "=" * 80)
    print("📊 TOP 20 MOST COMMON (GENERIC) SKILLS")
    print("=" * 80)
    print("These skills appear in many jobs and provide weak signal:")
    print()
    
    for i, skill_info in enumerate(calculator.get_most_common_skills(20), 1):
        print(f"{i:2d}. {skill_info['skill']:30s} "
              f"(weight: {skill_info['weight']:.2f}, "
              f"appears in {skill_info['frequency_pct']:.1f}% of jobs)")
    
    # Example: Compare teacher vs CEO skills
    print("\n" + "=" * 80)
    print("🔬 EXAMPLE: Teacher Skills vs CEO Skills")
    print("=" * 80)
    
    teacher_skills = [
        'Mathematics Teaching',
        'Classroom Management',
        'Lesson Planning',
        'Communication',  # Generic!
        'Teamwork'  # Generic!
    ]
    
    ceo_skills = [
        'Strategic Planning',
        'Financial Management',
        'Leadership',
        'Communication',  # Generic!
        'Teamwork'  # Generic!
    ]
    
    print("\n📚 Teacher Skills:")
    for skill in teacher_skills:
        weight = calculator.get_skill_weight(skill)
        print(f"   {skill:30s} → weight: {weight:.2f}")
    
    print("\n💼 CEO Skills:")
    for skill in ceo_skills:
        weight = calculator.get_skill_weight(skill)
        print(f"   {skill:30s} → weight: {weight:.2f}")
    
    # Example weighted matching
    print("\n" + "=" * 80)
    print("⚖️ WEIGHTED MATCHING EXAMPLE")
    print("=" * 80)
    
    job_skills = ['Mathematics Teaching', 'Lesson Planning', 'Communication']
    candidate_skills = ['Mathematics Teaching', 'Communication', 'Teamwork']
    
    result = calculator.get_weighted_skill_score(candidate_skills, job_skills)
    
    print(f"\nJob requires: {job_skills}")
    print(f"Candidate has: {candidate_skills}")
    print(f"\nRaw score (unweighted): {result['raw_score']:.2%}")
    print(f"Weighted score (rarity-aware): {result['weighted_score']:.2%}")
    print(f"\n✅ Matched skills:")
    for skill in result['matched_skills']:
        print(f"   {skill['skill']:30s} (weight: {skill['weight']:.2f}, "
              f"appears in {skill['frequency_pct']:.1f}% of jobs)")
    
    print(f"\n❌ Missing skills:")
    for skill in result['missing_skills']:
        print(f"   {skill['skill']:30s} (weight: {skill['weight']:.2f}, "
              f"appears in {skill['frequency_pct']:.1f}% of jobs)")
    
    db.close()
    print("\n" + "=" * 80)
    print("✅ SKILL RARITY ANALYSIS COMPLETE!")
    print("=" * 80)
