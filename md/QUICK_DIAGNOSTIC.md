# ðŸŽ¯ QUICK FIX - Run This Now!

## â° 2-Minute Diagnostic

### Step 1: Run Diagnostic Script
```bash
cd C:\Dev\ai-job-matchingV2\backend
python test_recruiter_endpoint.py
```

**Watch for:**
- ✅ Login successful?
- ✅ Jobs found?
- ✅ Candidates returned?
- ❌ Any errors?

---

### Step 2: Check Browser Console

1. Open http://localhost:3000/login
2. Login: `zanaco@company.zm` / `password123`
3. Go to Jobs page
4. Press F12 → Console tab
5. Look for **"Error details:"** log

**Copy the error details and paste here!**

---

### Step 3: Check Backend Terminal

Look for errors in the terminal running:
```bash
python -m uvicorn app.main:app --reload
```

**Common errors:**
- `KeyError: 'company'` → Run company fix migration
- `No module named 'sentence_transformers'` → Install dependencies
- `Table 'cvs' doesn't exist` → Database schema issue

---

## 🔥 Most Likely Fixes

### Fix #1: CV Data Missing

**Check if CVs exist:**
```bash
psql -U postgres -d camss_db -c "SELECT COUNT(*) FROM cvs;"
```

**If 0 or very few:**
```bash
# You need to populate CV data!
cd C:\Dev\ai-job-matchingV2\backend
python populate_cvs.py  # Or whatever script adds CVs
```

---

### Fix #2: Use Faster Endpoint

**Edit:** `frontend/recruiter/src/lib/api/client.ts`

**Line 97-101, change:**
```typescript
// FROM:
const response = await this.client.get(`/api/recruiter/job/${jobId}/candidates`, { params });

// TO:
const response = await this.client.get(`/api/recruiter/optimized/job/${jobId}/candidates`, { params });
```

Save → Refresh browser

---

### Fix #3: Lower Match Score Filter

**Edit:** `frontend/recruiter/src/pages/JobsPage.tsx`

**Line 28, change:**
```typescript
// FROM:
const [minMatchScore, setMinMatchScore] = useState(0);

// TO:
const [minMatchScore, setMinMatchScore] = useState(0);  // Already 0, good!
```

---

## 📊 Expected Diagnostic Output

### ✅ SUCCESS:
```
✅ Login successful!
✅ Found 8 jobs
📋 Testing with job: Bank Teller
✅ Success! Found 15 candidates
   First candidate: John Banda
   Match score: 0.85
```

### ❌ NO CANDIDATES:
```
✅ Login successful!
✅ Found 8 jobs
📋 Testing with job: Bank Teller
✅ Success! Found 0 candidates  ← ISSUE HERE
```

**If 0 candidates:**
- Check CV data in database
- Check matching algorithm filters
- Check location requirements

### ❌ ENDPOINT ERROR:
```
✅ Login successful!
✅ Found 8 jobs
📋 Testing with job: Bank Teller
❌ Failed: 500 Internal Server Error
   Error: Matching service not initialized
```

**If endpoint error:**
- Check backend logs
- Install dependencies: `pip install sentence-transformers`
- Restart backend

---

## 🚀 After Running Diagnostic

**Paste results here and I'll tell you exactly what to do next!**

Common patterns:

| Result | Meaning | Action |
|--------|---------|--------|
| 0 candidates for all jobs | No CV data | Add CVs to database |
| Endpoint 404 | Wrong URL | Check endpoint path |
| Endpoint 500 | Server error | Check backend logs |
| Timeout | Too slow | Use optimized endpoint |
| Forbidden 403 | Company mismatch | Check auth token |

---

## 📝 Quick Checklist

- [ ] Backend running? (`python -m uvicorn app.main:app --reload`)
- [ ] Frontend running? (`npm run dev`)
- [ ] Logged in? (`zanaco@company.zm` / `password123`)
- [ ] Jobs showing? (Should see 8 Zanaco jobs)
- [ ] Diagnostic script run? (`python test_recruiter_endpoint.py`)
- [ ] Console errors checked? (F12 → Console → Copy error details)
- [ ] Backend logs checked? (Terminal → Look for errors)

---

## 💬 Next Steps

1. **Run the diagnostic script**
2. **Check browser console** (F12)
3. **Check backend logs**
4. **Paste all 3 outputs here**

Then I can give you the exact fix! 🎯
