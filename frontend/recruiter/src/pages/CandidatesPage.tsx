import { useState, useEffect, useRef } from 'react';
import {
  Loader2,
  Search,
  Filter,
  Download,
  Mail,
  Trash2,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  CheckSquare,
  Square,
  Eye,
  Star,
  Users,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Calendar,
  Phone,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { usePageCacheStore } from '@/store/page-cache.store';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import ResumeIndicator from '@/components/ui/ResumeIndicator';
import CandidateDetailModal from '@/components/CandidateDetailModal';
import type { SavedCandidate, CandidateStatus, MatchedCandidate } from '@/types';
import { StageDetailModal } from '@/components/StageDetailModal';

const STAGES: { value: CandidateStatus; label: string; color: string; icon: any }[] = [
  { value: 'saved', label: 'Saved', color: 'bg-gray-600', icon: Star },
  { value: 'invited', label: 'Invited', color: 'bg-blue-600', icon: Mail },
  { value: 'screening', label: 'Screening', color: 'bg-purple-600', icon: ClipboardList },
  { value: 'interview', label: 'Interview', color: 'bg-yellow-600', icon: Users },
  { value: 'offer', label: 'Offer', color: 'bg-green-600', icon: TrendingUp },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-600', icon: UserCheck },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-600', icon: X },
];

// Helper function to convert SavedCandidate to MatchedCandidate format
function convertToMatchedCandidate(saved: SavedCandidate): MatchedCandidate {
  // Parse skills if they come as strings from the API
 const parseSkills = (skillsData: any): string[] => {
  if (!skillsData) return [];
  if (Array.isArray(skillsData)) return skillsData;
  
  if (typeof skillsData === "string") {
    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(skillsData);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If not JSON, try comma-separated
      if (skillsData.includes(",")) {
        return skillsData.split(",").map((s) => s.trim());
      }
      // NEW: Handle space-separated strings
      if (skillsData.includes(" ")) {
        return skillsData.split(/\s+/).map((s) => s.trim()).filter(Boolean);
      }
      // Single skill
      return [skillsData.trim()];
    }
  }
  
  return [];
};

  const technicalSkills = parseSkills(saved.skills_technical);
  const softSkills = parseSkills(saved.skills_soft);
  
  // Combine all skills from different sources
  const allSkills = [
    ...technicalSkills,
    ...softSkills,
  ].filter((skill, index, self) => self.indexOf(skill) === index); // Remove duplicates

  console.log('Converting SavedCandidate to MatchedCandidate:', {
    original: saved,
    technicalSkills,
    softSkills,
    allSkills
  });

  return {
    cv_id: saved.cv_id,
    full_name: saved.full_name,
    email: saved.email,
    phone: saved.phone,
    location: `${saved.city}, ${saved.province}`,
    city: saved.city,
    province: saved.province,
    current_position: saved.current_job_title,
    current_job_title: saved.current_job_title,
    years_experience: saved.total_years_experience,
    total_years_experience: saved.total_years_experience,
    education: saved.education_level,
    education_level: saved.education_level,
    top_skills: allSkills,
    skills_technical: technicalSkills,
    skills_soft: softSkills,
    match_score: saved.match_score,
    matched_skills: allSkills,
  };
}

export default function CandidatesPage() {
  const { candidatesPage, setCandidatesPageCache, resetCandidatesPageCache } = usePageCacheStore();
  const scrollContainerRef = useScrollRestoration({ key: 'candidates-page' });
  const isInitialMount = useRef(true);
  
  // Initialize state from cache
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set(candidatesPage.selectedCandidateIds)
  );
  const [searchQuery, setSearchQuery] = useState(candidatesPage.searchQuery);
  const [showFilters, setShowFilters] = useState(candidatesPage.showFilters);
  const [showFavorites, setShowFavorites] = useState(candidatesPage.showFavorites);
  const [filters, setFilters] = useState(candidatesPage.filters);
  const [selectedStageModal, setSelectedStageModal] = useState<CandidateStatus | null>(null);
  const [draggedCandidate, setDraggedCandidate] = useState<SavedCandidate | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Check if resuming from cache
  const isResumingFromCache = candidatesPage.lastFetched > 0 && isInitialMount.current;
  const cacheAgeMinutes = Math.floor((Date.now() - candidatesPage.lastFetched) / 60000);

  useEffect(() => {
    fetchCandidates();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteCandidates');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    
    // Set up polling for real-time updates (every 10 seconds)
    const interval = setInterval(fetchCandidates, 10000);
    
    isInitialMount.current = false;
    return () => clearInterval(interval);
  }, []);

  // Cache state changes
  useEffect(() => {
    setCandidatesPageCache({
      searchQuery,
      showFilters,
      showFavorites,
      filters,
      selectedCandidateIds: Array.from(selectedCandidates),
    });
  }, [searchQuery, showFilters, showFavorites, filters, selectedCandidates]);

  const fetchCandidates = async () => {
    try {
      const response = await apiClient.getSavedCandidates();
      setCandidates(response.candidates || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (cvId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(cvId)) {
      newFavorites.delete(cvId);
    } else {
      newFavorites.add(cvId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteCandidates', JSON.stringify(Array.from(newFavorites)));
  };

  const handleDragStart = (candidate: SavedCandidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStage: CandidateStatus) => {
    e.preventDefault();
    
    if (!draggedCandidate || draggedCandidate.stage === newStage) {
      setDraggedCandidate(null);
      return;
    }

    try {
      await apiClient.updateCandidateStage(draggedCandidate.cv_id, newStage);
      
      setCandidates(prev =>
        prev.map(c =>
          c.cv_id === draggedCandidate.cv_id
            ? { ...c, stage: newStage }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to update stage:', error);
      alert('Failed to move candidate');
    } finally {
      setDraggedCandidate(null);
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

  const handleBulkStageChange = async (newStage: CandidateStatus) => {
    if (selectedCandidates.size === 0) return;

    try {
      const promises = Array.from(selectedCandidates).map(cvId =>
        apiClient.updateCandidateStage(cvId, newStage)
      );
      
      await Promise.all(promises);
      
      setCandidates(prev =>
        prev.map(c =>
          selectedCandidates.has(c.cv_id)
            ? { ...c, stage: newStage }
            : c
        )
      );

      setSelectedCandidates(new Set());
      alert(`Moved ${selectedCandidates.size} candidates to ${newStage}`);
    } catch (error) {
      console.error('Failed to bulk update:', error);
      alert('Failed to move candidates');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCandidates.size === 0) return;
    if (!confirm(`Delete ${selectedCandidates.size} candidates?`)) return;

    try {
      const promises = Array.from(selectedCandidates).map(cvId =>
        apiClient.unsaveCandidate(cvId)
      );
      
      await Promise.all(promises);
      
      setCandidates(prev =>
        prev.filter(c => !selectedCandidates.has(c.cv_id))
      );

      setSelectedCandidates(new Set());
      alert(`Deleted ${selectedCandidates.size} candidates`);
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      alert('Failed to delete candidates');
    }
  };

  const exportToCSV = () => {
    const selectedCands = candidates.filter(c => selectedCandidates.has(c.cv_id));
    const dataToExport = selectedCands.length > 0 ? selectedCands : candidates;

    const csv = [
      ['Name', 'Email', 'Phone', 'Position', 'Stage', 'Match Score', 'Location', 'Experience', 'Education', 'Saved Date'],
      ...dataToExport.map(c => [
        c.full_name,
        c.email,
        c.phone,
        c.current_job_title,
        c.stage,
        c.match_score,
        `${c.city}, ${c.province}`,
        c.total_years_experience,
        c.education_level,
        new Date(c.saved_date).toLocaleDateString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate stats
  const stats = {
    total: candidates.length,
    applied: candidates.filter(c => c.stage === 'saved' || c.stage === 'invited').length,
    interviewing: candidates.filter(c => c.stage === 'screening' || c.stage === 'interview').length,
    reviewing: candidates.filter(c => c.stage === 'offer').length,
    avgMatchScore: candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length)
      : 0,
  };

  // Filter candidates
  let filteredCandidates = candidates.filter(candidate => {
    // Favorites filter
    if (showFavorites && !favorites.has(candidate.cv_id)) return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !candidate.full_name.toLowerCase().includes(query) &&
        !candidate.email.toLowerCase().includes(query) &&
        !candidate.current_job_title.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Filters
    if (filters.stage && candidate.stage !== filters.stage) return false;
    if (filters.location && !`${candidate.city}, ${candidate.province}`.toLowerCase().includes(filters.location.toLowerCase())) return false;
    
    // Match score is stored as 0-100, so we can compare directly
    const candidateScore = candidate.match_score; // Already in percentage (0-100)
    if (candidateScore < filters.minScore || candidateScore > filters.maxScore) return false;
    
    return true;
  });

  // Group by stage
  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage.value] = filteredCandidates.filter(c => c.stage === stage.value);
    return acc;
  }, {} as Record<CandidateStatus, SavedCandidate[]>);

  if (loading) {
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
          pageName="Candidates Pipeline"
          cacheAge={cacheAgeMinutes}
          onReset={resetCandidatesPageCache}
        />
      )}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Candidate Pipeline</h1>
        <p className="text-gray-400">
          Manage and track all your candidates through the hiring process
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Candidates */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-700 rounded-lg">
              <Users className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Candidates</div>
            </div>
          </div>
        </div>

        {/* Applied Card */}
        <button
          onClick={() => setSelectedStageModal('saved')}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.applied}</div>
              <div className="text-sm text-gray-400">Applied</div>
            </div>
          </div>
        </button>

        {/* Interviewing Card */}
        <button
          onClick={() => setSelectedStageModal('interview')}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-500 transition cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition">
              <ClipboardList className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.interviewing}</div>
              <div className="text-sm text-gray-400">Interviewing</div>
            </div>
          </div>
        </button>

        {/* Reviewing Card */}
        <button
          onClick={() => setSelectedStageModal('offer')}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.reviewing}</div>
              <div className="text-sm text-gray-400">Reviewing</div>
            </div>
          </div>
        </button>

        {/* Average Match Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tangerine/10 rounded-lg">
              <Star className="w-5 h-5 text-tangerine" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.avgMatchScore}%</div>
              <div className="text-sm text-gray-400">Avg Match</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFavorites
                ? 'bg-tangerine text-white'
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-tangerine'
            }`}
          >
            <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favorites ({favorites.size})
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters
                ? 'bg-tangerine text-white'
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-tangerine'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedCandidates.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {selectedCandidates.size} selected
            </span>
            
            <select
              onChange={(e) => handleBulkStageChange(e.target.value as CandidateStatus)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine outline-none"
              defaultValue=""
            >
              <option value="" disabled>Move to...</option>
              {STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:border-tangerine transition"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine outline-none"
            />
          </div>

          {!selectedCandidates.size && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg hover:border-tangerine transition"
            >
              <Download className="w-4 h-4" />
              Export All
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value as CandidateStatus | '' })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine outline-none"
              >
                <option value="">All Stages</option>
                {STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                placeholder="City or province"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Match</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-tangerine outline-none"
              />
            </div>

            <button
              onClick={() => setFilters({
                stage: '',
                location: '',
                minScore: 0,
                maxScore: 100,
              })}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg hover:border-tangerine transition mt-6"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        )}
      </div>



      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.value}
            stage={stage}
            candidates={candidatesByStage[stage.value]}
            selectedCandidates={selectedCandidates}
            favorites={favorites}
            onToggleSelect={toggleCandidateSelection}
            onToggleFavorite={toggleFavorite}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Stage Detail Modal */}
      {selectedStageModal && (
        <StageDetailModal
          stage={STAGES.find(s => s.value === selectedStageModal)!}
          candidates={candidates.filter(c => {
            if (selectedStageModal === 'saved') {
              return c.stage === 'saved' || c.stage === 'invited';
            } else if (selectedStageModal === 'interview') {
              return c.stage === 'screening' || c.stage === 'interview';
            } else {
              return c.stage === selectedStageModal;
            }
          })}
          onClose={() => setSelectedStageModal(null)}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
        />
      )}
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({
  stage,
  candidates,
  selectedCandidates,
  favorites,
  onToggleSelect,
  onToggleFavorite,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  stage: { value: CandidateStatus; label: string; color: string; icon: any };
  candidates: SavedCandidate[];
  selectedCandidates: Set<string>;
  favorites: Set<string>;
  onToggleSelect: (cvId: string) => void;
  onToggleFavorite: (cvId: string) => void;
  onDragStart: (candidate: SavedCandidate) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: CandidateStatus) => void;
}) {
  const StageIcon = stage.icon;
  
  return (
    <div
      className="flex flex-col w-[280px] flex-shrink-0 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.value)}
    >
      <div className={`${stage.color} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StageIcon className="w-4 h-4 text-white" />
            <h3 className="text-white font-semibold">{stage.label}</h3>
          </div>
          <span className="bg-white/20 text-white text-sm px-2 py-0.5 rounded-full">
            {candidates.length}
          </span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[70vh]">
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No candidates
          </div>
        ) : (
          candidates.map(candidate => (
            <CandidateCard
              key={candidate.cv_id}
              candidate={candidate}
              isSelected={selectedCandidates.has(candidate.cv_id)}
              isFavorite={favorites.has(candidate.cv_id)}
              onToggleSelect={() => onToggleSelect(candidate.cv_id)}
              onToggleFavorite={() => onToggleFavorite(candidate.cv_id)}
              onDragStart={() => onDragStart(candidate)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Candidate Card Component
function CandidateCard({
  candidate,
  isSelected,
  isFavorite,
  onToggleSelect,
  onToggleFavorite,
  onDragStart,
}: {
  candidate: SavedCandidate;
  isSelected: boolean;
  isFavorite: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onDragStart: () => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        className={`bg-gray-900 border rounded-lg p-4 hover:border-tangerine transition cursor-move relative group ${
          isSelected ? 'border-tangerine' : 'border-gray-700'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-tangerine/10 text-tangerine text-xs font-semibold rounded">
            {Math.round(candidate.match_score)}%
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-1 hover:bg-gray-800 rounded transition"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-tangerine text-tangerine' : 'text-gray-500'}`} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className="p-1 hover:bg-gray-800 rounded transition"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-tangerine" />
              ) : (
                <Square className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100" />
              )}
            </button>
          </div>
        </div>

        <h4 className="text-white font-semibold mb-1 truncate">
          {candidate.full_name}
        </h4>
        <p className="text-sm text-gray-400 mb-3 truncate">
          {candidate.current_job_title}
        </p>

        <div className="space-y-1.5 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{candidate.city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            {candidate.total_years_experience} years
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      </div>

      {showModal && (
        <CandidateDetailModal
          candidate={convertToMatchedCandidate(candidate)}
          jobTitle={candidate.linked_job || undefined}
          onClose={() => setShowModal(false)}
          onSave={() => {}}
        />
      )}
    </>
  );
}

