"""
Test Backend-Frontend Connection
Run this to verify everything is connected properly
"""
import requests
import sys

print("=" * 80)
print("BACKEND-FRONTEND CONNECTION TEST")
print("=" * 80)

# Test localhost
print("\n[1/3] Testing backend on localhost...")
try:
    response = requests.get("http://localhost:8000/api/health", timeout=5)
    if response.status_code == 200:
        print("✓ Backend is running on localhost:8000")
        print(f"  Response: {response.json()}")
    else:
        print(f"✗ Backend returned status {response.status_code}")
except requests.exceptions.ConnectionError:
    print("✗ Cannot connect to backend on localhost:8000")
    print("  Is the backend running? Run: START_BACKEND.bat")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

# Get local IP
print("\n[2/3] Detecting your local IP address...")
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    local_ip = s.getsockname()[0]
    s.close()
    print(f"✓ Your local IP: {local_ip}")
except Exception as e:
    print(f"⚠ Could not detect IP automatically: {e}")
    print("  Run 'ipconfig' to find your IP manually")
    local_ip = "YOUR_IP_HERE"

# Test network access
print(f"\n[3/3] Testing backend on network ({local_ip})...")
try:
    response = requests.get(f"http://{local_ip}:8000/api/health", timeout=5)
    if response.status_code == 200:
        print(f"✓ Backend is accessible from network!")
        print(f"  Mobile devices can connect to: http://{local_ip}:8000")
    else:
        print(f"✗ Backend returned status {response.status_code}")
except requests.exceptions.ConnectionError:
    print(f"✗ Cannot connect to backend on {local_ip}:8000")
    print("  Possible issues:")
    print("  1. Firewall is blocking port 8000")
    print("  2. Backend not started with --host 0.0.0.0")
    print("  3. Network connectivity issue")
except Exception as e:
    print(f"✗ Error: {e}")

# Summary
print("\n" + "=" * 80)
print("CONNECTION TEST COMPLETE")
print("=" * 80)

print("\n📱 FRONTEND CONFIGURATION")
print("-" * 80)
print(f"Update this in: frontend/jobmatch/src/services/api.ts")
print()
print(f"const API_BASE_URL = __DEV__")
print(f"  ? 'http://{local_ip}:8000/api'  // ← Update this line")
print(f"  : 'https://your-production-api.com/api';")
print()

print("\n🔥 FIREWALL CHECK")
print("-" * 80)
print("If network test failed, allow port 8000:")
print("1. Windows Security → Firewall & network protection")
print("2. Advanced settings → Inbound Rules → New Rule")
print("3. Port → TCP → 8000 → Allow")
print()

print("\n🚀 NEXT STEPS")
print("-" * 80)
print("1. Update frontend IP address (see above)")
print("2. Run: START_FRONTEND.bat")
print("3. Test app on your device/emulator")
print()

print("\n📊 QUICK TEST URLS")
print("-" * 80)
print(f"Backend API Docs:  http://localhost:8000/docs")
print(f"Health Check:      http://localhost:8000/api/health")
print(f"Network Access:    http://{local_ip}:8000/docs")
print(f"Jobs Endpoint:     http://localhost:8000/api/jobs")
print()
