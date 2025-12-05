import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Download, MessageSquare, Send, Tag } from 'lucide-react';
import { useState } from 'react';

interface Candidate {
  cv_id: string;
  full_name: string;
  email: string;
  phone: string;
  current_job_title: string;
  city: string;
  province: string;
  total_years_experience: number;
  skills_technical: string;
  skills_soft: string;
  education_level: string;
  match_score?: number;
}

interface CandidateModalProps {
  candidate: Candidate;
  onClose: () => void;
  onOpenNotes: () => void;
  onOpenCommunication: () => void;
}

export default function CandidateModal({ candidate, onClose, onOpenNotes, onOpenCommunication }: CandidateModalProps) {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('Video Call');

  const matchScore = candidate.match_score ? Math.round(candidate.match_score * 100) : 0;
  const technicalSkills = candidate.skills_technical?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const softSkills = candidate.skills_soft?.split(',').map(s => s.trim()).filter(Boolean) || [];

  const scheduleInterview = () => {
    if (!interviewDate || !interviewTime) {
      alert('Please select date and time');
      return;
    }
    alert(`Interview scheduled for ${interviewDate} at ${interviewTime}`);
    // TODO: Persist to backend
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8555] p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{candidate.full_name}</h2>
              <p className="text-white/90 mb-3">{candidate.current_job_title || 'Job Seeker'}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.city}, {candidate.province}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
                <div className="text-2xl font-bold">{matchScore}%</div>
                <div className="text-xs text-white/80">Match</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Profile */}
            <div className="col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onOpenNotes}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Notes & Collaboration
                </button>
                <button
                  onClick={onOpenCommunication}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Communication History
                </button>
                <button className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8555] text-white rounded-lg flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  Download CV
                </button>
              </div>

              {/* Experience & Education */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Experience</h3>
                </div>
                <p className="text-gray-700">{candidate.total_years_experience} years of professional experience</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Education</h3>
                </div>
                <p className="text-gray-700">{candidate.education_level || 'Not specified'}</p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {technicalSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Interview Scheduling */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#FF6B35]" />
                  <h3 className="font-semibold text-gray-900">Schedule Interview</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    >
                      <option>Video Call</option>
                      <option>Phone Call</option>
                      <option>In-Person</option>
                    </select>
                  </div>

                  <button
                    onClick={scheduleInterview}
                    className="w-full px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8555] text-white rounded-lg font-medium transition-colors"
                  >
                    Schedule Interview
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-[#FF6B35]/10 text-[#FF6B35] text-xs rounded-full">High Priority</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Tech</span>
                </div>
                <button className="mt-2 text-sm text-[#FF6B35] hover:text-[#FF8555]">
                  + Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
