import { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  MapPin, 
  DollarSign, 
  Calendar,
  Loader2,
  Search,
  SlidersHorizontal,
  BookmarkPlus,
  Eye,
  CheckSquare,
  Square,
  Plus,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import { usePageCacheStore } from '@/store/page-cache.store';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { getMatchScoreColor, getMatchScoreTextColor } from '@/utils/matchScoreColors';
import PostJobModal from '@/components/PostJobModal';
import ResumeIndicator from '@/components/ui/ResumeIndicator';
import CandidateDetailModal from '@/components/CandidateDetailModal';
import type { Job, MatchedCandidate } from '@/types';

export default function JobsPage() {
  const { user } = useAuthStore();
  const { jobsPage, setJobsPageCache, resetJobsPageCache } = usePageCacheStore();
  const scrollContainerRef = useScrollRestoration({ key: 'jobs-page' });
  const isInitialMount = useRef(true);
  
  // Initialize state from cache
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<MatchedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [minMatchScore, setMinMatchScore] = useState(jobsPage.minMatchScore);
  const [sortBy, setSortBy] = useState<'match_score' | 'experience' | 'location'>(jobsPage.sortBy);
  const [currentPage, setCurrentPage] = useState(jobsPage.currentPage);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set(jobsPage.selectedCandidateIds)
  );
  const [showFilters, setShowFilters] = useState(jobsPage.showFilters);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  
  const candidatesPerPage = 20;

  // Check if resuming from cache
  const isResumingFromCache = jobsPage.lastFetched > 0 && isInitialMount.current;
  const cacheAgeMinutes = Math.floor((Date.now() - jobsPage.lastFetched) / 60000);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
    isInitialMount.current = false;
  }, []);

  // Restore selected job from cache after jobs are loaded
  useEffect(() => {
    if (jobs.length > 0 && jobsPage.selectedJobId) {
      const cachedJob = jobs.find(j => j.id === jobsPage.selectedJobId);
      if (cachedJob) {
        setSelectedJob(cachedJob);
      } else {
        setSelectedJob(jobs[0]);
      }
    } else if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, jobsPage.selectedJobId]);

  // Fetch candidates when job changes
  useEffect(() => {
    if (selectedJob) {
      fetchCandidates();
    }
  }, [selectedJob, minMatchScore]);

  // Cache state changes
  useEffect(() => {
    setJobsPageCache({
      selectedJobId: selectedJob?.id || null,
      minMatchScore,
      sortBy,
      showFilters,
      currentPage,
      selectedCandidateIds: Array.from(selectedCandidates),
    });
  }, [selectedJob, minMatchScore, sortBy, showFilters, currentPage, selectedCandidates]);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const data = await apiClient.getJobs();
      
      const jobsArray = Array.isArray(data) ? data : [];
      console.log('Jobs fetched:', jobsArray.length, jobsArray);
      
      setJobs(jobsArray);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchCandidates = async () => {
    if (!selectedJob) return;
    
    try {
      setLoading(true);
      const data = await apiClient.getCandidatesForJob(selectedJob.id, {
        min_score: minMatchScore / 100,
        limit: 100
      });
      
      console.log('Candidates response:', data);
      
      const candidatesList = data.matched_candidates || data.candidates || [];
      setCandidates(candidatesList);
      setCurrentPage(1);
      setSelectedCandidates(new Set());
    } catch (error: any) {
      console.error('Failed to fetch candidates:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
    }
  };

  const handleSaveCandidate = async (candidate: MatchedCandidate) => {
    if (!selectedJob) return;
    
    try {
      await apiClient.saveCandidate({
        cv_id: candidate.cv_id,
        job_id: selectedJob.id,
        match_score: candidate.match_score
      });
      alert(`Saved ${candidate.full_name} to your pipeline!`);
    } catch (error) {
      console.error('Failed to save candidate:', error);
      alert('Failed to save candidate');
    }
  };

  const handleBulkSave = async () => {
    if (!selectedJob || selectedCandidates.size === 0) return;
    
    try {
      const candidatesToSave = candidates.filter(c => selectedCandidates.has(c.cv_id));
      await Promise.all(
        candidatesToSave.map(candidate =>
          apiClient.saveCandidate({
            cv_id: candidate.cv_id,
            job_id: selectedJob.id,
            match_score: candidate.match_score
          })
        )
      );
      alert(`Saved ${selectedCandidates.size} candidates to your pipeline!`);
      setSelectedCandidates(new Set());
    } catch (error) {
      console.error('Failed to bulk save:', error);
      alert('Failed to save candidates');
    }
  };

  const toggleCandidateSelection = (cvId: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(cvId)) {
      newSelected.delete(cvId);
    } else {
      newSelected.add(cvId);
    }
    setSelectedCandidates(newSelected);
  };

  const handleResetFilters = () => {
    setMinMatchScore(0);
    setSortBy('match_score');
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Sorting and filtering
  const filteredAndSortedCandidates = [...candidates]
    .filter(candidate => candidate.match_score >= minMatchScore)
    .sort((a, b) => {
    switch (sortBy) {
      case 'match_score':
        return b.match_score - a.match_score;
      case 'experience':
        return (b.years_experience || 0) - (a.years_experience || 0);
      case 'location':
        return (a.location || '').localeCompare(b.location || '');
      default:
        return 0;
    }
  });

  // Calculate average match score
  const averageMatchScore = filteredAndSortedCandidates.length > 0
    ? Math.round(filteredAndSortedCandidates.reduce((sum, c) => sum + c.match_score, 0) / filteredAndSortedCandidates.length)
    : 0;

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / candidatesPerPage);
  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-tangerine animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={scrollContainerRef}>
      {/* Resume Indicator */}
      {isResumingFromCache && cacheAgeMinutes < 60 && (
        <ResumeIndicator
          pageName="Jobs Page"
          cacheAge={cacheAgeMinutes}
          onReset={resetJobsPageCache}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Job Matching</h1>
          <p className="text-gray-400">Find the perfect candidates for your positions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPostJobModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </button>
          
          {selectedCandidates.size > 0 && (
            <>
              <span className="text-sm text-gray-400">
                {selectedCandidates.size} selected
              </span>
              <button
                onClick={handleBulkSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                <BookmarkPlus className="w-4 h-4" />
                Save Selected
              </button>
            </>
          )}
        </div>
      </div>

      {/* Job Selection with Average Match Score */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Job Dropdown (narrower) */}
          <div className="flex-1 max-w-2xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Job
            </label>
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => handleJobChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent outline-none transition"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.location}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Average Match Score */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-tangerine/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-tangerine" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Average Match</p>
                <p className="text-2xl font-bold text-tangerine">{averageMatchScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Job Details - Always Expanded */}
      {selectedJob && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">{selectedJob.title}</h2>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-tangerine" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-sage" />
                  {selectedJob.salary_range || 'Not specified'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-peach" />
                  Posted {new Date(selectedJob.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Always show description and requirements */}
              {(selectedJob.description || selectedJob.requirements) && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-700">
                  {selectedJob.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Description</h3>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
                    </div>
                  )}
                  
                  {selectedJob.requirements && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Requirements</h3>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedJob.requirements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Controls */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Filters & Sort</h3>
          <div className="flex items-center gap-2">
            {(minMatchScore > 0 || sortBy !== 'match_score') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4">
            {/* Match Score Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Minimum Match Score
                </label>
                <span className="text-sm font-semibold text-tangerine">
                  {minMatchScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tangerine"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine outline-none"
              >
                <option value="match_score">Match Score (High to Low)</option>
                <option value="experience">Years of Experience</option>
                <option value="location">Location</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-tangerine animate-spin mb-4" />
            <p className="text-xl font-semibold text-white mb-2">Matching with AI...</p>
            <p className="text-sm text-gray-400">
              Analyzing {jobs.find(j => j.id === selectedJob?.id)?.title} candidates
            </p>
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      {!loading && candidates.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {paginatedCandidates.length} of {filteredAndSortedCandidates.length} candidates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.cv_id}
                candidate={candidate}
                isSelected={selectedCandidates.has(candidate.cv_id)}
                onToggleSelect={() => toggleCandidateSelection(candidate.cv_id)}
                onSave={() => handleSaveCandidate(candidate)}
                jobTitle={selectedJob?.title}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:border-tangerine disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show first page, last page, current page, and pages around current
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition ${
                        currentPage === page
                          ? 'bg-tangerine text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-tangerine'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:border-tangerine disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* No Candidates */}
      {!loading && candidates.length === 0 && selectedJob && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12">
          <div className="text-center">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
            <p className="text-gray-400 mb-4">
              Try lowering the minimum match score to see more candidates
            </p>
            <button
              onClick={() => setMinMatchScore(0)}
              className="px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onSuccess={() => {
          fetchJobs();
          alert('Job posted successfully!');
        }}
      />
    </div>
  );
}

// Candidate Card Component
function CandidateCard({ 
  candidate, 
  isSelected,
  onToggleSelect,
  onSave, 
  jobTitle
}: { 
  candidate: MatchedCandidate;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSave: () => void;
  jobTitle?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const matchPercent = Math.round(candidate.match_score);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (matchPercent / 100) * circumference;
  
  // Get smooth gradient color based on score
  const ringColor = getMatchScoreColor(matchPercent);
  const textColor = getMatchScoreTextColor(matchPercent);

  return (
    <>
      <div className={`bg-gray-800 border rounded-lg p-5 hover:border-tangerine transition-all group relative ${
        isSelected ? 'border-tangerine' : 'border-gray-700'
      }`}>
        {/* Selection Checkbox */}
        <button
          onClick={onToggleSelect}
          className="absolute top-3 right-3 p-1 hover:bg-gray-700 rounded transition"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-tangerine" />
          ) : (
            <Square className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
          )}
        </button>

        {/* Match Score Ring with Smooth Color Gradient */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <svg className="transform -rotate-90 w-20 h-20">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-700"
            />
            {/* Progress circle with smooth color */}
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke={ringColor}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-lg font-bold" 
              style={{ color: ringColor }}
            >
              {matchPercent}%
            </span>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {candidate.full_name}
          </h3>
          <p className="text-sm text-gray-400 truncate">
            {candidate.current_position || 'Position not specified'}
          </p>
        </div>

        {/* Top Skills */}
        {candidate.top_skills && candidate.top_skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-400 mb-2">Top Skills</p>
            <div className="flex flex-wrap gap-1">
              {candidate.top_skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-tangerine/10 text-tangerine text-xs rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Reason */}
        {candidate.match_reason && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 line-clamp-2">
              {candidate.match_reason}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-tangerine hover:bg-tangerine/90 text-white text-sm rounded-lg transition"
          >
            <BookmarkPlus className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {showModal && (
        <CandidateDetailModal
          candidate={candidate}
          jobTitle={jobTitle}
          onClose={() => setShowModal(false)}
          onSave={onSave}
        />
      )}
    </>
  );
}
