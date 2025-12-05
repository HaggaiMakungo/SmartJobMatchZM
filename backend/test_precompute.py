"""
Quick test to verify pre-computed matching works
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)


def test_cache_table():
    """Test if the cache table exists"""
    print("\n1️⃣  Testing cache table existence...")
    
    with engine.begin() as conn:
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'job_candidate_matches'
            );
        """)).scalar()
        
        if result:
            print("   ✅ Cache table exists!")
            return True
        else:
            print("   ❌ Cache table NOT found")
            print("   Run: python precompute_matches.py --create-table")
            return False


def test_cache_data():
    """Test if cache has data"""
    print("\n2️⃣  Testing cache data...")
    
    with engine.begin() as conn:
        count = conn.execute(text("""
            SELECT COUNT(*) FROM job_candidate_matches
        """)).scalar()
        
        if count > 0:
            print(f"   ✅ Cache has {count:,} matches!")
            return True
        else:
            print("   ❌ Cache is empty")
            print("   Run: python precompute_matches.py --compute")
            return False


def test_sample_query():
    """Test a sample query"""
    print("\n3️⃣  Testing sample query...")
    
    with engine.begin() as conn:
        # Get first job
        job = conn.execute(text("""
            SELECT job_id, job_title, company
            FROM corporate_jobs
            LIMIT 1
        """)).fetchone()
        
        if not job:
            print("   ❌ No jobs found in database")
            return False
        
        job_id, job_title, company = job
        print(f"   Testing with: {job_title} at {company}")
        
        # Query cached matches
        import time
        start = time.time()
        
        matches = conn.execute(text("""
            SELECT 
                m.cv_id,
                m.match_score,
                c.full_name
            FROM job_candidate_matches m
            JOIN cvs c ON m.cv_id = c.cv_id
            WHERE m.job_id = :job_id
              AND m.match_score >= 0.3
            ORDER BY m.match_score DESC
            LIMIT 10
        """), {"job_id": job_id}).fetchall()
        
        elapsed = (time.time() - start) * 1000  # Convert to ms
        
        if matches:
            print(f"   ✅ Found {len(matches)} candidates in {elapsed:.0f}ms!")
            print(f"\n   Top 3 matches:")
            for i, match in enumerate(matches[:3], 1):
                print(f"      {i}. {match[2]} ({match[1]*100:.1f}%)")
            return True
        else:
            print(f"   ⚠️  No matches found for this job")
            print(f"   Try: python precompute_matches.py --compute --min-score 0.0")
            return False


def test_api_endpoint():
    """Test the API endpoint"""
    print("\n4️⃣  Testing API endpoint...")
    
    try:
        import requests
        
        # Get first job
        with engine.begin() as conn:
            job = conn.execute(text("""
                SELECT job_id FROM corporate_jobs LIMIT 1
            """)).fetchone()
            
            if not job:
                print("   ❌ No jobs found")
                return False
            
            job_id = job[0]
        
        # Test API
        import time
        start = time.time()
        
        response = requests.get(
            f"http://localhost:8000/api/v1/recruiter/job/{job_id}/candidates/cached",
            params={"min_score": 0.3, "limit": 10},
            timeout=5
        )
        
        elapsed = (time.time() - start) * 1000
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ API works! Response in {elapsed:.0f}ms")
            print(f"   Found {data['total_matches']} matches")
            return True
        else:
            print(f"   ❌ API error: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ⚠️  Backend not running")
        print("   Start it: python -m uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("="*80)
    print("🧪 PRE-COMPUTED MATCHING TEST SUITE")
    print("="*80)
    
    results = []
    
    # Run tests
    results.append(("Cache Table", test_cache_table()))
    results.append(("Cache Data", test_cache_data()))
    results.append(("Sample Query", test_sample_query()))
    results.append(("API Endpoint", test_api_endpoint()))
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {status}: {name}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    print(f"\n   Result: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 All tests passed! Pre-computed matching is ready!")
    else:
        print("\n⚠️  Some tests failed. Follow the instructions above to fix.")
