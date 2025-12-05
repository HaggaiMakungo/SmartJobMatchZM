/**
 * Skills & Experience Screen
 * Manage skills, education, and work experience
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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

type TabType = 'skills' | 'education' | 'experience';

export default function SkillsExperienceScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);

  const [activeTab, setActiveTab] = useState<TabType>('skills');
  
  // Fetch current profile
  const { data: profile, isLoading: isLoadingProfile } = useCandidateProfile();
  const updateProfileMutation = useUpdateCandidateProfile();

  // Skills state
  const [skills, setSkills] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Education state
  const [education, setEducation] = useState<any[]>([]);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    field: '',
    start_year: '',
    end_year: '',
  });

  // Experience state
  const [experience, setExperience] = useState<any[]>([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    current: false,
  });

  // Initialize data from profile
  useEffect(() => {
    if (profile) {
      setSkills(profile.skills?.join(', ') || '');
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
    }
  }, [profile]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const currentSkills = skills ? skills.split(',').map(s => s.trim()) : [];
    if (currentSkills.includes(newSkill.trim())) {
      Alert.alert('Duplicate', 'This skill is already in your list');
      return;
    }
    
    const updatedSkills = [...currentSkills, newSkill.trim()].filter(s => s);
    setSkills(updatedSkills.join(', '));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = skills.split(',').map(s => s.trim());
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove);
    setSkills(updatedSkills.join(', '));
  };

  const handleSaveSkills = async () => {
    try {
      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await updateProfileMutation.mutateAsync({
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      });

      Alert.alert('Success', 'Skills updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update skills. Please try again.');
    }
  };

  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.institution) {
      Alert.alert('Required Fields', 'Please fill in degree and institution');
      return;
    }

    const updatedEducation = [...education, { ...newEducation }];
    setEducation(updatedEducation);
    setNewEducation({
      degree: '',
      institution: '',
      field: '',
      start_year: '',
      end_year: '',
    });
    setShowAddEducation(false);
  };

  const handleRemoveEducation = (index: number) => {
    Alert.alert(
      'Remove Education',
      'Are you sure you want to remove this education entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedEducation = education.filter((_, i) => i !== index);
            setEducation(updatedEducation);
          },
        },
      ]
    );
  };

  const handleSaveEducation = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        education: education.length > 0 ? education : undefined,
      });

      Alert.alert('Success', 'Education updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update education. Please try again.');
    }
  };

  const handleAddExperience = () => {
    if (!newExperience.title || !newExperience.company) {
      Alert.alert('Required Fields', 'Please fill in job title and company');
      return;
    }

    const updatedExperience = [...experience, { ...newExperience }];
    setExperience(updatedExperience);
    setNewExperience({
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      description: '',
      current: false,
    });
    setShowAddExperience(false);
  };

  const handleRemoveExperience = (index: number) => {
    Alert.alert(
      'Remove Experience',
      'Are you sure you want to remove this experience entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedExperience = experience.filter((_, i) => i !== index);
            setExperience(updatedExperience);
          },
        },
      ]
    );
  };

  const handleSaveExperience = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        experience: experience.length > 0 ? experience : undefined,
      });

      Alert.alert('Success', 'Experience updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update experience. Please try again.');
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
            Skills & Experience
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === 'skills' ? colors.accent : 'transparent',
            }}
            onPress={() => setActiveTab('skills')}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: activeTab === 'skills' ? colors.accent : colors.textMuted,
              }}
            >
              Skills
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === 'education' ? colors.accent : 'transparent',
            }}
            onPress={() => setActiveTab('education')}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: activeTab === 'education' ? colors.accent : colors.textMuted,
              }}
            >
              Education
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === 'experience' ? colors.accent : 'transparent',
            }}
            onPress={() => setActiveTab('experience')}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: activeTab === 'experience' ? colors.accent : colors.textMuted,
              }}
            >
              Experience
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <View>
              {/* Add Skill Input */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                  Add New Skill
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TextInput
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="e.g. JavaScript, React, Python"
                    placeholderTextColor={colors.textMuted + '80'}
                    style={{
                      flex: 1,
                      backgroundColor: colors.card,
                      borderWidth: 1.5,
                      borderColor: colors.cardBorder,
                      borderRadius: 12,
                      padding: 16,
                      color: colors.text,
                      fontSize: 16,
                    }}
                    onSubmitEditing={handleAddSkill}
                  />
                  <TouchableOpacity
                    onPress={handleAddSkill}
                    style={{
                      backgroundColor: colors.accent,
                      paddingHorizontal: 20,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Skills List */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                  Your Skills ({skillsArray.length})
                </Text>
                {skillsArray.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      padding: 24,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <Ionicons name="bulb-outline" size={48} color={colors.textMuted} />
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
                      No skills yet
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                      Add your skills to improve job matches
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {skillsArray.map((skill, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: colors.accent + '20',
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 20,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>
                          {skill}
                        </Text>
                        <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                          <Ionicons name="close-circle" size={18} color={colors.accent} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Save Button */}
              {skillsArray.length > 0 && (
                <TouchableOpacity
                  onPress={handleSaveSkills}
                  disabled={updateProfileMutation.isPending}
                  style={{
                    backgroundColor: colors.accent,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                      Save Skills
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <View>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                  Education History ({education.length})
                </Text>
                
                {education.length === 0 && !showAddEducation ? (
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      padding: 24,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: colors.cardBorder,
                      marginBottom: 16,
                    }}
                  >
                    <Ionicons name="school-outline" size={48} color={colors.textMuted} />
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
                      No education yet
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                      Add your education to boost your profile
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 12, marginBottom: 16 }}>
                    {education.map((edu, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          padding: 16,
                          borderWidth: 1.5,
                          borderColor: colors.cardBorder,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', flex: 1 }}>
                            {edu.degree}
                          </Text>
                          <TouchableOpacity onPress={() => handleRemoveEducation(index)}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                        <Text style={{ color: colors.accent, fontSize: 14, marginBottom: 4 }}>
                          {edu.institution}
                        </Text>
                        {edu.field && (
                          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>
                            {edu.field}
                          </Text>
                        )}
                        {(edu.start_year || edu.end_year) && (
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                            {edu.start_year} - {edu.end_year || 'Present'}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setShowAddEducation(!showAddEducation)}
                  style={{
                    backgroundColor: colors.accent + '20',
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Ionicons name={showAddEducation ? 'close' : 'add'} size={20} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '600' }}>
                    {showAddEducation ? 'Cancel' : 'Add Education'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showAddEducation && (
                <View style={{ gap: 12, marginBottom: 24 }}>
                  <TextInput
                    value={newEducation.degree}
                    onChangeText={(text) => setNewEducation({ ...newEducation, degree: text })}
                    placeholder="Degree *"
                    placeholderTextColor={colors.textMuted + '80'}
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1.5,
                      borderColor: colors.cardBorder,
                      borderRadius: 12,
                      padding: 16,
                      color: colors.text,
                    }}
                  />
                  <TextInput
                    value={newEducation.institution}
                    onChangeText={(text) => setNewEducation({ ...newEducation, institution: text })}
                    placeholder="Institution *"
                    placeholderTextColor={colors.textMuted + '80'}
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1.5,
                      borderColor: colors.cardBorder,
                      borderRadius: 12,
                      padding: 16,
                      color: colors.text,
                    }}
                  />
                  <TextInput
                    value={newEducation.field}
                    onChangeText={(text) => setNewEducation({ ...newEducation, field: text })}
                    placeholder="Field of Study"
                    placeholderTextColor={colors.textMuted + '80'}
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1.5,
                      borderColor: colors.cardBorder,
                      borderRadius: 12,
                      padding: 16,
                      color: colors.text,
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TextInput
                      value={newEducation.start_year}
                      onChangeText={(text) => setNewEducation({ ...newEducation, start_year: text })}
                      placeholder="Start Year"
                      placeholderTextColor={colors.textMuted + '80'}
                      keyboardType="numeric"
                      style={{
                        flex: 1,
                        backgroundColor: colors.card,
                        borderWidth: 1.5,
                        borderColor: colors.cardBorder,
                        borderRadius: 12,
                        padding: 16,
                        color: colors.text,
                      }}
                    />
                    <TextInput
                      value={newEducation.end_year}
                      onChangeText={(text) => setNewEducation({ ...newEducation, end_year: text })}
                      placeholder="End Year"
                      placeholderTextColor={colors.textMuted + '80'}
                      keyboardType="numeric"
                      style={{
                        flex: 1,
                        backgroundColor: colors.card,
                        borderWidth: 1.5,
                        borderColor: colors.cardBorder,
                        borderRadius: 12,
                        padding: 16,
                        color: colors.text,
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleAddEducation}
                    style={{
                      backgroundColor: colors.accent,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }}>
                      Add Education
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {education.length > 0 && !showAddEducation && (
                <TouchableOpacity
                  onPress={handleSaveEducation}
                  disabled={updateProfileMutation.isPending}
                  style={{
                    backgroundColor: colors.accent,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                      Save Education
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Experience Tab - Similar structure to Education */}
          {activeTab === 'experience' && (
            <View>
              <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginTop: 40 }}>
                Experience management coming soon!
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
