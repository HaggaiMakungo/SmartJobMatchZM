"""
CAMSS 2.0 - Feature Engineering for ML Model Training
Extracts features from PostgreSQL database for machine learning.

This script:
1. Connects to job_match_db
2. Joins user_job_interactions, cvs, corporate_jobs, small_jobs, match_feedback
3. Extracts 30+ features for each interaction
4. Outputs ml_training_data.csv ready for model training

Author: CAMSS Development Team
Version: 1.0.0
"""

import psycopg2
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple
import json
import sys
import os

# Add backend to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'job_match_db',
    'user': 'postgres',
    'password': 'Winter123'
}

OUTPUT_FILE = '../datasets/ml_training_data.csv'


class FeatureEngineer:
    """Extracts and engineers features for ML model training."""
    
    def __init__(self, db_config: Dict):
        """Initialize with database configuration."""
        self.db_config = db_config
        self.conn = None
        self.cursor = None
        
    def connect(self):
        """Establish database connection."""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            print("✅ Connected to database successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise
    
    def disconnect(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✅ Database connection closed")
    
    def fetch_interactions_data(self) -> pd.DataFrame:
        """
        Fetch all interactions with CV and job details.
        Joins: user_job_interactions + cvs + jobs + match_feedback
        """
        print("\n📊 Fetching interaction data from database...")
        
        query = """
        SELECT 
            -- Interaction metadata
            i.event_id,
            i.user_id as cv_id,
            i.job_id,
            i.job_type,
            i.action as interaction_type,
            i.match_score,
            i.sub_scores,
            i.timestamp as interaction_date,
            
            -- Feedback data
            f.helpful,
            CASE WHEN i.action = 'applied' THEN 1 ELSE 0 END as applied,
            f.comment as feedback_text,
            
            -- CV/User features
            c.full_name,
            c.email,
            c.phone,
            c.city as user_city,
            c.province as user_province,
            c.employment_status,
            c.skills_technical,
            c.skills_soft,
            c.total_years_experience,
            c.salary_expectation_min,
            c.salary_expectation_max,
            c.education_level as highest_education,
            c.preferred_job_type,
            c.availability,
            
            -- Job features (corporate)
            cj.title as corp_title,
            cj.company as corp_company,
            cj.location_city as corp_city,
            cj.location_province as corp_province,
            cj.employment_type as corp_job_type,
            cj.salary_min_zmw as corp_salary_min,
            cj.salary_max_zmw as corp_salary_max,
            cj.required_skills as corp_required_skills,
            cj.preferred_skills as corp_preferred_skills,
            cj.required_experience_years as corp_experience,
            cj.industry_sector as corp_industry,
            
            -- Job features (small/gig)
            sj.title as small_title,
            sj.posted_by as small_company,
            sj.location as small_city,
            sj.province as small_province,
            sj.payment_type as small_job_type,
            sj.budget as small_salary_min,
            sj.budget as small_salary_max,
            '' as small_required_skills,
            '' as small_preferred_skills,
            0 as small_experience,
            sj.category as small_industry
            
        FROM public.user_job_interactions i
        LEFT JOIN public.match_feedback f 
            ON i.user_id = f.user_id AND i.job_id = f.job_id
        LEFT JOIN public.cvs c 
            ON i.user_id = c.cv_id
        LEFT JOIN public.corporate_jobs cj 
            ON i.job_id = cj.job_id AND i.job_type = 'corporate'
        LEFT JOIN public.small_jobs sj 
            ON i.job_id = sj.id AND i.job_type = 'small'
        WHERE f.helpful IS NOT NULL  -- Only interactions with feedback
        ORDER BY i.timestamp DESC
        """
        
        try:
            df = pd.read_sql_query(query, self.conn)
            print(f"✅ Fetched {len(df)} interactions with complete data")
            return df
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            raise
    
    def parse_skills(self, skills_str: str) -> List[str]:
        """Parse comma-separated skills string into list."""
        if pd.isna(skills_str) or not skills_str:
            return []
        return [s.strip() for s in str(skills_str).split(',') if s.strip()]
    
    def parse_sub_scores(self, sub_scores_json: str) -> Dict:
        """Parse sub_scores JSON string into dictionary."""
        if pd.isna(sub_scores_json) or not sub_scores_json:
            return {}
        try:
            if isinstance(sub_scores_json, str):
                return json.loads(sub_scores_json)
            return sub_scores_json
        except:
            return {}
    
    def calculate_skills_overlap(self, user_skills: List[str], job_skills: List[str]) -> Dict:
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
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineer all features for ML training.
        Creates 30+ features from raw interaction data.
        """
        print("\n🔧 Engineering features...")
        
        # Create a copy to avoid SettingWithCopyWarning
        df = df.copy()
        
        # 1. MERGE CORPORATE AND SMALL JOB FIELDS
        print("  → Merging job type fields...")
        df['job_title'] = df['corp_title'].fillna(df['small_title'])
        df['job_company'] = df['corp_company'].fillna(df['small_company'])
        df['job_city'] = df['corp_city'].fillna(df['small_city'])
        df['job_province'] = df['corp_province'].fillna(df['small_province'])
        df['job_salary_min'] = df['corp_salary_min'].fillna(df['small_salary_min'])
        df['job_salary_max'] = df['corp_salary_max'].fillna(df['small_salary_max'])
        df['job_required_skills'] = df['corp_required_skills'].fillna(df['small_required_skills'])
        df['job_preferred_skills'] = df['corp_preferred_skills'].fillna(df['small_preferred_skills'])
        df['job_experience'] = df['corp_experience'].fillna(df['small_experience'])
        df['job_industry'] = df['corp_industry'].fillna(df['small_industry'])
        df['actual_job_type'] = df['corp_job_type'].fillna(df['small_job_type'])
        
        # 2. USER FEATURES
        print("  → Creating user features...")
        df['user_skills_count'] = df.apply(
            lambda row: len(self.parse_skills(row['skills_technical'])) + 
                       len(self.parse_skills(row['skills_soft'])), 
            axis=1
        )
        df['user_technical_skills_count'] = df['skills_technical'].apply(
            lambda x: len(self.parse_skills(x))
        )
        df['user_soft_skills_count'] = df['skills_soft'].apply(
            lambda x: len(self.parse_skills(x))
        )
        df['user_salary_expectation_avg'] = (
            df['salary_expectation_min'] + df['salary_expectation_max']
        ) / 2
        df['user_years_experience'] = df['total_years_experience'].fillna(0)
        
        # Employment status encoding
        employment_mapping = {
            'Unemployed': 0,
            'Employed': 1,
            'Self-Employed': 2,
            'Student': 3
        }
        df['employment_status_encoded'] = df['employment_status'].map(employment_mapping).fillna(0)
        
        # Education level encoding
        education_mapping = {
            'Grade 12': 1,
            'Diploma': 2,
            'Bachelor': 3,
            'Master': 4,
            'PhD': 5
        }
        df['education_level_encoded'] = df['highest_education'].map(education_mapping).fillna(1)
        
        # Boolean features
        df['user_available_immediately'] = df['availability'].map({'Immediate': 1}).fillna(0)
        
        # 3. JOB FEATURES
        print("  → Creating job features...")
        df['job_salary_avg'] = (df['job_salary_min'] + df['job_salary_max']) / 2
        df['job_salary_range'] = df['job_salary_max'] - df['job_salary_min']
        df['job_required_skills_count'] = df['job_required_skills'].apply(
            lambda x: len(self.parse_skills(x))
        )
        df['job_preferred_skills_count'] = df['job_preferred_skills'].apply(
            lambda x: len(self.parse_skills(x))
        )
        df['job_total_skills_count'] = (
            df['job_required_skills_count'] + df['job_preferred_skills_count']
        )
        
        # Job type encoding
        df['is_corporate_job'] = (df['job_type'] == 'corporate').astype(int)
        df['is_small_job'] = (df['job_type'] == 'small').astype(int)
        
        # Actual job type encoding
        job_type_mapping = {
            'Full-Time': 1,
            'Part-Time': 2,
            'Contract': 3,
            'Gig': 4,
            'Temporary': 5
        }
        df['job_type_encoded'] = df['actual_job_type'].map(job_type_mapping).fillna(1)
        
        # 4. MATCH FEATURES (Most Important!)
        print("  → Creating match features...")
        
        # Parse sub_scores to extract individual components
        df['sub_scores_dict'] = df['sub_scores'].apply(self.parse_sub_scores)
        df['skills_score'] = df['sub_scores_dict'].apply(lambda x: x.get('skills', 0.0))
        df['location_score'] = df['sub_scores_dict'].apply(lambda x: x.get('location', 0.0))
        df['salary_score'] = df['sub_scores_dict'].apply(lambda x: x.get('salary', 0.0))
        df['experience_score'] = df['sub_scores_dict'].apply(lambda x: x.get('experience', 0.0))
        
        # Skills overlap analysis
        skills_overlap_data = []
        for idx, row in df.iterrows():
            user_skills = (
                self.parse_skills(row['skills_technical']) + 
                self.parse_skills(row['skills_soft'])
            )
            job_skills = (
                self.parse_skills(row['job_required_skills']) + 
                self.parse_skills(row['job_preferred_skills'])
            )
            overlap = self.calculate_skills_overlap(user_skills, job_skills)
            skills_overlap_data.append(overlap)
        
        overlap_df = pd.DataFrame(skills_overlap_data)
        df = pd.concat([df, overlap_df], axis=1)
        
        # Salary matching
        df['salary_ratio'] = np.where(
            df['user_salary_expectation_avg'] > 0,
            df['job_salary_avg'] / df['user_salary_expectation_avg'],
            1.0
        )
        df['salary_exceeds_expectation'] = (
            df['job_salary_min'] >= df['salary_expectation_min']
        ).astype(int)
        df['salary_gap'] = df['job_salary_avg'] - df['user_salary_expectation_avg']
        
        # Location matching
        df['same_city'] = (df['user_city'] == df['job_city']).astype(int)
        df['same_province'] = (df['user_province'] == df['job_province']).astype(int)
        df['location_match_level'] = df['same_city'] * 2 + df['same_province']  # 0-3 scale
        
        # Experience matching
        df['experience_gap'] = df['job_experience'].fillna(0) - df['user_years_experience']
        df['meets_experience_requirement'] = (
            df['user_years_experience'] >= df['job_experience'].fillna(0)
        ).astype(int)
        
        # 5. INTERACTION FEATURES
        print("  → Creating interaction features...")
        df['interaction_type_encoded'] = df['interaction_type'].map({
            'viewed': 1,
            'saved': 2,
            'applied': 3
        }).fillna(1)
        
        # Time-based features
        df['interaction_date'] = pd.to_datetime(df['interaction_date'])
        df['day_of_week'] = df['interaction_date'].dt.dayofweek
        df['hour_of_day'] = df['interaction_date'].dt.hour
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_business_hours'] = (
            (df['hour_of_day'] >= 8) & (df['hour_of_day'] <= 17)
        ).astype(int)
        
        # 6. TARGET VARIABLES
        print("  → Creating target variables...")
        df['applied'] = df['applied'].fillna(0).astype(int)
        df['helpful'] = df['helpful'].fillna(0).astype(int)
        
        # 7. COMPOSITE FEATURES
        print("  → Creating composite features...")
        df['skills_salary_interaction'] = df['skills_score'] * df['salary_score']
        df['location_salary_interaction'] = df['location_score'] * df['salary_score']
        df['match_score_squared'] = df['match_score'] ** 2
        df['skills_experience_interaction'] = df['skills_score'] * df['experience_score']
        
        print(f"✅ Feature engineering complete: {len(df.columns)} total columns")
        
        return df
    
    def select_final_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Select final feature set for model training.
        Drops redundant and non-feature columns.
        """
        print("\n🎯 Selecting final feature set...")
        
        # Define features to keep
        feature_columns = [
            # Target variables
            'applied',
            'helpful',
            
            # IDs for reference
            'event_id',
            'cv_id',
            'job_id',
            
            # Core match features (MOST IMPORTANT)
            'match_score',
            'skills_score',
            'location_score',
            'salary_score',
            'experience_score',
            
            # User features
            'user_skills_count',
            'user_technical_skills_count',
            'user_soft_skills_count',
            'user_salary_expectation_avg',
            'user_years_experience',
            'employment_status_encoded',
            'education_level_encoded',
            'user_available_immediately',
            
            # Job features
            'job_salary_avg',
            'job_salary_range',
            'job_required_skills_count',
            'job_preferred_skills_count',
            'job_total_skills_count',
            'is_corporate_job',
            'is_small_job',
            'job_type_encoded',
            
            # Match features
            'skills_matched_count',
            'skills_match_ratio',
            'skills_missing_count',
            'salary_ratio',
            'salary_exceeds_expectation',
            'salary_gap',
            'same_city',
            'same_province',
            'location_match_level',
            'experience_gap',
            'meets_experience_requirement',
            
            # Interaction features
            'interaction_type_encoded',
            'day_of_week',
            'hour_of_day',
            'is_weekend',
            'is_business_hours',
            
            # Composite features
            'skills_salary_interaction',
            'location_salary_interaction',
            'match_score_squared',
            'skills_experience_interaction'
        ]
        
        # Keep only columns that exist in the dataframe
        available_features = [col for col in feature_columns if col in df.columns]
        
        df_final = df[available_features].copy()
        
        print(f"✅ Selected {len(available_features)} features for training")
        print(f"   → {available_features.count('applied')} target variable (applied)")
        print(f"   → {len([c for c in available_features if 'score' in c])} score features")
        print(f"   → {len([c for c in available_features if 'user_' in c])} user features")
        print(f"   → {len([c for c in available_features if 'job_' in c])} job features")
        
        return df_final
    
    def generate_training_data(self, output_path: str):
        """
        Main pipeline: Extract, engineer, and save training data.
        """
        print("\n" + "="*60)
        print("🚀 CAMSS 2.0 - FEATURE ENGINEERING PIPELINE")
        print("="*60)
        
        try:
            # Connect to database
            self.connect()
            
            # Fetch raw data
            df_raw = self.fetch_interactions_data()
            
            if len(df_raw) == 0:
                print("❌ No interaction data found. Exiting.")
                return
            
            # Engineer features
            df_features = self.engineer_features(df_raw)
            
            # Select final feature set
            df_final = self.select_final_features(df_features)
            
            # Save to CSV
            print(f"\n💾 Saving training data to: {output_path}")
            df_final.to_csv(output_path, index=False)
            
            # Summary statistics
            print("\n" + "="*60)
            print("📊 TRAINING DATA SUMMARY")
            print("="*60)
            print(f"Total samples: {len(df_final)}")
            print(f"Total features: {len(df_final.columns) - 3}")  # Exclude IDs and targets
            print(f"\nTarget Distribution:")
            print(f"  Applied: {df_final['applied'].sum()} ({df_final['applied'].mean()*100:.1f}%)")
            print(f"  Helpful: {df_final['helpful'].sum()} ({df_final['helpful'].mean()*100:.1f}%)")
            print(f"\nMatch Score Stats:")
            print(f"  Mean: {df_final['match_score'].mean():.3f}")
            print(f"  Median: {df_final['match_score'].median():.3f}")
            print(f"  Std: {df_final['match_score'].std():.3f}")
            print(f"\nMissing Values:")
            missing = df_final.isnull().sum()
            if missing.sum() > 0:
                print(missing[missing > 0])
            else:
                print("  None! ✅")
            
            print("\n✅ Feature engineering complete!")
            print(f"📁 Output saved: {output_path}")
            print("="*60)
            
        except Exception as e:
            print(f"\n❌ Feature engineering failed: {e}")
            raise
        finally:
            self.disconnect()


def main():
    """Run feature engineering pipeline."""
    engineer = FeatureEngineer(DB_CONFIG)
    
    # Get absolute path for output
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(current_dir, OUTPUT_FILE)
    
    engineer.generate_training_data(output_path)


if __name__ == "__main__":
    main()
