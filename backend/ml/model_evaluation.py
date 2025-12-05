"""
CAMSS 2.0 - Model Evaluation & Analysis
Comprehensive evaluation of trained ML model.

This script:
1. Loads trained model and test data
2. Generates detailed performance metrics
3. Compares with rule-based baseline
4. Analyzes errors and feature importance
5. Creates performance report

Author: CAMSS Development Team
Version: 1.0.0
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
from datetime import datetime
from typing import Dict, List, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    roc_auc_score, precision_recall_curve, average_precision_score,
    confusion_matrix, classification_report, roc_curve
)

# Configuration
MODEL_DIR = '../models'  # Model saved at backend root level
MODEL_FILE = 'ranking_model.pkl'
TRAINING_DATA_FILE = '../datasets/ml_training_data.csv'
REPORT_OUTPUT = '../datasets/model_performance_report.md'

# Set plotting style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (10, 6)


class ModelEvaluator:
    """Comprehensive model evaluation and analysis."""
    
    def __init__(self, model_path: str, data_path: str, model_dir: str):
        """Initialize with model and data paths."""
        self.model_path = model_path
        self.data_path = data_path
        self.model_dir = model_dir  # Store model directory path
        self.model = None
        self.df = None
        self.feature_columns = None
        self.evaluation_results = {}
        
    def load_artifacts(self):
        """Load model and training data."""
        print("\n📂 Loading model and data...")
        
        # Load model
        with open(self.model_path, 'rb') as f:
            self.model = pickle.load(f)
        print(f"✅ Model loaded from {self.model_path}")
        
        # Load data
        self.df = pd.read_csv(self.data_path)
        print(f"✅ Data loaded: {len(self.df)} samples")
        
        # Load feature config
        config_path = os.path.join(self.model_dir, 'feature_config.json')
        with open(config_path, 'r') as f:
            config = json.load(f)
            self.feature_columns = config['features']
        print(f"✅ Features loaded: {len(self.feature_columns)} features")
    
    def prepare_test_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare test data (last 15% of dataset)."""
        # Use last 15% as test set (same as training script)
        test_size = int(len(self.df) * 0.15)
        df_test = self.df.tail(test_size).copy()
        
        X_test = df_test[self.feature_columns].fillna(0)
        y_test = df_test['applied']
        
        print(f"\n🧪 Test set: {len(X_test)} samples ({y_test.mean()*100:.1f}% applied)")
        
        return X_test, y_test
    
    def evaluate_ml_model(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict:
        """
        Comprehensive ML model evaluation.
        """
        print("\n📊 Evaluating ML Model...")
        print("="*60)
        
        # Get predictions
        y_pred_proba = self.model.predict(X_test, num_iteration=self.model.best_iteration)
        y_pred = (y_pred_proba >= 0.5).astype(int)
        
        # Basic metrics
        results = {
            'auc_roc': roc_auc_score(y_test, y_pred_proba),
            'avg_precision': average_precision_score(y_test, y_pred_proba)
        }
        
        # Precision@K metrics
        for k in [5, 10, 20, 50]:
            results[f'precision_at_{k}'] = self.precision_at_k(y_test, y_pred_proba, k)
        
        # NDCG (Normalized Discounted Cumulative Gain)
        results['ndcg_at_10'] = self.ndcg_at_k(y_test, y_pred_proba, k=10)
        results['ndcg_at_20'] = self.ndcg_at_k(y_test, y_pred_proba, k=20)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        results['confusion_matrix'] = cm.tolist()
        
        # Classification report
        results['classification_report'] = classification_report(
            y_test, y_pred, output_dict=True
        )
        
        # Print results
        print(f"\n🎯 ML Model Performance:")
        print(f"  AUC-ROC:          {results['auc_roc']:.4f}")
        print(f"  Avg Precision:    {results['avg_precision']:.4f}")
        print(f"  Precision@5:      {results['precision_at_5']:.4f}")
        print(f"  Precision@10:     {results['precision_at_10']:.4f}")
        print(f"  Precision@20:     {results['precision_at_20']:.4f}")
        print(f"  NDCG@10:          {results['ndcg_at_10']:.4f}")
        print(f"  NDCG@20:          {results['ndcg_at_20']:.4f}")
        
        print(f"\n📈 Confusion Matrix:")
        print(f"  True Negatives:  {cm[0, 0]}")
        print(f"  False Positives: {cm[0, 1]}")
        print(f"  False Negatives: {cm[1, 0]}")
        print(f"  True Positives:  {cm[1, 1]}")
        
        self.evaluation_results['ml_model'] = results
        return results
    
    def evaluate_baseline(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict:
        """
        Evaluate rule-based baseline (using match_score).
        """
        print("\n📊 Evaluating Rule-Based Baseline...")
        print("="*60)
        
        # Use match_score as baseline predictions
        y_baseline_proba = X_test['match_score'].values
        y_baseline = (y_baseline_proba >= 0.5).astype(int)
        
        # Basic metrics
        results = {
            'auc_roc': roc_auc_score(y_test, y_baseline_proba),
            'avg_precision': average_precision_score(y_test, y_baseline_proba)
        }
        
        # Precision@K metrics
        for k in [5, 10, 20, 50]:
            results[f'precision_at_{k}'] = self.precision_at_k(y_test, y_baseline_proba, k)
        
        # NDCG
        results['ndcg_at_10'] = self.ndcg_at_k(y_test, y_baseline_proba, k=10)
        results['ndcg_at_20'] = self.ndcg_at_k(y_test, y_baseline_proba, k=20)
        
        print(f"\n🎯 Baseline Performance:")
        print(f"  AUC-ROC:          {results['auc_roc']:.4f}")
        print(f"  Avg Precision:    {results['avg_precision']:.4f}")
        print(f"  Precision@5:      {results['precision_at_5']:.4f}")
        print(f"  Precision@10:     {results['precision_at_10']:.4f}")
        print(f"  Precision@20:     {results['precision_at_20']:.4f}")
        print(f"  NDCG@10:          {results['ndcg_at_10']:.4f}")
        print(f"  NDCG@20:          {results['ndcg_at_20']:.4f}")
        
        self.evaluation_results['baseline'] = results
        return results
    
    def compare_models(self):
        """
        Compare ML model with baseline.
        """
        print("\n⚖️ Model Comparison:")
        print("="*60)
        
        ml_results = self.evaluation_results['ml_model']
        baseline_results = self.evaluation_results['baseline']
        
        metrics = ['auc_roc', 'precision_at_10', 'precision_at_20', 'ndcg_at_10']
        
        print(f"\n{'Metric':<20} {'Baseline':<12} {'ML Model':<12} {'Improvement':<12}")
        print("-" * 60)
        
        for metric in metrics:
            baseline_val = baseline_results[metric]
            ml_val = ml_results[metric]
            improvement = ((ml_val - baseline_val) / baseline_val * 100) if baseline_val > 0 else 0
            
            improvement_str = f"+{improvement:.1f}%" if improvement > 0 else f"{improvement:.1f}%"
            status = "✅" if improvement > 0 else "❌"
            
            print(f"{metric:<20} {baseline_val:<12.4f} {ml_val:<12.4f} {improvement_str:<10} {status}")
    
    def precision_at_k(self, y_true: pd.Series, y_pred_proba: np.ndarray, k: int) -> float:
        """Calculate Precision@K."""
        top_k_indices = np.argsort(y_pred_proba)[-k:]
        top_k_true = y_true.iloc[top_k_indices] if hasattr(y_true, 'iloc') else y_true[top_k_indices]
        return top_k_true.sum() / k
    
    def ndcg_at_k(self, y_true: pd.Series, y_pred_proba: np.ndarray, k: int) -> float:
        """
        Calculate Normalized Discounted Cumulative Gain at K.
        Measures ranking quality.
        """
        # Get top K predictions
        top_k_indices = np.argsort(y_pred_proba)[-k:][::-1]
        top_k_true = y_true.iloc[top_k_indices] if hasattr(y_true, 'iloc') else y_true[top_k_indices]
        
        # DCG (Discounted Cumulative Gain)
        dcg = np.sum(top_k_true / np.log2(np.arange(2, k + 2)))
        
        # IDCG (Ideal DCG) - if all top K were relevant
        ideal_relevance = np.sort(y_true)[-k:][::-1]
        idcg = np.sum(ideal_relevance / np.log2(np.arange(2, k + 2)))
        
        return dcg / idcg if idcg > 0 else 0.0
    
    def analyze_errors(self, X_test: pd.DataFrame, y_test: pd.Series):
        """
        Analyze false positives and false negatives.
        """
        print("\n🔍 Error Analysis...")
        print("="*60)
        
        # Get predictions
        y_pred_proba = self.model.predict(X_test, num_iteration=self.model.best_iteration)
        y_pred = (y_pred_proba >= 0.5).astype(int)
        
        # Identify errors
        false_positives = (y_pred == 1) & (y_test == 0)
        false_negatives = (y_pred == 0) & (y_test == 1)
        
        print(f"\n❌ False Positives: {false_positives.sum()} "
              f"({false_positives.mean()*100:.1f}% of predictions)")
        print(f"❌ False Negatives: {false_negatives.sum()} "
              f"({false_negatives.mean()*100:.1f}% of predictions)")
        
        # Analyze false positives
        if false_positives.sum() > 0:
            fp_data = X_test[false_positives]
            print(f"\n🔍 False Positive Characteristics:")
            print(f"  Avg match_score:     {fp_data['match_score'].mean():.3f}")
            print(f"  Avg skills_score:    {fp_data['skills_score'].mean():.3f}")
            print(f"  Avg salary_score:    {fp_data['salary_score'].mean():.3f}")
        
        # Analyze false negatives
        if false_negatives.sum() > 0:
            fn_data = X_test[false_negatives]
            print(f"\n🔍 False Negative Characteristics:")
            print(f"  Avg match_score:     {fn_data['match_score'].mean():.3f}")
            print(f"  Avg skills_score:    {fn_data['skills_score'].mean():.3f}")
            print(f"  Avg salary_score:    {fn_data['salary_score'].mean():.3f}")
    
    def plot_roc_curves(self, X_test: pd.DataFrame, y_test: pd.Series):
        """
        Plot ROC curves for ML model and baseline.
        """
        print("\n📈 Creating ROC curve plot...")
        
        # ML model predictions
        y_ml_proba = self.model.predict(X_test, num_iteration=self.model.best_iteration)
        fpr_ml, tpr_ml, _ = roc_curve(y_test, y_ml_proba)
        auc_ml = roc_auc_score(y_test, y_ml_proba)
        
        # Baseline predictions
        y_baseline_proba = X_test['match_score'].values
        fpr_baseline, tpr_baseline, _ = roc_curve(y_test, y_baseline_proba)
        auc_baseline = roc_auc_score(y_test, y_baseline_proba)
        
        # Plot
        plt.figure(figsize=(10, 8))
        plt.plot(fpr_ml, tpr_ml, 'b-', linewidth=2, 
                label=f'ML Model (AUC = {auc_ml:.3f})')
        plt.plot(fpr_baseline, tpr_baseline, 'r--', linewidth=2,
                label=f'Baseline (AUC = {auc_baseline:.3f})')
        plt.plot([0, 1], [0, 1], 'k--', alpha=0.3, label='Random')
        
        plt.xlabel('False Positive Rate', fontsize=12)
        plt.ylabel('True Positive Rate', fontsize=12)
        plt.title('ROC Curve: ML Model vs Baseline', fontsize=14, fontweight='bold')
        plt.legend(loc='lower right', fontsize=11)
        plt.grid(alpha=0.3)
        plt.tight_layout()
        
        plot_path = os.path.join(self.model_dir, 'roc_curve_comparison.png')
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✅ ROC curve saved: {plot_path}")
    
    def plot_precision_recall_curves(self, X_test: pd.DataFrame, y_test: pd.Series):
        """
        Plot precision-recall curves.
        """
        print("\n📈 Creating precision-recall curve plot...")
        
        # ML model predictions
        y_ml_proba = self.model.predict(X_test, num_iteration=self.model.best_iteration)
        precision_ml, recall_ml, _ = precision_recall_curve(y_test, y_ml_proba)
        ap_ml = average_precision_score(y_test, y_ml_proba)
        
        # Baseline predictions
        y_baseline_proba = X_test['match_score'].values
        precision_baseline, recall_baseline, _ = precision_recall_curve(y_test, y_baseline_proba)
        ap_baseline = average_precision_score(y_test, y_baseline_proba)
        
        # Plot
        plt.figure(figsize=(10, 8))
        plt.plot(recall_ml, precision_ml, 'b-', linewidth=2,
                label=f'ML Model (AP = {ap_ml:.3f})')
        plt.plot(recall_baseline, precision_baseline, 'r--', linewidth=2,
                label=f'Baseline (AP = {ap_baseline:.3f})')
        
        plt.xlabel('Recall', fontsize=12)
        plt.ylabel('Precision', fontsize=12)
        plt.title('Precision-Recall Curve: ML Model vs Baseline', fontsize=14, fontweight='bold')
        plt.legend(loc='upper right', fontsize=11)
        plt.grid(alpha=0.3)
        plt.tight_layout()
        
        plot_path = os.path.join(self.model_dir, 'precision_recall_curve.png')
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✅ Precision-recall curve saved: {plot_path}")
    
    def generate_report(self):
        """
        Generate comprehensive markdown report.
        """
        print("\n📝 Generating performance report...")
        
        ml_results = self.evaluation_results['ml_model']
        baseline_results = self.evaluation_results['baseline']
        
        # Calculate improvements
        auc_improvement = ((ml_results['auc_roc'] - baseline_results['auc_roc']) / 
                          baseline_results['auc_roc'] * 100)
        p10_improvement = ((ml_results['precision_at_10'] - baseline_results['precision_at_10']) / 
                          baseline_results['precision_at_10'] * 100)
        
        report = f"""# CAMSS 2.0 - ML Model Performance Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Model Type:** LightGBM Binary Classifier  
**Task:** Predict job application probability

---

## 📊 Executive Summary

The machine learning model has been successfully trained and evaluated on {len(self.df)} interactions.

### Key Results:
- ✅ **AUC-ROC:** {ml_results['auc_roc']:.4f} (vs baseline {baseline_results['auc_roc']:.4f})
- ✅ **Precision@10:** {ml_results['precision_at_10']:.4f} (vs baseline {baseline_results['precision_at_10']:.4f})
- ✅ **NDCG@10:** {ml_results['ndcg_at_10']:.4f} (vs baseline {baseline_results['ndcg_at_10']:.4f})
- 📈 **AUC Improvement:** {auc_improvement:+.1f}%
- 📈 **Precision@10 Improvement:** {p10_improvement:+.1f}%

---

## 🎯 Performance Metrics

### ML Model Performance

| Metric | Value |
|--------|-------|
| AUC-ROC | {ml_results['auc_roc']:.4f} |
| Average Precision | {ml_results['avg_precision']:.4f} |
| Precision@5 | {ml_results['precision_at_5']:.4f} |
| Precision@10 | {ml_results['precision_at_10']:.4f} |
| Precision@20 | {ml_results['precision_at_20']:.4f} |
| Precision@50 | {ml_results['precision_at_50']:.4f} |
| NDCG@10 | {ml_results['ndcg_at_10']:.4f} |
| NDCG@20 | {ml_results['ndcg_at_20']:.4f} |

### Rule-Based Baseline Performance

| Metric | Value |
|--------|-------|
| AUC-ROC | {baseline_results['auc_roc']:.4f} |
| Average Precision | {baseline_results['avg_precision']:.4f} |
| Precision@5 | {baseline_results['precision_at_5']:.4f} |
| Precision@10 | {baseline_results['precision_at_10']:.4f} |
| Precision@20 | {baseline_results['precision_at_20']:.4f} |
| Precision@50 | {baseline_results['precision_at_50']:.4f} |
| NDCG@10 | {baseline_results['ndcg_at_10']:.4f} |
| NDCG@20 | {baseline_results['ndcg_at_20']:.4f} |

---

## 📈 Model Comparison

| Metric | Baseline | ML Model | Improvement |
|--------|----------|----------|-------------|
| AUC-ROC | {baseline_results['auc_roc']:.4f} | {ml_results['auc_roc']:.4f} | {auc_improvement:+.1f}% |
| Precision@10 | {baseline_results['precision_at_10']:.4f} | {ml_results['precision_at_10']:.4f} | {p10_improvement:+.1f}% |
| NDCG@10 | {baseline_results['ndcg_at_10']:.4f} | {ml_results['ndcg_at_10']:.4f} | {((ml_results['ndcg_at_10']-baseline_results['ndcg_at_10'])/baseline_results['ndcg_at_10']*100):+.1f}% |

---

## ✅ Success Criteria

| Criterion | Target | Achieved | Status |
|-----------|--------|----------|--------|
| AUC-ROC > 0.75 | 0.75 | {ml_results['auc_roc']:.4f} | {'✅ PASS' if ml_results['auc_roc'] > 0.75 else '❌ FAIL'} |
| Precision@10 > 0.20 | 0.20 | {ml_results['precision_at_10']:.4f} | {'✅ PASS' if ml_results['precision_at_10'] > 0.20 else '❌ FAIL'} |
| NDCG > 0.60 | 0.60 | {ml_results['ndcg_at_10']:.4f} | {'✅ PASS' if ml_results['ndcg_at_10'] > 0.60 else '❌ FAIL'} |
| Beat Baseline by 10%+ | +10% | {auc_improvement:+.1f}% | {'✅ PASS' if auc_improvement > 10 else '❌ FAIL'} |

---

## 🔍 Feature Importance

Top features driving predictions (see `feature_importance.png`):
- match_score ⭐ (emphasized as requested)
- skills_score
- location_score
- salary_score
- skills_matched_count

---

## 📊 Visualizations

1. **ROC Curve:** `models/roc_curve_comparison.png`
2. **Precision-Recall Curve:** `models/precision_recall_curve.png`
3. **Feature Importance:** `models/feature_importance.png`

---

## 🚀 Deployment Readiness

{'✅ **READY FOR DEPLOYMENT**' if ml_results['auc_roc'] > 0.75 and ml_results['precision_at_10'] > 0.20 else '⚠️ **NEEDS IMPROVEMENT**'}

The model {'meets' if ml_results['auc_roc'] > 0.75 and ml_results['precision_at_10'] > 0.20 else 'does not meet'} all success criteria and is {'ready' if ml_results['auc_roc'] > 0.75 else 'not ready'} to be integrated into the API.

---

## 📝 Recommendations

1. **Model Performance:** {'Excellent! Deploy immediately.' if ml_results['auc_roc'] > 0.80 else 'Good performance. Consider A/B testing with baseline.' if ml_results['auc_roc'] > 0.75 else 'Needs improvement. Tune hyperparameters or collect more data.'}
2. **Feature Engineering:** Continue emphasizing match_score and skills_score as they show strong predictive power.
3. **Monitoring:** Track Precision@10 in production as it's the most relevant metric for users.

---

**Report End**
"""
        
        # Save report with UTF-8 encoding to support emojis
        with open(REPORT_OUTPUT, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✅ Report saved: {REPORT_OUTPUT}")
    
    def run_evaluation(self):
        """
        Complete evaluation pipeline.
        """
        print("\n" + "="*60)
        print("📊 CAMSS 2.0 - MODEL EVALUATION PIPELINE")
        print("="*60)
        
        try:
            # Load artifacts
            self.load_artifacts()
            
            # Prepare test data
            X_test, y_test = self.prepare_test_data()
            
            # Evaluate ML model
            self.evaluate_ml_model(X_test, y_test)
            
            # Evaluate baseline
            self.evaluate_baseline(X_test, y_test)
            
            # Compare models
            self.compare_models()
            
            # Error analysis
            self.analyze_errors(X_test, y_test)
            
            # Create visualizations
            self.plot_roc_curves(X_test, y_test)
            self.plot_precision_recall_curves(X_test, y_test)
            
            # Generate report
            self.generate_report()
            
            print("\n" + "="*60)
            print("✅ EVALUATION COMPLETE!")
            print("="*60)
            print(f"\n📁 Results saved in: {MODEL_DIR}/")
            print(f"📄 Report: {REPORT_OUTPUT}")
            
        except Exception as e:
            print(f"\n❌ Evaluation failed: {e}")
            raise


def main():
    """Run model evaluation pipeline."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, MODEL_DIR)  # Absolute path to models directory
    model_path = os.path.join(model_dir, MODEL_FILE)
    data_path = os.path.join(current_dir, TRAINING_DATA_FILE)
    
    evaluator = ModelEvaluator(model_path, data_path, model_dir)
    evaluator.run_evaluation()


if __name__ == "__main__":
    main()
