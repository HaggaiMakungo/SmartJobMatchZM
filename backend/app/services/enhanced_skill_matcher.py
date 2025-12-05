"""
CAMSS 2.0 - Enhanced Skill Matcher
===================================
Combines multiple matching strategies:
1. Exact matching (normalized)
2. Cluster-based matching (logistics_management cluster)
3. Semantic similarity (using sentence transformers)
4. Fuzzy matching with lower threshold

This solves cases like:
- "Supply Chain Officer" → "Supply Chain Knowledge" ✅
- "Logistics" → "Logistics Management" ✅
- "Problem-solving" → "Problem Solving" ✅
"""

from typing import List, Set, Tuple, Dict
from difflib import SequenceMatcher
import re

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    SEMANTIC_AVAILABLE = True
except ImportError:
    SEMANTIC_AVAILABLE = False
    print("⚠️ sentence-transformers not installed. Semantic matching disabled.")
    print("   Install: pip install sentence-transformers")


class EnhancedSkillMatcher:
    """
    Multi-strategy skill matching for better accuracy.
    
    Strategies (in order):
    1. Exact match (after normalization)
    2. Cluster match (same semantic cluster)
    3. Semantic similarity (>0.75 threshold)
    4. Fuzzy string match (>0.70 threshold)
    5. Partial token match (shared words)
    """
    
    def __init__(self, skill_normalizer=None):
        """
        Args:
            skill_normalizer: Instance of SkillNormalizer (optional)
        """
        self.normalizer = skill_normalizer
        self.semantic_available = SEMANTIC_AVAILABLE
        
        # Load semantic model if available
        self.semantic_model = None
        if self.semantic_available:
            try:
                # Use a small, fast model
                self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
                print("✅ Semantic matching enabled (all-MiniLM-L6-v2)")
            except Exception as e:
                print(f"⚠️ Could not load semantic model: {e}")
                self.semantic_available = False
    
    
    def normalize_text(self, text: str) -> str:
        """Clean and normalize text for comparison."""
        if not text:
            return ""
        
        # Lowercase, remove special chars, normalize whitespace
        text = text.lower().strip()
        text = re.sub(r'[^\w\s-]', '', text)  # Keep hyphens
        text = re.sub(r'\s+', ' ', text)
        return text
    
    
    def get_tokens(self, text: str) -> Set[str]:
        """Extract meaningful tokens from text."""
        normalized = self.normalize_text(text)
        
        # Split on whitespace and hyphens
        tokens = set(re.split(r'[\s-]+', normalized))
        
        # Remove common stop words
        stop_words = {'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with'}
        tokens = {t for t in tokens if t and t not in stop_words and len(t) > 1}
        
        return tokens
    
    
    def calculate_semantic_similarity(self, skill1: str, skill2: str) -> float:
        """
        Calculate semantic similarity using sentence transformers.
        
        Returns:
            Similarity score 0-1, or 0 if semantic matching unavailable
        """
        if not self.semantic_model:
            return 0.0
        
        try:
            # Encode both skills
            embeddings = self.semantic_model.encode([skill1, skill2])
            
            # Calculate cosine similarity
            similarity = np.dot(embeddings[0], embeddings[1]) / (
                np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
            )
            
            return float(similarity)
        except Exception as e:
            print(f"⚠️ Semantic similarity error: {e}")
            return 0.0
    
    
    def match_skills(self, candidate_skill: str, job_skill: str, 
                    debug: bool = False) -> Tuple[bool, float, str]:
        """
        Check if two skills match using multiple strategies.
        
        Args:
            candidate_skill: Skill from candidate's CV
            job_skill: Skill from job requirements
            debug: Print debug info
            
        Returns:
            Tuple of (is_match, confidence, method)
            - is_match: True if skills match
            - confidence: Match confidence 0-1
            - method: Which matching method succeeded
        """
        
        # Strategy 1: Exact match (normalized)
        norm1 = self.normalize_text(candidate_skill)
        norm2 = self.normalize_text(job_skill)
        
        if norm1 == norm2:
            return (True, 1.0, "exact")
        
        # Strategy 2: Cluster match (if normalizer available)
        if self.normalizer:
            cluster1 = self.normalizer.get_skill_cluster(candidate_skill)
            cluster2 = self.normalizer.get_skill_cluster(job_skill)
            
            if cluster1 == cluster2 and cluster1 != 'unclustered':
                return (True, 0.95, "cluster")
        
        # Strategy 3: Semantic similarity
        if self.semantic_model:
            semantic_score = self.calculate_semantic_similarity(
                candidate_skill, job_skill
            )
            
            if semantic_score >= 0.65:  # Lowered from 0.75 for better matching
                if debug:
                    print(f"   Semantic: {semantic_score:.3f} - '{candidate_skill}' ≈ '{job_skill}'")
                return (True, semantic_score, "semantic")
        
        # Strategy 4: Fuzzy string match (lowered threshold)
        fuzzy_score = SequenceMatcher(None, norm1, norm2).ratio()
        
        if fuzzy_score >= 0.65:  # Lowered from 0.70 for better matching
            if debug:
                print(f"   Fuzzy: {fuzzy_score:.3f} - '{candidate_skill}' ≈ '{job_skill}'")
            return (True, fuzzy_score, "fuzzy")
        
        # Strategy 5: Partial token match
        tokens1 = self.get_tokens(candidate_skill)
        tokens2 = self.get_tokens(job_skill)
        
        if tokens1 and tokens2:
            shared = tokens1 & tokens2
            total = tokens1 | tokens2
            token_score = len(shared) / len(total)
            
            # Match if significant token overlap
            if token_score >= 0.40:  # Lowered from 0.50 for better matching
                if debug:
                    print(f"   Tokens: {token_score:.3f} - shared: {shared}")
                return (True, token_score, "token")
        
        return (False, 0.0, "none")
    
    
    def match_skill_lists(self, candidate_skills: List[str], 
                         job_skills: List[str],
                         debug: bool = False) -> Dict:
        """
        Match two skill lists and return detailed results.
        
        Args:
            candidate_skills: Skills from candidate
            job_skills: Skills required by job
            debug: Print debug info
            
        Returns:
            Dictionary with:
            {
                'matched_skills': [...],
                'missing_skills': [...],
                'match_count': int,
                'match_percentage': float,
                'match_details': [...]
            }
        """
        matched_skills = []
        missing_skills = []
        match_details = []
        
        for job_skill in job_skills:
            best_match = None
            best_confidence = 0.0
            best_method = "none"
            
            # Try to match with each candidate skill
            for candidate_skill in candidate_skills:
                is_match, confidence, method = self.match_skills(
                    candidate_skill, job_skill, debug=debug
                )
                
                if is_match and confidence > best_confidence:
                    best_match = candidate_skill
                    best_confidence = confidence
                    best_method = method
            
            if best_match:
                matched_skills.append({
                    'job_skill': job_skill,
                    'candidate_skill': best_match,
                    'confidence': best_confidence,
                    'method': best_method
                })
            else:
                missing_skills.append(job_skill)
            
            match_details.append({
                'job_skill': job_skill,
                'matched': best_match is not None,
                'candidate_skill': best_match,
                'confidence': best_confidence,
                'method': best_method
            })
        
        match_count = len(matched_skills)
        total_skills = len(job_skills)
        match_percentage = (match_count / total_skills * 100) if total_skills > 0 else 0
        
        return {
            'matched_skills': [m['job_skill'] for m in matched_skills],
            'missing_skills': missing_skills,
            'match_count': match_count,
            'total_required': total_skills,
            'match_percentage': match_percentage,
            'match_details': match_details
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("🧪 ENHANCED SKILL MATCHER TEST")
    print("=" * 80)
    
    matcher = EnhancedSkillMatcher()
    
    # Test cases from Benson's CV
    test_cases = [
        ("Logistics", "Logistics Management"),
        ("Supply Chain Officer", "Supply Chain Knowledge"),
        ("Problem-solving", "Problem Solving"),
        ("Inventory Management", "Inventory Control"),
        ("Procurement", "Purchasing"),
        ("Organization", "Time Management"),  # Should NOT match
    ]
    
    print("\n📝 Individual Matches:\n")
    for candidate_skill, job_skill in test_cases:
        is_match, confidence, method = matcher.match_skills(
            candidate_skill, job_skill, debug=True
        )
        
        status = "✅ MATCH" if is_match else "❌ NO MATCH"
        print(f"{status} [{method:8}] {confidence:.2f} - '{candidate_skill}' vs '{job_skill}'")
    
    # Test full skill list matching
    print("\n" + "=" * 80)
    print("📋 FULL SKILL LIST TEST")
    print("=" * 80)
    
    benson_skills = [
        "Inventory Management",
        "Logistics",
        "Procurement",
        "Organization",
        "Problem-solving",
        "Negotiation"
    ]
    
    job_requirements = [
        "Logistics Management",
        "Route Planning",
        "Microsoft Office Suite",
        "Communication",
        "Problem Solving",
        "Supply Chain Knowledge",
        "GPS Tracking Systems",
        "Customer Service",
        "Scheduling & Calendar Management",
        "Inventory Management"
    ]
    
    results = matcher.match_skill_lists(benson_skills, job_requirements, debug=True)
    
    print(f"\n📊 RESULTS:")
    print(f"   Matched: {results['match_count']}/{results['total_required']}")
    print(f"   Match %: {results['match_percentage']:.1f}%")
    print(f"\n   ✅ Matched skills:")
    for skill in results['matched_skills']:
        print(f"      • {skill}")
    print(f"\n   ❌ Missing skills:")
    for skill in results['missing_skills']:
        print(f"      • {skill}")
