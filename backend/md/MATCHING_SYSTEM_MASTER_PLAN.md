# 🎯 AI Job Matching System - Master Plan

> **Document Purpose:** This is the strategic blueprint for building the CAMSS 2.0 (Collar-Aware Multi-Score System) matching algorithm. This document provides context, mission, architecture overview, and the complete implementation roadmap for all team members and future AI assistants working on this project.

---

## 📋 Document Overview

**What this document contains:**
- System mission and objectives
- High-level architecture
- Technical specifications
- Implementation phases
- Success criteria
- Reference materials

**Related documents:**
- `MATCHING_SYSTEM_PROGRESS.md` - Live progress tracker (updated after each milestone)
- `CAMSS_ARCHITECTURE.md` - Detailed algorithm specifications (if created)
- Dataset documentation in `/datasets/`

---

## 🎯 Mission Statement

Build a **dual-track job matching system** that serves both traditional employment (corp_jobs) and gig economy (small_jobs) markets in Zambia, using a hybrid approach that combines:

1. **Deterministic scoring** - Rule-based matching with explainable results
2. **Market intelligence** - Data-driven patterns from real resume corpus
3. **Collar-aware weighting** - Different priorities for different job types
4. **Incremental ML adoption** - Start simple, evolve to machine learning

**Core principle:** Ship fast with simple but effective matching, collect real interaction data, then iterate toward ML-powered precision.

---

## 🏗️ System Architecture

### Two-Track Matching Design

```
┌─────────────────────────────────────────────────────────┐
│              AI Job Matching Platform                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────────────┐         ┌──────────────────┐   │
│   │   Small Jobs     │         │   Corp Jobs      │   │
│   │   (Gig Economy)  │         │   (Traditional)  │   │
│   └────────┬─────────┘         └────────┬─────────┘   │
│            │                            │              │
│            ▼                            ▼              │
│   ┌──────────────────┐         ┌──────────────────┐   │
│   │  Task Matcher    │         │  Career Matcher  │   │
│   │  (3-Component)   │         │  (CAMSS 2.0)     │   │
│   │                  │         │  (6-Component)   │   │
│   └────────┬─────────┘         └────────┬─────────┘   │
│            │                            │              │
│            └──────────┬─────────────────┘              │
│                       ▼                                │
│            Unified Candidate Pool                      │
│            (2,500 CVs - Single Schema)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Assets

| Asset | Count | Purpose |
|-------|-------|---------|
| **CV Database** | 2,500 | Unified candidate profiles |
| **Corp Jobs** | 500 | Traditional employment opportunities |
| **Small Jobs** | 400 | Gig economy tasks |
| **Skills Taxonomy** | ~500 | Normalized skill names + synonyms |
| **Skill Co-occurrence Matrix** | Dynamic | Context-aware skill matching |
| **Industry Transition Matrix** | Dynamic | Category compatibility scoring |

---

## 🎨 Matching Algorithms

### Algorithm 1: Small Jobs Matcher (Lightweight)

**Use case:** Gig economy, task-based work  
**Priority:** Speed and accessibility over precision  
**Barrier:** Low (most candidates can apply)

**Scoring Components (3):**

```
Final Score = 
    CategoryMatch × 0.70 +
    LocationFeasibility × 0.20 +
    Availability × 0.10
```

**Rationale:**
- Gig work prioritizes **what you can do** (category) over credentials
- Location critical for on-site tasks
- Availability matters (can you start tomorrow?)
- No education/experience requirements (inclusive)

**Target metrics:**
- Application rate: 30-50%
- Time to apply: <30 seconds
- False positives: <25% (acceptable for low-stakes gigs)

---

### Algorithm 2: Corp Jobs Matcher (CAMSS 2.0)

**Use case:** Traditional employment, career positions  
**Priority:** Precision and long-term fit  
**Barrier:** Higher (credentials, experience required)

**Scoring Components (6):**

```
Final Score = 
    QualificationScore × Wq +
    ExperienceScore × We +
    SkillsScore × Ws +
    LocationScore × Wl +
    CategoryRelevance × Wc +
    Personalization × Wp
```

**Collar-Specific Weights:**

| Collar | Wq | We | Ws | Wl | Wc | Wp | Description |
|--------|----|----|----|----|----|----|-------------|
| White | 0.30 | 0.25 | 0.25 | 0.05 | 0.10 | 0.05 | Professional/office |
| Blue | 0.10 | 0.45 | 0.25 | 0.10 | 0.05 | 0.05 | Manual/technical |
| Pink | 0.20 | 0.25 | 0.35 | 0.05 | 0.10 | 0.05 | Service/creative |
| Grey | 0.25 | 0.25 | 0.30 | 0.05 | 0.10 | 0.05 | Tech/engineering |
| Green | 0.20 | 0.25 | 0.35 | 0.05 | 0.10 | 0.05 | Environmental |

**Target metrics:**
- Application rate: 15-25%
- Time to apply: <2 minutes
- False positives: <15%
- Match helpfulness: ≥80%

---

## 🗂️ Data Schemas

### CV Schema (Unified)
```
cv_id, full_name, phone, email, gender, date_of_birth, nationality,
city, province, education_level, institution, graduation_year, major,
certifications, languages, language_proficiency, total_years_experience,
current_job_title, employment_status, preferred_job_type, 
preferred_location, salary_expectation_min, salary_expectation_max,
availability, skills_technical, skills_soft, work_experience_json,
projects_json, references_json, resume_quality_score
```

### Corp Jobs Schema
```
job_id, title, company, category, collar_type, description,
key_responsibilities, required_skills, preferred_skills,
required_experience_years, required_education, preferred_certifications,
location_city, location_province, salary_min_zmw, salary_max_zmw,
employment_type, work_schedule, language_requirements,
application_deadline, posted_date, benefits, growth_opportunities,
company_size, industry_sector
```

### Small Jobs Schema
```
id, title, category, description, province, location,
budget, paymentType, duration, postedBy, datePosted, status
```

---

## 📊 Implementation Phases

### Phase 2A: MVP (Weeks 1-3)
**Goal:** Ship minimal viable matching system, collect interaction data

**Deliverables:**
- [ ] Both matchers implemented (small + corp)
- [ ] Equal weights for corp matcher (no collar differentiation yet)
- [ ] Exact skill matching only (no semantic embeddings)
- [ ] Simple category hierarchy for relevance scoring
- [ ] Basic location scoring (same city = 1.0, else = 0.3)
- [ ] Aggressive telemetry logging
- [ ] Explainability: sub-score breakdowns
- [ ] Pre-filtering to avoid O(n²) performance issues
- [ ] Database tables: skills_taxonomy, user_job_interactions, match_feedback

**Success criteria:**
- System handles 100 beta users without performance issues
- Top-3 match CTR ≥10%
- "Helpful" rating ≥50%
- False positive reports <30%

---

### Phase 2B: Refinement (Weeks 4-9)
**Goal:** Iterate based on real user data, add sophistication

**Deliverables:**
- [ ] Collar-specific weights (data-validated, not assumed)
- [ ] Semantic similarity for skills (using embeddings)
- [ ] Category compatibility matrix (derived from transition data)
- [ ] Recency weighting for experience
- [ ] Salary compatibility filtering
- [ ] Match confidence scoring
- [ ] Enhanced personalization (boost from 5% to 15%)

**Prerequisites:**
- ≥1,000 user interactions logged
- Analysis showing which components correlate with applications
- User feedback on false positives/negatives

**Success criteria:**
- Top-3 match CTR ≥20%
- "Helpful" rating ≥65%
- False positive reports <20%
- Score separation: relevant jobs 0.4+ higher than irrelevant

---

### Phase 3: ML Integration (Weeks 10-22)
**Goal:** Replace deterministic scoring with learning-to-rank model

**Deliverables:**
- [ ] Feature engineering pipeline
- [ ] Training data: user_interactions → labels
- [ ] LightGBM/XGBoost ranking model
- [ ] A/B testing framework (ML vs deterministic)
- [ ] Model monitoring dashboard
- [ ] Personalization weight → 20%
- [ ] Salary expectation as 7th scoring factor
- [ ] Feedback-driven retraining loop

**Prerequisites:**
- ≥5,000 user interactions with ground truth labels
- Baseline metrics from Phase 2B established
- ML infrastructure (model serving, feature store)

**Success criteria:**
- ML model outperforms deterministic by ≥10% on CTR
- Inference time <100ms per candidate-job pair
- Model retraining pipeline automated (weekly)

---

## 🎯 Key Success Metrics

### Business Metrics
| Metric | Phase 2A Target | Phase 2B Target | Phase 3 Target |
|--------|----------------|----------------|----------------|
| Monthly Active Users | 100 | 500 | 2,000 |
| Applications per User | 2 | 5 | 8 |
| User Retention (30-day) | 40% | 60% | 75% |
| Employer Satisfaction | 60% | 75% | 85% |

### Technical Metrics
| Metric | Phase 2A Target | Phase 2B Target | Phase 3 Target |
|--------|----------------|----------------|----------------|
| Match CTR (top-3) | 10% | 20% | 30% |
| False Positive Rate | <30% | <20% | <10% |
| Average Match Score | 0.60 | 0.70 | 0.80 |
| P99 Latency | <500ms | <300ms | <200ms |

---

## 🛠️ Technology Stack

### Core Framework
- **Backend:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15+
- **Caching:** Redis (for skill lookups, embeddings)
- **API Design:** RESTful with OpenAPI documentation

### Matching Engine
- **Phase 2A/2B:** NumPy, Pandas (deterministic scoring)
- **Phase 3:** Scikit-learn, LightGBM (ML models)
- **Embeddings:** Sentence-BERT or similar (Phase 2B+)

### Monitoring & Analytics
- **Logging:** Structured JSON logs
- **Metrics:** Prometheus + Grafana
- **User Analytics:** Custom event tracking pipeline

---

## 📚 Data Collection Strategy

### What to Log (Every Match Event)
```json
{
  "event_id": "uuid",
  "timestamp": "2024-11-11T10:30:00Z",
  "user_id": "cv_001",
  "job_id": "job_123",
  "job_type": "corp_job",
  "match_score": 0.87,
  "sub_scores": {
    "qualification": 0.90,
    "experience": 0.85,
    "skills": 0.92,
    "location": 0.70,
    "category": 1.0,
    "personalization": 0.50
  },
  "action": "viewed",  // viewed, saved, applied, rejected
  "source": "recommendation",  // search, notification, recommendation
  "session_id": "session_xyz"
}
```

### Feedback Collection
```json
{
  "feedback_id": "uuid",
  "match_event_id": "uuid",
  "user_id": "cv_001",
  "job_id": "job_123",
  "helpful": true,  // boolean
  "reason": "skills_mismatch",  // optional enum
  "comment": "Job required 5 years, I only have 2"  // optional text
}
```

---

## 🚨 Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| O(n²) performance bottleneck | HIGH | Pre-filtering, indexing, caching |
| Embedding model doesn't understand Zambian context | HIGH | Use co-occurrence matrix instead (Phase 2A) |
| Cold start: no interaction data | MEDIUM | Start with synthetic scoring, iterate quickly |
| Weight assumptions are wrong | MEDIUM | Equal weights in Phase 2A, A/B test adjustments |

### Product Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users don't trust AI matching | MEDIUM | Explainability (show sub-scores), manual search fallback |
| False positives damage credibility | HIGH | Conservative thresholds, user feedback loop |
| Employers reject candidates | MEDIUM | Set realistic expectations, highlight uncertainties |
| Market prefers manual job boards | HIGH | Differentiate with speed, personalization, insights |

---

## 📖 Reference Materials

### Key Algorithms & Papers
- **Learning to Rank:** "From RankNet to LambdaRank to LambdaMART: An Overview" (Burges, 2010)
- **Two-sided Matching:** Gale-Shapley stable matching algorithm
- **Skill Similarity:** "Skill2Vec: Machine Learning Approach for Determining Similarity Between Job Skills" (2019)

### Domain Knowledge
- **Zambian Labor Market:** Focus on informal economy, gig work prevalence
- **Collar Types:** Blue (manual), White (office), Pink (service), Grey (tech), Green (environmental)
- **Local Context:** Account for skills like "Pastel accounting", "ZICTA certification"

### Comparable Systems
- LinkedIn Recruiter (similarity scoring)
- Indeed Job Matching (skill-based)
- Upwork Talent Matching (gig economy)
- ZipRecruiter Phil (AI matching)

---

## 🎓 Learning & Iteration Philosophy

### Principles
1. **Ship fast, learn faster:** 3-week MVP beats 3-month "perfect" system
2. **Data > Assumptions:** Equal weights until data proves otherwise
3. **Explainability > Accuracy:** Users trust systems they understand
4. **Incremental complexity:** Add features only when simpler approaches fail
5. **Real users > Synthetic data:** 100 real interactions worth 10,000 synthetic ones

### Decision Framework
When deciding to add complexity, ask:
- Does existing system fail measurably? (What's the metric?)
- Will this feature move that metric by ≥10%?
- Can we A/B test it?
- Is there a simpler solution?
- Do we have data to validate it works?

If any answer is "no," defer the feature.

---

## 👥 Team Roles & Responsibilities

### Current Phase (2A)
- **Data Scientist:** Analyze resume corpus, build matching intelligence
- **Backend Engineer:** Implement dual matchers, API endpoints
- **Product:** Define success metrics, user testing protocol
- **QA:** Manual testing on 100 synthetic match scenarios

### Phase 2B+
- **ML Engineer:** Train ranking models, feature engineering
- **Data Engineer:** Build interaction pipeline, feature store
- **Analytics:** Dashboard for metric monitoring

---

## 📞 Contact & Support

**Project Lead:** [Your Name]  
**Repository:** `C:\Dev\ai-job-matchingV2`  
**Documentation:** `/backend/` folder  
**Datasets:** `/backend/datasets/` or `/datasets/`

**For questions or issues:**
1. Check `MATCHING_SYSTEM_PROGRESS.md` for current status
2. Review relevant code in `/app/matching/`
3. Consult this master plan for strategic context
4. Ask team or create issue if blocked

---

## 🔄 Document Maintenance

**Last Updated:** November 11, 2024  
**Version:** 1.0  
**Next Review:** After Phase 2A completion (Week 3)

**Change Log:**
- 2024-11-11: Initial master plan created
- [Future updates will be logged here]

---

**Remember:** This is a living document. Update it as the system evolves, but preserve the core philosophy: start simple, measure everything, iterate based on data.