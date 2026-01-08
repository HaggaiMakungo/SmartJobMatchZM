import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type { Job, MatchedCandidate, SavedCandidate, SaveCandidatePayload } from '@/types';

/**
 * Custom Hooks for Data Fetching with Smart Caching
 * 
 * These hooks automatically:
 * - Cache responses for 10 minutes
 * - Refetch on window focus
 * - Show loading states
 * - Handle errors
 * - Invalidate related queries on mutations
 */

// ============================================================================
// JOBS
// ============================================================================

/**
 * Fetch all jobs with caching
 */
export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.lists(),
    queryFn: async () => {
      const data = await apiClient.getJobs();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
  });
}

/**
 * Fetch single job by ID
 */
export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId || ''),
    queryFn: async () => {
      if (!jobId) return null;
      return await apiClient.getJob(jobId);
    },
    enabled: !!jobId, // Only fetch if jobId exists
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Post new job mutation
 */
export function usePostJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobData: any) => apiClient.postJob(jobData),
    onSuccess: () => {
      // Invalidate jobs list to refetch
      invalidateQueries.allJobs();
    },
  });
}

// ============================================================================
// CANDIDATES
// ============================================================================

/**
 * Fetch matched candidates for a job with caching
 */
export function useMatchedCandidates(
  jobId: string | null,
  options?: {
    minMatchScore?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: queryKeys.candidates.matches(
      jobId || '', 
      { minMatchScore: options?.minMatchScore }
    ),
    queryFn: async () => {
      if (!jobId) return [];
      
      const data = await apiClient.getMatchedCandidates(jobId);
      const candidates = Array.isArray(data) ? data : [];
      
      // Apply min score filter if specified
      if (options?.minMatchScore !== undefined) {
        return candidates.filter(c => c.match_score >= options.minMatchScore!);
      }
      
      return candidates;
    },
    enabled: !!jobId && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000,
    // Don't show stale data while refetching for better UX
    refetchOnMount: 'always',
  });
}

/**
 * Fetch saved candidates with caching
 */
export function useSavedCandidates() {
  return useQuery({
    queryKey: queryKeys.candidates.saved(),
    queryFn: async () => {
      const data = await apiClient.getSavedCandidates();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (changes more frequently)
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Save candidate mutation
 */
export function useSaveCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: SaveCandidatePayload) => 
      apiClient.saveCandidate(payload),
    
    // Optimistic update
    onMutate: async (newCandidate) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.candidates.saved() 
      });
      
      // Snapshot previous value
      const previousCandidates = queryClient.getQueryData(
        queryKeys.candidates.saved()
      );
      
      // Optimistically update cache
      queryClient.setQueryData(
        queryKeys.candidates.saved(),
        (old: SavedCandidate[] = []) => [
          ...old,
          {
            id: `temp-${Date.now()}`,
            ...newCandidate,
            status: 'new',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
      );
      
      return { previousCandidates };
    },
    
    // If mutation fails, rollback
    onError: (err, newCandidate, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueryData(
          queryKeys.candidates.saved(),
          context.previousCandidates
        );
      }
    },
    
    // Always refetch after error or success
    onSettled: () => {
      invalidateQueries.savedCandidates();
    },
  });
}

/**
 * Update candidate status mutation
 */
export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.updateCandidateStatus(id, status),
    
    onSuccess: () => {
      invalidateQueries.savedCandidates();
    },
  });
}

/**
 * Bulk save candidates mutation
 */
export function useBulkSaveCandidates() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidates: SaveCandidatePayload[]) => {
      const results = await Promise.all(
        candidates.map(c => apiClient.saveCandidate(c))
      );
      return results;
    },
    
    onSuccess: () => {
      invalidateQueries.savedCandidates();
    },
  });
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Fetch company statistics with caching
 */
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats.overview(),
    queryFn: () => apiClient.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000,
  });
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Hook to manually refetch all data
 */
export function useRefetchAll() {
  const queryClient = useQueryClient();
  
  return async () => {
    await queryClient.invalidateQueries();
  };
}

/**
 * Hook to get cache info for debugging
 */
export function useCacheInfo() {
  const queryClient = useQueryClient();
  
  return {
    getCacheSize: () => queryClient.getQueryCache().getAll().length,
    getCachedQueries: () => queryClient.getQueryCache().getAll(),
    clearCache: () => queryClient.clear(),
  };
}
