'use client';

import { Filter } from 'lucide-react';
import { NotificationType, NotificationPriority } from '@/types/notifications';

interface NotificationFiltersProps {
  typeFilter: NotificationType | 'all';
  priorityFilter: NotificationPriority | 'all';
  onTypeChange: (type: NotificationType | 'all') => void;
  onPriorityChange: (priority: NotificationPriority | 'all') => void;
}

export function NotificationFilters({
  typeFilter,
  priorityFilter,
  onTypeChange,
  onPriorityChange,
}: NotificationFiltersProps) {
  const typeOptions: Array<{ value: NotificationType | 'all'; label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: 'application_new', label: 'New Application' },
    { value: 'application_status_change', label: 'Status Change' },
    { value: 'candidate_high_match', label: 'High Match' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'interview_reminder', label: 'Interview Reminder' },
    { value: 'pool_shared', label: 'Pool Shared' },
    { value: 'analytics_ready', label: 'Analytics Ready' },
  ];

  const priorityOptions: Array<{ value: NotificationPriority | 'all'; label: string; color: string }> = [
    { value: 'all', label: 'All Priorities', color: '' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-tangerine' },
    { value: 'low', label: 'Low Priority', color: 'text-sage' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative">
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value as NotificationType | 'all')}
          className="appearance-none w-full sm:w-48 pl-3 pr-10 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-sm text-gunmetal dark:text-peach focus:outline-none focus:ring-2 focus:ring-tangerine/50 cursor-pointer"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as NotificationPriority | 'all')}
          className="appearance-none w-full sm:w-48 pl-3 pr-10 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-sm text-gunmetal dark:text-peach focus:outline-none focus:ring-2 focus:ring-tangerine/50 cursor-pointer"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value} className={option.color}>
              {option.label}
            </option>
          ))}
        </select>
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
      </div>
    </div>
  );
}
