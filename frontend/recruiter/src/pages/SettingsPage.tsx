import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { 
  User, Lock, Bell, Palette, Building2, 
  Save, Upload, Eye, EyeOff, Check, X 
} from 'lucide-react';

type TabType = 'profile' | 'account' | 'notifications' | 'appearance' | 'company';

interface NotificationPreferences {
  emailNewMatch: boolean;
  emailStatusChange: boolean;
  emailWeeklySummary: boolean;
  pushNewMatch: boolean;
  pushStatusChange: boolean;
  inAppNewMatch: boolean;
  inAppStatusChange: boolean;
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    photo: null as File | null,
  });

  // Account state
  const [accountData, setAccountData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNewMatch: true,
    emailStatusChange: true,
    emailWeeklySummary: true,
    pushNewMatch: false,
    pushStatusChange: false,
    inAppNewMatch: true,
    inAppStatusChange: true,
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    accentColor: 'tangerine',
  });

  const tabs = [
    { id: 'profile' as TabType, name: 'Profile', icon: User },
    { id: 'account' as TabType, name: 'Account', icon: Lock },
    { id: 'notifications' as TabType, name: 'Notifications', icon: Bell },
    { id: 'appearance' as TabType, name: 'Appearance', icon: Palette },
    { id: 'company' as TabType, name: 'Company', icon: Building2 },
  ];

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // TODO: API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async () => {
    if (accountData.newPassword !== accountData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    if (accountData.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      // TODO: API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAccountData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Password changed successfully!');
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // TODO: API call to update notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showMessage('success', 'Notification preferences saved!');
    } catch (error) {
      showMessage('error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    try {
      // TODO: API call to update appearance settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showMessage('success', 'Appearance settings saved!');
    } catch (error) {
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: 'bg-gray-600' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength === 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(accountData.newPassword);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <X className="w-5 h-5 text-red-500" />
          )}
          <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </span>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-tangerine text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-800 rounded-lg p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-tangerine"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-tangerine"
                    placeholder="+260 XXX XXX XXX"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-tangerine resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Account Security</h2>
              
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={accountData.currentPassword}
                      onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-tangerine pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={accountData.newPassword}
                      onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-tangerine pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {accountData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all`}
                            style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{passwordStrength.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Use 8+ characters with a mix of letters, numbers & symbols
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={accountData.confirmPassword}
                      onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-tangerine pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {accountData.confirmPassword && accountData.newPassword !== accountData.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAccount}
                    disabled={saving || !accountData.currentPassword || !accountData.newPassword}
                    className="px-6 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-8">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNewMatch' as keyof NotificationPreferences, label: 'New candidate matches', desc: 'Get notified when new candidates match your jobs' },
                      { key: 'emailStatusChange' as keyof NotificationPreferences, label: 'Status changes', desc: 'When a candidate moves through the pipeline' },
                      { key: 'emailWeeklySummary' as keyof NotificationPreferences, label: 'Weekly summary', desc: 'Receive a weekly digest of your hiring activity' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded border-gray-600 text-tangerine focus:ring-tangerine focus:ring-offset-gray-800"
                        />
                        <div>
                          <div className="text-white">{item.label}</div>
                          <div className="text-sm text-gray-400">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'pushNewMatch' as keyof NotificationPreferences, label: 'New candidate matches', desc: 'Real-time browser notifications for new matches' },
                      { key: 'pushStatusChange' as keyof NotificationPreferences, label: 'Status changes', desc: 'Instant alerts when candidates update their status' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded border-gray-600 text-tangerine focus:ring-tangerine focus:ring-offset-gray-800"
                        />
                        <div>
                          <div className="text-white">{item.label}</div>
                          <div className="text-sm text-gray-400">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* In-App Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">In-App Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'inAppNewMatch' as keyof NotificationPreferences, label: 'New candidate matches', desc: 'Show notifications in the dashboard' },
                      { key: 'inAppStatusChange' as keyof NotificationPreferences, label: 'Status changes', desc: 'Display status updates in notification center' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded border-gray-600 text-tangerine focus:ring-tangerine focus:ring-offset-gray-800"
                        />
                        <div>
                          <div className="text-white">{item.label}</div>
                          <div className="text-sm text-gray-400">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="px-6 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>
              
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        appearance.theme === 'dark'
                          ? 'border-tangerine bg-gray-700'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-gray-900 mb-3"></div>
                      <div className="text-white font-medium">Dark</div>
                      <div className="text-sm text-gray-400">Current theme</div>
                    </button>
                    <button
                      disabled
                      className="p-4 rounded-lg border-2 border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed"
                    >
                      <div className="w-full h-20 rounded bg-white mb-3"></div>
                      <div className="text-white font-medium">Light</div>
                      <div className="text-sm text-gray-400">Coming soon</div>
                    </button>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Accent Color
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'tangerine', color: 'bg-tangerine', name: 'Tangerine' },
                      { id: 'blue', color: 'bg-blue-500', name: 'Blue' },
                      { id: 'green', color: 'bg-green-500', name: 'Green' },
                      { id: 'purple', color: 'bg-purple-500', name: 'Purple' },
                    ].map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setAppearance({ ...appearance, accentColor: color.id })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          appearance.accentColor === color.id
                            ? 'border-white'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className={`w-full h-12 rounded ${color.color} mb-2`}></div>
                        <div className="text-sm text-white">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAppearance}
                    disabled={saving}
                    className="px-6 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-blue-400 text-sm">
                    Company information is managed by your administrator. Contact support to update these details.
                  </p>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={user?.company || 'N/A'}
                    disabled
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value="Staffing & Recruiting"
                    disabled
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Size
                  </label>
                  <input
                    type="text"
                    value="1-50 employees"
                    disabled
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value="Lusaka, Zambia"
                    disabled
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={user?.company ? `www.${user.company.toLowerCase()}.com` : 'N/A'}
                    disabled
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
