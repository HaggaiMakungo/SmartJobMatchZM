import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  TrendingUp, 
  Target, 
  MapPin, 
  Briefcase,
  Award,
  Sparkles,
  ChevronRight,
  DollarSign,
} from 'lucide-react-native';

interface AnalyticsData {
  marketSnapshot: {
    topSectors: { name: string; growth: number; jobs: number }[];
    avgSalary: { category: string; salary: string }[];
    overallGrowth: number;
  };
  personalInsights: {
    skillsMatch: number;
    trendingRoles: string[];
    savedJobs: number;
    appliedJobs: number;
  };
  locationInsights: {
    topCities: { name: string; jobs: number; trend: 'up' | 'down' | 'stable' }[];
  };
  aiExplanation: {
    primarySkills: string[];
    secondarySkills: string[];
  };
}

interface JobAnalyticsProps {
  data: AnalyticsData;
  colors: any;
  onViewMore?: () => void;
}

export default function JobAnalytics({ data, colors, onViewMore }: JobAnalyticsProps) {
  const getGrowthColor = (growth: number) => {
    if (growth >= 15) return '#10B981'; // Green
    if (growth >= 5) return '#F59E0B'; // Amber
    return '#6B7280'; // Gray
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
      {/* Section Header */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.accent + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} color={colors.accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>
            Market Insights
          </Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          Smart analytics powered by AI to help you make better decisions
        </Text>
      </View>

      {/* Market Snapshot */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={20} color={colors.text} strokeWidth={2.5} />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: 'bold' }}>
            Market Snapshot
          </Text>
        </View>

        {/* Overall Growth Banner */}
        <View
          style={{
            backgroundColor: colors.actionBox,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text style={{ color: colors.actionText, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
              Overall Job Market
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ color: colors.actionText, fontSize: 32, fontWeight: 'bold' }}>
                {data.marketSnapshot.overallGrowth}%
              </Text>
              <Text style={{ color: colors.actionText, fontSize: 14, fontWeight: '600' }}>
                growth
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: getGrowthColor(data.marketSnapshot.overallGrowth),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={28} color="white" strokeWidth={2.5} />
          </View>
        </View>

        {/* Top Sectors */}
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
          Top Hiring Sectors
        </Text>
        {data.marketSnapshot.topSectors.map((sector, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Briefcase size={14} color={colors.textMuted} strokeWidth={2} />
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                  {sector.name}
                </Text>
              </View>
              {/* Progress Bar */}
              <View
                style={{
                  height: 6,
                  backgroundColor: colors.cardBorder + '40',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${sector.growth}%`,
                    backgroundColor: getGrowthColor(sector.growth),
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: getGrowthColor(sector.growth), fontSize: 16, fontWeight: 'bold' }}>
                {sector.growth}%
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                {sector.jobs} jobs
              </Text>
            </View>
          </View>
        ))}

        {/* Average Salaries */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          Average Salaries
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {data.marketSnapshot.avgSalary.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.background,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <DollarSign size={14} color={colors.accent} strokeWidth={2.5} />
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
                {item.category}
              </Text>
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: 'bold' }}>
                {item.salary}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Personal Insights */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Target size={20} color={colors.text} strokeWidth={2.5} />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: 'bold' }}>
            Your Profile Fit
          </Text>
        </View>

        {/* Skills Match Circle */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.actionBox,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 8,
              borderColor: colors.accent,
            }}
          >
            <Text style={{ color: colors.actionText, fontSize: 36, fontWeight: 'bold' }}>
              {data.personalInsights.skillsMatch}%
            </Text>
            <Text style={{ color: colors.actionText, fontSize: 12, fontWeight: '600', marginTop: 4 }}>
              Skills Match
            </Text>
          </View>
        </View>

        {/* Trending Roles */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Award size={16} color={colors.textMuted} strokeWidth={2} />
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>
              Trending Roles for You
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {data.personalInsights.trendingRoles.map((role, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.accent + '20',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                  {role}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Summary */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
              {data.personalInsights.savedJobs}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
              Saved Jobs
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
              {data.personalInsights.appliedJobs}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
              Applied
            </Text>
          </View>
        </View>
      </View>

      {/* Location Insights */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MapPin size={20} color={colors.text} strokeWidth={2.5} />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: 'bold' }}>
            Top Hiring Locations
          </Text>
        </View>

        {data.locationInsights.topCities.map((city, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.background,
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 20 }}>{getTrendIcon(city.trend)}</Text>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
                  {city.name}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.actionBox,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: colors.actionText, fontSize: 14, fontWeight: 'bold' }}>
                {city.jobs} jobs
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* AI Explanation */}
      <View
        style={{
          backgroundColor: colors.accent + '15',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: colors.accent + '30',
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} color="white" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
              Why we recommended these jobs
            </Text>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, opacity: 0.9 }}>
              You match skills in{' '}
              <Text style={{ fontWeight: 'bold', color: colors.accent }}>
                {data.aiExplanation.primarySkills.join(', ')}
              </Text>
              {data.aiExplanation.secondarySkills.length > 0 && (
                <>
                  {' '}and have experience with{' '}
                  <Text style={{ fontWeight: 'bold', color: colors.accent }}>
                    {data.aiExplanation.secondarySkills.join(', ')}
                  </Text>
                </>
              )}
              . These jobs align with your profile and career goals.
            </Text>
          </View>
        </View>
      </View>

      {/* View Full Analytics CTA */}
      {onViewMore && (
        <TouchableOpacity
          onPress={onViewMore}
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1.5,
            borderColor: colors.cardBorder,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.accent + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} color={colors.accent} strokeWidth={2.5} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
              View Full Analytics Dashboard
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}
