/**
 * Matching Service - AI-powered job matching using CAMSS algorithm
 * Updated to support both Corporate and Personal jobs
 */

import { api } from './api';
import { Job, CorporateJob, PersonalJob, JobWithMatch } from '@/types/jobs';

export interface MatchedJob extends JobWithMatch {
  job: Job;
  match_score: number;
  explanation: string;
  collar_type?: string;
  components: {
    qualification: number;
    experience: number;
    skills: number;
    location: number;
  };
}

export interface CollarAwareMatchResult {
  user_id: number;
  matches: MatchedJob[];
  total_jobs_scored: number;
}

export interface JobMatchScore {
  match_score: number;
  explanation: string;
  collar_type?: string;
  components: {
    qualification: number;
    experience: number;
    skills: number;
    location: number;
  };
  user_id: number;
  job_id: string;
}

export const matchingService = {
  /**
   * Get AI-matched jobs for the current user using CAMSS
   * @param topK - Number of top matches to return (default: 10)
   * @param jobType - Type of jobs to match: 'corporate', 'personal', or 'both' (default: 'corporate')
   */
  getAIMatchedJobs: async (
    topK: number = 10,
    jobType: 'corporate' | 'personal' | 'both' = 'corporate'
  ): Promise<CollarAwareMatchResult> => {
    const response = await api.get('/match/ai/jobs', {
      params: { top_k: topK, job_type: jobType },
    });

    // Transform the response to include job type
    const result = response.data;
    if (result.matches) {
      result.matches = result.matches.map((match: any) => {
        // Determine job type from job_id format
        const isPersonal = match.job.job_id?.includes('-P');
        return {
          ...match,
          job: {
            ...match.job,
            type: isPersonal ? 'personal' : 'corporate',
          },
        };
      });
    }

    return result;
  },

  /**
   * Get match score for a specific job
   * @param jobId - The job ID (e.g., JOB000001 or JOB-P001)
   */
  getJobMatchScore: async (jobId: string): Promise<JobMatchScore> => {
    const response = await api.get(`/match/ai/job/${jobId}`);
    return response.data;
  },

  /**
   * Get top matches (shorthand for getAIMatchedJobs with small limit)
   */
  getTopMatches: async (count: number = 3): Promise<MatchedJob[]> => {
    const result = await matchingService.getAIMatchedJobs(count);
    return result.matches || [];
  },

  /**
   * Get matches for corporate jobs only
   */
  getCorporateMatches: async (topK: number = 10): Promise<MatchedJob[]> => {
    const result = await matchingService.getAIMatchedJobs(topK, 'corporate');
    return result.matches || [];
  },

  /**
   * Get matches for personal jobs only
   */
  getPersonalMatches: async (topK: number = 10): Promise<MatchedJob[]> => {
    const result = await matchingService.getAIMatchedJobs(topK, 'personal');
    return result.matches || [];
  },

  /**
   * Get matches for both job types
   */
  getAllMatches: async (topK: number = 10): Promise<MatchedJob[]> => {
    const result = await matchingService.getAIMatchedJobs(topK, 'both');
    return result.matches || [];
  },

  /**
   * Check if a specific job is a good match (score >= 70%)
   */
  isGoodMatch: async (jobId: string): Promise<boolean> => {
    const score = await matchingService.getJobMatchScore(jobId);
    return score.match_score >= 70;
  },

  /**
   * Get match color based on score
   */
  getMatchColor: (score: number): string => {
    if (score >= 85) return '#10B981'; // Green - Excellent match
    if (score >= 70) return '#F59E0B'; // Amber - Good match
    return '#9CA3AF'; // Gray - Fair match
  },

  /**
   * Get match label based on score
   */
  getMatchLabel: (score: number): string => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Fair Match';
    return 'Low Match';
  },

  /**
   * Sort jobs by match score (highest first)
   */
  sortByMatchScore: (jobs: MatchedJob[]): MatchedJob[] => {
    return [...jobs].sort((a, b) => b.match_score - a.match_score);
  },

  /**
   * Filter jobs by minimum match score
   */
  filterByMinScore: (jobs: MatchedJob[], minScore: number = 70): MatchedJob[] => {
    return jobs.filter((job) => job.match_score >= minScore);
  },

  /**
   * Group matches by collar type (for corporate jobs)
   */
  groupByCollarType: (matches: MatchedJob[]): Record<string, MatchedJob[]> => {
    const grouped: Record<string, MatchedJob[]> = {};
    
    matches.forEach((match) => {
      const collarType = match.collar_type || 'Other';
      if (!grouped[collarType]) {
        grouped[collarType] = [];
      }
      grouped[collarType].push(match);
    });

    return grouped;
  },

  /**
   * Get statistics about matches
   */
  getMatchStats: (matches: MatchedJob[]) => {
    const scores = matches.map((m) => m.match_score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length || 0;
    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 100);
    
    const excellentCount = matches.filter((m) => m.match_score >= 85).length;
    const goodCount = matches.filter((m) => m.match_score >= 70 && m.match_score < 85).length;
    const fairCount = matches.filter((m) => m.match_score >= 50 && m.match_score < 70).length;
    const lowCount = matches.filter((m) => m.match_score < 50).length;

    return {
      total: matches.length,
      averageScore: Math.round(avgScore),
      maxScore: Math.round(maxScore),
      minScore: Math.round(minScore),
      byQuality: {
        excellent: excellentCount,
        good: goodCount,
        fair: fairCount,
        low: lowCount,
      },
    };
  },

  /**
   * Debug endpoint - Test matching with sample data
   */
  debugMatchSample: async () => {
    const response = await api.get('/match/debug/sample');
    return response.data;
  },
};

// Export convenience functions
export const {
  getAIMatchedJobs,
  getJobMatchScore,
  getTopMatches,
  getCorporateMatches,
  getPersonalMatches,
  getAllMatches,
  isGoodMatch,
  getMatchColor,
  getMatchLabel,
  sortByMatchScore,
  filterByMinScore,
  groupByCollarType,
  getMatchStats,
  debugMatchSample,
} = matchingService;
