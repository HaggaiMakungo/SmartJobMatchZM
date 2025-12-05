'use client';

import { Sparkles, TrendingUp } from 'lucide-react';

interface AIRecommendationsProps {
  candidates: any[];
}

export default function AIRecommendations({ candidates }: AIRecommendationsProps) {
  if (candidates.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-tangerine/10 to-peach/20 dark:from-tangerine/5 dark:to-peach/10 rounded-xl shadow-md p-6 border border-tangerine/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-tangerine rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-2 flex items-center gap-2">
            AI-Powered Recommendations
            <TrendingUp className="w-5 h-5 text-tangerine" />
          </h3>
          <p className="text-sage mb-4">Top matches for your open roles based on skills, experience, and preferences</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white dark:bg-gunmetal/50 rounded-lg p-4 border border-sage/10">
                <div className="flex items-center gap-3 mb-2">
                  <img src={candidate.photo} alt={candidate.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gunmetal dark:text-peach truncate">{candidate.name}</h4>
                    <p className="text-xs text-sage truncate">{candidate.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{candidate.matchScore}%</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 2).map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-tangerine/10 text-tangerine text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
