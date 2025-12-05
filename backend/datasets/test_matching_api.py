"""
CAMSS 2.0 - Manual Testing Script for Matching API
==================================================
Tests the matching service with sample data.

Usage:
    python test_matching_api.py
"""

import requests
import json
from pprint import pprint

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_URL = "http://localhost:8000"  # Adjust if your server runs on different port
API_PREFIX = "/api/v1/match"

# Sample CV IDs from your database
TEST_CV_IDS = ["1127", "1234", "2500"]  # Adjust these to actual CV IDs in your DB


# ============================================================================
# TEST FUNCTIONS
# ============================================================================

def test_health_check():
    """Test if matching service is up."""
    print("\n" + "=" * 70)
    print("TEST 1: Health Check")
    print("=" * 70)
    
    response = requests.get(f"{BASE_URL}{API_PREFIX}/health")
    print(f"Status Code: {response.status_code}")
    pprint(response.json())
    
    return response.status_code == 200


def test_quick_match(cv_id: str):
    """Test quick match endpoint."""
    print("\n" + "=" * 70)
    print(f"TEST 2: Quick Match for CV {cv_id}")
    print("=" * 70)
    
    response = requests.get(f"{BASE_URL}{API_PREFIX}/candidate/{cv_id}/quick")
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nCandidate: {data['candidate_name']}")
        print(f"Location: {data['candidate_location']}")
        print(f"Total Matches Found: {data['total_matches']}")
        print(f"Returning Top: {len(data['matches'])}")
        
        if data['matches']:
            print("\nTop 3 Matches:")
            for match in data['matches'][:3]:
                print(f"\n  Rank {match['rank']}: {match['title']} at {match['company']}")
                print(f"  Match Score: {match['match_score']:.3f}")
                print(f"  Location: {match.get('location_city', 'N/A')}")
                print(f"  Salary/Budget: ZMW {match.get('salary_max_zmw', match.get('budget', 'N/A'))}")
                print(f"  Reasons: {', '.join(match['match_reasons'][:2])}")
                print(f"  Matched Skills: {', '.join(match['matched_skills'][:5])}")
                if match['missing_skills']:
                    print(f"  Missing Skills: {', '.join(match['missing_skills'][:3])}")
        
        return True
    else:
        print(f"Error: {response.json()}")
        return False


def test_filtered_match(cv_id: str):
    """Test filtered match endpoint."""
    print("\n" + "=" * 70)
    print(f"TEST 3: Filtered Match (Lusaka, min_score=0.5)")
    print("=" * 70)
    
    params = {
        'job_type': 'corp',
        'limit': 10,
        'min_score': 0.5,
        'location_city': 'Lusaka'
    }
    
    response = requests.get(
        f"{BASE_URL}{API_PREFIX}/candidate/{cv_id}/filtered",
        params=params
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nTotal Matches Found: {data['total_matches']}")
        print(f"Filters Applied: {data['filters_applied']}")
        
        if data['matches']:
            print(f"\nTop 5 Matches:")
            for match in data['matches'][:5]:
                print(f"  {match['rank']}. {match['title']} - Score: {match['match_score']:.3f}")
        
        return True
    else:
        print(f"Error: {response.json()}")
        return False


def test_custom_match(cv_id: str):
    """Test custom match with POST request."""
    print("\n" + "=" * 70)
    print(f"TEST 4: Custom Match (POST request)")
    print("=" * 70)
    
    payload = {
        "job_type": "both",
        "limit": 15,
        "min_score": 0.4,
        "filters": {
            "min_salary": 5000
        }
    }
    
    response = requests.post(
        f"{BASE_URL}{API_PREFIX}/candidate/{cv_id}",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nTotal Matches: {data['total_matches']}")
        
        # Analyze score distribution
        if data['matches']:
            scores = [m['match_score'] for m in data['matches']]
            print(f"Score Range: {min(scores):.3f} - {max(scores):.3f}")
            print(f"Average Score: {sum(scores)/len(scores):.3f}")
            
            # Count by job type
            corp_count = sum(1 for m in data['matches'] if m['job_type'] == 'corp')
            small_count = sum(1 for m in data['matches'] if m['job_type'] == 'small')
            print(f"\nJob Types: {corp_count} Corporate, {small_count} Small")
        
        return True
    else:
        print(f"Error: {response.json()}")
        return False


def test_nonexistent_cv():
    """Test error handling for non-existent CV."""
    print("\n" + "=" * 70)
    print("TEST 5: Error Handling (Non-existent CV)")
    print("=" * 70)
    
    response = requests.get(f"{BASE_URL}{API_PREFIX}/candidate/FAKE_ID/quick")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 404


# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def run_all_tests():
    """Run all test cases."""
    print("\n" + "=" * 70)
    print("CAMSS 2.0 - MATCHING API TEST SUITE")
    print("=" * 70)
    print(f"Testing against: {BASE_URL}{API_PREFIX}")
    print()
    
    results = []
    
    # Test 1: Health Check
    results.append(("Health Check", test_health_check()))
    
    # Test 2-4: Use first available CV ID
    if TEST_CV_IDS:
        test_cv = TEST_CV_IDS[0]
        results.append((f"Quick Match (CV {test_cv})", test_quick_match(test_cv)))
        results.append((f"Filtered Match (CV {test_cv})", test_filtered_match(test_cv)))
        results.append((f"Custom Match (CV {test_cv})", test_custom_match(test_cv)))
    else:
        print("\n⚠️ No test CV IDs configured. Update TEST_CV_IDS in script.")
    
    # Test 5: Error handling
    results.append(("Error Handling", test_nonexistent_cv()))
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 70)
    
    return passed == total


if __name__ == "__main__":
    try:
        all_passed = run_all_tests()
        exit(0 if all_passed else 1)
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server")
        print(f"   Make sure FastAPI server is running on {BASE_URL}")
        print("   Start it with: uvicorn app.main:app --reload")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
