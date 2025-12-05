'use client';

import { X, Link2, Check, ExternalLink, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const integrations = [
    {
      id: 'google',
      name: 'Google',
      description: 'Connect Gmail and Google Calendar for seamless communication',
      icon: '🔵',
      connected: false,
      services: ['Gmail', 'Google Calendar', 'Google Drive']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Source candidates and import profiles from LinkedIn',
      icon: '💼',
      connected: false,
      services: ['Candidate Sourcing', 'Profile Import']
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      description: 'Sync with Outlook Calendar and Microsoft Teams',
      icon: '🟦',
      connected: false,
      services: ['Outlook Calendar', 'Microsoft Teams', 'OneDrive']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Receive notifications and collaborate with your team',
      icon: '💬',
      connected: false,
      services: ['Team Notifications', 'Channel Updates']
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Schedule and manage video interviews',
      icon: '📹',
      connected: false,
      services: ['Video Interviews', 'Meeting Scheduling']
    },
    {
      id: 'calendar',
      name: 'Apple Calendar',
      description: 'Sync interview schedules with Apple Calendar',
      icon: '📅',
      connected: false,
      services: ['Calendar Sync']
    }
  ];

  const handleConnect = (integrationName: string) => {
    toast.info(`${integrationName} integration coming soon!`, {
      description: 'This feature is currently in development'
    });
  };

  const handleDisconnect = (integrationName: string) => {
    toast.success(`Disconnected from ${integrationName}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Connect third-party services to enhance your workflow
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Placeholder Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Placeholder UI</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  These integrations are not yet functional. The UI is ready for future implementation.
                </p>
              </div>
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-2xl">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                      {integration.connected ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm mt-1">
                          <Check className="w-3 h-3" />
                          Connected
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Not connected</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {integration.description}
                </p>

                {/* Services */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {integration.services.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                {integration.connected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDisconnect(integration.name)}
                      className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium"
                    >
                      Disconnect
                    </button>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.name)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Connect {integration.name}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-6 space-y-4">
            {/* Email Sync Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Sync</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Connect your email to send and receive messages directly from ZedSafe
              </p>
              <button
                onClick={() => handleConnect('Email')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                Configure Email Settings
              </button>
            </div>

            {/* Calendar Sync Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar Sync</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Sync interview schedules with your calendar application
              </p>
              <button
                onClick={() => handleConnect('Calendar')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                Configure Calendar Settings
              </button>
            </div>

            {/* API Access */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Access</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Generate API keys for custom integrations and automations
              </p>
              <button
                onClick={() => toast.info('API access coming soon!')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                Manage API Keys
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
