from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import time
from app.models.cv import CV
from app.models.corporate_job import CorporateJob
from app.services.skill_normalizer import SkillNormalizer


# ============================================================================
# CONFIGURATION
# ============================================================================

MIN_MATCH_THRESHOLD = 0.45  # 45%

WEIGHTS = {
    'skills': 0.80,
    'experience': 0.15,
    'location': 0.05,
}


# ============================================================================
# FAST GATED MATCHING SERVICE (NO SEMANTIC AI)
# ============================================================================

class FastGatedMatchingService:
    """
    Fast matching with exact skill matching
    Sprint A implementation - optimized for speed.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.skill_normalizer = SkillNormalizer()
    
    def match_job_to_candidates(
        self,
        job_id: str,
        min_score: float = MIN_MATCH_THRESHOLD,
        limit: int = 100
    ) -> List[Dict]:
        """Fast matching with exact skill matching."""
        start_time = time.time()
        
        # Get job
        job = self.db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        # Extract job skills
        t1 = time.time()
        job_skills = self._extract_job_skills(job)
        print(f"⏱️  Job skill extraction: {(time.time() - t1):.2f}s")
        
        if not job_skills:
            return []
        
        # Convert to set for fast lookup
        job_skills_set = set(s.lower() for s in job_skills)
        
        # Get all CVs
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
                eta = (total_cvs - processed) / rate if rate > 0 else 0
                print(f"   Progress: {processed}/{total_cvs} CVs ({len(matches)} matches) | {rate:.1f} CVs/sec | ETA: {eta:.1f}s")
            
            # Extract CV skills
            cv_skills = self._extract_cv_skills(cv)
            
            # GATE 1: Fast exact matching
            cv_skills_set = set(s.lower() for s in cv_skills)
            matched_skills = list(job_skills_set.intersection(cv_skills_set))
            
            if len(matched_skills) == 0:
                gated_out_no_skills += 1
                continue
            
            missing_skills = list(job_skills_set - cv_skills_set)
            
            # Compute score
            score = self._compute_gated_score(
                cv=cv,
                job=job,
                matched_count=len(matched_skills),
                total_required=len(job_skills)
            )
            
            # GATE 2: Score threshold
            if score < min_score:
                gated_out_low_score += 1
                continue
            
            # Add to results
            matches.append({
                'cv_id': cv.cv_id,
                'full_name': cv.full_name,
                'current_job_title': cv.current_job_title or 'N/A',
                'total_years_experience': cv.total_years_experience or 0,
                'city': cv.city or 'N/A',
                'email': cv.email,
                'phone': cv.phone,
                'match_score': round(score * 100, 1),
                'matched_skills': matched_skills[:10],  # Top 10
                'missing_skills': missing_skills[:10],
                'explanation': self._generate_explanation(score, len(matched_skills), len(job_skills))
            })
        
        # Print summary
        total_time = time.time() - start_time
        print(f"\n📈 Matching Summary:")
        print(f"   Total CVs processed: {total_cvs}")
        print(f"   Gated out (no skills): {gated_out_no_skills}")
        print(f"   Gated out (low score): {gated_out_low_score}")
        print(f"   Final matches: {len(matches)}")
        print(f"   Total time: {total_time:.2f}s ({total_cvs/total_time:.1f} CVs/sec)")
        
        # Sort by score
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matches[:limit]
    
    def _extract_job_skills(self, job) -> List[str]:
        """Extract and normalize job skills"""
        skills = []
        
        if job.required_skills:
            skills.extend([s.strip() for s in job.required_skills.split(',')])
        if job.preferred_skills:
            skills.extend([s.strip() for s in job.preferred_skills.split(',')])
        
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
        
        if skills:
            skill_data = self.skill_normalizer.normalize_skill_list(skills)
            return skill_data['normalized']
        
        return []
    
    def _compute_gated_score(
        self,
        cv: CV,
        job,
        matched_count: int,
        total_required: int
    ) -> float:
        """Compute match score (fast version)"""
        # Skill similarity
        skill_score = matched_count / total_required if total_required > 0 else 0.0
        
        # Experience match
        experience_score = self._compute_experience_score(
            cv.total_years_experience or 0,
            getattr(job, 'min_experience_years', 0)
        )
        
        # Location bonus
        location_score = self._compute_location_score(
            cv.city or '',
            getattr(job, 'location_city', '')
        )
        
        # Weighted sum
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
            return 1.0
        else:
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
            return 0.3
    
    def _generate_explanation(
        self,
        score: float,
        matched_count: int,
        total_required: int
    ) -> str:
        """Generate simple explanation"""
        match_rate = matched_count / total_required if total_required > 0 else 0
        
        if match_rate >= 0.8:
            skill_text = f"Strong skill match ({matched_count}/{total_required})"
        elif match_rate >= 0.5:
            skill_text = f"Partial skill match ({matched_count}/{total_required})"
        else:
            skill_text = f"Weak skill match ({matched_count}/{total_required})"
        
        if score >= 0.7:
            overall = "Good overall match"
        elif score >= 0.5:
            overall = "Moderate match"
        else:
            overall = "Below threshold"
        
        return f"{skill_text} | {overall}"


def match_job_with_fast_gates(
    db: Session,
    job_id: str,
    min_score: float = MIN_MATCH_THRESHOLD,
    limit: int = 100
) -> List[Dict]:
    """Fast gated matching (no semantic AI)"""
    service = FastGatedMatchingService(db)
    return service.match_job_to_candidates(job_id, min_score, limit)
