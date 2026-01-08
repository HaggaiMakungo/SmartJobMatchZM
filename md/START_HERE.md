# 🎯 WHAT TO DO NOW - Step-by-Step

## ⚡ 3-Minute Quick Start

### 1. Open 3 Windows

**Terminal 1 - Backend:**
```bash
cd C:\Dev\ai-job-matchingV2\backend
python test_recruiter_endpoint.py
```

**Terminal 2 - Backend Logs:**
```bash
cd C:\Dev\ai-job-matchingV2\backend
# Look at existing terminal running: python -m uvicorn app.main:app --reload
```

**Browser - Frontend:**
1. Go to `http://localhost:3000/login`
2. Login: `zanaco@company.zm` / `password123`
3. Click "Jobs" in sidebar
4. Press F12 → Console tab
5. Select a job from dropdown
6. Watch for errors

---

### 2. Collect These 3 Outputs

**A. Diagnostic Script Output:**
```bash
# Terminal 1 will show:
✅ Login successful!
✅ Found X jobs
📋 Testing with job: ...
✅/❌ Success/Failed: ...
```

**Copy this entire output!**

---

**B. Backend Logs:**
```bash
# Terminal 2 should show when you select a job:
INFO: 127.0.0.1:xxxxx - "GET /api/recruiter/job/..." 200/404/500
```

**Copy any errors or unusual logs!**

---

**C. Browser Console:**
```javascript
// Browser console will show:
Failed to fetch candidates: AxiosError
Error details: {
  message: "...",
  response: {...},
  status: XXX,
  url: "..."
}
```

**Copy the Error details object!**

---

### 3. Paste All 3 Outputs Here

Once you have all 3 outputs, paste them and I'll tell you:
- ✅ Exactly what's wrong
- ✅ Exactly how to fix it
- ✅ Step-by-step commands

---

## 🔍 What Each Output Tells Us

### Diagnostic Script Results

**If you see:**
```
✅ Found 15 candidates
```
→ Backend works! Issue is in frontend.

**If you see:**
```
✅ Found 0 candidates
```
→ CV data missing or matching filters too strict.

**If you see:**
```
❌ Failed: 500 Internal Server Error
```
→ Backend error. Check matching service.

**If you see:**
```
❌ Timeout after 30s
```
→ Matching too slow. Need optimized endpoint.

---

### Backend Logs Tell Us

**If you see:**
```
INFO: ... "GET /api/recruiter/job/ZANACO_001/candidates" 200
```
→ Request succeeded! Check frontend response handling.

**If you see:**
```
ERROR: KeyError: 'company'
```
→ User model not updated. Run migration.

**If you see:**
```
ERROR: No module named 'sentence_transformers'
```
→ Missing dependency. Run: `pip install sentence-transformers`

**If you see:**
```
ERROR: Matching service failed to initialize
```
→ ML model issue. Check model files.

---

### Browser Console Tells Us

**If you see:**
```
status: 404
```
→ Endpoint not found. Check URL.

**If you see:**
```
status: 500
```
→ Server error. Check backend logs.

**If you see:**
```
status: 403
```
→ Forbidden. Company mismatch.

**If you see:**
```
message: "timeout of 120000ms exceeded"
```
→ Matching too slow. Use optimized endpoint.

---

## 🎯 Most Common Fixes

### Fix #1: CV Data Missing (70% chance this is it)

**Check:**
```bash
psql -U postgres -d camss_db -c "SELECT COUNT(*) FROM cvs;"
```

**If returns 0 or very few:**
You need CV data! Check if there's a script like:
```bash
python populate_cvs.py
# or
python seed_database.py
```

---

### Fix #2: Use Optimized Endpoint (20% chance)

**Edit:** `frontend/recruiter/src/lib/api/client.ts`

**Line 97, change from:**
```typescript
/api/recruiter/job/${jobId}/candidates
```

**To:**
```typescript
/api/recruiter/optimized/job/${jobId}/candidates
```

**Save and refresh browser.**

---

### Fix #3: Missing Dependencies (10% chance)

```bash
cd C:\Dev\ai-job-matchingV2\backend
pip install sentence-transformers scikit-learn lightgbm
```

**Then restart backend:**
```bash
python -m uvicorn app.main:app --reload
```

---

## ✅ Success Looks Like

After fixing, you should see:

**Terminal 1 (Diagnostic):**
```
✅ Login successful!
✅ Found 8 jobs
📋 Testing with job: Bank Teller (ID: ZANACO_001)
✅ Success! Found 15 candidates
   First candidate: John Banda
   Match score: 0.85
```

**Terminal 2 (Backend):**
```
INFO: ... "GET /api/recruiter/job/ZANACO_001/candidates" 200 OK
🎯 Processing ZANACO_001...
✅ Found 15 matches
✅ Complete in 2.34s
```

**Browser:**
```
Jobs fetched: 8
Candidates response: {
  matched_candidates: [15 candidates],
  total_candidates: 15
}
```

**And on screen:**
- Grid of candidate cards appears
- Match scores show (e.g., 85%, 78%, 72%)
- No errors in console

---

## 📞 If You Get Stuck

**Paste these 3 things:**

1. **Diagnostic script output** (full terminal output)
2. **Backend logs** (any errors from uvicorn terminal)
3. **Browser console error** (the "Error details" object)

**I'll diagnose immediately and give you exact fix!** 🚀

---

## 🎬 Ready? Let's Go!

1. Open 3 windows (Terminal 1, Terminal 2, Browser)
2. Run diagnostic script
3. Try to load candidates in browser
4. Copy all 3 outputs
5. Paste here

**I'm standing by to help!** 🔥

---

## 💡 Pro Tip

If diagnostic script shows **"Found X candidates"** but browser still fails:

→ The backend is working!  
→ Issue is in frontend code (probably response format mismatch)  
→ Check the `getCandidatesForJob` function in `client.ts`

If diagnostic script shows **"Found 0 candidates"**:

→ Backend works but no matches found  
→ Check CV data in database  
→ Or lower the matching score threshold

If diagnostic script shows **errors**:

→ Backend issue  
→ Check what error it says  
→ Usually dependencies or database problem

---

**GO! Run the diagnostic now!** ⚡
