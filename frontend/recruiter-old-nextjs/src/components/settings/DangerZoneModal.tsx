'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2, Archive, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface DangerZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DangerZoneModal({ isOpen, onClose }: DangerZoneModalProps) {
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeactivateAccount = () => {
    toast.success('Account deactivated', {
      description: 'You can reactivate within 30 days by logging in'
    });
    setShowDeactivateConfirm(false);
    onClose();
  };

  const handleDeleteAccount = () => {
    if (deletePassword !== 'test123' && deleteConfirmText !== 'DELETE') {
      toast.error('Invalid password or confirmation text');
      return;
    }
    toast.success('Account deletion initiated', {
      description: 'Your account will be permanently deleted in 7 days'
    });
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleClearNotifications = () => {
    toast.success('All notifications cleared');
  };

  const handleResetDashboard = () => {
    toast.success('Dashboard layout reset to default');
  };

  const handleClearSearchHistory = () => {
    toast.success('Search history cleared');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">Danger Zone</h2>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            ⚠️ Warning: Actions in this section are irreversible or have significant consequences. Proceed with caution.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          <div className="space-y-6">
            {/* Reversible Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              
              <div className="space-y-3">
                {/* Clear Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Clear All Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Remove all notifications from your inbox
                    </p>
                  </div>
                  <button
                    onClick={handleClearNotifications}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>

                {/* Reset Dashboard */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Reset Dashboard Layout</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Restore default dashboard configuration
                    </p>
                  </div>
                  <button
                    onClick={handleResetDashboard}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                {/* Clear Search History */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Clear Search History</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Remove all saved searches and filters
                    </p>
                  </div>
                  <button
                    onClick={handleClearSearchHistory}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Account Deactivation */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Deactivation</h3>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Temporarily Disable Your Account</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Deactivating your account will:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-4">
                  <li>• Hide your profile from the platform</li>
                  <li>• Pause all your job postings</li>
                  <li>• Stop notifications</li>
                  <li>• Allow reactivation within 30 days</li>
                </ul>
              </div>

              {!showDeactivateConfirm ? (
                <button
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center justify-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Deactivate Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to deactivate your account?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeactivateConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivateAccount}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Yes, Deactivate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Deletion */}
            <div className="border-t border-red-200 dark:border-red-800 pt-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Permanent Account Deletion</h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  This action cannot be undone
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4">
                  <li>• All your job postings</li>
                  <li>• All applications and candidate data</li>
                  <li>• All talent pools and notes</li>
                  <li>• Your profile and settings</li>
                  <li>• All analytics and reports</li>
                </ul>
                <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-medium">
                  This data cannot be recovered after deletion.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account Permanently
                </button>
              ) : (
                <div className="space-y-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    To confirm deletion, please:
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                      1. Enter your password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                      2. Type <span className="font-mono bg-red-200 dark:bg-red-900 px-2 py-0.5 rounded">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Type DELETE"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                        setDeleteConfirmText('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword || deleteConfirmText !== 'DELETE'}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
