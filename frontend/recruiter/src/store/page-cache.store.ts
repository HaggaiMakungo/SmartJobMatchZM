import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for cached page states
interface JobsPageCache {
  selectedJobId: string | null;
  minMatchScore: number;
  sortBy: 'match_score' | 'experience' | 'location';
  showFilters: boolean;
  currentPage: number;
  isJobExpanded: boolean;
  selectedCandidateIds: string[];
  expandedCandidateId: string | null; // Track which candidate modal is open
  lastFetched: number;
}

interface CandidatesPageCache {
  searchQuery: string;
  showFilters: boolean;
  showFavorites: boolean;
  filters: {
    stage: string;
    location: string;
    minScore: number;
    maxScore: number;
  };
  selectedCandidateIds: string[];
  lastFetched: number;
}

interface DashboardCache {
  lastViewedPage: string;
  lastFetched: number;
}

interface PageCacheState {
  // Jobs Page
  jobsPage: JobsPageCache;
  setJobsPageCache: (cache: Partial<JobsPageCache>) => void;
  resetJobsPageCache: () => void;
  
  // Candidates Page
  candidatesPage: CandidatesPageCache;
  setCandidatesPageCache: (cache: Partial<CandidatesPageCache>) => void;
  resetCandidatesPageCache: () => void;
  
  // Dashboard
  dashboard: DashboardCache;
  setDashboardCache: (cache: Partial<DashboardCache>) => void;
  
  // Global cache management
  clearAllCache: () => void;
  isCacheValid: (timestamp: number, maxAge?: number) => boolean;
  getCacheAge: (timestamp: number) => number;
  shouldRefresh: (timestamp: number, thresholdMinutes?: number) => boolean;
}

const defaultJobsPageCache: JobsPageCache = {
  selectedJobId: null,
  minMatchScore: 0,
  sortBy: 'match_score',
  showFilters: false,
  currentPage: 1,
  isJobExpanded: false,
  selectedCandidateIds: [],
  expandedCandidateId: null,
  lastFetched: 0,
};

const defaultCandidatesPageCache: CandidatesPageCache = {
  searchQuery: '',
  showFilters: false,
  showFavorites: false,
  filters: {
    stage: '',
    location: '',
    minScore: 0,
    maxScore: 100,
  },
  selectedCandidateIds: [],
  lastFetched: 0,
};

const defaultDashboardCache: DashboardCache = {
  lastViewedPage: '/dashboard',
  lastFetched: 0,
};

export const usePageCacheStore = create<PageCacheState>()(
  persist(
    (set, get) => ({
      // Jobs Page State
      jobsPage: defaultJobsPageCache,
      
      setJobsPageCache: (cache) =>
        set((state) => ({
          jobsPage: {
            ...state.jobsPage,
            ...cache,
            lastFetched: Date.now(),
          },
        })),
      
      resetJobsPageCache: () =>
        set({ jobsPage: defaultJobsPageCache }),
      
      // Candidates Page State
      candidatesPage: defaultCandidatesPageCache,
      
      setCandidatesPageCache: (cache) =>
        set((state) => ({
          candidatesPage: {
            ...state.candidatesPage,
            ...cache,
            lastFetched: Date.now(),
          },
        })),
      
      resetCandidatesPageCache: () =>
        set({ candidatesPage: defaultCandidatesPageCache }),
      
      // Dashboard State
      dashboard: defaultDashboardCache,
      
      setDashboardCache: (cache) =>
        set((state) => ({
          dashboard: {
            ...state.dashboard,
            ...cache,
            lastFetched: Date.now(),
          },
        })),
      
      // Clear all cached state
      clearAllCache: () =>
        set({
          jobsPage: defaultJobsPageCache,
          candidatesPage: defaultCandidatesPageCache,
          dashboard: defaultDashboardCache,
        }),
      
      // Check if cache is still valid (default: 5 minutes)
      isCacheValid: (timestamp, maxAge = 5 * 60 * 1000) => {
        return Date.now() - timestamp < maxAge;
      },
      
      // Get cache age in minutes
      getCacheAge: (timestamp: number) => {
        return Math.floor((Date.now() - timestamp) / 60000);
      },
      
      // Check if should refresh (cache older than threshold)
      shouldRefresh: (timestamp: number, thresholdMinutes = 5) => {
        const ageMinutes = Math.floor((Date.now() - timestamp) / 60000);
        return ageMinutes >= thresholdMinutes;
      },
    }),
    {
      name: 'camss-page-cache', // localStorage key
      partialize: (state) => ({
        jobsPage: state.jobsPage,
        candidatesPage: state.candidatesPage,
        dashboard: state.dashboard,
      }),
    }
  )
);
