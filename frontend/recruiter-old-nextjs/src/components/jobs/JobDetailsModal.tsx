'use client';

import { X, MapPin, Briefcase, Clock, Eye, Users, TrendingUp, Edit, Share2, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockApplicationsData = [
  { date: 'Mon', apps: 8 },
  { date: 'Tue', apps: 12 },
  { date: 'Wed', apps: 10 },
  { date: 'Thu', apps: 15 },
  { date: 'Fri', apps: 18 },
  { date: 'Sat', apps: 5 },
  { date: 'Sun', apps: 3 },
];

const mockRecentApplicants = [
  { id: 1, name: 'John Mwansa', role: 'Senior Developer', match: 92, time: '2h ago', avatar: 'JM' },
  { id: 2, name: 'Sarah Phiri', role: 'Full Stack Dev', match: 88, time: '5h ago', avatar: 'SP' },
  { id: 3, name: 'David Banda', role: 'Backend Developer', match: 85, time: '1d ago', avatar: 'DB' },
  { id: 4, name: 'Grace Zulu', role: 'Software Engineer', match: 82, time: '1d ago', avatar: 'GZ' },
  { id: 5, name: 'Peter Mulenga', role: 'Junior Developer', match: 75, time: '2d ago', avatar: 'PM' },
];

export default function JobDetailsModal({ open, onClose, job }: any) {
  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 bg-gunmetal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gunmetal rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-sage/10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach mb-2">{job.title}</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-tangerine/10 text-tangerine rounded-full text-sm font-medium">{job.department}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'active' ? 'bg-green-100 text-green-700' : 
                job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-sage">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.workArrangement || 'Full-time'}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Posted {job.postedDate}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-sage" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-sage/5 rounded-lg p-4 border border-sage/10">
                  <Eye className="w-5 h-5 text-tangerine mb-2" />
                  <p className="text-2xl font-bold text-gunmetal dark:text-peach">1,247</p>
                  <p className="text-sm text-sage">Views</p>
                </div>
                <div className="bg-sage/5 rounded-lg p-4 border border-sage/10">
                  <Users className="w-5 h-5 text-peach mb-2" />
                  <p className="text-2xl font-bold text-gunmetal dark:text-peach">{job.applications}</p>
                  <p className="text-sm text-sage">Applications</p>
                </div>
                <div className="bg-sage/5 rounded-lg p-4 border border-sage/10">
                  <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-gunmetal dark:text-peach">{job.matchScore}%</p>
                  <p className="text-sm text-sage">Avg Match</p>
                </div>
              </div>

              {/* Applications Trend */}
              <div className="bg-white dark:bg-gunmetal/40 rounded-xl p-4 border border-sage/10">
                <h3 className="font-bold text-gunmetal dark:text-peach mb-4">Applications This Week</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mockApplicationsData}>
                    <XAxis dataKey="date" stroke="#b8b08d" />
                    <YAxis stroke="#b8b08d" />
                    <Tooltip contentStyle={{ backgroundColor: '#202c39', border: '1px solid #b8b08d30', borderRadius: '8px', color: '#f2d492' }} />
                    <Line type="monotone" dataKey="apps" stroke="#f29559" strokeWidth={2} dot={{ fill: '#f29559' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-bold text-gunmetal dark:text-peach mb-3">Job Description</h3>
                <p className="text-sage leading-relaxed">
                  We're looking for a talented {job.title} to join our growing team. You'll work on exciting projects, 
                  collaborate with cross-functional teams, and have the opportunity to make a significant impact on our products and services.
                </p>
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="text-lg font-bold text-gunmetal dark:text-peach mb-3">Key Responsibilities</h3>
                <ul className="space-y-2 text-sage">
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>Lead development of new features and enhancements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>Collaborate with product managers and designers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>Mentor junior team members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>Participate in code reviews and technical discussions</span>
                  </li>
                </ul>
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="text-lg font-bold text-gunmetal dark:text-peach mb-3">Required Qualifications</h3>
                <ul className="space-y-2 text-sage">
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>5+ years of professional experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>Strong knowledge of modern web technologies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>Excellent problem-solving skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tangerine mt-1">•</span>
                    <span>Great communication and teamwork abilities</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-sage/5 rounded-xl p-4 border border-sage/10">
                <h3 className="font-bold text-gunmetal dark:text-peach mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-all">
                    <Edit className="w-4 h-4" />
                    Edit Job
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-sage hover:bg-sage/10 text-gunmetal dark:text-peach rounded-lg font-medium transition-all">
                    <Share2 className="w-4 h-4" />
                    Share Job
                  </button>
                  {job.status === 'active' && (
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg font-medium transition-all">
                      <XCircle className="w-4 h-4" />
                      Close Posting
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Applicants */}
              <div className="bg-white dark:bg-gunmetal/40 rounded-xl p-4 border border-sage/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gunmetal dark:text-peach">Recent Applicants</h3>
                  <button className="text-xs text-tangerine hover:text-tangerine/80 font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  {mockRecentApplicants.map(applicant => (
                    <div key={applicant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-sage/5 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-tangerine/10 flex items-center justify-center text-tangerine font-semibold">
                        {applicant.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gunmetal dark:text-peach truncate">{applicant.name}</p>
                        <p className="text-xs text-sage">{applicant.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-tangerine">{applicant.match}%</p>
                        <p className="text-xs text-sage">{applicant.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Info */}
              <div className="bg-sage/5 rounded-xl p-4 border border-sage/10">
                <h3 className="font-bold text-gunmetal dark:text-peach mb-3">Job Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sage">Job ID:</span>
                    <span className="font-medium text-gunmetal dark:text-peach">#{job.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage">Created:</span>
                    <span className="font-medium text-gunmetal dark:text-peach">{job.postedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage">Deadline:</span>
                    <span className="font-medium text-gunmetal dark:text-peach">30 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage">Salary Range:</span>
                    <span className="font-medium text-gunmetal dark:text-peach">Competitive</span>
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
