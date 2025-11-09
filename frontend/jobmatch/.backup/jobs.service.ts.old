/**
 * Jobs Service - API client for job-related endpoints
 * Updated to support both Corporate and Personal jobs
 */

import { api } from './api';
import {
  CorporateJob,
  PersonalJob,
  Job,
  AllJobsResponse,
  CorporateJobFilters,
  PersonalJobFilters,
  JobStats,
} from '@/types/jobs';

export const jobsService = {
  // ============================================
  // CORPORATE JOBS (Professional/Formal Sector)
  // ============================================

  /**
   * Get list of corporate jobs with filtering
   */
  getCorporateJobs: async (filters?: CorporateJobFilters): Promise<CorporateJob[]> => {
    const response = await api.get('/jobs/corporate', { params: filters });
    return response.data.map((job: any) => ({ ...job, type: 'corporate' as const }));
  },

  /**
   * Get a specific corporate job by job_id (e.g., JOB000001)
   */
  getCorporateJob: async (jobId: string): Promise<CorporateJob> => {
    const response = await api.get(`/jobs/corporate/${jobId}`);
    return { ...response.data, type: 'corporate' as const };
  },

  // ============================================
  // PERSONAL JOBS (Gig/Informal Sector)
  // ============================================

  /**
   * Get list of personal/gig jobs with filtering
   */
  getPersonalJobs: async (filters?: PersonalJobFilters): Promise<PersonalJob[]> => {
    const response = await api.get('/jobs/personal', { params: filters });
    return response.data.map((job: any) => ({ ...job, type: 'personal' as const }));
  },

  /**
   * Get a specific personal job by job_id (e.g., JOB-P001)
   */
  getPersonalJob: async (jobId: string): Promise<PersonalJob> => {
    const response = await api.get(`/jobs/personal/${jobId}`);
    return { ...response.data, type: 'personal' as const };
  },

  // ============================================
  // UNIFIED JOBS (Both types combined)
  // ============================================

  /**
   * Get all jobs (corporate + personal) for general browsing
   */
  getAllJobs: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<AllJobsResponse> => {
    const response = await api.get('/jobs/all', { params });
    return response.data;
  },

  /**
   * Search across all job types
   */
  searchJobs: async (searchTerm: string, limit: number = 20): Promise<AllJobsResponse> => {
    return jobsService.getAllJobs({ search: searchTerm, limit });
  },

  /**
   * Get jobs by category (searches both types)
   */
  getJobsByCategory: async (category: string, limit: number = 20): Promise<AllJobsResponse> => {
    return jobsService.getAllJobs({ category, limit });
  },

  // ============================================
  // STATISTICS & METADATA
  // ============================================

  /**
   * Get job market statistics
   */
  getJobStats: async (): Promise<JobStats> => {
    const response = await api.get('/jobs/stats');
    return response.data;
  },

  /**
   * Get list of all available job categories
   */
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/jobs/categories');
    return response.data;
  },

  // ============================================
  // SMART HELPER METHODS
  // ============================================

  /**
   * Get a job by ID (automatically determines if corporate or personal)
   */
  getJobById: async (jobId: string): Promise<Job> => {
    // Corporate jobs start with JOB followed by digits (e.g., JOB000001)
    // Personal jobs have format JOB-P### (e.g., JOB-P001)
    
    if (jobId.includes('-P')) {
      // Personal job
      return jobsService.getPersonalJob(jobId);
    } else {
      // Corporate job
      return jobsService.getCorporateJob(jobId);
    }
  },

  /**
   * Get mixed feed of jobs for home screen (curated mix)
   */
  getCuratedFeed: async (limit: number = 20): Promise<Job[]> => {
    const allJobs = await jobsService.getAllJobs({ limit });
    const jobs: Job[] = [];

    // Convert corporate jobs
    allJobs.corporate_jobs.forEach((corp) => {
      jobs.push({
        type: 'corporate' as const,
        id: 0, // Will be fetched if needed
        job_id: corp.job_id,
        title: corp.title,
        company: corp.company,
        category: corp.category,
        description: '',
        location_city: corp.location?.split(',')[0]?.trim(),
        location_province: corp.location?.split(',')[1]?.trim(),
        posted_date: corp.posted_date,
        is_active: true,
        collar_type: 'White', // Default, will be updated
      } as CorporateJob);
    });

    // Convert personal jobs
    allJobs.personal_jobs.forEach((pers) => {
      jobs.push({
        type: 'personal' as const,
        id: 0,
        job_id: pers.job_id,
        title: pers.title,
        category: pers.category,
        description: '',
        location: pers.location || '',
        budget: pers.budget ? parseInt(pers.budget.replace(/[^\d]/g, '')) : undefined,
        payment_type: pers.payment_type,
        posted_date: pers.posted_date,
        is_active: true,
        status: 'Open',
      } as PersonalJob);
    });

    return jobs;
  },

  /**
   * Get popular/trending jobs (currently just gets recent ones)
   */
  getPopularJobs: async (limit: number = 10): Promise<Job[]> => {
    return jobsService.getCuratedFeed(limit);
  },

  /**
   * Get jobs available count for a category
   */
  getCategoryCount: async (category: string): Promise<number> => {
    const [corporate, personal] = await Promise.all([
      jobsService.getCorporateJobs({ category, limit: 1 }),
      jobsService.getPersonalJobs({ category, limit: 1 }),
    ]);
    
    // This is a simple approximation - for accurate counts, 
    // we'd need the API to return total counts
    return corporate.length + personal.length;
  },
};

// Export individual functions for convenience
export const {
  getCorporateJobs,
  getCorporateJob,
  getPersonalJobs,
  getPersonalJob,
  getAllJobs,
  searchJobs,
  getJobsByCategory,
  getJobStats,
  getCategories,
  getJobById,
  getCuratedFeed,
  getPopularJobs,
  getCategoryCount,
} = jobsService;
