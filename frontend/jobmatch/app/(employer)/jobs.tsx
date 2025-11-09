import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Clock,
  CheckCircle2,
  MapPin,
  DollarSign,
  Filter,
  Search,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react-native';

type JobStatus = 'active' | 'reviewing' | 'draft' | 'closed';
type JobCategory = 'all' | 'active' | 'reviewing' | 'draft' | 'closed';

interface Job {
  id: number;
  title: string;
  type: string;
  location: string;
  salary: string;
  applicants: number;
  status: JobStatus;
  posted: string;
  views: number;
  icon: string;
  description: string;
}

export default function EmployerJobsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('all');

  // Mock jobs data
  const allJobs: Job[] = [
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
      description: 'Looking for a reliable driver for school runs',
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
      description: 'Need experienced caterer for 150-person wedding',
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
      description: 'Cashier position at local shop',
    },
    {
      id: 4,
      title: 'House Cleaner',
      type: 'Part-time',
      location: 'Lusaka',
      salary: 'K1,800/month',
      applicants: 15,
      status: 'active',
      posted: '1 week ago',
      views: 67,
      icon: '🧹',
      description: '3 times per week, morning shifts',
    },
    {
      id: 5,
      title: 'Gardener',
      type: 'Contract',
      location: 'Lusaka',
      salary: 'K2,000/month',
      applicants: 5,
      status: 'closed',
      posted: '2 weeks ago',
      views: 28,
      icon: '🌱',
      description: 'Position filled - thank you!',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Jobs', count: allJobs.length },
    { id: 'active', label: 'Active', count: allJobs.filter(j => j.status === 'active').length },
    { id: 'reviewing', label: 'Reviewing', count: allJobs.filter(j => j.status === 'reviewing').length },
    { id: 'draft', label: 'Drafts', count: allJobs.filter(j => j.status === 'draft').length },
    { id: 'closed', label: 'Closed', count: allJobs.filter(j => j.status === 'closed').length },
  ];

  const filteredJobs = selectedCategory === 'all' 
    ? allJobs 
    : allJobs.filter(j => j.status === selectedCategory);

  const getStatusInfo = (status: JobStatus) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: '#10B981', icon: CheckCircle2 };
      case 'reviewing':
        return { label: 'Reviewing', color: '#F59E0B', icon: Clock };
      case 'draft':
        return { label: 'Draft', color: '#78704b', icon: Clock };
      case 'closed':
        return { label: 'Closed', color: '#6B7280', icon: CheckCircle2 };
      default:
        return { label: status, color: colors.textMuted, icon: Clock };
    }
  };

  const totalApplicants = allJobs.reduce((sum, job) => sum + job.applicants, 0);
  const activeJobs = allJobs.filter(j => j.status === 'active').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            My Jobs
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            Manage your job postings and applicants
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1.5,
            borderColor: colors.cardBorder,
          }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.accent + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Briefcase size={24} color={colors.accent} strokeWidth={2.5} />
                </View>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  {activeJobs}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Active Jobs
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#10B981' + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Users size={24} color="#10B981" strokeWidth={2.5} />
                </View>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  {totalApplicants}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Total Applicants
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#3B82F6' + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <TrendingUp size={24} color="#3B82F6" strokeWidth={2.5} />
                </View>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  {Math.round(totalApplicants / Math.max(activeJobs, 1))}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                  Avg per Job
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Filters */}
        <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 24 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id as JobCategory)}
                  style={{
                    backgroundColor: selectedCategory === category.id ? colors.actionBox : colors.card,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: selectedCategory === category.id ? colors.actionBox : colors.cardBorder,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{
                      color: selectedCategory === category.id ? colors.actionText : colors.text,
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      {category.label}
                    </Text>
                    <View style={{
                      backgroundColor: selectedCategory === category.id ? colors.background : colors.actionBox,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                      minWidth: 24,
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        color: selectedCategory === category.id ? colors.actionBox : colors.actionText,
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                        {category.count}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Jobs List */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 100 }}>
          {filteredJobs.length === 0 ? (
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 40,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                No {selectedCategory === 'all' ? '' : selectedCategory} jobs
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                {selectedCategory === 'draft' 
                  ? 'Your drafts will appear here' 
                  : 'Post a new job to get started'}
              </Text>
            </View>
          ) : (
            filteredJobs.map((job) => {
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
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: colors.actionBox,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 32 }}>{job.icon}</Text>
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

                      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 8, lineHeight: 18 }}>
                        {job.description}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          📍 {job.location}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>•</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          {job.type}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{
                          backgroundColor: colors.actionBox,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}>
                          <Text style={{
                            color: colors.actionText,
                            fontSize: 13,
                            fontWeight: 'bold',
                          }}>
                            💰 {job.salary}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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

                      {/* Action Buttons */}
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: colors.accent + '15',
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <Edit size={14} color={colors.accent} strokeWidth={2.5} />
                          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                            Edit
                          </Text>
                        </TouchableOpacity>

                        {job.status !== 'closed' && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: colors.background,
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: 10,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <Trash2 size={14} color="#EF4444" strokeWidth={2.5} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
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
