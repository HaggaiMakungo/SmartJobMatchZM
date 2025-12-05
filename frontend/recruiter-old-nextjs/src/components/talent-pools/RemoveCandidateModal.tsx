'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface RemoveCandidateModalProps {
  candidate: any;
  poolName: string;
  onClose: () => void;
  onRemove: (candidateId: string, reason?: string) => void;
}

export default function RemoveCandidateModal({
  candidate,
  poolName,
  onClose,
  onRemove
}: RemoveCandidateModalProps) {
  const [reason, setReason] = useState('');

  const handleRemove = () => {
    onRemove(candidate.id, reason.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-sage/10">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gunmetal dark:text-peach">
                Remove Candidate from Pool?
              </h2>
              <p className="text-sage text-sm mt-1">
                This action will remove the candidate from "{poolName}"
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-sage/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-sage" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Candidate Info */}
          <div className="flex items-center gap-3 p-4 bg-peach/10 dark:bg-gunmetal/50 rounded-lg">
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold text-gunmetal dark:text-peach">
                {candidate.name}
              </p>
              <p className="text-sm text-sage">{candidate.title}</p>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
            <p className="text-sm text-gunmetal dark:text-peach">
              ℹ️ <strong>Note:</strong> The candidate profile will remain in your database. 
              Only the association with this pool will be removed.
            </p>
          </div>

          {/* Optional Reason */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
              Reason for Removal (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., No longer a good fit, Hired elsewhere, Not interested..."
              rows={3}
              className="w-full px-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach resize-none text-sm"
            />
            <p className="text-xs text-sage mt-2">
              This note will be added to the pool's activity timeline
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-sage/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-sage/10 hover:bg-sage/20 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
