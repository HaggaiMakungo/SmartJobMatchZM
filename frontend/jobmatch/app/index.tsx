import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Users, Briefcase } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  // ✅ Real users from database (ID 4 = Brian, ID 8 = Mark)
  const TEST_USERS = {
    jobSeeker: {
      id: 4,
      email: "brian.mwale@example.com",
      full_name: "Brian Mwale",
      role: "candidate" as const,
      cv_id: "CV_C30D0F96",
      location: "Lusaka, Lusaka Province",
      job_title: "Software Developer",
      profile_completed: true,
    },
    employer: {
      id: 8,
      email: "mark.ziligone@employer.zm",
      full_name: "Mark Ziligone",
      role: "recruiter" as const,
      company_name: "Personal Employer",
      profile_completed: true,
    },
  };

  const handleRoleSelection = (role: 'jobSeeker' | 'employer') => {
    // Just set the user directly (no authentication)
    const user = TEST_USERS[role];
    setUser(user);
    
    console.log('✅ Selected user:', user.full_name, `(${user.role})`);

    // Navigate to the appropriate section
    if (role === 'jobSeeker') {
      router.replace("/(tabs)"); // Job seeker tabs
    } else {
      router.replace("/(employer)"); // Employer tabs
    }
  };

  const roles = [
    {
      id: 'jobSeeker',
      title: "I'm looking for work",
      subtitle: 'Find jobs that match your skills',
      icon: Search,
      color: '#f29559', // Tangerine
      bgColor: 'rgba(242, 149, 89, 0.15)',
      user: TEST_USERS.jobSeeker,
    },
    {
      id: 'employer',
      title: "I'm hiring someone",
      subtitle: 'Post jobs and find candidates',
      icon: Users,
      color: '#a4b494', // Sage
      bgColor: 'rgba(164, 180, 148, 0.15)',
      user: TEST_USERS.employer,
    },
  ];

  return (
    <LinearGradient
      colors={['#202c39', '#283845']}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            {/* Logo */}
            <View style={{ 
              backgroundColor: 'rgba(242, 212, 146, 0.2)', 
              padding: 20, 
              borderRadius: 9999,
              marginBottom: 20,
            }}>
              <Briefcase size={48} color="#f2d492" strokeWidth={2} />
            </View>
            
            <Text style={{
              color: '#f2d492',
              fontSize: 36,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              JobMatch
            </Text>
            <Text style={{
              color: '#b8b08d',
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Welcome! 👋
            </Text>
            <Text style={{
              color: '#b8b08d',
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 20,
              opacity: 0.8,
            }}>
              Choose your profile to continue
            </Text>
          </View>

          {/* Role Cards - NO WHITE! */}
          <View style={{ gap: 20, marginBottom: 32 }}>
            {roles.map((role) => {
              const IconComponent = role.icon;
              
              return (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => handleRoleSelection(role.id as 'jobSeeker' | 'employer')}
                  style={{
                    backgroundColor: role.bgColor, // Semi-transparent role color
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 2,
                    borderColor: role.color + '40', // Role color at 25% opacity
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {/* Icon Circle */}
                    <View style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: role.color + '30', // Role color at 20% opacity
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <IconComponent size={32} color={role.color} strokeWidth={2.5} />
                    </View>
                    
                    {/* Text Content */}
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#f2d492', // Peach
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 4,
                      }}>
                        {role.title}
                      </Text>
                      <Text style={{
                        color: '#b8b08d', // Sage
                        fontSize: 14,
                        lineHeight: 20,
                      }}>
                        {role.subtitle}
                      </Text>
                      <Text style={{
                        color: '#b8b08d',
                        fontSize: 12,
                        marginTop: 8,
                        fontStyle: 'italic',
                        opacity: 0.7,
                      }}>
                        Continue as: {role.user.full_name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Box */}
          <View style={{
            backgroundColor: 'rgba(242, 212, 146, 0.1)',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(242, 212, 146, 0.3)',
          }}>
            <Text style={{
              color: '#f2d492',
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
            }}>
              🚀 Demo Mode
            </Text>
            <Text style={{
              color: '#b8b08d',
              fontSize: 12,
              lineHeight: 18,
            }}>
              Select a profile above to explore the app. No login required!
            </Text>
          </View>

          {/* Footer */}
          <View style={{ marginTop: 'auto', paddingTop: 32, alignItems: 'center' }}>
            <Text style={{ color: '#b8b08d', fontSize: 14, opacity: 0.7 }}>
              Made in Zambia 🇿🇲
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
