"""
Hybrid Matching API Endpoint
Provides improved matching using BM25 + SBERT
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.hybrid_matching_service import HybridMatchingService
from sprint_b_phase2_embedding_service import EmbeddingService
from typing import Optional
import time

router = APIRouter()


@router.get("/job/{job_id}/candidates/hybrid")
def get_hybrid_matches(
    job_id: str,
    min_score: float = Query(0.0, ge=0.0, le=1.0),
    top_k: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get matched candidates using hybrid scoring (BM25 + SBERT)
    
    Args:
        job_id: Job identifier
        min_score: Minimum match score (0-1)
        top_k: Number of results to return
        
    Returns:
        List of matched candidates with detailed scoring breakdown
    """
    start_time = time.time()
    
    try:
        # Initialize services
        embedding_service = EmbeddingService(db)
        hybrid_service = HybridMatchingService(db, embedding_service)
        
        # Get matches
        matches = hybrid_service.match_candidates_hybrid(
            job_id=job_id,
            min_score=min_score,
            top_k=top_k
        )
        
        elapsed_time = time.time() - start_time
        
        return {
            'success': True,
            'job_id': job_id,
            'total_matches': len(matches),
            'matches': matches,
            'processing_time': round(elapsed_time, 2),
            'method': 'hybrid_scoring',
            'components': {
                'semantic': 'all-MiniLM-L6-v2',
                'keyword': 'BM25Okapi',
                'overlap': 'exact_match_with_rarity_weighting'
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during hybrid matching: {str(e)}"
        )


@router.get("/job/{job_id}/candidates/hybrid/compare")
def compare_matching_methods(
    job_id: str,
    top_k: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Compare semantic-only vs hybrid scoring side-by-side
    
    Returns:
        Comparison of both methods with score differences
    """
    try:
        embedding_service = EmbeddingService(db)
        
        # Get semantic-only matches
        from app.services.fast_semantic_matching_service import FastSemanticMatchingService
        semantic_service = FastSemanticMatchingService(db)
        semantic_matches = semantic_service.match_candidates(db, job_id, min_score=0.0, top_k=top_k)
        
        # Get hybrid matches
        hybrid_service = HybridMatchingService(db, embedding_service)
        hybrid_matches = hybrid_service.match_candidates_hybrid(job_id, min_score=0.0, top_k=top_k)
        
        # Compare
        comparison = []
        for i in range(min(len(semantic_matches), len(hybrid_matches))):
            sem = semantic_matches[i]
            hyb = hybrid_matches[i]
            
            comparison.append({
                'rank': i + 1,
                'semantic_only': {
                    'name': sem.get('full_name'),
                    'score': sem.get('match_score'),
                    'matched_skills': len(sem.get('matched_skills', []))
                },
                'hybrid': {
                    'name': hyb.get('full_name'),
                    'score': hyb.get('match_score'),
                    'semantic': hyb.get('semantic_score'),
                    'bm25': hyb.get('bm25_score'),
                    'overlap': hyb.get('exact_overlap'),
                    'matched_skills': len(hyb.get('matched_skills', []))
                },
                'improvement': hyb.get('match_score', 0) - sem.get('match_score', 0)
            })
        
        return {
            'success': True,
            'job_id': job_id,
            'comparison': comparison,
            'summary': {
                'avg_semantic_score': sum(c['semantic_only']['score'] for c in comparison) / len(comparison) if comparison else 0,
                'avg_hybrid_score': sum(c['hybrid']['score'] for c in comparison) / len(comparison) if comparison else 0,
                'avg_improvement': sum(c['improvement'] for c in comparison) / len(comparison) if comparison else 0
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during comparison: {str(e)}"
        )
