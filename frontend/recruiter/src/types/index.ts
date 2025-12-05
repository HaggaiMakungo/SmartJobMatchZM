// User & Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: string;
  industry?: string;
  profile_completed: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Job Types
export interface Job {
  id: string;
  job_id?: string;
  title: string;
  company: string;
  category: string;
  collar_type: string;
  description: string;
  requirements?: string;
  key_responsibilities?: string;
  required_skills: string;
  preferred_skills?: string;
  required_experience_years: number;
  required_education: string;
  preferred_certifications?: string;
  location: string;
  location_city: string;
  location_province: string;
  salary_range?: string;
  salary_min_zmw: number;
  salary_max_zmw: number;
  employment_type: string;
  work_schedule?: string;
  language_requirements?: string;
  benefits?: string;
  growth_opportunities?: string;
  company_size?: string;
  industry_sector?: string;
  posted_date: string;
  application_deadline?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
}

export interface JobsResponse {
  total: number;
  jobs: Job[];
  company: string;
}

// Candidate Types
export interface Candidate {
  cv_id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  current_job_title: string;
  total_years_experience: number;
  education_level: string;
  skills_technical: string[];
  skills_soft: string[];
  salary_expectation_min?: number;
  salary_expectation_max?: number;
  employment_status?: string;
  availability?: string;
}

export interface MatchedCandidate {
  cv_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  location?: string;
  city?: string;
  province?: string;
  current_position?: string;
  current_job_title?: string;
  years_experience?: number;
  total_years_experience?: number;
  education?: string;
  education_level?: string;
  top_skills?: string[];
  skills_technical?: string[];
  skills_soft?: string[];
  match_score: number;
  matched_skills?: string[];
  missing_skills?: string[];
  match_reason?: string;
  match_explanation?: string;
  skills_score?: number;
  experience_score?: number;
  location_score?: number;
  education_score?: number;
  salary_expectation_min?: number;
  salary_expectation_max?: number;
}

export interface CandidatesResponse {
  job: Job;
  total_matches: number;
  candidates: MatchedCandidate[];
  threshold: number;
}

// Saved Candidates Types
export interface SavedCandidate {
  id: string;
  cv_id: string;
  job_id: string;
  recruiter_id: string;
  match_score: number;
  status: CandidateStatus;
  notes?: string;
  saved_at: string;
  updated_at?: string;
  candidate?: Candidate;
  job?: Job;
}

export type CandidateStatus = 
  | 'saved'
  | 'invited'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface SavedCandidatesResponse {
  total: number;
  candidates: SavedCandidate[];
}

// Stats Types
export interface Stats {
  company: string;
  total_jobs: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
}
