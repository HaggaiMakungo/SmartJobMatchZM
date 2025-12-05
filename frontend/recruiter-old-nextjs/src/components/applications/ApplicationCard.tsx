'use client';

import { useDraggable } from '@dnd-kit/core';
import { Mail, Phone, MapPin, Award, Calendar, FileText, Star, Check } from 'lucide-react';

interface ApplicationCardProps {
  application: any;
  onViewApplication: (app: any) => void;
  isSelected: boolean;
  onSelectForCompare: (id: number) => void;
}

export default function ApplicationCard({
  application,
  onViewApplication,
  isSelected,
  onSelectForCompare,
}: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white dark:bg-gunmetal/60 rounded-lg p-4 border-2 transition-all cursor-move hover:shadow-md ${
        isDragging ? 'opacity-50 shadow-2xl scale-105 border-tangerine' : 
        isSelected ? 'border-tangerine' : 'border-sage/20'
      }`}
    >
      {/* Checkbox for comparison */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectForCompare(application.id)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-tangerine border-tangerine' 
                : 'border-sage/30 hover:border-tangerine'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </button>
          
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-tangerine/20 flex items-center justify-center text-tangerine font-semibold">
            {getInitials(application.candidateName)}
          </div>
        </div>

        {/* Match Score */}
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-tangerine" />
          <span className="text-sm font-bold text-gunmetal dark:text-peach">{application.matchScore}%</span>
        </div>
      </div>

      {/* Candidate Info */}
      <div 
        onClick={() => onViewApplication(application)}
        className="cursor-pointer"
      >
        <h4 className="font-semibold text-gunmetal dark:text-peach mb-1 hover:text-tangerine transition-colors">
          {application.candidateName}
        </h4>
        <p className="text-xs text-sage mb-3 truncate">{application.jobTitle}</p>

        {/* Contact Info */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-sage">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{application.candidateEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-sage">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>{application.candidatePhone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-sage">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{application.location}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {application.skills.slice(0, 3).map((skill: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-tangerine/10 text-tangerine rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {application.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-sage/10 text-sage rounded text-xs">
              +{application.skills.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-sage/10">
          <div className="flex items-center gap-1 text-xs text-sage">
            <Calendar className="w-3 h-3" />
            {new Date(application.appliedDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>

          <div className="flex items-center gap-2">
            {application.notes.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-sage">
                <FileText className="w-3 h-3" />
                {application.notes.length}
              </div>
            )}
            {application.rating && (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < application.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-sage/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
