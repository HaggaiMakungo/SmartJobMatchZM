# JobMatch App Architecture - Post-Fixes

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       JOBMATCH MOBILE APP                        │
│                    (React Native + Expo)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌──────────────┐
│  HOME SCREEN  │      │  JOBS SCREEN  │      │ JOB DETAILS  │
│  (index.tsx)  │      │  (jobs.tsx)   │      │(job-details) │
└───────────────┘      └───────────────┘      └──────────────┘
        │                       │                       │
        │ ✅ Fixed              │ ✅ Fixed              │ ✅ Fixed
        │                       │                       │
        ├─ Build Profile        ├─ Pagination (5/pg)   ├─ Save Job
        ├─ Find Matches         ├─ Match Me Now        ├─ Toggle State
        ├─ Jobs Count (Smart)   └─ Category Filters    └─ Persistence
        └─ Top Matches (Count)
                                │
                                ▼
                    ┌───────────────────────┐
                    │   STATE MANAGEMENT    │
                    └───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────┐    ┌─────────────┐  ┌──────────┐
        │  Zustand │    │ React Query │  │ useState │
        │  (Theme) │    │  (API Data) │  │(UI State)│
        └──────────┘    └─────────────┘  └──────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   HOOKS & SERVICES    │
                    └───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │ useCandidate │  │   useJobs    │  │  useMatching │
        └──────────────┘  └──────────────┘  └──────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    API SERVICES       │
                    └───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   candidate  │  │     jobs     │  │   matching   │
        │   .service   │  │   .service   │  │   .service   │
        └──────────────┘  └──────────────┘  └──────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    AXIOS CLIENT       │
                    │  (with auth tokens)   │
                    └───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                           │
│                      (Python + PostgreSQL)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │  /candidate  │  │    /jobs     │  │   /match     │
        │   /saved     │  │ /categories  │  │   /ai/jobs   │
        └──────────────┘  └──────────────┘  └──────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     POSTGRESQL DB     │
                    └───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   saved_jobs │  │corporate_jobs│  │personal_jobs │
        │   (NEW!)     │  │    (400)     │  │    (200)     │
        └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Data Flow - Pagination Feature

```
User taps "Next" button
        │
        ▼
┌─────────────────────┐
│  setCurrentPage(2)  │  ← Local state update
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Compute slice       │  ← currentJobs = allJobs.slice(5, 10)
│ startIndex = 5      │
│ endIndex = 10       │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Re-render UI       │  ← Shows jobs 6-10
│  with new jobs      │
└─────────────────────┘
```

---

## Data Flow - Save Job Feature

```
User taps heart icon
        │
        ▼
┌─────────────────────┐
│   handleSave()      │  ← Event handler
└─────────────────────┘
        │
        ├──── Is saved? ────┐
        │                   │
        ▼ NO                ▼ YES
┌──────────────┐    ┌──────────────┐
│ Save job API │    │Unsave job API│
│ POST /saved  │    │DELETE /saved │
└──────────────┘    └──────────────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Update local    │
        │ state: isSaved  │
        └─────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Invalidate cache│  ← React Query refetches
        │ ['saved-jobs']  │
        └─────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Home screen     │  ← Count updates automatically
        │ count updates   │
        └─────────────────┘
```

---

## Data Flow - Smart Job Count

```
User profile loaded
        │
        ▼
┌─────────────────────┐
│ Get AI matches      │  ← API: /match/ai/jobs?limit=3
│ with CAMSS scores   │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Extract categories  │  ← matchData.matches.map(m => m.job.category)
│ ["Marketing",       │
│  "Business"]        │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Filter unique       │  ← Remove duplicates
│ matchedCategories   │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Count relevant jobs │  ← Only jobs in matched categories
│ jobsAvailable = N   │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Display on home     │  ← Shows accurate count
│ "Jobs Available: N" │
└─────────────────────┘
```

---

## Component Hierarchy

```
App Root
│
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
│
├── (tabs)/                    ← Job Seeker Mode
│   ├── index.tsx              ✅ FIXED (Home)
│   │   ├── Quick Actions
│   │   │   ├── Build Profile  ✅ NEW
│   │   │   ├── Find Matches   ✅ UPDATED
│   │   │   ├── Jobs Available ✅ SMART COUNT
│   │   │   └── Saved Jobs     ✅ REAL-TIME
│   │   ├── Top Matches        ✅ COUNT IN HEADING
│   │   └── Career Coach
│   │
│   ├── jobs.tsx               ✅ FIXED
│   │   ├── Carousel (Top 5)
│   │   ├── Match Me Now       ✅ NEW
│   │   ├── Analytics
│   │   ├── Category Filters
│   │   ├── Job List           ✅ PAGINATED
│   │   └── Pagination         ✅ NEW
│   │
│   ├── applications.tsx
│   └── profile.tsx
│
├── job-details.tsx            ✅ FIXED
│   ├── Header (Back + Save)   ✅ SAVE BUTTON
│   ├── Match Score Banner
│   ├── Job Info
│   ├── Description
│   ├── Requirements
│   ├── Benefits
│   ├── Similar Jobs
│   └── Apply Button
│
└── (employer)/
    ├── index.tsx
    ├── post-job.tsx
    ├── jobs.tsx
    └── profile.tsx
```

---

## React Query Cache Structure

```
queryClient
│
├── ['saved-jobs']              ← List of saved job IDs
│   └── [{ job_id: 1, ... }, { job_id: 5, ... }]
│
├── ['allJobs', 'All']          ← All jobs (no filter)
│   └── { corporate_jobs: [...], personal_jobs: [...] }
│
├── ['allJobs', 'Technology']   ← Filtered by category
│   └── { corporate_jobs: [...], personal_jobs: [...] }
│
├── ['topMatches']              ← Top 5 AI matches
│   └── { matches: [...], total_jobs_scored: 45 }
│
├── ['jobCategories']           ← Available categories
│   └── ['Technology', 'Marketing', 'Healthcare', ...]
│
├── ['candidate-profile']       ← User profile
│   └── { id: 1, skills: [...], experience: [...] }
│
└── ['job-details', '123']      ← Individual job
    └── { job_id: 123, title: '...', ... }
```

---

## API Endpoint Matrix

| Endpoint | Method | Used By | Purpose | Fixed? |
|----------|--------|---------|---------|--------|
| `/jobs/categories` | GET | jobs.tsx | Category filters | ✅ |
| `/jobs/all` | GET | jobs.tsx | Job listing | ✅ |
| `/candidate/saved-jobs` | GET | All screens | Get saved jobs | ✅ |
| `/candidate/saved-jobs/{id}` | POST | job-details | Save job | ✅ |
| `/candidate/saved-jobs/{id}` | DELETE | job-details | Unsave job | ✅ |
| `/match/ai/jobs` | GET | index.tsx | Top matches | ✅ |

---

## State Management Flow

```
┌─────────────────────┐
│   User Interaction  │  (Tap, swipe, etc.)
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Event Handler     │  (handleSave, setCurrentPage)
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Update State      │  (useState, Zustand)
└─────────────────────┘
          │
          ├──── Local state only? ───YES──► Re-render
          │
          NO (needs API)
          │
          ▼
┌─────────────────────┐
│   Call Mutation     │  (useSaveJob, useUnsaveJob)
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   API Request       │  (POST, DELETE, etc.)
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Backend Process   │  (Database update)
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   API Response      │  (Success/Error)
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Invalidate Cache  │  (React Query refetch)
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Re-render UI      │  (Show updated data)
└─────────────────────┘
```

---

## Performance Optimization Points

```
┌────────────────────────────────────────┐
│         OPTIMIZATION STRATEGY          │
└────────────────────────────────────────┘

1. PAGINATION
   ├─ Render only 5 items at a time
   ├─ Reduce DOM nodes by ~95%
   └─ Faster scroll performance

2. REACT QUERY CACHING
   ├─ Cache API responses for 5 minutes
   ├─ Avoid unnecessary network calls
   └─ Instant navigation when cached

3. OPTIMISTIC UPDATES
   ├─ Update UI before API response
   ├─ Rollback on error
   └─ Better perceived performance

4. DEBOUNCED SEARCH (Future)
   ├─ Wait 300ms before API call
   ├─ Reduce API calls by ~80%
   └─ Better server performance

5. MEMOIZATION (Future)
   ├─ useMemo for expensive calculations
   ├─ React.memo for components
   └─ Reduce unnecessary re-renders
```

---

## Error Handling Flow

```
API Call Made
      │
      ├─── Success ────► Update cache ─► Re-render
      │
      └─── Error
            │
            ▼
      Log to console
            │
            ▼
      Show error message
            │
            ▼
      Rollback optimistic update (if any)
            │
            ▼
      Keep previous state
```

---

## Testing Strategy

```
┌─────────────────────────────────────────┐
│           TESTING LAYERS                │
└─────────────────────────────────────────┘

1. UNIT TESTS
   ├─ State calculations (pagination logic)
   ├─ Helper functions (formatters)
   └─ Pure components

2. INTEGRATION TESTS
   ├─ API service calls
   ├─ React Query hooks
   └─ State management

3. E2E TESTS
   ├─ User flows (save job, paginate)
   ├─ Navigation
   └─ Form submissions

4. MANUAL TESTS
   ├─ Visual QA (UI/UX)
   ├─ Performance testing
   └─ Device compatibility
```

---

**Document Version:** 1.0  
**Created:** November 9, 2025  
**Status:** Complete ✅
