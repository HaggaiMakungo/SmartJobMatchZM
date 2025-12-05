# 🎯 CORP_USERS TABLE ARCHITECTURE - COMPLETE PLAN

## 📋 Overview

**Problem:** Mixed users table causes confusion and complex filtering  
**Solution:** Separate `corp_users` table for recruiters/companies  
**Result:** Clean architecture, simple queries, better data isolation

---

## ✅ What I've Created

### **1. CorpUser Model** ✅
**File:** `backend/app/models/corp_user.py`

**Fields:**
- `id` - Primary key
- `email` - Unique (e.g., dhl@company.zm)
- `hashed_password` - Secure password
- `company_name` - Short name (e.g., "DHL") - **INDEXED**
- `company_display_name` - Full name (e.g., "DHL Express Zambia")
- `contact_person` - Main contact
- `phone` - Contact number
- `is_active` - Account status
- `is_verified` - Email verified
- `created_at` - Account creation date
- `updated_at` - Last update

### **2. Migration Script** ✅
**File:** `backend/migrate_to_corp_users.py`

**Does:**
- Creates `corp_users` table
- Creates indexes for performance
- Migrates existing `@company.zm` users from `users` table
- Extracts company name from email
- Shows verification results

### **3. Corporate Auth Module** ✅
**File:** `backend/app/auth/corp_auth.py`

**Functions:**
- `authenticate_corp_user()` - Login validation
- `create_access_token()` - JWT token generation
- `get_corp_user_from_token()` - Token validation
- Password hashing/verification

---

## 🚀 How to Apply

### **Step 1: Run Migration (2 minutes)**

```bash
cd C:\Dev\ai-job-matchingV2\backend
python migrate_to_corp_users.py
```

**Expected Output:**
```
🔄 CREATING CORP_USERS TABLE & MIGRATING DATA
============================================================
1️⃣ Creating corp_users table...
   ✅ Table created!

2️⃣ Finding corporate users in users table...
   Found X corporate users

3️⃣ Migrating users to corp_users table...
   ✅ Migrated: dhl@company.zm -> Company: DHL
   ✅ Migrated: zanaco@company.zm -> Company: ZANACO
   ...

4️⃣ Verifying migration...
   Corporate users by company:
   - DHL: 1 user(s)
   - ZANACO: 1 user(s)
   ...

5️⃣ Current corp_users table:
   ✅ [1] dhl@company.zm | Company: DHL
   ✅ [2] zanaco@company.zm | Company: ZANACO
   ...

✅ MIGRATION COMPLETE!
```

---

### **Step 2: Update Corporate API**

**File:** `backend/app/api/v1/corporate.py`

**Changes needed:**

```python
# OLD (using User model)
from app.models.user import User

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    company = user.company  # ❌ This field might not exist
    
# NEW (using CorpUser model)
from app.models.corp_user import CorpUser
from app.auth.corp_auth import get_corp_user_from_token

def get_current_corp_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    corp_user = get_corp_user_from_token(token, db)
    company = corp_user.company_name  # ✅ Always exists, clean!
```

**Update all endpoints:**

```python
@router.get("/jobs")
def get_corporate_jobs(
    current_user: CorpUser = Depends(get_current_corp_user),  # Changed
    db: Session = Depends(get_db)
):
    # Simple, clean query!
    jobs = db.query(CorporateJob).filter(
        CorporateJob.company == current_user.company_name
    ).all()
    
    return jobs
```

---

### **Step 3: Update Auth Endpoints**

**File:** `backend/app/api/v1/auth.py`

**Changes needed:**

```python
# Add corporate login endpoint
from app.auth.corp_auth import authenticate_corp_user, create_access_token
from app.models.corp_user import CorpUser

@router.post("/corporate/login")
def corporate_login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Login endpoint for corporate users"""
    corp_user = authenticate_corp_user(db, email, password)
    
    if not corp_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"sub": corp_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": corp_user.id,
            "email": corp_user.email,
            "company_name": corp_user.company_name,
            "company_display_name": corp_user.company_display_name,
        }
    }

@router.get("/corporate/me")
def get_current_corporate_user(
    current_user: CorpUser = Depends(get_current_corp_user)
):
    """Get current corporate user info"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "company_name": current_user.company_name,
        "company_display_name": current_user.company_display_name,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
    }
```

---

### **Step 4: Update Frontend API Client**

**File:** `frontend/recruiter/src/lib/api/client.ts`

**Change login endpoint:**

```typescript
// OLD
async login(email: string, password: string) {
  const response = await this.client.post('/api/auth/login', { email, password });
  // ...
}

// NEW
async login(email: string, password: string) {
  const response = await this.client.post('/api/auth/corporate/login', { 
    email, 
    password 
  });
  // Response now includes company_name and company_display_name
  return response.data;
}
```

---

## 🎯 Benefits of This Architecture

### **Before (Mixed Users Table):**

```python
# Get company jobs - Complex!
def get_corporate_jobs(current_user: User):
    # Extract company somehow
    if current_user.company:
        company = current_user.company
    elif '@company.zm' in current_user.email:
        company = current_user.email.split('@')[0].upper()
    else:
        raise Exception("Not a corporate user!")
    
    # Query with uncertainty
    jobs = db.query(CorporateJob).filter(
        CorporateJob.company == company  # Hope it matches!
    ).all()
```

### **After (Separate Corp_Users Table):**

```python
# Get company jobs - Simple!
def get_corporate_jobs(current_user: CorpUser):
    # Company name always exists, always clean
    jobs = db.query(CorporateJob).filter(
        CorporateJob.company == current_user.company_name
    ).all()
```

---

## 📊 Database Schema Comparison

### **Before:**
```
users
├── id
├── email (mixed: jobseekers + companies)
├── hashed_password
├── company (nullable, inconsistent)
└── ... (job seeker fields mixed with company fields)

corporate_jobs
├── job_id
├── company (must match users.company somehow)
└── ...
```

### **After:**
```
users (job seekers only)
├── id
├── email (e.g., john@gmail.com)
├── hashed_password
└── ... (clean job seeker data)

corp_users (companies only) ✨
├── id
├── email (e.g., dhl@company.zm)
├── hashed_password
├── company_name (indexed, always set)
├── company_display_name
└── ... (clean company data)

corporate_jobs
├── job_id
├── company (matches corp_users.company_name exactly)
└── ...
```

---

## ✅ Success Criteria

After implementation:

- [ ] `corp_users` table exists with all company accounts
- [ ] Login works with `@company.zm` emails
- [ ] `/api/corporate/jobs` returns only company's jobs
- [ ] Company name matching is consistent
- [ ] No confusion between job seekers and companies
- [ ] All 18 Zesco jobs appear when Zesco user logs in

---

## 🔧 Troubleshooting

### **Issue: Migration fails**
```bash
# Check if corp_users already exists
psql -U postgres -d job_match_db -c "\dt corp_users"

# If it exists, drop and recreate
psql -U postgres -d job_match_db -c "DROP TABLE IF EXISTS corp_users CASCADE;"
python migrate_to_corp_users.py
```

### **Issue: Login still not working**
```bash
# Verify corp_users populated
psql -U postgres -d job_match_db -c "SELECT * FROM corp_users;"

# Check if passwords migrated
psql -U postgres -d job_match_db -c "SELECT email, hashed_password FROM corp_users LIMIT 3;"
```

### **Issue: Company names don't match**
```bash
# Show company names in both tables
psql -U postgres -d job_match_db

SELECT DISTINCT company FROM corporate_jobs ORDER BY company;
SELECT DISTINCT company_name FROM corp_users ORDER BY company_name;

# Standardize if needed
UPDATE corporate_jobs SET company = 'DHL' WHERE company ILIKE '%dhl%';
UPDATE corp_users SET company_name = 'DHL' WHERE company_name ILIKE '%dhl%';
```

---

## 🎬 Ready to Execute?

**Just run:**

```bash
cd C:\Dev\ai-job-matchingV2\backend
python migrate_to_corp_users.py
```

Then we'll update the API endpoints together! 🚀

---

## 📝 Files Modified/Created

```
Created:
✅ backend/app/models/corp_user.py
✅ backend/app/auth/corp_auth.py
✅ backend/migrate_to_corp_users.py
✅ backend/CORP_USERS_ARCHITECTURE.md (this file)

To Modify:
⏳ backend/app/api/v1/auth.py
⏳ backend/app/api/v1/corporate.py
⏳ frontend/recruiter/src/lib/api/client.ts
```

---

**Let's do this! Run the migration and we'll wire up the rest together.** 🎯
