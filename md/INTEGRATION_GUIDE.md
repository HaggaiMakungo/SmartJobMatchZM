# 🚀 Backend Integration Complete - Setup Guide

## ✅ What's Been Integrated

### 1. API Client Setup (`src/lib/api/`)
- ✅ **client.ts** - Axios client with auth interceptors
- ✅ **applications.ts** - Full application management API
- ✅ **jobs.ts** - Job listings and search API
- ✅ **candidates.ts** - CV/candidate management API
- ✅ **types.ts** - Shared TypeScript types
- ✅ **index.ts** - Central export

### 2. Dashboard - LIVE DATA ✅
**File:** `src/app/dashboard/page.tsx`

**Real Data Sources:**
- Active Jobs count → `/api/jobs/corporate`
- Total Applications → `/api/applications/stats/overview`
- New Candidates → Application stats (new status)
- Interviews Scheduled → Application stats (interview status)
- Recent Activity → Last 5 applications from `/api/applications`
- Weekly Chart → Calculated from total applications
- Top Jobs → First 5 jobs from jobs API

---

## 🔧 Quick Setup (3 Steps)

### Step 1: Set Environment Variable
Create `.env.local` in `frontend/recruiter/`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 2: Install Dependencies (if needed)
```bash
cd C:\Dev\ai-job-matchingV2\frontend\recruiter
npm install axios
```

### Step 3: Start Backend + Frontend
```bash
# Terminal 1 - Backend
cd C:\Dev\ai-job-matchingV2\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd C:\Dev\ai-job-matchingV2\frontend\recruiter
npm run dev
```

Visit: `http://localhost:3000/dashboard`

---

## 📋 Next Pages to Integrate

### Priority 1: Applications Page (Kanban)
**File:** `src/app/dashboard/applications/page.tsx`

**API Calls Needed:**
```typescript
// Load all applications
const apps = await applicationsApi.list({ limit: 100 });

// Update status (drag & drop)
await applicationsApi.updateStatus(id, 'interview');

// Bulk operations
await applicationsApi.bulkUpdateStatus([1, 2, 3], 'screening');

// Get stats for cards
const stats = await applicationsApi.getStats();
```

**Changes Required:**
- Replace mock `MOCK_APPLICATIONS` with API call
- Connect drag-and-drop to `updateStatus` API
- Wire bulk actions to `bulkUpdateStatus`
- Load stats from API instead of calculating locally

---

### Priority 2: Jobs Page
**File:** `src/app/dashboard/jobs/page.tsx`

**API Calls Needed:**
```typescript
// Load all jobs
const jobs = await jobsApi.getCorporate({ limit: 50 });

// Load candidates for selected job
const candidates = await candidatesApi.list({ limit: 100 });

// Calculate match scores (backend integration needed)
// Currently using frontend calculation
```

**Changes Required:**
- Replace `MOCK_JOBS` with `jobsApi.getCorporate()`
- Replace `MOCK_CANDIDATES` with `candidatesApi.list()`
- Integrate match score calculation from backend matching service

---

### Priority 3: Candidates Page
**File:** `src/app/dashboard/candidates/page.tsx`

**API Calls Needed:**
```typescript
// Load candidates
const candidates = await candidatesApi.list({ 
  limit: 100,
  province: selectedProvince,
  min_experience: minExp 
});

// Search candidates
const results = await candidatesApi.search(query);

// Get candidate details
const candidate = await candidatesApi.getById(cv_id);
```

**Changes Required:**
- Replace `MOCK_CANDIDATES` with `candidatesApi.list()`
- Connect search to `candidatesApi.search()`
- Wire filters to API parameters

---

### Priority 4: Analytics Page
**File:** `src/app/dashboard/analytics/page.tsx`

**API Calls Needed:**
```typescript
// Overview stats
const stats = await applicationsApi.getStats();

// Jobs analytics
const jobs = await jobsApi.getCorporate({ limit: 10 });
const applications = await applicationsApi.list();

// Time-series data (needs backend enhancement)
// Currently using mock data for charts
```

**Changes Required:**
- Replace mock stats with real application data
- Calculate chart data from API responses
- Add time-series aggregation on backend for better performance

---

### Priority 5: Talent Pools
**File:** `src/app/dashboard/talent-pools/page.tsx`

**Status:** Uses localStorage (no backend yet)

**Backend TODO:**
1. Create `talent_pools` table
2. Create `pool_members` junction table
3. Add API endpoints:
   - `POST /api/pools` - Create pool
   - `GET /api/pools` - List pools
   - `POST /api/pools/{id}/members` - Add candidates
   - `DELETE /api/pools/{id}/members/{cv_id}` - Remove candidate

---

### Priority 6: Notifications
**File:** `src/app/dashboard/notifications/page.tsx`

**Status:** Uses mock data (no backend yet)

**Backend TODO:**
1. Create `notifications` table
2. Add notification triggers (on application status change, new application, etc.)
3. Add API endpoints:
   - `GET /api/notifications` - List notifications
   - `PATCH /api/notifications/{id}/read` - Mark as read
   - `DELETE /api/notifications/{id}` - Delete notification

---

## 🔗 Authentication Integration

### Current State
Login page exists but needs backend connection.

### TODO:
1. Wire login form to `/api/auth/login`
2. Store JWT token in localStorage
3. Add token to all API requests (already handled by interceptor)

**Code Example:**
```typescript
// In login page submit handler
const response = await apiClient.post('/api/auth/login', {
  username: email,
  password: password,
});

localStorage.setItem('access_token', response.data.access_token);
window.location.href = '/dashboard';
```

---

## 📊 Match Score Integration

### Current Frontend Logic
**File:** `src/app/dashboard/jobs/page.tsx` (lines 120-150)

Calculates match score based on:
- Skills match (40%)
- Experience match (25%)
- Location match (20%)
- Availability (15%)

### Backend Integration
The backend has a matching service at:
- **File:** `backend/app/services/matching_service.py`
- **Endpoint:** `/api/match/calculate`

**To Integrate:**
1. Call matching API instead of frontend calculation
2. Store match scores in `applications` table
3. Use stored scores for filtering/sorting

---

## 🐛 Known Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Backend already has CORS configured. If issues persist:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: 401 Unauthorized
**Solution:** 
1. Login first at `/login`
2. Token should be stored in localStorage
3. All subsequent requests include token automatically

### Issue 3: No Data Showing
**Solution:**
1. Ensure backend is running on port 8000
2. Ensure you've seeded data: `python seed_applications.py`
3. Check browser console for API errors
4. Verify NEXT_PUBLIC_API_URL in `.env.local`

---

## 📈 Performance Optimization

### Caching Strategy (TODO)
1. Cache job listings (5 min TTL)
2. Cache candidate searches (2 min TTL)
3. Use React Query for automatic cache management

### Pagination
All API endpoints support pagination:
```typescript
const page1 = await applicationsApi.list({ skip: 0, limit: 50 });
const page2 = await applicationsApi.list({ skip: 50, limit: 50 });
```

---

## 🚀 Next Steps

### Immediate (Today)
1. ✅ Dashboard - DONE
2. ⏳ Connect Applications page
3. ⏳ Connect Jobs page
4. ⏳ Connect Candidates page

### Short Term (This Week)
5. ⏳ Connect Analytics
6. ⏳ Build Talent Pools backend + integrate
7. ⏳ Build Notifications backend + integrate

### Medium Term
8. ⏳ Build Job Seeker app integration
9. ⏳ Build Employer app integration
10. ⏳ Complete hiring workflow across platforms

---

## 📞 API Endpoint Reference

### Applications
- `GET /api/applications` - List all
- `GET /api/applications/{id}` - Get details
- `PATCH /api/applications/{id}/status` - Update status
- `GET /api/applications/stats/overview` - Get statistics
- `POST /api/applications/bulk/update-status` - Bulk update

### Jobs
- `GET /api/jobs/all` - All jobs (corporate + small)
- `GET /api/jobs/corporate` - Corporate jobs only
- `GET /api/jobs/corporate/{id}` - Job details
- `GET /api/jobs/categories` - List categories
- `GET /api/jobs/locations` - List provinces

### Candidates
- `GET /api/cv/list` - List all CVs
- `GET /api/cv/{id}` - Get CV details
- `GET /api/cv/search?query=...` - Search CVs

---

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] `.env.local` created with API URL
- [ ] Applications seeded (`python seed_applications.py`)
- [ ] Dashboard loads real data
- [ ] No console errors
- [ ] API calls successful (check Network tab)

---

**Everything is ready!** Start with the Dashboard (already done), then move to Applications page next! 🎉
