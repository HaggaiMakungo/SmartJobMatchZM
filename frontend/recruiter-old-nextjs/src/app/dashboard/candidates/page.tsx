'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Trash2,
  Calendar,
  MessageSquare,
  BarChart3,
  Star,
  TrendingUp
} from 'lucide-react';
import KanbanColumn from '@/components/candidates/KanbanColumn';
import CandidateModal from '@/components/candidates/CandidateModal';
import NotesModal from '@/components/candidates/NotesModal';
import CommunicationModal from '@/components/candidates/CommunicationModal';
import AnalyticsModal from '@/components/candidates/AnalyticsModal';
import FilterPanel from '@/components/candidates/FilterPanel';
import apiClient from '@/lib/api/client';

// Stage definitions with your color scheme
const STAGES = [
  { id: 'saved', label: 'Saved', color: 'bg-sage-500' },
  { id: 'invited', label: 'Invited to Apply', color: 'bg-peach-400' },
  { id: 'screening', label: 'Screening', color: 'bg-tangerine-300' },
  { id: 'interview', label: 'Interview', color: 'bg-tangerine-500' },
  { id: 'offer', label: 'Offer', color: 'bg-peach-600' },
  { id: 'hired', label: 'Hired', color: 'bg-green-600' },
  { id: 'rejected', label: 'Rejected', color: 'bg-gunmetal-600' }
];

interface Candidate {
  saved_id?: number;
  cv_id: string;
  full_name: string;
  email: string;
  phone: string;
  current_job_title: string;
  city: string;
  province: string;
  total_years_experience: number;
  skills_technical: string;
  skills_soft: string;
  education_level: string;
  match_score?: number;
  stage: string;
  saved_date: string;
  linked_job?: string;
  company_name?: string;
  tags?: string[];
  notes_count?: number;
  last_contact?: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  
  // Modal states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Load saved candidates from backend
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/saved-candidates/list');
      
      if (response.data.success) {
        setCandidates(response.data.candidates);
        setFilteredCandidates(response.data.candidates);
      }
    } catch (error) {
      console.error('Failed to load saved candidates:', error);
      // Show empty state if no saved candidates
      setCandidates([]);
      setFilteredCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCandidates(candidates);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = candidates.filter(candidate => 
      candidate.full_name.toLowerCase().includes(query) ||
      candidate.current_job_title?.toLowerCase().includes(query) ||
      candidate.skills_technical?.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query)
    );
    setFilteredCandidates(filtered);
  }, [searchQuery, candidates]);

  // Drag and drop handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const candidateId = active.id as string;
    const newStage = over.id as string;

    // Optimistically update UI
    setCandidates(prev => 
      prev.map(c => c.cv_id === candidateId ? { ...c, stage: newStage } : c)
    );
    setFilteredCandidates(prev => 
      prev.map(c => c.cv_id === candidateId ? { ...c, stage: newStage } : c)
    );

    // Update backend
    try {
      await apiClient.patch(`/saved-candidates/${candidateId}/stage`, { stage: newStage });
    } catch (error) {
      console.error('Failed to update candidate stage:', error);
      // Revert on error
      loadCandidates();
    }
  };

  // Calculate stats
  const stats = {
    total: candidates.length,
    saved: candidates.filter(c => c.stage === 'saved').length,
    screening: candidates.filter(c => c.stage === 'screening').length,
    interview: candidates.filter(c => c.stage === 'interview').length,
    avgMatchScore: candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / candidates.length * 100) 
      : 0
  };

  // Bulk actions
  const handleBulkEmail = () => {
    console.log('Sending email to:', selectedCandidates);
    // TODO: Implement bulk email
  };

  const handleBulkExport = () => {
    console.log('Exporting:', selectedCandidates);
    // TODO: Implement export
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Remove ${selectedCandidates.length} candidates from saved list?`)) return;
    
    try {
      await Promise.all(
        selectedCandidates.map(cv_id => 
          apiClient.delete(`/saved-candidates/unsave/${cv_id}`)
        )
      );
      
      setCandidates(prev => prev.filter(c => !selectedCandidates.includes(c.cv_id)));
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Failed to delete candidates:', error);
    }
  };

  const openCandidateModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tangerine"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gunmetal dark:text-peach flex items-center gap-3">
            <Users className="w-8 h-8 text-tangerine" />
            Candidate Management
          </h1>
          <p className="text-sage mt-1">
            Manage your saved candidates and hiring pipeline
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="px-4 py-2 bg-white dark:bg-gunmetal/40 border border-sage/10 rounded-lg hover:bg-sage/5 dark:hover:bg-gunmetal/60 flex items-center gap-2 text-gunmetal dark:text-peach transition-colors shadow"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setShowCommunicationModal(true)}
            className="px-4 py-2 bg-white dark:bg-gunmetal/40 border border-sage/10 rounded-lg hover:bg-sage/5 dark:hover:bg-gunmetal/60 flex items-center gap-2 text-gunmetal dark:text-peach transition-colors shadow"
          >
            <MessageSquare className="w-4 h-4" />
            Communications
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow p-6 border border-sage/10">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-6 h-6 text-tangerine" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gunmetal dark:text-peach">{stats.total}</h3>
          <p className="text-sm text-sage mb-1">Total Candidates</p>
          <p className="text-xs text-sage/70">In your pipeline</p>
        </div>

        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow p-6 border border-sage/10">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-6 h-6 text-peach" />
          </div>
          <h3 className="text-2xl font-bold text-gunmetal dark:text-peach">{stats.saved}</h3>
          <p className="text-sm text-sage mb-1">Newly Saved</p>
          <p className="text-xs text-sage/70">Ready for review</p>
        </div>

        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow p-6 border border-sage/10">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-6 h-6 text-sage" />
          </div>
          <h3 className="text-2xl font-bold text-gunmetal dark:text-peach">{stats.interview}</h3>
          <p className="text-sm text-sage mb-1">In Interview</p>
          <p className="text-xs text-sage/70">Scheduled or pending</p>
        </div>

        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow p-6 border border-sage/10">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-6 h-6 text-gunmetal/70 dark:text-peach/70" />
          </div>
          <h3 className="text-2xl font-bold text-gunmetal dark:text-peach">{stats.avgMatchScore}%</h3>
          <p className="text-sm text-sage mb-1">Avg Match Score</p>
          <p className="text-xs text-sage/70">Quality of matches</p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow p-4 border border-sage/10">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
            <input
              type="text"
              placeholder="Search by name, title, skills, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-sage/30 rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent outline-none bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-white dark:bg-gunmetal/50 border border-sage/30 rounded-lg hover:bg-sage/5 dark:hover:bg-gunmetal/70 flex items-center gap-2 text-gunmetal dark:text-peach transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          {/* Bulk Actions */}
          {selectedCandidates.length > 0 && (
            <div className="flex gap-2 bg-tangerine px-4 py-2 rounded-lg shadow">
              <span className="text-white font-medium self-center">
                {selectedCandidates.length} selected
              </span>
              <button
                onClick={handleBulkEmail}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Send Email"
              >
                <Mail className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleBulkExport}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Export"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Remove"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FilterPanel
          candidates={candidates}
          onFilter={setFilteredCandidates}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Kanban Board or Empty State */}
      {candidates.length === 0 ? (
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow border border-sage/10 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-sage/50 mb-4" />
            <h3 className="text-xl font-semibold text-gunmetal dark:text-peach mb-2">No Saved Candidates Yet</h3>
            <p className="text-sage text-center max-w-md">
              Save candidates from the Jobs page to manage them here. Click the bookmark icon next to any candidate to save them.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow p-6 border border-sage/10">
          <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map(stage => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  candidates={filteredCandidates.filter(c => c.stage === stage.id)}
                  selectedCandidates={selectedCandidates}
                  onSelectCandidate={(id, selected) => {
                    if (selected) {
                      setSelectedCandidates(prev => [...prev, id]);
                    } else {
                      setSelectedCandidates(prev => prev.filter(cid => cid !== id));
                    }
                  }}
                  onCandidateClick={openCandidateModal}
                  onOpenNotes={(candidate) => {
                    setSelectedCandidate(candidate);
                    setShowNotesModal(true);
                  }}
                />
              ))}
            </div>
          </DndContext>
        </div>
      )}

      {/* Modals */}
      {showCandidateModal && selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => {
            setShowCandidateModal(false);
            setSelectedCandidate(null);
          }}
          onOpenNotes={() => setShowNotesModal(true)}
          onOpenCommunication={() => setShowCommunicationModal(true)}
        />
      )}

      {showNotesModal && selectedCandidate && (
        <NotesModal
          candidate={selectedCandidate}
          onClose={() => setShowNotesModal(false)}
        />
      )}

      {showCommunicationModal && (
        <CommunicationModal
          candidate={selectedCandidate}
          onClose={() => setShowCommunicationModal(false)}
        />
      )}

      {showAnalyticsModal && (
        <AnalyticsModal
          candidates={candidates}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}
    </div>
  );
}
