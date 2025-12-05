/**
 * Edit Profile Screen
 * Allows users to update their profile information
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCandidateProfile, useUpdateCandidateProfile } from '@/hooks/useCandidate';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);

  // Fetch current profile
  const { data: profile, isLoading: isLoadingProfile } = useCandidateProfile();
  const updateProfileMutation = useUpdateCandidateProfile();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setSkills(profile.skills?.join(', ') || '');
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const changed =
        fullName !== (profile.full_name || '') ||
        email !== (profile.email || '') ||
        phone !== (profile.phone || '') ||
        location !== (profile.location || '') ||
        bio !== (profile.bio || '') ||
        skills !== (profile.skills?.join(', ') || '');
      setHasChanges(changed);
    }
  }, [fullName, email, phone, location, bio, skills, profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await updateProfileMutation.mutateAsync({
        full_name: fullName,
        email,
        phone: phone || undefined,
        location: location || undefined,
        bio: bio || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to update profile. Please try again.'
      );
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
          }}
        >
          <TouchableOpacity
            onPress={handleCancel}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
            Edit Profile
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || updateProfileMutation.isPending}
            style={{
              backgroundColor: hasChanges ? colors.accent : colors.cardBorder + '50',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: hasChanges ? '#FFFFFF' : colors.textMuted,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Profile Picture Section */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.actionBox,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                borderWidth: 3,
                borderColor: colors.accent,
              }}
            >
              <Text style={{ color: colors.actionText, fontSize: 40, fontWeight: 'bold' }}>
                {fullName.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'Photo upload will be available soon')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: colors.accent + '20',
                borderRadius: 20,
              }}
            >
              <Ionicons name="camera-outline" size={18} color={colors.accent} />
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 16,
              }}
            >
              Basic Information
            </Text>

            {/* Full Name */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                Full Name *
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted + '80'}
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1.5,
                  borderColor: errors.fullName ? colors.error : colors.cardBorder,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                }}
              />
              {errors.fullName && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.fullName}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                Email *
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textMuted + '80'}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1.5,
                  borderColor: errors.email ? colors.error : colors.cardBorder,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                }}
              />
              {errors.email && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+260 XXX XXX XXX"
                placeholderTextColor={colors.textMuted + '80'}
                keyboardType="phone-pad"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1.5,
                  borderColor: errors.phone ? colors.error : colors.cardBorder,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                }}
              />
              {errors.phone && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.phone}
                </Text>
              )}
            </View>

            {/* Location */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                Location
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Lusaka, Zambia"
                placeholderTextColor={colors.textMuted + '80'}
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1.5,
                  borderColor: colors.cardBorder,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            </View>
          </View>

          {/* Professional Information */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 16,
              }}
            >
              Professional Information
            </Text>

            {/* Bio */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                Bio
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.textMuted + '80'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1.5,
                  borderColor: colors.cardBorder,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 100,
                }}
              />
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  marginTop: 4,
                  textAlign: 'right',
                }}
              >
                {bio.length}/500
              </Text>
            </View>

            {/* Skills */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                Skills
              </Text>
              <TextInput
                value={skills}
                onChangeText={setSkills}
                placeholder="e.g. JavaScript, React, Python (comma-separated)"
                placeholderTextColor={colors.textMuted + '80'}
                multiline
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1.5,
                  borderColor: colors.cardBorder,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 80,
                }}
              />
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                💡 Separate skills with commas
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: colors.accent + '10',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Ionicons name="information-circle" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                >
                  Profile Tip
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    lineHeight: 20,
                  }}
                >
                  Complete your profile to improve your job matches. A complete profile increases
                  your chances of getting hired by 60%!
                </Text>
              </View>
            </View>
          </View>

          {/* Additional spacing for keyboard */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
