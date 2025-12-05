import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  GraduationCap,
  Award,
  Building2,
  Mail,
  Phone,
  Globe,
  Sparkles,
  CheckCircle2,
  User,
} from 'lucide-react-native';
import { useJobById, useJobMatchScore, useTopMatches } from '@/hooks/useJobs';
import { useSaveJob, useUnsaveJob, useSavedJobs } from '@/hooks/useCandidate';
import { formatJobLocation, formatJobPayment, getJobTypeLabel } from '@/types/jobs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_SPACING = 12;

export default function JobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);
  // Fetch saved jobs to check if current job is saved
  const { data: savedJobs } = useSavedJobs();
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();
  
  const [isSaved, setIsSaved] = useState(false);
  
  // Check if job is saved
  useEffect(() => {
    if (savedJobs && jobId) {
      const saved = savedJobs.some(saved => saved.job_id === parseInt(jobId));
      setIsSaved(saved);
    }
  }, [savedJobs, jobId]);
  const carouselRef = useRef<FlatList>(null);

  // Check if this is a curated job (from top matches)
  const isCurated = params.curated === 'true';
  const jobId = params.id as string;

  // Fetch job details and match score from backend
  const { data: job, isLoading, isError } = useJobById(jobId);
  const { data: matchScore } = useJobMatchScore(jobId, !!job);
  const { data: similarMatches } = useTopMatches(5);

  // Filter out current job from similar jobs
  const similarJobs = similarMatches?.filter(
    (match) => match.job.job_id !== jobId
  ) || [];

  const handleSave = async () => {
    if (!jobId) return;
    
    try {
      if (isSaved) {
        // Unsave the job
        await unsaveJobMutation.mutateAsync(parseInt(jobId));
        setIsSaved(false);
      } else {
        // Save the job
        await saveJobMutation.mutateAsync(parseInt(jobId));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to save/unsave job:', error);
    }
  };

  const handleApply = () => {
    // Navigate to application form with job details
    router.push({
      pathname: '/application-form',
      params: {
        jobId: job.job_id || jobId,
        jobTitle: job.title,
        company: job.type === 'corporate' ? job.company : (job.posted_by || 'Personal Employer'),
        jobType: job.type,
      },
    });
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return '#10B981'; // Green
    if (score >= 70) return '#F59E0B'; // Amber
    return '#6B7280'; // Gray
  };

  // Get icon based on job category
  const getJobIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Technology': '💻',
      'Marketing': '📱',
      'Healthcare': '🏥',
      'Education': '📚',
      'Finance': '💰',
      'Construction': '🏗️',
      'Agriculture': '🌾',
      'Transportation': '🚗',
      'Hospitality': '🏨',
      'Retail': '🛍️',
    };
    return icons[category] || '💼';
  };

  const renderSimilarJobCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        width: CARD_WIDTH,
        marginHorizontal: CARD_SPACING / 2,
      }}
      onPress={() => {
        router.push({
          pathname: '/job-details',
          params: { id: item.job.job_id, curated: 'true' },
        });
      }}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
        }}
      >
        {/* Match Badge */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: getMatchScoreColor(item.match_score),
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
            {Math.round(item.match_score)}%
          </Text>
        </View>

        {/* Icon */}
        <Text style={{ fontSize: 40, marginBottom: 8 }}>
          {getJobIcon(item.job.category)}
        </Text>

        {/* Job Title */}
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {item.job.title}
        </Text>

        {/* Company/Posted By */}
        <Text
          style={{
            color: colors.accent,
            fontSize: 13,
            fontWeight: '600',
            marginBottom: 8,
          }}
        >
          {item.job.type === 'corporate' ? item.job.company : item.job.posted_by || 'Personal Employer'}
        </Text>

        {/* Location & Payment */}
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            📍 {formatJobLocation(item.job)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            💰 {formatJobPayment(item.job)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16 }}>Loading job details...</Text>
      </View>
    );
  }

  // Error state
  if (isError || !job) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
          Job Not Found
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>
          Sorry, we couldn't find this job. It may have been closed or removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: colors.accent,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Parse requirements and benefits from strings
  const parseList = (text: string | undefined): string[] => {
    if (!text) return [];
    // Split by newlines, bullets, or numbered lists
    return text
      .split(/[\n•\-\d+\.]/g)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  const requirements = job.type === 'corporate' 
    ? parseList(job.required_skills || job.required_education || job.description)
    : parseList(job.description);

  const benefits = job.type === 'corporate' && job.benefits
    ? parseList(job.benefits)
    : [];

  // Calculate days since posted
  const getDaysSincePosted = () => {
    if (!job.posted_date && !job.date_posted) return 'Recently';
    const postedDate = new Date(job.posted_date || job.date_posted || '');
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {isCurated ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color={colors.accent} strokeWidth={2.5} />
              <Text
                style={{
                  color: colors.accent,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                Curated specially for you by SmartMatch
              </Text>
            </View>
          ) : (
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 13,
                fontWeight: '500',
              }}
            >
              See what this opportunity has for you
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSave}
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
        >
          <Heart
            size={22}
            color={isSaved ? '#EF4444' : colors.text}
            fill={isSaved ? '#EF4444' : 'none'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Match Score Banner */}
        {matchScore && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View
              style={{
                backgroundColor: colors.actionBox,
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text
                  style={{
                    color: colors.actionText,
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                >
                  Your Match Score
                </Text>
                <Text
                  style={{
                    color: colors.actionText,
                    fontSize: 36,
                    fontWeight: 'bold',
                  }}
                >
                  {Math.round(matchScore.match_score)}%
                </Text>
              </View>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: getMatchScoreColor(matchScore.match_score),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={40} color="white" strokeWidth={2.5} />
              </View>
            </View>
          </View>
        )}

        {/* Job Icon & Title */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>
            {getJobIcon(job.category)}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 26,
              fontWeight: 'bold',
              marginBottom: 8,
            }}
          >
            {job.title}
          </Text>
          <Text
            style={{
              color: colors.accent,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16,
            }}
          >
            {job.type === 'corporate' ? job.company : (job.posted_by || 'Personal Employer')}
          </Text>

          {/* Job Meta Info */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color={colors.textMuted} strokeWidth={2} />
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {formatJobLocation(job)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color={colors.textMuted} strokeWidth={2} />
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {getJobTypeLabel(job)}
                {job.type === 'corporate' && job.work_schedule && ` • ${job.work_schedule}`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <DollarSign size={18} color={colors.textMuted} strokeWidth={2} />
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                {formatJobPayment(job)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color={colors.textMuted} strokeWidth={2} />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                Posted {getDaysSincePosted()}
              </Text>
            </View>
          </View>
        </View>

        {/* Job Description */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 12,
            }}
          >
            Job Description
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              lineHeight: 22,
              opacity: 0.9,
            }}
          >
            {job.description || 'No description available.'}
          </Text>

          {/* Additional details for corporate jobs */}
          {job.type === 'corporate' && job.key_responsibilities && (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}
              >
                Key Responsibilities
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  lineHeight: 22,
                  opacity: 0.9,
                }}
              >
                {job.key_responsibilities}
              </Text>
            </View>
          )}
        </View>

        {/* Requirements */}
        {requirements.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <GraduationCap size={20} color={colors.text} strokeWidth={2} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                Requirements
              </Text>
            </View>
            {requirements.slice(0, 6).map((req, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.accent,
                    marginTop: 8,
                  }}
                />
                <Text
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 14,
                    lineHeight: 22,
                    opacity: 0.9,
                  }}
                >
                  {req}
                </Text>
              </View>
            ))}

            {/* Show experience and education if available */}
            {job.type === 'corporate' && (
              <>
                {job.required_experience_years && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 8 }} />
                    <Text style={{ flex: 1, color: colors.text, fontSize: 14, lineHeight: 22, opacity: 0.9 }}>
                      {job.required_experience_years} years of experience required
                    </Text>
                  </View>
                )}
                {job.required_education && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 8 }} />
                    <Text style={{ flex: 1, color: colors.text, fontSize: 14, lineHeight: 22, opacity: 0.9 }}>
                      {job.required_education}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Award size={20} color={colors.text} strokeWidth={2} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                Benefits & Perks
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {benefits.map((benefit, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.actionBox,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: colors.actionText,
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Company Info for Corporate Jobs */}
        {job.type === 'corporate' && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Building2 size={20} color={colors.text} strokeWidth={2} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                About the Company
              </Text>
            </View>
            
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}
              >
                {job.company}
              </Text>
              {job.industry_sector && (
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {job.industry_sector}
                  {job.company_size && ` • ${job.company_size}`}
                </Text>
              )}
              {job.growth_opportunities && (
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    lineHeight: 22,
                    marginBottom: 16,
                    opacity: 0.9,
                  }}
                >
                  {job.growth_opportunities}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Employer Info for Personal Jobs */}
        {job.type === 'personal' && job.posted_by && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <User size={20} color={colors.text} strokeWidth={2} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                About the Employer
              </Text>
            </View>
            
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}
              >
                {job.posted_by}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                Personal Employer
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  lineHeight: 22,
                  opacity: 0.9,
                }}
              >
                This is a personal job posting. You can apply directly through the app.
              </Text>
            </View>
          </View>
        )}

        {/* Similar Jobs Section */}
        {similarJobs.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Similar Jobs You Might Like
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                Based on your profile and this job
              </Text>
            </View>

            <FlatList
              ref={carouselRef}
              data={similarJobs}
              renderItem={renderSimilarJobCard}
              keyExtractor={(item) => item.job.job_id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
            />
          </View>
        )}

        {/* Bottom Spacing for Apply Button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Apply Button */}
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
          onPress={handleApply}
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 17,
              fontWeight: 'bold',
            }}
          >
            Apply Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
