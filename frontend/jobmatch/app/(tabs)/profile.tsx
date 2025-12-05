/**
 * Profile Screen - Polished & Updated
 * Shows user profile with real data and navigation to all features
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import { useCandidateProfile, useMyApplications, useSavedJobs } from '@/hooks/useCandidate';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const colors = getTheme(isDarkMode);

  // Fetch real data
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useCandidateProfile();
  const { data: applications = [], isLoading: isLoadingApplications, refetch: refetchApplications } = useMyApplications();
  const { data: savedJobs = [], isLoading: isLoadingSavedJobs, refetch: refetchSavedJobs } = useSavedJobs();

  const isLoading = isLoadingProfile || isLoadingApplications || isLoadingSavedJobs;

  const handleRefresh = () => {
    refetchProfile();
    refetchApplications();
    refetchSavedJobs();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // Calculate real stats
  const stats = {
    applications: applications.length,
    savedJobs: savedJobs.length,
    interviews: applications.filter((app: any) => app.status === 'interview').length,
    profileStrength: profile?.profile_strength || 0,
  };

  const profileSections = [
    {
      title: 'Profile',
      items: [
        {
          icon: 'person-outline' as const,
          label: 'Edit Profile',
          subtitle: 'Update your information',
          onPress: () => router.push('/edit-profile'),
        },
        {
          icon: 'document-text-outline' as const,
          label: 'My Resume',
          subtitle: profile?.resume_url ? 'View or update resume' : 'Upload your resume',
          onPress: () => Alert.alert('Coming Soon', 'Resume upload will be available soon'),
          badge: !profile?.resume_url ? 'Required' : undefined,
        },
        {
          icon: 'bulb-outline' as const,
          label: 'Skills & Experience',
          subtitle: `${profile?.skills?.length || 0} skills listed`,
          onPress: () => router.push('/skills-experience'),
        },
      ],
    },
    {
      title: 'Activity',
      items: [
        {
          icon: 'briefcase-outline' as const,
          label: 'My Applications',
          subtitle: `${stats.applications} application${stats.applications !== 1 ? 's' : ''}`,
          onPress: () => router.push('/applications'),
          count: stats.applications,
        },
        {
          icon: 'bookmark-outline' as const,
          label: 'Saved Jobs',
          subtitle: `${stats.savedJobs} job${stats.savedJobs !== 1 ? 's' : ''} saved`,
          onPress: () => router.push('/applications'),
          count: stats.savedJobs,
        },
        {
          icon: 'notifications-outline' as const,
          label: 'Notifications',
          subtitle: 'Manage alerts and updates',
          onPress: () => Alert.alert('Coming Soon', 'Notifications will be available soon'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: (isDarkMode ? 'sunny-outline' : 'moon-outline') as const,
          label: 'Theme',
          subtitle: isDarkMode ? 'Switch to light mode' : 'Switch to dark mode',
          onPress: toggleTheme,
          showToggle: true,
        },
        {
          icon: 'settings-outline' as const,
          label: 'Settings',
          subtitle: 'App preferences',
          onPress: () => Alert.alert('Coming Soon', 'Settings will be available soon'),
        },
        {
          icon: 'shield-checkmark-outline' as const,
          label: 'Privacy',
          subtitle: 'Privacy & security',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline' as const,
          label: 'Help Center',
          subtitle: 'Get support and FAQs',
          onPress: () => Alert.alert('Help Center', 'For support, contact: support@jobmatch.zm'),
        },
        {
          icon: 'star-outline' as const,
          label: 'Rate Us',
          subtitle: 'Share your feedback',
          onPress: () => Alert.alert('Rate Us', 'Thank you! Rating feature coming soon.'),
        },
        {
          icon: 'information-circle-outline' as const,
          label: 'About',
          subtitle: 'JobMatch v1.0.0',
          onPress: () => Alert.alert(
            'About JobMatch',
            'JobMatch - AI-powered job matching platform\n\nVersion 1.0.0\nMade in Zambia 🇿🇲\n\n© 2024 JobMatch. All rights reserved.'
          ),
        },
      ],
    },
  ];

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold' }}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
            }}
          >
            {/* Avatar & Basic Info */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => Alert.alert('Coming Soon', 'Photo upload will be available soon')}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  overflow: 'hidden',
                  marginBottom: 12,
                  borderWidth: 3,
                  borderColor: colors.accent,
                }}
              >
                <Image 
                  source={require('../../toph.png')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
                {profile?.full_name || user?.full_name || 'User'}
              </Text>

              <View
                style={{
                  backgroundColor: colors.accent + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                  Job Seeker
                </Text>
              </View>

              {/* Contact Info */}
              <View style={{ width: '100%', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, flex: 1 }}>
                    {profile?.email || user?.email || 'No email'}
                  </Text>
                </View>

                {profile?.phone && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="call-outline" size={18} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: 14, flex: 1 }}>
                      {profile.phone}
                    </Text>
                  </View>
                )}

                {profile?.location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: 14, flex: 1 }}>
                      {profile.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Profile Strength */}
            <View
              style={{
                paddingTop: 20,
                paddingBottom: 20,
                borderTopWidth: 1,
                borderTopColor: colors.cardBorder,
                borderBottomWidth: 1,
                borderBottomColor: colors.cardBorder,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                  Profile Strength
                </Text>
                <Text style={{ color: colors.accent, fontSize: 14, fontWeight: 'bold' }}>
                  {stats.profileStrength}%
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.cardBorder + '30',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    backgroundColor: colors.accent,
                    borderRadius: 8,
                    width: `${stats.profileStrength}%`,
                  }}
                />
              </View>
              {stats.profileStrength < 100 && (
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                  💡 Complete your profile to increase your chances
                </Text>
              )}
            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 20,
                gap: 8,
              }}
            >
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center' }}
                onPress={() => router.push('/applications')}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {stats.applications}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Applications
                </Text>
              </TouchableOpacity>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center' }}
                onPress={() => router.push('/applications')}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {stats.savedJobs}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Saved Jobs
                </Text>
              </TouchableOpacity>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {stats.interviews}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Interviews
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 12,
              }}
            >
              {section.title}
            </Text>

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
                overflow: 'hidden',
              }}
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: colors.cardBorder,
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.actionBox,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name={item.icon} size={20} color={colors.actionText} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 15,
                          fontWeight: '600',
                        }}
                      >
                        {item.label}
                      </Text>
                      {item.badge && (
                        <View
                          style={{
                            backgroundColor: colors.error + '20',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: colors.error, fontSize: 10, fontWeight: '600' }}>
                            {item.badge}
                          </Text>
                        </View>
                      )}
                      {typeof item.count === 'number' && item.count > 0 && (
                        <View
                          style={{
                            backgroundColor: colors.accent,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                            minWidth: 20,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
                            {item.count}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 13,
                        marginTop: 2,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>

                  {item.showToggle ? (
                    <Ionicons
                      name={isDarkMode ? 'moon' : 'sunny'}
                      size={20}
                      color={colors.accent}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: colors.error + '20',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text
              style={{
                color: colors.error,
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Member since November 2024
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
            JobMatch v1.0.0 • Made in Zambia 🇿🇲
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
