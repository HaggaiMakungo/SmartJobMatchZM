# SmartJobMatchZM Backend - Complete Setup Guide

## 📁 Project Structure Created

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependencies (auth, db)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py        # Login endpoint
│   │       ├── jobs.py        # Job listings
│   │       ├── match.py       # AI matching
│   │       └── cv.py          # CV management
│   │
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py          # Settings class
│   │   └── security.py        # JWT, password hashing
│   │
│   ├── db/                     # Database
│   │   ├── __init__.py
│   │   ├── base.py            # Imports all models
│   │   └── session.py         # DB connection
│   │
│   ├── models/                 # SQLAlchemy models
│   │   └── __init__.py        # (models coming next)
│   │
│   ├── schemas/                # Pydantic schemas
│   │   └── __init__.py        # (schemas coming next)
│   │
│   ├── services/               # Business logic
│   │   └── __init__.py        # (services coming next)
│   │
│   └── ml/                     # Matching engine
│       └── __init__.py        # (ML code coming next)
│
├── tests/
│   └── __init__.py
│
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── Learnings.md              # Your notes file
```

## 🚀 Setup Instructions

### Step 1: Create Virtual Environment

```bash
cd C:\Dev\ai-job-matchingV2\backend
python -m venv venv
venv\Scripts\activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- SQLAlchemy (ORM)
- PostgreSQL driver
- JWT authentication
- ML libraries (sentence-transformers)

### Step 3: Configure Environment

```bash
# Copy the example environment file
copy .env.example .env

# Edit .env with your settings (already has good defaults)
```

Your `.env` should have:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/job_match_db
SECRET_KEY=your-secret-key-here
```

### Step 4: Test the Server

```bash
# From backend/ directory
python -m app.main
```

Or:
```bash
uvicorn app.main:app --reload
```

Visit:
- http://localhost:8000 → Should see welcome message
- http://localhost:8000/health → Should see {"status": "healthy"}
- http://localhost:8000/docs → Interactive API docs (Swagger)

## 🎯 What We Built

### 1. Main Application (app/main.py)
- FastAPI app initialization
- CORS middleware for frontend
- Health check endpoints
- Router registration (auth, jobs, match, cv)

### 2. Configuration (app/core/config.py)
- Environment-based settings
- Database URL
- JWT settings
- CAMSS weights
- ML model config

Uses pydantic_settings for type-safe config management.

### 3. Security (app/core/security.py)
- Password hashing (bcrypt)
- JWT token creation
- Token verification
- Secure by default

### 4. Database (app/db/session.py)
- SQLAlchemy engine setup
- Session management
- get_db() dependency for routes

### 5. API Dependencies (app/api/deps.py)
- get_current_user() → Extracts user from JWT
- Automatic authentication for protected routes

### 6. API Routes (app/api/v1/)
All routes are stubbed with TODOs:
- **auth.py**: Login endpoint (functional), register (TODO)
- **jobs.py**: Job listings (TODO)
- **match.py**: AI matching (TODO)
- **cv.py**: CV management (TODO)

## 🔑 How It Works

### Authentication Flow:
```
1. User sends email + password to POST /api/auth/login
2. Server verifies credentials
3. Server creates JWT token with user ID
4. Client stores token
5. Client sends token in Authorization header for protected routes
6. get_current_user() dependency validates token and returns User
```

### Dependency Injection Pattern:
```python
@router.get("/match/jobs")
def get_matched_jobs(
    current_user: User = Depends(get_current_user),  # Auto-authenticated
    db: Session = Depends(get_db)                     # Auto-injected DB
):
    # current_user is already validated
    # db is ready to use
    pass
```

### Configuration Pattern:
```python
# All settings in one place
from app.core.config import settings

# Use anywhere
database_url = settings.DATABASE_URL
secret_key = settings.SECRET_KEY
```

## 📝 Next Steps

### Phase 2: Database Models (Next Session)
You'll create:
- `app/models/user.py`
- `app/models/cv.py`
- `app/models/education.py`
- `app/models/skill.py`
- `app/models/job_experience.py`
- `app/models/corporate_job.py`
- `app/models/personal_job.py`

### Phase 3: Schemas (Pydantic)
For request/response validation:
- `app/schemas/user.py`
- `app/schemas/cv.py`
- `app/schemas/job.py`
- `app/schemas/match.py`

### Phase 4: Matching Engine
The AI magic:
- `app/ml/matching_engine.py`
- `app/ml/skills_matcher.py`

### Phase 5: Services
Business logic layer:
- `app/services/auth_service.py`
- `app/services/job_service.py`
- `app/services/cv_service.py`

## ⚠️ Important Notes

### Database
- Assumes PostgreSQL is running on localhost:5432
- Database `job_match_db` should already exist
- Tables will be created in Phase 2 with Alembic

### Security
- SECRET_KEY in .env is for development only
- Generate production key: `openssl rand -hex 32`
- Never commit .env to Git

### CORS
- Currently allows localhost:3000 and localhost:5173
- Adjust in config.py for your frontend URLs

## 🧪 Testing the Setup

### Test Health Check:
```bash
curl http://localhost:8000/health
```

### Test API Docs:
Open browser: http://localhost:8000/docs

You should see all endpoints listed:
- POST /api/auth/login
- GET /api/jobs/all
- GET /api/match/jobs
- GET /api/cv/me

### Test Login (after models are created):
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"
```

## 🎓 Architecture Principles Used

1. **Separation of Concerns**
   - API layer (routes)
   - Business logic (services)
   - Data access (models)
   - ML/AI (ml/)

2. **Dependency Injection**
   - Database sessions injected
   - Current user injected
   - Easy to test and mock

3. **Configuration Management**
   - All settings in one place
   - Environment-based
   - Type-safe with Pydantic

4. **Security First**
   - JWT authentication
   - Password hashing
   - Protected routes by default

5. **Clean Code**
   - Type hints everywhere
   - Clear naming
   - Single responsibility

## 🚨 Common Issues

### "Module not found"
Make sure virtual environment is activated:
```bash
venv\Scripts\activate
```

### "Database connection failed"
Check PostgreSQL is running and credentials in .env are correct.

### "Port 8000 already in use"
Kill the process or use different port:
```bash
uvicorn app.main:app --reload --port 8001
```

## ✅ Checklist

- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] .env file created and configured
- [ ] Server starts without errors
- [ ] Health check works (http://localhost:8000/health)
- [ ] API docs accessible (http://localhost:8000/docs)
- [ ] Ready for Phase 2: Database Models

## 📚 Resources

- FastAPI Docs: https://fastapi.tiangolo.com
- SQLAlchemy Docs: https://docs.sqlalchemy.org
- Pydantic Docs: https://docs.pydantic.dev
- JWT: https://jwt.io

---

**Status**: ✅ Phase 1 Complete - Foundation Ready
**Next**: Database Models & Alembic Setup
**Time to complete**: ~30 minutes
