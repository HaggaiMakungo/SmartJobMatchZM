'use client';

import { X, XCircle, MoveRight, Mail, Download } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: string, ids: number[]) => void;
  selectedIds: number[];
  onClear: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onBulkAction,
  selectedIds,
  onClear,
}: BulkActionsBarProps) {
  return (
    <div className="bg-tangerine text-white rounded-xl shadow-lg p-4 border border-tangerine">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold">{selectedCount} selected</span>
          
          <div className="flex gap-2">
            <button
              onClick={() => onBulkAction('moveToScreening', selectedIds)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <MoveRight className="w-4 h-4" />
              Move to Screening
            </button>
            
            <button
              onClick={() => onBulkAction('sendEmail', selectedIds)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            
            <button
              onClick={() => onBulkAction('export', selectedIds)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={() => onBulkAction('reject', selectedIds)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject All
            </button>
          </div>
        </div>
        
        <button
          onClick={onClear}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
