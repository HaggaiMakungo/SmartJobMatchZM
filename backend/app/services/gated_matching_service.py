"""
SPRINT A - GATING PATCH
=======================
Implements ChatGPT's recommendations:
1. Hard gate: 0 matched skills → exclude
2. Remove base score padding
3. Early exit on threshold
4. Transparent scoring
"""

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import time
from app.models.cv import CV
from app.models.corporate_job import CorporateJob
from app.models.small_job import SmallJob
from app.services.skill_normalizer import SkillNormalizer
from app.services.enhanced_skill_matcher import EnhancedSkillMatcher


# ============================================================================
# CONFIGURATION
# ============================================================================

# Minimum score threshold (0-1 scale)
MIN_MATCH_THRESHOLD = 0.45  # 45% - configurable

# Scoring weights (simplified)
WEIGHTS = {
    'skills': 0.80,      # 80% - Primary signal
    'experience': 0.15,  # 15% - Secondary
    'location': 0.05,    # 5% - Minor bonus
}


# ============================================================================
# GATED MATCHING SERVICE
# ============================================================================

class GatedMatchingService:
    """
    Simplified matching with hard gates and transparent scoring.
    Sprint A implementation.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.skill_normalizer = SkillNormalizer()
        self.skill_matcher = EnhancedSkillMatcher(skill_normalizer=self.skill_normalizer)
    
    def match_job_to_candidates(
        self,
        job_id: str,
        min_score: float = MIN_MATCH_THRESHOLD,
        limit: int = 100
    ) -> List[Dict]:
        """
        Find best candidates for a job with hard gating.
        
        Args:
            job_id: Job identifier
            min_score: Minimum match score (0-1)
            limit: Max results
            
        Returns:
            List of matched candidates (only those passing gates)
        """
        start_time = time.time()
        
        # Get job
        job = self.db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        # Extract job skills
        t1 = time.time()
        job_skills = self._extract_job_skills(job)
        print(f"⏱️  Job skill extraction: {(time.time() - t1):.2f}s")
        
        # GATE 0: If job has no skills, can't match
        if not job_skills:
            return []
        
        # Get all CVs (TODO: add category filter in Sprint B)
        t2 = time.time()
        cvs = self.db.query(CV).all()
        total_cvs = len(cvs)
        print(f"⏱️  Database query: {(time.time() - t2):.2f}s")
        print(f"\n📊 Processing {total_cvs} CVs...")
        
        matches = []
        processed = 0
        gated_out_no_skills = 0
        gated_out_low_score = 0
        
        for cv in cvs:
            processed += 1
            if processed % 100 == 0:
                elapsed = time.time() - start_time
                rate = processed / elapsed
                eta = (total_cvs - processed) / rate
                print(f"   Progress: {processed}/{total_cvs} CVs ({len(matches)} matches) | {rate:.1f} CVs/sec | ETA: {eta:.1f}s")
            # Extract CV skills
            cv_skills = self._extract_cv_skills(cv)
            
            # GATE 1: HARD GATE - 0 skills matched → exclude
            t_skill_match = time.time()
            matched_skills, missing_skills = self._intersect_skills(cv_skills, job_skills)
            if processed == 1:
                print(f"⏱️  First skill match: {(time.time() - t_skill_match):.3f}s (includes model loading)")
            if len(matched_skills) == 0:
                gated_out_no_skills += 1
                continue  # Skip candidates with no skill overlap
            
            # Compute match score
            score = self._compute_gated_score(
                cv=cv,
                job=job,
                cv_skills=cv_skills,
                job_skills=job_skills,
                matched_skills=matched_skills,
                missing_skills=missing_skills
            )
            
            # GATE 2: Score threshold
            if score < min_score:
                gated_out_low_score += 1
                continue  # Skip low-scoring matches
            
            # Add to results
            matches.append({
                'cv_id': cv.cv_id,
                'full_name': cv.full_name,
                'current_job_title': cv.current_job_title or 'N/A',
                'total_years_experience': cv.total_years_experience or 0,
                'city': cv.city or 'N/A',
                'email': cv.email,
                'phone': cv.phone,
                'match_score': round(score * 100, 1),  # Convert to percentage
                'matched_skills': matched_skills,
                'missing_skills': missing_skills,
                'explanation': self._generate_explanation(score, matched_skills, missing_skills)
            })
        
        # Print summary
        total_time = time.time() - start_time
        print(f"\n📈 Matching Summary:")
        print(f"   Total CVs processed: {total_cvs}")
        print(f"   Gated out (no skills): {gated_out_no_skills}")
        print(f"   Gated out (low score): {gated_out_low_score}")
        print(f"   Final matches: {len(matches)}")
        print(f"   Total time: {total_time:.2f}s ({total_cvs/total_time:.1f} CVs/sec)")
        
        # Sort by score (highest first)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matches[:limit]
    
    def _extract_job_skills(self, job) -> List[str]:
        """Extract and normalize job skills"""
        skills = []
        
        if job.required_skills:
            skills.extend([s.strip() for s in job.required_skills.split(',')])
        if job.preferred_skills:
            skills.extend([s.strip() for s in job.preferred_skills.split(',')])
        
        # Normalize
        if skills:
            skill_data = self.skill_normalizer.normalize_skill_list(skills)
            return skill_data['normalized']
        
        return []
    
    def _extract_cv_skills(self, cv: CV) -> List[str]:
        """Extract and normalize CV skills"""
        skills = []
        
        if cv.skills_technical:
            skills.extend([s.strip() for s in cv.skills_technical.split(',')])
        if cv.skills_soft:
            skills.extend([s.strip() for s in cv.skills_soft.split(',')])
        
        # Normalize
        if skills:
            skill_data = self.skill_normalizer.normalize_skill_list(skills)
            return skill_data['normalized']
        
        return []
    
    def _intersect_skills(self, cv_skills: List[str], job_skills: List[str]) -> tuple:
        """
        Find matched and missing skills using enhanced skill matcher.
        Returns: (matched_skills, missing_skills)
        """
        if not job_skills:
            return ([], [])
        
        # Use semantic skill matcher
        match_results = self.skill_matcher.match_skill_lists(
            candidate_skills=cv_skills,
            job_skills=job_skills,
            debug=False
        )
        
        matched = []
        missing = []
        
        for detail in match_results['match_details']:
            if detail['matched']:
                matched.append(detail['job_skill'])
            else:
                missing.append(detail['job_skill'])
        
        return (matched, missing)
    
    def _compute_gated_score(
        self,
        cv: CV,
        job,
        cv_skills: List[str],
        job_skills: List[str],
        matched_skills: List[str],
        missing_skills: List[str]
    ) -> float:
        """
        Compute match score with transparent logic.
        
        NO BASE PADDING - score is earned through actual matches.
        """
        # Skill similarity (primary signal - 80%)
        skill_score = len(matched_skills) / len(job_skills) if job_skills else 0.0
        
        # Experience match (secondary - 15%)
        experience_score = self._compute_experience_score(
            cv.total_years_experience or 0,
            getattr(job, 'min_experience_years', 0)
        )
        
        # Location bonus (minor - 5%)
        location_score = self._compute_location_score(
            cv.city or '',
            getattr(job, 'location_city', '')
        )
        
        # Weighted sum (NO PADDING!)
        final_score = (
            skill_score * WEIGHTS['skills'] +
            experience_score * WEIGHTS['experience'] +
            location_score * WEIGHTS['location']
        )
        
        return final_score
    
    def _compute_experience_score(self, cv_years: int, required_years: int) -> float:
        """Simple experience matching"""
        if required_years == 0:
            return 1.0
        
        if cv_years >= required_years:
            # Has enough experience
            return 1.0
        else:
            # Underqualified - linear penalty
            shortage = required_years - cv_years
            if shortage <= 1:
                return 0.9
            elif shortage <= 2:
                return 0.7
            else:
                return 0.5
    
    def _compute_location_score(self, cv_location: str, job_location: str) -> float:
        """Simple location matching"""
        if not cv_location or not job_location:
            return 0.5
        
        cv_loc = cv_location.lower().strip()
        job_loc = job_location.lower().strip()
        
        if cv_loc == job_loc:
            return 1.0
        else:
            return 0.3  # Different location
    
    def _generate_explanation(
        self,
        score: float,
        matched_skills: List[str],
        missing_skills: List[str]
    ) -> str:
        """Generate simple explanation"""
        parts = []
        
        # Skills
        match_rate = len(matched_skills) / (len(matched_skills) + len(missing_skills))
        if match_rate >= 0.8:
            parts.append(f"Strong skill match ({len(matched_skills)}/{len(matched_skills) + len(missing_skills)})")
        elif match_rate >= 0.5:
            parts.append(f"Partial skill match ({len(matched_skills)}/{len(matched_skills) + len(missing_skills)})")
        else:
            parts.append(f"Weak skill match ({len(matched_skills)}/{len(matched_skills) + len(missing_skills)})")
        
        # Overall
        if score >= 0.7:
            parts.append("Good overall match")
        elif score >= 0.5:
            parts.append("Moderate match")
        else:
            parts.append("Below threshold")
        
        return " | ".join(parts)


# ============================================================================
# CONVENIENCE FUNCTION
# ============================================================================

def match_job_with_gates(
    db: Session,
    job_id: str,
    min_score: float = MIN_MATCH_THRESHOLD,
    limit: int = 100
) -> List[Dict]:
    """
    Convenience function for gated matching.
    Use this in your API endpoints.
    """
    service = GatedMatchingService(db)
    return service.match_job_to_candidates(job_id, min_score, limit)
