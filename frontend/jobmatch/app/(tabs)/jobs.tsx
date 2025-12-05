import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import JobAnalytics from '@/components/JobAnalytics';
import { 
  Sparkles, 
  Briefcase, 
  Cpu, 
  Sprout, 
  GraduationCap, 
  Heart, 
  Building2,
  Hammer,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { matchingService } from '@/services/match.service';
import { jobsService } from '@/services/jobs.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 16;

export default function JobsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  // Fetch top AI matches for carousel
  const { 
    data: matchesData, 
    isLoading: matchesLoading, 
    refetch: refetchMatches 
  } = useQuery({
    queryKey: ['topMatches'],
    queryFn: () => matchingService.getAIMatchedJobs(5, 'corporate'),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all jobs for browsing
  const { 
    data: jobsData, 
    isLoading: jobsLoading, 
    refetch: refetchJobs 
  } = useQuery({
    queryKey: ['allJobs', selectedCategory],
    queryFn: async () => {
      if (selectedCategory === 'All') {
        return await jobsService.getAllJobs({ limit: 50 });
      } else {
        // Get jobs by category
        const [corporate, personal] = await Promise.all([
          jobsService.getCorporateJobs({ category: selectedCategory, limit: 25 }),
          jobsService.getPersonalJobs({ category: selectedCategory, limit: 25 }),
        ]);
        
        return {
          corporate_jobs: corporate.map(job => ({
            job_id: job.job_id,
            type: 'corporate',
            title: job.title,
            company: job.company,
            category: job.category,
            location: `${job.location_city || ''}, ${job.location_province || ''}`.trim().replace(/, $/, ''),
            salary_range: job.salary_min_zmw ? `ZMW ${job.salary_min_zmw?.toLocaleString()} - ${job.salary_max_zmw?.toLocaleString()}` : null,
            posted_date: job.posted_date,
          })),
          personal_jobs: personal.map(job => ({
            job_id: job.job_id,
            type: 'personal',
            title: job.title,
            category: job.category,
            location: job.location,
            budget: job.budget ? `ZMW ${job.budget}` : null,
            payment_type: job.payment_type,
            posted_date: job.posted_date,
          })),
          total: corporate.length + personal.length,
        };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch job categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ['jobCategories'],
    queryFn: () => jobsService.getCategories(),
    staleTime: 30 * 60 * 1000,
  });

  // Safely handle categories - ensure it's always an array
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];

  const isLoading = matchesLoading || jobsLoading;
  const topMatches = matchesData?.matches || [];
  
  // Safely construct allJobs array with proper type checking
  const allJobs = jobsData ? [
    ...(Array.isArray(jobsData.corporate_jobs) ? jobsData.corporate_jobs : []),
    ...(Array.isArray(jobsData.personal_jobs) ? jobsData.personal_jobs : []),
  ] : [];
  
  // Pagination logic
  const totalPages = Math.ceil(allJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = allJobs.slice(startIndex, endIndex);
  
  // Reset to page 1 when category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Category icons mapping
  const categoryIcons: Record<string, any> = {
    'All': Briefcase,
    'Technology': Cpu,
    'Agriculture': Sprout,
    'Education': GraduationCap,
    'Healthcare': Heart,
    'Business': Building2,
    'Construction': Hammer,
    'Finance': TrendingUp,
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || Briefcase;
  };

  // Get job icon emoji
  const getJobIcon = (category: string, jobType?: string) => {
    const icons: Record<string, string> = {
      'Technology': '💻',
      'Marketing': '📱',
      'Agriculture': '🌾',
      'Education': '📚',
      'Healthcare': '🏥',
      'Business': '💼',
      'Construction': '🏗️',
      'Finance': '💰',
      'Driver': '🚗',
      'Chef': '👨‍🍳',
      'Housekeeper': '🧹',
    };
    return icons[category] || '💼';
  };

  // Pull to refresh
  const onRefresh = () => {
    refetchMatches();
    refetchJobs();
  };

  // Mock analytics data (TODO: Replace with real API)
  const analyticsData = {
    marketSnapshot: {
      topSectors: [
        { name: 'Technology', growth: 22, jobs: 156 },
        { name: 'Healthcare', growth: 18, jobs: 134 },
        { name: 'Finance', growth: 15, jobs: 98 },
      ],
      avgSalary: [
        { category: 'Tech', salary: 'K18k' },
        { category: 'Finance', salary: 'K16k' },
        { category: 'Health', salary: 'K12k' },
      ],
      overallGrowth: 18,
    },
    personalInsights: {
      skillsMatch: 85,
      trendingRoles: ['Software Engineer', 'Data Analyst', 'Product Manager'],
      savedJobs: 5,
      appliedJobs: 3,
    },
    locationInsights: {
      topCities: [
        { name: 'Lusaka', jobs: 245, trend: 'up' as const },
        { name: 'Ndola', jobs: 89, trend: 'up' as const },
        { name: 'Kitwe', jobs: 67, trend: 'stable' as const },
      ],
    },
    aiExplanation: {
      primarySkills: ['JavaScript', 'React', 'Python'],
      secondarySkills: ['Project Management', 'Data Analysis'],
    },
  };

  const renderCarouselItem = ({ item }: { item: any }) => {
    const job = item.job;
    
    return (
      <TouchableOpacity
        style={{
          width: CARD_WIDTH,
          marginHorizontal: CARD_SPACING / 2,
        }}
        onPress={() => {
          router.push({
            pathname: '/job-details',
            params: { 
              id: job.job_id || job.id,
              curated: 'true',
            },
          });
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            borderWidth: 2,
            borderColor: colors.accent,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* Match Badge */}
          <View style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: item.match_score >= 85 ? '#10B981' : item.match_score >= 70 ? '#F59E0B' : '#9CA3AF',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              {Math.round(item.match_score)}% Match
            </Text>
          </View>

          {/* Icon */}
          <Text style={{ fontSize: 48, marginBottom: 12 }}>
            {getJobIcon(job.category)}
          </Text>

          {/* Job Title */}
          <Text style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 8,
          }}>
            {job.title}
          </Text>

          {/* Company */}
          <Text style={{
            color: colors.accent,
            fontSize: 15,
            fontWeight: '600',
            marginBottom: 12,
          }}>
            {job.company || job.posted_by || 'Various Companies'}
          </Text>

          {/* Location & Type */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              📍 {job.location_city || job.location || 'Lusaka'}
            </Text>
            {job.employment_type && (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                • {job.employment_type}
              </Text>
            )}
          </View>

          {/* Salary/Budget */}
          {(job.salary_min_zmw || job.budget) && (
            <View style={{
              backgroundColor: colors.actionBox,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              alignSelf: 'flex-start',
            }}>
              <Text style={{
                color: colors.actionText,
                fontSize: 14,
                fontWeight: 'bold',
              }}>
                💰 {job.salary_min_zmw 
                  ? `ZMW ${job.salary_min_zmw.toLocaleString()} - ${job.salary_max_zmw?.toLocaleString()}`
                  : `ZMW ${job.budget?.toLocaleString()}`
                }
              </Text>
            </View>
          )}

          {/* Collar Type Badge */}
          {job.collar_type && (
            <View style={{
              backgroundColor: colors.accent + '20',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              alignSelf: 'flex-start',
              marginTop: 12,
            }}>
              <Text style={{
                color: colors.accent,
                fontSize: 11,
                fontWeight: 'bold',
              }}>
                {job.collar_type} Collar
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Build category list with 'All' first - ensure categories is an array
  const categoryList = ['All', ...categories].map(cat => ({
    id: cat,
    name: cat,
    icon: getCategoryIcon(cat),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={24} color={colors.accent} strokeWidth={2.5} />
            <Text style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
            }}>
              I've created these for you...
            </Text>
          </View>
          <Text style={{
            color: colors.textMuted,
            fontSize: 13,
          }}>
            Swipe to explore your top {topMatches.length} matches
          </Text>
        </View>

        {/* Carousel */}
        {matchesLoading ? (
          <View style={{ height: 280, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.textMuted, marginTop: 12 }}>Finding your matches...</Text>
          </View>
        ) : topMatches.length > 0 ? (
          <FlatList
            data={topMatches}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.job.job_id || item.job.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
              paddingBottom: 20,
            }}
          />
        ) : (
          <View style={{ 
            paddingHorizontal: 24, 
            paddingVertical: 40,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
              No matches yet
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
              Complete your profile to get personalized job matches
            </Text>
          </View>
        )}

        {/* Match Me Now Button */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={() => router.push('/job-matches')}
          >
            <Sparkles size={20} color="white" strokeWidth={2.5} />
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
            }}>
              Match Me Now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Section */}
        <JobAnalytics 
          data={analyticsData} 
          colors={colors}
          onViewMore={() => console.log('View analytics')}
        />

        {/* Jobs Section Header */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 4,
          }}>
            Jobs on the Market
          </Text>
          <Text style={{
            color: colors.textMuted,
            fontSize: 13,
          }}>
            {allJobs.length} positions available{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </Text>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 12,
            paddingBottom: 20,
          }}
        >
          {categoryList.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={{
                  backgroundColor: isSelected ? colors.actionBox : colors.card,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  borderWidth: 1.5,
                  borderColor: isSelected ? colors.actionText : colors.cardBorder,
                }}
              >
                <IconComponent
                  size={18}
                  color={isSelected ? colors.actionText : colors.textMuted}
                  strokeWidth={2.5}
                />
                <Text style={{
                  color: isSelected ? colors.actionText : colors.textMuted,
                  fontSize: 14,
                  fontWeight: isSelected ? 'bold' : '600',
                }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Job List */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          {jobsLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={{ color: colors.textMuted, marginTop: 12 }}>Loading jobs...</Text>
            </View>
          ) : currentJobs.length > 0 ? (
            <>
              {currentJobs.map((job: any) => (
                <TouchableOpacity
                  key={job.job_id}
                  style={{ marginBottom: 16 }}
                  onPress={() => {
                    router.push({
                      pathname: '/job-details',
                      params: { 
                        id: job.job_id,
                        curated: 'false',
                      },
                    });
                  }}
                >
                  <View style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1.5,
                    borderColor: colors.cardBorder,
                    flexDirection: 'row',
                  }}>
                    {/* Icon */}
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: colors.actionBox,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}>
                      <Text style={{ fontSize: 28 }}>{getJobIcon(job.category)}</Text>
                    </View>

                    {/* Job Details */}
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginBottom: 4,
                      }}>
                        {job.title}
                      </Text>

                      {/* Job Type Badge */}
                      <View style={{
                        backgroundColor: job.type === 'corporate' ? colors.accent + '20' : '#10B981' + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        alignSelf: 'flex-start',
                        marginBottom: 8,
                      }}>
                        <Text style={{
                          color: job.type === 'corporate' ? colors.accent : '#10B981',
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}>
                          {job.type === 'corporate' ? 'Professional' : 'Gig/Personal'}
                        </Text>
                      </View>

                      <Text style={{
                        color: colors.textMuted,
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        {job.company || job.posted_by || 'Multiple Employers'}
                      </Text>

                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}>
                        <Text style={{
                          color: colors.accent,
                          fontSize: 13,
                          fontWeight: 'bold',
                        }}>
                          {job.salary_range || job.budget || 'Negotiable'}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>•</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          📍 {job.location}
                        </Text>
                      </View>
                    </View>

                    {/* Arrow */}
                    <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View style={{ marginTop: 24, gap: 16 }}>
                  {/* Page Indicator */}
                  <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                    Page {currentPage} of {totalPages} • Showing {currentJobs.length} of {allJobs.length} jobs
                  </Text>
                  
                  {/* Navigation Buttons */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: currentPage === 1 ? colors.card : colors.accent,
                        paddingVertical: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: currentPage === 1 ? colors.cardBorder : colors.accent,
                        opacity: currentPage === 1 ? 0.5 : 1,
                      }}
                      onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <Text style={{
                        color: currentPage === 1 ? colors.textMuted : 'white',
                        fontSize: 15,
                        fontWeight: 'bold',
                      }}>
                        ← Previous
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: currentPage === totalPages ? colors.card : colors.accent,
                        paddingVertical: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: currentPage === totalPages ? colors.cardBorder : colors.accent,
                        opacity: currentPage === totalPages ? 0.5 : 1,
                      }}
                      onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <Text style={{
                        color: currentPage === totalPages ? colors.textMuted : 'white',
                        fontSize: 15,
                        fontWeight: 'bold',
                      }}>
                        Next →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : allJobs.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
                No jobs found
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                {selectedCategory !== 'All' 
                  ? `No jobs available in ${selectedCategory} category`
                  : 'Check back later for new opportunities'
                }
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
