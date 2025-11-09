import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import {
  Plus,
  Briefcase,
  Users,
  MessageCircle,
  Clock,
  CheckCircle2,
  Eye,
  Star,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  Heart,
  Settings,
  LogOut,
} from 'lucide-react-native';

export default function PersonalEmployerHome() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);

  // Mock data for Mark Ziligone
  const employer = {
    name: 'Mark Ziligone',
    avatar: require('../../toph.png'), // Using relative path from app/(employer)
    location: 'Lusaka, Zambia',
  };

  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Good morning' : currentTime < 18 ? 'Good afternoon' : 'Good evening';

  // Mock active jobs
  const activeJobs = [
    {
      id: 1,
      title: 'Driver Needed',
      type: 'Part-time',
      location: 'Lusaka',
      salary: 'K2,500/month',
      applicants: 12,
      status: 'active',
      posted: '2 days ago',
      views: 45,
      icon: '🚗',
    },
    {
      id: 2,
      title: 'Wedding Caterer',
      type: 'One-time',
      location: 'Ndola',
      salary: 'K5,000',
      applicants: 8,
      status: 'reviewing',
      posted: '5 days ago',
      views: 32,
      icon: '🍽️',
    },
    {
      id: 3,
      title: 'Shop Cashier',
      type: 'Full-time',
      location: 'Kitwe',
      salary: 'K3,000/month',
      applicants: 0,
      status: 'draft',
      posted: '1 hour ago',
      views: 0,
      icon: '🏪',
    },
  ];

  // Mock recommended candidates
  const recommendedCandidates = [
    {
      id: 1,
      name: 'Brian Mwale',
      role: 'Professional Driver',
      experience: '5 years',
      rating: 4.8,
      location: 'Lusaka',
      matchScore: 92,
      avatar: '👨‍💼',
      available: true,
    },
    {
      id: 2,
      name: 'Sarah Banda',
      role: 'Event Caterer',
      experience: '3 years',
      rating: 4.9,
      location: 'Ndola',
      matchScore: 88,
      avatar: '👩‍🍳',
      available: true,
    },
    {
      id: 3,
      name: 'John Phiri',
      role: 'Retail Cashier',
      experience: '2 years',
      rating: 4.6,
      location: 'Kitwe',
      matchScore: 85,
      avatar: '👨',
      available: false,
    },
  ];

  const quickActions = [
    {
      id: 'post',
      title: 'Post New Job',
      subtitle: 'Find the right person',
      icon: Plus,
      color: colors.accent,
      route: '/(employer)/post-job',
    },
    {
      id: 'jobs',
      title: 'My Jobs',
      subtitle: `${activeJobs.filter(j => j.status !== 'draft').length} active`,
      icon: Briefcase,
      color: '#8B5CF6',
      route: '/(employer)/my-jobs',
    },
    {
      id: 'applicants',
      title: 'Applicants',
      subtitle: `${activeJobs.reduce((sum, j) => sum + j.applicants, 0)} total`,
      icon: Users,
      color: '#10B981',
      route: '/(employer)/applicants',
    },
    {
      id: 'messages',
      title: 'Messages',
      subtitle: '3 unread',
      icon: MessageCircle,
      color: '#3B82F6',
      route: '/(employer)/messages',
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: '#10B981', icon: CheckCircle2 };
      case 'reviewing':
        return { label: 'Reviewing', color: '#F59E0B', icon: Clock };
      case 'draft':
        return { label: 'Draft', color: '#78704b', icon: Clock };
      default:
        return { label: status, color: colors.textMuted, icon: Clock };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 24,
          paddingTop: 56,
          paddingBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image
                source={employer.avatar}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: 2.5,
                  borderColor: colors.accent,
                }}
              />
              <View>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
                  {greeting}, {employer.name.split(' ')[0]}! 👋
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MapPin size={14} color={colors.textMuted} strokeWidth={2} />
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    {employer.location}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Warm Message */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: colors.accent,
          }}>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
              💡 <Text style={{ fontWeight: '600' }}>Quick Tip:</Text> Respond to applicants within 24 hours to get better matches next time!
            </Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => router.push(action.route)}
                  style={{
                    width: '48%',
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1.5,
                    borderColor: colors.cardBorder,
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: action.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <IconComponent size={22} color={action.color} strokeWidth={2.5} />
                  </View>
                  <Text style={{
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}>
                    {action.title}
                  </Text>
                  <Text style={{
                    color: colors.textMuted,
                    fontSize: 12,
                  }}>
                    {action.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Your Jobs Section */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>
              Your Jobs
            </Text>
            <TouchableOpacity>
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>
                See All →
              </Text>
            </TouchableOpacity>
          </View>

          {activeJobs.map((job) => {
            const statusInfo = getStatusInfo(job.status);
            const StatusIcon = statusInfo.icon;

            return (
              <TouchableOpacity
                key={job.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1.5,
                  borderColor: colors.cardBorder,
                }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Icon */}
                  <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: colors.actionBox,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 28 }}>{job.icon}</Text>
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: 'bold',
                        flex: 1,
                      }}>
                        {job.title}
                      </Text>
                      <View style={{
                        backgroundColor: statusInfo.color + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <StatusIcon size={10} color={statusInfo.color} strokeWidth={3} />
                        <Text style={{
                          color: statusInfo.color,
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        📍 {job.location}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>•</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {job.type}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{
                        backgroundColor: colors.actionBox,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                      }}>
                        <Text style={{
                          color: colors.actionText,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}>
                          💰 {job.salary}
                        </Text>
                      </View>

                      {job.status !== 'draft' && (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Users size={14} color={colors.accent} strokeWidth={2} />
                            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
                              {job.applicants}
                            </Text>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Eye size={14} color={colors.textMuted} strokeWidth={2} />
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                              {job.views}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recommended Candidates */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#8B5CF6' + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Star size={16} color="#8B5CF6" strokeWidth={2.5} fill="#8B5CF6" />
            </View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>
              Recommended for You
            </Text>
          </View>

          <Text style={{
            color: colors.textMuted,
            fontSize: 13,
            marginBottom: 16,
            lineHeight: 18,
          }}>
            Based on your previous hires and job posts, these candidates might be perfect for you!
          </Text>

          {recommendedCandidates.map((candidate) => (
            <TouchableOpacity
              key={candidate.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Avatar */}
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.actionBox,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 32 }}>{candidate.avatar}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: 'bold',
                      flex: 1,
                    }}>
                      {candidate.name}
                    </Text>
                    <View style={{
                      backgroundColor: '#10B981' + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        color: '#10B981',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}>
                        {candidate.matchScore}% Match
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
                    {candidate.role}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color={colors.textMuted} strokeWidth={2} />
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {candidate.experience}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Star size={12} color="#F59E0B" strokeWidth={2} fill="#F59E0B" />
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
                        {candidate.rating}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color={colors.textMuted} strokeWidth={2} />
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {candidate.location}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: colors.accent + '15',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                        View Profile
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.background,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Heart size={18} color={colors.accent} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            This Month
          </Text>

          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1.5,
            borderColor: colors.cardBorder,
          }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  2
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Active Jobs
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  20
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Total Applicants
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  77
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Profile Views
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push('/(employer)/post-job')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Plus size={28} color="white" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
