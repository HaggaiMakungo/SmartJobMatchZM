import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Briefcase, Building2, Users } from 'lucide-react-native';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const roles = [
    {
      id: 'job_seeker',
      title: "I'm looking for work",
      subtitle: 'Find jobs that match your skills',
      icon: Search,
      color: '#f29559',
      route: '/(tabs)',
    },
    {
      id: 'personal_employer',
      title: "I'm hiring someone",
      subtitle: 'For personal or small business needs',
      icon: Users,
      color: '#8B5CF6',
      route: '/employer-type',
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
            <Text style={{
              color: '#f2d492',
              fontSize: 32,
              fontWeight: 'bold',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Welcome to JobMatch! 👋
            </Text>
            <Text style={{
              color: '#b8b08d',
              fontSize: 16,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Let's get you started on your journey
            </Text>
          </View>

          {/* Role Cards */}
          <View style={{ gap: 20 }}>
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => router.push(role.route as any)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 2,
                    borderColor: 'rgba(184, 176, 141, 0.3)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                  activeOpacity={0.9}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: role.color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <IconComponent size={30} color={role.color} strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#202c39',
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 4,
                      }}>
                        {role.title}
                      </Text>
                      <Text style={{
                        color: '#78704b',
                        fontSize: 14,
                        lineHeight: 20,
                      }}>
                        {role.subtitle}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={{ marginTop: 'auto', paddingTop: 32, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: '#b8b08d', fontSize: 14, textDecorationLine: 'underline' }}>
                ← Back to login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
