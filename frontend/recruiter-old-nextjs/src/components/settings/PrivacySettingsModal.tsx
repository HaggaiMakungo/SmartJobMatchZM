'use client';

import { useState } from 'react';
import { X, Download, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const [autoDeleteApplications, setAutoDeleteApplications] = useState(false);
  const [applicationRetentionDays, setApplicationRetentionDays] = useState(90);
  const [archiveInactiveJobs, setArchiveInactiveJobs] = useState(false);
  const [jobArchiveMonths, setJobArchiveMonths] = useState(6);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}`);
    setIsExporting(false);
  };

  const handleSave = () => {
    toast.success('Privacy settings updated');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy & Data Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Data Export */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Your Data</h3>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download all your data including jobs, applications, candidates, and talent pools.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Export Format
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'json', label: 'JSON', description: 'Machine-readable format' },
                      { value: 'csv', label: 'CSV', description: 'Spreadsheet-friendly' }
                    ].map((format) => (
                      <label
                        key={format.value}
                        className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          exportFormat === format.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.value}
                          checked={exportFormat === format.value}
                          onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                          className="sr-only"
                        />
                        <p className="font-medium text-gray-900 dark:text-white">{format.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{format.description}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Preparing Export...' : 'Download All Data'}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Export includes: Jobs, Applications, Candidates, Talent Pools, Notes, and Activity History
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Retention</h3>
              </div>

              <div className="space-y-6">
                {/* Auto-delete Applications */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDeleteApplications}
                          onChange={(e) => setAutoDeleteApplications(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Auto-delete old applications
                        </span>
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-6">
                        Automatically remove rejected applications after a specified time period
                      </p>
                    </div>
                  </div>

                  {autoDeleteApplications && (
                    <div className="ml-6 mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Delete after
                      </label>
                      <select
                        value={applicationRetentionDays}
                        onChange={(e) => setApplicationRetentionDays(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                        <option value={365}>1 year</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Only rejected applications will be deleted. Hired candidates are never deleted.
                      </p>
                    </div>
                  )}
                </div>

                {/* Archive Inactive Jobs */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={archiveInactiveJobs}
                          onChange={(e) => setArchiveInactiveJobs(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Archive inactive jobs
                        </span>
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-6">
                        Move closed jobs to archive after a period of inactivity
                      </p>
                    </div>
                  </div>

                  {archiveInactiveJobs && (
                    <div className="ml-6 mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Archive after
                      </label>
                      <select
                        value={jobArchiveMonths}
                        onChange={(e) => setJobArchiveMonths(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={3}>3 months</option>
                        <option value={6}>6 months</option>
                        <option value={12}>12 months</option>
                        <option value={24}>24 months</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Archived jobs can be restored at any time from the archive section.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Data Usage Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Data Usage</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Active Jobs', value: '12', color: 'blue' },
                  { label: 'Total Applications', value: '348', color: 'green' },
                  { label: 'Candidates in Database', value: '1,250', color: 'purple' },
                  { label: 'Talent Pools', value: '8', color: 'orange' }
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Privacy Notice</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your data is encrypted and stored securely. We never sell or share your data with third parties. 
                    You have full control over your data and can export or delete it at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
