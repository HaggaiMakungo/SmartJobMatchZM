import { X, Filter as FilterIcon } from 'lucide-react';
import { useState } from 'react';

interface Candidate {
  cv_id: string;
  match_score?: number;
  city: string;
  province: string;
  total_years_experience: number;
  skills_technical: string;
  saved_date: string;
  stage: string;
  tags?: string[];
}

interface FilterPanelProps {
  candidates: Candidate[];
  onFilter: (filtered: Candidate[]) => void;
  onClose: () => void;
}

export default function FilterPanel({ candidates, onFilter, onClose }: FilterPanelProps) {
  const [matchScoreMin, setMatchScoreMin] = useState(0);
  const [experienceMin, setExperienceMin] = useState(0);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  // Get unique values for filters
  const cities = Array.from(new Set(candidates.map(c => c.city))).sort();
  const stages = ['saved', 'invited', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  const applyFilters = () => {
    let filtered = [...candidates];

    // Match score filter
    if (matchScoreMin > 0) {
      filtered = filtered.filter(c => (c.match_score || 0) >= matchScoreMin / 100);
    }

    // Experience filter
    if (experienceMin > 0) {
      filtered = filtered.filter(c => c.total_years_experience >= experienceMin);
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(c => c.city === selectedCity);
    }

    // Stage filter
    if (selectedStage) {
      filtered = filtered.filter(c => c.stage === selectedStage);
    }

    // Skills filter
    if (skillSearch) {
      const searchLower = skillSearch.toLowerCase();
      filtered = filtered.filter(c => 
        c.skills_technical?.toLowerCase().includes(searchLower)
      );
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setMatchScoreMin(0);
    setExperienceMin(0);
    setSelectedCity('');
    setSelectedStage('');
    setSkillSearch('');
    onFilter(candidates);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-[#FF6B35]" />
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Match Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Match Score: {matchScoreMin}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={matchScoreMin}
              onChange={(e) => setMatchScoreMin(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Experience: {experienceMin} years
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={experienceMin}
              onChange={(e) => setExperienceMin(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage} className="capitalize">{stage}</option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <input
              type="text"
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8555] text-white rounded-lg font-medium transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
