/**
 * Fast Semantic Matching Service
 * Uses pre-computed embeddings for instant job matching (0.6s)
 * Updated to use the new /api/recruiter/semantic endpoint
 */

import { api } from './api';

export interface SemanticMatchCandidate {
  cv_id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  years_of_experience: number;
  education_level: string;
  skills: string[];
  match_score: number;  // 0-1 float
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
}

export interface SemanticMatchResponse {
  job_id: string;
  job_title: string;
  candidates: SemanticMatchCandidate[];
  total_matches: number;
  processing_time: number;
  method: 'semantic_matching' | 'fast_semantic';
  model_used: string;
}

export interface SemanticMatchStats {
  job_has_embedding: boolean;
  total_cv_embeddings: number;
  estimated_time: string;
}

/**
 * Fast Semantic Matching Service
 * For CANDIDATE perspective (job seekers)
 */
export const semanticMatchService = {
  /**
   * Get job matches for the current candidate using fast semantic matching
   * Uses pre-computed embeddings for instant results
   * 
   * @param cvId - Candidate's CV ID
   * @param minScore - Minimum match score (0-100, default: 0)
   * @param topK - Number of matches to return (default: 20)
   * @returns Promise<SemanticJobMatch[]>
   */
  getJobMatches: async (
    cvId: string,
    minScore: number = 0,
    topK: number = 20
  ): Promise<SemanticJobMatch[]> => {
    try {
      console.log('🔍 Fetching semantic job matches for CV:', cvId);
      console.log('📊 Params:', { minScore, topK });

      // Convert min_score from 0-100 to 0-1 for backend
      const normalizedMinScore = minScore / 100;

      const response = await api.get(`/candidate/semantic/cv/${cvId}/jobs`, {
        params: {
          min_score: normalizedMinScore,
          top_k: topK,
        },
      });

      console.log('✅ Semantic matches fetched:', response.data.total_matches);
      console.log('⚡ Processing time:', response.data.processing_time + 's');

      return response.data.jobs || [];
    } catch (error) {
      console.error('❌ Failed to fetch semantic job matches:', error);
      throw error;
    }
  },

  /**
   * Get match stats (embeddings availability, estimated time)
   * 
   * @param cvId - Candidate's CV ID
   * @returns Promise<SemanticMatchStats>
   */
  getMatchStats: async (cvId: string): Promise<SemanticMatchStats> => {
    try {
      const response = await api.get(`/candidate/semantic/cv/${cvId}/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch match stats:', error);
      throw error;
    }
  },

  /**
   * Format match score as percentage string
   * @param score - Score between 0 and 1
   */
  formatScorePercent: (score: number): string => {
    return `${Math.round(score * 100)}%`;
  },

  /**
   * Get color for match score
   * @param score - Score between 0 and 1
   */
  getScoreColor: (score: number): string => {
    if (score >= 0.80) return '#10B981'; // Green - Excellent (80%+)
    if (score >= 0.60) return '#F59E0B'; // Amber - Good (60-79%)
    if (score >= 0.40) return '#6B7280'; // Gray - Fair (40-59%)
    return '#EF4444'; // Red - Low (<40%)
  },

  /**
   * Get label for match score
   * @param score - Score between 0 and 1
   */
  getScoreLabel: (score: number): string => {
    if (score >= 0.80) return 'Excellent Match';
    if (score >= 0.60) return 'Good Match';
    if (score >= 0.40) return 'Fair Match';
    return 'Low Match';
  },

  /**
   * Sort jobs by match score (highest first)
   */
  sortByScore: (jobs: SemanticJobMatch[]): SemanticJobMatch[] => {
    return [...jobs].sort((a, b) => b.match_score - a.match_score);
  },

  /**
   * Filter jobs by minimum score
   * @param jobs - Array of job matches
   * @param minScore - Minimum score (0-1)
   */
  filterByMinScore: (jobs: SemanticJobMatch[], minScore: number): SemanticJobMatch[] => {
    return jobs.filter(job => job.match_score >= minScore);
  },

  /**
   * Group jobs by match quality
   */
  groupByQuality: (jobs: SemanticJobMatch[]) => {
    return {
      excellent: jobs.filter(j => j.match_score >= 0.80),
      good: jobs.filter(j => j.match_score >= 0.60 && j.match_score < 0.80),
      fair: jobs.filter(j => j.match_score >= 0.40 && j.match_score < 0.60),
      low: jobs.filter(j => j.match_score < 0.40),
    };
  },

  /**
   * Get statistics about matches
   */
  getMatchStatistics: (jobs: SemanticJobMatch[]) => {
    if (!jobs || jobs.length === 0) {
      return {
        total: 0,
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
        byQuality: { excellent: 0, good: 0, fair: 0, low: 0 },
      };
    }

    const scores = jobs.map(j => j.match_score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const grouped = semanticMatchService.groupByQuality(jobs);

    return {
      total: jobs.length,
      averageScore: Math.round(avgScore * 100),
      maxScore: Math.round(Math.max(...scores) * 100),
      minScore: Math.round(Math.min(...scores) * 100),
      byQuality: {
        excellent: grouped.excellent.length,
        good: grouped.good.length,
        fair: grouped.fair.length,
        low: grouped.low.length,
      },
    };
  },
};

/**
 * Type for semantic job match (candidate perspective)
 */
export interface SemanticJobMatch {
  job_id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: string;
  category: string;
  posted_date: string;
  match_score: number;  // 0-1 float
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
}

export default semanticMatchService;
