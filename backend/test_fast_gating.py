"""
SPRINT A - FAST GATING TEST
============================
Tests the fast gated matching service (exact matching, no semantic AI)
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.services.fast_gated_matching_service import match_job_with_fast_gates

def test_fast_gating():
    """Test fast gated matching"""
    
    print("🧪 SPRINT A - FAST GATING TEST")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Test with Zambia Daily Mail Photographer job
        job_id = "JOB000070"
        
        # Get job details for display
        from app.models.corporate_job import CorporateJob
        job = db.query(CorporateJob).filter(CorporateJob.job_id == job_id).first()
        
        print(f"\n📋 Testing with job:")
        print(f"   ID: {job_id}")
        print(f"   Title: {job.title}")
        print(f"   Company: {job.company}")
        
        # Extract skills for display
        skills = []
        if job.required_skills:
            skills.extend([s.strip() for s in job.required_skills.split(',')][:3])
        if job.preferred_skills and len(skills) < 3:
            skills.extend([s.strip() for s in job.preferred_skills.split(',')][:3-len(skills)])
        
        print(f"   Skills: {', '.join(skills[:3])}")
        
        # Test with min_score = 0 (show all matches)
        print("\n" + "-" * 60)
        print("TEST 1: Min score = 0% (show candidates with any skill match)")
        print("-" * 60)
        print("✅ Using FAST EXACT MATCHING (no semantic AI)")
        print()
        
        candidates = match_job_with_fast_gates(
            db=db,
            job_id=job_id,
            min_score=0.0,
            limit=100
        )
        
        print(f"\n✅ Found {len(candidates)} candidates")
        
        if candidates:
            print("\n   Top 5 candidates:")
            for i, candidate in enumerate(candidates[:5], 1):
                skills_str = ', '.join(candidate['matched_skills'][:3])
                print(f"   {i}. {candidate['full_name']} ({candidate['match_score']}%) - {skills_str}")
        
        # Verification
        print("\n" + "=" * 60)
        print("VERIFICATION")
        print("=" * 60)
        
        # Check no 0-skill matches
        zero_skill_matches = [c for c in candidates if len(c['matched_skills']) == 0]
        if len(zero_skill_matches) == 0:
            print("✅ PASS: No candidates with 0 matched skills!")
        else:
            print(f"❌ FAIL: Found {len(zero_skill_matches)} candidates with 0 matched skills")
        
        # Check all above threshold
        below_threshold = [c for c in candidates if c['match_score'] < 0]
        if len(below_threshold) == 0:
            print("✅ PASS: All candidates >= 0% threshold!")
        else:
            print(f"❌ FAIL: Found {len(below_threshold)} candidates below threshold")
        
        print("\n✅ FAST GATING TEST COMPLETE")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_fast_gating()
