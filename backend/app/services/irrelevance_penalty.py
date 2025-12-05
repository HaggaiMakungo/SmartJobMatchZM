"""
CAMSS 2.0 - Irrelevance Penalty (Phase 2)
==========================================
Detects when a candidate's profile is largely irrelevant to a job category.
Applies penalty to prevent cross-domain contamination.

Academic Context:
-----------------
Implements domain adaptation penalty using:
- Profile-job category distance measurement
- Threshold-based penalty application
- Proportional penalty scaling

Purpose:
--------
Stops scenarios like:
- Teacher CV matching to CEO jobs (generic soft skills dominate)
- Receptionist CV matching to Teaching jobs (same problem)

If 70%+ of candidate's skills/experience are in wrong domain → penalty!
"""

from typing import Dict, List, Tuple


class IrrelevancePenalty:
    """
    Calculates irrelevance penalty when CV category doesn't match job category.
    
    Methods:
    --------
    calculate_penalty(cv_category_scores, job_category_scores) -> float
        Returns penalty multiplier (0.5 - 1.0)
        
    get_irrelevance_explanation(cv_scores, job_scores) -> str
        Returns human-readable explanation
    """
    
    def __init__(self):
        # Penalty thresholds
        self.SEVERE_MISMATCH_THRESHOLD = 0.15  # <15% overlap = severe
        self.MODERATE_MISMATCH_THRESHOLD = 0.30  # <30% overlap = moderate
        self.MILD_MISMATCH_THRESHOLD = 0.50  # <50% overlap = mild
        
        # Penalty multipliers
        self.SEVERE_PENALTY = 0.50  # -50% to final score
        self.MODERATE_PENALTY = 0.70  # -30% to final score
        self.MILD_PENALTY = 0.85  # -15% to final score
        self.NO_PENALTY = 1.0  # No reduction
    
    
    def calculate_penalty(self, 
                         cv_category_scores: Dict[str, float],
                         job_category_scores: Dict[str, float],
                         min_confidence: float = 0.20) -> Tuple[float, str]:
        """
        Calculate irrelevance penalty multiplier.
        
        Process:
        1. Identify strong categories in CV (>20% confidence)
        2. Identify strong categories in job (>20% confidence)
        3. Calculate category overlap
        4. Apply penalty based on overlap level
        
        Args:
            cv_category_scores: Category confidence from CV
            job_category_scores: Category confidence from job
            min_confidence: Minimum confidence to consider category (default: 0.20)
            
        Returns:
            Tuple of (penalty_multiplier: float, severity: str)
            - penalty_multiplier: 0.5 to 1.0 (multiply final score by this)
            - severity: 'none', 'mild', 'moderate', 'severe'
        """
        if not cv_category_scores or not job_category_scores:
            return (self.NO_PENALTY, 'none')
        
        # Get primary categories above threshold
        cv_categories = {
            cat: score 
            for cat, score in cv_category_scores.items() 
            if score >= min_confidence
        }
        
        job_categories = {
            cat: score 
            for cat, score in job_category_scores.items() 
            if score >= min_confidence
        }
        
        if not cv_categories or not job_categories:
            return (self.NO_PENALTY, 'none')
        
        # Calculate weighted overlap
        overlap_score = self._calculate_overlap(cv_categories, job_categories)
        
        # Determine penalty tier
        if overlap_score < self.SEVERE_MISMATCH_THRESHOLD:
            return (self.SEVERE_PENALTY, 'severe')
        elif overlap_score < self.MODERATE_MISMATCH_THRESHOLD:
            return (self.MODERATE_PENALTY, 'moderate')
        elif overlap_score < self.MILD_MISMATCH_THRESHOLD:
            return (self.MILD_PENALTY, 'mild')
        else:
            return (self.NO_PENALTY, 'none')
    
    
    def _calculate_overlap(self, 
                          cv_categories: Dict[str, float],
                          job_categories: Dict[str, float]) -> float:
        """
        Calculate category overlap score.
        
        Uses minimum of CV and job confidence for each shared category.
        This ensures both sides strongly identify with the category.
        """
        shared_categories = set(cv_categories.keys()) & set(job_categories.keys())
        
        if not shared_categories:
            return 0.0
        
        # Weighted overlap: sum of min(cv_score, job_score) for shared categories
        overlap = sum(
            min(cv_categories[cat], job_categories[cat])
            for cat in shared_categories
        )
        
        return overlap
    
    
    def get_irrelevance_explanation(self,
                                   cv_category_scores: Dict[str, float],
                                   job_category_scores: Dict[str, float],
                                   penalty_multiplier: float,
                                   severity: str) -> str:
        """
        Generate human-readable explanation of penalty.
        
        Returns:
            String explaining why penalty was applied (or not)
        """
        if severity == 'none':
            return "✅ Category match: No penalty applied"
        
        # Get top CV category
        cv_primary = max(cv_category_scores.items(), key=lambda x: x[1])
        cv_cat, cv_conf = cv_primary
        
        # Get top job category
        job_primary = max(job_category_scores.items(), key=lambda x: x[1])
        job_cat, job_conf = job_primary
        
        # Build explanation
        if severity == 'severe':
            return (f"⚠️ SEVERE MISMATCH: CV is {cv_conf:.0%} {cv_cat}, "
                   f"but job is {job_conf:.0%} {job_cat}. "
                   f"Penalty: {(1-penalty_multiplier)*100:.0f}% score reduction.")
        
        elif severity == 'moderate':
            return (f"⚠️ MODERATE MISMATCH: CV is {cv_conf:.0%} {cv_cat}, "
                   f"job is {job_conf:.0%} {job_cat}. "
                   f"Penalty: {(1-penalty_multiplier)*100:.0f}% score reduction.")
        
        elif severity == 'mild':
            return (f"⚠️ MILD MISMATCH: Some category overlap between "
                   f"{cv_cat} and {job_cat}, but not strong. "
                   f"Penalty: {(1-penalty_multiplier)*100:.0f}% score reduction.")
        
        return ""
    
    
    def calculate_with_details(self,
                              cv_category_scores: Dict[str, float],
                              job_category_scores: Dict[str, float]) -> Dict:
        """
        Calculate penalty with full diagnostic details.
        
        Returns:
            Dictionary with:
            {
                'penalty_multiplier': float,
                'severity': str,
                'explanation': str,
                'cv_primary_category': tuple,
                'job_primary_category': tuple,
                'overlap_score': float,
                'shared_categories': list
            }
        """
        penalty, severity = self.calculate_penalty(cv_category_scores, job_category_scores)
        
        # Get primary categories
        cv_primary = max(cv_category_scores.items(), key=lambda x: x[1]) if cv_category_scores else ('Unknown', 0.0)
        job_primary = max(job_category_scores.items(), key=lambda x: x[1]) if job_category_scores else ('Unknown', 0.0)
        
        # Get shared categories
        cv_cats = {cat for cat, score in cv_category_scores.items() if score >= 0.20}
        job_cats = {cat for cat, score in job_category_scores.items() if score >= 0.20}
        shared = cv_cats & job_cats
        
        # Calculate overlap
        overlap = self._calculate_overlap(
            {cat: score for cat, score in cv_category_scores.items() if score >= 0.20},
            {cat: score for cat, score in job_category_scores.items() if score >= 0.20}
        )
        
        explanation = self.get_irrelevance_explanation(
            cv_category_scores, job_category_scores, penalty, severity
        )
        
        return {
            'penalty_multiplier': penalty,
            'severity': severity,
            'explanation': explanation,
            'cv_primary_category': cv_primary,
            'job_primary_category': job_primary,
            'overlap_score': overlap,
            'shared_categories': list(shared),
            'penalty_percent': (1 - penalty) * 100
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    penalty_calc = IrrelevancePenalty()
    
    print("=" * 80)
    print("IRRELEVANCE PENALTY TEST")
    print("=" * 80)
    
    # Scenario 1: Teacher CV → Teaching Job (GOOD MATCH)
    print("\n1️⃣ SCENARIO: Teacher CV → Teaching Job")
    print("-" * 80)
    
    teacher_cv = {
        'Education': 0.75,
        'Office': 0.15,
        'Business': 0.10
    }
    
    teaching_job = {
        'Education': 0.80,
        'Office': 0.12,
        'Technology': 0.08
    }
    
    result = penalty_calc.calculate_with_details(teacher_cv, teaching_job)
    print(f"Penalty: {result['penalty_multiplier']:.2f} ({result['severity']})")
    print(f"Overlap: {result['overlap_score']:.2f}")
    print(f"Explanation: {result['explanation']}")
    
    # Scenario 2: Teacher CV → CEO Job (SEVERE MISMATCH)
    print("\n2️⃣ SCENARIO: Teacher CV → CEO Job")
    print("-" * 80)
    
    ceo_job = {
        'Business': 0.70,
        'Finance': 0.20,
        'Technology': 0.10
    }
    
    result = penalty_calc.calculate_with_details(teacher_cv, ceo_job)
    print(f"Penalty: {result['penalty_multiplier']:.2f} ({result['severity']})")
    print(f"Overlap: {result['overlap_score']:.2f}")
    print(f"Explanation: {result['explanation']}")
    
    # Scenario 3: Hotel Receptionist CV → Office Receptionist Job (MILD MISMATCH)
    print("\n3️⃣ SCENARIO: Hotel Receptionist CV → Office Receptionist Job")
    print("-" * 80)
    
    hotel_receptionist_cv = {
        'Hospitality': 0.55,
        'Office': 0.30,
        'Customer Service': 0.15
    }
    
    office_receptionist_job = {
        'Office': 0.65,
        'Hospitality': 0.20,
        'Business': 0.15
    }
    
    result = penalty_calc.calculate_with_details(hotel_receptionist_cv, office_receptionist_job)
    print(f"Penalty: {result['penalty_multiplier']:.2f} ({result['severity']})")
    print(f"Overlap: {result['overlap_score']:.2f}")
    print(f"Explanation: {result['explanation']}")
    
    # Scenario 4: Plumber CV → Teaching Job (SEVERE MISMATCH)
    print("\n4️⃣ SCENARIO: Plumber CV → Teaching Job")
    print("-" * 80)
    
    plumber_cv = {
        'Trades': 0.80,
        'Construction': 0.15,
        'General': 0.05
    }
    
    result = penalty_calc.calculate_with_details(plumber_cv, teaching_job)
    print(f"Penalty: {result['penalty_multiplier']:.2f} ({result['severity']})")
    print(f"Overlap: {result['overlap_score']:.2f}")
    print(f"Explanation: {result['explanation']}")
    
    print("\n" + "=" * 80)
    print("✅ TEST COMPLETE")
    print("=" * 80)
