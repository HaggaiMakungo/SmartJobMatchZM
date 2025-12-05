# 🚀 Sprint A - Quick Start Guide

## ⚡ TL;DR (30 Seconds)

```bash
cd C:\Dev\ai-job-matchingV2\backend

# 1. Run tests
python test_gating_manual.py

# 2. Restart backend
python -m uvicorn app.main:app --reload

# 3. Test in browser
# Login: zesco@company.zm / password123
# Go to Jobs → Select job → Check candidates
```

---

## 📋 What's New

### **New Endpoint:**
```
GET /api/recruiter/gated/job/{job_id}/candidates
```

**Features:**
- ✅ Hard gate: 0 matched skills → excluded
- ✅ No base score padding
- ✅ Min score filter (default 45%)
- ✅ Transparent scoring

**Query Params:**
- `min_score` (float, 0-1): Minimum match threshold (default: 0.45)
- `limit` (int, 1-100): Max results (default: 20)

---

## 🧪 Testing

### **1. Run Unit Tests**
```bash
pytest tests/test_gating_patch.py -v
```

**Expected output:**
```
test_zero_skills_excluded PASSED
test_partial_skills_included PASSED
test_no_base_score_padding PASSED
test_high_skill_match_high_score PASSED
test_experience_scoring PASSED
test_location_scoring PASSED
```

---

### **2. Run Manual Test**
```bash
python test_gating_manual.py
```

**What it checks:**
- ✅ Gate 1: 0 matched skills excluded
- ✅ Gate 2: Min score threshold respected
- ✅ Funnel: Higher threshold → fewer candidates
- ✅ No candidates with 0 skills appear

**Expected output:**
```
✅ Found X candidates with min_score=0%
✅ PASS: No candidates with 0 matched skills!
✅ GATING PATCH TEST COMPLETE
```

---

### **3. Test API Directly**
```bash
# Using curl (or Postman)
curl -X GET "http://localhost:8000/api/recruiter/gated/job/JOB_001/candidates?min_score=0.45&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### **4. Test in Frontend**

**Update Frontend API Client:**

Edit: `frontend/recruiter/src/lib/api/client.ts`

```typescript
// Line ~97, change from:
const response = await this.client.get(`/api/recruiter/job/${jobId}/candidates`, { params });

// TO:
const response = await this.client.get(`/api/recruiter/gated/job/${jobId}/candidates`, { params });
```

**Then test:**
1. Clear browser cache (F12 → Application → Clear Storage)
2. Login: `zesco@company.zm` / `password123`
3. Go to Jobs page
4. Select any job
5. Set min score slider to 0%
6. **Verify:** All candidates shown have at least 1 matched skill
7. Set min score slider to 50%
8. **Verify:** Only high-quality matches shown

---

## 🔍 Debug Endpoint

**New debug endpoint to understand gating:**
```
GET /api/recruiter/gated/job/{job_id}/candidates/debug
```

**Returns:**
```json
{
  "job_id": "JOB_001",
  "job_title": "Software Developer",
  "job_skills": ["Python", "Django", "PostgreSQL"],
  "stats": {
    "total_cvs": 2500,
    "gate_1_passed": 350,  // Has at least 1 skill
    "gate_1_failed": 2150,
    "gate_1_pass_rate": "14.0%",
    "gate_2_passed": 120,  // Score >= 45%
    "gate_2_failed": 230,
    "gate_2_pass_rate": "34.3%"
  }
}
```

**Use this to:**
- Understand why certain candidates don't appear
- Verify gates are working
- Tune the min_score threshold

---

## 📊 Comparison: Before vs After

### **BEFORE (Bug):**
```
Job: Python Developer (requires Python, Django, SQL)

Candidate 1:
  Skills: JavaScript, React, Node.js
  Matched: []
  Missing: [Python, Django, SQL]
  Score: 42%  ❌ FAKE SCORE (from experience+location)
  Status: SHOWN ❌
```

### **AFTER (Fixed):**
```
Job: Python Developer (requires Python, Django, SQL)

Candidate 1:
  Skills: JavaScript, React, Node.js
  Matched: []
  Missing: [Python, Django, SQL]
  Status: EXCLUDED ✅ (Gate 1: 0 skills matched)

Candidate 2:
  Skills: Python, Java, PostgreSQL
  Matched: [Python, PostgreSQL]
  Missing: [Django]
  Score: 68%  ✅ REAL SCORE
  Status: SHOWN ✅
```

---

## ⚙️ Configuration

**Adjust thresholds in:** `app/services/gated_matching_service.py`

```python
# Line ~17
MIN_MATCH_THRESHOLD = 0.45  # Default: 45%

# Line ~20-24
WEIGHTS = {
    'skills': 0.80,      # 80% - Primary signal
    'experience': 0.15,  # 15% - Secondary
    'location': 0.05,    # 5% - Minor bonus
}
```

---

## 🚨 Known Issues

### **Issue: Too Few Candidates**
**Symptom:** No candidates appear even with min_score=0

**Cause:** Job has skills that don't match any CVs

**Solution:**
1. Run debug endpoint to see stats
2. Check if gate_1_passed > 0
3. If 0, job skills don't match ANY CV skills
4. Review job skill requirements

---

### **Issue: All Candidates Score Low**
**Symptom:** Max score is 40-50% even for good matches

**Cause:** Job has many required skills, partial matches score low

**Solution:**
1. Review job skill requirements (too many?)
2. Consider splitting required vs preferred skills
3. Adjust weights if needed

---

## 🔄 Rollback

If Sprint A breaks something:

```bash
# 1. Switch backend to old endpoint
# Edit: app/main.py
# Comment out the gated router

# 2. Switch frontend back
# Edit: frontend/recruiter/src/lib/api/client.ts
# Change back to: /api/recruiter/job/${jobId}/candidates

# 3. Restart
python -m uvicorn app.main:app --reload
```

---

## ✅ Success Criteria

Sprint A is successful if:

- [ ] Unit tests pass
- [ ] Manual test shows no 0-skill candidates
- [ ] Frontend shows only relevant matches
- [ ] Min score slider works correctly
- [ ] Debug endpoint provides useful stats
- [ ] No performance degradation

---

## 🎯 Next Steps

**After Sprint A works:**

1. **Sprint B:** Add pgvector and schema migrations
2. **Sprint C:** Implement background matching
3. **Sprint D:** Add monitoring and offline eval

**But first, let's make sure Sprint A is solid!** 🚀

---

## 📞 Need Help?

**Check logs:**
```bash
# Backend logs (look for errors)
# Terminal running: python -m uvicorn app.main:app --reload

# Frontend logs
# F12 → Console (in browser)
```

**Common issues:**
1. Import errors → `pip install -r requirements.txt`
2. Module not found → Check file paths
3. Database errors → Check DB connection

---

**Ready to test!** Run `python test_gating_manual.py` now! 🎉
