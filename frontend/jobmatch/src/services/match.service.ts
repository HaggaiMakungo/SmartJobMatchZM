/**
 * Matching Service - AI-powered job matching using CAMSS algorithm
 * Updated to support both Corporate and Personal jobs
 * Now includes ML-powered matching endpoints
 */

import { api } from './api';
import { 
  Job, 
  CorporateJob, 
  PersonalJob, 
  JobWithMatch,
  MLJobMatch,
  MLMatchResponse,
  MLModelInfo,
  MLMatchStats,
  RankingMethod 
} from '@/types/jobs';

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

export const matchService = {
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

    // Transform the response to handle both old and new formats
    const result = response.data;
    if (result.matches) {
      result.matches = result.matches.map((match: any) => {
        // New backend format: match already has nested 'job' object
        // Old backend format: match is flat, need to wrap in 'job'
        const jobData = match.job ? match.job : {
          id: match.id,
          job_id: match.id,
          title: match.title,
          company: match.company,
          location: match.location,
          salary_range: match.salary_range,
          category: match.category,
          posted_date: match.posted_date,
          is_active: true,
        };

        // Determine job type from job_id format
        const isPersonal = jobData.job_id?.includes('-P') || jobData.job_id?.startsWith('SMALL');
        
        return {
          job: {
            ...jobData,
            type: isPersonal ? 'personal' : 'corporate',
          },
          match_score: match.match_score,
          explanation: match.explanation,
          collar_type: match.collar_type,
          // Handle both 'components' (new) and 'component_scores' (old)
          components: match.components || match.component_scores || {},
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
    const result = await matchService.getAIMatchedJobs(count);
    return result.matches || [];
  },

  /**
   * Get matches for corporate jobs only
   */
  getCorporateMatches: async (topK: number = 10): Promise<MatchedJob[]> => {
    const result = await matchService.getAIMatchedJobs(topK, 'corporate');
    return result.matches || [];
  },

  /**
   * Get matches for personal jobs only
   */
  getPersonalMatches: async (topK: number = 10): Promise<MatchedJob[]> => {
    const result = await matchService.getAIMatchedJobs(topK, 'personal');
    return result.matches || [];
  },

  /**
   * Get matches for both job types
   */
  getAllMatches: async (topK: number = 10): Promise<MatchedJob[]> => {
    const result = await matchService.getAIMatchedJobs(topK, 'both');
    return result.matches || [];
  },

  /**
   * Check if a specific job is a good match (score >= 70%)
   */
  isGoodMatch: async (jobId: string): Promise<boolean> => {
    const score = await matchService.getJobMatchScore(jobId);
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

// ==================== ML MATCHING SERVICE ====================

export const mlMatchService = {
  /**
   * Get ML-ranked job matches (pure ML predictions)
   * @param cvId - Candidate CV ID
   * @param topN - Number of matches to return (default: 20)
   * @param jobType - Filter by job type: 'corporate', 'small', or undefined for both
   */
  getMLPredictions: async (
    cvId: string,
    topN: number = 20,
    jobType?: 'corporate' | 'small'
  ): Promise<MLMatchResponse> => {
    const params: Record<string, any> = { top_n: topN };
    if (jobType) params.job_type = jobType;
    
    const response = await api.get(`/ml/match/candidate/${cvId}/predictions`, { params });
    return response.data;
  },

  /**
   * Get hybrid-ranked job matches (60% ML + 40% rule-based)
   * @param cvId - Candidate CV ID
   * @param topN - Number of matches to return (default: 20)
   * @param jobType - Filter by job type
   * @param mlWeight - Weight for ML score (default: 0.6)
   * @param ruleWeight - Weight for rule-based score (default: 0.4)
   */
  getHybridMatches: async (
    cvId: string,
    topN: number = 20,
    jobType?: 'corporate' | 'small',
    mlWeight: number = 0.6,
    ruleWeight: number = 0.4
  ): Promise<MLMatchResponse> => {
    const params: Record<string, any> = { 
      top_n: topN,
      ml_weight: mlWeight,
      rule_weight: ruleWeight
    };
    if (jobType) params.job_type = jobType;
    
    const response = await api.get(`/ml/match/candidate/${cvId}/hybrid`, { params });
    return response.data;
  },

  /**
   * Get matches based on ranking method
   * @param cvId - Candidate CV ID
   * @param method - Ranking method: 'rule', 'ml', or 'hybrid'
   * @param topN - Number of matches to return
   * @param jobType - Filter by job type
   */
  getMatchesByMethod: async (
    cvId: string,
    method: RankingMethod = 'hybrid',
    topN: number = 20,
    jobType?: 'corporate' | 'small'
  ): Promise<MLMatchResponse> => {
    switch (method) {
      case 'ml':
        return mlMatchService.getMLPredictions(cvId, topN, jobType);
      case 'hybrid':
        return mlMatchService.getHybridMatches(cvId, topN, jobType);
      case 'rule':
      default:
        // For rule-based, still use ML endpoint but it will use rule scores
        // Or fallback to legacy endpoint
        return mlMatchService.getMLPredictions(cvId, topN, jobType);
    }
  },

  /**
   * Get ML model information and status
   */
  getModelInfo: async (): Promise<MLModelInfo> => {
    const response = await api.get('/ml/match/model/info');
    return response.data;
  },

  /**
   * Check ML service health
   */
  checkHealth: async (): Promise<{
    status: string;
    ml_service: string;
    model_loaded: boolean;
    fallback_available: boolean;
    timestamp: string;
  }> => {
    const response = await api.get('/ml/match/health');
    return response.data;
  },

  /**
   * Get statistics about ML matches
   * @param matches - Array of ML job matches
   */
  getMLMatchStats: (matches: MLJobMatch[]): MLMatchStats => {
    if (!matches || matches.length === 0) {
      return {
        total: 0,
        averageScore: 0,
        averageMLScore: 0,
        averageHybridScore: 0,
        maxScore: 0,
        minScore: 0,
        byQuality: { excellent: 0, good: 0, fair: 0, low: 0 }
      };
    }

    const ruleScores = matches.map(m => m.rule_score);
    const mlScores = matches.map(m => m.ml_score);
    const hybridScores = matches.map(m => m.hybrid_score || m.rule_score);

    const avgRule = ruleScores.reduce((a, b) => a + b, 0) / ruleScores.length;
    const avgML = mlScores.reduce((a, b) => a + b, 0) / mlScores.length;
    const avgHybrid = hybridScores.reduce((a, b) => a + b, 0) / hybridScores.length;

    // Quality thresholds (scores are 0-1, so 0.85 = 85%)
    const excellentCount = matches.filter(m => (m.hybrid_score || m.rule_score) >= 0.85).length;
    const goodCount = matches.filter(m => {
      const score = m.hybrid_score || m.rule_score;
      return score >= 0.70 && score < 0.85;
    }).length;
    const fairCount = matches.filter(m => {
      const score = m.hybrid_score || m.rule_score;
      return score >= 0.50 && score < 0.70;
    }).length;
    const lowCount = matches.filter(m => (m.hybrid_score || m.rule_score) < 0.50).length;

    return {
      total: matches.length,
      averageScore: Math.round(avgRule * 100),
      averageMLScore: Math.round(avgML * 100),
      averageHybridScore: Math.round(avgHybrid * 100),
      maxScore: Math.round(Math.max(...hybridScores) * 100),
      minScore: Math.round(Math.min(...hybridScores) * 100),
      byQuality: {
        excellent: excellentCount,
        good: goodCount,
        fair: fairCount,
        low: lowCount,
      },
    };
  },

  /**
   * Get display color for ML score
   * @param score - Score between 0 and 1
   */
  getScoreColor: (score: number): string => {
    if (score >= 0.85) return '#10B981'; // Green - Excellent
    if (score >= 0.70) return '#F59E0B'; // Amber - Good
    if (score >= 0.50) return '#6B7280'; // Gray - Fair
    return '#EF4444'; // Red - Low
  },

  /**
   * Get display label for ML score
   * @param score - Score between 0 and 1
   */
  getScoreLabel: (score: number): string => {
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.70) return 'Good';
    if (score >= 0.50) return 'Fair';
    return 'Low';
  },

  /**
   * Format score as percentage string
   * @param score - Score between 0 and 1
   */
  formatScorePercent: (score: number): string => {
    return `${Math.round(score * 100)}%`;
  },

  /**
   * Sort ML matches by specified score type
   * @param matches - Array of ML job matches
   * @param scoreType - Which score to sort by
   */
  sortByScore: (
    matches: MLJobMatch[], 
    scoreType: 'ml' | 'rule' | 'hybrid' = 'hybrid'
  ): MLJobMatch[] => {
    return [...matches].sort((a, b) => {
      const getScore = (m: MLJobMatch) => {
        switch (scoreType) {
          case 'ml': return m.ml_score;
          case 'rule': return m.rule_score;
          case 'hybrid': return m.hybrid_score || m.rule_score;
        }
      };
      return getScore(b) - getScore(a);
    });
  },

  /**
   * Filter ML matches by minimum score
   * @param matches - Array of ML job matches
   * @param minScore - Minimum score (0-1)
   * @param scoreType - Which score to filter by
   */
  filterByMinScore: (
    matches: MLJobMatch[],
    minScore: number,
    scoreType: 'ml' | 'rule' | 'hybrid' = 'hybrid'
  ): MLJobMatch[] => {
    return matches.filter(m => {
      switch (scoreType) {
        case 'ml': return m.ml_score >= minScore;
        case 'rule': return m.rule_score >= minScore;
        case 'hybrid': return (m.hybrid_score || m.rule_score) >= minScore;
      }
    });
  },
};

// Export convenience functions from legacy service
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
} = matchService;

// Export ML service functions
export const {
  getMLPredictions,
  getHybridMatches,
  getMatchesByMethod,
  getModelInfo,
  checkHealth,
  getMLMatchStats,
  getScoreColor,
  getScoreLabel,
  formatScorePercent,
  sortByScore,
  filterByMinScore: filterMLByMinScore,
} = mlMatchService;

// Also export as matchingService for backwards compatibility
export const matchingService = matchService;
