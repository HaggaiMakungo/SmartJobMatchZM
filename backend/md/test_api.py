"""
API Testing Script
Quick test of all major endpoints
"""
import requests
import json
from typing import Dict, Optional

BASE_URL = "http://localhost:8000/api/v1"

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.user_email = "test@example.com"
        self.user_password = "TestPass123!"
        
    def _headers(self) -> Dict:
        """Get headers with auth token"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def print_response(self, name: str, response: requests.Response):
        """Pretty print response"""
        print(f"\n{'='*80}")
        print(f"TEST: {name}")
        print(f"{'='*80}")
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)[:500]}")
        except:
            print(f"Response: {response.text[:500]}")
        print(f"{'='*80}\n")
    
    def test_health(self):
        """Test health endpoint"""
        response = requests.get(f"{self.base_url.replace('/api/v1', '')}/health")
        self.print_response("Health Check", response)
        return response.status_code == 200
    
    def test_register(self):
        """Test user registration"""
        data = {
            "email": self.user_email,
            "password": self.user_password,
            "full_name": "Test User"
        }
        response = requests.post(
            f"{self.base_url}/auth/register",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        self.print_response("Register User", response)
        return response.status_code in [200, 201, 400]  # 400 if user exists
    
    def test_login(self):
        """Test user login"""
        data = {
            "username": self.user_email,
            "password": self.user_password
        }
        response = requests.post(
            f"{self.base_url}/auth/login",
            data=data  # Note: login uses form data, not JSON
        )
        self.print_response("Login", response)
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            print(f"✓ Token obtained: {self.token[:20]}...")
            return True
        return False
    
    def test_create_cv(self):
        """Test CV creation"""
        data = {
            "full_name": "Test User",
            "email": self.user_email,
            "phone": "260977123456",
            "city": "Lusaka",
            "province": "Lusaka",
            "education_level": "Bachelor's",
            "institution": "University of Zambia",
            "graduation_year": 2015,
            "major": "Computer Science",
            "total_years_experience": 5.0,
            "current_job_title": "Software Developer",
            "employment_status": "Employed",
            "preferred_job_type": "Full-time",
            "salary_expectation_min": 15000,
            "salary_expectation_max": 22000,
            "skills_technical": "Python, JavaScript, React, SQL, Docker",
            "skills_soft": "Problem-solving, Communication, Teamwork",
            "availability": "1 month"
        }
        response = requests.post(
            f"{self.base_url}/cv/create",
            json=data,
            headers=self._headers()
        )
        self.print_response("Create CV", response)
        return response.status_code in [200, 201]
    
    def test_get_my_cv(self):
        """Test getting user's CV"""
        response = requests.get(
            f"{self.base_url}/cv/me",
            headers=self._headers()
        )
        self.print_response("Get My CV", response)
        return response.status_code == 200
    
    def test_cv_quality_score(self):
        """Test CV quality score"""
        response = requests.get(
            f"{self.base_url}/cv/quality-score",
            headers=self._headers()
        )
        self.print_response("CV Quality Score", response)
        return response.status_code == 200
    
    def test_list_jobs(self):
        """Test listing all jobs"""
        response = requests.get(
            f"{self.base_url}/jobs/all?limit=5",
            headers=self._headers()
        )
        self.print_response("List All Jobs", response)
        return response.status_code == 200
    
    def test_list_corporate_jobs(self):
        """Test listing corporate jobs"""
        response = requests.get(
            f"{self.base_url}/jobs/corporate?limit=5",
            headers=self._headers()
        )
        self.print_response("List Corporate Jobs", response)
        return response.status_code == 200
    
    def test_list_small_jobs(self):
        """Test listing small jobs"""
        response = requests.get(
            f"{self.base_url}/jobs/small?limit=5",
            headers=self._headers()
        )
        self.print_response("List Small Jobs", response)
        return response.status_code == 200
    
    def test_search_jobs(self):
        """Test job search"""
        data = {
            "query": "software",
            "page": 1,
            "page_size": 5
        }
        response = requests.post(
            f"{self.base_url}/jobs/search",
            json=data,
            headers=self._headers()
        )
        self.print_response("Search Jobs", response)
        return response.status_code == 200
    
    def test_match_jobs(self):
        """Test job matching"""
        data = {
            "job_type": "corporate",
            "limit": 5,
            "min_score": 0.3
        }
        response = requests.post(
            f"{self.base_url}/match/jobs",
            json=data,
            headers=self._headers()
        )
        self.print_response("Match Jobs", response)
        return response.status_code == 200
    
    def test_recommendations(self):
        """Test job recommendations"""
        response = requests.get(
            f"{self.base_url}/match/recommendations?limit=5",
            headers=self._headers()
        )
        self.print_response("Get Recommendations", response)
        return response.status_code == 200
    
    def test_match_stats(self):
        """Test match statistics"""
        response = requests.get(
            f"{self.base_url}/match/stats",
            headers=self._headers()
        )
        self.print_response("Match Statistics", response)
        return response.status_code == 200
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("\n" + "="*80)
        print("STARTING API TESTS")
        print("="*80)
        
        results = {}
        
        # Basic tests
        print("\n>>> PHASE 1: Basic Health & Auth")
        results['health'] = self.test_health()
        results['register'] = self.test_register()
        results['login'] = self.test_login()
        
        if not self.token:
            print("\n❌ Login failed - cannot continue with authenticated tests")
            return results
        
        # CV tests
        print("\n>>> PHASE 2: CV Management")
        results['create_cv'] = self.test_create_cv()
        results['get_cv'] = self.test_get_my_cv()
        results['cv_quality'] = self.test_cv_quality_score()
        
        # Job tests
        print("\n>>> PHASE 3: Job Listings")
        results['list_all_jobs'] = self.test_list_jobs()
        results['list_corporate'] = self.test_list_corporate_jobs()
        results['list_small'] = self.test_list_small_jobs()
        results['search_jobs'] = self.test_search_jobs()
        
        # Matching tests
        print("\n>>> PHASE 4: AI Matching")
        results['match_jobs'] = self.test_match_jobs()
        results['recommendations'] = self.test_recommendations()
        results['match_stats'] = self.test_match_stats()
        
        # Summary
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        
        for test, result in results.items():
            status = "✓ PASS" if result else "✗ FAIL"
            print(f"{status}: {test}")
        
        print(f"\n{passed}/{total} tests passed ({passed/total*100:.1f}%)")
        print("="*80 + "\n")
        
        return results


def main():
    """Run API tests"""
    print("API Testing Script")
    print("Make sure the API server is running at http://localhost:8000\n")
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        if response.status_code != 200:
            print("❌ Server is not responding properly")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server at http://localhost:8000")
        print("Please start the server first: uvicorn app.main:app --reload")
        return
    
    print("✓ Server is running\n")
    
    # Run tests
    tester = APITester()
    results = tester.run_all_tests()
    
    # Exit code based on results
    if all(results.values()):
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
