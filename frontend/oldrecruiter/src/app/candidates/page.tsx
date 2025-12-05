'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Send,
  ChevronDown
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  category?: string;
  location?: string;
}

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  location?: string;
  designation?: string;
  summary?: string;
  skills: string[];
  experience_years: number;
  education?: string;
  match_score: number;
  match_explanation: string;
  collar_type: string;
  component_scores: {
    qualification: number;
    experience: number;
    skills: number;
    location: number;
  };
}

export default function CandidatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(50);
  
  // Invitation dialog
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadJobs();
    }
  }, [user, authLoading, router]);

  const loadJobs = async () => {
    try {
      const response = await api.get('/recruiter/jobs', {
        params: { is_active: true }
      });
      setJobs(response.data);
      if (response.data.length > 0 && !selectedJobId) {
        setSelectedJobId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const searchCandidates = async () => {
    if (!selectedJobId) return;
    
    try {
      setLoading(true);
      const response = await api.get('/recruiter/candidates/search', {
        params: {
          job_id: selectedJobId,
          min_match_score: minMatchScore,
          limit: 20
        }
      });
      setCandidates(response.data);
    } catch (error) {
      console.error('Failed to search candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      searchCandidates();
    }
  }, [selectedJobId, minMatchScore]);

  const handleInvite = async () => {
    if (!selectedCandidate || !selectedJobId) return;
    
    try {
      setInviting(true);
      await api.post('/recruiter/invitations', {
        candidate_id: selectedCandidate.id,
        job_id: selectedJobId,
        message: inviteMessage
      });
      
      alert('Invitation sent successfully!');
      setIsInviteOpen(false);
      setSelectedCandidate(null);
      setInviteMessage('');
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      alert(error.detail || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const openInviteDialog = (candidate: Candidate) => {
    const job = jobs.find(j => j.id === selectedJobId);
    setSelectedCandidate(candidate);
    setInviteMessage(
      `Hi ${candidate.full_name},\n\n` +
      `I came across your profile and think you'd be a great fit for our ${job?.title} position at ${user?.company_name || 'our company'}.\n\n` +
      `Based on your experience and skills, you're a ${candidate.match_score}% match for this role. ` +
      `I'd love to discuss this opportunity with you.\n\n` +
      `Would you be interested in applying?\n\n` +
      `Best regards,\n${user?.full_name}`
    );
    setIsInviteOpen(true);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getCollarBadgeColor = (collar: string) => {
    const colors: Record<string, string> = {
      white: 'bg-blue-100 text-blue-700',
      blue: 'bg-indigo-100 text-indigo-700',
      pink: 'bg-pink-100 text-pink-700',
      green: 'bg-green-100 text-green-700',
      grey: 'bg-gray-100 text-gray-700',
      default: 'bg-gray-100 text-gray-700'
    };
    return colors[collar] || colors.default;
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Discovery</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered candidate matching for your job openings
          </p>
        </div>

        {/* Job Selector & Filters */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Job Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job Position
              </label>
              <div className="relative">
                <select
                  value={selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(Number(e.target.value))}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                >
                  <option value="">Select a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Search & Match Score Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Min Match Score: {minMatchScore}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {selectedJob && (
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                <Briefcase className="h-4 w-4" />
                <span>Searching for: <strong>{selectedJob.title}</strong></span>
                <span className="mx-2">•</span>
                <MapPin className="h-4 w-4" />
                <span>{selectedJob.location}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        {!loading && selectedJobId && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found <strong>{filteredCandidates.length}</strong> matching candidates
            </p>
            <Button variant="outline" size="sm" onClick={searchCandidates}>
              🔄 Refresh Results
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Finding best matches...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedJobId && (
          <Card className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Job to Find Candidates
            </h3>
            <p className="text-gray-500">
              Choose a job position from the dropdown above to discover matching candidates
            </p>
          </Card>
        )}

        {/* No Results */}
        {!loading && selectedJobId && filteredCandidates.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Candidates Found
            </h3>
            <p className="text-gray-500 mb-4">
              Try lowering the minimum match score or adjusting your search
            </p>
            <Button onClick={() => setMinMatchScore(30)}>
              Lower Match Score to 30%
            </Button>
          </Card>
        )}

        {/* Candidate Cards Grid */}
        {!loading && filteredCandidates.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header with Match Score */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {candidate.full_name}
                      </h3>
                      {candidate.designation && (
                        <p className="text-sm text-gray-600 mt-1">
                          {candidate.designation}
                        </p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-center ${getMatchScoreColor(candidate.match_score)}`}>
                      <div className="text-lg font-bold">{candidate.match_score}%</div>
                      <div className="text-xs">Match</div>
                    </div>
                  </div>

                  {/* Location */}
                  {candidate.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {candidate.location}
                    </div>
                  )}

                  {/* Experience & Education */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {candidate.experience_years} years
                    </div>
                    {candidate.education && (
                      <div className="flex items-center text-gray-600">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        {candidate.education}
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Match Explanation */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {candidate.match_explanation}
                    </p>
                  </div>

                  {/* Component Scores */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Skills</span>
                        <span className="font-medium">{candidate.component_scores.skills}%</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${candidate.component_scores.skills}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-medium">{candidate.component_scores.experience}%</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${candidate.component_scores.experience}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Collar Badge & Invite Button */}
                  <div className="flex items-center justify-between pt-2">
                    <Badge className={getCollarBadgeColor(candidate.collar_type)}>
                      {candidate.collar_type} collar
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => openInviteDialog(candidate)}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Invite
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Invite Dialog */}
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite Candidate to Apply</DialogTitle>
              <DialogDescription>
                Send a personalized invitation to {selectedCandidate?.full_name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedCandidate && (
              <div className="space-y-4 py-4">
                {/* Candidate Summary */}
                <Card className="p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{selectedCandidate.full_name}</h4>
                      <p className="text-sm text-gray-600">{selectedCandidate.designation}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedCandidate.email}</p>
                    </div>
                    <Badge className={`${getMatchScoreColor(selectedCandidate.match_score)} border-0`}>
                      {selectedCandidate.match_score}% Match
                    </Badge>
                  </div>
                </Card>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Message
                  </label>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={10}
                    placeholder="Write a personalized message..."
                    className="font-sans"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Personalize the message to increase response rate
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsInviteOpen(false);
                  setSelectedCandidate(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleInvite} 
                disabled={inviting || !inviteMessage.trim()}
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
