/**
 * React Query Hooks for Jobs
 * Updated to support both Corporate and Personal jobs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  jobsService,
  getCorporateJobs,
  getCorporateJob,
  getPersonalJobs,
  getPersonalJob,
  getAllJobs,
  getJobStats,
  getCategories,
  getJobById,
  getCuratedFeed,
  getPopularJobs,
} from '@/services/jobs.service.new';
import { matchingService } from '@/services/matching.service.new';
import { CorporateJobFilters, PersonalJobFilters } from '@/types/jobs';

// ============================================
// CORPORATE JOBS HOOKS
// ============================================

export function useCorporateJobs(filters?: CorporateJobFilters) {
  return useQuery({
    queryKey: ['corporateJobs', filters],
    queryFn: () => getCorporateJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCorporateJob(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['corporateJob', jobId],
    queryFn: () => getCorporateJob(jobId),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// PERSONAL JOBS HOOKS
// ============================================

export function usePersonalJobs(filters?: PersonalJobFilters) {
  return useQuery({
    queryKey: ['personalJobs', filters],
    queryFn: () => getPersonalJobs(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePersonalJob(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['personalJob', jobId],
    queryFn: () => getPersonalJob(jobId),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// UNIFIED JOBS HOOKS
// ============================================

export function useAllJobs(params?: {
  skip?: number;
  limit?: number;
  search?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['allJobs', params],
    queryFn: () => getAllJobs(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useJobById(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCuratedFeed(limit: number = 20) {
  return useQuery({
    queryKey: ['curatedFeed', limit],
    queryFn: () => getCuratedFeed(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularJobs(limit: number = 10) {
  return useQuery({
    queryKey: ['popularJobs', limit],
    queryFn: () => getPopularJobs(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================
// METADATA HOOKS
// ============================================

export function useJobStats() {
  return useQuery({
    queryKey: ['jobStats'],
    queryFn: () => getJobStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useJobCategories() {
  return useQuery({
    queryKey: ['jobCategories'],
    queryFn: () => getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
  });
}

// ============================================
// MATCHING HOOKS (AI-POWERED)
// ============================================

export function useAIMatchedJobs(
  topK: number = 10,
  jobType: 'corporate' | 'personal' | 'both' = 'corporate'
) {
  return useQuery({
    queryKey: ['aiMatchedJobs', topK, jobType],
    queryFn: () => matchingService.getAIMatchedJobs(topK, jobType),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTopMatches(count: number = 3) {
  return useQuery({
    queryKey: ['topMatches', count],
    queryFn: () => matchingService.getTopMatches(count),
    staleTime: 10 * 60 * 1000,
  });
}

export function useJobMatchScore(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['jobMatchScore', jobId],
    queryFn: () => matchingService.getJobMatchScore(jobId),
    enabled: enabled && !!jobId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCorporateMatches(topK: number = 10) {
  return useQuery({
    queryKey: ['corporateMatches', topK],
    queryFn: () => matchingService.getCorporateMatches(topK),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePersonalMatches(topK: number = 10) {
  return useQuery({
    queryKey: ['personalMatches', topK],
    queryFn: () => matchingService.getPersonalMatches(topK),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllMatches(topK: number = 10) {
  return useQuery({
    queryKey: ['allMatches', topK],
    queryFn: () => matchingService.getAllMatches(topK),
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// SEARCH HOOK
// ============================================

export function useJobSearch(searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['jobSearch', searchTerm],
    queryFn: () => jobsService.searchJobs(searchTerm, 20),
    enabled: enabled && searchTerm.length >= 2, // Only search if 2+ characters
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// CATEGORY-SPECIFIC HOOKS
// ============================================

export function useJobsByCategory(category: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['jobsByCategory', category],
    queryFn: () => jobsService.getJobsByCategory(category, 20),
    enabled: enabled && !!category,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// COMBINED HOOKS FOR HOME SCREEN
// ============================================

/**
 * Get all data needed for the Job Seeker home screen
 */
export function useJobSeekerHomeData() {
  const topMatches = useTopMatches(3);
  const stats = useJobStats();
  const popularJobs = usePopularJobs(5);

  return {
    topMatches,
    stats,
    popularJobs,
    isLoading:
      topMatches.isLoading || stats.isLoading || popularJobs.isLoading,
    isError: topMatches.isError || stats.isError || popularJobs.isError,
    refetch: () => {
      topMatches.refetch();
      stats.refetch();
      popularJobs.refetch();
    },
  };
}

/**
 * Get all data needed for the Jobs browse screen
 */
export function useJobsBrowseData(category?: string) {
  const allJobs = useAllJobs({ limit: 20, category });
  const categories = useJobCategories();

  return {
    allJobs,
    categories,
    isLoading: allJobs.isLoading || categories.isLoading,
    isError: allJobs.isError || categories.isError,
    refetch: () => {
      allJobs.refetch();
      categories.refetch();
    },
  };
}
