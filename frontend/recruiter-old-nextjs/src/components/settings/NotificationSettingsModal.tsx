'use client';

import { useState } from 'react';
import { X, Mail, Bell, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const [emailNotifications, setEmailNotifications] = useState({
    newApplications: true,
    statusChanges: true,
    highMatches: true,
    interviews: true,
    poolActivity: false,
    systemUpdates: true,
    weeklyDigest: true,
    monthlyReports: false
  });

  const [pushNotifications, setPushNotifications] = useState({
    enabled: true,
    newApplications: true,
    interviews: true,
    highMatches: true
  });

  const [frequency, setFrequency] = useState<'realtime' | 'daily' | 'weekly'>('realtime');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');

  const handleSave = () => {
    toast.success('Notification preferences updated');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Email Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
              </div>

              <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                {Object.entries({
                  newApplications: 'New Applications',
                  statusChanges: 'Application Status Changes',
                  highMatches: 'High Match Candidates (90%+)',
                  interviews: 'Interview Reminders',
                  poolActivity: 'Talent Pool Activity',
                  systemUpdates: 'System Updates',
                  weeklyDigest: 'Weekly Digest',
                  monthlyReports: 'Monthly Analytics Reports'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    <input
                      type="checkbox"
                      checked={emailNotifications[key as keyof typeof emailNotifications]}
                      onChange={(e) => setEmailNotifications({
                        ...emailNotifications,
                        [key]: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
              </div>

              <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={pushNotifications.enabled}
                    onChange={(e) => setPushNotifications({
                      ...pushNotifications,
                      enabled: e.target.checked
                    })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                {pushNotifications.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                    {Object.entries({
                      newApplications: 'New Applications',
                      interviews: 'Interview Reminders',
                      highMatches: 'High Match Candidates'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                        <input
                          type="checkbox"
                          checked={pushNotifications[key as keyof typeof pushNotifications] as boolean}
                          onChange={(e) => setPushNotifications({
                            ...pushNotifications,
                            [key]: e.target.checked
                          })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notification Frequency */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Frequency</h3>

              <div className="space-y-2">
                {[
                  { value: 'realtime', label: 'Real-time', description: 'Get notified immediately when events happen' },
                  { value: 'daily', label: 'Daily Digest', description: 'Receive one email per day with all updates' },
                  { value: 'weekly', label: 'Weekly Digest', description: 'Receive one email per week with all updates' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      frequency === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={frequency === option.value}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiet Hours</h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable quiet hours (no notifications during this time)
                  </span>
                </label>

                {quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={quietStart}
                        onChange={(e) => setQuietStart(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={quietEnd}
                        onChange={(e) => setQuietEnd(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
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
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
