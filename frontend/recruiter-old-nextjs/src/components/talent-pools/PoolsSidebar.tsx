'use client';

import { Search, Plus } from 'lucide-react';

interface PoolsSidebarProps {
  pools: any[];
  selectedPool: any;
  onSelectPool: (pool: any) => void;
  onCreatePool: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function PoolsSidebar({
  pools,
  selectedPool,
  onSelectPool,
  onCreatePool,
  searchQuery,
  onSearchChange
}: PoolsSidebarProps) {
  return (
    <div className="w-80 bg-white dark:bg-gunmetal border-r border-sage/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sage/10">
        <button
          onClick={onCreatePool}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Pool</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-sage/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
          <input
            type="text"
            placeholder="Search pools..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-peach/10 dark:bg-gunmetal/50 border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-sm text-gunmetal dark:text-peach"
          />
        </div>
      </div>

      {/* Pools List */}
      <div className="flex-1 overflow-y-auto">
        {pools.length === 0 ? (
          <div className="p-4 text-center text-sage text-sm">
            {searchQuery ? 'No pools found' : 'No pools created yet'}
          </div>
        ) : (
          <div className="p-2">
            {pools.map((pool) => (
              <button
                key={pool.id}
                onClick={() => onSelectPool(pool)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedPool?.id === pool.id
                    ? 'bg-tangerine/10 border-2 border-tangerine'
                    : 'hover:bg-peach/10 dark:hover:bg-gunmetal/50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: pool.color + '20' }}
                  >
                    {pool.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gunmetal dark:text-peach truncate">
                        {pool.name}
                      </h3>
                      {pool.isSmartPool && (
                        <span className="px-1.5 py-0.5 bg-green-500/20 text-green-700 dark:text-green-300 text-xs rounded">
                          Smart
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-sage">
                      <span>{pool.candidateCount} candidates</span>
                      {pool.visibility !== 'private' && (
                        <span className="capitalize">{pool.visibility}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-sage/10 text-xs text-sage">
        <div className="flex items-center justify-between mb-2">
          <span>Total Pools:</span>
          <span className="font-semibold text-gunmetal dark:text-peach">{pools.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Smart Pools:</span>
          <span className="font-semibold text-gunmetal dark:text-peach">
            {pools.filter(p => p.isSmartPool).length}
          </span>
        </div>
      </div>
    </div>
  );
}
