'use client';

import { Check, Trash2, Archive, X } from 'lucide-react';
import { useNotificationsStore } from '@/store/notificationsStore';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedCount, selectedIds, onClearSelection }: BulkActionsBarProps) {
  const { bulkMarkAsRead, bulkDelete, bulkArchive } = useNotificationsStore();

  const handleMarkAsRead = () => {
    bulkMarkAsRead(selectedIds);
    onClearSelection();
  };

  const handleDelete = () => {
    if (confirm(`Delete ${selectedCount} notification${selectedCount > 1 ? 's' : ''}?`)) {
      bulkDelete(selectedIds);
      onClearSelection();
    }
  };

  const handleArchive = () => {
    bulkArchive(selectedIds);
    onClearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-gunmetal dark:bg-white text-white dark:text-gunmetal rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 border border-sage/20">
        <span className="font-medium">
          {selectedCount} selected
        </span>
        
        <div className="h-6 w-px bg-sage/20" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark Read
          </button>
          
          <button
            onClick={handleArchive}
            className="flex items-center gap-2 px-4 py-2 bg-sage/20 hover:bg-sage/30 rounded-lg transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-600 dark:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
        
        <div className="h-6 w-px bg-sage/20" />
        
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
