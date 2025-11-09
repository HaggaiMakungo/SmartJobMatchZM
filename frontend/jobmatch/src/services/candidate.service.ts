import { api } from './api';

export interface CandidateProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  profile_picture_url?: string;
  resume_url?: string;
  profile_strength?: number;
}

export interface ApplicationStatus {
  id: number;
  job_id: number;
  status: 'pending' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'hired';
  applied_at: string;
  updated_at: string;
  job?: {
    id: number;
    title: string;
    company: string;
    location: string;
  };
}

export interface SavedJob {
  id: number;
  job_id: number;
  saved_at: string;
  job?: {
    id: number;
    title: string;
    company: string;
    category: string;
    location: string;
  };
}

export const candidateService = {
  /**
   * Get current candidate's profile
   */
  getMyProfile: async (): Promise<CandidateProfile> => {
    const response = await api.get('/candidate/profile/me');
    return response.data;
  },

  /**
   * Update candidate profile
   */
  updateProfile: async (profileData: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const response = await api.put('/candidate/profile/me', profileData);
    return response.data;
  },

  /**
   * Get candidate's applications
   */
  getMyApplications: async (): Promise<ApplicationStatus[]> => {
    const response = await api.get('/candidate/applications');
    return response.data;
  },

  /**
   * Apply to a job
   */
  applyToJob: async (jobId: number, coverLetter?: string): Promise<ApplicationStatus> => {
    const response = await api.post(`/candidate/applications/${jobId}`, {
      cover_letter: coverLetter,
    });
    return response.data;
  },

  /**
   * Withdraw application
   */
  withdrawApplication: async (applicationId: number): Promise<void> => {
    await api.delete(`/candidate/applications/${applicationId}`);
  },

  /**
   * Get saved jobs
   */
  getSavedJobs: async (): Promise<SavedJob[]> => {
    const response = await api.get('/candidate/saved-jobs');
    return response.data;
  },

  /**
   * Save a job
   */
  saveJob: async (jobId: number): Promise<SavedJob> => {
    const response = await api.post(`/candidate/saved-jobs/${jobId}`);
    return response.data;
  },

  /**
   * Unsave a job
   */
  unsaveJob: async (jobId: number): Promise<void> => {
    await api.delete(`/candidate/saved-jobs/${jobId}`);
  },

  /**
   * Check if job is saved
   */
  isJobSaved: async (jobId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/candidate/saved-jobs/${jobId}/check`);
      return response.data.is_saved;
    } catch {
      return false;
    }
  },

  /**
   * Upload resume/CV
   */
  uploadResume: async (file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<{ file_url: string }> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await api.post('/candidate/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
