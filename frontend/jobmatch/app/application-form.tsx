import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Briefcase,
  Building2,
  MapPin,
  FileText,
  User,
} from 'lucide-react-native';
import { useApplyToJob, useCandidateProfile, useMyApplications } from '@/hooks/useCandidate';

export default function ApplicationFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);

  // Get job details from params
  const jobId = params.jobId as string;
  const jobTitle = params.jobTitle as string;
  const company = params.company as string;
  const jobType = params.jobType as string;

  // State
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Queries and mutations
  const { data: profile } = useCandidateProfile();
  const { data: applications } = useMyApplications();
  const applyMutation = useApplyToJob();

  // Check if already applied
  const hasAlreadyApplied = applications?.some(app => app.job_id === jobId);

  const handleSubmit = async () => {
    if (hasAlreadyApplied) {
      Alert.alert(
        'Already Applied',
        'You have already applied to this job.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    // Validate
    if (!profile?.full_name) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile before applying to jobs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit application
      await applyMutation.mutateAsync({
        jobId: parseInt(jobId) || 0,
        coverLetter: coverLetter.trim() || undefined,
      });

      // Show success
      setShowSuccess(true);

      // Navigate back after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error('Application error:', error);
      
      // Handle "already applied" error
      if (error.response?.status === 400 && 
          error.response?.data?.detail?.includes('already applied')) {
        Alert.alert(
          'Already Applied',
          'You have already applied to this job.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Application Failed',
          error.response?.data?.detail || 'Failed to submit application. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#10B981',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <CheckCircle2 size={48} color="white" strokeWidth={2.5} />
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          Application Submitted!
        </Text>

        <Text
          style={{
            color: colors.textMuted,
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          Your application has been sent successfully. The employer will review
          it and get back to you soon.
        </Text>

        <View
          style={{
            marginTop: 32,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: colors.actionBox,
          }}
        >
          <Text
            style={{
              color: colors.actionText,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            Returning to job details...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 16,
          backgroundColor: colors.background,
          borderBottomWidth: 1.5,
          borderBottomColor: colors.cardBorder,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: colors.cardBorder,
          }}
          disabled={isSubmitting}
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          Apply for Job
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Job Preview Card */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            You're applying for
          </Text>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.actionBox,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Briefcase size={24} color={colors.accent} strokeWidth={2} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {jobTitle}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Building2 size={14} color={colors.textMuted} strokeWidth={2} />
                  <Text
                    style={{
                      color: colors.accent,
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    {company}
                  </Text>
                </View>

                <View
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: colors.actionBox,
                  }}
                >
                  <Text
                    style={{
                      color: colors.actionText,
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    {jobType === 'corporate' ? 'Corporate Job' : 'Personal Job'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Applicant Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Your Information
          </Text>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
              gap: 16,
            }}
          >
            {/* Name */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <User size={20} color={colors.textMuted} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  Full Name
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {profile?.full_name || 'Not provided'}
                </Text>
              </View>
            </View>

            {/* Email */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <FileText size={20} color={colors.textMuted} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  Email Address
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {profile?.email || 'Not provided'}
                </Text>
              </View>
            </View>

            {/* Location */}
            {profile?.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MapPin size={20} color={colors.textMuted} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 12,
                      marginBottom: 2,
                    }}
                  >
                    Location
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    {profile.location}
                  </Text>
                </View>
              </View>
            )}

            {/* Profile Strength */}
            {profile?.profile_strength !== undefined && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 12,
                    }}
                  >
                    Profile Strength
                  </Text>
                  <Text
                    style={{
                      color: colors.accent,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {profile.profile_strength}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.cardBorder,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${profile.profile_strength}%`,
                      height: '100%',
                      backgroundColor: colors.accent,
                    }}
                  />
                </View>
              </View>
            )}

            {/* Edit Profile Link */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              style={{
                marginTop: 8,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                Edit Profile →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cover Letter */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Cover Letter (Optional)
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              marginBottom: 12,
              lineHeight: 18,
            }}
          >
            Tell the employer why you're a great fit for this position
          </Text>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
              padding: 16,
            }}
          >
            <TextInput
              style={{
                color: colors.text,
                fontSize: 15,
                lineHeight: 22,
                minHeight: 180,
                textAlignVertical: 'top',
              }}
              placeholder="I am writing to express my interest in this position..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={10}
              value={coverLetter}
              onChangeText={setCoverLetter}
              maxLength={1000}
              editable={!isSubmitting}
            />

            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                textAlign: 'right',
                marginTop: 8,
              }}
            >
              {coverLetter.length}/1000
            </Text>
          </View>
        </View>

        {/* Information Notice */}
        <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 32 }}>
          <View
            style={{
              backgroundColor: colors.actionBox,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: colors.actionText,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              💡 <Text style={{ fontWeight: '600' }}>Tip:</Text> Your profile information
              and cover letter will be sent to the employer. Make sure your profile is
              complete for the best chance of success!
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Submit Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          borderTopWidth: 1.5,
          borderTopColor: colors.cardBorder,
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || hasAlreadyApplied}
          style={{
            backgroundColor: hasAlreadyApplied
              ? colors.textMuted
              : isSubmitting
              ? colors.textMuted
              : colors.accent,
            paddingVertical: 18,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            opacity: isSubmitting || hasAlreadyApplied ? 0.6 : 1,
          }}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="white" />
              <Text
                style={{
                  color: 'white',
                  fontSize: 17,
                  fontWeight: 'bold',
                }}
              >
                Submitting...
              </Text>
            </>
          ) : hasAlreadyApplied ? (
            <>
              <CheckCircle2 size={22} color="white" strokeWidth={2.5} />
              <Text
                style={{
                  color: 'white',
                  fontSize: 17,
                  fontWeight: 'bold',
                }}
              >
                Already Applied
              </Text>
            </>
          ) : (
            <>
              <Send size={22} color="white" strokeWidth={2.5} />
              <Text
                style={{
                  color: 'white',
                  fontSize: 17,
                  fontWeight: 'bold',
                }}
              >
                Submit Application
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
