from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import (
    auth, jobs, match, cv, candidate, employer, application, 
    ml_match, corporate, recruiter_match_fast, recruiter_match_optimized, 
    recruiter_match_cached, recruiter_match_gated, saved_candidates, recruiter_semantic
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
def root():
    return {
        "message": "SmartJobMatchZM API",
        "version": settings.VERSION,
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(jobs.router, prefix=settings.API_V1_STR, tags=["jobs"])
app.include_router(match.router, prefix=f"{settings.API_V1_STR}/match", tags=["match"])
app.include_router(ml_match.router, prefix=f"{settings.API_V1_STR}", tags=["ml-matching"])
app.include_router(cv.router, prefix=f"{settings.API_V1_STR}/cv", tags=["cv"])
app.include_router(candidate.router, prefix=settings.API_V1_STR, tags=["candidate"])
app.include_router(employer.router, prefix=settings.API_V1_STR, tags=["employer"])
app.include_router(application.router, prefix=settings.API_V1_STR, tags=["applications"])
app.include_router(corporate.router, prefix=f"{settings.API_V1_STR}/corporate", tags=["corporate"])

# Recruiter matching endpoints (5 versions)
app.include_router(recruiter_semantic.router, prefix=f"{settings.API_V1_STR}/recruiter/semantic", tags=["recruiter-matching-semantic"])  # 🚀 SPRINT B (SEMANTIC - PRODUCTION)
app.include_router(recruiter_match_gated.router, prefix=f"{settings.API_V1_STR}/recruiter/gated", tags=["recruiter-matching-gated"])  # 🔥 SPRINT A (GATED - QUALITY FOCUSED)
app.include_router(recruiter_match_cached.router, prefix=f"{settings.API_V1_STR}", tags=["recruiter-matching-cached"])  # ⚡⚡⚡ PRE-COMPUTED (FASTEST - <100ms)
app.include_router(recruiter_match_optimized.router, prefix=f"{settings.API_V1_STR}/recruiter/optimized", tags=["recruiter-matching-optimized"])  # ⚡⚡ OPTIMIZED (2-3s)
app.include_router(recruiter_match_fast.router, prefix=f"{settings.API_V1_STR}/recruiter", tags=["recruiter-matching-fast"])  # ⚡ ORIGINAL (8-10s)

app.include_router(saved_candidates.router, tags=["saved-candidates"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
