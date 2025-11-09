/**
 * Job Types and Interfaces
 * Updated to support both Corporate and Personal job types
 */

// Base job interface with common fields
export interface BaseJob {
  id: number;
  job_id: string; // JOB000001 or JOB-P001
  title: string;
  category: string;
  description: string;
  date_posted?: string;
  posted_date?: string;
  is_active: boolean;
}

// Corporate Job (Professional/Formal Sector)
export interface CorporateJob extends BaseJob {
  type: 'corporate';
  company: string;
  collar_type: 'White' | 'Blue' | 'Pink' | 'Grey' | 'Green';
  location_city?: string;
  location_province?: string;
  salary_min_zmw?: number;
  salary_max_zmw?: number;
  employment_type?: string; // Permanent, Contract, Temporary
  work_schedule?: string; // Full-time, Part-time
  key_responsibilities?: string;
  required_skills?: string;
  preferred_skills?: string;
  required_experience_years?: string;
  required_education?: string;
  preferred_certifications?: string;
  language_requirements?: string;
  application_deadline?: string;
  benefits?: string;
  growth_opportunities?: string;
  company_size?: string;
  industry_sector?: string;
  is_featured?: boolean;
}

// Personal Job (Gig/Informal Sector)
export interface PersonalJob extends BaseJob {
  type: 'personal';
  posted_by?: string; // Individual or small business
  location: string;
  budget?: number;
  payment_type?: string; // Monthly, Weekly, Fixed, Daily
  duration?: string; // Ongoing, One-time, Short-term
  status?: 'Open' | 'Closed';
}

// Union type for any job
export type Job = CorporateJob | PersonalJob;

// Job with AI match score
export interface JobWithMatch {
  job: Job;
  match_score: number;
  explanation: string;
  collar_type?: string;
  components?: {
    qualification: number;
    experience: number;
    skills: number;
    location: number;
  };
}

// API Response types
export interface CorporateJobsResponse {
  jobs: CorporateJob[];
  total: number;
}

export interface PersonalJobsResponse {
  jobs: PersonalJob[];
  total: number;
}

export interface AllJobsResponse {
  corporate_jobs: Array<{
    job_id: string;
    type: 'corporate';
    title: string;
    company: string;
    category: string;
    location?: string;
    salary_range?: string;
    posted_date?: string;
  }>;
  personal_jobs: Array<{
    job_id: string;
    type: 'personal';
    title: string;
    category: string;
    location?: string;
    budget?: string;
    payment_type?: string;
    posted_date?: string;
  }>;
  total: number;
}

// Filtering parameters
export interface CorporateJobFilters {
  skip?: number;
  limit?: number;
  category?: string;
  collar_type?: string;
  location_city?: string;
  location_province?: string;
  company?: string;
  min_salary?: number;
  max_salary?: number;
  employment_type?: string;
  search?: string;
}

export interface PersonalJobFilters {
  skip?: number;
  limit?: number;
  category?: string;
  location?: string;
  payment_type?: string;
  duration?: string;
  min_budget?: number;
  max_budget?: number;
  search?: string;
  status?: 'Open' | 'Closed';
}

// Job statistics
export interface JobStats {
  corporate_jobs: {
    total: number;
    active: number;
    by_category: Record<string, number>;
    by_collar_type: Record<string, number>;
  };
  personal_jobs: {
    total: number;
    open: number;
    closed: number;
  };
  overall: {
    total_jobs: number;
    available_jobs: number;
  };
}

// Helper function to format job location
export function formatJobLocation(job: Job): string {
  if (job.type === 'corporate') {
    if (job.location_city && job.location_province) {
      return `${job.location_city}, ${job.location_province}`;
    }
    return job.location_province || job.location_city || 'Location TBD';
  } else {
    return job.location || 'Location TBD';
  }
}

// Helper function to format salary/budget
export function formatJobPayment(job: Job): string {
  if (job.type === 'corporate') {
    if (job.salary_min_zmw && job.salary_max_zmw) {
      return `ZMW ${job.salary_min_zmw.toLocaleString()} - ${job.salary_max_zmw.toLocaleString()}`;
    } else if (job.salary_min_zmw) {
      return `From ZMW ${job.salary_min_zmw.toLocaleString()}`;
    } else if (job.salary_max_zmw) {
      return `Up to ZMW ${job.salary_max_zmw.toLocaleString()}`;
    }
    return 'Salary negotiable';
  } else {
    if (job.budget) {
      return `ZMW ${job.budget.toLocaleString()} ${job.payment_type || ''}`.trim();
    }
    return 'Budget negotiable';
  }
}

// Helper to get job type label
export function getJobTypeLabel(job: Job): string {
  if (job.type === 'corporate') {
    return job.employment_type || 'Full-time';
  } else {
    return job.duration || 'Flexible';
  }
}

// Helper to check if job is active
export function isJobActive(job: Job): boolean {
  if (job.type === 'corporate') {
    return job.is_active;
  } else {
    return job.status === 'Open' && job.is_active;
  }
}
