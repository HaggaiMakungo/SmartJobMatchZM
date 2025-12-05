'use client';

import { X, Mail, Phone, MapPin, Briefcase, Calendar, FileText, Star, MessageSquare, Send, UserPlus, FolderPlus, Download, Share2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface CandidateProfileModalProps {
  candidate: any;
  onClose: () => void;
}

export default function CandidateProfileModal({ candidate, onClose }: CandidateProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'applications'>('overview');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Active Seeker': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Passive': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      'In Pipeline': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Contacted': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Interview Scheduled': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  // Mock data
  const workExperience = [
    {
      title: 'Senior Frontend Developer',
      company: 'Tech Solutions Ltd',
      period: '2021 - Present',
      description: 'Led development of React-based applications, mentored junior developers, and implemented CI/CD pipelines.'
    },
    {
      title: 'Frontend Developer',
      company: 'Digital Agency',
      period: '2018 - 2021',
      description: 'Built responsive web applications using React and TypeScript. Collaborated with designers and backend teams.'
    }
  ];

  const education = [
    {
      degree: 'BSc Computer Science',
      institution: 'University of Zambia',
      year: '2018'
    }
  ];

  const certifications = ['AWS Certified Developer', 'React Professional Certificate'];

  const applications = [
    { job: 'Senior React Developer', date: '2024-01-15', status: 'In Review' },
    { job: 'Full Stack Engineer', date: '2024-01-10', status: 'Interview Scheduled' }
  ];

  const matchBreakdown = [
    { category: 'Skills Match', score: 95, details: 'Strong alignment with React, TypeScript, Next.js' },
    { category: 'Experience Level', score: 90, details: '6 years matches senior role requirements' },
    { category: 'Location', score: 100, details: 'Based in target location' },
    { category: 'Availability', score: 95, details: 'Actively seeking opportunities' }
  ];

  return (
    <div className="fixed inset-0 bg-gunmetal/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gunmetal/95 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-tangerine to-peach p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <img src={candidate.photo} alt={candidate.name} className="w-20 h-20 rounded-full ring-4 ring-white/50" />
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {candidate.name}
                  {candidate.saved && <Star className="w-5 h-5 fill-white" />}
                </h2>
                <p className="text-white/90">{candidate.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {candidate.experience} years
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Match Score and Status */}
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-3xl font-bold">{candidate.matchScore}%</div>
              <div className="text-sm text-white/80">Match Score</div>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(candidate.status)} backdrop-blur-sm`}>
              {candidate.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-sage/20">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-tangerine text-tangerine'
                      : 'border-transparent text-sage hover:text-gunmetal dark:hover:text-peach'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('experience')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'experience'
                      ? 'border-tangerine text-tangerine'
                      : 'border-transparent text-sage hover:text-gunmetal dark:hover:text-peach'
                  }`}
                >
                  Experience
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'applications'
                      ? 'border-tangerine text-tangerine'
                      : 'border-transparent text-sage hover:text-gunmetal dark:hover:text-peach'
                  }`}
                >
                  Applications
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sage">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${candidate.email}`} className="hover:text-tangerine">{candidate.email}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${candidate.phone}`} className="hover:text-tangerine">{candidate.phone}</a>
                      </div>
                    </div>
                  </div>

                  {/* Professional Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Professional Summary</h3>
                    <p className="text-sage leading-relaxed">
                      Experienced frontend developer with {candidate.experience} years of expertise in building scalable web applications. 
                      Passionate about creating intuitive user experiences and writing clean, maintainable code. 
                      Strong background in React ecosystem and modern JavaScript frameworks.
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Git', 'REST APIs'].map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-tangerine/10 text-tangerine text-sm font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match Score Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Match Score Breakdown</h3>
                    <div className="space-y-3">
                      {matchBreakdown.map((item, idx) => (
                        <div key={idx} className="bg-sage/5 dark:bg-gunmetal/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gunmetal dark:text-peach">{item.category}</span>
                            <span className={`text-lg font-bold ${getMatchScoreColor(item.score).split(' ')[0]}`}>
                              {item.score}%
                            </span>
                          </div>
                          <p className="text-sm text-sage">{item.details}</p>
                          <div className="mt-2 h-2 bg-sage/10 rounded-full overflow-hidden">
                            <div className="h-full bg-tangerine rounded-full transition-all" style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  {/* Work Experience */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Work Experience</h3>
                    <div className="space-y-4">
                      {workExperience.map((exp, idx) => (
                        <div key={idx} className="border-l-2 border-tangerine pl-4">
                          <h4 className="font-semibold text-gunmetal dark:text-peach">{exp.title}</h4>
                          <p className="text-sm text-sage mb-1">{exp.company} • {exp.period}</p>
                          <p className="text-sm text-sage">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Education</h3>
                    {education.map((edu, idx) => (
                      <div key={idx} className="bg-sage/5 dark:bg-gunmetal/30 rounded-lg p-4">
                        <h4 className="font-semibold text-gunmetal dark:text-peach">{edu.degree}</h4>
                        <p className="text-sm text-sage">{edu.institution} • {edu.year}</p>
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((cert, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium rounded-full">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Resume */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Resume</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-tangerine/10 text-tangerine hover:bg-tangerine/20 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                      Download Resume (PDF)
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gunmetal dark:text-peach">Application History</h3>
                  {applications.map((app, idx) => (
                    <div key={idx} className="bg-sage/5 dark:bg-gunmetal/30 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gunmetal dark:text-peach">{app.job}</h4>
                        <p className="text-sm text-sage">Applied on {app.date}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium rounded-full">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes Section */}
              <div>
                <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Recruiter Notes (Private)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this candidate..."
                  rows={4}
                  className="w-full px-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach resize-none"
                />
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Your Rating</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-tangerine text-tangerine' : 'text-sage/30'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Sidebar */}
            <div className="w-64 space-y-3">
              <h3 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">Quick Actions</h3>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors">
                <Send className="w-4 h-4" />
                Invite to Job
              </button>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors">
                <Star className="w-4 h-4" />
                {candidate.saved ? 'Remove from Saved' : 'Save Candidate'}
              </button>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors">
                <FolderPlus className="w-4 h-4" />
                Add to Pool
              </button>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors">
                <Share2 className="w-4 h-4" />
                Share Profile
              </button>

              {/* Activity Timeline */}
              <div className="mt-6 pt-6 border-t border-sage/20">
                <h4 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">Activity Timeline</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="text-gunmetal dark:text-peach">Profile Updated</p>
                      <p className="text-xs text-sage">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                      <p className="text-gunmetal dark:text-peach">Applied to Job</p>
                      <p className="text-xs text-sage">5 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                    <div>
                      <p className="text-gunmetal dark:text-peach">Joined Platform</p>
                      <p className="text-xs text-sage">3 months ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
