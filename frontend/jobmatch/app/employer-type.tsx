import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Building2, Home, Briefcase } from 'lucide-react-native';

export default function EmployerTypeScreen() {
  const router = useRouter();

  const employerTypes = [
    {
      id: 'personal',
      title: 'Personal Employer',
      subtitle: 'Hiring for personal or small business needs',
      description: 'Perfect for homeowners, families, or small shops',
      examples: '• Hire a driver, cook, or plumber\n• Find event staff or caterers\n• Get help for your small shop',
      icon: Users,
      color: '#8B5CF6',
      route: '/(employer)',
    },
    {
      id: 'corporate',
      title: 'Corporate Recruiter',
      subtitle: 'Hiring for companies and organizations',
      description: 'For businesses with formal hiring processes',
      examples: '• Post professional positions\n• Manage applicant tracking\n• Corporate hiring workflows',
      icon: Building2,
      color: '#3B82F6',
      route: '/(recruiter)',
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
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(242, 212, 146, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Briefcase size={40} color="#f2d492" strokeWidth={2.5} />
            </View>
            <Text style={{
              color: '#f2d492',
              fontSize: 28,
              fontWeight: 'bold',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              What type of employer are you?
            </Text>
            <Text style={{
              color: '#b8b08d',
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
            }}>
              Choose the option that best describes your hiring needs
            </Text>
          </View>

          {/* Employer Type Cards */}
          <View style={{ gap: 20 }}>
            {employerTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => router.push(type.route as any)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 2,
                    borderColor: type.color + '40',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                  activeOpacity={0.9}
                >
                  {/* Icon and Title */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: type.color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <IconComponent size={28} color={type.color} strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#202c39',
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 4,
                      }}>
                        {type.title}
                      </Text>
                      <Text style={{
                        color: '#78704b',
                        fontSize: 13,
                      }}>
                        {type.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={{
                    color: '#202c39',
                    fontSize: 14,
                    marginBottom: 12,
                    lineHeight: 20,
                  }}>
                    {type.description}
                  </Text>

                  {/* Examples */}
                  <View style={{
                    backgroundColor: '#f2d492' + '20',
                    borderRadius: 12,
                    padding: 14,
                  }}>
                    <Text style={{
                      color: '#78704b',
                      fontSize: 13,
                      lineHeight: 20,
                    }}>
                      {type.examples}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={{ marginTop: 'auto', paddingTop: 32, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: '#b8b08d', fontSize: 14, textDecorationLine: 'underline' }}>
                ← Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
