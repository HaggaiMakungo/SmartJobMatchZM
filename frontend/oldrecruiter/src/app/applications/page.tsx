'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  FileText,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';

type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED' | 'HIRED';

interface Job {
  id: number;
  title: string;
  location?: string;
}

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
}

interface Application {
  id: number;
  user_id: number;
  job_id: number;
  status: ApplicationStatus;
  applied_at: string;
  updated_at?: string;
  cover_letter?: string;
  resume_url?: string;
  recruiter_notes?: string;
  feedback?: string;
  rating?: number;
  job: Job;
  candidate: Candidate;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [jobFilter, setJobFilter] = useState<number | 'ALL'>('ALL');
  
  // Jobs for filter dropdown
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // View dialog
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Update status dialog
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<ApplicationStatus>('PENDING');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateFeedback, setUpdateFeedback] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadApplications();
      loadJobs();
    }
  }, [user, authLoading, router]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (jobFilter !== 'ALL') params.job_id = jobFilter;
      
      const response = await api.get('/recruiter/applications', { params });
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await api.get('/recruiter/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [statusFilter, jobFilter]);

  const openViewDialog = (app: Application) => {
    setSelectedApp(app);
    setIsViewOpen(true);
  };

  const openUpdateDialog = (app: Application) => {
    setSelectedApp(app);
    setUpdateStatus(app.status);
    setUpdateNotes(app.recruiter_notes || '');
    setUpdateFeedback(app.feedback || '');
    setIsUpdateOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    
    try {
      setUpdating(true);
      await api.put(`/recruiter/applications/${selectedApp.id}`, {
        status: updateStatus,
        recruiter_notes: updateNotes,
        feedback: updateFeedback,
      });
      
      setIsUpdateOpen(false);
      setSelectedApp(null);
      loadApplications();
    } catch (error) {
      console.error('Failed to update application:', error);
      alert('Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const configs = {
      PENDING: { label: 'Pending', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      REVIEWING: { label: 'Reviewing', variant: 'default' as const, icon: Eye, color: 'text-blue-600' },
      ACCEPTED: { label: 'Accepted', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      REJECTED: { label: 'Rejected', variant: 'secondary' as const, icon: XCircle, color: 'text-red-600' },
      HIRED: { label: 'Hired', variant: 'default' as const, icon: UserCheck, color: 'text-purple-600' },
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    return {
      pending: applications.filter(a => a.status === 'PENDING').length,
      reviewing: applications.filter(a => a.status === 'REVIEWING').length,
      accepted: applications.filter(a => a.status === 'ACCEPTED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
      hired: applications.filter(a => a.status === 'HIRED').length,
    };
  };

  const filteredApplications = applications.filter((app) =>
    app.candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const counts = getStatusCounts();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage candidate applications for your job postings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold mt-1">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviewing</p>
                <p className="text-2xl font-bold mt-1">{counts.reviewing}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold mt-1">{counts.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold mt-1">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hired</p>
                <p className="text-2xl font-bold mt-1">{counts.hired}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates or jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWING">Reviewing</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="HIRED">Hired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jobFilter.toString()} onValueChange={(value) => setJobFilter(value === 'ALL' ? 'ALL' : Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Applications Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.candidate.full_name}</div>
                        <div className="text-sm text-gray-500">{app.candidate.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.job.title}</div>
                        {app.job.location && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {app.job.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(app.applied_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(app.applied_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openUpdateDialog(app)}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* View Application Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review candidate application information
              </DialogDescription>
            </DialogHeader>
            
            {selectedApp && (
              <div className="space-y-6 py-4">
                {/* Candidate Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Candidate Information</h3>
                  <Card className="p-4 bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-lg">{selectedApp.candidate.full_name}</span>
                        {getStatusBadge(selectedApp.status)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedApp.candidate.email}
                      </div>
                      {selectedApp.candidate.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {selectedApp.candidate.phone}
                        </div>
                      )}
                      {selectedApp.candidate.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {selectedApp.candidate.location}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Job Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Position Applied For</h3>
                  <Card className="p-4 bg-blue-50">
                    <div className="font-medium">{selectedApp.job.title}</div>
                    {selectedApp.job.location && (
                      <div className="text-sm text-gray-600 mt-1">{selectedApp.job.location}</div>
                    )}
                  </Card>
                </div>

                {/* Cover Letter */}
                {selectedApp.cover_letter && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Cover Letter</h3>
                    <Card className="p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedApp.cover_letter}
                      </p>
                    </Card>
                  </div>
                )}

                {/* Resume */}
                {selectedApp.resume_url && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Resume</h3>
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Download Resume
                    </Button>
                  </div>
                )}

                {/* Recruiter Notes */}
                {selectedApp.recruiter_notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Notes</h3>
                    <Card className="p-4 bg-yellow-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedApp.recruiter_notes}
                      </p>
                    </Card>
                  </div>
                )}

                {/* Feedback */}
                {selectedApp.feedback && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Feedback Sent</h3>
                    <Card className="p-4 bg-green-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedApp.feedback}
                      </p>
                    </Card>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <div className="w-24 font-medium">Applied:</div>
                      <div>{new Date(selectedApp.applied_at).toLocaleString()}</div>
                    </div>
                    {selectedApp.updated_at && (
                      <div className="flex items-center text-gray-600">
                        <div className="w-24 font-medium">Updated:</div>
                        <div>{new Date(selectedApp.updated_at).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewOpen(false);
                if (selectedApp) openUpdateDialog(selectedApp);
              }}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Application</DialogTitle>
              <DialogDescription>
                Change status and add notes for {selectedApp?.candidate.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={updateStatus} onValueChange={(value) => setUpdateStatus(value as ApplicationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REVIEWING">Reviewing</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="HIRED">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <Textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add private notes about this candidate..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes are only visible to you and your team
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback to Candidate
                </label>
                <Textarea
                  value={updateFeedback}
                  onChange={(e) => setUpdateFeedback(e.target.value)}
                  placeholder="Provide feedback to the candidate (optional)..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This feedback may be shared with the candidate
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsUpdateOpen(false);
                  setSelectedApp(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? 'Updating...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
