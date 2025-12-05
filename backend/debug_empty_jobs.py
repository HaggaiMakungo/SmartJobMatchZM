"""
Debug: Why is /api/jobs/corporate returning empty array?
"""
import requests

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("🔍 DEBUGGING EMPTY JOBS RESPONSE")
print("=" * 80)

# Step 1: Login
print("\n1️⃣ Logging in...")
login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    data={
        "username": "recruiter@zedsafe.com",
        "password": "test123"
    },
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if login_response.status_code != 200:
    print(f"   ❌ Login failed: {login_response.text}")
    exit(1)

auth_data = login_response.json()
token = auth_data["access_token"]
print(f"   ✅ Logged in as: {auth_data.get('user', {}).get('full_name', 'Unknown')}")

headers = {"Authorization": f"Bearer {token}"}

# Step 2: Test /api/jobs/corporate endpoint
print("\n2️⃣ Testing /api/jobs/corporate...")
response = requests.get(f"{BASE_URL}/api/jobs/corporate", headers=headers)

print(f"   Status: {response.status_code}")
print(f"   Headers: {dict(response.headers)}")

if response.status_code == 200:
    jobs = response.json()
    print(f"   Response type: {type(jobs)}")
    print(f"   Response length: {len(jobs) if isinstance(jobs, list) else 'N/A'}")
    
    if isinstance(jobs, list):
        print(f"   ✅ Got {len(jobs)} jobs")
        if len(jobs) > 0:
            print(f"\n   First job:")
            print(f"      {jobs[0]}")
        else:
            print(f"   ❌ Empty array returned!")
    else:
        print(f"   Response: {jobs}")
else:
    print(f"   ❌ Error: {response.text}")

# Step 3: Check database directly
print("\n3️⃣ Checking database directly...")
import psycopg2

conn = psycopg2.connect(
    host='localhost',
    database='job_match_db',
    user='postgres',
    password='Winter123'
)

cursor = conn.cursor()

# Check user's full_name
cursor.execute("""
    SELECT id, email, full_name 
    FROM users 
    WHERE email = 'recruiter@zedsafe.com'
""")
user = cursor.fetchone()
print(f"   User: {user}")

# Check for Zedsafe jobs
cursor.execute("""
    SELECT job_id, title, company
    FROM corporate_jobs
    WHERE company ILIKE '%zedsafe%'
""")
zedsafe_jobs = cursor.fetchall()
print(f"   Zedsafe jobs in DB: {len(zedsafe_jobs)}")
for job in zedsafe_jobs[:3]:
    print(f"      • {job[0]}: {job[1]} at {job[2]}")

# Check what the API filter is doing
if user and user[2]:
    full_name = user[2]
    print(f"\n   User full_name: '{full_name}'")
    
    # Check if 'zedsafe' is in full_name
    has_zedsafe = 'zedsafe' in full_name.lower()
    print(f"   Contains 'zedsafe': {has_zedsafe}")
    
    if has_zedsafe:
        # Extract company name (everything in parentheses)
        import re
        match = re.search(r'\((.*?)\)', full_name)
        if match:
            company = match.group(1)
            print(f"   Extracted company: '{company}'")
            
            # Check if this matches any jobs
            cursor.execute("""
                SELECT COUNT(*) 
                FROM corporate_jobs
                WHERE company = %s
            """, (company,))
            count = cursor.fetchone()[0]
            print(f"   Jobs with exact company match: {count}")
            
            # Try case-insensitive
            cursor.execute("""
                SELECT COUNT(*) 
                FROM corporate_jobs
                WHERE LOWER(company) = LOWER(%s)
            """, (company,))
            count_ci = cursor.fetchone()[0]
            print(f"   Jobs with case-insensitive match: {count_ci}")

cursor.close()
conn.close()

print("\n" + "=" * 80)
print("💡 DIAGNOSIS")
print("=" * 80)
print("Check the output above to see:")
print("1. What is the user's full_name?")
print("2. How many Zedsafe jobs exist in DB?")
print("3. Is the company name extracted correctly?")
print("4. Is there an exact match between extracted company and DB company?")
