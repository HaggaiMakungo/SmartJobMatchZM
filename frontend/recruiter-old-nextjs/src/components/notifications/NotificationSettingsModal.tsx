'use client';

import { useState } from 'react';
import { X, Mail, Bell as BellIcon, Clock, Save } from 'lucide-react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { NotificationType } from '@/types/notifications';

interface NotificationSettingsModalProps {
  onClose: () => void;
}

export function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {
  const { settings, updateSettings } = useNotificationsStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const notificationCategories: Array<{ type: NotificationType; label: string; description: string }> = [
    { type: 'application_new', label: 'New Applications', description: 'When candidates apply to your jobs' },
    { type: 'application_status_change', label: 'Application Status Changes', description: 'When application moves to different stage' },
    { type: 'candidate_high_match', label: 'High Match Candidates', description: 'When 90%+ match candidates are found' },
    { type: 'interview_scheduled', label: 'Interview Scheduled', description: 'When interviews are scheduled' },
    { type: 'interview_reminder', label: 'Interview Reminders', description: 'Reminders before scheduled interviews' },
    { type: 'pool_shared', label: 'Talent Pool Shared', description: 'When someone shares a pool with you' },
    { type: 'analytics_ready', label: 'Analytics Reports', description: 'Monthly/yearly analytics reports' },
    { type: 'system_update', label: 'System Updates', description: 'Platform updates and announcements' },
  ];

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleEmailToggle = (type: NotificationType) => {
    setLocalSettings((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [type]: !prev.emailNotifications[type],
      },
    }));
  };

  const handlePushToggle = (type: NotificationType) => {
    setLocalSettings((prev) => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [type]: !prev.pushNotifications[type],
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gunmetal/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gunmetal w-full max-w-3xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage/10">
          <div>
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">Notification Settings</h2>
            <p className="text-sm text-sage mt-1">Manage how you receive notifications</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sage" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Frequency Settings */}
          <div>
            <h3 className="font-semibold text-gunmetal dark:text-peach mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Notification Frequency
            </h3>
            <div className="space-y-2">
              {(['realtime', 'daily', 'weekly'] as const).map((freq) => (
                <label key={freq} className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg cursor-pointer hover:bg-sage/10 transition-colors">
                  <input
                    type="radio"
                    name="frequency"
                    checked={localSettings.frequency === freq}
                    onChange={() => setLocalSettings((prev) => ({ ...prev, frequency: freq }))}
                    className="w-4 h-4 text-tangerine border-sage/30 focus:ring-tangerine"
                  />
                  <div>
                    <p className="font-medium text-gunmetal dark:text-peach capitalize">{freq}</p>
                    <p className="text-xs text-sage">
                      {freq === 'realtime' && 'Receive notifications immediately'}
                      {freq === 'daily' && 'Receive a daily summary email'}
                      {freq === 'weekly' && 'Receive a weekly summary email'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="font-semibold text-gunmetal dark:text-peach mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Quiet Hours
            </h3>
            <label className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg cursor-pointer hover:bg-sage/10 transition-colors mb-3">
              <input
                type="checkbox"
                checked={localSettings.quietHours.enabled}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 text-tangerine border-sage/30 rounded focus:ring-tangerine"
              />
              <span className="font-medium text-gunmetal dark:text-peach">Enable quiet hours</span>
            </label>
            {localSettings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-sage mb-1">Start Time</label>
                  <input
                    type="time"
                    value={localSettings.quietHours.start}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-gunmetal dark:text-peach focus:outline-none focus:ring-2 focus:ring-tangerine/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage mb-1">End Time</label>
                  <input
                    type="time"
                    value={localSettings.quietHours.end}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-gunmetal dark:text-peach focus:outline-none focus:ring-2 focus:ring-tangerine/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Priority Threshold */}
          <div>
            <h3 className="font-semibold text-gunmetal dark:text-peach mb-3">Priority Threshold</h3>
            <p className="text-sm text-sage mb-3">Only notify me for notifications at or above this priority level</p>
            <div className="space-y-2">
              {(['high', 'medium', 'low'] as const).map((priority) => (
                <label key={priority} className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg cursor-pointer hover:bg-sage/10 transition-colors">
                  <input
                    type="radio"
                    name="priority"
                    checked={localSettings.priorityThreshold === priority}
                    onChange={() => setLocalSettings((prev) => ({ ...prev, priorityThreshold: priority }))}
                    className="w-4 h-4 text-tangerine border-sage/30 focus:ring-tangerine"
                  />
                  <span className="font-medium text-gunmetal dark:text-peach capitalize">{priority} Priority</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="font-semibold text-gunmetal dark:text-peach mb-3">Notification Types</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage/10">
                    <th className="text-left py-3 px-2 text-sm font-medium text-sage">Type</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-sage">
                      <Mail className="w-4 h-4 mx-auto" />
                      <span className="sr-only">Email</span>
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-sage">
                      <BellIcon className="w-4 h-4 mx-auto" />
                      <span className="sr-only">Push</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {notificationCategories.map((category) => (
                    <tr key={category.type} className="hover:bg-sage/5">
                      <td className="py-3 px-2">
                        <p className="font-medium text-gunmetal dark:text-peach text-sm">{category.label}</p>
                        <p className="text-xs text-sage">{category.description}</p>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={localSettings.emailNotifications[category.type]}
                          onChange={() => handleEmailToggle(category.type)}
                          className="w-4 h-4 text-tangerine border-sage/30 rounded focus:ring-tangerine cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={localSettings.pushNotifications[category.type]}
                          onChange={() => handlePushToggle(category.type)}
                          className="w-4 h-4 text-tangerine border-sage/30 rounded focus:ring-tangerine cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-sage/10">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gunmetal dark:text-peach hover:bg-sage/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
