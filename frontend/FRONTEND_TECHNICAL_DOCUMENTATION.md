# CAMSS 2.0 Frontend Technical Documentation

## 📋 Executive Summary

**CAMSS 2.0** consists of two frontend applications:
1. **Recruiter Dashboard** (Next.js) - Web-based recruitment management platform
2. **Mobile App** (React Native/Expo) - Job seeker mobile application

This document provides comprehensive technical details on architecture, design patterns, implementation, and deployment.

---

## 🎯 Table of Contents

### Part A: Recruiter Dashboard (Next.js)
1. [Technology Stack](#recruiter-tech-stack)
2. [Architecture & Structure](#recruiter-architecture)
3. [Authentication System](#recruiter-auth)
4. [Core Features](#recruiter-features)
5. [State Management](#recruiter-state)
6. [API Integration](#recruiter-api)
7. [UI/UX Design System](#recruiter-design)
8. [Performance](#recruiter-performance)

### Part B: Mobile App (React Native)
9. [Technology Stack](#mobile-tech-stack)
10. [Architecture](#mobile-architecture)
11. [Features](#mobile-features)
12. [Navigation](#mobile-navigation)

---

# PART A: RECRUITER DASHBOARD

## 🛠️ <a name="recruiter-tech-stack"></a>Technology Stack

### Core Framework
```json
{
  "next": "14.2.5",
  "react": "18.3.1",
  "typescript": "5.x",
  "node": "18.x+"
}
```

### UI & Styling
- **TailwindCSS 3.4.1** - Utility-first CSS framework
- **Lucide React 0.263.1** - Icon library (2,000+ icons)
- **next-themes 0.2.1** - Dark/light mode
- **@dnd-kit/core** - Drag-and-drop for Kanban

### State & Data
- **Zustand 4.4.7** - Lightweight state management
- **Axios 1.6.5** - HTTP client
- **React Hook Form 7.49.3** - Form validation
- **Zod 3.22.4** - Schema validation

### Utilities
- **Sonner** - Toast notifications
- **date-fns** - Date manipulation

---

## 🏗️ <a name="recruiter-architecture"></a>Architecture & Structure

### App Router Structure (Next.js 14)

```
frontend/recruiter/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   └── dashboard/
│   │       ├── layout.tsx       # Dashboard layout
│   │       ├── page.tsx         # Dashboard home
│   │       ├── jobs/            # Job matching
│   │       ├── candidates/      # Candidate management
│   │       ├── talent-pools/    # Talent pools
│   │       ├── analytics/       # Analytics
│   │       └── settings/        # Settings
│   │
│   ├── components/              # Reusable components
│   │   ├── DashboardLayout.tsx  # Main layout wrapper
│   │   ├── NotificationBell.tsx # Notifications
│   │   ├── ui/                  # Base UI components
│   │   ├── candidates/          # Candidate components
│   │   └── jobs/                # Job components
│   │
│   ├── lib/                     # Utilities
│   │   ├── api/                 # API layer
│   │   │   ├── client.ts       # Axios instance
│   │   │   ├── jobs.ts         # Job endpoints
│   │   │   └── candidates.ts   # Candidate endpoints
│   │   ├── services/            # Business logic
│   │   │   └── auth.service.ts # Auth service
│   │   └── utils/               # Helper functions
│   │
│   ├── store/                   # Zustand stores
│   │   ├── auth.store.ts       # Auth state
│   │   └── candidates.store.ts # Candidates state
│   │
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts
│   │   ├── job.ts
│   │   └── candidate.ts
│   │
│   ├── hooks/                   # Custom hooks
│   │   └── useAuth.ts
│   │
│   └── middleware.ts            # Route protection
│
├── public/                      # Static assets
│   └── ZedSafeLogo.png
│
├── tailwind.config.js          # Tailwind config
├── next.config.js              # Next.js config
├── tsconfig.json               # TypeScript config
└── package.json
```

### Design Patterns

#### 1. Service Layer Pattern
```typescript
// lib/services/auth.service.ts
class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await apiClient.post('/auth/login', formData);
    this.setToken(response.data.access_token);
    
    return response.data;
  }
  
  async logout(): Promise<void> {
    this.clearAuth();
    window.location.href = '/login';
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}

export const authService = new AuthService();
```

#### 2. Repository Pattern for API
```typescript
// lib/api/jobs.ts
export const jobsApi = {
  getCorporate: async (params?: { limit?: number; category?: string }) => {
    const response = await apiClient.get('/corporate/jobs', { params });
    return response.data;
  },
  
  getById: async (jobId: string): Promise<Job> => {
    const response = await apiClient.get(`/corporate/jobs/${jobId}`);
    return response.data.job;
  },
};
```

#### 3. Custom Hooks Pattern
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);
  
  return { user, loading, login, logout };
}
```

---

## 🔐 <a name="recruiter-auth"></a>Authentication System

### Complete Auth Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    1. User Login                              │
│  • User enters email + password on /login page               │
│  • Form validation (React Hook Form + Zod)                   │
│  • "Trust this device" checkbox (7-day vs 1-day token)       │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│              2. Auth Service Processing                       │
│  • Convert to form data (OAuth2PasswordRequestForm)          │
│  • POST /api/auth/login                                      │
│  • Receive JWT token + user object                           │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│              3. Token Storage (Multi-layer)                   │
│  • localStorage: 'access_token'                              │
│  • Cookie: 'zedsafe_auth_token' (HttpOnly, Secure)          │
│  • localStorage: 'zedsafe_user' (user profile JSON)         │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│              4. State Management Update                       │
│  • Zustand auth store: setUser(user)                         │
│  • Redirect to /dashboard                                    │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│              5. Middleware Protection                         │
│  • Next.js middleware checks cookie on /dashboard/* routes   │
│  • No token → redirect to /login?redirect=/dashboard/X      │
│  • Valid token → allow access                                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│              6. API Request Interceptor                       │
│  • All API calls → Axios interceptor                         │
│  • Add header: Authorization: Bearer <token>                 │
│  • 401 response → logout + redirect to /login                │
└──────────────────────────────────────────────────────────────┘
```

### Implementation Details

**Middleware (Route Protection):**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('zedsafe_auth_token')?.value ||
                request.cookies.get('access_token')?.value;
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Protect dashboard routes
  if (isDashboard && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
};
```

**API Client with Interceptors:**
```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Logout Implementation:**
```typescript
// components/DashboardLayout.tsx
const handleLogout = async () => {
  // Clear ALL auth data
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('zedsafe_user');
  localStorage.removeItem('zedsafe_trust_device');
  
  // Clear ALL cookies
  document.cookie = 'zedsafe_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect
  router.push('/login');
};
```

---

## 🎨 <a name="recruiter-features"></a>Core Features

### 1. Job Matching Interface (`/dashboard/jobs`)

**Purpose:** AI-powered candidate recommendations for each job posting

**Key Components:**

```typescript
// State structure
const [jobs, setJobs] = useState<Job[]>([]);
const [selectedJob, setSelectedJob] = useState<Job | null>(null);
const [candidates, setCandidates] = useState<Candidate[]>([]);
const [minScoreFilter, setMinScoreFilter] = useState(0);  // 0-100%
const [candidatesCache, setCandidatesCache] = useState<Record<string, Candidate[]>>({});
```

**Data Flow:**
```
1. Load jobs on mount → useEffect(() => loadJobs(), [])
2. Select job → setSelectedJob(job)
3. Load candidates → useEffect(() => loadCandidates(), [selectedJob, minScoreFilter])
4. Cache results → candidatesCache[jobId] = candidates
5. Filter locally → filteredCandidates = candidates.filter(...)
```

**Features Implemented:**
- ✅ Stats dashboard (4 cards: jobs, candidates, saved, avg score)
- ✅ Job dropdown selector with AI icon
- ✅ Job details card (title, description, location, salary, date)
- ✅ Quick filters (All, Top 10%, High Match 50%+, Same City)
- ✅ Score slider (0-100% with dynamic API calls)
- ✅ Candidate cards with:
  - Color-coded match scores (green 70%+, yellow 40-69%, orange <40%)
  - Top 3 matched skills
  - Experience & location
  - Save/unsave bookmark button
- ✅ Candidate modal (full profile, contact info, skills, match explanation)

**API Integration:**
```typescript
// Fetch jobs (company-specific)
const response = await jobsApi.getCorporate({ limit: 100 });

// Fetch matched candidates (with dynamic threshold)
const response = await apiClient.get(`/recruiter/job/${jobId}/candidates`, {
  params: {
    limit: 100,
    min_score: minScoreFilter / 100  // Convert 0-100 to 0-1
  }
});

// Save/unsave candidate
await apiClient.post('/saved-candidates/save', {
  cv_id: candidate.cv_id,
  job_id: selectedJob.job_id,
  match_score: candidate.match_score
});
```

---

### 2. Candidate Management (`/dashboard/candidates`)

**Purpose:** Kanban-style pipeline management for recruitment stages

**Stages:**
```typescript
const stages = [
  { id: 'saved', name: 'Saved', color: 'gray' },
  { id: 'invited', name: 'Invited to Apply', color: 'blue' },
  { id: 'screening', name: 'Screening', color: 'yellow' },
  { id: 'interview', name: 'Interview', color: 'purple' },
  { id: 'offer', name: 'Offer', color: 'green' },
  { id: 'hired', name: 'Hired', color: 'emerald' },
  { id: 'rejected', name: 'Rejected', color: 'red' }
];
```

**Drag & Drop Implementation:**
```typescript
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (over && active.id !== over.id) {
    const candidateId = active.id as string;
    const newStage = over.id as string;
    
    // Optimistic UI update
    moveCandidateLocally(candidateId, newStage);
    
    // API call
    try {
      await apiClient.patch(`/saved-candidates/${candidateId}/stage`, {
        stage: newStage
      });
      toast.success('Candidate moved!');
    } catch (error) {
      // Revert on error
      revertCandidateMove(candidateId);
      toast.error('Failed to update stage');
    }
  }
};
```

**Features:**
- ✅ Drag & drop between 7 stages
- ✅ Filters: match score, experience, location, stage, skills
- ✅ Bulk actions: select multiple → email, export, delete
- ✅ Search by name, title, or skills
- ✅ 4 modals:
  1. Main candidate modal (profile, contact, scheduling, download CV)
  2. Notes & collaboration (team notes with timestamps)
  3. Communication history (email/phone logs)
  4. Analytics (pipeline metrics, conversion rates)

---

### 3. Dashboard Home (`/dashboard`)

**Widgets:**
- Total active jobs
- Total candidates in pipeline
- Recent activity feed
- Upcoming interviews calendar
- Quick actions (Post job, Search candidates)

---

### 4. Talent Pools (`/dashboard/talent-pools`)

**Purpose:** Organize candidates into custom pools

**Features:**
- Create/edit/delete pools
- Add/remove candidates
- Pool-specific analytics
- Export to CSV

---

### 5. Analytics (`/dashboard/analytics`)

**Metrics Tracked:**
- Time-to-hire (average days)
- Source effectiveness (where candidates come from)
- Pipeline health (conversion rates per stage)
- Match score distribution
- Hiring funnel visualization

---

### 6. Notifications (`/dashboard/notifications`)

**Implementation:**
```typescript
// components/NotificationBell.tsx
const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <NotificationDropdown 
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
    </div>
  );
};
```

---

## 🗃️ <a name="recruiter-state"></a>State Management

### Zustand Stores

**Auth Store:**
```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: () => {
    authService.logout();
    set({ user: null });
  }
}));

// Usage in components
const { user, setUser, logout } = useAuthStore();
```

**Candidates Store:**
```typescript
// store/candidates.store.ts
interface CandidatesState {
  savedCandidates: Set<string>;
  addSaved: (cvId: string) => void;
  removeSaved: (cvId: string) => void;
  clearSaved: () => void;
}

export const useCandidatesStore = create<CandidatesState>((set) => ({
  savedCandidates: new Set(),
  addSaved: (cvId) => set((state) => ({
    savedCandidates: new Set([...state.savedCandidates, cvId])
  })),
  removeSaved: (cvId) => set((state) => {
    const updated = new Set(state.savedCandidates);
    updated.delete(cvId);
    return { savedCandidates: updated };
  }),
  clearSaved: () => set({ savedCandidates: new Set() })
}));
```

### Local Component State

For page-specific data:
```typescript
// app/dashboard/jobs/page.tsx
const [jobs, setJobs] = useState<Job[]>([]);
const [selectedJob, setSelectedJob] = useState<Job | null>(null);
const [candidates, setCandidates] = useState<Candidate[]>([]);
const [loading, setLoading] = useState(true);
const [candidatesLoading, setCandidatesLoading] = useState(false);
const [minScoreFilter, setMinScoreFilter] = useState(0);
const [searchQuery, setSearchQuery] = useState('');
const [activeFilter, setActiveFilter] = useState('all');
```

---

## 🌐 <a name="recruiter-api"></a>API Integration

### Endpoint Structure

```typescript
// lib/api/jobs.ts
export const jobsApi = {
  getCorporate: async (params?) => {
    return apiClient.get('/corporate/jobs', { params });
  },
  
  getById: async (jobId: string) => {
    return apiClient.get(`/corporate/jobs/${jobId}`);
  },
  
  getCategories: async () => {
    return apiClient.get('/corporate/categories');
  },
};

// lib/api/saved-candidates.ts
export const savedCandidatesApi = {
  save: async (data: SaveCandidateRequest) => {
    return apiClient.post('/saved-candidates/save', data);
  },
  
  unsave: async (cvId: string) => {
    return apiClient.delete(`/saved-candidates/unsave/${cvId}`);
  },
  
  list: async (stage?: string) => {
    return apiClient.get('/saved-candidates/list', { params: { stage } });
  },
  
  updateStage: async (cvId: string, stage: string) => {
    return apiClient.patch(`/saved-candidates/${cvId}/stage`, { stage });
  },
  
  checkIfSaved: async (cvId: string) => {
    return apiClient.get(`/saved-candidates/check/${cvId}`);
  },
};

// lib/api/matching.ts
export const matchingApi = {
  getCandidatesForJob: async (jobId: string, minScore: number) => {
    return apiClient.get(`/recruiter/job/${jobId}/candidates`, {
      params: { limit: 100, min_score: minScore }
    });
  },
};
```

### Error Handling Pattern

```typescript
const loadCandidates = async (jobId: string) => {
  try {
    setCandidatesLoading(true);
    
    const response = await matchingApi.getCandidatesForJob(
      jobId,
      minScoreFilter / 100
    );
    
    const candidates = response.data.matched_candidates || [];
    setCandidates(candidates);
    
    // Cache results
    setCandidatesCache(prev => ({
      ...prev,
      [jobId]: candidates
    }));
    
    toast.success(`Found ${candidates.length} matches!`);
    
  } catch (error: any) {
    console.error('Failed to load candidates:', error);
    
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      router.push('/login');
    } else if (error.response?.status === 404) {
      toast.error('Job not found');
    } else {
      toast.error('Failed to load candidates. Please try again.');
    }
    
    setCandidates([]);
    
  } finally {
    setCandidatesLoading(false);
  }
};
```

---

## 🎨 <a name="recruiter-design"></a>UI/UX Design System

### Color Palette (Zambian-Inspired)

```css
:root {
  /* Brand Colors */
  --tangerine: #F28444;   /* Primary - Zambian sunset orange */
  --peach: #F2D492;       /* Secondary - Warm peach accent */
  --sage: #77A08D;        /* Tertiary - Natural sage green */
  --gunmetal: #2A3439;    /* Dark - Professional gunmetal */
  
  /* Neutral Colors */
  --white: #FFFFFF;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Semantic Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

### Typography

```tsx
// Headings
<h1 className="text-3xl font-bold text-gunmetal dark:text-peach">
  Main Title
</h1>

<h2 className="text-2xl font-semibold text-gunmetal dark:text-peach">
  Section Title
</h2>

<h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
  Subsection
</h3>

// Body text
<p className="text-base text-gray-700 dark:text-gray-300">
  Regular paragraph text
</p>

// Small text
<span className="text-sm text-gray-600 dark:text-gray-400">
  Helper text or metadata
</span>

// Extra small
<small className="text-xs text-gray-500 dark:text-gray-500">
  Tiny labels or timestamps
</small>
```

### Component Library

**Buttons:**
```tsx
// Primary
<button className="bg-tangerine hover:bg-tangerine/90 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all">
  Primary Action
</button>

// Secondary
<button className="bg-white dark:bg-gunmetal border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-all">
  Secondary Action
</button>

// Ghost
<button className="text-tangerine hover:bg-tangerine/10 px-4 py-2 rounded-lg transition-colors">
  Tertiary Action
</button>

// Danger
<button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
  Delete
</button>
```

**Cards:**
```tsx
<div className="bg-white dark:bg-gunmetal/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Card content goes here</p>
</div>
```

**Badges:**
```tsx
// Success/Green
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Hired
</span>

// Warning/Yellow
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  Interview
</span>

// Info/Blue
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  Screening
</span>

// Skill badge
<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-sage/10 text-sage border border-sage/20">
  JavaScript
</span>
```

### Responsive Design

**Breakpoints:**
```css
sm: 640px    /* Mobile landscape */
md: 768px    /* Tablets */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Large screens */
```

**Responsive Grid:**
```tsx
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Dark Mode

```tsx
// Component with dark mode support
<div className="bg-white dark:bg-gunmetal text-gray-900 dark:text-gray-100">
  Content adapts to theme
</div>

// Toggle implementation
const { theme, setTheme } = useTheme();

<button 
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
>
  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
</button>
```

---

## ⚡ <a name="recruiter-performance"></a>Performance Optimizations

### 1. Caching Strategy

```typescript
// Cache matched candidates per job
const [candidatesCache, setCandidatesCache] = useState<Record<string, Candidate[]>>({});

const loadCandidates = async (jobId: string) => {
  // Check cache first
  if (candidatesCache[jobId]) {
    console.log('✅ Using cached candidates');
    setCandidates(candidatesCache[jobId]);
    return;
  }
  
  // Fetch and cache
  const response = await matchingApi.getCandidatesForJob(jobId, minScore);
  const candidates = response.data.matched_candidates;
  
  setCandidatesCache(prev => ({ ...prev, [jobId]: candidates }));
  setCandidates(candidates);
};
```

### 2. Debouncing Search

```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const [searchQuery, setSearchQuery] = useState('');

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    performSearch(query);
  }, 300),
  []
);

const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSearchQuery(value);
  debounc