# CAMSS 2.0 - Technical Documentation

**Computer-Aided Matching System for Skills (CAMSS)**  
*AI-Powered Job Matching System for Zambia's Job Market*

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Matching Algorithm](#matching-algorithm)
6. [API Documentation](#api-documentation)
7. [Machine Learning Pipeline](#machine-learning-pipeline)
8. [Performance Optimization](#performance-optimization)
9. [Deployment Guide](#deployment-guide)

---

## System Overview

### Purpose
CAMSS 2.0 is a sophisticated AI-powered job matching system designed specifically for Zambia's diverse job market, combining traditional corporate positions with gig economy opportunities.

### Key Statistics
- **CVs in Database**: 2,500 diverse candidates
- **Job Listings**: 1,600 (1,000 corporate + 600 gig economy)
- **Training Interactions**: 7,500 synthetic interactions
- **Match Accuracy**: 90% average relevance (439% improvement over baseline)
- **Response Time**: 8-10 seconds (cached), 30-60 seconds (first load)

### Core Capabilities
- ✅ Hybrid matching (Rule-based + ML)
- ✅ Semantic skill understanding (AI-powered)
- ✅ Zambian context awareness
- ✅ Cross-city matching with penalties
- ✅ Real-time candidate recommendations
- ✅ Explainable AI (match reasoning)

---

## Architecture

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  React Native    │         │   Next.js Web    │          │
│  │  Mobile App      │         │   Dashboard      │          │
│  └────────┬─────────┘         └─────────┬────────┘          │
└───────────┼───────────────────────────────┼──────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway  │
                    │   (FastAPI)    │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌────────▼─────────┐
│   Matching     │  │  ML Service  │  │  Auth Service    │
│   Service      │  │              │  │                  │
│ • Rule-based   │  │ • LightGBM   │  │ • JWT Tokens     │
│ • Semantic AI  │  │ • Predictions│  │ • Role-based     │
│ • Enhanced     │  │ • Features   │  │                  │
└───────┬────────┘  └──────┬───────┘  └────────┬─────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │   Database     │
                    │                │
                    │ • job_match_db │
                    └────────────────┘
```

### Service Architecture

#### **1. Enhanced Matching Service** (Primary)
```python
app/services/enhanced_matching_service.py
```
- **Phase 1**: Input Cleaning (Keyword Extractor, Skill Normalizer)
- **Phase 2**: Smart Categorization (Category Confidence, Irrelevance Penalty)
- **Phase 3**: Reality-Based Scoring (TF-IDF, Hard Skills Priority)

#### **2. ML Matching Service** (Secondary)
```python
app/services/ml_matching_service.py
```
- LightGBM model trained on 7,500 interactions
- Hybrid scoring: `0.4 × rule_score + 0.6 × ml_score`
- Auto-loads model with fallback to rule-based

#### **3. Semantic Skill Matcher** (New)
```python
app/services/enhanced_skill_matcher.py
```
- Uses `sentence-transformers` (all-MiniLM-L6-v2)
- 5 matching strategies with confidence scores
- Handles skill synonyms and variations

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Core language |
| **FastAPI** | 0.104.0+ | REST API framework |
| **PostgreSQL** | 14+ | Primary database |
| **SQLAlchemy** | 2.0+ | ORM |
| **LightGBM** | 4.0+ | ML model |
| **sentence-transformers** | 2.2+ | Semantic matching |
| **scikit-learn** | 1.3+ | Feature engineering |
| **pandas** | 2.0+ | Data processing |
| **numpy** | 1.24+ | Numerical operations |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.72+ | Mobile app |
| **Expo** | 49+ | Development toolkit |
| **Next.js** | 13+ | Web dashboard |
| **TypeScript** | 5.0+ | Type safety |
| **Axios** | 1.5+ | HTTP client |
| **TailwindCSS** | 3.3+ | Styling |

### DevOps & Tools
- **Git** - Version control
- **Docker** (optional) - Containerization
- **Uvicorn** - ASGI server
- **pytest** - Testing framework

---

## Database Schema

### Core Tables

#### **cvs** (Candidate Table)
```sql
CREATE TABLE cvs (
    cv_id VARCHAR PRIMARY KEY,
    full_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    phone VARCHAR,
    gender VARCHAR,
    date_of_birth DATE,
    nationality VARCHAR,
    city VARCHAR,
    province VARCHAR,
    
    -- Education
    education_level VARCHAR,
    institution VARCHAR,
    graduation_year INTEGER,
    major VARCHAR,
    certifications TEXT,
    
    -- Languages
    languages VARCHAR,
    language_proficiency VARCHAR,
    
    -- Experience
    total_years_experience DOUBLE PRECISION,
    current_job_title VARCHAR,
    employment_status VARCHAR,
    
    -- Preferences
    preferred_job_type VARCHAR,
    preferred_location VARCHAR,
    salary_expectation_min DOUBLE PRECISION,
    salary_expectation_max DOUBLE PRECISION,
    availability VARCHAR,
    
    -- Skills
    skills_technical TEXT,
    skills_soft TEXT,
    
    -- JSONB Fields
    work_experience_json JSONB,
    projects_json JSONB,
    references_json JSONB,
    
    -- Metadata
    resume_quality_score DOUBLE PRECISION
);
```

#### **jobs** (Job Listings Table)
```sql
CREATE TABLE jobs (
    job_id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    company VARCHAR NOT NULL,
    description TEXT,
    
    -- Location
    city VARCHAR,
    province VARCHAR,
    
    -- Compensation
    salary_min DOUBLE PRECISION,
    salary_max DOUBLE PRECISION,
    
    -- Requirements
    required_skills TEXT,
    preferred_skills TEXT,
    required_experience DOUBLE PRECISION,
    education_level VARCHAR,
    
    -- Job Details
    job_type VARCHAR,
    category VARCHAR,
    posted_date DATE,
    deadline DATE,
    
    -- Company
    company_id VARCHAR,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE
);
```

#### **companies** (Recruiter Companies)
```sql
CREATE TABLE companies (
    company_id VARCHAR PRIMARY KEY,
    company_name VARCHAR NOT NULL,
    industry VARCHAR,
    location VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **user_interactions** (Training Data)
```sql
CREATE TABLE user_interactions (
    interaction_id SERIAL PRIMARY KEY,
    cv_id VARCHAR REFERENCES cvs(cv_id),
    job_id VARCHAR REFERENCES jobs(job_id),
    interaction_type VARCHAR, -- 'view', 'apply', 'save', 'reject'
    interaction_score DOUBLE PRECISION,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Data Distribution

#### **CV Distribution by Location**
| City | Province | Count |
|------|----------|-------|
| Lusaka | Lusaka Province | 850 |
| Kitwe | Copperbelt | 420 |
| Ndola | Copperbelt | 380 |
| Livingstone | Southern Province | 280 |
| Kabwe | Central Province | 240 |
| Others | Various | 330 |

#### **Job Distribution by Category**
| Category | Count | Percentage |
|----------|-------|------------|
| Technology | 320 | 20% |
| Healthcare | 240 | 15% |
| Education | 200 | 12.5% |
| Finance | 180 | 11.25% |
| Retail | 160 | 10% |
| Transport | 140 | 8.75% |
| Gig Economy | 360 | 22.5% |

---

## Matching Algorithm

### Three-Phase Enhancement Pipeline

#### **Phase 1: Input Cleaning**

##### 1.1 Keyword Extractor
```python
# app/services/keyword_extractor.py
```
**Removes 50+ types of corporate fluff:**
- Time wasters: "Proven track record", "Results-oriented"
- Action fluff: "Responsible for", "Duties include"
- Vague descriptors: "Strong", "Excellent", "Good"

**Example:**
```python
Input:  "Proven track record in logistics with strong communication skills"
Output: "logistics communication skills"
```

##### 1.2 Skill Normalizer
```python
# app/services/skill_normalizer.py
```
**20+ skill clusters with synonym mapping:**
```python
'accounting_finance': {
    'accounting', 'finance', 'bookkeeping', 'financial analysis',
    'financial reporting', 'budgeting', 'forecasting', 'auditing'
}

'logistics_management': {
    'logistics', 'logistics management', 'supply chain', 
    'supply chain management', 'inventory management', 'warehousing'
}
```

#### **Phase 2: Smart Categorization**

##### 2.1 Category Confidence Scorer
```python
# app/services/category_confidence.py
```
**12 categories with multi-signal detection:**
- Technology, Healthcare, Education, Retail, Transport, Trades, etc.

**Scoring signals:**
1. **Job Title Signal** (40% weight)
2. **Skills Signal** (30% weight)
3. **Keywords Signal** (30% weight)

**Example:**
```python
Input:  "Logistics Coordinator with supply chain and route planning skills"
Output: {
    'Transport': 0.85,  # High confidence
    'Retail': 0.12,     # Low confidence
    'Office': 0.03      # Very low confidence
}
```

##### 2.2 Irrelevance Penalty
**3-tier penalty system:**
- **Severe Mismatch** (-50%): Teacher → Tech Jobs
- **Moderate Mismatch** (-30%): Retail → Healthcare
- **Mild Mismatch** (-15%): Office → Transport

#### **Phase 3: Reality-Based Scoring**

##### 3.1 Skill Rarity Weighting (TF-IDF)
```python
# app/services/skill_rarity_calculator.py
```
**Rare skills get 2-6x weight:**
```python
Common skill:  "Communication"     → weight: 1.0x
Uncommon:      "Python"            → weight: 2.5x
Rare:          "Kubernetes"        → weight: 4.2x
Very rare:     "AWS Lambda"        → weight: 6.0x
```

##### 3.2 Hard Skills Prioritization
**Specialized skills matter more:**
- Technical skills: Full weight
- Soft skills: 50% weight (halved)

### Enhanced Semantic Matching

#### **Semantic Skill Matcher**
```python
# app/services/enhanced_skill_matcher.py
```

**5 Matching Strategies (in order):**

1. **Exact Match** (normalized)
   ```python
   "logistics" == "logistics" → 1.00
   ```

2. **Cluster Match** (semantic clusters)
   ```python
   "logistics" ↔ "logistics management" → 0.95
   ```

3. **Semantic Similarity** (AI model)
   ```python
   sentence_transformers.util.cos_sim(
       "problem solving",
       "problem-solving"
   ) → 0.97
   ```

4. **Fuzzy Matching** (string similarity)
   ```python
   fuzz.token_set_ratio(
       "inventory management",
       "inventory control"
   ) → 0.85
   ```

5. **Token Overlap** (shared words)
   ```python
   tokens("supply chain officer") ∩ 
   tokens("supply chain knowledge") → 0.67
   ```

**Confidence Thresholds:**
- Semantic: ≥ 0.65
- Fuzzy: ≥ 0.65
- Token: ≥ 0.40

### Scoring Formulas

#### **Production Matching** (50/30/20)
```python
final_score = (
    0.50 × skills_score +
    0.30 × location_score +
    0.20 × experience_score
)
```

#### **Academic Matching** (80/10/5/5)
```python
final_score = (
    0.80 × skills_score +
    0.10 × experience_score +
    0.05 × location_score +
    0.05 × education_score
) × category_penalty
```

#### **Hybrid ML Scoring**
```python
final_score = (
    0.40 × rule_based_score +
    0.60 × ml_predicted_score
)
```

### Match Explanation Generation

```python
def generate_match_explanation(cv, job, score_components):
    reasons = []
    
    # Skills analysis
    matched = score_components['matched_skills']
    missing = score_components['missing_skills']
    
    if len(matched) >= len(missing):
        reasons.append(f"✅ Strong skill match ({len(matched)} skills)")
    else:
        reasons.append(f"⚠️ Weak skill match ({len(missing)} skills missing)")
    
    # Experience analysis
    exp_diff = cv.experience - job.required_experience
    if exp_diff >= 0:
        reasons.append("✅ Experience level matches")
    else:
        reasons.append("⚠️ Less experience than required")
    
    # Location analysis
    if cv.city == job.city:
        reasons.append("✅ Same city")
    elif cv.province == job.province:
        reasons.append("⚠️ Same province, different city")
    else:
        reasons.append("❌ Different region")
    
    return " | ".join(reasons)
```

---

## API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
```http
Authorization: Bearer <jwt_token>
```

### Endpoints

#### **1. Candidate Matching**

##### Get Job Matches for Candidate
```http
GET /api/match/candidate/{cv_id}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Max results |
| `min_score` | float | 0.3 | Minimum match score (0-1) |
| `preferred_city` | string | null | Filter by city |
| `job_type` | string | null | Filter by job type |

**Response:**
```json
{
  "cv_id": "CV001",
  "candidate_name": "John Banda",
  "matches": [
    {
      "job_id": "JOB123",
      "title": "Software Developer",
      "company": "TechCorp Zambia",
      "location": "Lusaka, Lusaka Province",
      "salary_range": "K15,000 - K25,000",
      "final_score": 0.85,
      "components": {
        "skills": 0.90,
        "location": 1.00,
        "experience": 0.75
      },
      "matched_skills": ["Python", "JavaScript", "SQL"],
      "missing_skills": ["React", "Docker"],
      "explanation": "✅ Strong skill match (15 skills) | ✅ Experience level matches | ✅ Same city"
    }
  ],
  "total_matches": 45,
  "processing_time": 8.2
}
```

#### **2. Recruiter Matching (Reverse)**

##### Get Candidates for Job
```http
GET /api/recruiter/job/{job_id}/candidates
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Max results |
| `min_score` | float | 0.3 | Minimum match score (0-1) |
| `same_city_only` | boolean | false | Same city filter |

**Response:**
```json
{
  "job_id": "ZEDSAFE_001",
  "job_title": "Logistics Coordinator",
  "company": "Zedsafe Logistics",
  "candidates": [
    {
      "cv_id": "CV_LOGISTICS_001",
      "full_name": "Perfect Logistics Pro",
      "current_title": "Senior Logistics Manager",
      "location": "Lusaka, Lusaka Province",
      "experience_years": 12.0,
      "final_score": 1.00,
      "components": {
        "skills": 1.00,
        "experience": 1.00,
        "location": 1.00,
        "education": 1.00
      },
      "matched_skills": [
        "Logistics Management",
        "Route Planning",
        "Inventory Management",
        "GPS Tracking",
        "Microsoft Office"
      ],
      "missing_skills": [],
      "explanation": "✅ Perfect match (all skills) | ✅ Experience level matches | ✅ Same city",
      "contact": {
        "email": "perfect.logistics@email.com",
        "phone": "+260 97 1234567"
      }
    }
  ],
  "total_candidates": 156,
  "filtered_candidates": 5,
  "processing_time": 9.7
}
```

#### **3. ML Predictions**

##### Get ML Match Predictions
```http
GET /api/ml/match/candidate/{cv_id}
```

**Response:**
```json
{
  "cv_id": "CV001",
  "predictions": [
    {
      "job_id": "JOB123",
      "ml_score": 0.82,
      "rule_score": 0.75,
      "hybrid_score": 0.79,
      "confidence": 0.88
    }
  ]
}
```

#### **4. Job Management**

##### List Corporate Jobs
```http
GET /api/jobs/corporate
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `company` | string | Filter by company name |
| `category` | string | Filter by category |
| `city` | string | Filter by location |
| `limit` | integer | Results limit |
| `offset` | integer | Pagination offset |

**Response:**
```json
{
  "jobs": [
    {
      "job_id": "ZEDSAFE_001",
      "title": "Logistics Coordinator",
      "company": "Zedsafe Logistics",
      "description": "Manage daily logistics operations...",
      "location": "Lusaka, Lusaka Province",
      "salary_range": "K8,000 - K12,000",
      "required_skills": ["Logistics Management", "Route Planning"],
      "category": "Transport",
      "posted_date": "2024-11-15",
      "is_active": true
    }
  ],
  "total": 156,
  "page": 1
}
```

#### **5. CV Management**

##### List CVs
```http
GET /api/cv/list
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Results limit |
| `offset` | integer | Pagination offset |
| `city` | string | Filter by city |
| `min_experience` | float | Min years experience |

**Response:**
```json
{
  "cvs": [
    {
      "cv_id": "CV001",
      "full_name": "John Banda",
      "current_title": "Software Developer",
      "location": "Lusaka, Lusaka Province",
      "experience": 5.0,
      "skills": ["Python", "JavaScript", "SQL"],
      "email": "john.banda@email.com",
      "phone": "+260 97 1234567"
    }
  ],
  "total": 2500,
  "page": 1
}
```

### Error Responses

```json
{
  "error": "Resource not found",
  "detail": "CV with ID CV999 does not exist",
  "status_code": 404
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Machine Learning Pipeline

### Model Training

#### **Data Preparation**
```python
# backend/ml/prepare_training_data.py
```

**Features Generated:**
1. **Candidate Features** (15 features)
   - `cv_experience_years`
   - `cv_education_level_encoded`
   - `cv_total_skills`
   - `cv_technical_skills`
   - `cv_soft_skills`

2. **Job Features** (12 features)
   - `job_required_experience`
   - `job_salary_midpoint`
   - `job_required_skills_count`
   - `job_category_encoded`

3. **Match Features** (18 features)
   - `skill_match_ratio`
   - `experience_difference`
   - `location_match`
   - `salary_fit`
   - `education_match`

**Total: 45 features**

#### **Model Training**
```python
# backend/ml/train_model.py
```

**Algorithm:** LightGBM Classifier

**Hyperparameters:**
```python
{
    'objective': 'binary',
    'metric': 'auc',
    'num_leaves': 31,
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'verbose': -1
}
```

**Training Process:**
1. Load 7,500 synthetic interactions
2. Split: 80% train, 20% validation
3. Train for 100 boosting rounds
4. Early stopping (10 rounds patience)
5. Save model to `ml/models/lightgbm_model.txt`

#### **Model Performance**

| Metric | Score | Benchmark |
|--------|-------|-----------|
| **AUC-ROC** | 76.67% | Industry: 70-80% |
| **Precision@10** | 60% | Baseline: 10% |
| **NDCG@10** | 66.91% | Baseline: 54.2% |
| **Improvement** | +23.5% | Over rule-based |

**Confusion Matrix:**
```
                Predicted
              Positive  Negative
Actual Pos    1,125     375       (75% recall)
       Neg    450       1,050     (70% specificity)
```

### Feature Importance

**Top 10 Features:**
| Rank | Feature | Importance | Impact |
|------|---------|------------|--------|
| 1 | `skill_match_ratio` | 0.285 | 28.5% |
| 2 | `experience_difference` | 0.142 | 14.2% |
| 3 | `location_match` | 0.098 | 9.8% |
| 4 | `salary_fit` | 0.087 | 8.7% |
| 5 | `cv_total_skills` | 0.073 | 7.3% |
| 6 | `education_match` | 0.065 | 6.5% |
| 7 | `job_category_encoded` | 0.054 | 5.4% |
| 8 | `cv_technical_skills` | 0.048 | 4.8% |
| 9 | `job_salary_midpoint` | 0.041 | 4.1% |
| 10 | `cv_experience_years` | 0.037 | 3.7% |

---

## Performance Optimization

### Caching Strategy

#### **1. Service-Level Caching**
```python
# app/api/v1/recruiter_match_fast.py

matching_service_cache = {}

def get_cached_matching_service(db: Session):
    if 'service' not in matching_service_cache:
        matching_service_cache['service'] = EnhancedMatchingService(db)
    return matching_service_cache['service']
```

**Benefits:**
- Semantic model loaded once (saves 20-30s per request)
- Skill normalizer initialized once
- TF-IDF weights cached in memory

#### **2. Skill Weight Caching**
```python
# app/services/skill_rarity_calculator.py

class SkillRarityCalculator:
    def __init__(self):
        self.skill_weights_cache = {}
        self.cache_file = "skill_weights_cache.json"
        self._load_cache()
```

**Performance:**
- First calculation: ~5 seconds (2,500 CVs analyzed)
- Cached lookups: <0.001 seconds
- Cache hit rate: >95%

#### **3. Database Query Optimization**

**Before:**
```sql
-- N+1 query problem
SELECT * FROM cvs;  -- 2,500 queries
FOR EACH cv:
    SELECT * FROM jobs WHERE city = cv.city;
```

**After:**
```sql
-- Single query with strategic indexes
SELECT 
    cv.*, 
    j.job_id, 
    j.title, 
    j.required_skills
FROM cvs cv
LEFT JOIN jobs j ON (
    j.city = cv.city OR 
    j.province = cv.province
)
WHERE j.is_active = TRUE
ORDER BY cv.cv_id;
```

**Indexes Created:**
```sql
CREATE INDEX idx_cvs_location ON cvs(city, province);
CREATE INDEX idx_jobs_location ON jobs(city, province);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_skills_gin ON cvs USING gin(skills_technical, skills_soft);
```

### Response Time Analysis

| Operation | First Load | Cached | Improvement |
|-----------|------------|--------|-------------|
| Semantic model load | 30s | 0s | ∞ |
| Skill weight calculation | 5s | <0.01s | 500x |
| CV pre-filtering | 2s | 2s | 1x |
| Match computation | 18s | 6s | 3x |
| **Total** | **55s** | **8s** | **6.9x** |

### Scalability Considerations

#### **Current Capacity:**
- **CVs**: 2,500 (can scale to 50,000+)
- **Jobs**: 1,600 (can scale to 10,000+)
- **Concurrent requests**: 10-20 (single server)

#### **Scaling Strategies:**

1. **Horizontal Scaling** (Multiple servers)
   ```yaml
   # docker-compose.yml
   services:
     api-1:
       build: .
       ports: ["8001:8000"]
     api-2:
       build: .
       ports: ["8002:8000"]
     nginx:
       image: nginx
       ports: ["80:80"]
   ```

2. **Async Processing** (Background jobs)
   ```python
   from celery import Celery
   
   @celery.task
   def match_candidates_async(job_id):
       # Process in background
       pass
   ```

3. **Redis Caching** (Distributed cache)
   ```python
   import redis
   
   redis_client = redis.Redis(host='localhost', port=6379)
   redis_client.setex(f"match:{cv_id}", 300, json.dumps(matches))
   ```

---

## Deployment Guide

### Prerequisites
```bash
# Python 3.10+
python --version

# PostgreSQL 14+
psql --version

# Node.js 18+ (for frontend)
node --version
```

### Backend Setup

#### **1. Clone Repository**
```bash
git clone <repository-url>
cd ai-job-matchingV2/backend
```

#### **2. Create Virtual Environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### **3. Install Dependencies**
```bash
pip install -r requirements.txt

# Core packages:
pip install fastapi==0.104.0
pip install uvicorn==0.24.0
pip install sqlalchemy==2.0.23
pip install psycopg2-binary==2.9.9
pip install lightgbm==4.0.0
pip install sentence-transformers==2.2.2
pip install scikit-learn==1.3.2
pip install pandas==2.1.3
pip install numpy==1.24.4
```

#### **4. Database Setup**
```bash
# Create database
createdb job_match_db

# Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/job_match_db"

# Run migrations (if using Alembic)
alembic upgrade head

# Or load from backup
psql job_match_db < backup.sql
```

#### **5. Download ML Models**
```bash
# Sentence transformer model (auto-downloads on first run)
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

#### **6. Start Server**
```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Setup (Mobile)

#### **1. Install Dependencies**
```bash
cd ../frontend
npm install
# or
yarn install
```

#### **2. Configure API URL**
```typescript
// src/lib/api/client.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
```

#### **3. Start Development Server**
```bash
npx expo start

# Options:
# - Press 'a'