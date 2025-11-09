'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  User,
  Building2,
  Lock,
  Bell,
  Save,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
} from 'lucide-react';

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  job_title: string;
}

interface CompanyFormData {
  company_name: string;
  company_website: string;
  company_description: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'password' | 'notifications'>('profile');

  // Profile form
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    job_title: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Company form
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    company_name: '',
    company_website: '',
    company_description: '',
  });
  const [companySaving, setCompanySaving] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);

  // Password form
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationNotifications, setApplicationNotifications] = useState(true);
  const [invitationNotifications, setInvitationNotifications] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Populate forms with user data
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        job_title: user.job_title || '',
      });

      setCompanyData({
        company_name: user.company_name || '',
        company_website: user.company_website || '',
        company_description: user.company_description || '',
      });
    }
  }, [user, authLoading, router]);

  const handleProfileSave = async () => {
    try {
      setProfileSaving(true);
      setProfileSuccess(false);

      await api.put('/recruiter/profile', {
        full_name: profileData.full_name,
        phone: profileData.phone,
        location: profileData.location,
        job_title: profileData.job_title,
      });
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCompanySave = async () => {
    try {
      setCompanySaving(true);
      setCompanySuccess(false);

      await api.put('/recruiter/company', {
        company_name: companyData.company_name,
        company_website: companyData.company_website,
        company_description: companyData.company_description,
      });
      
      setCompanySuccess(true);
      setTimeout(() => setCompanySuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update company:', error);
      alert('Failed to update company information');
    } finally {
      setCompanySaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    
    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordSuccess(false);

      await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setPasswordSuccess(true);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setPasswordError(error.detail || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Info
              </div>
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'company'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'password'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-w-3xl">
          {/* Personal Info Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Update your personal details and contact information
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+260 97 1234567"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          placeholder="Lusaka, Zambia"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.job_title}
                        onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                        placeholder="Recruitment Manager"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {profileSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    Profile updated successfully!
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleProfileSave} disabled={profileSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Update your company details visible to candidates
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={companyData.company_name}
                        onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                        placeholder="TechCorp Zambia"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={companyData.company_website}
                        onChange={(e) => setCompanyData({ ...companyData, company_website: e.target.value })}
                        placeholder="https://techcorp.zm"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <Textarea
                      value={companyData.company_description}
                      onChange={(e) => setCompanyData({ ...companyData, company_description: e.target.value })}
                      placeholder="Tell candidates about your company..."
                      rows={5}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be shown to candidates when they view your job postings
                    </p>
                  </div>
                </div>

                {companySuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    Company information updated successfully!
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleCompanySave} disabled={companySaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {companySaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Ensure your account is using a long, random password to stay secure
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    Password changed successfully!
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange} disabled={passwordSaving} className="gap-2">
                    <Lock className="h-4 w-4" />
                    {passwordSaving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Choose what notifications you want to receive
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      </div>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Application Notifications */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-600" />
                        <h4 className="font-medium text-gray-900">New Applications</h4>
                      </div>
                      <p className="text-sm text-gray-500">
                        Get notified when candidates apply to your jobs
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applicationNotifications}
                        onChange={(e) => setApplicationNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Invitation Responses */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className="h-4 w-4 text-gray-600" />
                        <h4 className="font-medium text-gray-900">Invitation Responses</h4>
                      </div>
                      <p className="text-sm text-gray-500">
                        Get notified when candidates respond to your invitations
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={invitationNotifications}
                        onChange={(e) => setInvitationNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    These preferences only affect email notifications. In-app notifications will always be shown.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Account Status */}
        <Card className="p-6 max-w-3xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Status</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your recruiter account is active and verified
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Deactivate Account
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
