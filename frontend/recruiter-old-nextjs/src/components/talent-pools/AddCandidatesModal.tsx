'use client';

import { useState } from 'react';
import { X, Search, Check } from 'lucide-react';

// Mock candidates
const mockAvailableCandidates = [
  {
    id: '3',
    name: 'Aisha Banda',
    title: 'UX/UI Designer',
    location: 'Lusaka, Zambia',
    matchScore: 92,
    skills: ['Figma', 'UI Design', 'User Research'],
    photo: 'https://ui-avatars.com/api/?name=Aisha+Banda&background=f29559&color=fff'
  },
  {
    id: '4',
    name: 'David Mwansa',
    title: 'Backend Developer',
    location: 'Ndola, Zambia',
    matchScore: 85,
    skills: ['Java', 'Spring Boot', 'MySQL'],
    photo: 'https://ui-avatars.com/api/?name=David+Mwansa&background=f29559&color=fff'
  },
  {
    id: '5',
    name: 'Emily Phiri',
    title: 'Product Manager',
    location: 'Remote',
    matchScore: 78,
    skills: ['Product Strategy', 'Agile', 'Data Analysis'],
    photo: 'https://ui-avatars.com/api/?name=Emily+Phiri&background=f29559&color=fff'
  },
  {
    id: '6',
    name: 'John Tembo',
    title: 'DevOps Engineer',
    location: 'Lusaka, Zambia',
    matchScore: 90,
    skills: ['Docker', 'Kubernetes', 'AWS'],
    photo: 'https://ui-avatars.com/api/?name=John+Tembo&background=f29559&color=fff'
  }
];

interface AddCandidatesModalProps {
  poolName: string;
  onClose: () => void;
  onAdd: (candidateIds: string[]) => void;
}

export default function AddCandidatesModal({ poolName, onClose, onAdd }: AddCandidatesModalProps) {
  const [candidates] = useState(mockAvailableCandidates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [minMatchScore, setMinMatchScore] = useState(0);

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesScore = c.matchScore >= minMatchScore;
    
    return matchesSearch && matchesScore;
  });

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCandidates(filteredCandidates.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCandidates([]);
  };

  const handleAdd = () => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }
    onAdd(selectedCandidates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sage/10 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">
                Add Candidates to Pool
              </h2>
              <p className="text-sage text-sm mt-1">{poolName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-lg transition-colors">
              <X className="w-6 h-6 text-sage" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-sage/10 space-y-4 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
            <input
              type="text"
              placeholder="Search by name, title, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
            />
          </div>

          {/* Match Score Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gunmetal dark:text-peach">
                Minimum Match Score: {minMatchScore}%+
              </label>
              <button
                onClick={() => setMinMatchScore(0)}
                className="text-sm text-tangerine hover:underline"
              >
                Reset
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full h-2 bg-sage/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Selection Actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-sage">
              {selectedCandidates.length} of {filteredCandidates.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-tangerine hover:underline"
              >
                Select All
              </button>
              {selectedCandidates.length > 0 && (
                <>
                  <span className="text-sage">•</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-sage hover:underline"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-sage">No candidates match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map((candidate) => {
                const isSelected = selectedCandidates.includes(candidate.id);
                
                return (
                  <button
                    key={candidate.id}
                    onClick={() => toggleCandidate(candidate.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-tangerine bg-tangerine/10'
                        : 'border-sage/20 hover:border-sage/40 hover:bg-peach/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gunmetal dark:text-peach truncate">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-sage truncate">{candidate.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            candidate.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                            candidate.matchScore >= 75 ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {candidate.matchScore}% Match
                          </span>
                          <span className="text-xs text-sage">{candidate.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-sage/10 text-sage rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-tangerine rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-sage/10 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-sage/10 hover:bg-sage/20 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedCandidates.length === 0}
            className="flex-1 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add {selectedCandidates.length} Candidate{selectedCandidates.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
