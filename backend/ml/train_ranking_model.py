"""
CAMSS 2.0 - ML Model Training Pipeline
Trains a LightGBM ranking model to predict job applications.

This script:
1. Loads ml_training_data.csv
2. Splits data (70% train, 15% val, 15% test)
3. Trains LightGBM binary classifier
4. Handles class imbalance
5. Saves trained model and feature config

"""

import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score, precision_score, recall_score, 
    f1_score, precision_recall_curve, average_precision_score
)
import json
import pickle
import os
from datetime import datetime
from typing import Dict, List, Tuple
import matplotlib.pyplot as plt
import seaborn as sns

# Configuration
DATA_FILE = '../datasets/ml_training_data.csv'
MODEL_OUTPUT_DIR = 'models'
MODEL_FILE = 'ranking_model.pkl'
FEATURE_CONFIG_FILE = 'feature_config.json'
TRAINING_METADATA_FILE = 'training_metadata.json'

# Model hyperparameters
LGBM_PARAMS = {
    'objective': 'binary',
    'metric': 'auc',
    'boosting_type': 'gbdt',
    'num_leaves': 31,
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'max_depth': 6,
    'min_child_samples': 20,
    'verbose': -1,
    'seed': 42
}

# Training configuration
TRAIN_SIZE = 0.70
VAL_SIZE = 0.15
TEST_SIZE = 0.15
RANDOM_STATE = 42


class ModelTrainer:
    """Trains and evaluates LightGBM ranking model."""
    
    def __init__(self, data_path: str):
        """Initialize with path to training data."""
        self.data_path = data_path
        self.df = None
        self.feature_columns = None
        self.model = None
        self.training_metadata = {}
        
    def load_data(self) -> pd.DataFrame:
        """Load training data from CSV."""
        print("\n📂 Loading training data...")
        
        try:
            self.df = pd.read_csv(self.data_path)
            print(f"Loaded {len(self.df)} samples with {len(self.df.columns)} columns")
            
            # Verify required columns exist
            required_cols = ['applied', 'match_score']
            missing = [col for col in required_cols if col not in self.df.columns]
            if missing:
                raise ValueError(f"Missing required columns: {missing}")
            
            return self.df
        except Exception as e:
            print(f"Error loading data: {e}")
            raise
    
    def prepare_features(self) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare feature matrix and target variable.
        Excludes IDs and target columns from features.
        """
        print("\n🔧 Preparing features...")
        
        # Columns to exclude from features
        exclude_cols = [
            'applied',  # Target variable
            'helpful',  # Alternative target
            'event_id',  # IDs
            'cv_id',
            'job_id',
            'interaction_type_encoded',  # Data leakage - encodes the target!
        ]
        
        # Select feature columns
        self.feature_columns = [
            col for col in self.df.columns 
            if col not in exclude_cols
        ]
        
        X = self.df[self.feature_columns].copy()
        y = self.df['applied'].copy()
        
        # Handle any remaining missing values
        X = X.fillna(0)
        
        print(f"Prepared {len(self.feature_columns)} features")
        print(f"   → Target distribution: {y.sum()} applied ({y.mean()*100:.1f}%)")
        
        # Emphasize match_score as requested
        if 'match_score' in self.feature_columns:
            print(f"   → match_score range: [{X['match_score'].min():.3f}, {X['match_score'].max():.3f}]")
        
        return X, y
    
    def split_data(self, X: pd.DataFrame, y: pd.Series) -> Dict:
        """
        Split data into train/validation/test sets.
        Returns dictionary with splits.
        """
        print(f"\n✂️ Splitting data (Train: {TRAIN_SIZE*100:.0f}%, Val: {VAL_SIZE*100:.0f}%, Test: {TEST_SIZE*100:.0f}%)...")
        
        # First split: separate out test set
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, 
            test_size=TEST_SIZE, 
            random_state=RANDOM_STATE,
            stratify=y  # Maintain class distribution
        )
        
        # Second split: separate train and validation
        val_ratio = VAL_SIZE / (TRAIN_SIZE + VAL_SIZE)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=val_ratio,
            random_state=RANDOM_STATE,
            stratify=y_temp
        )
        
        splits = {
            'X_train': X_train,
            'y_train': y_train,
            'X_val': X_val,
            'y_val': y_val,
            'X_test': X_test,
            'y_test': y_test
        }
        
        print(f"✅ Training set:   {len(X_train)} samples ({y_train.mean()*100:.1f}% applied)")
        print(f"✅ Validation set: {len(X_val)} samples ({y_val.mean()*100:.1f}% applied)")
        print(f"✅ Test set:       {len(X_test)} samples ({y_test.mean()*100:.1f}% applied)")
        
        return splits
    
    def calculate_class_weights(self, y_train: pd.Series) -> float:
        """
        Calculate scale_pos_weight for handling class imbalance.
        LightGBM uses this to give more weight to minority class.
        """
        n_positive = y_train.sum()
        n_negative = len(y_train) - n_positive
        scale_pos_weight = n_negative / n_positive
        
        print(f"\n⚖️ Class imbalance handling:")
        print(f"   → Negative samples: {n_negative}")
        print(f"   → Positive samples: {n_positive}")
        print(f"   → Scale pos weight: {scale_pos_weight:.2f}")
        
        return scale_pos_weight
    
    def train_model(self, splits: Dict) -> lgb.Booster:
        """
        Train LightGBM model with early stopping.
        """
        print("\n🚀 Training LightGBM model...")
        print("="*60)
        
        # Calculate class weights
        scale_pos_weight = self.calculate_class_weights(splits['y_train'])
        
        # Update params with class weight
        params = LGBM_PARAMS.copy()
        params['scale_pos_weight'] = scale_pos_weight
        
        # Create LightGBM datasets
        train_data = lgb.Dataset(
            splits['X_train'], 
            label=splits['y_train'],
            feature_name=self.feature_columns
        )
        val_data = lgb.Dataset(
            splits['X_val'],
            label=splits['y_val'],
            reference=train_data,
            feature_name=self.feature_columns
        )
        
        # Train model with early stopping
        print("\n📈 Training progress:")
        callbacks = [
            lgb.log_evaluation(period=50),
            lgb.early_stopping(stopping_rounds=50, verbose=True)
        ]
        
        self.model = lgb.train(
            params,
            train_data,
            num_boost_round=1000,
            valid_sets=[train_data, val_data],
            valid_names=['train', 'val'],
            callbacks=callbacks
        )
        
        print("\n Model training complete!")
        print(f"   → Best iteration: {self.model.best_iteration}")
        print(f"   → Best score: {self.model.best_score['val']['auc']:.4f}")
        
        return self.model
    
    def evaluate_model(self, splits: Dict) -> Dict:
        """
        Comprehensive model evaluation on all splits.
        """
        print("\n Evaluating model performance...")
        print("="*60)
        
        results = {}
        
        for split_name in ['train', 'val', 'test']:
            X = splits[f'X_{split_name}']
            y_true = splits[f'y_{split_name}']
            
            # Get predictions
            y_pred_proba = self.model.predict(X, num_iteration=self.model.best_iteration)
            y_pred = (y_pred_proba >= 0.5).astype(int)
            
            # Calculate metrics
            metrics = {
                'auc_roc': roc_auc_score(y_true, y_pred_proba),
                'precision': precision_score(y_true, y_pred, zero_division=0),
                'recall': recall_score(y_true, y_pred, zero_division=0),
                'f1': f1_score(y_true, y_pred, zero_division=0),
                'avg_precision': average_precision_score(y_true, y_pred_proba)
            }
            
            # Calculate Precision@K
            metrics['precision_at_10'] = self.precision_at_k(y_true, y_pred_proba, k=10)
            metrics['precision_at_20'] = self.precision_at_k(y_true, y_pred_proba, k=20)
            
            results[split_name] = metrics
            
            # Print results
            print(f"\n{split_name.upper()} SET:")
            print(f"  AUC-ROC:          {metrics['auc_roc']:.4f}")
            print(f"  Precision:        {metrics['precision']:.4f}")
            print(f"  Recall:           {metrics['recall']:.4f}")
            print(f"  F1 Score:         {metrics['f1']:.4f}")
            print(f"  Avg Precision:    {metrics['avg_precision']:.4f}")
            print(f"  Precision@10:     {metrics['precision_at_10']:.4f}")
            print(f"  Precision@20:     {metrics['precision_at_20']:.4f}")
        
        # Store in metadata
        self.training_metadata['evaluation'] = results
        
        return results
    
    def precision_at_k(self, y_true: np.ndarray, y_pred_proba: np.ndarray, k: int) -> float:
        """
        Calculate Precision@K - what percentage of top K recommendations are actually applied.
        This is a key metric for ranking systems.
        """
        # Sort by predicted probability (descending)
        top_k_indices = np.argsort(y_pred_proba)[-k:]
        
        # Count how many of top K are actual applications
        top_k_true = y_true.iloc[top_k_indices] if hasattr(y_true, 'iloc') else y_true[top_k_indices]
        precision = top_k_true.sum() / k
        
        return precision
    
    def get_feature_importance(self, top_n: int = 20) -> pd.DataFrame:
        """
        Get feature importance from trained model.
        Emphasizes match_score as requested.
        """
        print(f"\n🎯 Top {top_n} Most Important Features:")
        print("="*60)
        
        importance_df = pd.DataFrame({
            'feature': self.model.feature_name(),
            'importance': self.model.feature_importance(importance_type='gain')
        }).sort_values('importance', ascending=False)
        
        # Print top features
        for idx, row in importance_df.head(top_n).iterrows():
            star = " ⭐" if row['feature'] == 'match_score' else ""
            print(f"  {row['feature']:30s} {row['importance']:10.0f}{star}")
        
        # Store in metadata
        self.training_metadata['feature_importance'] = importance_df.to_dict('records')
        
        return importance_df
    
    def plot_feature_importance(self, importance_df: pd.DataFrame, top_n: int = 20):
        """
        Create feature importance visualization.
        """
        print("\n📊 Creating feature importance plot...")
        
        # Ensure output directory exists
        os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)
        
        plt.figure(figsize=(10, 8))
        top_features = importance_df.head(top_n)
        
        # Highlight match_score
        colors = ['red' if feat == 'match_score' else 'steelblue' 
                 for feat in top_features['feature']]
        
        plt.barh(range(len(top_features)), top_features['importance'], color=colors)
        plt.yticks(range(len(top_features)), top_features['feature'])
        plt.xlabel('Importance (Gain)')
        plt.title(f'Top {top_n} Feature Importance (match_score highlighted)')
        plt.gca().invert_yaxis()
        plt.tight_layout()
        
        plot_path = os.path.join(MODEL_OUTPUT_DIR, 'feature_importance.png')
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Plot saved: {plot_path}")
    
    def save_model(self):
        """
        Save trained model, feature config, and metadata.
        """
        print("\n💾 Saving model artifacts...")
        
        # Create output directory
        os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)
        
        # 1. Save LightGBM model
        model_path = os.path.join(MODEL_OUTPUT_DIR, MODEL_FILE)
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"Model saved: {model_path}")
        
        # 2. Save feature configuration
        feature_config = {
            'features': self.feature_columns,
            'n_features': len(self.feature_columns),
            'model_type': 'LightGBM',
            'created_at': datetime.now().isoformat()
        }
        
        config_path = os.path.join(MODEL_OUTPUT_DIR, FEATURE_CONFIG_FILE)
        with open(config_path, 'w') as f:
            json.dump(feature_config, f, indent=2)
        print(f"✅ Feature config saved: {config_path}")
        
        # 3. Save training metadata
        self.training_metadata['model_params'] = LGBM_PARAMS
        self.training_metadata['data_split'] = {
            'train_size': TRAIN_SIZE,
            'val_size': VAL_SIZE,
            'test_size': TEST_SIZE
        }
        self.training_metadata['trained_at'] = datetime.now().isoformat()
        self.training_metadata['best_iteration'] = self.model.best_iteration
        
        metadata_path = os.path.join(MODEL_OUTPUT_DIR, TRAINING_METADATA_FILE)
        with open(metadata_path, 'w') as f:
            json.dump(self.training_metadata, f, indent=2)
        print(f"Training metadata saved: {metadata_path}")
    
    def train_pipeline(self):
        """
        Complete training pipeline.
        """
        print("\n" + "="*60)
        print("🚀 CAMSS 2.0 - ML MODEL TRAINING PIPELINE")
        print("="*60)
        
        try:
            # Load data
            self.load_data()
            
            # Prepare features
            X, y = self.prepare_features()
            
            # Split data
            splits = self.split_data(X, y)
            
            # Train model
            self.train_model(splits)
            
            # Evaluate model
            results = self.evaluate_model(splits)
            
            # Feature importance
            importance_df = self.get_feature_importance(top_n=20)
            self.plot_feature_importance(importance_df, top_n=20)
            
            # Save everything
            self.save_model()
            
            # Final summary
            print("\n" + "="*60)
            print("MODEL TRAINING COMPLETE!")
            print("="*60)
            print(f"\n🎯 Key Results:")
            print(f"   → Test AUC-ROC: {results['test']['auc_roc']:.4f}")
            print(f"   → Test Precision@10: {results['test']['precision_at_10']:.4f}")
            print(f"   → Best iteration: {self.model.best_iteration}")
            
            # Check if we beat targets
            print(f"\n🎯 Target Achievement:")
            targets = {
                'AUC-ROC > 0.75': results['test']['auc_roc'] > 0.75,
                'Precision@10 > 0.20': results['test']['precision_at_10'] > 0.20
            }
            
            for target, achieved in targets.items():
                status = "✅" if achieved else "❌"
                print(f"   {status} {target}")
            
            print("\n📁 Model artifacts saved in:", MODEL_OUTPUT_DIR)
            print("="*60)
            
        except Exception as e:
            print(f"\n❌ Training pipeline failed: {e}")
            raise


def main():
    """Run model training pipeline."""
    # Get absolute path for data
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, DATA_FILE)
    
    trainer = ModelTrainer(data_path)
    trainer.train_pipeline()


if __name__ == "__main__":
    main()
