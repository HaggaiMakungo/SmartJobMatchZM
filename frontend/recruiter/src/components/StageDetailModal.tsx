import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Star, Calendar, TrendingUp } from 'lucide-react';
import type { SavedCandidate, CandidateStatus } from '@/types';

interface StageDetailModalProps {
  stage: { value: CandidateStatus; label: string; color: string; icon: any };
  candidates: SavedCandidate[];
  onClose: () => void;
  onToggleFavorite: (cvId: string) => void;
  favorites: Set<string>;
}

export function StageDetailModal({
  stage,
  candidates,
  onClose,
  onToggleFavorite,
  favorites,
}: StageDetailModalProps) {
  const StageIcon = stage.icon;

  // Calculate stats for this stage
  const avgMatchScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length)
    : 0;

  const avgExperience = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.total_years_experience, 0) / candidates.length)
    : 0;

  const topLocations = candidates.reduce((acc, c) => {
    const location = `${c.city}, ${c.province}`;
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonLocation = Object.entries(topLocations).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${stage.color} p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <StageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{stage.label} Stage</h2>
              <p className="text-white/80 text-sm">{candidates.length} candidates in this stage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Stats Overview */}
        {candidates.length > 0 && (
          <div className="p-6 border-b border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-tangerine" />
                <span className="text-sm text-gray-400">Avg Match Score</span>
              </div>
              <div className="text-2xl font-bold text-white">{avgMatchScore}%</div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-400">Avg Experience</span>
              </div>
              <div className="text-2xl font-bold text-white">{avgExperience} yrs</div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-400">Favorites</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {candidates.filter(c => favorites.has(c.cv_id)).length}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-400">Top Location</span>
              </div>
              <div className="text-sm font-semibold text-white truncate">
                {mostCommonLocation ? mostCommonLocation[0] : 'N/A'}
              </div>
              <div className="text-xs text-gray-400">
                {mostCommonLocation ? `${mostCommonLocation[1]} candidates` : ''}
              </div>
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <StageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No candidates in this stage</p>
              <p className="text-sm">Candidates will appear here as they progress through the pipeline</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {candidates.map(candidate => (
                <CandidateCard
                  key={candidate.cv_id}
                  candidate={candidate}
                  isFavorite={favorites.has(candidate.cv_id)}
                  onToggleFavorite={() => onToggleFavorite(candidate.cv_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  isFavorite,
  onToggleFavorite,
}: {
  candidate: SavedCandidate;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  // Get match score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-tangerine transition group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">{candidate.full_name}</h3>
            <button
              onClick={onToggleFavorite}
              className="p-1 hover:bg-gray-800 rounded transition"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-tangerine text-tangerine' : 'text-gray-500'}`} />
            </button>
          </div>
          <p className="text-sm text-gray-400">{candidate.current_job_title}</p>
        </div>
        
        <div className={`px-3 py-1 rounded-lg font-semibold text-sm ${getScoreColor(candidate.match_score)}`}>
          {Math.round(candidate.match_score)}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{candidate.city}, {candidate.province}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Briefcase className="w-4 h-4 flex-shrink-0" />
          <span>{candidate.total_years_experience} years exp.</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <GraduationCap className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{candidate.education_level}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{new Date(candidate.saved_date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Skills Preview */}
      {candidate.matched_skills && candidate.matched_skills.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Top Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.matched_skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-tangerine/10 text-tangerine text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {candidate.matched_skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                +{candidate.matched_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={`mailto:${candidate.email}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition"
        >
          <Mail className="w-4 h-4" />
          Email
        </a>
        
        {candidate.phone && (
          <a
            href={`tel:${candidate.phone}`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition"
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Match Reason */}
      {candidate.match_reason && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Why this match?</div>
          <p className="text-sm text-gray-400 line-clamp-2">{candidate.match_reason}</p>
        </div>
      )}
    </div>
  );
}
