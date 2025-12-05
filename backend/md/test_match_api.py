"""
Test the match API endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

print("=" * 80)
print("TESTING MATCH API")
print("=" * 80)

# Test 1: Health check
print("\n[1] Testing health endpoint...")
try:
    response = requests.get("http://localhost:8000/health")
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 2: Test matching endpoint
print("\n[2] Testing match test endpoint...")
try:
    response = requests.get(f"{BASE_URL}/match/test")
    print(f"  Status: {response.status_code}")
    print(f"  Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 3: Get matches for CV #1
print("\n[3] Testing corporate job matching...")
try:
    payload = {
        "cv_id": "1",
        "job_type": "corporate",
        "limit": 5,
        "min_score": 0.3
    }
    response = requests.post(f"{BASE_URL}/match", json=payload)
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"  CV: {data['cv_name']}")
        print(f"  Total Matches: {data['total']}")
        print(f"  Execution Time: {data['execution_time_ms']}ms")
        print(f"\n  Top 3 Matches:")
        for i, match in enumerate(data['matches'][:3], 1):
            print(f"\n  {i}. {match['title']} at {match.get('company', 'N/A')}")
            print(f"     Score: {match['final_score']:.2%}")
            print(f"     Location: {match['location']}")
    else:
        print(f"  ✗ Error: {response.json()}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 4: Get matches for small jobs
print("\n[4] Testing small job matching...")
try:
    payload = {
        "cv_id": "10",
        "job_type": "small",
        "limit": 5,
        "min_score": 0.2
    }
    response = requests.post(f"{BASE_URL}/match", json=payload)
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"  CV: {data['cv_name']}")
        print(f"  Total Matches: {data['total']}")
        print(f"  Execution Time: {data['execution_time_ms']}ms")
    else:
        print(f"  ✗ Error: {response.json()}")
except Exception as e:
    print(f"  ✗ Error: {e}")

print("\n" + "=" * 80)
print("✓ API Testing Complete!")
print("=" * 80)
