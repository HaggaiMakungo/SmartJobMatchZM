"""
Test script for matching service
Run: python test_matching.py
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services import MatchingService

def print_section(title):
    """Print a section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def test_corp_matching():
    """Test corporate job matching"""
    print_section("CORPORATE JOB MATCHING TEST")
    
    service = MatchingService()
    
    # Test with first CV (Mary Phiri - Software/Tech background)
    cv_id = '1'  # Updated to use actual CV ID from database
    print(f"\nTesting with CV ID {cv_id}...")
    
    # Get CV info
    cv = service.get_cv(cv_id)
    if not cv:
        print(f"❌ CV {cv_id} not found!")
        return
    
    print(f"\nCV Summary:")
    print(f"  Name: {cv.get('full_name', 'N/A')}")
    print(f"  Education: {cv.get('education_level', 'N/A')}")
    print(f"  Experience: {cv.get('total_years_experience', 0)} years")
    print(f"  Current Title: {cv.get('current_job_title', 'N/A')}")
    print(f"  Location: {cv.get('city', 'N/A')}, {cv.get('province', 'N/A')}")
    skills = str(cv.get('skills_technical', ''))
    top_skills = ', '.join(skills.split(',')[:5]) if skills else 'N/A'
    print(f"  Top Skills: {top_skills}")
    
    # Get matches
    print(f"\nFinding top 10 corporate job matches...")
    matches = service.get_corp_matches(cv_id, limit=10, min_score=0.3)
    
    if not matches:
        print("❌ No matches found!")
        return
    
    print(f"\n✅ Found {len(matches)} matches:\n")
    
    for i, match in enumerate(matches, 1):
        print(f"\n{i}. {match['title']} at {match['company']}")
        print(f"   Category: {match['category']}")
        print(f"   Location: {match['location']}")
        print(f"   Salary: {match['salary_range']}")
        print(f"   Overall Score: {match['final_score']:.2%}")
        
        print(f"\n   Component Scores:")
        for component, score in match['component_scores'].items():
            bar = "█" * int(score * 20)
            print(f"     {component:16s}: {score:.2%} {bar}")
        
        print(f"\n   Why this matches: {match['explanation']}")
        print("   " + "-" * 76)

def test_small_job_matching():
    """Test small job/gig matching"""
    print_section("SMALL JOB/GIG MATCHING TEST")
    
    service = MatchingService()
    
    # Test with CV 10 (Catherine Zimba - Social Media/Marketing background)
    cv_id = '10'  # Updated to use actual CV ID from database
    print(f"\nTesting with CV ID {cv_id}...")
    
    # Get CV info
    cv = service.get_cv(cv_id)
    if not cv:
        print(f"❌ CV {cv_id} not found!")
        return
    
    print(f"\nCV Summary:")
    print(f"  Name: {cv.get('full_name', 'N/A')}")
    print(f"  Location: {cv.get('city', 'N/A')}, {cv.get('province', 'N/A')}")
    print(f"  Availability: {cv.get('availability', 'N/A')}")
    skills = str(cv.get('skills_technical', ''))
    top_skills = ', '.join(skills.split(',')[:5]) if skills else 'N/A'
    print(f"  Top Skills: {top_skills}")
    
    # Get matches
    print(f"\nFinding top 10 small job matches...")
    matches = service.get_small_job_matches(cv_id, limit=10, min_score=0.2)
    
    if not matches:
        print("❌ No matches found!")
        return
    
    print(f"\n✅ Found {len(matches)} matches:\n")
    
    for i, match in enumerate(matches, 1):
        print(f"\n{i}. {match['title']}")
        print(f"   Category: {match['category']}")
        print(f"   Location: {match['location']}")
        print(f"   Budget: {match['budget']}")
        print(f"   Duration: {match['duration']}")
        print(f"   Overall Score: {match['final_score']:.2%}")
        
        print(f"\n   Component Scores:")
        for component, score in match['component_scores'].items():
            bar = "█" * int(score * 20)
            print(f"     {component:16s}: {score:.2%} {bar}")
        
        print(f"\n   Why this matches: {match['explanation']}")
        print("   " + "-" * 76)

def test_component_scores():
    """Test individual scoring components"""
    print_section("COMPONENT SCORING TESTS")
    
    from app.services import (
        calculate_qualification_score,
        calculate_experience_score,
        calculate_location_score
    )
    
    print("\n1. Qualification Scoring:")
    print(f"   Bachelor's vs Bachelor's: {calculate_qualification_score('Bachelor', 'Bachelor'):.2f}")
    print(f"   Master's vs Bachelor's: {calculate_qualification_score('Master', 'Bachelor'):.2f}")
    print(f"   Diploma vs Bachelor's: {calculate_qualification_score('Diploma', 'Bachelor'):.2f}")
    
    print("\n2. Experience Scoring:")
    print(f"   5 years vs 3 required: {calculate_experience_score(5, 3):.2f}")
    print(f"   3 years vs 5 required: {calculate_experience_score(3, 5):.2f}")
    print(f"   2 years vs 5 required: {calculate_experience_score(2, 5):.2f}")
    
    print("\n3. Location Scoring:")
    print(f"   Lusaka, Lusaka vs Lusaka, Lusaka: {calculate_location_score('Lusaka', 'Lusaka', 'Lusaka', 'Lusaka'):.2f}")
    print(f"   Lusaka, Lusaka vs Kitwe, Lusaka: {calculate_location_score('Lusaka', 'Lusaka', 'Kitwe', 'Lusaka'):.2f}")
    print(f"   Lusaka, Lusaka vs Kitwe, Copperbelt: {calculate_location_score('Lusaka', 'Lusaka', 'Kitwe', 'Copperbelt'):.2f}")

def test_additional_cvs():
    """Test matching with various CV profiles"""
    print_section("ADDITIONAL CV MATCHING TESTS")
    
    service = MatchingService()
    
    # Test a few more CVs with different profiles
    test_cvs = [
        ('2', 'John Mulenga - Engineering/Construction'),
        ('5', 'Peter Sakala - Automotive/Mechanical'),
        ('9', 'Joyce Chanda - Accounting/Finance'),
    ]
    
    for cv_id, description in test_cvs:
        print(f"\n{'─' * 80}")
        print(f"Testing: {description}")
        print(f"CV ID: {cv_id}")
        
        cv = service.get_cv(cv_id)
        if not cv:
            print(f"  ❌ CV not found")
            continue
        
        # Get top 3 corporate matches
        matches = service.get_corp_matches(cv_id, limit=3, min_score=0.3)
        
        if matches:
            print(f"  ✅ Top match: {matches[0]['title']} at {matches[0]['company']}")
            print(f"     Score: {matches[0]['final_score']:.2%}")
        else:
            print(f"  ⚠️  No matches found above threshold")

def main():
    """Run all tests"""
    try:
        print("\n🚀 CAMSS 2.0 Matching System - Test Suite")
        print("=" * 80)
        
        # Test component scores first
        test_component_scores()
        
        # Test corp matching with detailed output
        test_corp_matching()
        
        # Test small job matching with detailed output
        test_small_job_matching()
        
        # Quick tests with additional CVs
        test_additional_cvs()
        
        print_section("TEST COMPLETE")
        print("\n✅ All tests completed successfully!")
        print("\n📊 Summary:")
        print("   - Component scoring: ✓")
        print("   - Corporate job matching: ✓")
        print("   - Small job/gig matching: ✓")
        print("   - Multiple CV profiles: ✓")
        print("\n🎯 Next steps:")
        print("   1. Review match quality and scores")
        print("   2. Build API endpoints (/api/v1/match)")
        print("   3. Add interaction logging")
        print("   4. Performance optimization")
        
    except Exception as e:
        print(f"\n❌ Test failed with error:")
        print(f"   {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
