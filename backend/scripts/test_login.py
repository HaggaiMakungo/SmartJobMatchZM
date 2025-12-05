"""
Quick test script to verify login is working
"""
import requests
import json

def test_login():
    """Test the login endpoint"""
    url = "http://localhost:8000/api/auth/login"
    
    # Form data (not JSON!)
    data = {
        "username": "recruiter@zedsafe.com",
        "password": "test123"
    }
    
    print("🧪 Testing Login Endpoint...")
    print(f"📍 URL: {url}")
    print(f"📝 Data: username={data['username']}, password=***hidden***")
    print(f"📋 Content-Type: application/x-www-form-urlencoded")
    print()
    
    try:
        response = requests.post(
            url,
            data=data,  # Send as form data, not json=data
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print()
        
        if response.status_code == 200:
            print("✅ SUCCESS! Login endpoint is working!")
            print()
            print("📦 Response:")
            print(json.dumps(response.json(), indent=2))
            print()
            print("🎉 You can now log in from the frontend!")
            print("   URL: http://localhost:3000/login")
            print("   Email: recruiter@zedsafe.com")
            print("   Password: test123")
        else:
            print(f"❌ FAILED! Status code: {response.status_code}")
            print()
            print("📦 Response:")
            print(json.dumps(response.json(), indent=2))
            print()
            print("💡 Troubleshooting:")
            if response.status_code == 422:
                print("   - Make sure you created the test user")
                print("   - Run: python -m scripts.create_test_recruiter")
            elif response.status_code == 401:
                print("   - Wrong credentials or user doesn't exist")
                print("   - Run: python -m scripts.create_test_recruiter")
            elif response.status_code == 404:
                print("   - Backend route not found")
                print("   - Check if backend is running on port 8000")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR!")
        print("   Backend is not running on http://localhost:8000")
        print()
        print("💡 Start the backend with:")
        print("   cd C:\\Dev\\ai-job-matchingV2\\backend")
        print("   uvicorn app.main:app --reload")
    except Exception as e:
        print(f"❌ ERROR: {e}")


if __name__ == "__main__":
    test_login()
