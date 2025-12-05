"""
API Endpoint Testing Script
Tests all implemented endpoints to verify they work correctly
"""

import requests
import json
from typing import Dict, Optional

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "email": "test.user@example.com",
    "password": "testpassword123"
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

class APITester:
    def __init__(self):
        self.token: Optional[str] = None
        self.headers: Dict[str, str] = {"Content-Type": "application/json"}
        self.test_results = []
    
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if success else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"{status} - {test_name}")
        if message:
            print(f"     {message}")
        self.test_results.append((test_name, success))
    
    def test_login(self):
        """Test authentication"""
        print(f"\n{Colors.BLUE}=== Testing Authentication ==={Colors.END}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                data={
                    "username": TEST_USER["email"],
                    "password": TEST_USER["password"]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.headers["Authorization"] = f"Bearer {self.token}"
                self.log_test("Login", True, f"Token: {self.token[:20]}...")
            else:
                self.log_test("Login", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Login", False, str(e))
    
    def test_cv_endpoints(self):
        """Test CV endpoints"""
        print(f"\n{Colors.BLUE}=== Testing CV Endpoints ==={Colors.END}")
        
        # Test: Get CV (might not exist yet)
        try:
            response = requests.get(
                f"{BASE_URL}/cv/me",
                headers=self.headers
            )
            
            if response.status_code in [200, 404]:
                self.log_test("GET /cv/me", True, f"Status: {response.status_code}")
            else:
                self.log_test("GET /cv/me", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /cv/me", False, str(e))
        
        # Test: Create CV
        cv_data = {
            "full_name": "Test User",
            "email": TEST_USER["email"],
            "phone": "260977123456",
            "city": "Lusaka",
            "province": "Lusaka",
            "education_level": "Bachelor's",
            "institution": "University of Zambia",
            "graduation_year": 2020,
            "major": "Computer Science",
            "total_years_experience": 3.0,
            "current_job_title": "Software Developer",
            "employment_status": "Employed",
            "preferred_job_type": "Full-time",
            "salary_expectation_min": 12000.0,
            "salary_expectation_max": 18000.0,
            "availability": "1 month",
            "skills_technical": "Python, JavaScript, SQL",
            "skills_soft": "Communication, Problem-solving"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/cv/create",
                headers=self.headers,
                json=cv_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                cv_id = data.get("cv_id")
                self.log_test("POST /cv/create", True, f"CV ID: {cv_id}")
            else:
                self.log_test("POST /cv/create", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("POST /cv/create", False, str(e))
    
    def test_job_endpoints(self):
        """Test job listing endpoints"""
        print(f"\n{Colors.BLUE}=== Testing Job Endpoints ==={Colors.END}")
        
        # Test: List corporate jobs
        try:
            response = requests.get(
                f"{BASE_URL}/jobs/corporate/all",
                params={"page": 1, "page_size": 5}
            )
            
            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                self.log_test("GET /jobs/corporate/all", True, f"Found {total} jobs")
            else:
                self.log_test("GET /jobs/corporate/all", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /jobs/corporate/all", False, str(e))
        
        # Test: List small jobs
        try:
            response = requests.get(
                f"{BASE_URL}/jobs/small/all",
                params={"page": 1, "page_size": 5}
            )
            
            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                self.log_test("GET /jobs/small/all", True, f"Found {total} jobs")
            else:
                self.log_test("GET /jobs/small/all", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /jobs/small/all", False, str(e))
        
        # Test: Get job stats
        try:
            response = requests.get(f"{BASE_URL}/jobs/stats")
            
            if response.status_code == 200:
                data = response.json()
                total_all = data.get("total_all_jobs", 0)
                self.log_test("GET /jobs/stats", True, f"Total jobs: {total_all}")
            else:
                self.log_test("GET /jobs/stats", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /jobs/stats", False, str(e))
        
        # Test: Search jobs
        try:
            response = requests.get(
                f"{BASE_URL}/jobs/corporate/all",
                params={
                    "search": "software",
                    "page": 1,
                    "page_size": 5
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                self.log_test("Search jobs", True, f"Found {total} matches")
            else:
                self.log_test("Search jobs", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Search jobs", False, str(e))
    
    def test_matching_endpoints(self):
        """Test AI matching endpoints"""
        print(f"\n{Colors.BLUE}=== Testing AI Matching Endpoints ==={Colors.END}")
        
        # Test: Get matched jobs
        match_request = {
            "job_type": "corporate",
            "limit": 10,
            "min_score": 0.3,
            "sort_by": "score",
            "sort_order": "desc"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/match/jobs",
                headers=self.headers,
                json=match_request
            )
            
            if response.status_code == 200:
                data = response.json()
                total = data.get("total_matches", 0)
                returned = data.get("returned_matches", 0)
                exec_time = data.get("execution_time_ms", 0)
                self.log_test(
                    "POST /match/jobs", 
                    True, 
                    f"Found {total} matches, returned {returned}, took {exec_time:.2f}ms"
                )
                
                # Print top 3 matches
                if data.get("corporate_matches"):
                    print(f"\n     {Colors.YELLOW}Top 3 Matches:{Colors.END}")
                    for i, match in enumerate(data["corporate_matches"][:3], 1):
                        print(f"     {i}. {match['title']} at {match['company']}")
                        print(f"        Score: {match['final_score']:.2%} | {match['explanation']}")
            elif response.status_code == 404:
                self.log_test("POST /match/jobs", False, "No CV found - create a CV first")
            else:
                self.log_test("POST /match/jobs", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("POST /match/jobs", False, str(e))
        
        # Test: Get match for specific job (use job_id = 1 or job_001)
        try:
            single_match_request = {
                "job_id": "1",
                "job_type": "corporate",
                "include_explanation": True
            }
            
            response = requests.post(
                f"{BASE_URL}/match/job/1",
                headers=self.headers,
                json=single_match_request
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("corporate_match"):
                    match = data["corporate_match"]
                    score = match.get("final_score", 0)
                    self.log_test("POST /match/job/{job_id}", True, f"Match score: {score:.2%}")
                else:
                    self.log_test("POST /match/job/{job_id}", True, "Matched small job")
            elif response.status_code == 404:
                self.log_test("POST /match/job/{job_id}", False, "Job or CV not found")
            else:
                self.log_test("POST /match/job/{job_id}", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("POST /match/job/{job_id}", False, str(e))
    
    def test_filtering(self):
        """Test filtering and pagination"""
        print(f"\n{Colors.BLUE}=== Testing Filters & Pagination ==={Colors.END}")
        
        # Test: Filter by category
        try:
            response = requests.get(
                f"{BASE_URL}/jobs/corporate/all",
                params={
                    "category": "Information Technology",
                    "page": 1,
                    "page_size": 5
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                self.log_test("Filter by category", True, f"Found {total} IT jobs")
            else:
                self.log_test("Filter by category", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Filter by category", False, str(e))
        
        # Test: Filter by location
        try:
            response = requests.get(
                f"{BASE_URL}/jobs/corporate/all",
                params={
                    "location_province": "Lusaka",
                    "page": 1,
                    "page_size": 5
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                self.log_test("Filter by location", True, f"Found {total} jobs in Lusaka")
            else:
                self.log_test("Filter by location", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Filter by location", False, str(e))
        
        # Test: Pagination
        try:
            response = requests.get(
                f"{BASE_URL}/jobs/corporate/all",
                params={"page": 2, "page_size": 10}
            )
            
            if response.status_code == 200:
                data = response.json()
                page = data.get("page", 0)
                has_more = data.get("has_more", False)
                self.log_test("Pagination", True, f"Page {page}, has_more: {has_more}")
            else:
                self.log_test("Pagination", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pagination", False, str(e))
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
        print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
        print(f"{Colors.BLUE}{'='*50}{Colors.END}\n")
        
        passed = sum(1 for _, success in self.test_results if success)
        failed = sum(1 for _, success in self.test_results if not success)
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.END}")
        print(f"{Colors.RED}Failed: {failed}{Colors.END}")
        
        if failed > 0:
            print(f"\n{Colors.YELLOW}Failed Tests:{Colors.END}")
            for name, success in self.test_results:
                if not success:
                    print(f"  - {name}")
        
        print(f"\n{Colors.BLUE}{'='*50}{Colors.END}\n")
    
    def run_all_tests(self):
        """Run all test suites"""
        print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
        print(f"{Colors.BLUE}API ENDPOINT TESTING{Colors.END}")
        print(f"{Colors.BLUE}{'='*50}{Colors.END}")
        print(f"Base URL: {BASE_URL}")
        print(f"Test User: {TEST_USER['email']}")
        
        # Run tests in order
        self.test_login()
        
        if self.token:
            self.test_cv_endpoints()
            self.test_job_endpoints()
            self.test_matching_endpoints()
            self.test_filtering()
        else:
            print(f"\n{Colors.RED}⚠ Cannot continue - login failed{Colors.END}")
            print(f"Make sure:")
            print(f"  1. Server is running at {BASE_URL}")
            print(f"  2. Test user exists in database")
            print(f"  3. Database is seeded with data")
        
        # Print summary
        self.print_summary()


def main():
    """Main entry point"""
    print(f"\n{Colors.YELLOW}⚠ Pre-flight Checks:{Colors.END}")
    print(f"  1. Is the server running? (http://localhost:8000)")
    print(f"  2. Is the database seeded with data?")
    print(f"  3. Does the test user exist?")
    
    input(f"\n{Colors.YELLOW}Press Enter to start testing...{Colors.END}\n")
    
    tester = APITester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()
