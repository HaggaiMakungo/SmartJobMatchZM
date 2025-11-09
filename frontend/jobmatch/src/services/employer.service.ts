import { api } from './api';

export interface EmployerProfile {
  id: number;
  user_id: number;
  employer_type: 'personal' | 'corporate';
  profile_completed: boolean;
  verified: boolean;
  company_name?: string;
  description?: string;
  location?: string;
  phone?: string;
  website?: string;
  // Personal employer specific
  nrc_number?: string;
  address?: string;
  nrc_photo_url?: string;
  proof_of_address_url?: string;
  logo_url?: string;
  // Corporate specific
  company_registration_number?: string;
  tax_identification_number?: string;
  industry?: string;
  company_size?: string;
  founded_year?: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateEmployerProfileData {
  company_name?: string;
  description?: string;
  location?: string;
  phone?: string;
  website?: string;
  nrc_number?: string;
  address?: string;
  nrc_photo_url?: string;
  proof_of_address_url?: string;
  logo_url?: string;
}

export interface UpdateEmployerProfileData extends Partial<CreateEmployerProfileData> {}

export interface PersonalEmployerDashboard {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  pending_applications: number;
  total_views: number;
  hired_count: number;
  profile_completed: boolean;
  verified: boolean;
  recent_jobs: any[];
  recent_applications: any[];
}

export interface FileUploadResponse {
  filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
}

export const employerService = {
  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Create personal employer profile (onboarding)
   */
  createProfile: async (
    profileData: CreateEmployerProfileData
  ): Promise<EmployerProfile> => {
    const response = await api.post('/employer/personal/profile', profileData);
    return response.data;
  },

  /**
   * Get current employer's profile
   */
  getMyProfile: async (): Promise<EmployerProfile> => {
    const response = await api.get('/employer/personal/profile/me');
    return response.data;
  },

  /**
   * Update employer profile
   */
  updateProfile: async (
    profileData: UpdateEmployerProfileData
  ): Promise<EmployerProfile> => {
    const response = await api.put('/employer/personal/profile/me', profileData);
    return response.data;
  },

  // ============================================================================
  // FILE UPLOADS
  // ============================================================================

  /**
   * Upload verification document
   * @param documentType - 'nrc_photo', 'proof_of_address', or 'logo'
   * @param file - File to upload
   */
  uploadDocument: async (
    documentType: 'nrc_photo' | 'proof_of_address' | 'logo',
    file: {
      uri: string;
      name: string;
      type: string;
    }
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await api.post(
      `/employer/personal/upload/${documentType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================

  /**
   * Get dashboard statistics
   */
  getDashboard: async (): Promise<PersonalEmployerDashboard> => {
    const response = await api.get('/employer/personal/dashboard');
    return response.data;
  },
};
