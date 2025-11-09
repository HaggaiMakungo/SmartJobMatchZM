import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Users,
  Building,
  TrendingUp,
  GraduationCap,
} from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';

const { width } = Dimensions.get('window');

// Mock job data - replace with real API call
const mockJobs = {
  '1': {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Innovators Zambia',
    location: 'Lusaka, Zambia',
    salary: 'ZMW 15,000 - 25,000',
    type: 'Full-time',
    category: 'Technology',
    matchScore: 95,
    isCurated: true,
    description:
      'We are looking for a talented Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.',
    requirements: [
      '5+ years of experience in software development',
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Strong problem-solving and communication skills',
      'Bachelor\'s degree in Computer Science or related field',
    ],
    responsibilities: [
      'Design and develop high-quality software solutions',
      'Collaborate with cross-functional teams',
      'Mentor junior developers',
      'Participate in code reviews and technical discussions',
      'Contribute to architecture decisions',
    ],
    benefits: [
      'Competitive salary and performance bonuses',
      'Health insurance coverage',
      'Professional development opportunities',
      'Flexible working hours',
      'Remote work options',
    ],
    postedDate: '2025-01-15',
    employerType: 'corporate',
    employerBio:
      'Tech Innovators Zambia is a leading software development company specializing in innovative solutions for businesses across Africa. We are committed to fostering a culture of excellence, creativity, and continuous learning.',
    employerSize: '50-200 employees',
    employerIndustry: 'Information Technology',
  },
  '2': {
    id: '2',
    title: 'Marketing Manager',
    company: 'John Mwansa',
    location: 'Ndola, Zambia',
    salary: 'ZMW 12,000 - 18,000',
    type: 'Full-time',
    category: 'Marketing',
    matchScore: 88,
    isCurated: true,
    description:
      'Exciting opportunity for a creative Marketing Manager to lead our marketing initiatives and drive brand growth across digital and traditional channels.',
    requirements: [
      '3+ years of marketing experience',
      'Strong understanding of digital marketing',
      'Experience with social media management',
      'Excellent communication skills',
      'Degree in Marketing or related field',
    ],
    responsibilities: [
      'Develop and execute marketing strategies',
      'Manage social media presence',
      'Coordinate marketing campaigns',
      'Analyze marketing metrics',
      'Build brand awareness',
    ],
    benefits: [
      'Competitive salary',
      'Creative freedom',
      'Growth opportunities',
      'Supportive team environment',
    ],
    postedDate: '2025-01-18',
    employerType: 'personal',
    employerBio:
      'I am John Mwansa, founder of a growing e-commerce startup in Ndola. I\'m passionate about building authentic brands that connect with local communities. Looking for a creative marketer to join me on this exciting journey.',
    employerExperience: '10 years in entrepreneurship',
  },
};

// Similar jobs for carousel
const similarJobs = [
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Digital Solutions Ltd',
    matchScore: 92,
    salary: 'ZMW 18,000 - 28,000',
    location: 'Lusaka',
    emoji: '💻',
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'Web Creators Zambia',
    matchScore: 89,
    salary: 'ZMW 14,000 - 22,000',
    location: 'Lusaka',
    emoji: '🎨',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'Cloud Systems ZM',
    matchScore: 87,
    salary: 'ZMW 20,000 - 30,000',
    location: 'Lusaka',
    emoji: '☁️',
  },
];

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isSaved, setIsSaved] = useState(false);

  // Get job data
  const job = mockJobs[id as string] || mockJobs['1'];

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Save to backend
  };

  const handleApply = () => {
    // TODO: Navigate to application screen
    console.log('Apply to job:', job.id);
  };

  const getMatchColor = (score: number) => {
    if (score >= 85) return '#10B981';
    if (score >= 70) return '#F59E0B';
    return '#6B7280';
  };

  const renderSimilarJobCard = (item: typeof similarJobs[0]) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => router.push(`/job/${item.id}`)}
      style={{
        width: width * 0.7,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginRight: 16,
        borderWidth: 1,
        borderColor: isDark ? '#3e556e' : '#e5e7eb',
      }}
    >
      {/* Match Score Badge */}
      <View
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: getMatchColor(item.matchScore),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
          {item.matchScore}% Match
        </Text>
      </View>

      {/* Emoji Icon */}
      <View
        style={{
          width: 60,
          height: 60,
          backgroundColor: '#f2d492',
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
      </View>

      {/* Job Info */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {item.company}
      </Text>

      {/* Salary & Location */}
      <View
        style={{
          backgroundColor: '#f2d492',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          alignSelf: 'flex-start',
          marginBottom: 8,
        }}
      >
        <Text style={{ color: '#202c39', fontSize: 13, fontWeight: '600' }}>
          {item.salary}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MapPin size={14} color="#b8b08d" />
        <Text style={{ color: '#b8b08d', fontSize: 13, marginLeft: 4 }}>
          {item.location}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 16,
          backgroundColor: colors.primary,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(242, 212, 146, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} color="#f2d492" />
        </TouchableOpacity>

        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <Text
            style={{
              color: '#f2d492',
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {job.isCurated
              ? 'Curated specially for you by SmartMatch'
              : 'See what this opportunity has for you'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(242, 212, 146, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart
            size={20}
            color="#f2d492"
            fill={isSaved ? '#f2d492' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Match Score */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <View
              style={{
                backgroundColor: getMatchColor(job.matchScore),
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
              }}
            >
              <Text
                style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}
              >
                {job.matchScore}% Match
              </Text>
            </View>
          </View>

          {/* Job Title */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {job.title}
          </Text>

          {/* Company */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Building size={18} color="#b8b08d" />
            <Text
              style={{
                fontSize: 16,
                color: '#b8b08d',
                marginLeft: 8,
              }}
            >
              {job.company}
            </Text>
          </View>

          {/* Quick Info Cards */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {/* Location */}
            <View
              style={{
                backgroundColor: colors.card,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark ? '#3e556e' : '#e5e7eb',
              }}
            >
              <MapPin size={16} color="#f29559" />
              <Text
                style={{ color: colors.text, marginLeft: 8, fontSize: 14 }}
              >
                {job.location}
              </Text>
            </View>

            {/* Job Type */}
            <View
              style={{
                backgroundColor: colors.card,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark ? '#3e556e' : '#e5e7eb',
              }}
            >
              <Briefcase size={16} color="#f29559" />
              <Text
                style={{ color: colors.text, marginLeft: 8, fontSize: 14 }}
              >
                {job.type}
              </Text>
            </View>

            {/* Salary */}
            <View
              style={{
                backgroundColor: '#f2d492',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <DollarSign size={16} color="#202c39" />
              <Text
                style={{ color: '#202c39', marginLeft: 8, fontSize: 14, fontWeight: '600' }}
              >
                {job.salary}
              </Text>
            </View>

            {/* Posted Date */}
            <View
              style={{
                backgroundColor: colors.card,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark ? '#3e556e' : '#e5e7eb',
              }}
            >
              <Clock size={16} color="#b8b08d" />
              <Text
                style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 14 }}
              >
                Posted {new Date(job.postedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Description Section */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: isDark ? '#3e556e' : '#e5e7eb',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Job Description
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                lineHeight: 24,
              }}
            >
              {job.description}
            </Text>
          </View>

          {/* Requirements */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: isDark ? '#3e556e' : '#e5e7eb',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <GraduationCap size={20} color="#f29559" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Requirements
              </Text>
            </View>
            {job.requirements.map((req, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', marginBottom: 8 }}
              >
                <Text style={{ color: '#f29559', marginRight: 8 }}>•</Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: colors.textSecondary,
                    lineHeight: 20,
                  }}
                >
                  {req}
                </Text>
              </View>
            ))}
          </View>

          {/* Responsibilities */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: isDark ? '#3e556e' : '#e5e7eb',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TrendingUp size={20} color="#f29559" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Responsibilities
              </Text>
            </View>
            {job.responsibilities.map((resp, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', marginBottom: 8 }}
              >
                <Text style={{ color: '#f29559', marginRight: 8 }}>•</Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: colors.textSecondary,
                    lineHeight: 20,
                  }}
                >
                  {resp}
                </Text>
              </View>
            ))}
          </View>

          {/* Benefits */}
          {job.benefits && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 16,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: isDark ? '#3e556e' : '#e5e7eb',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Benefits
              </Text>
              {job.benefits.map((benefit, index) => (
                <View
                  key={index}
                  style={{ flexDirection: 'row', marginBottom: 8 }}
                >
                  <Text style={{ color: '#10B981', marginRight: 8 }}>✓</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: colors.textSecondary,
                      lineHeight: 20,
                    }}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Employer Bio */}
          <View
            style={{
              backgroundColor: '#f2d492',
              padding: 20,
              borderRadius: 16,
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              {job.employerType === 'corporate' ? (
                <Building size={20} color="#202c39" />
              ) : (
                <Users size={20} color="#202c39" />
              )}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#202c39',
                  marginLeft: 8,
                }}
              >
                {job.employerType === 'corporate'
                  ? 'About the Company'
                  : 'About the Recruiter'}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: '#202c39',
                lineHeight: 22,
                marginBottom: 12,
              }}
            >
              {job.employerBio}
            </Text>
            {job.employerType === 'corporate' ? (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <Users size={16} color="#202c39" />
                  <Text style={{ color: '#202c39', marginLeft: 8, fontSize: 13 }}>
                    {job.employerSize}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Briefcase size={16} color="#202c39" />
                  <Text style={{ color: '#202c39', marginLeft: 8, fontSize: 13 }}>
                    {job.employerIndustry}
                  </Text>
                </View>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TrendingUp size={16} color="#202c39" />
                <Text style={{ color: '#202c39', marginLeft: 8, fontSize: 13 }}>
                  {job.employerExperience}
                </Text>
              </View>
            )}
          </View>

          {/* Similar Jobs Carousel */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Similar Opportunities
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          style={{ marginBottom: 24 }}
        >
          {similarJobs.map((item) => renderSimilarJobCard(item))}
        </ScrollView>
      </ScrollView>

      {/* Bottom Apply Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          padding: 24,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#3e556e' : '#e5e7eb',
        }}
      >
        <TouchableOpacity
          onPress={handleApply}
          style={{
            backgroundColor: '#f29559',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 18,
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
