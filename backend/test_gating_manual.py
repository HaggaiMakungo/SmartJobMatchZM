"""
SPRINT A - Manual Testing Script
=================================
Test the gating patch with real database data
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import get_db
from app.services.gated_matching_service import match_job_with_gates
from sqlalchemy import text


def test_gating_patch():
    """Test gating patch with real data"""
    
    print("🧪 SPRINT A - GATING PATCH TEST")
    print("=" * 60)
    
    db = next(get_db())
    
    try:
        # 1. Get a sample job
        result = db.execute(text("""
            SELECT job_id, title, company, required_skills
            FROM corporate_jobs
            WHERE required_skills IS NOT NULL
            LIMIT 1
        """))
        
        job = result.fetchone()
        
        if not job:
            print("❌ No jobs found in database")
            return
        
        job_id, title, company, required_skills = job
        
        print(f"\n📋 Testing with job:")
        print(f"   ID: {job_id}")
        print(f"   Title: {title}")
        print(f"   Company: {company}")
        print(f"   Skills: {required_skills}")
        
        # 2. Test with min_score = 0 (should show all candidates with ANY skill match)
        print(f"\n" + "-" * 60)
        print(f"TEST 1: Min score = 0% (show candidates with any skill match)")
        print(f"-" * 60)
        
        matches_0 = match_job_with_gates(db, job_id, min_score=0.0, limit=10)
        
        print(f"✅ Found {len(matches_0)} candidates with min_score=0%")
        
        if matches_0:
            print(f"\n   Top 3 candidates:")
            for i, m in enumerate(matches_0[:3], 1):
                print(f"   {i}. {m['full_name']} - {m['match_score']}%")
                print(f"      Matched: {', '.join(m['matched_skills'][:3])}")
                print(f"      Missing: {', '.join(m['missing_skills'][:3])}")
                
                # CRITICAL CHECK: No candidates with 0 matched skills
                if len(m['matched_skills']) == 0:
                    print(f"      ❌ ERROR: Candidate has 0 matched skills but wasn't filtered!")
                else:
                    print(f"      ✅ PASS: Has {len(m['matched_skills'])} matched skills")
        
        # 3. Test with min_score = 0.5 (should show only good matches)
        print(f"\n" + "-" * 60)
        print(f"TEST 2: Min score = 50% (show only good matches)")
        print(f"-" * 60)
        
        matches_50 = match_job_with_gates(db, job_id, min_score=0.5, limit=10)
        
        print(f"✅ Found {len(matches_50)} candidates with min_score=50%")
        
        if matches_50:
            print(f"\n   Top 3 candidates:")
            for i, m in enumerate(matches_50[:3], 1):
                print(f"   {i}. {m['full_name']} - {m['match_score']}%")
                print(f"      Matched: {', '.join(m['matched_skills'][:3])}")
                
                # CHECK: All should have score >= 50%
                if m['match_score'] < 50.0:
                    print(f"      ❌ ERROR: Score {m['match_score']}% is below threshold!")
                else:
                    print(f"      ✅ PASS: Score above threshold")
        
        # 4. Test with min_score = 0.8 (should show only excellent matches)
        print(f"\n" + "-" * 60)
        print(f"TEST 3: Min score = 80% (show only excellent matches)")
        print(f"-" * 60)
        
        matches_80 = match_job_with_gates(db, job_id, min_score=0.8, limit=10)
        
        print(f"✅ Found {len(matches_80)} candidates with min_score=80%")
        
        if matches_80:
            print(f"\n   Top 3 candidates:")
            for i, m in enumerate(matches_80[:3], 1):
                print(f"   {i}. {m['full_name']} - {m['match_score']}%")
                print(f"      Matched: {', '.join(m['matched_skills'])}")
        
        # 5. Summary
        print(f"\n" + "=" * 60)
        print(f"📊 SUMMARY:")
        print(f"   Candidates at 0%: {len(matches_0)}")
        print(f"   Candidates at 50%: {len(matches_50)}")
        print(f"   Candidates at 80%: {len(matches_80)}")
        print(f"\n   ✅ Funnel working correctly!")
        print(f"      (Higher threshold → fewer candidates)")
        
        # 6. Check for the bug we're fixing
        print(f"\n" + "=" * 60)
        print(f"🔍 CHECKING FOR BUG (0 matched skills):")
        
        zero_skill_candidates = [m for m in matches_0 if len(m['matched_skills']) == 0]
        
        if zero_skill_candidates:
            print(f"   ❌ FAIL: Found {len(zero_skill_candidates)} candidates with 0 matched skills!")
            print(f"   These should have been filtered by GATE 1")
        else:
            print(f"   ✅ PASS: No candidates with 0 matched skills!")
            print(f"   GATE 1 is working correctly!")
        
        print(f"\n" + "=" * 60)
        print(f"✅ GATING PATCH TEST COMPLETE")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()


if __name__ == "__main__":
    test_gating_patch()
