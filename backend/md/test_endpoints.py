"""
Quick test to diagnose which endpoints are failing and why
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Brian's credentials
email = "brian.mwale@email.com"
password = "Brian123"

print("🔐 Logging in as Brian...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    data={"username": email, "password": password}
)

if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print(f"✅ Login successful! Token: {token[:20]}...")

# Test each endpoint
endpoints = [
    ("GET", "/candidate/profile/me", "Profile"),
    ("GET", "/candidate/saved-jobs", "Saved Jobs"),
    ("GET", "/candidate/applications", "Applications"),
    ("GET", "/match/ai/jobs", "AI Matches"),
]

for method, endpoint, name in endpoints:
    print(f"\n{'='*60}")
    print(f"Testing: {name} ({method} {endpoint})")
    print(f"{'='*60}")
    
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json={})
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ SUCCESS")
            data = response.json()
            print(f"Response type: {type(data)}")
            if isinstance(data, dict):
                print(f"Keys: {list(data.keys())}")
            elif isinstance(data, list):
                print(f"List length: {len(data)}")
            print(f"Sample: {json.dumps(data, indent=2)[:500]}...")
        else:
            print(f"❌ FAILED")
            print(f"Error: {response.text[:500]}")
    
    except Exception as e:
        print(f"💥 EXCEPTION: {e}")

print(f"\n{'='*60}")
print("Test complete!")
print(f"{'='*60}")
