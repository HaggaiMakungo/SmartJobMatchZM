import { useQuery } from '@tanstack/react-query';
import { matchService, mlMatchService } from '@/services/match.service';
import { RankingMethod } from '@/types/jobs';
import { useAuthStore } from '@/store/authStore';

/**
 * Helper to get cv_id from user context
 * Maps user_id to cv_id format expected by ML endpoints
 * TODO: Update this mapping based on your backend's user-to-cv relationship
 */
export const useCvId = (): string | undefined => {
  const { user } = useAuthStore();
  // Current assumption: cv_id is the same as user_id as a string
  // Adjust this if your backend uses a different mapping
return user?.id ? "CV000004" : undefined;
};

// ==================== LEGACY HOOKS ====================

/**
 * Hook to get AI-matched jobs using CAMSS (legacy rule-based)
 * @param topK - Number of top matches to return
 */
export const useAIMatchedJobs = (topK: number = 10) => {
  return useQuery({
    queryKey: ['ai-matches', topK],
    queryFn: () => matchService.getAIMatchedJobs(topK),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get match score for a specific job
 * @param jobId - The job ID
 */
export const useJobMatchScore = (jobId: number) => {
  return useQuery({
    queryKey: ['job-match', jobId],
    queryFn: () => matchService.getJobMatchScore(jobId),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for debug testing
 */
export const useDebugMatch = () => {
  return useQuery({
    queryKey: ['debug-match'],
    queryFn: () => matchService.debugMatchSample(),
    enabled: false, // Only run manually
  });
};

// ==================== ML MATCHING HOOKS ====================

/**
 * Hook to get ML-ranked job matches
 * @param cvId - Candidate CV ID
 * @param topN - Number of matches to return (default: 20)
 * @param jobType - Filter by job type: 'corporate', 'small', or undefined for both
 * @param enabled - Whether to enable the query (default: true)
 */
export const useMLPredictions = (
  cvId: string | undefined,
  topN: number = 20,
  jobType?: 'corporate' | 'small',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['ml-predictions', cvId, topN, jobType],
    queryFn: () => mlMatchService.getMLPredictions(cvId!, topN, jobType),
    enabled: enabled && !!cvId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get hybrid-ranked job matches (ML + rule-based)
 * @param cvId - Candidate CV ID
 * @param topN - Number of matches to return (default: 20)
 * @param jobType - Filter by job type
 * @param mlWeight - Weight for ML score (default: 0.6)
 * @param ruleWeight - Weight for rule-based score (default: 0.4)
 * @param enabled - Whether to enable the query (default: true)
 */
export const useHybridMatches = (
  cvId: string | undefined,
  topN: number = 20,
  jobType?: 'corporate' | 'small',
  mlWeight: number = 0.6,
  ruleWeight: number = 0.4,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['hybrid-matches', cvId, topN, jobType, mlWeight, ruleWeight],
    queryFn: () => mlMatchService.getHybridMatches(cvId!, topN, jobType, mlWeight, ruleWeight),
    enabled: enabled && !!cvId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get matches with configurable ranking method
 * @param cvId - Candidate CV ID
 * @param method - Ranking method: 'rule', 'ml', or 'hybrid'
 * @param topN - Number of matches to return (default: 20)
 * @param jobType - Filter by job type
 * @param enabled - Whether to enable the query (default: true)
 */
export const useMatchesByMethod = (
  cvId: string | undefined,
  method: RankingMethod = 'hybrid',
  topN: number = 20,
  jobType?: 'corporate' | 'small',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['matches-by-method', cvId, method, topN, jobType],
    queryFn: () => mlMatchService.getMatchesByMethod(cvId!, method, topN, jobType),
    enabled: enabled && !!cvId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get ML model information and status
 * Useful for displaying model health in UI
 */
export const useMLModelInfo = () => {
  return useQuery({
    queryKey: ['ml-model-info'],
    queryFn: () => mlMatchService.getModelInfo(),
    staleTime: 30 * 60 * 1000, // 30 minutes - model info doesn't change often
    retry: 1, // Only retry once if model info fails
  });
};

/**
 * Hook to check ML service health
 * Lightweight check for service availability
 */
export const useMLHealth = () => {
  return useQuery({
    queryKey: ['ml-health'],
    queryFn: () => mlMatchService.checkHealth(),
    staleTime: 60 * 1000, // 1 minute
    retry: 0, // Don't retry - quick check
  });
};
