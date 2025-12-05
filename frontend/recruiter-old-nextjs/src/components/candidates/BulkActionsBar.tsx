'use client';

import { X, Send, Mail, FolderPlus, Download } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export default function BulkActionsBar({ selectedCount, onClearSelection }: BulkActionsBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-gunmetal dark:bg-white text-white dark:text-gunmetal rounded-full shadow-2xl px-6 py-4 flex items-center gap-4 border-2 border-tangerine">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-tangerine rounded-full flex items-center justify-center font-bold text-sm">
            {selectedCount}
          </div>
          <span className="font-medium">candidates selected</span>
        </div>

        <div className="w-px h-6 bg-sage/30" />

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-full transition-colors"
            title="Invite to Job"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Invite to Job</span>
          </button>

          <button
            className="p-2 hover:bg-white/10 dark:hover:bg-gunmetal/10 rounded-full transition-colors"
            title="Send Email"
          >
            <Mail className="w-5 h-5" />
          </button>

          <button
            className="p-2 hover:bg-white/10 dark:hover:bg-gunmetal/10 rounded-full transition-colors"
            title="Add to Pool"
          >
            <FolderPlus className="w-5 h-5" />
          </button>

          <button
            className="p-2 hover:bg-white/10 dark:hover:bg-gunmetal/10 rounded-full transition-colors"
            title="Export Selected"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-sage/30" />

        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-white/10 dark:hover:bg-gunmetal/10 rounded-full transition-colors"
          title="Clear Selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
