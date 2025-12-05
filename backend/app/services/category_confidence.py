"""
CAMSS 2.0 - Category Confidence Scorer (Phase 2)
=================================================
Multi-signal category detection with confidence scoring.
Solves the rigid binary category problem.

Academic Context:
-----------------
Implements probabilistic classification using:
- Multi-source evidence aggregation
- Weighted voting from different signals
- Confidence score normalization

Purpose:
--------
Jobs and CVs aren't purely one category. A "Hotel Receptionist" is:
- 60% Hospitality
- 30% Office/Administrative  
- 10% Customer Service

This module computes category confidence distributions.
"""

from typing import Dict, List, Tuple
import re
from collections import defaultdict


# ============================================================================
# CATEGORY KEYWORDS - Weighted by strength of association
# ============================================================================

CATEGORY_KEYWORDS = {
    'Education': {
        'strong': [
            'teacher', 'teaching', 'educator', 'instructor', 'lecturer',
            'professor', 'tutor', 'academic', 'pedagogy', 'curriculum',
            'classroom', 'student', 'school', 'university', 'college'
        ],
        'medium': [
            'education', 'training', 'learning', 'educational', 'lesson',
            'course', 'assessment', 'grading', 'examination'
        ],
        'weak': [
            'mentoring', 'coaching', 'instruction', 'guidance'
        ]
    },
    
    'Office': {
        'strong': [
            'receptionist', 'secretary', 'administrative assistant',
            'office manager', 'clerk', 'admin', 'front desk'
        ],
        'medium': [
            'administrative', 'clerical', 'office', 'filing', 'scheduling',
            'data entry', 'documentation', 'correspondence'
        ],
        'weak': [
            'organization', 'coordination', 'support'
        ]
    },
    
    'Technology': {
        'strong': [
            'developer', 'programmer', 'software engineer', 'data scientist',
            'it specialist', 'systems analyst', 'database administrator'
        ],
        'medium': [
            'programming', 'coding', 'software', 'database', 'it support',
            'technical', 'systems', 'network', 'web', 'api'
        ],
        'weak': [
            'computer', 'digital', 'tech', 'technology'
        ]
    },
    
    'Hospitality': {
        'strong': [
            'hotel', 'restaurant', 'chef', 'bartender', 'waiter',
            'housekeeping', 'concierge', 'catering'
        ],
        'medium': [
            'hospitality', 'guest services', 'food service', 'beverage',
            'accommodation', 'lodging', 'resort'
        ],
        'weak': [
            'service', 'hosting', 'entertainment'
        ]
    },
    
    'Healthcare': {
        'strong': [
            'nurse', 'doctor', 'physician', 'medical officer', 'clinician',
            'therapist', 'pharmacist', 'paramedic'
        ],
        'medium': [
            'medical', 'healthcare', 'health', 'clinical', 'patient care',
            'nursing', 'treatment', 'diagnosis'
        ],
        'weak': [
            'care', 'wellness', 'health services'
        ]
    },
    
    'Trades': {
        'strong': [
            'plumber', 'electrician', 'welder', 'mechanic', 'carpenter',
            'mason', 'technician', 'fitter'
        ],
        'medium': [
            'plumbing', 'electrical', 'welding', 'mechanical', 'installation',
            'repair', 'maintenance', 'construction'
        ],
        'weak': [
            'technical', 'skilled', 'hands-on'
        ]
    },
    
    'Business': {
        'strong': [
            'manager', 'director', 'executive', 'ceo', 'cfo',
            'administrator', 'consultant', 'analyst'
        ],
        'medium': [
            'management', 'business', 'strategy', 'operations',
            'leadership', 'administration', 'consulting'
        ],
        'weak': [
            'professional', 'corporate', 'enterprise'
        ]
    },
    
    'Sales': {
        'strong': [
            'sales representative', 'account manager', 'business development',
            'sales manager', 'salesperson'
        ],
        'medium': [
            'sales', 'selling', 'marketing', 'customer acquisition',
            'revenue', 'account management'
        ],
        'weak': [
            'client relations', 'negotiation', 'persuasion'
        ]
    },
    
    'Finance': {
        'strong': [
            'accountant', 'auditor', 'financial analyst', 'bookkeeper',
            'finance manager', 'treasurer'
        ],
        'medium': [
            'accounting', 'finance', 'financial', 'audit', 'taxation',
            'bookkeeping', 'budgeting'
        ],
        'weak': [
            'numbers', 'calculation', 'reporting'
        ]
    },
    
    'Agriculture': {
        'strong': [
            'agronomist', 'farmer', 'agricultural officer', 'veterinarian',
            'farm manager'
        ],
        'medium': [
            'agriculture', 'farming', 'crop', 'livestock', 'irrigation',
            'agricultural', 'agribusiness'
        ],
        'weak': [
            'rural', 'cultivation', 'harvest'
        ]
    },
    
    'Transport': {
        'strong': [
            'driver', 'courier', 'logistics manager', 'dispatcher',
            'transport manager'
        ],
        'medium': [
            'driving', 'transport', 'logistics', 'delivery', 'dispatch',
            'fleet', 'haulage'
        ],
        'weak': [
            'vehicle', 'route', 'shipment'
        ]
    },
    
    'Construction': {
        'strong': [
            'civil engineer', 'architect', 'surveyor', 'foreman',
            'site manager', 'builder'
        ],
        'medium': [
            'construction', 'building', 'engineering', 'infrastructure',
            'surveying', 'contracting'
        ],
        'weak': [
            'structure', 'project', 'site'
        ]
    }
}


# Skill cluster to category mapping
SKILL_CLUSTER_CATEGORY_MAP = {
    # Office clusters
    'productivity_tools': 'Office',
    'administrative_support': 'Office',
    'reception_skills': 'Office',
    'scheduling': 'Office',
    
    # Education clusters
    'teaching_methods': 'Education',
    'classroom_management': 'Education',
    'curriculum_development': 'Education',
    'assessment': 'Education',
    
    # Technology clusters
    'programming': 'Technology',
    'database_management': 'Technology',
    'it_support': 'Technology',
    
    # Hospitality clusters
    'hotel_operations': 'Hospitality',
    'food_service': 'Hospitality',
    'customer_service': 'Hospitality',
    
    # Trades clusters
    'plumbing': 'Trades',
    'electrical': 'Trades',
    'welding': 'Trades',
    
    # Healthcare clusters
    'patient_care': 'Healthcare',
    'medical_records': 'Healthcare',
    
    # Finance clusters
    'accounting': 'Finance',
    'financial_analysis': 'Finance',
}


class CategoryConfidenceScorer:
    """
    Computes category confidence scores using multiple signals.
    
    Methods:
    --------
    score_job(title, description, skills, category) -> Dict[str, float]
        Computes category confidence for a job posting
        
    score_cv(job_title, skills, experience_text) -> Dict[str, float]
        Computes category confidence for a CV
        
    get_primary_category(confidence_scores) -> Tuple[str, float]
        Returns the highest confidence category
    """
    
    def __init__(self):
        self.category_keywords = CATEGORY_KEYWORDS
        self.skill_cluster_map = SKILL_CLUSTER_CATEGORY_MAP
        
        # Weights for different signals
        self.WEIGHTS = {
            'title': 0.50,      # Job title is strongest signal
            'skills': 0.30,     # Skills are important
            'text': 0.15,       # Description/experience text
            'category': 0.05,   # Declared category (if exists)
        }
    
    
    def _score_text(self, text: str) -> Dict[str, float]:
        """
        Score text against category keywords.
        Returns confidence distribution across categories.
        """
        if not text:
            return {}
        
        text_lower = text.lower()
        scores = defaultdict(float)
        
        for category, keyword_levels in self.category_keywords.items():
            # Strong keywords: 1.0 points each
            for keyword in keyword_levels['strong']:
                if keyword in text_lower:
                    scores[category] += 1.0
            
            # Medium keywords: 0.5 points each
            for keyword in keyword_levels['medium']:
                if keyword in text_lower:
                    scores[category] += 0.5
            
            # Weak keywords: 0.2 points each
            for keyword in keyword_levels['weak']:
                if keyword in text_lower:
                    scores[category] += 0.2
        
        # Normalize to 0-1 scale
        max_score = max(scores.values()) if scores else 1.0
        if max_score > 0:
            scores = {cat: score/max_score for cat, score in scores.items()}
        
        return dict(scores)
    
    
    def _score_skills(self, skills: List[str], 
                     skill_clusters: List[str] = None) -> Dict[str, float]:
        """
        Score skills and their clusters against categories.
        """
        scores = defaultdict(float)
        
        # Score based on skill text
        skill_text = ' '.join(skills) if skills else ''
        text_scores = self._score_text(skill_text)
        
        # Add cluster-based scoring
        if skill_clusters:
            for cluster in skill_clusters:
                if cluster in self.skill_cluster_map:
                    category = self.skill_cluster_map[cluster]
                    scores[category] += 1.0
        
        # Combine text and cluster scores
        for cat, score in text_scores.items():
            scores[cat] += score
        
        # Normalize
        max_score = max(scores.values()) if scores else 1.0
        if max_score > 0:
            scores = {cat: score/max_score for cat, score in scores.items()}
        
        return dict(scores)
    
    
    def score_job(self, title: str, 
                  description: str = None,
                  skills: List[str] = None,
                  skill_clusters: List[str] = None,
                  declared_category: str = None) -> Dict[str, float]:
        """
        Compute category confidence for a job posting.
        
        Args:
            title: Job title
            description: Job description text
            skills: List of required/preferred skills
            skill_clusters: List of skill cluster names
            declared_category: Existing category field (if any)
            
        Returns:
            Dictionary mapping categories to confidence scores (0-1)
        """
        all_scores = defaultdict(float)
        
        # Signal 1: Job title (strongest)
        if title:
            title_scores = self._score_text(title)
            for cat, score in title_scores.items():
                all_scores[cat] += score * self.WEIGHTS['title']
        
        # Signal 2: Skills
        if skills:
            skill_scores = self._score_skills(skills, skill_clusters)
            for cat, score in skill_scores.items():
                all_scores[cat] += score * self.WEIGHTS['skills']
        
        # Signal 3: Description text
        if description:
            desc_scores = self._score_text(description)
            for cat, score in desc_scores.items():
                all_scores[cat] += score * self.WEIGHTS['text']
        
        # Signal 4: Declared category (weak boost)
        if declared_category and declared_category in self.category_keywords:
            all_scores[declared_category] += self.WEIGHTS['category']
        
        # Normalize to sum to 1.0
        total = sum(all_scores.values())
        if total > 0:
            all_scores = {cat: score/total for cat, score in all_scores.items()}
        
        # Sort by confidence (descending)
        return dict(sorted(all_scores.items(), key=lambda x: x[1], reverse=True))
    
    
    def score_cv(self, job_title: str,
                skills: List[str] = None,
                skill_clusters: List[str] = None,
                experience_text: str = None) -> Dict[str, float]:
        """
        Compute category confidence for a CV.
        
        Args:
            job_title: Current/desired job title
            skills: List of technical and soft skills
            skill_clusters: List of skill cluster names
            experience_text: Work experience description
            
        Returns:
            Dictionary mapping categories to confidence scores
        """
        all_scores = defaultdict(float)
        
        # Job title is strongest signal for CVs too
        if job_title:
            title_scores = self._score_text(job_title)
            for cat, score in title_scores.items():
                all_scores[cat] += score * 0.50
        
        # Skills
        if skills:
            skill_scores = self._score_skills(skills, skill_clusters)
            for cat, score in skill_scores.items():
                all_scores[cat] += score * 0.35
        
        # Experience text
        if experience_text:
            exp_scores = self._score_text(experience_text)
            for cat, score in exp_scores.items():
                all_scores[cat] += score * 0.15
        
        # Normalize
        total = sum(all_scores.values())
        if total > 0:
            all_scores = {cat: score/total for cat, score in all_scores.items()}
        
        return dict(sorted(all_scores.items(), key=lambda x: x[1], reverse=True))
    
    
    def get_primary_category(self, confidence_scores: Dict[str, float]) -> Tuple[str, float]:
        """
        Get the highest confidence category.
        
        Returns:
            Tuple of (category_name, confidence_score)
        """
        if not confidence_scores:
            return ('General', 0.0)
        
        primary = max(confidence_scores.items(), key=lambda x: x[1])
        return primary
    
    
    def is_category_match(self, cv_scores: Dict[str, float],
                         job_scores: Dict[str, float],
                         threshold: float = 0.20) -> Tuple[bool, float]:
        """
        Determine if CV and job categories match.
        
        Args:
            cv_scores: Category confidence for CV
            job_scores: Category confidence for job
            threshold: Minimum confidence to consider (default: 0.20)
            
        Returns:
            Tuple of (is_match: bool, overlap_score: float)
        """
        # Get categories above threshold
        cv_categories = {cat for cat, score in cv_scores.items() if score >= threshold}
        job_categories = {cat for cat, score in job_scores.items() if score >= threshold}
        
        # Check overlap
        overlap = cv_categories & job_categories
        
        if not overlap:
            return (False, 0.0)
        
        # Calculate weighted overlap score
        overlap_score = sum(
            min(cv_scores.get(cat, 0), job_scores.get(cat, 0))
            for cat in overlap
        )
        
        return (True, overlap_score)


    
    def compute_irrelevance_penalty(self, cv_confidence: Dict[str, float], 
                                   job_confidence: Dict[str, float]) -> Dict:
        """
        Compute irrelevance penalty based on category mismatch.
        
        Implements 3-tier penalty system:
        - SEVERE: -50% (CV and job are in completely different domains)
        - MODERATE: -25% (Some overlap but not primary match)
        - MILD: -10% (Close match but not exact)
        - NONE: 0% (Good category alignment)
        
        Args:
            cv_confidence: CV category confidence scores
            job_confidence: Job category confidence scores
            
        Returns:
            Dict with penalty_multiplier, severity, and explanation
        """
        # Get primary categories
        cv_primary, cv_primary_conf = self.get_primary_category(cv_confidence)
        job_primary, job_primary_conf = self.get_primary_category(job_confidence)
        
        # Check category match
        is_match, overlap_score = self.is_category_match(cv_confidence, job_confidence, threshold=0.15)
        
        # SEVERE MISMATCH: No overlap at all, or very weak confidence
        if not is_match or overlap_score < 0.05:
            return {
                'penalty_multiplier': 0.50,
                'severity': 'severe',
                'explanation': f'⚠️ SEVERE MISMATCH: CV is {cv_primary_conf:.0%} {cv_primary}, but job is {job_primary_conf:.0%} {job_primary}. Penalty: 50% score reduction.'
            }
        
        # MODERATE MISMATCH: Some overlap but not primary categories
        if cv_primary != job_primary and overlap_score < 0.20:
            return {
                'penalty_multiplier': 0.75,
                'severity': 'moderate',
                'explanation': f'⚠️ MODERATE MISMATCH: CV primary is {cv_primary} ({cv_primary_conf:.0%}), job primary is {job_primary} ({job_primary_conf:.0%}). Penalty: 25% reduction.'
            }
        
        # MILD MISMATCH: Primary categories different but good overlap
        if cv_primary != job_primary and overlap_score < 0.35:
            return {
                'penalty_multiplier': 0.90,
                'severity': 'mild',
                'explanation': f'⚠️ MILD MISMATCH: Different primary categories but {overlap_score:.0%} overlap. Penalty: 10% reduction.'
            }
        
        # GOOD MATCH: Primary categories match or very high overlap
        return {
            'penalty_multiplier': 1.00,
            'severity': 'none',
            'explanation': '✅ Category match: No penalty applied'
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    scorer = CategoryConfidenceScorer()
    
    print("=" * 80)
    print("CATEGORY CONFIDENCE SCORING TEST")
    print("=" * 80)
    
    # Test 1: Mathematics Teacher
    print("\n1️⃣ JOB: Mathematics Teacher")
    print("-" * 80)
    job_scores = scorer.score_job(
        title="Mathematics Teacher",
        description="Teach mathematics to secondary school students. Prepare lessons and assess student progress.",
        skills=["Mathematics Teaching", "Classroom Management", "Assessment"],
        skill_clusters=["teaching_methods", "classroom_management", "assessment"]
    )
    
    for category, confidence in list(job_scores.items())[:5]:
        print(f"   {category:20} {confidence:5.1%}")
    
    primary_cat, primary_conf = scorer.get_primary_category(job_scores)
    print(f"\n   Primary: {primary_cat} ({primary_conf:.1%})")
    
    # Test 2: Hotel Receptionist
    print("\n2️⃣ JOB: Hotel Receptionist")
    print("-" * 80)
    hotel_scores = scorer.score_job(
        title="Hotel Receptionist",
        description="Greet guests, handle check-ins, answer phones, manage reservations.",
        skills=["Customer Service", "Phone Systems", "Booking Systems"],
        skill_clusters=["reception_skills", "customer_service"]
    )
    
    for category, confidence in list(hotel_scores.items())[:5]:
        print(f"   {category:20} {confidence:5.1%}")
    
    primary_cat, primary_conf = scorer.get_primary_category(hotel_scores)
    print(f"\n   Primary: {primary_cat} ({primary_conf:.1%})")
    
    # Test 3: Category Match
    print("\n3️⃣ CATEGORY MATCH TEST")
    print("-" * 80)
    
    teacher_cv_scores = scorer.score_cv(
        job_title="Secondary School Teacher",
        skills=["Mathematics Teaching", "Classroom Management"],
        skill_clusters=["teaching_methods", "classroom_management"]
    )
    
    is_match, overlap_score = scorer.is_category_match(teacher_cv_scores, job_scores)
    print(f"   Teacher CV ↔ Math Teacher Job: {is_match} (overlap: {overlap_score:.2f})")
    
    is_match, overlap_score = scorer.is_category_match(teacher_cv_scores, hotel_scores)
    print(f"   Teacher CV ↔ Hotel Receptionist: {is_match} (overlap: {overlap_score:.2f})")
