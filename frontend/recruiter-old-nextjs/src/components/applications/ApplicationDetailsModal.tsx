'use client';

import { X, Mail, Phone, MapPin, Award, Calendar, Briefcase, GraduationCap, DollarSign, Clock, FileText, Download, Star, MessageSquare, CheckCircle, XCircle, Video } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ApplicationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  application: any;
  onStatusChange: (newStatus: string) => void;
}

export default function ApplicationDetailsModal({
  open,
  onClose,
  application,
  onStatusChange,
}: ApplicationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'notes'>('profile');
  const [notes, setNotes] = useState(application?.notes || []);
  const [newNote, setNewNote] = useState('');
  const [rating, setRating] = useState(application?.rating || 0);

  if (!open || !application) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      text: newNote,
      author: 'Current Recruiter',
      date: new Date().toISOString(),
    };
    setNotes([...notes, note]);
    setNewNote('');
    toast.success('Note added');
  };

  const handleRating = (value: number) => {
    setRating(value);
    toast.success(`Rated ${value} stars`);
  };

  const handleStatusChange = (status: string) => {
    onStatusChange(status);
    toast.success(`Application moved to ${status}`);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'screening': return 'bg-yellow-100 text-yellow-700';
      case 'interview': return 'bg-purple-100 text-purple-700';
      case 'offer': return 'bg-green-100 text-green-700';
      case 'hired': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const matchBreakdown = [
    { label: 'Skills Match', score: 92, color: 'bg-green-500' },
    { label: 'Experience', score: 85, color: 'bg-blue-500' },
    { label: 'Education', score: 78, color: 'bg-yellow-500' },
    { label: 'Location', score: 100, color: 'bg-emerald-500' },
  ];

  const timeline = [
    { status: 'Applied', date: application.appliedDate, completed: true },
    { status: 'Screening', date: application.status !== 'new' ? new Date().toISOString().split('T')[0] : null, completed: ['screening', 'interview', 'offer', 'hired'].includes(application.status) },
    { status: 'Interview', date: null, completed: ['interview', 'offer', 'hired'].includes(application.status) },
    { status: 'Offer', date: null, completed: ['offer', 'hired'].includes(application.status) },
    { status: 'Hired', date: null, completed: application.status === 'hired' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-tangerine/20 flex items-center justify-center text-tangerine font-bold text-2xl">
              {application.candidateName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">{application.candidateName}</h2>
              <p className="text-sage">{application.jobTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-sage" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="col-span-2 space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-sage/10">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'text-tangerine border-b-2 border-tangerine'
                      : 'text-sage hover:text-gunmetal'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'resume'
                      ? 'text-tangerine border-b-2 border-tangerine'
                      : 'text-sage hover:text-gunmetal'
                  }`}
                >
                  Resume
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'notes'
                      ? 'text-tangerine border-b-2 border-tangerine'
                      : 'text-sage hover:text-gunmetal'
                  }`}
                >
                  Notes ({notes.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg">
                        <Mail className="w-5 h-5 text-tangerine" />
                        <div>
                          <p className="text-xs text-sage">Email</p>
                          <p className="text-sm font-medium text-gunmetal dark:text-peach">{application.candidateEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg">
                        <Phone className="w-5 h-5 text-tangerine" />
                        <div>
                          <p className="text-xs text-sage">Phone</p>
                          <p className="text-sm font-medium text-gunmetal dark:text-peach">{application.candidatePhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg">
                        <MapPin className="w-5 h-5 text-tangerine" />
                        <div>
                          <p className="text-xs text-sage">Location</p>
                          <p className="text-sm font-medium text-gunmetal dark:text-peach">{application.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg">
                        <Clock className="w-5 h-5 text-tangerine" />
                        <div>
                          <p className="text-xs text-sage">Availability</p>
                          <p className="text-sm font-medium text-gunmetal dark:text-peach">{application.availability}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Professional Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-sage/5 rounded-lg">
                        <Briefcase className="w-5 h-5 text-tangerine mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-sage">Experience</p>
                          <p className="text-sm font-medium text-gunmetal dark:text-peach">{application.experience}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-sage/5 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-tangerine mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-sage">Education</p>
                          <p className="text-sm font-medium text-gunmetal dark:text-peach">{application.education}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-sage/5 rounded-lg">
                        <DollarSign className="w-5 h-5 text-tangerine mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-sage">Expected Salary</p>
                          <p className="text-sm font-medium text-gunmetal dark:text-peach">{application.expectedSalary}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-tangerine/10 text-tangerine rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-3">Cover Letter</h3>
                    <div className="p-4 bg-sage/5 rounded-lg">
                      <p className="text-sm text-sage leading-relaxed">{application.coverLetter}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resume' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach">Resume</h3>
                    <button
                      onClick={() => toast.success('Downloading resume...')}
                      className="flex items-center gap-2 px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="border-2 border-dashed border-sage/30 rounded-lg p-12 text-center">
                    <FileText className="w-16 h-16 text-sage mx-auto mb-4 opacity-50" />
                    <p className="text-sage mb-2">Resume Preview</p>
                    <p className="text-sm text-sage/70">{application.resumeUrl}</p>
                    <p className="text-xs text-sage/50 mt-4">PDF viewer would be embedded here</p>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gunmetal dark:text-peach">Recruiter Notes</h3>
                  
                  {/* Add Note */}
                  <div className="space-y-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this candidate..."
                      className="w-full px-4 py-3 border border-sage/30 rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Add Note
                    </button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <div className="text-center py-8 text-sage">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No notes yet</p>
                      </div>
                    ) : (
                      notes.map((note: any, i: number) => (
                        <div key={i} className="p-4 bg-sage/5 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-gunmetal dark:text-peach">{note.author || 'Recruiter'}</span>
                            <span className="text-xs text-sage">
                              {typeof note === 'string' ? 'Just now' : new Date(note.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-sage">{typeof note === 'string' ? note : note.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Match Score & Actions */}
            <div className="space-y-6">
              {/* Match Score */}
              <div className="bg-gradient-to-br from-tangerine to-tangerine/80 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">Match Score</span>
                </div>
                <div className="text-5xl font-bold mb-4">{application.matchScore}%</div>
                <p className="text-sm text-white/90">Highly qualified for this position</p>
              </div>

              {/* Match Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gunmetal dark:text-peach">Match Breakdown</h4>
                {matchBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-sage">{item.label}</span>
                      <span className="text-sm font-medium text-gunmetal dark:text-peach">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-sage/20 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-gunmetal dark:text-peach mb-2">Your Rating</h4>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRating(value)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          value <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-sage/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-gunmetal dark:text-peach mb-3">Application Timeline</h4>
                <div className="space-y-3">
                  {timeline.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500' : 'bg-sage/20'
                      }`}>
                        {step.completed && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          step.completed ? 'text-gunmetal dark:text-peach' : 'text-sage'
                        }`}>
                          {step.status}
                        </p>
                        {step.date && (
                          <p className="text-xs text-sage">
                            {new Date(step.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gunmetal dark:text-peach mb-3">Quick Actions</h4>
                <button
                  onClick={() => handleStatusChange('interview')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Move to Interview
                </button>
                <button
                  onClick={() => toast.success('Opening calendar...')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <Video className="w-4 h-4" />
                  Schedule Interview
                </button>
                <button
                  onClick={() => toast.success('Opening email client...')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
