# 🔍 Performance Diagnostic Guide

## What the Logs Tell Us

When you run `python test_gating_manual.py`, watch these metrics:

---

## 📊 Key Metrics to Watch

### **1. Job Skill Extraction**
```
⏱️  Job skill extraction: 0.15s
```

**What it measures:** Time to parse job requirements and normalize skills

**Expected:** <0.5s
**If slow (>1s):** Job has too many skills or normalization is broken

---

### **2. Database Query**
```
⏱️  Database query: 2.34s
```

**What it measures:** Time to fetch all CVs from PostgreSQL

**Expected:** 1-3s for 2500 CVs
**If slow (>5s):** Database connection issues or missing indexes

**Fix if slow:**
```sql
CREATE INDEX idx_cvs_skills ON cvs USING gin(to_tsvector('english', skills_technical));
```

---

### **3. First Skill Match (Model Loading)**
```
⏱️  First skill match: 3.456s (includes model loading)
```

**What it measures:** Time for FIRST semantic skill match (includes loading sentence-transformer model)

**Expected:** 2-5s (one-time cost)
**If slow (>10s):** 
- Model download issues
- CPU/RAM constraints
- Can be cached for future calls

**This is NORMAL and EXPECTED!** The model only loads once.

---

### **4. Processing Speed**
```
Progress: 100/2500 CVs (15 matches) | 45.2 CVs/sec | ETA: 53.1s
```

**What it measures:** How fast we process CVs after model is loaded

**Expected:** 40-60 CVs/sec
**If slow (<20 CVs/sec):** 
- Semantic matching bottleneck
- Need Sprint B optimization (precompute)

---

### **5. Gate Effectiveness**
```
📈 Matching Summary:
   Gated out (no skills): 1456  ← 58% removed at Gate 1
   Gated out (low score): 654   ← 26% removed at Gate 2
   Final matches: 390           ← 16% pass both gates
```

**What it measures:** How many CVs each gate removes

**Expected distribution:**
- Gate 1 (no skills): 40-70%
- Gate 2 (low score): 20-40%
- Final matches: 10-30%

**If Gate 1 removes <20%:** Job requirements too broad
**If Gate 1 removes >80%:** Job requirements too specific or CV data quality issues

---

### **6. Total Time**
```
Total time: 55.67s (44.9 CVs/sec)
```

**What it measures:** End-to-end matching time

**Sprint A Target:** 40-60s for 2500 CVs
**Sprint B Target:** <5s (with precompute)
**Sprint C Target:** <100ms (with cache table)

---

## 🎯 Performance Targets by Sprint

| Metric | Sprint A (Now) | Sprint B (Optimize) | Sprint C (Cache) |
|--------|----------------|---------------------|------------------|
| **First load** | 40-60s | 5-10s | <100ms |
| **Cached load** | 40-60s | 2-5s | <100ms |
| **CVs/sec** | 40-60 | 200-500 | N/A (instant) |
| **Gate 1 filter** | Yes | Yes | Pre-filtered |
| **Gate 2 filter** | Yes | Yes | Pre-filtered |
| **Model load** | 2-5s (once) | 2-5s (once) | Precomputed |

---

## 🚨 Red Flags to Watch For

### **🔴 Database query >5s**
```
⏱️  Database query: 8.45s  ← TOO SLOW!
```
**Problem:** Database connection or missing indexes
**Fix:** Add indexes, check connection pool

---

### **🔴 First skill match >10s**
```
⏱️  First skill match: 15.234s  ← TOO SLOW!
```
**Problem:** Model download or hardware constraints
**Fix:** Pre-download model, upgrade hardware, or disable semantic matching

---

### **🔴 Processing speed <20 CVs/sec**
```
Progress: 100/2500 CVs | 12.3 CVs/sec | ETA: 195.1s  ← TOO SLOW!
```
**Problem:** Semantic matching bottleneck
**Action:** STOP Sprint A, move to Sprint B (precompute)

---

### **🔴 Gate 1 removes <10% or >90%**
```
Gated out (no skills): 23  ← Only 0.9%?? Something's wrong!
```
**Problem:** Gate not working or CV data issues
**Fix:** Debug `_intersect_skills()` method

---

### **🔴 Gate 2 removes >80%**
```
Gated out (low score): 2103  ← 84% removed??
```
**Problem:** Score threshold too high or scoring formula broken
**Fix:** Lower `MIN_MATCH_THRESHOLD` or debug scoring

---

## 🔬 Diagnostic Commands

### **Check CV count:**
```bash
psql -U postgres -d camss_db -c "SELECT COUNT(*) FROM cvs;"
```

### **Check CV skills quality:**
```bash
psql -U postgres -d camss_db -c "
SELECT 
    COUNT(*) as total,
    COUNT(skills_technical) as has_tech_skills,
    COUNT(skills_soft) as has_soft_skills,
    AVG(LENGTH(skills_technical)) as avg_skill_length
FROM cvs;
"
```

### **Check model file:**
```bash
ls -la ~/.cache/torch/sentence_transformers/
```

### **Check database performance:**
```bash
psql -U postgres -d camss_db -c "EXPLAIN ANALYZE SELECT * FROM cvs;"
```

---

## 📋 Expected Output (Good Run)

```
🧪 SPRINT A - GATING PATCH TEST
============================================================

📋 Testing with job:
   ID: JOB000070
   Title: Photographer
   Skills: Photography, Photo Editing, Equipment Knowledge

------------------------------------------------------------
TEST 1: Min score = 0%
------------------------------------------------------------
✅ Semantic matching enabled (all-MiniLM-L6-v2)

⏱️  Job skill extraction: 0.12s                        ← ✅ Fast
⏱️  Database query: 1.89s                              ← ✅ Acceptable

📊 Processing 2500 CVs...
⏱️  First skill match: 2.345s (includes model loading) ← ✅ One-time cost
   Progress: 100/2500 CVs (12 matches) | 42.7 CVs/sec | ETA: 56.2s
   Progress: 200/2500 CVs (23 matches) | 45.1 CVs/sec | ETA: 51.0s
   ...

📈 Matching Summary:
   Total CVs processed: 2500                          ← ✅ All processed
   Gated out (no skills): 1456                        ← ✅ 58% at Gate 1
   Gated out (low score): 654                         ← ✅ 26% at Gate 2
   Final matches: 390                                 ← ✅ 16% pass
   Total time: 51.76s (48.3 CVs/sec)                  ← ✅ Sprint A target

✅ Found 390 candidates
   Top 5 candidates:
   1. John Banda (87.5%) - Photography, Photo Editing
   2. Sarah Mwansa (84.2%) - Photography, Equipment Knowledge
   ...

✅ PASS: No candidates with 0 matched skills!          ← ✅ Gate 1 works
✅ PASS: All candidates >= 0% threshold!               ← ✅ Gate 2 works
```

---

## 🎯 What Success Looks Like

✅ **Total time: 40-60s** (Sprint A is OK)
✅ **Processing speed: 40-60 CVs/sec**
✅ **Gate 1 removes: 40-70%** (working correctly)
✅ **Gate 2 removes: 20-40%** (working correctly)
✅ **No 0-skill matches pass Gate 1**
✅ **No sub-threshold matches pass Gate 2**

---

## ⚡ What to Do After Test

### **If performance is acceptable (40-60s):**
1. ✅ Sprint A complete!
2. Move to Sprint B (optimize)
3. Test in frontend

### **If performance is slow (>90s):**
1. ❌ Identify bottleneck (model loading? database? matching?)
2. Fix immediate issue
3. Consider skipping to Sprint C (cache table)

### **If gates aren't working:**
1. ❌ Debug gate logic
2. Check CV data quality
3. Adjust thresholds

---

**Now run the test and paste the FULL output!** 🚀

We'll analyze it together and decide the next move.
