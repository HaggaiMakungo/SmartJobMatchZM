'use client';

import { X, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

interface AppearanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppearanceSettingsModal({ isOpen, onClose }: AppearanceSettingsModalProps) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme === 'system' ? 'system default' : newTheme} mode`);
  };

  const handleSave = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose how ZedSafe Recruiter looks to you. Select a single theme, or sync with your system.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { 
                    value: 'light', 
                    label: 'Light', 
                    icon: Sun,
                    description: 'Clean and bright',
                    preview: 'bg-gradient-to-br from-white to-gray-100'
                  },
                  { 
                    value: 'dark', 
                    label: 'Dark', 
                    icon: Moon,
                    description: 'Easy on the eyes',
                    preview: 'bg-gradient-to-br from-gray-800 to-gray-900'
                  },
                  { 
                    value: 'system', 
                    label: 'System', 
                    icon: Monitor,
                    description: 'Auto switch',
                    preview: 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        theme === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {/* Preview Box */}
                      <div className={`w-full h-24 rounded-lg mb-3 ${option.preview} flex items-center justify-center shadow-inner`}>
                        <Icon className={`w-8 h-8 ${option.value === 'light' ? 'text-gray-600' : 'text-white'}`} />
                      </div>

                      {/* Label */}
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</p>
                      </div>

                      {/* Selected Indicator */}
                      {theme === option.value && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Theme changes apply immediately across the entire dashboard. Your preference is saved automatically.
              </p>
            </div>

            {/* Preview Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  {/* Sample Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Sample Card</h4>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This is how your content will appear with the selected theme.
                    </p>
                  </div>

                  {/* Sample Buttons */}
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                      Primary Button
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
