# 🔍 Candidate Matching - Diagnostic Flowchart

```
START: Candidate Matching Issue
│
├─ Step 1: Run Diagnostic Script
│  └─ cd backend && python test_recruiter_endpoint.py
│
├─ RESULT A: "Found X candidates" (X > 0)
│  │
│  ├─ Backend ✅ Working
│  │
│  ├─ Check Browser Console
│  │  │
│  │  ├─ Shows candidates? → ✅ FIXED!
│  │  │
│  │  └─ Still shows error?
│  │     │
│  │     └─ Issue: Frontend response handling
│  │        │
│  │        └─ FIX: Check client.ts response mapping
│  │           - Verify: matched_candidates vs candidates
│  │           - Verify: match_score format
│  │           - Check TypeScript types
│  │
│  └─ Next: Fix frontend code
│
├─ RESULT B: "Found 0 candidates"
│  │
│  ├─ Backend ✅ Working (but no matches)
│  │
│  ├─ Check CV Data
│  │  └─ psql: SELECT COUNT(*) FROM cvs;
│  │     │
│  │     ├─ Returns 0 or <100?
│  │     │  └─ Issue: No CV data
│  │     │     │
│  │     │     └─ FIX: Populate CVs
│  │     │        - Find: populate_cvs.py
│  │     │        - Or: seed_database.py
│  │     │        - Run: python [script].py
│  │     │
│  │     └─ Returns 2,500+?
│  │        └─ Issue: Matching filters too strict
│  │           │
│  │           └─ FIX: Lower thresholds
│  │              - Check: min_score (set to 0)
│  │              - Check: location filters
│  │              - Check: skill matching threshold
│  │
│  └─ Next: Add data or adjust filters
│
├─ RESULT C: "500 Internal Server Error"
│  │
│  ├─ Backend ❌ Error
│  │
│  ├─ Check Error Message
│  │  │
│  │  ├─ "KeyError: 'company'"
│  │  │  └─ Issue: User model not updated
│  │  │     │
│  │  │     └─ FIX: Run migration
│  │  │        - cd backend
│  │  │        - python add_company_to_users.py
│  │  │        - Restart backend
│  │  │
│  │  ├─ "No module named 'sentence_transformers'"
│  │  │  └─ Issue: Missing dependency
│  │  │     │
│  │  │     └─ FIX: Install packages
│  │  │        - pip install sentence-transformers
│  │  │        - pip install scikit-learn lightgbm
│  │  │        - Restart backend
│  │  │
│  │  ├─ "Table 'cvs' doesn't exist"
│  │  │  └─ Issue: Database schema
│  │  │     │
│  │  │     └─ FIX: Run migrations
│  │  │        - alembic upgrade head
│  │  │        - Or: Check schema scripts
│  │  │
│  │  └─ "Matching service failed"
│  │     └─ Issue: ML model not loading
│  │        │
│  │        └─ FIX: Check model files
│  │           - Verify: sentence-transformers model
│  │           - Check: model cache directory
│  │           - Try: Re-download model
│  │
│  └─ Next: Fix backend error
│
├─ RESULT D: "Timeout after 30s"
│  │
│  ├─ Backend ⏱️ Too Slow
│  │
│  ├─ Issue: Matching takes too long
│  │
│  └─ FIX: Use optimized endpoint
│     │
│     ├─ Edit: frontend/recruiter/src/lib/api/client.ts
│     │  - Line 97: Change to optimized endpoint
│     │  - /api/recruiter/optimized/job/${jobId}/candidates
│     │
│     └─ Alternative: Use cached endpoint
│        - /api/recruiter/job/${jobId}/candidates/cached
│        - Requires: Pre-computed matches
│
└─ RESULT E: "404 Not Found"
   │
   ├─ Endpoint ❌ Not Found
   │
   ├─ Check URL
   │  │
   │  └─ Verify endpoint path:
   │     - Current: /api/recruiter/job/${jobId}/candidates
   │     - Available:
   │       * /api/recruiter/job/{job_id}/candidates ✅
   │       * /api/recruiter/optimized/job/{job_id}/candidates ✅
   │       * /api/recruiter/job/{job_id}/candidates/cached ✅
   │
   └─ FIX: Use correct endpoint
      - Check: main.py for router mounting
      - Verify: job_id format (e.g., ZANACO_001)
```

---

## 🎯 Quick Decision Tree

### **Question 1:** Does diagnostic script return candidates?

- **YES (X > 0)** → Frontend issue
  - Check browser console
  - Check response mapping
  - Check TypeScript types
  
- **NO (X = 0)** → Data issue
  - Check CV data exists
  - Check matching filters
  - Lower thresholds

- **ERROR (500/404/timeout)** → Backend issue
  - Check error message
  - Install dependencies
  - Fix endpoint URL
  - Use optimized version

---

## 📊 Probability Tree

```
Candidate Matching Issue
│
├─ 70% - CV Data Missing/Sparse
│  └─ Fix: Add CVs or lower match threshold
│
├─ 15% - Backend Error
│  └─ Fix: Install dependencies or fix schema
│
├─ 10% - Frontend Response Handling
│  └─ Fix: Update response mapping
│
└─ 5% - Endpoint URL Mismatch
   └─ Fix: Use correct endpoint path
```

---

## ✅ Success Path

```
Run Diagnostic
    ↓
Found 15+ candidates
    ↓
Check browser
    ↓
Candidates appear!
    ↓
✅ DONE!
```

---

## ❌ Most Common Failure Paths

### **Path 1: No CV Data (70%)**
```
Run Diagnostic
    ↓
Found 0 candidates
    ↓
Check database: SELECT COUNT(*) FROM cvs;
    ↓
Returns 0 or very few
    ↓
Add CV data
    ↓
Re-run diagnostic
    ↓
✅ Found candidates!
```

### **Path 2: Backend Error (15%)**
```
Run Diagnostic
    ↓
500 Error: No module 'sentence_transformers'
    ↓
pip install sentence-transformers
    ↓
Restart backend
    ↓
Re-run diagnostic
    ↓
✅ Found candidates!
```

### **Path 3: Slow Matching (10%)**
```
Run Diagnostic
    ↓
Timeout after 30s
    ↓
Edit client.ts → Use optimized endpoint
    ↓
Restart frontend
    ↓
Test in browser
    ↓
✅ Candidates appear in 2-3s!
```

---

## 💡 Key Insights

1. **Diagnostic script is THE key** - It tests backend directly
2. **If script works, backend is fine** - Issue is in frontend
3. **If script fails, backend needs fixing** - Follow error message
4. **Most common: CV data missing** - Check database first
5. **Least common: Frontend bug** - But easy to fix

---

## 🚀 Ready to Diagnose?

**Run this command and see which path you follow:**

```bash
cd C:\Dev\ai-job-matchingV2\backend
python test_recruiter_endpoint.py
```

**Then follow the flowchart above!** 📈
