'use client';

import { useDroppable } from '@dnd-kit/core';
import ApplicationCard from './ApplicationCard';

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  applications: any[];
  onViewApplication: (app: any) => void;
  selectedForCompare: number[];
  onSelectForCompare: (id: number) => void;
}

const colorClasses = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-500',
};

export default function KanbanColumn({
  column,
  applications,
  onViewApplication,
  selectedForCompare,
  onSelectForCompare,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg border-2 transition-all ${
        isOver ? 'border-tangerine scale-105' : 'border-sage/10'
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-sage/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClasses[column.color as keyof typeof colorClasses]}`} />
            <h3 className="font-semibold text-gunmetal dark:text-peach">{column.title}</h3>
          </div>
          <span className="px-2 py-0.5 bg-sage/10 text-sage rounded-full text-xs font-medium">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
        {applications.length === 0 ? (
          <div className="text-center py-8 text-sage text-sm">
            No applications
          </div>
        ) : (
          applications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onViewApplication={onViewApplication}
              isSelected={selectedForCompare.includes(application.id)}
              onSelectForCompare={onSelectForCompare}
            />
          ))
        )}
      </div>
    </div>
  );
}
