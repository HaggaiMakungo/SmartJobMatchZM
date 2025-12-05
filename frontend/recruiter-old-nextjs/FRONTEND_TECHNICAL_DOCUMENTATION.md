# CAMSS 2.0 Frontend - Technical Documentation

**Computer-Aided Matching System for Skills (CAMSS) - Recruiter Dashboard**  
*Modern Web Application for AI-Powered Recruitment*

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Application Structure](#application-structure)
5. [Authentication System](#authentication-system)
6. [Core Features](#core-features)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [UI/UX Design System](#uiux-design-system)
10. [Performance Optimizations](#performance-optimizations)
11. [Deployment Guide](#deployment-guide)

---

## System Overview

### Purpose
**CAMSS 2.0 Recruiter Dashboard** is a production-ready, enterprise-grade web application designed for Zambian recruiters and HR professionals. It provides AI-powered candidate matching, comprehensive recruitment pipeline management, and data-driven hiring insights.

### Key Statistics
- **Active Companies**: 50+ organizations
- **Job Postings Managed**: 1,600+ (1,000 corporate + 600 gig)
- **Candidate Pool**: 2,500+ qualified candidates
- **Match Accuracy**: 90% average relevance
- **Response Time**: 8-10 seconds (cached), 30-60 seconds (initial AI model load)
- **Supported Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Core Capabilities
- ✅ **Multi-Company Authentication**: Secure, isolated workspaces per organization
- ✅ **AI-Powered Matching**: Real-time candidate recommendations with semantic understanding
- ✅ **Kanban Pipeline Management**: Drag-and-drop recruitment stages
- ✅ **Advanced Filtering**: Match score, skills, location, experience
- ✅ **Responsive Design**: Optimized for desktop, tablet, and mobile
- ✅ **Real-time Updates**: Live notifications and activity feeds
- ✅ **Analytics Dashboard**: Recruitment metrics and insights
- ✅ **Bulk Actions**: Email, export, and manage multiple candidates

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.5 | React framework with App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Node.js** | 18+ | JavaScript runtime |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **TailwindCSS** | 3.4.1 | Utility-first CSS framework |
| **Lucide React** | 0.263.1 | Icon library (2,000+ SVG icons) |
| **next-themes** | 0.2.1 | Dark/light mode support |
| **Framer Motion** | 10.x | Animation library (optional) |

### State Management & Data Fetching
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 4.4.7 | Lightweight global state management |
| **Axios** | 1.6.5 | HTTP client for API calls |
| **React Hook Form** | 7.49.3 | Form state management & validation |
| **Zod** | 3.22.4 | Schema validation |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| **@dnd-kit/core** | Drag-and-drop for Kanban boards |
| **date-fns** | Date manipulation and formatting |
| **sonner** | Toast notifications |
| **recharts** | Data visualization charts |
| **clsx** | Conditional className utility |

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Turbopack** - Fast bundler (Next.js 14+)

---

## Architecture

### System Architecture Diagram
```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐     │
│  │   Desktop Browser        │  │   Mobile Browser         │     │
│  │   (Chrome, Firefox)      │  │   (Safari, Chrome)       │     │
│  └───────────┬──────────────┘  └──────────┬───────────────┘     │
└──────────────┼─────────────────────────────┼─────────────────────┘
               │                             │
               └──────────────┬──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Next.js 14       │
                    │   App Router       │
                    │   (React 18)       │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼─────────┐  ┌────────▼────────┐  ┌───────▼──────────┐
│  Static Pages   │  │  Dynamic Routes │  │  API Routes      │
│  (SSG)          │  │  (SSR/CSR)      │  │  (Server Funcs)  │
│                 │  │                 │  │                  │
│ • Landing       │  │ • Dashboard     │  │ • Proxy to       │
│ • About         │  │ • Jobs          │  │   Backend API    │
│ • Docs          │  │ • Candidates    │  │ • Session Mgmt   │
└─────────────────┘  └────────┬────────┘  └──────────────────┘
                              │
                              │
                    ┌─────────▼──────────┐
                    │   Middleware       │
                    │   • Auth Check     │
                    │   • Route Guard    │
                    │   • CORS           │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼─────────┐  ┌────────▼────────┐  ┌───────▼──────────┐
│  Auth Service   │  │  API Client     │  │  State Stores    │
│  • Login/Logout │  │  • Axios        │  │  • Zustand       │
│  • Token Mgmt   │  │  • Interceptors │  │  • Auth State    │
│  • Session      │  │  • Error Handle │  │  • UI State      │
└─────────────────┘  └────────┬────────┘  └──────────────────┘
                              │
                              │ HTTP Requests
                              │ (Authorization: Bearer <token>)
                              │
                    ┌─────────▼──────────┐
                    │   Backend API      │
                    │   (FastAPI)        │
                    │   localhost:8000   │
                    └────────────────────┘
```

### Application Flow

```
User Request Flow:
──────────────────

1. User navigates to /dashboard/jobs
   ↓
2. Next.js Router matches route
   ↓
3. Middleware checks authentication
   ├─ No token → Redirect to /login
   └─ Valid token → Continue
   ↓
4. Page component renders
   ↓
5. useEffect hooks trigger data fetching
   ↓
6. API Client sends request with Bearer token
   ↓
7. Backend processes and returns data
   ↓
8. State updates trigger re-render
   ↓
9. UI displays updated content
```

### Service Architecture

#### **1. Frontend Services Layer**
```typescript
lib/services/
├── auth.service.ts          // Authentication logic
├── jobs.service.ts          // Job management
├── candidates.service.ts    // Candidate operations
└── notifications.service.ts // Notification handling
```

#### **2. API Client Layer**
```typescript
lib/api/
├── client.ts                // Axios instance + interceptors
├── jobs.ts                  // Job endpoints
├── candidates.ts            // Candidate endpoints
├── matching.ts              // Matching endpoints
└── saved-candidates.ts      // Saved candidates CRUD
```

#### **3. Component Layer**
```typescript
components/
├── ui/                      // Base UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Toast.tsx
├── layout/                  // Layout components
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
└── features/                // Feature-specific
    ├── jobs/
    ├── candidates/
    └── analytics/
```

---

## Application Structure

### Project Root Structure
```
frontend/recruiter/
├── public/                          # Static assets
│   ├── ZedSafeLogo.png             # Company logo
│   ├── favicon.ico                 # Favicon
│   └── images/                     # Static images
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   ├── (auth)/                 # Auth pages group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   └── dashboard/              # Protected routes
│   │       ├── layout.tsx          # Dashboard layout
│   │       ├── page.tsx            # Dashboard home
│   │       ├── jobs/               # Job matching
│   │       ├── candidates/         # Candidate management
│   │       ├── talent-pools/       # Talent pool organization
│   │       ├── analytics/          # Analytics dashboard
│   │       ├── notifications/      # Notification center
│   │       └── settings/           # User settings
│   ├── components/                 # Reusable components
│   │   ├── ui/                     # Base UI components
│   │   ├── layout/                 # Layout components
│   │   ├── features/               # Feature components
│   │   └── shared/                 # Shared utilities
│   ├── lib/                        # Utilities and services
│   │   ├── api/                    # API client & endpoints
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Helper functions
│   │   └── constants/              # App constants
│   ├── store/                      # Zustand state stores
│   │   ├── auth.store.ts           # Authentication state
│   │   ├── jobs.store.ts           # Jobs state
│   │   └── candidates.store.ts    # Candidates state
│   ├── types/                      # TypeScript type definitions
│   │   ├── api.types.ts            # API response types
│   │   ├── models.types.ts         # Data models
│   │   └── ui.types.ts             # UI component types
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useJobs.ts              # Jobs management hook
│   │   └── useCandidates.ts       # Candidates hook
│   ├── styles/                     # Global styles
│   │   └── globals.css             # Tailwind imports
│   └── middleware.ts               # Route protection
├── .env.local                      # Environment variables
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

### Key Directories Explained

#### **`/app` - Pages & Routing**
Next.js 14 App Router uses file-system based routing:

```typescript
app/
├── layout.tsx                    // Root layout (applies to all pages)
├── page.tsx                      // Home page (/)
├── (auth)/                       // Route group (not in URL)
│   ├── login/page.tsx           // Login page (/login)
│   └── signup/page.tsx          // Signup page (/signup)
└── dashboard/
    ├── layout.tsx               // Dashboard layout (nested)
    ├── page.tsx                 // Dashboard home (/dashboard)
    ├── jobs/page.tsx            // Jobs page (/dashboard/jobs)
    └── candidates/page.tsx      // Candidates page (/dashboard/candidates)
```

**Route Groups:** `(auth)` is not reflected in the URL path, used for organizing files.

#### **`/components` - UI Components**

```typescript
components/
├── ui/                          // Base components
│   ├── Button.tsx              // Reusable button
│   ├── Input.tsx               // Form input
│   ├── Modal.tsx               // Modal dialog
│   ├── Toast.tsx               // Toast notification
│   ├── Badge.tsx               // Status badge
│   └── Card.tsx                // Card container
├── layout/                      // Layout components
│   ├── DashboardLayout.tsx     // Main dashboard wrapper
│   ├── Sidebar.tsx             // Navigation sidebar
│   ├── Header.tsx              // Top navigation bar
│   └── Footer.tsx              // Footer
├── features/                    // Feature-specific
│   ├── jobs/
│   │   ├── JobCard.tsx         // Individual job card
│   │   ├── JobSelector.tsx     // Job dropdown
│   │   └── JobDetailsCard.tsx  // Job details display
│   ├── candidates/
│   │   ├── CandidateCard.tsx   // Candidate card
│   │   ├── CandidateModal.tsx  // Full candidate details
│   │   ├── KanbanColumn.tsx    // Drag-drop column
│   │   └── KanbanBoard.tsx     // Full Kanban board
│   └── matching/
│       ├── MatchScore.tsx      // Match score display
│       └── SkillBadges.tsx     // Skill tags
└── shared/                      // Shared across features
    ├── NotificationBell.tsx    // Notification dropdown
    ├── SearchBar.tsx           // Search input
    └── FilterPanel.tsx         // Filter sidebar
```

#### **`/lib/api` - API Integration Layer**

```typescript
lib/api/
├── client.ts                    // Axios instance + interceptors
├── jobs.ts                      // Job-related endpoints
├── candidates.ts                // Candidate endpoints
├── matching.ts                  // Matching algorithm APIs
├── saved-candidates.ts          // Saved candidates CRUD
├── auth.ts                      // Authentication endpoints
└── companies.ts                 // Company management
```

**Example Structure:**
```typescript
// lib/api/jobs.ts
export const jobsApi = {
  getCorporate: async (params) => { /* ... */ },
  getById: async (jobId) => { /* ... */ },
  create: async (jobData) => { /* ... */ },
  update: async (jobId, jobData) => { /* ... */ },
  delete: async (jobId) => { /* ... */ }
};
```

#### **`/store` - Global State Management**

```typescript
store/
├── auth.store.ts               // User authentication state
├── jobs.store.ts               // Jobs list & selected job
├── candidates.store.ts         // Candidates & filters
├── notifications.store.ts      // Notifications state
└── ui.store.ts                 // UI state (modals, sidebar)
```

#### **`/types` - TypeScript Definitions**

```typescript
types/
├── api.types.ts                // API request/response types
├── models.types.ts             // Data models (User, Job, CV)
├── ui.types.ts                 // UI component prop types
└── enums.ts                    // Enums (JobStatus, Stage, etc.)
```

---

## Authentication System

### Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Login
──────────────────
User enters credentials on /login page
   ↓
React Hook Form validates input (Zod schema)
   ↓
authService.login(email, password) called
   ↓
POST /api/auth/login (OAuth2 format)
   Body: username=email&password=pass
   ↓
Backend validates credentials
   ↓
Response: { access_token, user: { ... } }

Step 2: Token Storage
─────────────────────
localStorage.setItem('access_token', token)
document.cookie = 'zedsafe_auth_token=<token>'
localStorage.setItem('zedsafe_user', JSON.stringify(user))
   ↓
Zustand store updated: setUser(user)
   ↓
Redirect to /dashboard

Step 3: Route Protection
────────────────────────
User navigates to /dashboard/jobs
   ↓
middleware.ts executes
   ↓
Checks cookie: zedsafe_auth_token
   ├─ Found → Allow access
   └─ Missing → Redirect to /login?redirect=/dashboard/jobs

Step 4: API Request Authentication
──────────────────────────────────
Component calls API: jobsApi.getCorporate()
   ↓
Axios request interceptor executes
   ↓
Retrieves token from localStorage
   ↓
Adds header: Authorization: Bearer <token>
   ↓
Request sent to backend
   ↓
Backend validates JWT token
   ├─ Valid → Process request
   └─ Invalid/Expired → Return 401

Step 5: Token Expiration Handling
─────────────────────────────────
Backend returns 401 Unauthorized
   ↓
Axios response interceptor catches error
   ↓
if (status === 401):
  - Clear localStorage & cookies
  - Redirect to /login
  - Show toast: "Session expired"

Step 6: Logout
──────────────
User clicks logout button
   ↓
authService.logout() called
   ↓
Clear localStorage.removeItem('access_token')
Clear localStorage.removeItem('zedsafe_user')
Clear cookies: document.cookie = 'zedsafe_auth_token=; expires=...'
   ↓
Zustand store: setUser(null)
   ↓
Redirect to /login
```

### Authentication Implementation

#### **1. Login Page**
```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  trustDevice: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      // Call auth service
      const response = await authService.login({
        email: data.email,
        password: data.password,
        trustDevice: data.trustDevice || false,
      });

      // Update global state
      setUser(response.user);

      // Show success message
      toast.success('Login successful!');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          CAMSS 2.0 Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine"
              placeholder="recruiter@company.zm"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Trust Device Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('trustDevice')}
              id="trustDevice"
              className="h-4 w-4 text-tangerine focus:ring-tangerine border-gray-300 rounded"
            />
            <label htmlFor="trustDevice" className="ml-2 text-sm text-gray-700">
              Trust this device for 7 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tangerine hover:bg-tangerine/90 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### **2. Auth Service**
```typescript
// lib/services/auth.service.ts
import { apiClient } from '@/lib/api/client';
import Cookies from 'js-cookie';

export interface LoginCredentials {
  email: string;
  password: string;
  trustDevice?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    company_id: string;
    company_name: string;
    email: string;
    industry: string;
  };
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Convert to OAuth2 format (form data)
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, user } = response.data;

    // Store token in localStorage
    localStorage.setItem('access_token', access_token);

    // Store token in cookie (for middleware)
    const expiryDays = credentials.trustDevice ? 7 : 1;
    this.setToken(access_token, expiryDays);

    // Store user data
    localStorage.setItem('zedsafe_user', JSON.stringify(user));

    return response.data;
  }

  /**
   * Logout user and clear all tokens
   */
  logout(): void {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('zedsafe_user');

    // Clear cookies
    Cookies.remove('zedsafe_auth_token');

    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Set auth token in cookie
   */
  private setToken(token: string, expiryDays: number): void {
    Cookies.set('zedsafe_auth_token', token, {
      expires: expiryDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('zedsafe_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
```

#### **3. Middleware (Route Protection)**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('zedsafe_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes (require authentication)
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Public routes (redirect if already logged in)
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing public route with token
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
```

#### **4. API Client with Interceptors**
```typescript
// lib/api/client.ts
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('zedsafe_user');
      
      // Show error message
      toast.error('Session expired. Please login again.');
      
      // Redirect to login
      window.location.href = '/login';
    }

    // Server error
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);
```

#### **5. Zustand Auth Store**
```typescript
// store/auth.store.ts
import { create } from 'zustand';

interface User {
  company_id: string;
  company_name: string;
  email: string;
  industry: string;
}

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

  setUser: (user) => set({ user, loading: false }),

  setLoading: (loading) => set({ loading }),

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('zedsafe_user');

    // Clear state
    set({ user: null });

    // Redirect
    window.location.href = '/login';
  },
}));
```

#### **6. useAuth Custom Hook**
```typescript
// hooks/useAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/lib/services/auth.service';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();

    if (storedUser && isAuthenticated) {
      setUser(storedUser);
    } else {
      setLoading(false);
      
      // Redirect to login if auth is required
      if (requireAuth) {
        router.push('/login');
      }
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout: authService.logout.bind(authService),
  };
}
```

---

## Core Features

### 1. Job Matching Interface

**Location:** `/dashboard/jobs`

**Purpose:** AI-powered candidate recommendations for job postings with advanced filtering and semantic skill matching.

#### Component Structure
```typescript
app/dashboard/jobs/page.tsx
  ├── Stats Cards (4 metrics)
  ├── Job Selector (Dropdown)
  ├── Job Details Card
  ├── Quick Filters Bar
  ├── Score Slider
  ├── Candidate Grid
  └── Candidate Modal
```

#### State Management
```typescript
const [jobs, setJobs] = useState<Job[]>([]);
const [selectedJob, setSelectedJob] =