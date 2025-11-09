import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import {
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Target,
  Bookmark,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Star,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Award,
  Briefcase,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const colors = getTheme(isDarkMode);

  const jobSeeker = {
    name: user?.full_name || 'Brian Mwale',
    email: user?.email || 'brian.mwale@example.com',
    phone: '+260 977 555 666',
    location: 'Lusaka, Zambia',
    avatar: require('../../toph.png'),
    memberSince: 'November 2024',
    // Stats
    profileStrength: 65,
    applicationsSubmitted: 12,
    savedJobs: 5,
    interviewsScheduled: 3,
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
            router.replace('/');
          },
        },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Profile',
      items: [
        { icon: User, label: 'Edit Profile', subtitle: 'Update your information', onPress: () => {} },
        { icon: FileText, label: 'My Resume', subtitle: 'Upload or update resume', onPress: () => {} },
        { icon: Target, label: 'Skills & Experience', subtitle: 'Manage your skills', onPress: () => {} },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: Briefcase, label: 'My Applications', subtitle: 'Track your applications', onPress: () => router.push('/(tabs)/applications') },
        { icon: Bookmark, label: 'Saved Jobs', subtitle: 'View saved positions', onPress: () => {} },
        { icon: Bell, label: 'Notifications', subtitle: 'Manage alerts', onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: isDarkMode ? Sun : Moon, 
          label: 'Theme', 
          subtitle: isDarkMode ? 'Light mode' : 'Dark mode',
          onPress: toggleTheme,
        },
        { icon: Settings, label: 'Settings', subtitle: 'App preferences', onPress: () => {} },
        { icon: Shield, label: 'Privacy', subtitle: 'Privacy & security', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', subtitle: 'Get support', onPress: () => {} },
        { icon: Star, label: 'Rate Us', subtitle: 'Share your feedback', onPress: () => {} },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold' }}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1.5,
            borderColor: colors.cardBorder,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image
                source={jobSeeker.avatar}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 3,
                  borderColor: colors.accent,
                  marginBottom: 12,
                }}
              />
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
                {jobSeeker.name}
              </Text>
              <View style={{
                backgroundColor: colors.actionBox,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <Text style={{ color: colors.actionText, fontSize: 12, fontWeight: '600' }}>
                  Job Seeker
                </Text>
              </View>

              {/* Contact Info */}
              <View style={{ width: '100%', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Mail size={16} color={colors.textMuted} strokeWidth={2} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, flex: 1 }}>
                    {jobSeeker.email}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Phone size={16} color={colors.textMuted} strokeWidth={2} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, flex: 1 }}>
                    {jobSeeker.phone}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <MapPin size={16} color={colors.textMuted} strokeWidth={2} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, flex: 1 }}>
                    {jobSeeker.location}
                  </Text>
                </View>
              </View>
            </View>

            {/* Profile Strength */}
            <View style={{
              paddingTop: 20,
              paddingBottom: 20,
              borderTopWidth: 1,
              borderTopColor: colors.cardBorder,
              borderBottomWidth: 1,
              borderBottomColor: colors.cardBorder,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                  Profile Strength
                </Text>
                <Text style={{ color: colors.accent, fontSize: 14, fontWeight: 'bold' }}>
                  {jobSeeker.profileStrength}%
                </Text>
              </View>
              <View style={{ 
                height: 8, 
                backgroundColor: colors.cardBorder + '30', 
                borderRadius: 8, 
                overflow: 'hidden' 
              }}>
                <View style={{ 
                  height: '100%', 
                  backgroundColor: colors.accent, 
                  borderRadius: 8,
                  width: `${jobSeeker.profileStrength}%`,
                }} />
              </View>
            </View>

            {/* Stats */}
            <View style={{
              flexDirection: 'row',
              paddingTop: 20,
              gap: 12,
            }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {jobSeeker.applicationsSubmitted}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Applications
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {jobSeeker.savedJobs}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Saved Jobs
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {jobSeeker.interviewsScheduled}
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
          <View key={sectionIndex} style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
            }}>
              {section.title}
            </Text>

            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
              overflow: 'hidden',
            }}>
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
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
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.actionBox,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <IconComponent size={20} color={colors.actionText} strokeWidth={2.5} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text,
                        fontSize: 15,
                        fontWeight: '600',
                        marginBottom: 2,
                      }}>
                        {item.label}
                      </Text>
                      <Text style={{
                        color: colors.textMuted,
                        fontSize: 12,
                      }}>
                        {item.subtitle}
                      </Text>
                    </View>

                    <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#FEE2E2',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#EF4444" strokeWidth={2.5} />
            <Text style={{
              color: '#EF4444',
              fontSize: 16,
              fontWeight: 'bold',
            }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Member since {jobSeeker.memberSince}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
            JobMatch v1.0.0 • Made in Zambia 🇿🇲
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
