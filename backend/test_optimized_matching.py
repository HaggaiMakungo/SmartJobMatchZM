"""
Test the optimized matching endpoint performance
"""
import requests
import time
import json

API_BASE = "http://localhost:8000/api"

def test_optimized_matching(job_id: str, company_email: str, password: str = "password123"):
    """Test the optimized matching endpoint"""
    
    # Login first
    print(f"\n🔐 Logging in as {company_email}...")
    login_response = requests.post(f"{API_BASE}/auth/login", json={
        "email": company_email,
        "password": password
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: First request (should be slow - ~2-3s)
    print(f"\n🚀 Test 1: FIRST REQUEST (not cached)")
    print("=" * 60)
    start = time.time()
    
    response = requests.get(
        f"{API_BASE}/recruiter/optimized/job/{job_id}/candidates",
        headers=headers,
        params={
            "limit": 20,
            "min_score": 0.0,
            "use_cache": True
        }
    )
    
    elapsed1 = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success!")
        print(f"   Candidates found: {data['total_candidates']}")
        print(f"   Processing time: {elapsed1:.2f}s")
        print(f"   From cache: {data.get('from_cache', False)}")
        print(f"   Optimizations: {', '.join(data.get('optimizations_applied', []))}")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return
    
    # Test 2: Second request (should be instant - <100ms)
    print(f"\n⚡ Test 2: SECOND REQUEST (cached)")
    print("=" * 60)
    time.sleep(0.5)  # Small delay
    
    start = time.time()
    
    response = requests.get(
        f"{API_BASE}/recruiter/optimized/job/{job_id}/candidates",
        headers=headers,
        params={
            "limit": 20,
            "min_score": 0.0,
            "use_cache": True
        }
    )
    
    elapsed2 = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success!")
        print(f"   Candidates found: {data['total_candidates']}")
        print(f"   Processing time: {elapsed2:.2f}s ({elapsed2*1000:.0f}ms)")
        print(f"   From cache: {data.get('from_cache', False)}")
        
        # Calculate speedup
        speedup = elapsed1 / elapsed2 if elapsed2 > 0 else 0
        print(f"\n🎯 SPEEDUP: {speedup:.1f}x faster!")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return
    
    # Test 3: Without cache
    print(f"\n🔄 Test 3: WITHOUT CACHE (forced recompute)")
    print("=" * 60)
    
    start = time.time()
    
    response = requests.get(
        f"{API_BASE}/recruiter/optimized/job/{job_id}/candidates",
        headers=headers,
        params={
            "limit": 20,
            "min_score": 0.0,
            "use_cache": False  # Force recompute
        }
    )
    
    elapsed3 = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success!")
        print(f"   Candidates found: {data['total_candidates']}")
        print(f"   Processing time: {elapsed3:.2f}s")
        print(f"   From cache: {data.get('from_cache', False)}")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
    
    # Summary
    print(f"\n📊 PERFORMANCE SUMMARY")
    print("=" * 60)
    print(f"   First request:     {elapsed1:.2f}s")
    print(f"   Cached request:    {elapsed2:.2f}s ({elapsed2*1000:.0f}ms)")
    print(f"   Without cache:     {elapsed3:.2f}s")
    print(f"   Cache speedup:     {speedup:.1f}x faster")
    
    if elapsed1 < 5.0:
        print(f"\n✅ OPTIMIZATION SUCCESS! Target: <5s, Actual: {elapsed1:.2f}s")
    else:
        print(f"\n⚠️  Still slow. Target: <5s, Actual: {elapsed1:.2f}s")


if __name__ == "__main__":
    # Test with DHL's first job
    print("🧪 TESTING OPTIMIZED MATCHING ENDPOINT")
    print("=" * 60)
    
    # You'll need to find a real job_id from your database
    # Example: DHL's Driver job
    test_optimized_matching(
        job_id="DHL_001",  # Replace with actual job_id
        company_email="dhl@company.zm"
    )
