# 🔍 Candidate Matching Issue - Diagnostic Guide

## 🚨 Current Issue

**Symptom:** Frontend shows "Failed to fetch candidates: AxiosError$1" in console  
**Impact:** Jobs page loads correctly, but no candidates appear  
**Status:** Company isolation is working ✅ (jobs filtered correctly)

---

## 📊 What We Know

### ✅ Working:
- Backend is running on `http://localhost:8000`
- Frontend is running on `http://localhost:3000`
- Login authentication works
- Company isolation works (users only see their company's jobs)
- Jobs API endpoint works: `/api/corporate/jobs`

### ❌ Not Working:
- Candidate matching endpoint: `/api/recruiter/job/{job_id}/candidates`
- Error: AxiosError without detailed message

---

## 🔬 Diagnostic Steps

### Step 1: Run Backend Diagnostic Script

This will test all three candidate matching endpoints:

```bash
cd C:\Dev\ai-job-matchingV2\backend
python test_recruiter_endpoint.py
```

**What it tests:**
1. ✅ Login with Zanaco account
2. ✅ Fetch jobs for that company
3. ✅ Test 3 different matching endpoints:
   - `/api/recruiter/job/{job_id}/candidates` (Original - 8-10s)
   - `/api/recruiter/optimized/job/{job_id}/candidates` (Optimized - 2-3s)
   - `/api/recruiter/job/{job_id}/candidates/cached` (Cached - <100ms)

**Expected output:**
```
🔍 Testing Recruiter Matching Endpoint
✅ Login successful!
✅ Found 8 jobs
📋 Testing with job: Bank Teller (ID: ZANACO_001)
✅ Success! Found X candidates
```

**If it fails:**
- Check error messages
- Check if CV data exists in database
- Check if matching service is initialized

---

### Step 2: Check Browser Console (Enhanced)

I've updated the frontend to show more error details. Now refresh the page and check console:

```
Failed to fetch candidates: AxiosError
Error details: {
  message: "...",
  response: {...},  // This will show the actual error!
  status: 404/500/etc,
  url: "http://localhost:8000/api/recruiter/job/..."
}
```

**Common errors:**

| Status | Meaning | Solution |
|--------|---------|----------|
| 404 | Job not found | Check job_id format |
| 500 | Server error | Check backend logs |
| 403 | Forbidden | Company mismatch |
| Timeout | Slow matching | Use optimized endpoint |

---

### Step 3: Check Backend Logs

Look at your backend terminal for errors:

```bash
# Backend terminal should show:
INFO:     127.0.0.1:xxxxx - "GET /api/recruiter/job/ZANACO_001/candidates HTTP/1.1" 200 OK
```

**If you see errors like:**
- `KeyError: 'company'` → User model not updated
- `No module named 'sentence_transformers'` → Missing dependency
- `Table 'cvs' doesn't exist` → Database schema issue
- `Matching service failed` → ML model issue

---

### Step 4: Test API Directly with cURL

```bash
# Get auth token first
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=zanaco@company.zm&password=password123"

# Copy the access_token, then:
curl -X GET "http://localhost:8000/api/recruiter/job/ZANACO_001/candidates?min_score=0&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Most Likely Causes

### 1. **CV Data Missing** (Most Common)
The `cvs` table might be empty or have no CVs matching the job criteria.

**Check:**
```bash
cd C:\Dev\ai-job-matchingV2\backend
psql -U postgres -d camss_db

SELECT COUNT(*) FROM cvs;
SELECT city, province, COUNT(*) FROM cvs GROUP BY city, province;
```

**Expected:**
- 2,500+ CVs in database
- CVs distributed across provinces
- CVs have skills populated

---

### 2. **Matching Service Not Initialized**
The semantic matching service might not be loading.

**Check backend logs for:**
```
🔄 Initializing matching service...
✅ Matching service ready!
```

**If missing:**
- Check if `sentence-transformers` is installed
- Check if model files exist
- Look for model download errors

---

### 3. **Wrong Endpoint Being Called**
Frontend might be calling the wrong endpoint or the endpoint doesn't exist.

**Current frontend code:**
```typescript
/api/recruiter/job/${job_id}/candidates
```

**Available endpoints:**
- `/api/recruiter/job/{job_id}/candidates` ✅ (Original)
- `/api/recruiter/optimized/job/{job_id}/candidates` ✅ (Optimized)
- `/api/recruiter/job/{job_id}/candidates/cached` ✅ (Cached)

---

### 4. **Company Isolation Filtering Too Much**
The new company isolation might be filtering out all candidates.

**Check:**
```sql
-- See if any CVs match this company's jobs
SELECT 
    j.job_id, 
    j.title, 
    j.location_city, 
    j.location_province,
    COUNT(c.cv_id) as potential_matches
FROM corporate_jobs j
LEFT JOIN cvs c ON (
    c.province = j.location_province 
    OR c.city = j.location_city
)
WHERE j.company = 'ZANACO'
GROUP BY j.job_id, j.title, j.location_city, j.location_province;
```

---

## 🛠️ Quick Fixes

### Fix 1: Use Faster Endpoint

Update `src/lib/api/client.ts`:

```typescript
// Change from:
async getCandidatesForJob(jobId: string, params?: { limit?: number; min_score?: number }) {
  const response = await this.client.get(`/api/recruiter/job/${jobId}/candidates`, { params });
  // ...
}

// To (optimized):
async getCandidatesForJob(jobId: string, params?: { limit?: number; min_score?: number }) {
  const response = await this.client.get(`/api/recruiter/optimized/job/${jobId}/candidates`, { params });
  // ...
}

// Or (cached - if pre-computed data exists):
async getCandidatesForJob(jobId: string, params?: { limit?: number; min_score?: number }) {
  const response = await this.client.get(`/api/recruiter/job/${jobId}/candidates/cached`, { params });
  // ...
}
```

---

### Fix 2: Add Fallback Response

If candidates array is empty, show a helpful message:

**Already done in the UI!** Check JobsPage for the empty state.

---

### Fix 3: Increase Timeout

If matching is slow, increase timeout:

```typescript
// In src/lib/api/client.ts
this.client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes instead of 2
  // ...
});
```

---

## 📝 Expected Results After Diagnostics

### If diagnostic script succeeds:
```
✅ All 3 endpoints work
✅ Candidates are returned
→ Issue is in frontend code (check URL, params, headers)
```

### If diagnostic script fails:
```
❌ Endpoint returns error
→ Issue is in backend (check logs, database, matching service)
```

### If diagnostic script times out:
```
⏱️ Request takes > 30 seconds
→ Matching is too slow, use optimized/cached endpoint
```

---

## 🚀 Next Steps Based on Results

### Scenario A: Backend Returns Data ✅
**Problem:** Frontend not handling response correctly

**Solution:**
1. Check response format in browser console
2. Verify TypeScript types match API response
3. Check if `matched_candidates` vs `candidates` key mismatch

---

### Scenario B: Backend Returns Empty Array ⚠️
**Problem:** No candidates match criteria

**Solution:**
1. Lower `min_score` to 0
2. Check if CVs exist in database
3. Check if CVs match job location
4. Review matching algorithm filters

---

### Scenario C: Backend Returns Error ❌
**Problem:** Server-side issue

**Solution:**
1. Check backend logs for stack trace
2. Verify matching service initialized
3. Check database connectivity
4. Install missing dependencies

---

### Scenario D: Backend Times Out ⏱️
**Problem:** Matching too slow

**Solution:**
1. Use optimized endpoint: `/api/recruiter/optimized/...`
2. Or use cached endpoint: `/api/recruiter/.../cached`
3. Or implement progressive loading
4. Or pre-compute matches and cache

---

## 📞 Quick Commands Reference

```bash
# Run diagnostic
cd C:\Dev\ai-job-matchingV2\backend
python test_recruiter_endpoint.py

# Check database
psql -U postgres -d camss_db
\dt  # List tables
SELECT COUNT(*) FROM cvs;
SELECT COUNT(*) FROM corporate_jobs;

# Restart backend
python -m uvicorn app.main:app --reload

# Check backend logs
# Look at terminal running uvicorn

# Clear browser cache
# F12 → Application → Clear Storage → Clear site data
```

---

## 💡 Pro Tips

1. **Always check backend logs first** - They show the actual error
2. **Use the diagnostic script** - It tests all endpoints at once
3. **Check browser Network tab** - Shows exact request/response
4. **Use optimized endpoint** - Much faster than original
5. **Test with different companies** - Some might have more/fewer candidates

---

## ✅ Success Criteria

After fixing, you should see:
- ✅ Jobs page loads
- ✅ Select a job from dropdown
- ✅ "Matching with AI..." loading screen appears
- ✅ Candidates appear in grid (even if only a few)
- ✅ Match scores shown (0-100%)
- ✅ No errors in console
- ✅ Can view candidate details
- ✅ Can save candidates

---

## 🎯 Most Likely Issue

Based on the symptoms, I suspect:

1. **70% probability:** CV data is sparse or doesn't match job criteria
2. **20% probability:** Matching service isn't initialized properly
3. **10% probability:** Endpoint URL mismatch or company isolation too strict

**Run the diagnostic script to confirm!** 🔍

---

## 📚 Related Files

- **Frontend API Client:** `frontend/recruiter/src/lib/api/client.ts`
- **Jobs Page:** `frontend/recruiter/src/pages/JobsPage.tsx`
- **Backend Endpoints:**
  - `backend/app/api/v1/recruiter_match_fast.py` (Original)
  - `backend/app/api/v1/recruiter_match_optimized.py` (Optimized)
  - `backend/app/api/v1/recruiter_match_cached.py` (Cached)
- **Matching Service:** `backend/app/services/enhanced_matching_service.py`

---

**Ready to diagnose! Run the script and let me know what it finds.** 🚀
