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
import { User02Icon, LockPasswordIcon, Mail01Icon, SmartPhone01Icon } from '@hugeicons/react-native';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

// Validation schema
const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      // Update auth store
      setAuth(response.access_token, response.user);

      // Show success message
      Alert.alert(
        'Success!',
        'Your account has been created successfully.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.detail || 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#202c39', '#283845']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-16 pb-8">
              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-20 h-20 rounded-full bg-tangerine items-center justify-center mb-4">
                  <User02Icon size={40} color="#FFFFFF" variant="stroke" />
                </View>
                <Text className="text-3xl font-bold text-white mb-2">
                  Create Account
                </Text>
                <Text className="text-sage-300 text-center">
                  Join JobMatch to find your dream job
                </Text>
              </View>

              {/* Registration Form */}
              <View className="space-y-4 mb-6">
                {/* Full Name */}
                <Controller
                  control={control}
                  name="full_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.full_name?.message}
                      autoCapitalize="words"
                      leftIcon={<User02Icon size={20} color="#b8b08d" variant="stroke" />}
                    />
                  )}
                />

                {/* Email */}
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
                      leftIcon={<Mail01Icon size={20} color="#b8b08d" variant="stroke" />}
                    />
                  )}
                />

                {/* Phone */}
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Phone Number"
                      placeholder="0977123456"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.phone?.message}
                      keyboardType="phone-pad"
                      leftIcon={<SmartPhone01Icon size={20} color="#b8b08d" variant="stroke" />}
                    />
                  )}
                />

                {/* Password */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Password"
                      placeholder="Min. 8 characters"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      secureTextEntry
                      autoCapitalize="none"
                      leftIcon={<LockPasswordIcon size={20} color="#b8b08d" variant="stroke" />}
                    />
                  )}
                />

                {/* Confirm Password */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                      secureTextEntry
                      autoCapitalize="none"
                      leftIcon={<HugeiconsIcon icon={LockPasswordIcon} size={20} color="#b8b08d" />}
                    />
                  )}
                />
              </View>

              {/* Terms & Conditions */}
              <Text className="text-sage-400 text-xs text-center mb-6">
                By signing up, you agree to our{' '}
                <Text className="text-peach-400 font-medium">
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text className="text-peach-400 font-medium">
                  Privacy Policy
                </Text>
              </Text>

              {/* Register Button */}
              <Button
                variant="tangerine"
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="mb-6"
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#FFFFFF" className="mr-2" />
                    <Text className="text-white font-semibold text-base">
                      Creating Account...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Create Account
                  </Text>
                )}
              </Button>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mb-4">
                <Text className="text-sage-300 text-sm">
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="text-tangerine font-semibold text-sm">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View className="mt-auto pt-4">
                <Text className="text-sage-500 text-center text-xs">
                  Made in Zambia 🇿🇲
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
