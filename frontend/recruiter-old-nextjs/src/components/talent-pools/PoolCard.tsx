'use client';

import { Eye, Edit, Share2, Copy, Archive, Trash2, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PoolCardProps {
  pool: any;
  onView: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
}

export default function PoolCard({
  pool,
  onView,
  onEdit,
  onShare,
  onDelete,
  onArchive,
  onDuplicate
}: PoolCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="bg-white dark:bg-gunmetal/50 rounded-xl shadow-md border border-sage/10 overflow-hidden hover:shadow-lg transition-all group">
      {/* Header with Color Bar */}
      <div
        className="h-2"
        style={{ backgroundColor: pool.color }}
      />

      <div className="p-6">
        {/* Icon, Title, Menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: pool.color + '20' }}
            >
              {pool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gunmetal dark:text-peach mb-1 truncate">
                {pool.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {pool.isSmartPool && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                    Smart Pool
                  </span>
                )}
                {pool.status === 'archived' && (
                  <span className="px-2 py-1 bg-sage/20 text-sage text-xs rounded-full font-medium">
                    Archived
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* More Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-sage" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-peach/10 dark:hover:bg-gunmetal/50 transition-colors text-left"
                >
                  <Edit className="w-4 h-4 text-sage" />
                  <span className="text-sm text-gunmetal dark:text-peach">Edit</span>
                </button>
                <button
                  onClick={() => {
                    onShare();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-peach/10 dark:hover:bg-gunmetal/50 transition-colors text-left"
                >
                  <Share2 className="w-4 h-4 text-sage" />
                  <span className="text-sm text-gunmetal dark:text-peach">Share</span>
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-peach/10 dark:hover:bg-gunmetal/50 transition-colors text-left"
                >
                  <Copy className="w-4 h-4 text-sage" />
                  <span className="text-sm text-gunmetal dark:text-peach">Duplicate</span>
                </button>
                <button
                  onClick={() => {
                    onArchive();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-peach/10 dark:hover:bg-gunmetal/50 transition-colors text-left"
                >
                  <Archive className="w-4 h-4 text-sage" />
                  <span className="text-sm text-gunmetal dark:text-peach">
                    {pool.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </span>
                </button>
                <div className="border-t border-sage/10" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-sage mb-4 line-clamp-2">
          {pool.description}
        </p>

        {/* Candidate Count & Avatars */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-sage">
            <span className="font-semibold text-gunmetal dark:text-peach text-lg">
              {pool.candidateCount}
            </span>{' '}
            candidate{pool.candidateCount !== 1 ? 's' : ''}
          </div>

          {/* Stacked Avatars */}
          {pool.topCandidates && pool.topCandidates.length > 0 && (
            <div className="flex -space-x-2">
              {pool.topCandidates.slice(0, 3).map((avatar: string, idx: number) => (
                <img
                  key={idx}
                  src={avatar}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gunmetal"
                />
              ))}
              {pool.candidateCount > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gunmetal bg-sage/20 flex items-center justify-center text-xs font-medium text-gunmetal dark:text-peach">
                  +{pool.candidateCount - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-sage mb-4">
          <span>Updated {pool.lastUpdated}</span>
          <span className="capitalize">
            {pool.visibility === 'private' ? '🔒 Private' : `👥 ${pool.visibility}`}
          </span>
        </div>

        {/* View Button */}
        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-tangerine/10 hover:bg-tangerine text-tangerine hover:text-white rounded-lg font-medium transition-all group-hover:bg-tangerine group-hover:text-white"
        >
          <Eye className="w-4 h-4" />
          <span>View Pool</span>
        </button>
      </div>
    </div>
  );
}
