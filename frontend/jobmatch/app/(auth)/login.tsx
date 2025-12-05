import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Quick login for Job Seeker (Brian Mwale)
  const handleJobSeekerTestLogin = () => {
    setValue('email', 'brian.mwale@example.com');
    setValue('password', 'Brian123');
  };

  // Quick login for Personal Employer (Mark Ziligone)
  const handleEmployerTestLogin = () => {
    setValue('email', 'mark.ziligone@example.com');
    setValue('password', 'Mark123');
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Update auth store
      await setAuth(response.access_token, response.user);

      // Route based on user role
      // Check if user is an employer (personal or corporate)
      if (response.user.role === 'employer_personal' || 
          response.user.role === 'recruiter' || 
          data.email === 'mark.ziligone@example.com') {
        // Navigate to employer home
        router.replace('/(employer)');
      } else {
        // Navigate to job seeker home
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.detail || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#202c39', '#283845']}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
              {/* Header */}
              <View style={{ alignItems: 'center', marginBottom: 48 }}>
                <View style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 40, 
                  backgroundColor: '#f29559',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: 'bold', 
                  color: '#FFFFFF',
                  marginBottom: 8
                }}>
                  Welcome Back
                </Text>
                <Text style={{ 
                  color: '#d5d0bb', 
                  textAlign: 'center',
                  fontSize: 16
                }}>
                  Sign in to continue
                </Text>
              </View>

              {/* Quick Test Login Buttons */}
              <View style={{ marginBottom: 24, gap: 8 }}>
                <TouchableOpacity
                  onPress={handleJobSeekerTestLogin}
                  style={{ 
                    padding: 12,
                    backgroundColor: 'rgba(242, 212, 146, 0.1)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(242, 212, 146, 0.3)'
                  }}
                >
                  <Text style={{ 
                    color: '#f2d492',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    🧪 Job Seeker (Brian Mwale)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleEmployerTestLogin}
                  style={{ 
                    padding: 12,
                    backgroundColor: 'rgba(242, 149, 89, 0.1)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(242, 149, 89, 0.3)'
                  }}
                >
                  <Text style={{ 
                    color: '#f29559',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    💼 Personal Employer (Mark Ziligone)
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/diagnostic')}
                  style={{ 
                    padding: 12,
                    backgroundColor: 'rgba(184, 176, 141, 0.1)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(184, 176, 141, 0.3)'
                  }}
                >
                  <Text style={{ 
                    color: '#b8b08d',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    🔧 Network Diagnostic Tool
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Form */}
              <View style={{ marginBottom: 24 }}>
                {/* Email Input */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email"
                      placeholder="your.email@example.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      leftIcon={<Text style={{ fontSize: 20 }}>📧</Text>}
                    />
                  )}
                />

                {/* Password Input */}
                <View style={{ marginTop: 16 }}>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.password?.message}
                        secureTextEntry
                        autoCapitalize="none"
                        leftIcon={<Text style={{ fontSize: 20 }}>🔒</Text>}
                      />
                    )}
                  />
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 8 }}>
                  <Text style={{ color: '#f2d492', fontSize: 14, fontWeight: '500' }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Button
                variant="tangerine"
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={{ marginBottom: 24 }}
              >
                {isLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                      Signing in...
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                    Sign In
                  </Text>
                )}
              </Button>

              {/* Divider */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 24 
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#5c7fa4' }} />
                <Text style={{ marginHorizontal: 16, color: '#9f9566', fontSize: 14 }}>
                  OR
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#5c7fa4' }} />
              </View>

              {/* Register Link */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <Text style={{ color: '#d5d0bb', fontSize: 14 }}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={{ color: '#f29559', fontWeight: '600', fontSize: 14 }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={{ marginTop: 'auto', paddingTop: 32 }}>
                <Text style={{ color: '#9f9566', textAlign: 'center', fontSize: 12 }}>
                  Made in Zambia 🇿🇲
                </Text>
                <Text style={{ color: '#78704b', textAlign: 'center', fontSize: 11, marginTop: 4 }}>
                  Version 1.0.0 • Powered by AI
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
