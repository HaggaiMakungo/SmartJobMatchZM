import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  employerService,
  CreateEmployerProfileData,
  UpdateEmployerProfileData,
} from '@/services/employer.service';

/**
 * Get current employer's profile
 */
export const useEmployerProfile = () => {
  return useQuery({
    queryKey: ['employer-profile'],
    queryFn: () => employerService.getMyProfile(),
  });
};

/**
 * Get employer dashboard data
 */
export const useEmployerDashboard = () => {
  return useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: () => employerService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Create employer profile
 */
export const useCreateEmployerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: CreateEmployerProfileData) =>
      employerService.createProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
    },
  });
};

/**
 * Update employer profile
 */
export const useUpdateEmployerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: UpdateEmployerProfileData) =>
      employerService.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
    },
  });
};

/**
 * Upload verification document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentType,
      file,
    }: {
      documentType: 'nrc_photo' | 'proof_of_address' | 'logo';
      file: { uri: string; name: string; type: string };
    }) => employerService.uploadDocument(documentType, file),
    onSuccess: () => {
      // Refresh profile after upload
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
    },
  });
};
