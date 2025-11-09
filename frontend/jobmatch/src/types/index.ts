export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  date_posted: string;
  deadline?: string;
  is_active: boolean;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  cover_letter?: string;
  match_score?: number;
  applied_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  skills: string[];
  education: Education[];
  experience: Experience[];
  resume_url?: string;
  phone?: string;
  location?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  current: boolean;
}

export interface Experience {
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  current: boolean;
}
