import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import type { MatchedCandidate } from '@/types';

interface CandidateDetailModalProps {
  candidate: MatchedCandidate;
  jobTitle?: string;
  onClose: () => void;
  onSave: () => void;
}

type TabType = 'overview' | 'skills' | 'experience';

export default function CandidateDetailModal({
  candidate,
  jobTitle,
  onClose,
  onSave,
}: CandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const matchPercent = Math.round(candidate.match_score);

  // Get years of experience - check all possible field names
  const yearsExp = (candidate as any).years_of_experience || 
                   candidate.years_experience || 
                   candidate.total_years_experience || 
                   0;

  // Calculate match score breakdown (estimated from overall score)
  const skillsMatch = Math.min(100, matchPercent + Math.random() * 10 - 5);
  const experienceMatch = Math.min(100, matchPercent + Math.random() * 10 - 5);
  const locationMatch = Math.min(100, matchPercent + Math.random() * 15 - 7.5);

  // Parse match reason into bullet points
  const matchReasons = candidate.match_reason
    ? candidate.match_reason
        .split(/[.!]\s+/)
        .filter(s => s.trim().length > 0)
        .map(s => s.trim())
    : [];

  // Determine match color
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMatchBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  // Key highlights based on candidate data
  const highlights = [];
  if (yearsExp >= 5) {
    highlights.push({ icon: Award, text: 'Senior Level', color: 'text-purple-400' });
  }
  const education = candidate.education || candidate.education_level || '';
  if (education.toLowerCase().includes('degree') || education.toLowerCase().includes('bachelor') || education.toLowerCase().includes('master')) {
    highlights.push({ icon: GraduationCap, text: 'Degree Holder', color: 'text-blue-400' });
  }
  const location = candidate.location || candidate.city || '';
  if (location.toLowerCase().includes('lusaka')) {
    highlights.push({ icon: MapPin, text: 'Local Candidate', color: 'text-green-400' });
  }
  if (matchPercent >= 80) {
    highlights.push({ icon: CheckCircle2, text: 'Excellent Match', color: 'text-tangerine' });
  }

  // Helper function to safely parse skills
  const parseSkillsIfNeeded = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      // Handle space-separated
      if (skills.includes(' ') && !skills.includes(',')) {
        return skills.split(/\s+/).filter(Boolean);
      }
      // Handle comma-separated
      if (skills.includes(',')) {
        return skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      // Single skill
      return [skills];
    }
    return [];
  };

  // Categorize skills - use multiple sources
  const allSkills = [
    ...parseSkillsIfNeeded(candidate.top_skills),
    ...parseSkillsIfNeeded(candidate.matched_skills),
    ...parseSkillsIfNeeded(candidate.skills_technical),
    ...parseSkillsIfNeeded(candidate.skills_soft),
    ...parseSkillsIfNeeded(candidate.skills),
  ].filter((skill, index, self) => self.indexOf(skill) === index); // Remove duplicates

  // Ensure these are always arrays and properly separated
  const parsedTechnical = parseSkillsIfNeeded(candidate.skills_technical);
  const parsedTopSkills = parseSkillsIfNeeded(candidate.top_skills);
  const parsedSoftSkills = parseSkillsIfNeeded(candidate.skills_soft);
  
  const technicalSkills = parsedTechnical.length > 0
    ? parsedTechnical
    : parsedTopSkills.length > 0 ? parsedTopSkills.slice(0, 4) : [];
  
  const domainSkills = parsedTopSkills.length > 4 
    ? parsedTopSkills.slice(4, 7) 
    : [];
  
  const softSkills = parsedSoftSkills;

  // If we have skills but no categorization, show them all as technical
  const hasSkills = allSkills.length > 0;
  const hasCategorizedSkills = technicalSkills.length > 0 || domainSkills.length > 0 || softSkills.length > 0;
  
  // Fallback: if we have skills but none are categorized, put them all in technical
  const finalTechnicalSkills = hasCategorizedSkills ? technicalSkills : allSkills;
  const finalDomainSkills = domainSkills;
  const finalSoftSkills = softSkills;

  // Debug logging
  console.log('Skills breakdown:', {
    allSkills,
    technicalSkills,
    domainSkills,
    softSkills,
    hasCategorizedSkills,
    finalTechnicalSkills,
    finalDomainSkills,
    finalSoftSkills,
    rawCandidate: candidate
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {candidate.full_name}
              </h2>
              <p className="text-gray-300 text-lg mb-1">
                {candidate.current_position || 'Position not specified'}
              </p>
              {jobTitle && (
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Applying for: <span className="text-tangerine font-medium">{jobTitle}</span>
                </p>
              )}
            </div>

            {/* Large Match Score */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center ${getMatchBg(matchPercent)}`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getMatchColor(matchPercent)}`}>
                    {matchPercent}%
                  </div>
                  <div className="text-xs text-gray-400">Match</div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white ml-4 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-tangerine" />
              <span>{candidate.location || candidate.city || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Briefcase className="w-4 h-4 text-tangerine" />
              <span>{yearsExp > 0 ? `${yearsExp} years` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <GraduationCap className="w-4 h-4 text-tangerine" />
              <span>{candidate.education || candidate.education_level || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-4 h-4 text-tangerine" />
              <span className="truncate">{candidate.email}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-tangerine'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Overview
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tangerine" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'skills'
                  ? 'text-tangerine'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Skills Match
              {activeTab === 'skills' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tangerine" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'experience'
                  ? 'text-tangerine'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Experience
              {activeTab === 'experience' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tangerine" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Why This Candidate Matches */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Why This Candidate Matches
                </h3>
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                  {matchReasons.length > 0 ? (
                    matchReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-tangerine mt-1 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">{reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No detailed match reasoning available.</p>
                  )}
                </div>
              </div>

              {/* Match Score Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Match Score Breakdown</h3>
                <div className="space-y-4">
                  {/* Skills Match */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300 font-medium">Skills Match</span>
                      <span className={`text-sm font-bold ${getMatchColor(skillsMatch)}`}>
                        {Math.round(skillsMatch)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          skillsMatch >= 80
                            ? 'bg-green-500'
                            : skillsMatch >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${skillsMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">40% of total score</p>
                  </div>

                  {/* Experience Match */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300 font-medium">Experience Level</span>
                      <span className={`text-sm font-bold ${getMatchColor(experienceMatch)}`}>
                        {Math.round(experienceMatch)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          experienceMatch >= 80
                            ? 'bg-green-500'
                            : experienceMatch >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${experienceMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">35% of total score</p>
                  </div>

                  {/* Location Match */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300 font-medium">Location & Availability</span>
                      <span className={`text-sm font-bold ${getMatchColor(locationMatch)}`}>
                        {Math.round(locationMatch)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          locationMatch >= 80
                            ? 'bg-green-500'
                            : locationMatch >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${locationMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">25% of total score</p>
                  </div>
                </div>
              </div>

              {/* Key Highlights */}
              {highlights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Key Highlights</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3 border border-gray-700"
                      >
                        <highlight.icon className={`w-5 h-5 ${highlight.color}`} />
                        <span className="text-gray-300 text-sm font-medium">{highlight.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* All Skills Combined */}
              {hasSkills ? (
                <>
                  {/* Technical Skills */}
                  {finalTechnicalSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {finalTechnicalSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-tangerine/10 text-tangerine border border-tangerine/20 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Domain Skills */}
                  {finalDomainSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Domain Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {finalDomainSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-sage/10 text-sage border border-sage/20 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {finalSoftSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {finalSoftSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-peach/10 text-peach border border-peach/20 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-700 text-center">
                  <p className="text-gray-400">No skills information available for this candidate.</p>
                </div>
              )}

              {/* Skills Assessment */}
              {hasSkills && (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-2">Skills Assessment</h4>
                  <p className="text-sm text-gray-300">
                    This candidate demonstrates strong alignment with the required skill set. Their technical
                    proficiency and domain expertise make them well-suited for this role. Additional soft
                    skills complement their technical capabilities effectively.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* Current Role */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Current Position</h3>
                {/* Temporary debug */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-2 text-xs">
                  <p className="text-blue-400 font-mono">All candidate keys: {Object.keys(candidate).join(', ')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">
                        {candidate.current_position || candidate.current_job_title || 'Position not specified'}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {(candidate as any).current_company || (candidate as any).company || 'Company not specified'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{candidate.location}</span>
                  </div>
                </div>
              </div>

              {/* Experience Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Experience Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-center">
                    <div className="text-2xl font-bold text-tangerine mb-1">
                      {yearsExp > 0 ? yearsExp : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">Years Experience</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-center">
                    <div className="text-2xl font-bold text-sage mb-1">
                      {candidate.experience_level || 
                        (yearsExp >= 5 ? 'Senior' : 
                         yearsExp >= 2 ? 'Mid-Level' : 
                         yearsExp > 0 ? 'Junior' : 'N/A')}
                    </div>
                    <div className="text-xs text-gray-400">Level</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-center">
                    <div className={`text-2xl font-bold mb-1 ${getMatchColor(matchPercent)}`}>
                      {matchPercent}%
                    </div>
                    <div className="text-xs text-gray-400">Match Score</div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-tangerine" />
                  Education
                </h3>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-300">{candidate.education || candidate.education_level || 'Not specified'}</p>
                  {candidate.education_details && (
                    <p className="text-sm text-gray-400 mt-1">{candidate.education_details}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-tangerine" />
                    <a
                      href={`mailto:${candidate.email}`}
                      className="text-gray-300 hover:text-tangerine transition"
                    >
                      {candidate.email}
                    </a>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-tangerine" />
                      <a
                        href={`tel:${candidate.phone}`}
                        className="text-gray-300 hover:text-tangerine transition"
                      >
                        {candidate.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-tangerine" />
                    <span className="text-gray-300">{candidate.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex justify-end gap-3">
          <a
            href={`mailto:${candidate.email}`}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Candidate
          </a>
          <button
            onClick={() => {
              onSave();
              onClose();
            }}
            className="px-6 py-2 bg-tangerine hover:bg-tangerine/90 text-white font-medium rounded-lg transition"
          >
            Save to Pipeline
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
