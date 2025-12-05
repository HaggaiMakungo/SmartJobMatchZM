"""
Quick test to verify Brian Mwale gets job matches
Run this after restarting the backend
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.matching_service import MatchingService

def test_brian_matches():
    """Test that Brian Mwale gets corporate job matches"""
    
    print("=" * 60)
    print("TESTING BRIAN MWALE JOB MATCHES")
    print("=" * 60)
    
    # Initialize matching service
    matcher = MatchingService()
    
    # Brian's CV ID from database
    brian_cv_id = "CV000004"
    
    print(f"\n1. Fetching CV for {brian_cv_id}...")
    cv = matcher.get_cv(brian_cv_id)
    
    if not cv:
        print("❌ ERROR: Could not fetch Brian's CV from database")
        print("   Check database connection and that CV exists")
        return False
    
    print(f"✅ Found CV: {cv.get('full_name')}")
    print(f"   Email: {cv.get('email')}")
    print(f"   Experience: {cv.get('total_years_experience')} years")
    print(f"   Education: {cv.get('education_level')}")
    print(f"   Location: {cv.get('city')}, {cv.get('province')}")
    
    print(f"\n2. Finding corporate job matches...")
    matches = matcher.get_corp_matches(brian_cv_id, limit=10, min_score=0.3)
    
    if not matches:
        print("❌ No matches found")
        print("   This could mean:")
        print("   - No jobs in database")
        print("   - Scoring thresholds too high")
        print("   - Database connection issues")
        return False
    
    print(f"✅ Found {len(matches)} matches!\n")
    
    # Show top 5 matches
    print("=" * 60)
    print("TOP 5 MATCHES")
    print("=" * 60)
    
    for i, match in enumerate(matches[:5], 1):
        print(f"\n{i}. {match['title']} at {match['company']}")
        print(f"   Match Score: {match['final_score']:.1%}")
        print(f"   Location: {match['location']}")
        print(f"   Salary: {match['salary_range']}")
        print(f"   Category: {match['category']}")
        print(f"\n   Component Scores:")
        for component, score in match['component_scores'].items():
            print(f"   - {component.title()}: {score:.1%}")
        print(f"\n   Why it matches: {match['explanation']}")
    
    print("\n" + "=" * 60)
    print("✅ SUCCESS! Brian will see personalized matches!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        success = test_brian_matches()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
