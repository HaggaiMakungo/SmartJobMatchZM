/**
 * Applications Screen
 * Shows user's applied jobs and saved jobs in tabs
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMyApplications, useSavedJobs, useWithdrawApplication, useUnsaveJob } from '@/hooks/useCandidate';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';

type TabType = 'applied' | 'saved';

interface ApplicationItem {
  id: number;
  job_id: string;
  status: string;
  applied_at: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
    category: string;
    employment_type?: string;
    salary_range?: string;
    job_type: 'corporate' | 'personal';
  };
}

interface SavedJobItem {
  id: number;
  job_id: string;
  saved_at: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
    category: string;
    employment_type?: string;
    salary_range?: string;
    posted_date?: string;
    job_type: 'corporate' | 'personal';
  };
}

export default function ApplicationsScreen() {
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);
  const [activeTab, setActiveTab] = useState<TabType>('applied');

  // Fetch data
  const { 
    data: applications = [], 
    isLoading: isLoadingApplications, 
    refetch: refetchApplications 
  } = useMyApplications();
  
  const { 
    data: savedJobs = [], 
    isLoading: isLoadingSavedJobs, 
    refetch: refetchSavedJobs 
  } = useSavedJobs();

  // Mutations
  const withdrawMutation = useWithdrawApplication();
  const unsaveMutation = useUnsaveJob();

  const isLoading = activeTab === 'applied' ? isLoadingApplications : isLoadingSavedJobs;

  const handleRefresh = () => {
    if (activeTab === 'applied') {
      refetchApplications();
    } else {
      refetchSavedJobs();
    }
  };

  const handleViewJob = (jobId: string) => {
    router.push({
      pathname: '/job-details',
      params: { jobId }
    });
  };

  const handleWithdraw = (application: ApplicationItem) => {
    Alert.alert(
      'Withdraw Application',
      `Are you sure you want to withdraw your application for ${application.job?.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawMutation.mutateAsync(application.id);
              Alert.alert('Success', 'Application withdrawn successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to withdraw application');
            }
          },
        },
      ]
    );
  };

  const handleUnsave = async (savedJob: SavedJobItem) => {
    try {
      await unsaveMutation.mutateAsync(savedJob.job_id);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove saved job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return colors.warning;
      case 'reviewing':
        return '#2196F3';
      case 'interview':
        return '#9C27B0';
      case 'offered':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'reviewing':
        return 'eye-outline';
      case 'interview':
        return 'people-outline';
      case 'offered':
        return 'checkmark-circle-outline';
      case 'rejected':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'Technology': 'laptop-outline',
      'Healthcare': 'medical-outline',
      'Education': 'school-outline',
      'Finance': 'cash-outline',
      'Retail': 'cart-outline',
      'Construction': 'hammer-outline',
      'Agriculture': 'leaf-outline',
      'Transportation': 'car-outline',
      'Hospitality': 'restaurant-outline',
      'Other': 'briefcase-outline',
    };
    return iconMap[category] || 'briefcase-outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const renderApplicationCard = (application: ApplicationItem) => {
    if (!application.job) return null;

    return (
      <TouchableOpacity
        key={application.id}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
        }}
        onPress={() => handleViewJob(application.job_id)}
        activeOpacity={0.7}
      >
        {/* Job Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.actionBox,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons
              name={getCategoryIcon(application.job.category)}
              size={24}
              color={colors.actionText}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16, marginBottom: 4 }} numberOfLines={1}>
              {application.job.title}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 14 }} numberOfLines={1}>
              {application.job.company}
            </Text>
          </View>
          <View style={{ backgroundColor: getStatusColor(application.status) + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons
              name={getStatusIcon(application.status)}
              size={14}
              color={getStatusColor(application.status)}
            />
            <Text style={{ color: getStatusColor(application.status), fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
              {application.status}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={{ marginBottom: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              {application.job.location}
            </Text>
          </View>
          
          {application.job.salary_range && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cash-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                {application.job.salary_range}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Applied {formatDate(application.applied_at)}
          </Text>
          <TouchableOpacity
            style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: colors.error }}
            onPress={() => handleWithdraw(application)}
          >
            <Text style={{ color: colors.error, fontSize: 14, fontWeight: '600' }}>
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSavedJobCard = (savedJob: SavedJobItem) => {
    if (!savedJob.job) return null;

    return (
      <TouchableOpacity
        key={savedJob.id}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
        }}
        onPress={() => handleViewJob(savedJob.job_id)}
        activeOpacity={0.7}
      >
        {/* Job Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.actionBox,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons
              name={getCategoryIcon(savedJob.job.category)}
              size={24}
              color={colors.actionText}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16, marginBottom: 4 }} numberOfLines={1}>
              {savedJob.job.title}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 14 }} numberOfLines={1}>
              {savedJob.job.company}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleUnsave(savedJob)}>
            <Ionicons name="heart" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={{ marginBottom: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              {savedJob.job.location}
            </Text>
          </View>
          
          {savedJob.job.employment_type && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                {savedJob.job.employment_type}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Saved {formatDate(savedJob.saved_at)}
          </Text>
          <View style={{ backgroundColor: colors.accent + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>
              {savedJob.job.job_type === 'corporate' ? 'Corporate' : 'Personal'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const isAppliedTab = activeTab === 'applied';
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32 }}>
        <Ionicons
          name={isAppliedTab ? 'document-text-outline' : 'heart-outline'}
          size={80}
          color={colors.textMuted}
        />
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
          {isAppliedTab ? 'No Applications Yet' : 'No Saved Jobs'}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
          {isAppliedTab
            ? 'Start applying to jobs to see them here'
            : 'Save jobs you like to view them later'}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          onPress={() => router.push('/(tabs)/jobs')}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Browse Jobs</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600' }}>My Applications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            gap: 8,
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'applied' ? colors.accent : 'transparent',
          }}
          onPress={() => setActiveTab('applied')}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={activeTab === 'applied' ? colors.accent : colors.textMuted}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: activeTab === 'applied' ? colors.accent : colors.textMuted,
            }}
          >
            Applied ({applications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            gap: 8,
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'saved' ? colors.accent : 'transparent',
          }}
          onPress={() => setActiveTab('saved')}
        >
          <Ionicons
            name="heart-outline"
            size={20}
            color={activeTab === 'saved' ? colors.accent : colors.textMuted}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: activeTab === 'saved' ? colors.accent : colors.textMuted,
            }}
          >
            Saved ({savedJobs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {isLoading ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 16 }}>
              Loading...
            </Text>
          </View>
        ) : activeTab === 'applied' ? (
          applications.length === 0 ? (
            renderEmptyState()
          ) : (
            applications.map(renderApplicationCard)
          )
        ) : savedJobs.length === 0 ? (
          renderEmptyState()
        ) : (
          savedJobs.map(renderSavedJobCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
