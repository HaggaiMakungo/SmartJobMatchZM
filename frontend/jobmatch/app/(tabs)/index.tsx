import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCvId } from '@/hooks/useMatching';
import { mlMatchService } from '@/services/match.service';
import { useQuery } from '@tanstack/react-query';
import { useCandidateProfile, useSavedJobs, useMyApplications } from '@/hooks/useCandidate';
import { Card } from '@/components/ui/Card';
import { getTheme } from '@/utils/theme';
import {
  User,
  Briefcase,
  Bookmark,
  Target,
  Bell,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Award,
  Moon,
  Sun,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const colors = getTheme(isDarkMode);

  // Fetch real data from backend using hybrid matching
  const cvId = useCvId();
  const { data: matchData, isLoading: matchLoading, error: matchError, refetch: refetchMatches } = useQuery({
    queryKey: ['home-hybrid-matches', cvId],
    queryFn: () => mlMatchService.getHybridMatches(cvId!, 5),
    enabled: !!cvId,
    staleTime: 5 * 60 * 1000,
  });
  
  // Get user's matched categories for relevant job count
  const matchedCategories = matchData?.matches?.map(m => m.job.category).filter((v, i, a) => a.indexOf(v) === i) || [];
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useCandidateProfile();
  const { data: savedJobsData, refetch: refetchSaved } = useSavedJobs();
  const { data: applicationsData, refetch: refetchApps } = useMyApplications();

  const [refreshing, setRefreshing] = useState(false);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchMatches(),
      refetchProfile(),
      refetchSaved(),
      refetchApps(),
    ]);
    setRefreshing(false);
  };

  // Calculate profile strength from real data
  const calculateProfileStrength = () => {
    if (!profile) return 0;
    
    let strength = 0;
    if (profile.full_name) strength += 10;
    if (profile.email) strength += 10;
    if (profile.phone) strength += 10;
    if (profile.location) strength += 10;
    if (profile.bio) strength += 15;
    if (profile.skills && profile.skills.length > 0) strength += 20;
    if (profile.education && profile.education.length > 0) strength += 15;
    if (profile.experience && profile.experience.length > 0) strength += 10;
    
    return Math.min(strength, 100);
  };

  const profileStrength = profile?.profile_strength || calculateProfileStrength();

  // Real stats from backend
  const stats = {
    jobsAvailable: matchedCategories.length > 0 ? (matchData?.total_jobs_scored || 0) : 0,
    savedJobs: savedJobsData?.length || 0,
    topMatches: matchData?.matches?.length || 0,
  };

  // Top matches from hybrid ML matching
  const topMatches = matchData?.matches?.map(match => ({
    id: match.job.job_id,
    title: match.job.title,
    company: match.job.company || 'Company',
    location: match.job.location_city || 'Zambia',
    matchScore: Math.round((match.hybrid_score || match.rule_score) * 100),
    salary: match.job.salary_min_zmw && match.job.salary_max_zmw
      ? `K${match.job.salary_min_zmw.toLocaleString()} - K${match.job.salary_max_zmw.toLocaleString()}`
      : match.job.budget ? `K${match.job.budget.toLocaleString()}` : 'Negotiable',
    reasons: match.reasons || [],
  })) || [];

  // Mock popular jobs (TODO: Add endpoint for this)
  const popularJobs = [
    { id: 1, title: 'Accountant', applications: 45, location: 'Lusaka' },
    { id: 2, title: 'Sales Representative', applications: 38, location: 'Kitwe' },
    { id: 3, title: 'Teacher', applications: 32, location: 'Ndola' },
  ];

  // Coach tips based on profile gaps
  const getCoachTips = () => {
    if (!profile) return [];
    
    const tips = [];
    
    if (!profile.education || profile.education.length === 0) {
      tips.push({
        id: 1,
        icon: GraduationCap,
        title: 'Add Education',
        description: `Complete your education history to boost your profile by ${100 - profileStrength}%`,
        action: 'Add Now',
      });
    }
    
    if (!profile.skills || profile.skills.length < 3) {
      tips.push({
        id: 2,
        icon: Award,
        title: 'Update Skills',
        description: 'Add 5 more relevant skills to improve your matches',
        action: 'Update',
      });
    }

    if (!profile.bio) {
      tips.push({
        id: 3,
        icon: User,
        title: 'Write Your Bio',
        description: 'A compelling bio helps employers understand your strengths',
        action: 'Add Bio',
      });
    }

    return tips.slice(0, 2); // Show max 2 tips
  };

  const coachTips = getCoachTips();

  const getMatchColor = (score: number) => {
    if (score >= 85) return '#10B981';
    if (score >= 70) return '#F59E0B';
    return '#6B7280';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  // Loading state
  if (matchLoading || profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16 }}>
          Loading your matches...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header Section */}
        <View className="px-5 pt-12 pb-6">
          {/* Top Bar */}
          <View className="flex-row justify-between items-center mb-6">
            {/* Profile Picture */}
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              className="w-12 h-12 rounded-full overflow-hidden"
              style={{ borderWidth: 2, borderColor: colors.accent }}
            >
              <Image 
                source={require('../../toph.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </TouchableOpacity>

            {/* Dark Mode Toggle & Notification */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity 
                onPress={toggleTheme}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.card }}
              >
                {isDarkMode ? (
                  <Sun size={20} color={colors.accent} />
                ) : (
                  <Moon size={20} color={colors.text} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.card }}
                onPress={() => router.push('/(tabs)/applications')}
              >
                <Bell size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Message */}
          <View className="mb-4">
            <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
              Hi, {user?.full_name || profile?.full_name || 'Job Seeker'}
            </Text>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', lineHeight: 28 }}>
              Welcome to the winter of our discontent
            </Text>
          </View>

          {/* Profile Strength Meter */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ color: colors.sage, fontSize: 12, fontWeight: '500' }}>
                Profile Strength
              </Text>
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: 'bold' }}>
                {profileStrength}%
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: colors.cardBorder, borderRadius: 10, overflow: 'hidden' }}>
              <View 
                style={{ 
                  height: '100%', 
                  backgroundColor: colors.accent, 
                  borderRadius: 10,
                  width: `${profileStrength}%` 
                }}
              />
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
              {profileStrength < 100 
                ? 'Complete your profile to unlock better matches'
                : 'Your profile is complete! 🎉'
              }
            </Text>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View className="px-5 mb-6">
          <View className="flex-row flex-wrap gap-3">
            {/* Build Profile */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              className="flex-1 min-w-[45%]"
            >
              <View 
                className="p-4 rounded-xl items-center"
                style={{ backgroundColor: '#f2d492' }}
              >
                <User size={32} color="#202c39" strokeWidth={2} />
                <Text style={{ color: '#202c39', fontWeight: 'bold', fontSize: 14, marginTop: 8 }}>
                  Build Profile
                </Text>
              </View>
            </TouchableOpacity>

            {/* Find Matches */}
            <TouchableOpacity
              onPress={() => router.push('/job-matches')}
              className="flex-1 min-w-[45%]"
            >
              <View 
                className="p-4 rounded-xl items-center"
                style={{ backgroundColor: '#f2d492' }}
              >
                <Target size={32} color="#202c39" strokeWidth={2} />
                <Text style={{ color: '#202c39', fontWeight: 'bold', fontSize: 14, marginTop: 8 }}>
                  Find Matches
                </Text>
              </View>
            </TouchableOpacity>

            {/* Jobs Available */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/jobs')}
              className="flex-1 min-w-[45%]"
            >
              <View 
                className="p-4 rounded-xl items-center"
                style={{ backgroundColor: '#f2d492' }}
              >
                <Briefcase size={28} color="#202c39" strokeWidth={2} />
                <Text style={{ color: '#202c39', fontWeight: 'bold', fontSize: 28, marginBottom: 4 }}>
                  {stats.jobsAvailable}
                </Text>
                <Text style={{ color: '#202c39', fontWeight: '600', fontSize: 12 }}>
                  Jobs Available
                </Text>
              </View>
            </TouchableOpacity>

            {/* Saved Jobs */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/applications')}
              className="flex-1 min-w-[45%]"
            >
              <View 
                className="p-4 rounded-xl items-center"
                style={{ backgroundColor: '#f2d492' }}
              >
                <Bookmark size={28} color="#202c39" strokeWidth={2} />
                <Text style={{ color: '#202c39', fontWeight: 'bold', fontSize: 28, marginBottom: 4 }}>
                  {stats.savedJobs}
                </Text>
                <Text style={{ color: '#202c39', fontWeight: '600', fontSize: 12 }}>
                  Saved Jobs
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Matches Section */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Sparkles size={20} color={colors.accent} />
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
                Your Top Matches ({stats.topMatches})
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/job-matches')}>
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {matchError && (
            <View className="py-4">
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                Unable to load matches. Pull to refresh.
              </Text>
            </View>
          )}

          {topMatches.length === 0 && !matchError && (
            <View className="py-8 items-center">
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
                No matches found yet.
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                Complete your profile to get better matches!
              </Text>
            </View>
          )}

          {topMatches.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => router.push(`/job-details?jobId=${job.id}&curated=true`)}
              className="mb-3"
            >
              <View 
                className="p-4 rounded-xl"
                style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                      {job.title}
                    </Text>
                    <Text style={{ color: colors.accent, fontSize: 13, marginBottom: 4 }}>
                      {job.company}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                      📍 {job.location}
                    </Text>
                  </View>

                  {/* Match Score Badge */}
                  <View 
                    className="px-3 py-2 rounded-lg"
                    style={{ backgroundColor: getMatchColor(job.matchScore) + '20' }}
                  >
                    <Text 
                      className="font-bold text-sm"
                      style={{ color: getMatchColor(job.matchScore) }}
                    >
                      {job.matchScore}%
                    </Text>
                    <Text 
                      className="text-xs font-medium"
                      style={{ color: getMatchColor(job.matchScore) }}
                    >
                      {getMatchLabel(job.matchScore)}
                    </Text>
                  </View>
                </View>

                <View 
                  className="flex-row items-center justify-between pt-3"
                  style={{ borderTopWidth: 1, borderTopColor: colors.cardBorder }}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    💰 {job.salary}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sage }} />
                    <Text style={{ color: colors.sage, fontSize: 10, textTransform: 'uppercase' }}>
                      {job.collarType}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Jobs Section */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <TrendingUp size={20} color={colors.accent} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
              Popular Jobs in Zambia
            </Text>
          </View>

          {popularJobs.map((job) => (
            <TouchableOpacity key={job.id} className="mb-2">
              <View 
                className="p-4 rounded-xl flex-row justify-between items-center"
                style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}
              >
                <View className="flex-1">
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15, marginBottom: 4 }}>
                    {job.title}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    📍 {job.location}
                  </Text>
                </View>
                <View 
                  className="px-3 py-2 rounded-lg"
                  style={{ backgroundColor: colors.accent + '20' }}
                >
                  <Text style={{ color: colors.accent, fontSize: 11, fontWeight: 'bold' }}>
                    {job.applications}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                    applicants
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Career Coach Section */}
        {coachTips.length > 0 && (
          <View className="px-5 mb-8">
            <View className="flex-row items-center gap-2 mb-3">
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
                Career Coach
              </Text>
              <Text className="text-2xl">🎯</Text>
            </View>

            {coachTips.map((tip) => {
              const IconComponent = tip.icon;
              return (
                <View key={tip.id} className="mb-3">
                  <View 
                    className="p-4 rounded-xl flex-row"
                    style={{ backgroundColor: colors.sage }}
                  >
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: colors.background }}
                    >
                      <IconComponent size={24} color={colors.accent} strokeWidth={2} />
                    </View>
                    
                    <View className="flex-1">
                      <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                        {tip.title}
                      </Text>
                      <Text style={{ color: colors.background, fontSize: 13, marginBottom: 12, opacity: 0.9 }}>
                        {tip.description}
                      </Text>
                      
                      <TouchableOpacity 
                        className="self-start"
                        onPress={() => router.push('/(tabs)/profile')}
                      >
                        <View 
                          className="px-4 py-2 rounded-lg"
                          style={{ backgroundColor: colors.background }}
                        >
                          <Text style={{ color: colors.sage, fontWeight: 'bold', fontSize: 13 }}>
                            {tip.action}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
