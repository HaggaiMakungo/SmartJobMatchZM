'use client';

import { X, ArrowLeftRight } from 'lucide-react';

interface ComparisonToolProps {
  candidates: any[];
  onClose: () => void;
}

export default function ComparisonTool({ candidates, onClose }: ComparisonToolProps) {
  const comparisonCategories = [
    { label: 'Match Score', key: 'matchScore', format: (val: number) => `${val}%` },
    { label: 'Experience', key: 'experience', format: (val: number) => `${val} years` },
    { label: 'Location', key: 'location', format: (val: string) => val },
    { label: 'Availability', key: 'availability', format: (val: string) => val },
    { label: 'Status', key: 'status', format: (val: string) => val }
  ];

  return (
    <div className="fixed inset-0 bg-gunmetal/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gunmetal/95 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage/20 bg-gradient-to-r from-tangerine/10 to-peach/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tangerine rounded-lg">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">Compare Candidates</h2>
              <p className="text-sm text-sage mt-1">Side-by-side comparison of {candidates.length} candidates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gunmetal dark:text-peach" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(250px, 1fr))` }}>
            {/* Candidate Headers */}
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-gradient-to-b from-peach/20 to-transparent dark:from-peach/5 rounded-xl p-4 text-center border border-sage/10">
                <img src={candidate.photo} alt={candidate.name} className="w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-peach/30" />
                <h3 className="font-semibold text-gunmetal dark:text-peach mb-1">{candidate.name}</h3>
                <p className="text-sm text-sage mb-3">{candidate.title}</p>
                <div className="text-3xl font-bold text-tangerine">{candidate.matchScore}%</div>
                <p className="text-xs text-sage">Match Score</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-6 space-y-3">
            {comparisonCategories.map((category) => (
              <div key={category.key} className="bg-sage/5 dark:bg-gunmetal/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">{category.label}</h4>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(250px, 1fr))` }}>
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="text-center">
                      <p className="text-sage font-medium">{category.format(candidate[category.key])}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Skills Comparison */}
            <div className="bg-sage/5 dark:bg-gunmetal/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">Top Skills</h4>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(250px, 1fr))` }}>
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex flex-col gap-2">
                    {candidate.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-tangerine/10 text-tangerine text-xs font-medium rounded text-center">
                        {skill}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-sage/5 dark:bg-gunmetal/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">Contact Information</h4>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(250px, 1fr))` }}>
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="text-center space-y-1 text-sm text-sage">
                    <p>{candidate.email}</p>
                    <p>{candidate.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-sage/20 bg-sage/5">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(250px, 1fr))` }}>
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                className="px-4 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
              >
                Invite {candidate.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
