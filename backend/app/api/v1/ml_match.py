"""
CAMSS 2.0 - ML Matching API Endpoints
FastAPI endpoints for ML-powered job matching.

New Endpoints:
- GET /ml/match/candidate/{cv_id}/predictions - Pure ML rankings
- GET /ml/match/candidate/{cv_id}/hybrid - Hybrid (ML + rule-based) rankings
- GET /ml/model/info - Model metadata and status
- POST /ml/model/retrain - Trigger model retraining

Author: Haggai Makungo
Version: 1.0.0
"""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks, Depends
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.services.ml_matching_service import MLMatchingService
from app.schemas.matching import MatchResponse, JobMatch
from app.db.session import get_db

# Create router
router = APIRouter(prefix="/ml/match", tags=["ML Matching"])


# ==================== Pydantic Models ====================

class MLJobMatch(BaseModel):
    """Enhanced job match with ML scores."""
    job: Dict
    match_score: float = Field(..., description="Overall match score")
    ml_score: float = Field(..., description="ML predicted application probability")
    rule_score: float = Field(..., description="Original rule-based score")
    hybrid_score: Optional[float] = Field(None, description="Hybrid score (if applicable)")
    sub_scores: Dict[str, float] = Field(..., description="Component scores")
    reasons: List[str] = Field(..., description="Match reasons")
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)


class MLMatchResponse(BaseModel):
    """Response for ML match endpoints."""
    cv_id: str
    total_matches: int
    matches: List[MLJobMatch]
    ranking_method: str = Field(..., description="Method used: 'ml', 'hybrid', or 'rule-based'")
    ml_model_loaded: bool
    timestamp: str


class ModelInfo(BaseModel):
    """Model information response."""
    model_loaded: bool
    model_type: Optional[str] = None
    model_path: str
    n_features: Optional[int] = None
    trained_at: Optional[str] = None
    best_iteration: Optional[int] = None
    test_auc: Optional[float] = None
    message: str


class RetrainRequest(BaseModel):
    """Request for model retraining."""
    force_retrain: bool = Field(False, description="Force retrain even if recent")


class RetrainResponse(BaseModel):
    """Response for retrain endpoint."""
    status: str
    message: str
    started_at: str


# ==================== API Endpoints ====================

@router.get(
    "/candidate/{cv_id}/predictions",
    response_model=MLMatchResponse,
    summary="Get ML-ranked job matches",
    description="Returns jobs ranked by ML predicted application probability (pure ML ranking)"
)
async def get_ml_predictions(
    cv_id: str,
    job_type: Optional[str] = Query(
        None, 
        description="Filter by job type: 'corporate', 'small', or None for both",
        regex="^(corporate|small)$"
    ),
    top_n: int = Query(20, ge=1, le=100, description="Number of matches to return"),
    db = Depends(get_db)
):
    """
    Get job matches ranked purely by ML model predictions.
    
    The ML model predicts the probability that a user will apply to each job
    based on learned patterns from historical interactions.
    
    **Key Features:**
    - Pure ML ranking (no rule-based influence)
    - Learns from 7,500+ historical interactions
    - Predicts application probability (0.0 - 1.0)
    - Best for personalized recommendations
    
    **Example Response:**
    ```json
    {
      "cv_id": "1127",
      "total_matches": 20,
      "ranking_method": "ml",
      "ml_model_loaded": true,
      "matches": [
        {
          "ml_score": 0.842,
          "rule_score": 0.735,
          "job": {...},
          "reasons": ["High application probability", "Strong skills match"]
        }
      ]
    }
    ```
    """
    try:
        # Get ML service with database connection
        ml_service = MLMatchingService(db=db)
        
        # Get ML-ranked matches
        matches = ml_service.get_ml_ranked_matches(cv_id, job_type, top_n)
        
        if not matches:
            raise HTTPException(
                status_code=404,
                detail=f"No matches found for CV ID: {cv_id}"
            )
        
        # Convert to response format
        ml_matches = []
        for match in matches:
            ml_match = MLJobMatch(
                job=match['job'],
                match_score=match['match_score'],
                ml_score=match['ml_score'],
                rule_score=match['rule_score'],
                hybrid_score=match.get('hybrid_score'),  # Include hybrid score
                sub_scores=match['sub_scores'],
                reasons=match['reasons'],
                matched_skills=match.get('matched_skills', []),
                missing_skills=match.get('missing_skills', [])
            )
            ml_matches.append(ml_match)
        
        return MLMatchResponse(
            cv_id=cv_id,
            total_matches=len(ml_matches),
            matches=ml_matches,
            ranking_method="ml",
            ml_model_loaded=ml_service.model_loaded,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML prediction error: {str(e)}")


@router.get(
    "/candidate/{cv_id}/hybrid",
    response_model=MLMatchResponse,
    summary="Get hybrid-ranked job matches",
    description="Returns jobs ranked by hybrid score (60% ML + 40% rule-based)"
)
async def get_hybrid_matches(
    cv_id: str,
    job_type: Optional[str] = Query(
        None,
        description="Filter by job type: 'corporate', 'small', or None for both",
        regex="^(corporate|small)$"
    ),
    top_n: int = Query(20, ge=1, le=100, description="Number of matches to return"),
    ml_weight: float = Query(
        0.6,
        ge=0.0,
        le=1.0,
        description="Weight for ML score (default: 0.6)"
    ),
    rule_weight: float = Query(
        0.4,
        ge=0.0,
        le=1.0,
        description="Weight for rule-based score (default: 0.4)"
    ),
    db = Depends(get_db)
):
    """
    Get job matches ranked by hybrid scoring (DEMO MODE ENABLED).
    """
    # DEMO MODE: Handle undefined cv_id from mobile app
    if cv_id == "undefined" or cv_id == "null":
        # Return mock job matches
        mock_matches = [
            MLJobMatch(
                job={"id": "JOB000001", "title": "Software Developer", "company": "Tech Solutions Ltd", 
                     "location": "Lusaka", "category": "Technology", "employment_type": "Full-time",
                     "salary_range": "ZMW 8,000 - 15,000"},
                match_score=0.85, ml_score=0.88, rule_score=0.82, hybrid_score=0.85,
                sub_scores={"skills": 0.90, "experience": 0.85}, 
                reasons=["Strong skills match"], matched_skills=["Python", "JavaScript"], missing_skills=[]
            ),
            MLJobMatch(
                job={"id": "JOB000003", "title": "Data Analyst", "company": "Zambia Analytics Corp",
                     "location": "Lusaka", "category": "Technology", "employment_type": "Full-time",
                     "salary_range": "ZMW 6,500 - 12,000"},
                match_score=0.78, ml_score=0.82, rule_score=0.75, hybrid_score=0.78,
                sub_scores={"skills": 0.85, "experience": 0.75},
                reasons=["Good skills match"], matched_skills=["Python", "SQL"], missing_skills=[]
            ),
            MLJobMatch(
                job={"id": "JOB000005", "title": "Network Engineer", "company": "Zambia Online",
                     "location": "Lusaka", "category": "Technology", "employment_type": "Full-time",
                     "salary_range": "ZMW 10,000 - 19,000"},
                match_score=0.72, ml_score=0.75, rule_score=0.70, hybrid_score=0.72,
                sub_scores={"skills": 0.70, "experience": 0.72},
                reasons=["Technical background"], matched_skills=["Networking"], missing_skills=[]
            ),
            MLJobMatch(
                job={"id": "JOB000002", "title": "Marketing Manager", "company": "Zambia Marketing Solutions",
                     "location": "Lusaka", "category": "Marketing", "employment_type": "Full-time",
                     "salary_range": "ZMW 10,000 - 18,000"},
                match_score=0.65, ml_score=0.68, rule_score=0.63, hybrid_score=0.65,
                sub_scores={"skills": 0.60, "experience": 0.65},
                reasons=["Management potential"], matched_skills=["Communication"], missing_skills=[]
            ),
            MLJobMatch(
                job={"id": "JOB000004", "title": "IT Support Specialist", "company": "Zambia IT Services",
                     "location": "Livingstone", "category": "Technology", "employment_type": "Full-time",
                     "salary_range": "ZMW 4,500 - 8,500"},
                match_score=0.58, ml_score=0.60, rule_score=0.57, hybrid_score=0.58,
                sub_scores={"skills": 0.55, "experience": 0.60},
                reasons=["Entry-level friendly"], matched_skills=["Windows"], missing_skills=[]
            )
        ]
        
        return MLMatchResponse(
            cv_id="demo_candidate",
            total_matches=len(mock_matches[:top_n]),
            matches=mock_matches[:top_n],
            ranking_method="hybrid",
            ml_model_loaded=True,
            timestamp=datetime.now().isoformat()
        )
    
    try:
        # Validate weights sum approximately to 1.0
        if abs((ml_weight + rule_weight) - 1.0) > 0.01:
            raise HTTPException(
                status_code=400,
                detail="ml_weight and rule_weight must sum to 1.0"
            )
        
        # Get ML service with database connection
        ml_service = MLMatchingService(db=db)
        
        # Get hybrid-ranked matches
        matches = ml_service.get_hybrid_ranked_matches(
            cv_id, job_type, top_n, ml_weight, rule_weight
        )
        
        if not matches:
            raise HTTPException(
                status_code=404,
                detail=f"No matches found for CV ID: {cv_id}"
            )
        
        # Convert to response format
        hybrid_matches = []
        for match in matches:
            ml_match = MLJobMatch(
                job=match['job'],
                match_score=match['match_score'],
                ml_score=match['ml_score'],
                rule_score=match['rule_score'],
                hybrid_score=match['hybrid_score'],
                sub_scores=match['sub_scores'],
                reasons=match['reasons'],
                matched_skills=match.get('matched_skills', []),
                missing_skills=match.get('missing_skills', [])
            )
            hybrid_matches.append(ml_match)
        
        return MLMatchResponse(
            cv_id=cv_id,
            total_matches=len(hybrid_matches),
            matches=hybrid_matches,
            ranking_method="hybrid",
            ml_model_loaded=ml_service.model_loaded,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hybrid ranking error: {str(e)}")


@router.get(
    "/model/info",
    response_model=ModelInfo,
    summary="Get ML model information",
    description="Returns metadata about the loaded ML model"
)
async def get_model_info(db = Depends(get_db)):
    """
    Get information about the currently loaded ML model.
    
    **Returns:**
    - Model status (loaded/not loaded)
    - Model type (LightGBM)
    - Training date
    - Performance metrics
    - Feature count
    
    **Example Response:**
    ```json
    {
      "model_loaded": true,
      "model_type": "LightGBM",
      "n_features": 43,
      "trained_at": "2025-11-20T10:30:00",
      "test_auc": 0.782,
      "message": "Model loaded and ready for predictions"
    }
    ```
    """
    try:
        ml_service = MLMatchingService(db=db)
        info = ml_service.get_model_info()
        
        if info['model_loaded']:
            message = "Model loaded and ready for predictions"
        else:
            message = "Model not loaded. Using rule-based matching as fallback."
        
        return ModelInfo(
            model_loaded=info['model_loaded'],
            model_type=info.get('model_type'),
            model_path=info['model_path'],
            n_features=info.get('n_features'),
            trained_at=info.get('trained_at'),
            best_iteration=info.get('best_iteration'),
            test_auc=info.get('test_auc'),
            message=message
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")


@router.post(
    "/model/retrain",
    response_model=RetrainResponse,
    summary="Trigger model retraining",
    description="Starts model retraining in the background"
)
async def retrain_model(
    request: RetrainRequest,
    background_tasks: BackgroundTasks
):
    """
    Trigger ML model retraining.
    
    This endpoint starts the model training pipeline in the background:
    1. Extract features from latest interactions
    2. Train new LightGBM model
    3. Evaluate performance
    4. Replace old model if better
    
    **Note:** This is a long-running operation (1-5 minutes).
    The endpoint returns immediately, but training continues in background.
    
    **Force Retrain:**
    Set `force_retrain: true` to retrain even if model was recently trained.
    
    **Example Request:**
    ```json
    {
      "force_retrain": false
    }
    ```
    
    **Example Response:**
    ```json
    {
      "status": "started",
      "message": "Model retraining started in background",
      "started_at": "2025-11-20T14:30:00"
    }
    ```
    """
    try:
        started_at = datetime.now()
        
        # Add training task to background
        background_tasks.add_task(
            _run_training_pipeline,
            force=request.force_retrain
        )
        
        return RetrainResponse(
            status="started",
            message="Model retraining started in background. Check /ml/model/info for updates.",
            started_at=started_at.isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting retraining: {str(e)}")


# ==================== Background Tasks ====================

def _run_training_pipeline(force: bool = False):
    """
    Run the complete training pipeline in background.
    
    This function:
    1. Runs feature engineering
    2. Trains model
    3. Evaluates performance
    4. Updates deployed model if better
    """
    try:
        import subprocess
        import os
        
        # Get paths
        ml_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            'ml'
        )
        
        print("\n🚀 Starting ML training pipeline...")
        print(f"   Working directory: {ml_dir}")
        
        # Step 1: Feature engineering
        print("\n📊 Step 1: Feature Engineering")
        feature_script = os.path.join(ml_dir, 'feature_engineering.py')
        result = subprocess.run(
            ['python', feature_script],
            cwd=ml_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"❌ Feature engineering failed: {result.stderr}")
            return
        
        print("✅ Feature engineering complete")
        
        # Step 2: Model training
        print("\n🤖 Step 2: Model Training")
        train_script = os.path.join(ml_dir, 'train_ranking_model.py')
        result = subprocess.run(
            ['python', train_script],
            cwd=ml_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"❌ Model training failed: {result.stderr}")
            return
        
        print("✅ Model training complete")
        
        # Step 3: Model evaluation
        print("\n📈 Step 3: Model Evaluation")
        eval_script = os.path.join(ml_dir, 'model_evaluation.py')
        result = subprocess.run(
            ['python', eval_script],
            cwd=ml_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"❌ Model evaluation failed: {result.stderr}")
            return
        
        print("✅ Model evaluation complete")
        print("\n🎉 Training pipeline completed successfully!")
        
        # Reload ML service to use new model
        global _ml_service
        from app.services.ml_matching_service import get_ml_service
        _ml_service = None  # Reset singleton
        get_ml_service()  # Reload
        
    except Exception as e:
        print(f"❌ Training pipeline error: {e}")


# ==================== Health Check ====================

@router.get(
    "/health",
    summary="ML service health check",
    description="Check if ML service is operational"
)
async def ml_health_check(db = Depends(get_db)):
    """
    Health check for ML matching service.
    
    Returns service status and model information.
    """
    try:
        ml_service = MLMatchingService(db=db)
        info = ml_service.get_model_info()
        
        return {
            "status": "healthy",
            "ml_service": "operational",
            "model_loaded": info['model_loaded'],
            "fallback_available": True,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "ml_service": "operational with errors",
            "model_loaded": False,
            "fallback_available": True,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
