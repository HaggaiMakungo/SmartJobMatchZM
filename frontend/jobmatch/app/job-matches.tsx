import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import { useQuery } from '@tanstack/react-query';
import { mlMatchService } from '@/services/match.service';
import { ArrowLeft, Sparkles, ChevronRight, Briefcase, Zap } from 'lucide-react-native';
import { useCvId } from '@/hooks/useMatching';

export default function JobMatchesScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);
  const cvId = useCvId();
  
  // Simplified state - removed ranking method toggle
  const [itemsPerPage, setItemsPerPage] = useState<5 | 10 | 20>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [minScore, setMinScore] = useState(0); // Minimum match score filter (0-100)
  const [jobType, setJobType] = useState<'all' | 'corporate' | 'small'>('all');
  const [showSalaryMatchOnly, setShowSalaryMatchOnly] = useState(false); // NEW: Salary filter

  // Always use hybrid matching (best performance)
  const {
    data: matchData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['hybrid-matches', cvId, jobType],
    queryFn: () => mlMatchService.getHybridMatches(
      cvId!, 
      100, // Fetch more, filter client-side
      jobType === 'all' ? undefined : jobType
    ),
    enabled: !!cvId,
    staleTime: 5 * 60 * 1000,
  });

  const allMatches = matchData?.matches || [];
  
  // Filter by minimum score (convert 0-100 to 0-1 for comparison)
  let filteredMatches = allMatches.filter(match => {
    const scoreToUse = match.hybrid_score || match.rule_score;
    return scoreToUse * 100 >= minScore;
  });

  // NEW: Filter by salary match if enabled
  if (showSalaryMatchOnly) {
    filteredMatches = filteredMatches.filter(match => {
      // Salary match is "good" if salary_score >= 0.7 (70%)
      return match.sub_scores?.salary >= 0.7;
    });
  }
  
  // Calculate pagination
  const totalItems = filteredMatches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMatches = filteredMatches.slice(startIndex, endIndex);

  // Statistics
  const stats = mlMatchService.getMLMatchStats(filteredMatches);

  const getMatchColor = (score: number) => {
    if (score >= 0.85) return '#10B981';
    if (score >= 0.70) return '#F59E0B';
    return '#9CA3AF';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.70) return 'Good';
    return 'Fair';
  };

  const getJobIcon = (category: string) => {
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

  const onRefresh = async () => {
    await refetch();
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Custom Header */}
        <View style={{
          backgroundColor: colors.actionText,
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <ArrowLeft size={20} color={colors.actionText} strokeWidth={2.5} />
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Sparkles size={24} color={colors.background} strokeWidth={2.5} />
                <Text style={{
                  color: colors.background,
                  fontSize: 24,
                  fontWeight: 'bold',
                }}>
                  Your Best Matches
                </Text>
              </View>
              <Text style={{
                color: colors.background,
                fontSize: 14,
                opacity: 0.8,
                marginTop: 4,
              }}>
                {totalItems} jobs tailored for you
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
          }}>
            <View style={{
              flex: 1,
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 12,
            }}>
              <Text style={{ color: '#10B981', fontSize: 20, fontWeight: 'bold' }}>
                {stats.byQuality.excellent}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                Excellent
              </Text>
            </View>
            
            <View style={{
              flex: 1,
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 12,
            }}>
              <Text style={{ color: '#F59E0B', fontSize: 20, fontWeight: 'bold' }}>
                {stats.byQuality.good}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                Good
              </Text>
            </View>
            
            <View style={{
              flex: 1,
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 12,
            }}>
              <Text style={{ color: colors.accent, fontSize: 20, fontWeight: 'bold' }}>
                {stats.averageHybridScore}%
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                Avg Match
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          {/* Filters */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
            {/* Job Type Filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8,
              }}>
                Job Type
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['all', 'corporate', 'small'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setJobType(type as 'all' | 'corporate' | 'small');
                      setCurrentPage(1);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: jobType === type ? colors.actionBox : colors.card,
                      borderWidth: 1.5,
                      borderColor: jobType === type ? colors.actionText : colors.cardBorder,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: jobType === type ? colors.actionText : colors.textMuted,
                      fontWeight: '600',
                      fontSize: 13,
                    }}>
                      {type === 'all' ? 'All Jobs' : type === 'corporate' ? 'Professional' : 'Gig Economy'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Items per page selector */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8,
              }}>
                Jobs per page
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[5, 10, 20].map((count) => (
                  <TouchableOpacity
                    key={count}
                    onPress={() => {
                      setItemsPerPage(count as 5 | 10 | 20);
                      setCurrentPage(1);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: itemsPerPage === count ? colors.actionBox : colors.card,
                      borderWidth: 1.5,
                      borderColor: itemsPerPage === count ? colors.actionText : colors.cardBorder,
                    }}
                  >
                    <Text style={{
                      color: itemsPerPage === count ? colors.actionText : colors.textMuted,
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minimum score filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8,
              }}>
                Minimum match score
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {[0, 50, 70, 85].map((score) => (
                  <TouchableOpacity
                    key={score}
                    onPress={() => {
                      setMinScore(score);
                      setCurrentPage(1);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: minScore === score ? colors.actionBox : colors.card,
                      borderWidth: 1.5,
                      borderColor: minScore === score ? colors.actionText : colors.cardBorder,
                    }}
                  >
                    <Text style={{
                      color: minScore === score ? colors.actionText : colors.textMuted,
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      {score === 0 ? 'All' : `${score}%+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* NEW: Salary Match Filter */}
            <View style={{ marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowSalaryMatchOnly(!showSalaryMatchOnly);
                  setCurrentPage(1);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: showSalaryMatchOnly ? colors.actionBox : colors.card,
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: showSalaryMatchOnly ? colors.actionText : colors.cardBorder,
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: showSalaryMatchOnly ? colors.actionText : colors.cardBorder,
                  backgroundColor: showSalaryMatchOnly ? colors.actionText : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                  {showSalaryMatchOnly && (
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                  )}
                </View>
                <Text style={{
                  color: showSalaryMatchOnly ? colors.actionText : colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                  flex: 1,
                }}>
                  💰 Only show jobs matching my salary expectations
                </Text>
              </TouchableOpacity>
              <Text style={{
                color: colors.textMuted,
                fontSize: 12,
                marginTop: 6,
                marginLeft: 30,
              }}>
                Filter out jobs with significantly different salary ranges
              </Text>
            </View>

            {/* Pagination Info */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
              </Text>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                Page {currentPage} of {totalPages || 1}
              </Text>
            </View>
          </View>

          {/* Job List */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {isLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={{ color: colors.textMuted, marginTop: 12 }}>
                  Finding your best matches...
                </Text>
              </View>
            ) : error ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
                  Unable to load matches
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                  Check your connection and try again
                </Text>
                <TouchableOpacity
                  onPress={onRefresh}
                  style={{
                    backgroundColor: colors.accent,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : currentMatches.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
                  No matches found
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                  {minScore > 0 || showSalaryMatchOnly
                    ? `Try adjusting your filters to see more opportunities`
                    : `Complete your profile to get better matches`
                  }
                </Text>
              </View>
            ) : (
              <>
                {currentMatches.map((match, index) => {
                  const job = match.job;
                  const hybridScore = match.hybrid_score || match.rule_score;
                  const matchedSkillsCount = match.matched_skills?.length || 0;
                  const missingSkillsCount = match.missing_skills?.length || 0;
                  
                  return (
                    <TouchableOpacity
                      key={`${job.job_id}-${index}`}
                      style={{ marginBottom: 16 }}
                      onPress={() => {
                        router.push({
                          pathname: '/job-details',
                          params: {
                            id: job.job_id,
                            curated: 'true',
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
                        borderLeftWidth: 4,
                        borderLeftColor: getMatchColor(hybridScore),
                      }}>
                        {/* Match Score Badge with Hybrid indicator */}
                        <View style={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          flexDirection: 'row',
                          gap: 6,
                          alignItems: 'center',
                        }}>
                          <View style={{
                            backgroundColor: '#10B981' + '20',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <Zap size={12} color="#10B981" strokeWidth={2.5} />
                            <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>
                              AI
                            </Text>
                          </View>
                          <View style={{
                            backgroundColor: getMatchColor(hybridScore),
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                          }}>
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                              {Math.round(hybridScore * 100)}%
                            </Text>
                          </View>
                        </View>

                        {/* Job Icon & Title */}
                        <View style={{ flexDirection: 'row', marginBottom: 12, paddingRight: 90 }}>
                          <Text style={{ fontSize: 40, marginRight: 12 }}>
                            {getJobIcon(job.title)}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: colors.text,
                              fontSize: 16,
                              fontWeight: 'bold',
                              marginBottom: 4,
                            }}>
                              {job.title}
                            </Text>
                            <Text style={{
                              color: colors.accent,
                              fontSize: 14,
                              fontWeight: '600',
                            }}>
                              {job.company || 'Various Companies'}
                            </Text>
                          </View>
                        </View>

                        {/* Skills Preview */}
                        {(matchedSkillsCount > 0 || missingSkillsCount > 0) && (
                          <View style={{
                            flexDirection: 'row',
                            gap: 8,
                            marginBottom: 12,
                            flexWrap: 'wrap',
                          }}>
                            {matchedSkillsCount > 0 && (
                              <View style={{
                                backgroundColor: '#10B981' + '20',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                                <Text style={{ fontSize: 12 }}>✅</Text>
                                <Text style={{
                                  color: '#10B981',
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                }}>
                                  {matchedSkillsCount} skill{matchedSkillsCount !== 1 ? 's' : ''} matched
                                </Text>
                              </View>
                            )}
                            {missingSkillsCount > 0 && (
                              <View style={{
                                backgroundColor: colors.textMuted + '20',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                                <Text style={{ fontSize: 12 }}>⚠️</Text>
                                <Text style={{
                                  color: colors.textMuted,
                                  fontSize: 12,
                                  fontWeight: '600',
                                }}>
                                  {missingSkillsCount} skill{missingSkillsCount !== 1 ? 's' : ''} needed
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Job Details */}
                        <View style={{ gap: 6, marginBottom: 12 }}>
                          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                            📍 {job.location_city || 'Zambia'}
                          </Text>
                          {(job.salary_min_zmw || job.budget) && (
                            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                              💰 {job.salary_min_zmw 
                                ? `ZMW ${job.salary_min_zmw.toLocaleString()}${job.salary_max_zmw ? ` - ${job.salary_max_zmw.toLocaleString()}` : '+'}`
                                : `ZMW ${job.budget?.toLocaleString()}`
                              }
                            </Text>
                          )}
                        </View>

                        {/* Match Reasons (first 2) */}
                        {match.reasons && match.reasons.length > 0 && (
                          <View style={{
                            backgroundColor: colors.background,
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 12,
                          }}>
                            {match.reasons.slice(0, 2).map((reason, idx) => (
                              <Text
                                key={idx}
                                style={{
                                  color: colors.textMuted,
                                  fontSize: 12,
                                  lineHeight: 18,
                                  marginBottom: idx === 0 && match.reasons.length > 1 ? 4 : 0,
                                }}
                              >
                                • {reason}
                              </Text>
                            ))}
                          </View>
                        )}

                        {/* Badges */}
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                          <View style={{
                            backgroundColor: getMatchColor(hybridScore) + '20',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 8,
                          }}>
                            <Text style={{
                              color: getMatchColor(hybridScore),
                              fontSize: 11,
                              fontWeight: 'bold',
                            }}>
                              {getMatchLabel(hybridScore)} Match
                            </Text>
                          </View>

                          <View style={{
                            backgroundColor: job.job_type === 'corp' ? colors.actionBox : '#10B981' + '30',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 8,
                          }}>
                            <Text style={{
                              color: job.job_type === 'corp' ? colors.actionText : '#10B981',
                              fontSize: 11,
                              fontWeight: 'bold',
                            }}>
                              {job.job_type === 'corp' ? 'Professional' : 'Gig'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={{
              paddingHorizontal: 24,
              paddingBottom: 32,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}>
              <TouchableOpacity
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: currentPage === 1 ? colors.card : colors.actionBox,
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <Text style={{
                  color: currentPage === 1 ? colors.textMuted : colors.actionText,
                  fontWeight: '600',
                }}>
                  Previous
                </Text>
              </TouchableOpacity>

              {/* Page Numbers */}
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <TouchableOpacity
                    key={pageNum}
                    onPress={() => goToPage(pageNum)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: currentPage === pageNum ? colors.accent : colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{
                      color: currentPage === pageNum ? 'white' : colors.text,
                      fontWeight: currentPage === pageNum ? 'bold' : '600',
                    }}>
                      {pageNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: currentPage === totalPages ? colors.card : colors.actionBox,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <Text style={{
                  color: currentPage === totalPages ? colors.textMuted : colors.actionText,
                  fontWeight: '600',
                }}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
