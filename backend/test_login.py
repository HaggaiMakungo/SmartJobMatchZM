"""
Test login for any company account
Quick way to verify authentication works
"""
import requests
import sys

BASE_URL = "http://localhost:8000"

def test_login(email: str, password: str = "password123"):
    """Test login for a company account"""
    print("\n" + "=" * 80)
    print(f"🔐 TESTING LOGIN")
    print("=" * 80)
    print(f"Email: {email}")
    print(f"Password: {password}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": email,
                "password": password
            },
            timeout=10
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            user = data.get("user", {})
            
            print("\n✅ LOGIN SUCCESSFUL!")
            print("-" * 80)
            print(f"Company: {user.get('company_name', 'Unknown')}")
            print(f"Email: {user.get('email', 'Unknown')}")
            print(f"Industry: {user.get('industry', 'Not specified')}")
            print(f"Role: {user.get('role', 'Unknown')}")
            print(f"\nAccess Token: {data['access_token'][:50]}...")
            print("-" * 80)
            
            # Test getting company's jobs
            print("\n📋 FETCHING COMPANY'S JOBS...")
            headers = {"Authorization": f"Bearer {data['access_token']}"}
            
            jobs_response = requests.get(
                f"{BASE_URL}/api/corporate/jobs",
                headers=headers,
                timeout=10
            )
            
            if jobs_response.status_code == 200:
                jobs_data = jobs_response.json()
                print(f"✅ Found {jobs_data.get('total', 0)} jobs for {user.get('company_name')}")
                
                if jobs_data.get('jobs'):
                    print("\nSample Jobs:")
                    for job in jobs_data['jobs'][:3]:
                        print(f"  • {job['job_id']}: {job['title']} ({job.get('status', 'N/A')})")
            else:
                print(f"⚠️  Could not fetch jobs: {jobs_response.status_code}")
            
            return True
        else:
            print("\n❌ LOGIN FAILED!")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR!")
        print("Make sure the backend server is running:")
        print("   python -m uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False


if __name__ == "__main__":
    # Check if email provided as argument
    if len(sys.argv) > 1:
        email = sys.argv[1]
        password = sys.argv[2] if len(sys.argv) > 2 else "password123"
    else:
        # Default test with a common company
        print("Usage: python test_login.py <email> [password]")
        print("\nExample: python test_login.py zanaco@company.zm")
        print("\nTrying default: dhl@company.zm")
        email = "dhl@company.zm"
        password = "password123"
    
    test_login(email, password)
    print()
