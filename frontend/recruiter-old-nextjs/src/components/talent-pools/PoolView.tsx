'use client';

import { useState } from 'react';
import { ArrowLeft, Edit, Share2, Copy, Archive, Trash2, Download, Mail, Plus, Search, SlidersHorizontal } from 'lucide-react';
import CandidateCard from '@/components/candidates/CandidateCard';
import CandidateProfileModal from '@/components/candidates/CandidateProfileModal';
import AddCandidatesModal from '@/components/talent-pools/AddCandidatesModal';

// Mock candidates in pool
const mockPoolCandidates = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Frontend Developer',
    location: 'Lusaka, Zambia',
    matchScore: 95,
    skills: ['React', 'TypeScript', 'Next.js'],
    experience: 6,
    availability: 'Active Seeker',
    photo: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=f29559&color=fff',
    email: 'sarah.j@email.com',
    phone: '+260 97 123 4567',
    saved: true,
    status: 'Active Seeker'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Full Stack Engineer',
    location: 'Remote',
    matchScore: 88,
    skills: ['Node.js', 'Python', 'PostgreSQL'],
    experience: 4,
    availability: 'Passive',
    photo: 'https://ui-avatars.com/api/?name=Michael+Chen&background=f29559&color=fff',
    email: 'michael.c@email.com',
    phone: '+260 96 234 5678',
    saved: false,
    status: 'Passive'
  }
];

interface PoolViewProps {
  pool: any;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onRemoveCandidate: (candidate: any) => void;
  onBack: () => void;
}

export default function PoolView({
  pool,
  onEdit,
  onShare,
  onDelete,
  onArchive,
  onDuplicate,
  onRemoveCandidate,
  onBack
}: PoolViewProps) {
  const [candidates] = useState(mockPoolCandidates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Filter candidates
  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pool stats
  const avgMatchScore = Math.round(
    candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length
  );
  const availabilityBreakdown = candidates.reduce((acc: any, c) => {
    acc[c.availability] = (acc[c.availability] || 0) + 1;
    return acc;
  }, {});

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleBulkEmail = () => {
    console.log('Sending email to:', selectedCandidates);
    alert('Email feature coming soon!');
  };

  const handleBulkExport = () => {
    console.log('Exporting candidates:', selectedCandidates);
    alert('Export feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sage hover:text-gunmetal dark:hover:text-peach transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to All Pools</span>
      </button>

      {/* Pool Header */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl shadow-md p-6 border border-sage/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: pool.color + '20' }}
            >
              {pool.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">
                  {pool.name}
                </h2>
                {pool.isSmartPool && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-300 text-sm rounded-full font-medium">
                    Smart Pool
                  </span>
                )}
                {pool.status === 'archived' && (
                  <span className="px-3 py-1 bg-sage/20 text-sage text-sm rounded-full font-medium">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-sage mb-4">{pool.description}</p>
              <div className="flex flex-wrap gap-3 text-sm text-sage">
                <span>{pool.candidateCount} candidates</span>
                <span>•</span>
                <span>Updated {pool.lastUpdated}</span>
                <span>•</span>
                <span className="capitalize">{pool.visibility}</span>
                <span>•</span>
                <span>Owner: {pool.owner}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
              title="Edit Pool"
            >
              <Edit className="w-5 h-5 text-sage" />
            </button>
            <button
              onClick={onShare}
              className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
              title="Share Pool"
            >
              <Share2 className="w-5 h-5 text-sage" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
              title="Duplicate Pool"
            >
              <Copy className="w-5 h-5 text-sage" />
            </button>
            <button
              onClick={onArchive}
              className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
              title={pool.status === 'archived' ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-5 h-5 text-sage" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Pool"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-sage/10">
          <div className="text-center">
            <p className="text-sm text-sage mb-1">Average Match Score</p>
            <p className="text-3xl font-bold text-gunmetal dark:text-peach">{avgMatchScore}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-sage mb-1">Availability</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {Object.entries(availabilityBreakdown).map(([status, count]) => (
                <span key={status} className="px-2 py-1 bg-sage/10 rounded text-xs text-gunmetal dark:text-peach">
                  {status}: {count as number}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-sage mb-1">Top Skills</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['React', 'TypeScript', 'Node.js'].map(skill => (
                <span key={skill} className="px-2 py-1 bg-tangerine/10 text-tangerine rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl shadow-md p-6 border border-sage/10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
            <input
              type="text"
              placeholder="Search candidates in this pool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Candidates</span>
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-sage/10">
            <span className="text-sm text-sage">
              {selectedCandidates.length} selected
            </span>
            <button
              onClick={handleBulkEmail}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setSelectedCandidates([])}
              className="px-4 py-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-lg text-sm transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl shadow-md p-12 text-center border border-sage/10">
          <p className="text-lg text-sage mb-4">
            {searchQuery ? 'No candidates match your search' : 'No candidates in this pool yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
            >
              Add Your First Candidate
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="relative">
              <CandidateCard
                candidate={candidate}
                onViewProfile={() => setSelectedCandidate(candidate)}
                isSelected={selectedCandidates.includes(candidate.id)}
                onToggleSelect={() => toggleSelectCandidate(candidate.id)}
                viewMode="grid"
              />
              <button
                onClick={() => onRemoveCandidate(candidate)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors z-10"
                title="Remove from pool"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {showAddModal && (
        <AddCandidatesModal
          poolName={pool.name}
          onClose={() => setShowAddModal(false)}
          onAdd={(candidateIds) => {
            console.log('Adding candidates:', candidateIds);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
