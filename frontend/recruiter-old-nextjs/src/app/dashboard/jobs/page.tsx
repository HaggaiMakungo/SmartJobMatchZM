'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Users, Briefcase, TrendingUp, Award, 
  Download, Bookmark, MapPin, Calendar, DollarSign,
  Edit, Share2, Archive, Filter, Sparkles, Star,
  CheckCircle, Loader2, Eye, Mail, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { jobsApi } from '@/lib/api/jobs';

interface Job {
  job_id: string;
  title: string;
  company?: string;
  description: string;
  location_city?: string;
  location_province?: string;
  salary_min_zmw?: number;
  salary_max_zmw?: number;
  required_skills?: string;
  posted_date?: string;
  status?: string;
}

interface Candidate {
  cv_id: string;
  full_name: string;
  current_job_title: string;
  total_years_experience: number;
  city: string;
  email: string;
  phone?: string;
  match_score: number;
  match_percentage: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
}

interface Stats {
  totalJobs: number;
  totalCandidates: number;
  totalApplicants: number;
  avgMatchScore: number;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());
  
  // Cache for matched candidates per job
  const [candidatesCache, setCandidatesCache] = useState<Record<string, Candidate[]>>({});
  
  // Score filter slider
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  
  // Stats
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    totalCandidates: 0,
    totalApplicants: 0,
    avgMatchScore: 0
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      router.push('/login?redirect=/dashboard/jobs');
      return;
    }
    loadJobs();
  }, []);
  
  useEffect(() => {
    if (selectedJob) {
      // Check cache first
      if (candidatesCache[selectedJob.job_id]) {
        setCandidates(candidatesCache[selectedJob.job_id]);
        updateStatsFromCandidates(candidatesCache[selectedJob.job_id]);
      } else {
        loadCandidates(selectedJob.job_id);
      }
    }
  }, [selectedJob]);
  
  // Reload candidates when min score filter changes
  useEffect(() => {
    if (selectedJob) {
      loadCandidates(selectedJob.job_id);
    }
  }, [minScoreFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getCorporate({ limit: 100 });
      setJobs(response.jobs);
      
      if (response.jobs.length > 0) {
        setSelectedJob(response.jobs[0]);
      }

      setStats(prev => ({
        ...prev,
        totalJobs: response.jobs.length
      }));
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateStatsFromCandidates = (matchedCandidates: Candidate[]) => {
    const avgScore = matchedCandidates.length > 0
      ? matchedCandidates.reduce((sum: number, c: Candidate) => sum + c.match_score, 0) / matchedCandidates.length
      : 0;
      
    setStats(prev => ({
      ...prev,
      totalCandidates: matchedCandidates.length,
      avgMatchScore: Math.round(avgScore * 100)
    }));
  };

  const loadCandidates = async (jobId: string) => {
    try {
      setCandidatesLoading(true);
      
      // ⚡ Using OPTIMIZED endpoint for faster matching
      const response = await apiClient.get(`/recruiter/optimized/job/${jobId}/candidates`, {
        params: {
          limit: 100,
          min_score: minScoreFilter / 100,  // Convert percentage to decimal (0-1)
          use_cache: true  // Enable caching for instant subsequent loads
        }
      });
      
      const matchedCandidates = response.data.matched_candidates || [];
      const fromCache = response.data.from_cache || false;
      const processingTime = response.data.processing_time_seconds || 0;
      
      setCandidates(matchedCandidates);
      
      // Cache the results
      setCandidatesCache(prev => ({
        ...prev,
        [jobId]: matchedCandidates
      }));
      
      updateStatsFromCandidates(matchedCandidates);
      
      // Show performance toast
      if (fromCache) {
        toast.success(`✅ ${matchedCandidates.length} candidates loaded instantly (cached)`);
      } else {
        toast.success(`✅ ${matchedCandidates.length} candidates matched in ${processingTime}s`);
      }
      
    } catch (error) {
      console.error('Failed to load candidates:', error);
      toast.error('Failed to load matching candidates');
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleSaveCandidate = async (cvId: string) => {
    const candidate = candidates.find(c => c.cv_id === cvId);
    if (!candidate) return;

    const newSaved = new Set(savedCandidates);
    
    if (newSaved.has(cvId)) {
      // Unsave candidate
      try {
        await apiClient.delete(`/saved-candidates/unsave/${cvId}`);
        newSaved.delete(cvId);
        toast.success('Candidate removed from saved');
      } catch (error) {
        console.error('Failed to unsave candidate:', error);
        toast.error('Failed to remove candidate');
        return;
      }
    } else {
      // Save candidate
      try {
        await apiClient.post('/saved-candidates/save', {
          cv_id: cvId,
          job_id: selectedJob?.job_id,
          company_name: selectedJob?.company,
          match_score: candidate.match_score,
          tags: []
        });
        newSaved.add(cvId);
        toast.success('Candidate saved to your pool');
      } catch (error) {
        console.error('Failed to save candidate:', error);
        toast.error('Failed to save candidate');
        return;
      }
    }
    
    setSavedCandidates(newSaved);
  };

  const handleDownloadCV = (candidate: Candidate) => {
    toast.success(`Downloading CV for ${candidate.full_name}...`);
    // TODO: Implement actual CV download
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Negotiable';
    if (min && max) return `K${min.toLocaleString()} - K${max.toLocaleString()}`;
    if (min) return `K${min.toLocaleString()}+`;
    return `Up to K${max?.toLocaleString()}`;
  };

  // Apply filters
  const filteredCandidates = candidates.filter(candidate => {
    // Score filter (slider)
    if (candidate.match_percentage < minScoreFilter) return false;
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.current_job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.matched_skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Quick filters
    let matchesFilter = true;
    if (activeFilter === 'top10') {
      matchesFilter = candidate.match_percentage >= 90;
    } else if (activeFilter === 'high') {
      matchesFilter = candidate.match_percentage >= 50;
    } else if (activeFilter === 'sameCity') {
      matchesFilter = candidate.city === selectedJob?.location_city;
    }
    
    return matchesSearch && matchesFilter;
  });

  const statsCards = [
    { 
      label: 'Total Jobs', 
      value: stats.totalJobs.toString(), 
      change: 'Active postings', 
      icon: Briefcase, 
      color: 'tangerine' 
    },
    { 
      label: 'Matched Candidates', 
      value: stats.totalCandidates.toString(), 
      change: 'For this job', 
      icon: Users, 
      color: 'peach' 
    },
    { 
      label: 'Saved Candidates', 
      value: savedCandidates.size.toString(), 
      change: 'In your pool', 
      icon: Bookmark, 
      color: 'sage' 
    },
    { 
      label: 'Avg. Match Score', 
      value: `${stats.avgMatchScore}%`, 
      change: 'This job', 
      icon: Award, 
      color: 'gunmetal' 
    },
  ];

  const quickFilters = [
    { id: 'all', label: 'All Candidates', icon: Users },
    { id: 'top10', label: 'Top 10% (90%+)', icon: Star },
    { id: 'high', label: 'High Match (50%+)', icon: TrendingUp },
    { id: 'sameCity', label: 'Same City', icon: MapPin },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-tangerine mx-auto mb-4" />
          <p className="text-sage text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gunmetal dark:text-peach">Job Matching</h1>
          <p className="text-sage mt-1">AI-powered candidate recommendations</p>
        </div>
        <button 
          onClick={() => toast.info('Create job modal coming soon')}
          className="flex items-center gap-2 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      {/* Stats Cards - Smaller Version */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gunmetal/40 rounded-lg shadow-md p-4 border border-sage/10">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              {stat.label === 'Avg. Match Score' && stats.avgMatchScore > 60 && (
                <TrendingUp className="w-3 h-3 text-green-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gunmetal dark:text-peach">{stat.value}</h3>
            <p className="text-xs text-sage mb-0.5">{stat.label}</p>
            <p className="text-xs text-sage/70">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Job Selector */}
      {jobs.length > 0 && (
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-tangerine" />
            <label className="text-sm font-semibold text-gunmetal dark:text-peach">
              Select Job Position
            </label>
          </div>
          <select
            value={selectedJob?.job_id || ''}
            onChange={(e) => {
              const job = jobs.find(j => j.job_id === e.target.value);
              if (job) setSelectedJob(job);
            }}
            className="w-full px-4 py-3 border border-sage/30 rounded-lg focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach font-medium text-lg"
          >
            {jobs.map(job => (
              <option key={job.job_id} value={job.job_id}>
                {job.title} - {job.company || 'Your Company'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Job Details */}
      {selectedJob && (
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gunmetal dark:text-peach mb-2">
                {selectedJob.title}
              </h2>
              {selectedJob.company && (
                <p className="text-tangerine font-medium mb-3">{selectedJob.company}</p>
              )}
              <p className="text-sage mb-4 line-clamp-2">{selectedJob.description}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sage">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{selectedJob.location_city || selectedJob.location_province}</span>
                </div>
                <div className="flex items-center gap-2 text-sage">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">{formatSalary(selectedJob.salary_min_zmw, selectedJob.salary_max_zmw)}</span>
                </div>
                <div className="flex items-center gap-2 text-sage">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Posted recently</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => toast.info('Edit job modal coming soon')}
                className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
                title="Edit Job"
              >
                <Edit className="w-5 h-5 text-sage" />
              </button>
              <button
                onClick={() => toast.success('Job link copied to clipboard')}
                className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
                title="Share Job"
              >
                <Share2 className="w-5 h-5 text-sage" />
              </button>
              <button
                onClick={() => toast.success('Job archived')}
                className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
                title="Archive Job"
              >
                <Archive className="w-5 h-5 text-sage" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filters & Search */}
      <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-tangerine" />
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach">Quick Filters</h3>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-tangerine text-white shadow-md'
                  : 'bg-sage/10 text-sage hover:bg-sage/20'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sage w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, title, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-sage/30 rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach"
          />
        </div>
        
        {/* Score Slider Filter */}
        <div className="bg-sage/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gunmetal dark:text-peach">
              Minimum Match Score
            </label>
            <span className="text-lg font-bold text-tangerine">{minScoreFilter}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="w-full h-2 bg-sage/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${minScoreFilter}%, #e5e7eb ${minScoreFilter}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-sage mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-sage/70 mt-2">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </p>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gunmetal dark:text-peach">
            Matched Candidates ({filteredCandidates.length})
          </h3>
          {candidatesLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-tangerine" />
          )}
        </div>

        {!candidatesLoading && filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-sage mx-auto mb-3 opacity-50" />
            <p className="text-sage text-lg">No matching candidates found</p>
            <p className="text-sage/70 text-sm mt-2">
              {searchQuery || activeFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Candidates will appear here once matching is complete'}
            </p>
          </div>
        )}

        {candidatesLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-tangerine mx-auto mb-3" />
            <p className="text-sage text-lg">Finding best matches...</p>
          </div>
        )}

        {/* Candidate Cards */}
        {!candidatesLoading && filteredCandidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.cv_id}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setModalOpen(true);
                }}
                className="bg-white dark:bg-gunmetal/60 border border-sage/20 rounded-xl p-5 hover:shadow-xl hover:border-tangerine/50 transition-all cursor-pointer group"
              >
                {/* Match Score Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`text-3xl font-bold ${
                      candidate.match_percentage >= 70 ? 'text-green-500' :
                      candidate.match_percentage >= 50 ? 'text-yellow-500' :
                      'text-orange-500'
                    }`}>
                      {Math.round(candidate.match_percentage)}%
                    </div>
                    <div className="text-xs text-sage">match</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveCandidate(candidate.cv_id);
                    }}
                    className="p-2 hover:bg-tangerine/10 rounded-lg transition-colors"
                  >
                    <Bookmark 
                      className={`w-5 h-5 ${
                        savedCandidates.has(candidate.cv_id) 
                          ? 'fill-tangerine text-tangerine' 
                          : 'text-sage'
                      }`} 
                    />
                  </button>
                </div>

                {/* Candidate Info */}
                <h4 className="text-lg font-bold text-gunmetal dark:text-peach mb-1 group-hover:text-tangerine transition-colors">
                  {candidate.full_name}
                </h4>
                <p className="text-sm text-sage mb-3">{candidate.current_job_title}</p>

                {/* Skills Matched */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-gunmetal dark:text-peach">
                      {candidate.matched_skills.length} Skills Matched
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.matched_skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {candidate.matched_skills.length > 3 && (
                      <span className="px-2 py-1 bg-sage/10 text-sage rounded text-xs">
                        +{candidate.matched_skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-xs text-sage border-t border-sage/10 pt-3">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {candidate.total_years_experience} yrs
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {candidate.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {modalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gunmetal rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gunmetal border-b border-sage/10 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${
                  selectedCandidate.match_percentage >= 70 ? 'text-green-500' :
                  selectedCandidate.match_percentage >= 50 ? 'text-yellow-500' :
                  'text-orange-500'
                }`}>
                  {Math.round(selectedCandidate.match_percentage)}%
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">
                    {selectedCandidate.full_name}
                  </h2>
                  <p className="text-sage">{selectedCandidate.current_job_title}</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-sage hover:text-gunmetal dark:hover:text-peach transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleSaveCandidate(selectedCandidate.cv_id);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    savedCandidates.has(selectedCandidate.cv_id)
                      ? 'bg-tangerine text-white'
                      : 'bg-tangerine/10 text-tangerine hover:bg-tangerine/20'
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                  {savedCandidates.has(selectedCandidate.cv_id) ? 'Saved' : 'Save Candidate'}
                </button>
                <button
                  onClick={() => handleDownloadCV(selectedCandidate)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sage/10 text-sage hover:bg-sage/20 rounded-lg font-medium transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download CV
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-sage/5 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gunmetal dark:text-peach mb-3">Contact Information</h3>
                <div className="flex items-center gap-3 text-sage">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${selectedCandidate.email}`} className="hover:text-tangerine">
                    {selectedCandidate.email}
                  </a>
                </div>
                {selectedCandidate.phone && (
                  <div className="flex items-center gap-3 text-sage">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${selectedCandidate.phone}`} className="hover:text-tangerine">
                      {selectedCandidate.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sage">
                  <MapPin className="w-4 h-4" />
                  {selectedCandidate.city}
                </div>
                <div className="flex items-center gap-3 text-sage">
                  <Briefcase className="w-4 h-4" />
                  {selectedCandidate.total_years_experience} years experience
                </div>
              </div>

              {/* Match Explanation */}
              <div>
                <h3 className="font-semibold text-gunmetal dark:text-peach mb-3">Match Analysis</h3>
                <p className="text-sage leading-relaxed">{selectedCandidate.match_reason}</p>
              </div>

              {/* Matched Skills */}
              <div>
                <h3 className="font-semibold text-gunmetal dark:text-peach mb-3">
                  ✅ Matched Skills ({selectedCandidate.matched_skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.matched_skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {selectedCandidate.missing_skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gunmetal dark:text-peach mb-3">
                    ⚠️ Skills to Develop ({selectedCandidate.missing_skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.missing_skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
