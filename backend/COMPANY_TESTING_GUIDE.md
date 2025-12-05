# 🏢 Company Account Testing Guide

Quick guide for logging into any company account and testing the recruiter dashboard.

---

## 📋 Quick Start

### 1️⃣ List All Available Companies
See all companies with their login credentials and job counts:

```bash
cd backend
python list_company_accounts.py
```

**Output:**
- Shows all companies with jobs
- Email addresses for each company
- Job counts
- Industries

---

### 2️⃣ Interactive Company Selector (Recommended)
Interactive menu to select and login to any company:

```bash
python select_company.py
```

**Features:**
- ✅ Browse companies with jobs
- ✅ Copy login credentials
- ✅ Auto-open login page in browser
- ✅ Quick company switching

---

### 3️⃣ Test Login (Backend Only)
Test if login works for a specific company without opening frontend:

```bash
# Test any company
python test_login.py zanaco@company.zm

# Test with custom password
python test_login.py dhl@company.zm mypassword
```

---

## 🔑 Default Credentials

**All companies use:**
- **Password:** `password123`
- **Email Format:** `companyname@company.zm`

**Examples:**
```
Email: zanaco@company.zm
Password: password123

Email: dhl@company.zm
Password: password123

Email: zedsafe@company.zm
Password: password123
```

---

## 🚀 Full Testing Workflow

### Step 1: Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Step 2: Start Frontend
```bash
cd frontend/recruiter
npm run dev
```

### Step 3: Select Company
```bash
cd backend
python select_company.py
```

### Step 4: Login
1. Open `http://localhost:3000/login`
2. Enter company email and password
3. Explore the dashboard!

---

## 📊 What You Can Test

### As Zanaco (Banking)
- View banking/finance jobs
- See matched candidates
- Test candidate management
- Save candidates

### As DHL (Logistics)
- View logistics/transport jobs
- Match drivers and coordinators
- Test skills matching
- Filter by location

### As Any Company
- Browse their specific jobs
- AI-powered candidate matching
- Saved candidates management
- Pipeline management

---

## 🔍 Company-Specific Features

Each company sees:
- ✅ **Only their jobs** (filtered by company name)
- ✅ **Their own saved candidates** (per company_id)
- ✅ **Matched candidates for their jobs**
- ✅ **Company-specific analytics**

---

## 🛠️ Troubleshooting

### "No companies found"
```bash
# Create company accounts first
python create_company_accounts.py
```

### "Login failed"
- Check backend is running (`python -m uvicorn app.main:app --reload`)
- Verify email format: `companyname@company.zm`
- Verify password: `password123`

### "No jobs showing"
- Company might not have jobs in database
- Use `python list_company_accounts.py` to find companies WITH jobs
- Test with companies like DHL, Zanaco, MTN that have multiple jobs

---

## 📁 Useful Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `list_company_accounts.py` | List all companies | `python list_company_accounts.py` |
| `select_company.py` | Interactive selector | `python select_company.py` |
| `test_login.py` | Test backend login | `python test_login.py email@company.zm` |
| `create_company_accounts.py` | Create accounts | `python create_company_accounts.py` |

---

## 🎯 Testing Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Company accounts created
- [ ] Can list companies with jobs
- [ ] Can login to any company
- [ ] Can see company-specific jobs
- [ ] Can view matched candidates
- [ ] Can save candidates
- [ ] Saved candidates persist per company
- [ ] Dashboard shows company info

---

## 💡 Pro Tips

1. **Quick Company Testing**
   - Use `select_company.py` for fastest workflow
   - Keeps credentials visible while testing

2. **Finding Best Test Companies**
   - Look for companies with 5+ jobs
   - Banking, logistics, and tech companies usually have most jobs

3. **Reset Testing**
   - Clear saved candidates between tests
   - Logout and login as different company
   - Each company has isolated data

4. **Debugging Login Issues**
   - Check backend terminal for debug logs
   - Use `test_login.py` to isolate backend issues
   - Verify token is being stored in frontend

---

## 📞 Common Test Scenarios

### Scenario 1: Recruiter finds candidates for a job
1. Login as DHL
2. Go to Jobs page
3. Select "Delivery Driver" job
4. See matched candidates
5. Save top candidates
6. Go to Candidates page
7. See saved candidates

### Scenario 2: Compare companies
1. Login as Company A
2. Note job count and candidates
3. Logout
4. Login as Company B
5. Verify different jobs/candidates

### Scenario 3: Full recruitment pipeline
1. Login as Zanaco
2. View "Accountant" job
3. Save 5 candidates
4. Move candidates through pipeline stages
5. Schedule interviews
6. Download CVs

---

## 🔐 Security Notes

**Testing Environment Only:**
- Default password (`password123`) is for testing
- Change passwords for production
- Use proper authentication in production
- Implement password reset flow

---

**Ready to test? Run:** `python select_company.py` 🚀
