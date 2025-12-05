import { useDraggable } from '@dnd-kit/core';
import { 
  MapPin, 
  Briefcase, 
  Star, 
  MessageSquare, 
  Calendar,
  Tag as TagIcon
} from 'lucide-react';

interface Candidate {
  cv_id: string;
  full_name: string;
  email: string;
  current_job_title: string;
  city: string;
  province: string;
  total_years_experience: number;
  skills_technical: string;
  match_score?: number;
  tags?: string[];
  notes_count?: number;
  last_contact?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onOpenNotes: () => void;
}

export default function CandidateCard({
  candidate,
  isSelected,
  onSelect,
  onClick,
  onOpenNotes
}: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.cv_id
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const matchScore = candidate.match_score ? Math.round(candidate.match_score * 100) : 0;
  const matchColor = matchScore >= 80 ? 'text-green-600 bg-green-50' : 
                     matchScore >= 60 ? 'text-yellow-600 bg-yellow-50' : 
                     'text-orange-600 bg-orange-50';

  const skills = candidate.skills_technical?.split(',').slice(0, 3) || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-4 border-2 transition-all cursor-move hover:shadow-lg ${
        isDragging ? 'opacity-50 shadow-2xl scale-105' : ''
      } ${
        isSelected ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/20' : 'border-gray-200'
      }`}
    >
      {/* Checkbox & Match Score */}
      <div className="flex items-start justify-between mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer"
        />
        <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${matchColor}`}>
          {matchScore}% Match
        </div>
      </div>

      {/* Candidate Info */}
      <div
        onClick={onClick}
        className="cursor-pointer"
      >
        <h4 className="font-semibold text-gray-900 mb-1 hover:text-[#FF6B35] transition-colors">
          {candidate.full_name}
        </h4>
        
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span className="truncate">{candidate.current_job_title || 'No title'}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{candidate.city}, {candidate.province}</span>
          <span className="mx-1">•</span>
          <span>{candidate.total_years_experience}y exp</span>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {candidate.tags && candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {candidate.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs rounded-full flex items-center gap-1"
              >
                <TagIcon className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenNotes();
          }}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#FF6B35] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{candidate.notes_count || 0} notes</span>
        </button>

        {candidate.last_contact && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(candidate.last_contact).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
