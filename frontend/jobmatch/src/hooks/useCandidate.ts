import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '@/services/candidate.service';

/**
 * Get current candidate's profile
 */
export const useCandidateProfile = () => {
  return useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateService.getMyProfile(),
  });
};

/**
 * Get candidate's applications
 */
export const useMyApplications = () => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateService.getMyApplications(),
  });
};

/**
 * Get saved jobs
 */
export const useSavedJobs = () => {
  return useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => candidateService.getSavedJobs(),
  });
};

/**
 * Check if a job is saved
 */
export const useIsJobSaved = (jobId: number) => {
  return useQuery({
    queryKey: ['is-job-saved', jobId],
    queryFn: () => candidateService.isJobSaved(jobId),
    enabled: !!jobId,
  });
};

/**
 * Update candidate profile
 */
export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: candidateService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
  });
};

/**
 * Apply to a job
 */
export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, coverLetter }: { jobId: number; coverLetter?: string }) =>
      candidateService.applyToJob(jobId, coverLetter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

/**
 * Withdraw application
 */
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) =>
      candidateService.withdrawApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

/**
 * Save a job
 */
export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: number) => candidateService.saveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
};

/**
 * Unsave a job
 */
export const useUnsaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: number) => candidateService.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
};

/**
 * Upload resume
 */
export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      candidateService.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
  });
};
