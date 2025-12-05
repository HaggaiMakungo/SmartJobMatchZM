import { useDroppable } from '@dnd-kit/core';
import CandidateCard from './CandidateCard';

interface Stage {
  id: string;
  label: string;
  color: string;
}

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

interface KanbanColumnProps {
  stage: Stage;
  candidates: Candidate[];
  selectedCandidates: string[];
  onSelectCandidate: (id: string, selected: boolean) => void;
  onCandidateClick: (candidate: Candidate) => void;
  onOpenNotes: (candidate: Candidate) => void;
}

export default function KanbanColumn({
  stage,
  candidates,
  selectedCandidates,
  onSelectCandidate,
  onCandidateClick,
  onOpenNotes
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4 transition-all ${
        isOver ? 'ring-2 ring-[#FF6B35] bg-orange-50' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
          <h3 className="font-semibold text-gray-900">{stage.label}</h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Candidates */}
      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No candidates yet
          </div>
        ) : (
          candidates.map(candidate => (
            <CandidateCard
              key={candidate.cv_id}
              candidate={candidate}
              isSelected={selectedCandidates.includes(candidate.cv_id)}
              onSelect={(selected) => onSelectCandidate(candidate.cv_id, selected)}
              onClick={() => onCandidateClick(candidate)}
              onOpenNotes={() => onOpenNotes(candidate)}
            />
          ))
        )}
      </div>
    </div>
  );
}
