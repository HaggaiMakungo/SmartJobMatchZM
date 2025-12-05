# CAMSS 2.0 - ML Model Performance Report

**Generated:** 2025-11-21 09:54:35  
**Model Type:** LightGBM Binary Classifier  
**Task:** Predict job application probability

---

## 📊 Executive Summary

The machine learning model has been successfully trained and evaluated on 7528 interactions.

### Key Results:
- ✅ **AUC-ROC:** 0.7667 (vs baseline 0.6210)
- ✅ **Precision@10:** 0.6000 (vs baseline 0.2000)
- ✅ **NDCG@10:** 0.6691 (vs baseline 0.2895)
- 📈 **AUC Improvement:** +23.5%
- 📈 **Precision@10 Improvement:** +200.0%

---

## 🎯 Performance Metrics

### ML Model Performance

| Metric | Value |
|--------|-------|
| AUC-ROC | 0.7667 |
| Average Precision | 0.3276 |
| Precision@5 | 0.6000 |
| Precision@10 | 0.6000 |
| Precision@20 | 0.4500 |
| Precision@50 | 0.4200 |
| NDCG@10 | 0.6691 |
| NDCG@20 | 0.5357 |

### Rule-Based Baseline Performance

| Metric | Value |
|--------|-------|
| AUC-ROC | 0.6210 |
| Average Precision | 0.1736 |
| Precision@5 | 0.2000 |
| Precision@10 | 0.2000 |
| Precision@20 | 0.1500 |
| Precision@50 | 0.2200 |
| NDCG@10 | 0.2895 |
| NDCG@20 | 0.2232 |

---

## 📈 Model Comparison

| Metric | Baseline | ML Model | Improvement |
|--------|----------|----------|-------------|
| AUC-ROC | 0.6210 | 0.7667 | +23.5% |
| Precision@10 | 0.2000 | 0.6000 | +200.0% |
| NDCG@10 | 0.2895 | 0.6691 | +131.1% |

---

## ✅ Success Criteria

| Criterion | Target | Achieved | Status |
|-----------|--------|----------|--------|
| AUC-ROC > 0.75 | 0.75 | 0.7667 | ✅ PASS |
| Precision@10 > 0.20 | 0.20 | 0.6000 | ✅ PASS |
| NDCG > 0.60 | 0.60 | 0.6691 | ✅ PASS |
| Beat Baseline by 10%+ | +10% | +23.5% | ✅ PASS |

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

✅ **READY FOR DEPLOYMENT**

The model meets all success criteria and is ready to be integrated into the API.

---

## 📝 Recommendations

1. **Model Performance:** Good performance. Consider A/B testing with baseline.
2. **Feature Engineering:** Continue emphasizing match_score and skills_score as they show strong predictive power.
3. **Monitoring:** Track Precision@10 in production as it's the most relevant metric for users.

---

**Report End**
