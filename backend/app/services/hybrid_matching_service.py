"""
Hybrid Matching Service - Combines BM25 (Keyword) + SBERT (Semantic)
Solves the "domain gap" problem by boosting exact skill matches

Key Improvements:
1. BM25 for exact keyword matching (catches "Network Engineer" = "Network Admin")
2. SBERT for semantic similarity (catches synonyms)
3. Skill rarity weighting (rare skills get higher scores)
4. Combined hybrid score with configurable weights
"""

from typing import List, Dict, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from rank_bm25 import BM25Okapi
import json
from sqlalchemy import text
from sqlalchemy.orm import Session


class HybridMatchingService:
    """
    Combines BM25 and Semantic scoring for better matching
    """
    
    def __init__(self, db: Session, embedding_service):
        self.db = db
        self.embedding_service = embedding_service
        self.bm25 = None
        self.cv_corpus = []
        self.cv_ids = []
        self.skill_rarity_weights = {}
        
    def initialize_bm25(self):
        """
        Initialize BM25 index with all CV skills
        This enables fast keyword-based matching
        """
        print("[*] Initializing BM25 index...")
        
        # Load all CVs with skills
        query = text("""
            SELECT cv_id, skills_technical, skills_soft
            FROM cvs
        """)
        results = self.db.execute(query).fetchall()
        
        self.cv_corpus = []
        self.cv_ids = []
        
        for cv_id, tech_skills, soft_skills in results:
            # Combine skills
            all_skills = []
            if tech_skills:
                all_skills.extend([s.strip().lower() for s in tech_skills.split(',')])
            if soft_skills:
                all_skills.extend([s.strip().lower() for s in soft_skills.split(',')])
            
            # Store as tokenized document
            self.cv_corpus.append(all_skills)
            self.cv_ids.append(cv_id)
        
        # Create BM25 index
        self.bm25 = BM25Okapi(self.cv_corpus)
        
        print(f"[+] BM25 index created with {len(self.cv_ids)} CVs")
    
    def compute_skill_rarity_weights(self):
        """
        Compute rarity weights for skills
        Rare skills (e.g., "Blockchain") get higher weights than common skills (e.g., "Microsoft Word")
        """
        print("[*] Computing skill rarity weights...")
        
        # Count skill occurrences
        skill_counts = {}
        total_cvs = len(self.cv_corpus)
        
        for skills in self.cv_corpus:
            for skill in skills:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
        
        # Compute rarity weights (inverse document frequency)
        for skill, count in skill_counts.items():
            # IDF formula: log(total_docs / doc_freq)
            idf = np.log((total_cvs + 1) / (count + 1)) + 1
            self.skill_rarity_weights[skill] = idf
        
        print(f"[+] Computed rarity weights for {len(self.skill_rarity_weights)} skills")
        
        # Show some examples
        rare_skills = sorted(self.skill_rarity_weights.items(), key=lambda x: x[1], reverse=True)[:5]
        common_skills = sorted(self.skill_rarity_weights.items(), key=lambda x: x[1])[:5]
        
        print(f"    Rare skills (high weight): {[s[0] for s in rare_skills]}")
        print(f"    Common skills (low weight): {[s[0] for s in common_skills]}")
    
    def compute_bm25_score(self, job_skills: List[str], cv_id: str) -> float:
        """
        Compute BM25 score for exact keyword matching
        
        Args:
            job_skills: List of job skill strings
            cv_id: CV identifier
            
        Returns:
            BM25 score (0-1 normalized)
        """
        if not self.bm25:
            return 0.0
        
        # Normalize job skills
        query_skills = [s.strip().lower() for s in job_skills]
        
        # Get BM25 scores for all CVs
        scores = self.bm25.get_scores(query_skills)
        
        # Find this CV's index
        try:
            cv_index = self.cv_ids.index(cv_id)
            raw_score = scores[cv_index]
        except ValueError:
            return 0.0
        
        # Normalize to 0-1 (BM25 scores are unbounded)
        max_possible = len(query_skills) * 2.0  # Rough heuristic
        normalized = min(raw_score / max_possible, 1.0)
        
        return normalized
    
    def compute_skill_overlap_score(self, job_skills: List[str], cv_skills: List[str]) -> Dict:
        """
        Compute exact skill overlap with rarity weighting
        
        Returns:
            Dictionary with overlap metrics
        """
        # Normalize skills
        job_skills_lower = [s.strip().lower() for s in job_skills]
        cv_skills_lower = [s.strip().lower() for s in cv_skills]
        
        # Find exact matches
        matched_skills = set(job_skills_lower) & set(cv_skills_lower)
        
        # Compute weighted overlap
        if not job_skills_lower:
            return {
                'overlap_ratio': 0.0,
                'weighted_overlap': 0.0,
                'matched_skills': [],
                'missing_skills': job_skills
            }
        
        # Basic overlap ratio
        overlap_ratio = len(matched_skills) / len(job_skills_lower)
        
        # Weighted overlap (boost for rare skills)
        total_weight = sum(self.skill_rarity_weights.get(skill, 1.0) for skill in job_skills_lower)
        matched_weight = sum(self.skill_rarity_weights.get(skill, 1.0) for skill in matched_skills)
        weighted_overlap = matched_weight / total_weight if total_weight > 0 else 0.0
        
        return {
            'overlap_ratio': overlap_ratio,
            'weighted_overlap': weighted_overlap,
            'matched_skills': list(matched_skills),
            'missing_skills': [s for s in job_skills if s.lower() not in matched_skills]
        }
    
    def compute_hybrid_score(
        self,
        job_id: str,
        cv_id: str,
        job_skills: List[str],
        cv_skills: List[str],
        weights: Dict[str, float] = None
    ) -> Tuple[float, Dict]:
        """
        Compute hybrid score combining multiple signals
        
        Args:
            job_id: Job identifier
            cv_id: CV identifier
            job_skills: List of job skills
            cv_skills: List of CV skills
            weights: Dictionary of component weights
            
        Returns:
            (hybrid_score, breakdown_dict)
        """
        # Default weights
        if weights is None:
            weights = {
                'semantic': 0.40,      # SBERT similarity
                'bm25': 0.25,          # Keyword matching
                'exact_overlap': 0.20, # Exact skill matches
                'rarity_weighted': 0.15 # Rare skill bonus
            }
        
        # 1. Semantic similarity (SBERT)
        job_embedding = self.embedding_service.get_job_embedding(job_id)
        cv_embedding = self.embedding_service.get_cv_embedding(cv_id)
        
        if job_embedding and cv_embedding:
            semantic_score = self.embedding_service.cosine_similarity(job_embedding, cv_embedding)
        else:
            semantic_score = 0.0
        
        # 2. BM25 keyword score
        bm25_score = self.compute_bm25_score(job_skills, cv_id)
        
        # 3. Skill overlap analysis
        overlap_data = self.compute_skill_overlap_score(job_skills, cv_skills)
        
        # 4. Compute weighted hybrid score
        hybrid_score = (
            semantic_score * weights['semantic'] +
            bm25_score * weights['bm25'] +
            overlap_data['overlap_ratio'] * weights['exact_overlap'] +
            overlap_data['weighted_overlap'] * weights['rarity_weighted']
        )
        
        # Ensure score is in [0, 1]
        hybrid_score = max(0.0, min(1.0, hybrid_score))
        
        # Build detailed breakdown
        breakdown = {
            'hybrid_score': hybrid_score,
            'semantic_score': semantic_score,
            'bm25_score': bm25_score,
            'exact_overlap': overlap_data['overlap_ratio'],
            'rarity_weighted_overlap': overlap_data['weighted_overlap'],
            'matched_skills': overlap_data['matched_skills'],
            'missing_skills': overlap_data['missing_skills'],
            'weights_used': weights
        }
        
        return hybrid_score, breakdown
    
    def match_candidates_hybrid(
        self,
        job_id: str,
        min_score: float = 0.0,
        top_k: int = 20,
        weights: Dict[str, float] = None
    ) -> List[Dict]:
        """
        Match candidates using hybrid scoring
        
        Args:
            job_id: Job identifier
            min_score: Minimum match score (0-1)
            top_k: Number of top results to return
            weights: Optional custom weights for scoring components
            
        Returns:
            List of matched candidates with scores and breakdowns
        """
        # Initialize if needed
        if not self.bm25:
            self.initialize_bm25()
        if not self.skill_rarity_weights:
            self.compute_skill_rarity_weights()
        
        # Get job details
        job_query = text("""
            SELECT job_id, required_skills, preferred_skills
            FROM corporate_jobs
            WHERE job_id = :job_id
        """)
        job = self.db.execute(job_query, {'job_id': job_id}).fetchone()
        
        if not job:
            return []
        
        # Extract job skills
        job_skills = []
        if job.required_skills:
            job_skills.extend([s.strip() for s in job.required_skills.split(',')])
        if job.preferred_skills:
            job_skills.extend([s.strip() for s in job.preferred_skills.split(',')])
        
        # Get all CVs
        cv_query = text("""
            SELECT cv_id, full_name, skills_technical, skills_soft, 
                   total_years_experience, city, education_level
            FROM cvs
        """)
        cvs = self.db.execute(cv_query).fetchall()
        
        # Score each CV
        results = []
        for cv in cvs:
            cv_skills = []
            if cv.skills_technical:
                cv_skills.extend([s.strip() for s in cv.skills_technical.split(',')])
            if cv.skills_soft:
                cv_skills.extend([s.strip() for s in cv.skills_soft.split(',')])
            
            # Compute hybrid score
            hybrid_score, breakdown = self.compute_hybrid_score(
                job_id=job_id,
                cv_id=cv.cv_id,
                job_skills=job_skills,
                cv_skills=cv_skills,
                weights=weights
            )
            
            # Filter by min_score
            if hybrid_score < min_score:
                continue
            
            results.append({
                'cv_id': cv.cv_id,
                'full_name': cv.full_name,
                'match_score': hybrid_score,
                'semantic_score': breakdown['semantic_score'],
                'bm25_score': breakdown['bm25_score'],
                'exact_overlap': breakdown['exact_overlap'],
                'matched_skills': breakdown['matched_skills'],
                'missing_skills': breakdown['missing_skills'],
                'years_experience': cv.total_years_experience or 0,
                'location': cv.city,
                'education': cv.education_level,
                'breakdown': breakdown
            })
        
        # Sort by hybrid score
        results.sort(key=lambda x: x['match_score'], reverse=True)
        
        return results[:top_k]
