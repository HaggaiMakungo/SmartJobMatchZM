"""
CAMSS 2.0 - ML Matching Service
Machine learning inference service for job-candidate matching.

This service:
1. Loads trained ML model
2. Generates features for any CV-Job pair on-the-fly
3. Predicts application probability
4. Re-ranks matches by ML score
5. Provides hybrid scoring (rule-based + ML)

Author: CAMSS Development Team
Version: 1.0.0
"""

import pickle
import json
import os
from typing import Dict, List, Tuple, Optional
import numpy as np
import pandas as pd
from datetime import datetime

# Import existing matching service
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.matching_service import MatchingService


class MLMatchingService:
    """
    ML-powered matching service that enhances rule-based matching
    with machine learning predictions.
    """
    
    def __init__(self, model_path: str = None, feature_config_path: str = None, db = None):
        """
        Initialize ML matching service.
        
        Args:
            model_path: Path to trained model (default: ml/models/ranking_model.pkl)
            feature_config_path: Path to feature config (default: ml/models/feature_config.json)
            db: Optional database session (for rule-based fallback)
        """
        # Set default paths (models are in backend/models/)
        if model_path is None:
            # Navigate from app/services/ to backend/models/
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(os.path.dirname(current_dir))
            model_path = os.path.join(backend_dir, 'models', 'ranking_model.pkl')
        
        if feature_config_path is None:
            # Navigate from app/services/ to backend/models/
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(os.path.dirname(current_dir))
            feature_config_path = os.path.join(backend_dir, 'models', 'feature_config.json')
        
        self.model_path = model_path
        self.feature_config_path = feature_config_path
        self.model = None
        self.feature_columns = None
        self.model_loaded = False
        self.db = db
        
        # Initialize rule-based matching service for fallback (if db available)
        self.rule_based_service = MatchingService(db) if db else None
        
        # Try to load model
        self._load_model()
    
    def _load_model(self):
        """
        Load trained model and feature configuration.
        Handles missing model gracefully with fallback to rule-based.
        """
        try:
            # Load model
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load feature config
            with open(self.feature_config_path, 'r') as f:
                config = json.load(f)
                self.feature_columns = config['features']
            
            self.model_loaded = True
            print(f"✅ ML model loaded successfully from {self.model_path}")
            print(f"   → {len(self.feature_columns)} features configured")
            
        except FileNotFoundError:
            print(f"⚠️ ML model not found at {self.model_path}")
            print(f"   → Falling back to rule-based matching")
            self.model_loaded = False
        except Exception as e:
            print(f"⚠️ Error loading ML model: {e}")
            print(f"   → Falling back to rule-based matching")
            self.model_loaded = False
    
    def _parse_skills(self, skills_str: str) -> List[str]:
        """Parse comma-separated skills string."""
        if not skills_str or pd.isna(skills_str):
            return []
        return [s.strip() for s in str(skills_str).split(',') if s.strip()]
    
    def _calculate_skills_overlap(self, user_skills: List[str], job_skills: List[str]) -> Dict:
        """Calculate skill overlap metrics."""
        if not user_skills or not job_skills:
            return {
                'skills_matched_count': 0,
                'skills_match_ratio': 0.0,
                'skills_missing_count': len(job_skills) if job_skills else 0
            }
        
        user_set = set(s.lower() for s in user_skills)
        job_set = set(s.lower() for s in job_skills)
        
        matched = user_set.intersection(job_set)
        missing = job_set - user_set
        
        return {
            'skills_matched_count': len(matched),
            'skills_match_ratio': len(matched) / len(job_set) if job_set else 0.0,
            'skills_missing_count': len(missing)
        }
    
    def generate_features_for_pair(self, cv: Dict, job: Dict, match_result: Dict) -> Dict:
        """
        Generate ML features for a single CV-Job pair.
        
        Args:
            cv: CV dictionary from database
            job: Job dictionary from database
            match_result: Result from rule-based matching (includes scores)
        
        Returns:
            Dictionary of features ready for ML prediction
        """
        features = {}
        
        # 1. Extract sub-scores from match_result
        sub_scores = match_result.get('sub_scores', {})
        features['match_score'] = match_result.get('match_score', 0.0)
        features['skills_score'] = sub_scores.get('skills', 0.0)
        features['location_score'] = sub_scores.get('location', 0.0)
        features['salary_score'] = sub_scores.get('salary', 0.0)
        features['experience_score'] = sub_scores.get('experience', 0.0)
        
        # 2. User/CV features
        user_tech_skills = self._parse_skills(cv.get('skills_technical', ''))
        user_soft_skills = self._parse_skills(cv.get('skills_soft', ''))
        all_user_skills = user_tech_skills + user_soft_skills
        
        features['user_skills_count'] = len(all_user_skills)
        features['user_technical_skills_count'] = len(user_tech_skills)
        features['user_soft_skills_count'] = len(user_soft_skills)
        
        salary_min = cv.get('salary_expectation_min', 0) or 0
        salary_max = cv.get('salary_expectation_max', 0) or 0
        features['user_salary_expectation_avg'] = (salary_min + salary_max) / 2 if salary_max > 0 else 0
        features['user_years_experience'] = cv.get('total_years_experience', 0) or 0
        
        # Employment status encoding
        employment_mapping = {
            'Unemployed': 0, 'Employed': 1, 'Self-Employed': 2, 'Student': 3
        }
        features['employment_status_encoded'] = employment_mapping.get(
            cv.get('employment_status', ''), 0
        )
        
        # Education level encoding - SKIPPED: highest_education column doesn't exist
        # education_mapping = {
        #     'Grade 12': 1, 'Diploma': 2, 'Bachelor': 3, 'Master': 4, 'PhD': 5
        # }
        # features['education_level_encoded'] = education_mapping.get(
        #     cv.get('highest_education', ''), 1
        # )
        features['education_level_encoded'] = 1  # Default value since field doesn't exist
        
        # Note: willing_to_relocate field doesn't exist in database, so we skip it
        features['user_available_immediately'] = 1 if cv.get('availability') == 'Immediate' else 0
        
        # 3. Job features
        job_salary_min = job.get('salary_min_zmw', 0) or 0
        job_salary_max = job.get('salary_max_zmw', 0) or 0
        features['job_salary_avg'] = (job_salary_min + job_salary_max) / 2 if job_salary_max > 0 else 0
        features['job_salary_range'] = job_salary_max - job_salary_min
        
        job_required_skills = self._parse_skills(job.get('required_skills', ''))
        job_preferred_skills = self._parse_skills(job.get('preferred_skills', ''))
        all_job_skills = job_required_skills + job_preferred_skills
        
        features['job_required_skills_count'] = len(job_required_skills)
        features['job_preferred_skills_count'] = len(job_preferred_skills)
        features['job_total_skills_count'] = len(all_job_skills)
        
        # Job type (detect if corporate or small)
        job_type = job.get('job_type', 'unknown')
        features['is_corporate_job'] = 1 if job_type == 'corporate' or 'job_id' in job else 0
        features['is_small_job'] = 1 if job_type == 'small' or 'id' in job else 0
        
        # Actual job type encoding
        job_type_mapping = {
            'Full-Time': 1, 'Part-Time': 2, 'Contract': 3, 'Gig': 4, 'Temporary': 5
        }
        features['job_type_encoded'] = job_type_mapping.get(
            job.get('job_type', 'Full-Time'), 1
        )
        
        # 4. Match features (skills overlap)
        overlap = self._calculate_skills_overlap(all_user_skills, all_job_skills)
        features['skills_matched_count'] = overlap['skills_matched_count']
        features['skills_match_ratio'] = overlap['skills_match_ratio']
        features['skills_missing_count'] = overlap['skills_missing_count']
        
        # Salary matching
        if features['user_salary_expectation_avg'] > 0:
            features['salary_ratio'] = features['job_salary_avg'] / features['user_salary_expectation_avg']
        else:
            features['salary_ratio'] = 1.0
        
        features['salary_exceeds_expectation'] = 1 if job_salary_min >= salary_min else 0
        features['salary_gap'] = features['job_salary_avg'] - features['user_salary_expectation_avg']
        
        # Location matching
        user_city = (cv.get('city') or '').lower()
        user_province = (cv.get('province') or '').lower()
        job_city = (job.get('location_city') or '').lower()
        job_province = (job.get('location_province') or '').lower()
        
        features['same_city'] = 1 if user_city == job_city else 0
        features['same_province'] = 1 if user_province == job_province else 0
        features['location_match_level'] = features['same_city'] * 2 + features['same_province']
        
        # Experience matching
        job_experience_required = job.get('experience_required', 0) or 0
        features['experience_gap'] = job_experience_required - features['user_years_experience']
        features['meets_experience_requirement'] = 1 if features['user_years_experience'] >= job_experience_required else 0
        
        # 5. Interaction features (defaults for new predictions)
        features['interaction_type_encoded'] = 1  # Default: viewed
        
        # Current time features
        now = datetime.now()
        features['day_of_week'] = now.weekday()
        features['hour_of_day'] = now.hour
        features['is_weekend'] = 1 if now.weekday() >= 5 else 0
        features['is_business_hours'] = 1 if 8 <= now.hour <= 17 else 0
        
        # 6. Composite features
        features['skills_salary_interaction'] = features['skills_score'] * features['salary_score']
        features['location_salary_interaction'] = features['location_score'] * features['salary_score']
        features['match_score_squared'] = features['match_score'] ** 2
        features['skills_experience_interaction'] = features['skills_score'] * features['experience_score']
        
        return features
    
    def predict_application_probability(self, cv: Dict, job: Dict, match_result: Dict) -> float:
        """
        Predict probability that user will apply to this job.
        
        Returns:
            Probability between 0.0 and 1.0
        """
        if not self.model_loaded:
            # Fallback: use rule-based match_score as probability
            return match_result.get('match_score', 0.0)
        
        try:
            # Generate features
            features = self.generate_features_for_pair(cv, job, match_result)
            
            # Create feature vector in correct order
            feature_vector = []
            for col in self.feature_columns:
                feature_vector.append(features.get(col, 0.0))
            
            # Predict
            X = np.array([feature_vector])
            probability = self.model.predict(X, num_iteration=self.model.best_iteration)[0]
            
            # Clip to [0, 1] range
            return np.clip(probability, 0.0, 1.0)
            
        except Exception as e:
            import traceback
            print(f"⚠️ ML prediction error: {e}")
            print(f"   Full traceback:")
            traceback.print_exc()
            # Fallback to rule-based score
            return match_result.get('match_score', 0.0)
    
    def get_ml_ranked_matches(
        self, 
        cv_id: str, 
        job_type: Optional[str] = None,
        top_n: int = 20
    ) -> List[Dict]:
        """
        Get matches ranked by ML prediction (pure ML ranking).
        
        Args:
            cv_id: Candidate CV ID
            job_type: Filter by job type ('corporate', 'small', or None for both)
            top_n: Number of top matches to return
        
        Returns:
            List of matches sorted by ML score (descending)
        """
        # Map job_type to format expected by find_matches
        job_type_map = {
            'corporate': 'corp',
            'small': 'small',
            None: 'both'
        }
        mapped_job_type = job_type_map.get(job_type, 'both')
        
        # Get rule-based matches
        result = self.rule_based_service.find_matches(
            cv_id=cv_id,
            job_type=mapped_job_type,
            limit=100,
            min_score=0.3
        )
        
        if 'error' in result:
            return []
        
        rule_matches = result.get('matches', [])
        if not rule_matches:
            return []
        
        # Get CV data
        cv = self.rule_based_service.get_cv(cv_id)
        if not cv:
            return []
        
        # Add ML predictions to each match
        for match in rule_matches:
            # Create job dict from match data
            job = {
                'job_id': match.get('job_id'),
                'location_city': match.get('location_city'),
                'location_province': match.get('location_province'),
                'salary_min_zmw': match.get('salary_min_zmw'),
                'salary_max_zmw': match.get('salary_max_zmw'),
                'budget': match.get('budget'),
                'required_skills': match.get('required_skills', ''),
                'preferred_skills': match.get('preferred_skills', ''),
                'company': match.get('company'),
                'title': match.get('title'),
                'job_type': match.get('job_type')
            }
            
            # Convert CV object to dict for feature generation
            cv_dict = {
                'cv_id': cv.cv_id,
                'skills_technical': cv.skills_technical,
                'skills_soft': cv.skills_soft,
                'city': cv.city,
                'province': cv.province,
                'salary_expectation_min': cv.salary_expectation_min,
                'salary_expectation_max': cv.salary_expectation_max,
                'total_years_experience': cv.total_years_experience,
                'employment_status': cv.employment_status,
                'availability': cv.availability
            }
            
            ml_probability = self.predict_application_probability(cv_dict, job, match)
            
            match['ml_score'] = round(ml_probability, 4)
            match['rule_score'] = round(match['match_score'], 4)
            # Calculate hybrid score (40% rule + 60% ML) for completeness
            match['hybrid_score'] = round((0.4 * match['rule_score']) + (0.6 * ml_probability), 4)
            match['job'] = job  # Add job dict to match
            match['sub_scores'] = match.get('match_breakdown', {})
            match['reasons'] = match.get('match_reasons', [])
        
        # Sort by ML score
        ml_ranked = sorted(rule_matches, key=lambda x: x['ml_score'], reverse=True)
        
        return ml_ranked[:top_n]
    
    def get_hybrid_ranked_matches(
        self,
        cv_id: str,
        job_type: Optional[str] = None,
        top_n: int = 20,
        ml_weight: float = 0.6,
        rule_weight: float = 0.4
    ) -> List[Dict]:
        """
        Get matches ranked by hybrid score (ML + rule-based).
        
        Args:
            cv_id: Candidate CV ID
            job_type: Filter by job type
            top_n: Number of matches to return
            ml_weight: Weight for ML score (default: 0.6)
            rule_weight: Weight for rule-based score (default: 0.4)
        
        Returns:
            List of matches sorted by hybrid score
        """
        # Map job_type to format expected by find_matches
        job_type_map = {
            'corporate': 'corp',
            'small': 'small',
            None: 'both'
        }
        mapped_job_type = job_type_map.get(job_type, 'both')
        
        # Get rule-based matches
        result = self.rule_based_service.find_matches(
            cv_id=cv_id,
            job_type=mapped_job_type,
            limit=100,
            min_score=0.3
        )
        
        if 'error' in result:
            return []
        
        rule_matches = result.get('matches', [])
        if not rule_matches:
            return []
        
        # Get CV data
        cv = self.rule_based_service.get_cv(cv_id)
        if not cv:
            return []
        
        # Calculate hybrid scores
        for match in rule_matches:
            # Create job dict from match data
            job = {
                'job_id': match.get('job_id'),
                'location_city': match.get('location_city'),
                'location_province': match.get('location_province'),
                'salary_min_zmw': match.get('salary_min_zmw'),
                'salary_max_zmw': match.get('salary_max_zmw'),
                'budget': match.get('budget'),
                'required_skills': match.get('required_skills', ''),
                'preferred_skills': match.get('preferred_skills', ''),
                'company': match.get('company'),
                'title': match.get('title'),
                'job_type': match.get('job_type')
            }
            
            # Convert CV object to dict
            cv_dict = {
                'cv_id': cv.cv_id,
                'skills_technical': cv.skills_technical,
                'skills_soft': cv.skills_soft,
                'city': cv.city,
                'province': cv.province,
                'salary_expectation_min': cv.salary_expectation_min,
                'salary_expectation_max': cv.salary_expectation_max,
                'total_years_experience': cv.total_years_experience,
                'employment_status': cv.employment_status,
                'availability': cv.availability
            }
            
            # Get ML prediction
            ml_score = self.predict_application_probability(cv_dict, job, match)
            rule_score = match['match_score']
            
            # Calculate hybrid score
            hybrid_score = (ml_weight * ml_score) + (rule_weight * rule_score)
            
            match['ml_score'] = round(ml_score, 4)
            match['rule_score'] = round(rule_score, 4)
            match['hybrid_score'] = round(hybrid_score, 4)
            match['job'] = job  # Add job dict to match
            match['sub_scores'] = match.get('match_breakdown', {})
            match['reasons'] = match.get('match_reasons', [])
        
        # Sort by hybrid score
        hybrid_ranked = sorted(rule_matches, key=lambda x: x['hybrid_score'], reverse=True)
        
        return hybrid_ranked[:top_n]
    
    def get_model_info(self) -> Dict:
        """
        Get information about loaded model.
        
        Returns:
            Dictionary with model metadata
        """
        info = {
            'model_loaded': self.model_loaded,
            'model_path': self.model_path,
            'feature_config_path': self.feature_config_path
        }
        
        if self.model_loaded:
            info['n_features'] = len(self.feature_columns)
            info['model_type'] = 'LightGBM'
            
            # Load training metadata if available
            metadata_path = os.path.join(
                os.path.dirname(self.model_path), 
                'training_metadata.json'
            )
            try:
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                    info['trained_at'] = metadata.get('trained_at')
                    info['best_iteration'] = metadata.get('best_iteration')
                    info['test_auc'] = metadata.get('evaluation', {}).get('test', {}).get('auc_roc')
            except:
                pass
        
        return info


# Singleton instance
_ml_service = None

def get_ml_service(db = None) -> MLMatchingService:
    """
    Get singleton instance of ML matching service.
    Creates instance on first call.
    
    Args:
        db: Optional database session (for rule-based fallback)
    """
    global _ml_service
    if _ml_service is None:
        _ml_service = MLMatchingService(db=db)
    return _ml_service
