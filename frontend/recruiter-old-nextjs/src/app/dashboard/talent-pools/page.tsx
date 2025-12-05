'use client';

import { useState } from 'react';
import { Search, Plus, Folders, Users, TrendingUp, Calendar } from 'lucide-react';
import PoolsSidebar from '@/components/talent-pools/PoolsSidebar';
import PoolCard from '@/components/talent-pools/PoolCard';
import PoolView from '@/components/talent-pools/PoolView';
import CreatePoolModal from '@/components/talent-pools/CreatePoolModal';
import EditPoolModal from '@/components/talent-pools/EditPoolModal';
import SharePoolModal from '@/components/talent-pools/SharePoolModal';
import RemoveCandidateModal from '@/components/talent-pools/RemoveCandidateModal';

// Mock data - will be replaced with API calls
const mockPools = [
  {
    id: '1',
    name: 'Frontend Stars',
    description: 'Top frontend developers for future projects',
    color: '#f29559',
    icon: '⭐',
    candidateCount: 12,
    visibility: 'private',
    owner: 'You',
    lastUpdated: '2 hours ago',
    status: 'active',
    isSmartPool: false,
    topCandidates: [
      'https://ui-avatars.com/api/?name=Sarah+Johnson&background=f29559&color=fff',
      'https://ui-avatars.com/api/?name=Michael+Chen&background=f29559&color=fff',
      'https://ui-avatars.com/api/?name=Aisha+Banda&background=f29559&color=fff'
    ]
  },
  {
    id: '2',
    name: 'High Match Candidates',
    description: 'Auto-updated: Candidates with 90%+ match score',
    color: '#22c55e',
    icon: '🎯',
    candidateCount: 8,
    visibility: 'team',
    owner: 'You',
    lastUpdated: '5 minutes ago',
    status: 'active',
    isSmartPool: true,
    rules: {
      matchScore: 90,
      autoUpdate: true
    },
    topCandidates: [
      'https://ui-avatars.com/api/?name=John+Tembo&background=22c55e&color=fff',
      'https://ui-avatars.com/api/?name=Emily+Phiri&background=22c55e&color=fff'
    ]
  },
  {
    id: '3',
    name: 'Hospitality - Night Shift Ready',
    description: 'Candidates available for night shifts in hospitality',
    color: '#8b5cf6',
    icon: '🌙',
    candidateCount: 15,
    visibility: 'company',
    owner: 'You',
    lastUpdated: '1 day ago',
    status: 'active',
    isSmartPool: false,
    topCandidates: [
      'https://ui-avatars.com/api/?name=David+Mwansa&background=8b5cf6&color=fff'
    ]
  },
  {
    id: '4',
    name: 'Top 2025 Interns',
    description: 'Promising candidates for 2025 internship program',
    color: '#3b82f6',
    icon: '🎓',
    candidateCount: 6,
    visibility: 'private',
    owner: 'You',
    lastUpdated: '3 days ago',
    status: 'active',
    isSmartPool: false,
    topCandidates: []
  }
];

export default function TalentPoolsPage() {
  const [pools, setPools] = useState(mockPools);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [poolToEdit, setPoolToEdit] = useState<any>(null);
  const [poolToShare, setPoolToShare] = useState<any>(null);
  const [candidateToRemove, setCandidateToRemove] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter pools by search
  const filteredPools = pools.filter(pool =>
    pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalCandidatesInPools = pools.reduce((sum, pool) => sum + pool.candidateCount, 0);
  const mostActivePool = pools.reduce((max, pool) => 
    pool.candidateCount > max.candidateCount ? pool : max, pools[0]
  );
  const poolsThisMonth = pools.filter(p => p.lastUpdated.includes('hour') || p.lastUpdated.includes('day')).length;

  const stats = [
    {
      label: 'Total Pools',
      value: pools.length.toString(),
      icon: Folders,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Candidates',
      value: totalCandidatesInPools.toString(),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      label: 'Most Active Pool',
      value: mostActivePool.name,
      subValue: `${mostActivePool.candidateCount} candidates`,
      icon: TrendingUp,
      color: 'bg-tangerine'
    },
    {
      label: 'Pools This Month',
      value: poolsThisMonth.toString(),
      icon: Calendar,
      color: 'bg-purple-500'
    }
  ];

  const handleCreatePool = (poolData: any) => {
    const newPool = {
      id: Date.now().toString(),
      ...poolData,
      candidateCount: 0,
      owner: 'You',
      lastUpdated: 'Just now',
      status: 'active',
      topCandidates: []
    };
    setPools([...pools, newPool]);
    setShowCreateModal(false);
  };

  const handleEditPool = (poolData: any) => {
    setPools(pools.map(p => p.id === poolData.id ? { ...p, ...poolData } : p));
    setShowEditModal(false);
    setPoolToEdit(null);
  };

  const handleDeletePool = (poolId: string) => {
    if (confirm('Are you sure you want to delete this pool? Candidates will not be affected.')) {
      setPools(pools.filter(p => p.id !== poolId));
      if (selectedPool?.id === poolId) {
        setSelectedPool(null);
      }
    }
  };

  const handleArchivePool = (poolId: string) => {
    setPools(pools.map(p => 
      p.id === poolId ? { ...p, status: p.status === 'archived' ? 'active' : 'archived' } : p
    ));
  };

  const handleDuplicatePool = (poolId: string) => {
    const poolToDupe = pools.find(p => p.id === poolId);
    if (poolToDupe) {
      const newPool = {
        ...poolToDupe,
        id: Date.now().toString(),
        name: `${poolToDupe.name} (Copy)`,
        lastUpdated: 'Just now'
      };
      setPools([...pools, newPool]);
    }
  };

  const handleRemoveCandidate = (candidateId: string, reason?: string) => {
    console.log('Removing candidate:', candidateId, 'Reason:', reason);
    // Update pool candidate count
    if (selectedPool) {
      setPools(pools.map(p => 
        p.id === selectedPool.id ? { ...p, candidateCount: p.candidateCount - 1 } : p
      ));
      setSelectedPool({ ...selectedPool, candidateCount: selectedPool.candidateCount - 1 });
    }
    setShowRemoveModal(false);
    setCandidateToRemove(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Pools Sidebar */}
      <PoolsSidebar
        pools={filteredPools}
        selectedPool={selectedPool}
        onSelectPool={setSelectedPool}
        onCreatePool={() => setShowCreateModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-peach/5 dark:bg-gunmetal/20">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gunmetal dark:text-peach">
                {selectedPool ? selectedPool.name : 'Talent Pools'}
              </h1>
              <p className="text-sage mt-1">
                {selectedPool 
                  ? selectedPool.description
                  : 'Organize and manage your candidate collections'
                }
              </p>
            </div>
            {!selectedPool && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>New Pool</span>
              </button>
            )}
          </div>

          {/* Stats Cards - Only show when no pool selected */}
          {!selectedPool && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gunmetal/50 rounded-xl shadow-md p-6 border border-sage/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-sage">{stat.label}</p>
                      <p className="text-2xl font-bold text-gunmetal dark:text-peach mt-2">
                        {stat.value}
                      </p>
                      {stat.subValue && (
                        <p className="text-xs text-sage mt-1">{stat.subValue}</p>
                      )}
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pool Grid or Pool View */}
          {selectedPool ? (
            <PoolView
              pool={selectedPool}
              onEdit={() => {
                setPoolToEdit(selectedPool);
                setShowEditModal(true);
              }}
              onShare={() => {
                setPoolToShare(selectedPool);
                setShowShareModal(true);
              }}
              onDelete={() => handleDeletePool(selectedPool.id)}
              onArchive={() => handleArchivePool(selectedPool.id)}
              onDuplicate={() => handleDuplicatePool(selectedPool.id)}
              onRemoveCandidate={(candidate) => {
                setCandidateToRemove(candidate);
                setShowRemoveModal(true);
              }}
              onBack={() => setSelectedPool(null)}
            />
          ) : filteredPools.length === 0 ? (
            // Empty State
            <div className="bg-white dark:bg-gunmetal/50 rounded-xl shadow-md p-12 text-center border border-sage/10">
              <Folders className="w-16 h-16 text-sage mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gunmetal dark:text-peach mb-2">
                {searchQuery ? 'No pools match your search' : 'No talent pools yet'}
              </h3>
              <p className="text-sage mb-6">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Create your first talent pool to start organizing candidates'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
                >
                  Create Your First Pool
                </button>
              )}
            </div>
          ) : (
            // Pool Cards Grid
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onView={() => setSelectedPool(pool)}
                  onEdit={() => {
                    setPoolToEdit(pool);
                    setShowEditModal(true);
                  }}
                  onShare={() => {
                    setPoolToShare(pool);
                    setShowShareModal(true);
                  }}
                  onDelete={() => handleDeletePool(pool.id)}
                  onArchive={() => handleArchivePool(pool.id)}
                  onDuplicate={() => handleDuplicatePool(pool.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreatePoolModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePool}
        />
      )}

      {showEditModal && poolToEdit && (
        <EditPoolModal
          pool={poolToEdit}
          onClose={() => {
            setShowEditModal(false);
            setPoolToEdit(null);
          }}
          onSave={handleEditPool}
        />
      )}

      {showShareModal && poolToShare && (
        <SharePoolModal
          pool={poolToShare}
          onClose={() => {
            setShowShareModal(false);
            setPoolToShare(null);
          }}
          onShare={(shareData) => {
            console.log('Sharing pool:', shareData);
            setShowShareModal(false);
            setPoolToShare(null);
          }}
        />
      )}

      {showRemoveModal && candidateToRemove && (
        <RemoveCandidateModal
          candidate={candidateToRemove}
          poolName={selectedPool?.name || ''}
          onClose={() => {
            setShowRemoveModal(false);
            setCandidateToRemove(null);
          }}
          onRemove={handleRemoveCandidate}
        />
      )}
    </div>
  );
}
