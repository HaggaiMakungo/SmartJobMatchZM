'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface AdvancedFiltersModalProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function AdvancedFiltersModal({ onClose, onApply }: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState({
    skills: [] as string[],
    experienceLevel: [] as string[],
    location: '',
    remote: false,
    availability: [] as string[],
    salaryMin: '',
    salaryMax: '',
    education: [] as string[],
    jobPreferences: [] as string[],
    yearsMin: '',
    yearsMax: '',
    certifications: [] as string[],
    languages: [] as string[]
  });

  const skillsList = ['React', 'TypeScript', 'Next.js', 'Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'];
  const experienceLevels = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];
  const availabilityOptions = ['Active Seeker', 'Passive', 'Not Looking'];
  const educationLevels = ['High School', 'Associate Degree', 'Bachelor\'s', 'Master\'s', 'PhD'];
  const jobPreferencesList = ['IT', 'Finance', 'Healthcare', 'Education', 'Hospitality', 'Manufacturing'];

  const toggleArrayValue = (key: keyof typeof filters, value: string) => {
    const current = filters[key] as string[];
    setFilters({
      ...filters,
      [key]: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({
      skills: [],
      experienceLevel: [],
      location: '',
      remote: false,
      availability: [],
      salaryMin: '',
      salaryMax: '',
      education: [],
      jobPreferences: [],
      yearsMin: '',
      yearsMax: '',
      certifications: [],
      languages: []
    });
  };

  return (
    <div className="fixed inset-0 bg-gunmetal/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gunmetal/95 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage/20">
          <div>
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">Advanced Filters</h2>
            <p className="text-sm text-sage mt-1">Refine your candidate search</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gunmetal dark:text-peach" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Skills</label>
            <div className="flex flex-wrap gap-2">
              {skillsList.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleArrayValue('skills', skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.skills.includes(skill)
                      ? 'bg-tangerine text-white'
                      : 'bg-sage/10 text-sage hover:bg-sage/20'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Experience Level</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {experienceLevels.map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.experienceLevel.includes(level)}
                    onChange={() => toggleArrayValue('experienceLevel', level)}
                    className="w-4 h-4 rounded border-sage/30 text-tangerine focus:ring-tangerine"
                  />
                  <span className="text-sm text-gunmetal dark:text-peach">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="City or region"
                className="w-full px-4 py-2 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                  className="w-4 h-4 rounded border-sage/30 text-tangerine focus:ring-tangerine"
                />
                <span className="text-sm text-gunmetal dark:text-peach">Open to remote work</span>
              </label>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Availability Status</label>
            <div className="flex flex-wrap gap-3">
              {availabilityOptions.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availability.includes(option)}
                    onChange={() => toggleArrayValue('availability', option)}
                    className="w-4 h-4 rounded border-sage/30 text-tangerine focus:ring-tangerine"
                  />
                  <span className="text-sm text-gunmetal dark:text-peach">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary Expectations */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Salary Expectations (ZMW)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  placeholder="Min salary"
                  className="w-full px-4 py-2 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                  placeholder="Max salary"
                  className="w-full px-4 py-2 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
                />
              </div>
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Education Level</label>
            <div className="flex flex-wrap gap-3">
              {educationLevels.map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.education.includes(level)}
                    onChange={() => toggleArrayValue('education', level)}
                    className="w-4 h-4 rounded border-sage/30 text-tangerine focus:ring-tangerine"
                  />
                  <span className="text-sm text-gunmetal dark:text-peach">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Preferences */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Job Preferences (Industry)</label>
            <div className="flex flex-wrap gap-2">
              {jobPreferencesList.map(pref => (
                <button
                  key={pref}
                  onClick={() => toggleArrayValue('jobPreferences', pref)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.jobPreferences.includes(pref)
                      ? 'bg-tangerine text-white'
                      : 'bg-sage/10 text-sage hover:bg-sage/20'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* Years of Experience Range */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Years of Experience</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={filters.yearsMin}
                  onChange={(e) => setFilters({ ...filters, yearsMin: e.target.value })}
                  placeholder="Min years"
                  className="w-full px-4 py-2 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.yearsMax}
                  onChange={(e) => setFilters({ ...filters, yearsMax: e.target.value })}
                  placeholder="Max years"
                  className="w-full px-4 py-2 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-sage/20 bg-sage/5">
          <button
            onClick={handleReset}
            className="px-6 py-3 text-sage hover:text-gunmetal dark:hover:text-peach transition-colors font-medium"
          >
            Reset All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
