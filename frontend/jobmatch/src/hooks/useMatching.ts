import { useQuery } from '@tanstack/react-query';
import { matchService } from '@/services/match.service';

/**
 * Hook to get AI-matched jobs using CAMSS
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
