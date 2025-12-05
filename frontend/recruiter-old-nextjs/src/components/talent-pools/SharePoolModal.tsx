'use client';

import { useState } from 'react';
import { X, UserPlus, Mail } from 'lucide-react';

interface SharePoolModalProps {
  pool: any;
  onClose: () => void;
  onShare: (shareData: any) => void;
}

export default function SharePoolModal({ pool, onClose, onShare }: SharePoolModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'collaborator'>('viewer');
  const [sharedWith, setSharedWith] = useState([
    { email: 'jane.doe@zedsafe.com', role: 'collaborator', addedAt: '2 days ago' },
    { email: 'john.smith@zedsafe.com', role: 'viewer', addedAt: '1 week ago' }
  ]);

  const handleAddUser = () => {
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    const newUser = {
      email: email.trim(),
      role,
      addedAt: 'Just now'
    };

    setSharedWith([...sharedWith, newUser]);
    setEmail('');
    
    onShare({
      poolId: pool.id,
      users: [...sharedWith, newUser]
    });
  };

  const handleRemoveUser = (emailToRemove: string) => {
    setSharedWith(sharedWith.filter(u => u.email !== emailToRemove));
  };

  const handleChangeRole = (email: string, newRole: 'viewer' | 'collaborator') => {
    setSharedWith(sharedWith.map(u => 
      u.email === email ? { ...u, role: newRole } : u
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gunmetal border-b border-sage/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">Share Pool</h2>
            <p className="text-sage text-sm mt-1">{pool.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-sage" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add User */}
          <div className="bg-peach/10 dark:bg-gunmetal/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">
              Add People
            </label>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
              </div>
              <button
                onClick={handleAddUser}
                className="px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole('viewer')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  role === 'viewer'
                    ? 'border-tangerine bg-tangerine/10'
                    : 'border-sage/20 hover:border-sage/40'
                }`}
              >
                <div className="text-sm font-medium text-gunmetal dark:text-peach">👁️ Viewer</div>
                <div className="text-xs text-sage mt-1">Read-only access</div>
              </button>
              <button
                onClick={() => setRole('collaborator')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  role === 'collaborator'
                    ? 'border-tangerine bg-tangerine/10'
                    : 'border-sage/20 hover:border-sage/40'
                }`}
              >
                <div className="text-sm font-medium text-gunmetal dark:text-peach">✏️ Collaborator</div>
                <div className="text-xs text-sage mt-1">Can add/remove candidates</div>
              </button>
            </div>
          </div>

          {/* Shared With List */}
          <div>
            <h3 className="text-sm font-medium text-gunmetal dark:text-peach mb-3">
              Shared With ({sharedWith.length})
            </h3>
            <div className="space-y-2">
              {sharedWith.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-peach/10 dark:bg-gunmetal/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-tangerine/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-tangerine">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gunmetal dark:text-peach">
                        {user.email}
                      </p>
                      <p className="text-xs text-sage">Added {user.addedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.email, e.target.value as any)}
                      className="px-3 py-1.5 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="collaborator">Collaborator</option>
                    </select>
                    <button
                      onClick={() => handleRemoveUser(user.email)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Guide */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gunmetal dark:text-peach mb-2">
              Permission Levels
            </h4>
            <div className="space-y-2 text-sm text-sage">
              <div>
                <strong className="text-gunmetal dark:text-peach">Owner (You):</strong> Full control - edit, delete, manage sharing
              </div>
              <div>
                <strong className="text-gunmetal dark:text-peach">Collaborator:</strong> Add/remove candidates, view analytics
              </div>
              <div>
                <strong className="text-gunmetal dark:text-peach">Viewer:</strong> Read-only access to pool and candidates
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
