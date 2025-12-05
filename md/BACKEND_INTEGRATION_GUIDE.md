# 🚀 BACKEND INTEGRATION COMPLETE - Setup Guide

## 📋 What Was Done

### 1. **Fixed Dashboard Tagline** ✅
- Moved tagline from sidebar to top bar
- Full tagline now visible: "The Play's the Thing Wherein We'll Catch Your Next King"
- Shows on medium+ screens, hides on mobile

### 2. **Created Application System** ✅

#### Backend Files Created:
- `app/models/application.py` - Application database model
- `app/schemas/application.py` - Pydantic schemas for API
- `app/services/application_service.py` - Business logic
- `app/api/v1/application.py` - API endpoints
- `seed_applications.py` - Seed script for test data

#### Application Features:
- ✅ Application status pipeline: NEW → SCREENING → INTERVIEW → OFFER → HIRED/REJECTED
- ✅ Match scores (0-100%)
- ✅ Cover letters
- ✅ Recruiter notes
- ✅ Interview scheduling
- ✅ Star ratings (1-5)
- ✅ Tags for organization
- ✅ Bulk operations
- ✅ Statistics & analytics

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

```bash
cd C:\Dev\ai-job-matchingV2\backend

# Create applications table and seed data
python seed_applications.py
```

This will:
- Create the `applications` table
- Seed 40-80 test applications from existing CVs to existing jobs
- Show statistics by status

### Step 2: Restart Backend

```bash
# Stop current backend (Ctrl+C)
# Then restart:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Verify API

Visit: http://localhost:8000/docs

Check these new endpoints:
- `POST /api/v1/applications/apply` - Submit application
- `GET /api/v1/applications` - List all applications (recruiter)
- `GET /api/v1/applications/{id}` - Get application details
- `PATCH /api/v1/applications/{id}/status` - Update status
- `GET /api/v1/applications/stats/overview` - Get statistics
- `POST /api/v1/applications/bulk/update-status` - Bulk update
- `GET /api/v1/applications/job/{job_id}` - Get job applications
- `GET /api/v1/applications/my-applications` - Candidate's applications

---

## 📊 Database Schema

### Applications Table

```sql
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    cv_id VARCHAR NOT NULL REFERENCES cvs(cv_id),
    job_id VARCHAR NOT NULL,
    job_type VARCHAR NOT NULL,  -- 'corporate' or 'small'
    status VARCHAR NOT NULL DEFAULT 'new',
    match_score FLOAT,
    cover_letter TEXT,
    notes TEXT,  -- Recruiter notes
    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    interview_date TIMESTAMP,
    interview_notes TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    tags JSONB,
    
    INDEX idx_cv_id (cv_id),
    INDEX idx_job_id (job_id),
    INDEX idx_status (status),
    INDEX idx_match_score (match_score),
    INDEX idx_applied_at (applied_at)
);
```

---

## 🎯 API Integration Points

### For Recruiter Dashboard:

#### 1. **Dashboard Home** (`/dashboard/page.tsx`)
```typescript
// Get overview stats
const statsRes = await fetch('http://localhost:8000/api/v1/applications/stats/overview');
const stats = await statsRes.json();

// Get recent applications
const appsRes = await fetch('http://localhost:8000/api/v1/applications?limit=10');
const recentApps = await appsRes.json();
```

#### 2. **Jobs Page** (`/dashboard/jobs/page.tsx`)
```typescript
// Get candidates for specific job
const res = await fetch(`http://localhost:8000/api/v1/applications/job/${jobId}`);
const applications = await res.json();

// These are the "candidates" - they're applicants with match scores
```

#### 3. **Applications Page** (`/dashboard/applications/page.tsx`)
```typescript
// List all applications
const res = await fetch('http://localhost:8000/api/v1/applications');
const data = await res.json();

// Update application status (drag & drop)
await fetch(`http://localhost:8000/api/v1/applications/${appId}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'interview' })
});

// Bulk update
await fetch('http://localhost:8000/api/v1/applications/bulk/update-status', {
  method: 'POST',
  body: JSON.stringify({
    application_ids: [1, 2, 3],
    new_status: 'screening'
  })
});
```

#### 4. **Candidates Page** (`/dashboard/candidates/page.tsx`)
```typescript
// Get all candidates (from CVs table)
const res = await fetch('http://localhost:8000/api/v1/cv/list');
const candidates = await res.json();

// Calculate match score for candidate against job
const matchRes = await fetch('http://localhost:8000/api/v1/match/calculate', {
  method: 'POST',
  body: JSON.stringify({
    cv_id: candidateId,
    job_id: selectedJobId
  })
});
const matchScore = await matchRes.json();
```

#### 5. **Analytics Page** (`/dashboard/analytics/page.tsx`)
```typescript
// Get application statistics
const statsRes = await fetch('http://localhost:8000/api/v1/applications/stats/overview');
const stats = await statsRes.json();

// Get applications over time (for charts)
const appsRes = await fetch('http://localhost:8000/api/v1/applications?limit=1000');
const allApps = await appsRes.json();

// Process for time-series charts, funnel analysis, etc.
```

---

## 🔄 Data Flow

### Current State:
1. ✅ **CVs Table** - Contains real candidate profiles (from your CSV)
2. ✅ **Corporate Jobs Table** - Contains real job postings
3. ✅ **Small Jobs Table** - Contains gig/task postings
4. ✅ **Applications Table** - NEW! Links CVs to Jobs

### How It Works:
```
Candidate (CV) → Application → Job (Corporate/Small)
    ↓               ↓              ↓
[CVs Table]  [Applications]  [Jobs Table]
```

When a candidate applies to a job:
1. System finds their CV by email
2. Creates Application record linking CV → Job
3. Calculates match score
4. Sets status to "NEW"
5. Recruiter sees it in dashboard

---

## 📝 Example Data Flow

### Creating an Application (Job Seeker Side):
```python
# Job seeker clicks "Apply" button
POST /api/v1/applications/apply
{
  "job_id": "JOB-001",
  "job_type": "corporate",
  "cover_letter": "I am interested in this position..."
}

# Backend:
# 1. Gets user's CV from their email
# 2. Calculates match score
# 3. Creates application
# 4. Returns application with ID
```

### Viewing Applications (Recruiter Side):
```python
# Recruiter opens Applications page
GET /api/v1/applications?limit=50

# Returns:
{
  "total": 127,
  "applications": [
    {
      "id": 1,
      "cv_id": "CV-001",
      "job_id": "JOB-001",
      "status": "new",
      "match_score": 87.5,
      "candidate_name": "John Doe",
      "candidate_email": "john@example.com",
      "job_title": "Software Engineer",
      "company": "TechCorp",
      "applied_at": "2025-01-15T10:30:00",
      ...
    },
    ...
  ]
}
```

### Moving Application Through Pipeline:
```python
# Recruiter drags application to "Interview" column
PATCH /api/v1/applications/1/status
{
  "status": "interview"
}

# Or updates with notes:
PATCH /api/v1/applications/1
{
  "status": "interview",
  "interview_date": "2025-01-20T14:00:00",
  "notes": "Great technical skills, schedule interview",
  "rating": 4
}
```

---

## 🎨 Frontend Integration TODO

Now you need to connect the frontend to these endpoints. Here's the priority order:

### Phase 1: Critical Pages ⚡
1. **Dashboard Home** - Replace mock data with real stats from `/applications/stats/overview`
2. **Applications Page** - Connect Kanban board to real applications API
3. **Jobs Page** - Show real applications for each job

### Phase 2: Important Pages 🔥
4. **Candidates Page** - Use CV list API + calculate match scores
5. **Analytics Page** - Use real application data for charts
6. **Notifications** - Trigger on new applications

### Phase 3: Nice to Have 🌟
7. **Settings** - Connect to user profile endpoints
8. **Talent Pools** - Create backend endpoints for pools

---

## 🔌 Next Steps

### 1. Create API Service File

Create `frontend/recruiter/src/lib/api.ts`:

```typescript
const API_BASE = 'http://localhost:8000/api/v1';

export const api = {
  // Applications
  async getApplications(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    job_id?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/applications?${query}`);
    return res.json();
  },
  
  async getApplicationStats(job_id?: string) {
    const query = job_id ? `?job_id=${job_id}` : '';
    const res = await fetch(`${API_BASE}/applications/stats/overview${query}`);
    return res.json();
  },
  
  async updateApplicationStatus(id: number, status: string) {
    const res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },
  
  // Jobs
  async getJobs() {
    const res = await fetch(`${API_BASE}/jobs/all`);
    return res.json();
  },
  
  async getJob(id: string, type: string) {
    const res = await fetch(`${API_BASE}/jobs/${id}?job_type=${type}`);
    return res.json();
  },
  
  // Candidates (CVs)
  async getCandidates(params?: {
    skip?: number;
    limit?: number;
    city?: string;
    province?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/cv/list?${query}`);
    return res.json();
  },
  
  // Add authentication header to all requests
  setAuthToken(token: string) {
    // Store token and add to all future requests
  }
};
```

### 2. Update Each Page

Example for Applications page:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadApplications();
  }, []);
  
  const loadApplications = async () => {
    try {
      const data = await api.getApplications({ limit: 100 });
      setApplications(data.applications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      // Refresh data
      await loadApplications();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  // Rest of component...
}
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Applications table created in database
- [ ] Test applications seeded (40-80 records)
- [ ] Backend API docs show application endpoints
- [ ] Can fetch applications: `curl http://localhost:8000/api/v1/applications`
- [ ] Can get stats: `curl http://localhost:8000/api/v1/applications/stats/overview`
- [ ] Dashboard tagline visible in top bar
- [ ] Frontend connects to real data (after integration)

---

## 🎯 Summary

**What You Have Now:**
- ✅ Real CV data (candidates from your CSV)
- ✅ Real job data (corporate & small jobs)
- ✅ Real application data (CVs → Jobs linkage)
- ✅ Full API to manage applications
- ✅ Status pipeline (NEW → HIRED/REJECTED)
- ✅ Match scoring system
- ✅ Bulk operations
- ✅ Statistics & analytics

**What's Next:**
1. Run `seed_applications.py` to create test data
2. Restart backend
3. Create `frontend/recruiter/src/lib/api.ts` service
4. Connect each frontend page to the API
5. Test the full flow

**You're ready to build the complete ecosystem! 🚀**
