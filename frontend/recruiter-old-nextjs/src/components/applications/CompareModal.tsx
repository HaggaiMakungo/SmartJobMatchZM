'use client';

import { X, Award, Briefcase, GraduationCap, MapPin, DollarSign, Star } from 'lucide-react';

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  applications: any[];
}

export default function CompareModal({ open, onClose, applications }: CompareModalProps) {
  if (!open || applications.length === 0) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const compareFields = [
    { label: 'Match Score', key: 'matchScore', icon: Award, format: (val: any) => `${val}%` },
    { label: 'Experience', key: 'experience', icon: Briefcase, format: (val: any) => val },
    { label: 'Education', key: 'education', icon: GraduationCap, format: (val: any) => val },
    { label: 'Location', key: 'location', icon: MapPin, format: (val: any) => val },
    { label: 'Expected Salary', key: 'expectedSalary', icon: DollarSign, format: (val: any) => val },
    { label: 'Rating', key: 'rating', icon: Star, format: (val: any) => val ? `${val}/5` : 'Not rated' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage/10">
          <div>
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">Compare Candidates</h2>
            <p className="text-sage mt-1">Side-by-side comparison of {applications.length} candidates</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-sage" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(0, 1fr))` }}>
            {/* Candidate Headers */}
            {applications.map((app) => (
              <div key={app.id} className="bg-sage/5 rounded-xl p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-tangerine/20 flex items-center justify-center text-tangerine font-bold text-2xl mx-auto mb-3">
                  {getInitials(app.candidateName)}
                </div>
                <h3 className="font-bold text-gunmetal dark:text-peach mb-1">{app.candidateName}</h3>
                <p className="text-sm text-sage mb-2">{app.jobTitle}</p>
                <p className="text-xs text-sage">{app.candidateEmail}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-6 space-y-3">
            {compareFields.map((field) => (
              <div key={field.key} className="bg-white dark:bg-gunmetal/40 rounded-xl border border-sage/10 overflow-hidden">
                <div className="bg-sage/5 px-4 py-3 border-b border-sage/10">
                  <div className="flex items-center gap-2">
                    <field.icon className="w-4 h-4 text-tangerine" />
                    <span className="font-semibold text-gunmetal dark:text-peach text-sm">{field.label}</span>
                  </div>
                </div>
                <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(0, 1fr))` }}>
                  {applications.map((app) => {
                    const value = app[field.key];
                    const isHighest = field.key === 'matchScore' && 
                      value === Math.max(...applications.map(a => a[field.key]));
                    
                    return (
                      <div
                        key={app.id}
                        className={`text-center p-3 rounded-lg ${
                          isHighest ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500' : 'bg-sage/5'
                        }`}
                      >
                        <span className={`font-medium ${
                          isHighest ? 'text-green-700 dark:text-green-400' : 'text-gunmetal dark:text-peach'
                        }`}>
                          {field.format(value)}
                        </span>
                        {isHighest && field.key === 'matchScore' && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Highest</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Skills Comparison */}
            <div className="bg-white dark:bg-gunmetal/40 rounded-xl border border-sage/10 overflow-hidden">
              <div className="bg-sage/5 px-4 py-3 border-b border-sage/10">
                <span className="font-semibold text-gunmetal dark:text-peach text-sm">Skills</span>
              </div>
              <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(0, 1fr))` }}>
                {applications.map((app) => (
                  <div key={app.id} className="space-y-2">
                    {app.skills.slice(0, 5).map((skill: string, i: number) => (
                      <div key={i} className="px-2 py-1 bg-tangerine/10 text-tangerine rounded text-xs text-center">
                        {skill}
                      </div>
                    ))}
                    {app.skills.length > 5 && (
                      <div className="px-2 py-1 bg-sage/10 text-sage rounded text-xs text-center">
                        +{app.skills.length - 5} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-sage/10 bg-sage/5">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white dark:bg-gunmetal/60 border border-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium hover:bg-sage/10 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                // Could navigate to the highest match
              }}
              className="px-6 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-all"
            >
              View Best Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
