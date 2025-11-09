import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Phone,
  MessageCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react-native';

export default function PostJobScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'urgent' | 'this_week' | 'scheduled'>('this_week');
  const [duration, setDuration] = useState<'one_time' | 'short_term' | 'ongoing'>('one_time');
  const [location, setLocation] = useState('');
  const [remoteWork, setRemoteWork] = useState(false);
  const [paymentType, setPaymentType] = useState<'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly'>('fixed');
  const [budget, setBudget] = useState('');
  const [proposalRate, setProposalRate] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [contactMethod, setContactMethod] = useState<'in_app' | 'phone' | 'whatsapp'>('in_app');
  const [visibility, setVisibility] = useState<'public' | 'invite'>('public');
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { id: 'driver', name: '🚗 Driver' },
    { id: 'housekeeper', name: '🏠 Housekeeper' },
    { id: 'chef', name: '🍳 Chef/Cook' },
    { id: 'plumber', name: '🔧 Plumber' },
    { id: 'gardener', name: '🌱 Gardener' },
    { id: 'tutor', name: '📚 Tutor' },
    { id: 'accountant', name: '💼 Accountant' },
    { id: 'caregiver', name: '👵 Caregiver' },
    { id: 'other', name: '📋 Other' },
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please describe what you need help with');
      return;
    }
    if (!category) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please add a description');
      return;
    }

    Alert.alert(
      'Success! 🎉',
      'Your job has been posted successfully.',
      [{ text: 'OK', onPress: () => router.push('/(employer)/jobs') }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>
            Post a Job
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Tell us what you need
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        >
          {/* Job Title */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              What do you need help with?
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                padding: 14,
                color: colors.text,
                fontSize: 14,
              }}
              placeholder="e.g., Need a driver for school pickups"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={{
                    backgroundColor: category === cat.id ? colors.actionBox : colors.card,
                    borderWidth: 1.5,
                    borderColor: category === cat.id ? colors.actionText : colors.cardBorder,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{
                    color: category === cat.id ? colors.actionText : colors.text,
                    fontSize: 13,
                    fontWeight: '600',
                  }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Description
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                padding: 14,
                color: colors.text,
                fontSize: 14,
                height: 120,
                textAlignVertical: 'top',
              }}
              placeholder="Describe what you need..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* Urgency */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              When do you need this?
            </Text>
            <View style={{ gap: 8 }}>
              {[
                { value: 'urgent', label: '🔴 Urgent' },
                { value: 'this_week', label: '📅 This week' },
                { value: 'scheduled', label: '📆 Scheduled' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setUrgency(option.value as any)}
                  style={{
                    backgroundColor: urgency === option.value ? colors.actionBox : colors.card,
                    borderWidth: 1.5,
                    borderColor: urgency === option.value ? colors.actionText : colors.cardBorder,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    color: urgency === option.value ? colors.actionText : colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    {option.label}
                  </Text>
                  {urgency === option.value && (
                    <CheckCircle size={20} color={colors.actionText} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Duration
            </Text>
            <View style={{ gap: 8 }}>
              {[
                { value: 'one_time', label: 'One-time job' },
                { value: 'short_term', label: 'Short-term' },
                { value: 'ongoing', label: 'Ongoing' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setDuration(option.value as any)}
                  style={{
                    backgroundColor: duration === option.value ? colors.actionBox : colors.card,
                    borderWidth: 1.5,
                    borderColor: duration === option.value ? colors.actionText : colors.cardBorder,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    color: duration === option.value ? colors.actionText : colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    {option.label}
                  </Text>
                  {duration === option.value && (
                    <CheckCircle size={20} color={colors.actionText} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Location
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                padding: 14,
                color: colors.text,
                fontSize: 14,
                marginBottom: 12,
              }}
              placeholder="e.g., Kabulonga, Lusaka"
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
              editable={!remoteWork}
            />
            <TouchableOpacity
              onPress={() => setRemoteWork(!remoteWork)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14 }}>
                Work can be done remotely
              </Text>
              <Switch
                value={remoteWork}
                onValueChange={setRemoteWork}
                trackColor={{ false: colors.cardBorder, true: colors.accent + '60' }}
                thumbColor={remoteWork ? colors.accent : colors.card}
              />
            </TouchableOpacity>
          </View>

          {/* Budget */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Budget
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['fixed', 'hourly', 'daily', 'monthly'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setPaymentType(type as any)}
                  style={{
                    flex: 1,
                    backgroundColor: paymentType === type ? colors.actionBox : colors.card,
                    borderWidth: 1.5,
                    borderColor: paymentType === type ? colors.actionText : colors.cardBorder,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: paymentType === type ? colors.actionText : colors.text,
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>K</Text>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderWidth: 1.5,
                  borderColor: colors.cardBorder,
                  borderRadius: 12,
                  padding: 14,
                  color: colors.text,
                  fontSize: 14,
                }}
                placeholder="Amount"
                placeholderTextColor={colors.textMuted}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                editable={!proposalRate}
              />
            </View>
            <TouchableOpacity
              onPress={() => setProposalRate(!proposalRate)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>
                Let applicants propose rates
              </Text>
              <Switch
                value={proposalRate}
                onValueChange={setProposalRate}
                trackColor={{ false: colors.cardBorder, true: colors.accent + '60' }}
                thumbColor={proposalRate ? colors.accent : colors.card}
              />
            </TouchableOpacity>
          </View>

          {/* Preview Button */}
          <TouchableOpacity
            onPress={() => setShowPreview(!showPreview)}
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 14,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Eye size={18} color={colors.accent} strokeWidth={2.5} />
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
              {showPreview ? 'Hide' : 'Show'} Preview
            </Text>
          </TouchableOpacity>

          {/* Preview */}
          {showPreview && (
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
            }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>
                How your post will look:
              </Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                {title || 'Job title...'}
              </Text>
              {category && (
                <View style={{
                  backgroundColor: colors.actionBox,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                }}>
                  <Text style={{ color: colors.actionText, fontSize: 12, fontWeight: '600' }}>
                    {categories.find(c => c.id === category)?.name}
                  </Text>
                </View>
              )}
              {description && (
                <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12 }}>
                  {description}
                </Text>
              )}
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color={colors.textMuted} />
                  <Text style={{ color: colors.text, fontSize: 12 }}>
                    {remoteWork ? 'Remote' : location || 'Location'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color={colors.textMuted} />
                  <Text style={{ color: colors.text, fontSize: 12 }}>
                    {duration === 'one_time' && 'One-time'}{duration === 'short_term' && 'Short-term'}{duration === 'ongoing' && 'Ongoing'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={14} color={colors.textMuted} />
                  <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                    {proposalRate ? 'Open to proposals' : budget ? `K${budget}/${paymentType}` : 'Budget'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 14,
              padding: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Post Job
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
