'use client';

import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Link2, 
  AlertTriangle 
} from 'lucide-react';
import AccountSettingsModal from '@/components/settings/AccountSettingsModal';
import ProfileSettingsModal from '@/components/settings/ProfileSettingsModal';
import NotificationSettingsModal from '@/components/settings/NotificationSettingsModal';
import AppearanceSettingsModal from '@/components/settings/AppearanceSettingsModal';
import PrivacySettingsModal from '@/components/settings/PrivacySettingsModal';
import IntegrationsModal from '@/components/settings/IntegrationsModal';
import DangerZoneModal from '@/components/settings/DangerZoneModal';

type SettingsCategory = 
  | 'account' 
  | 'profile' 
  | 'notifications' 
  | 'appearance' 
  | 'privacy' 
  | 'integrations' 
  | 'danger';

export default function SettingsPage() {
  const [activeModal, setActiveModal] = useState<SettingsCategory | null>(null);

  const settingsCategories = [
    {
      id: 'account' as SettingsCategory,
      title: 'Account',
      description: 'Manage your email, password, and security settings',
      icon: SettingsIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'profile' as SettingsCategory,
      title: 'Profile',
      description: 'Update your personal information and profile photo',
      icon: User,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'notifications' as SettingsCategory,
      title: 'Notifications',
      description: 'Configure how you receive notifications',
      icon: Bell,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 'appearance' as SettingsCategory,
      title: 'Appearance',
      description: 'Customize your dashboard theme',
      icon: Palette,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'privacy' as SettingsCategory,
      title: 'Privacy & Data',
      description: 'Manage your data and privacy preferences',
      icon: Shield,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
    },
    {
      id: 'integrations' as SettingsCategory,
      title: 'Integrations',
      description: 'Connect third-party services and apps',
      icon: Link2,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      id: 'danger' as SettingsCategory,
      title: 'Danger Zone',
      description: 'Irreversible actions and account deletion',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveModal(category.id)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <AccountSettingsModal 
        isOpen={activeModal === 'account'} 
        onClose={() => setActiveModal(null)} 
      />
      <ProfileSettingsModal 
        isOpen={activeModal === 'profile'} 
        onClose={() => setActiveModal(null)} 
      />
      <NotificationSettingsModal 
        isOpen={activeModal === 'notifications'} 
        onClose={() => setActiveModal(null)} 
      />
      <AppearanceSettingsModal 
        isOpen={activeModal === 'appearance'} 
        onClose={() => setActiveModal(null)} 
      />
      <PrivacySettingsModal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
      />
      <IntegrationsModal 
        isOpen={activeModal === 'integrations'} 
        onClose={() => setActiveModal(null)} 
      />
      <DangerZoneModal 
        isOpen={activeModal === 'danger'} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
}
