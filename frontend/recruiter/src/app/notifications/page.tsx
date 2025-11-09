'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  Briefcase,
  Calendar,
  MessageSquare,
  Bell,
  BellOff,
} from 'lucide-react';

type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface Job {
  id: number;
  title: string;
  location?: string;
}

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  location?: string;
}

interface Invitation {
  id: number;
  recruiter_id: number;
  candidate_id: number;
  job_id: number;
  message: string;
  status: InvitationStatus;
  sent_at: string;
  responded_at?: string;
  expires_at: string;
  job: Job;
  candidate: Candidate;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'ALL'>('ALL');
  
  // View details dialog
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadInvitations();
    }
  }, [user, authLoading, router]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      const response = await api.get('/recruiter/invitations', { params });
      setInvitations(response.data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [statusFilter]);

  const openViewDialog = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setIsViewOpen(true);
  };

  const getStatusBadge = (status: InvitationStatus) => {
    const configs = {
      PENDING: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700',
        icon: Clock,
      },
      ACCEPTED: {
        label: 'Accepted',
        className: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      },
      REJECTED: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-700',
        icon: XCircle,
      },
      EXPIRED: {
        label: 'Expired',
        className: 'bg-gray-100 text-gray-700',
        icon: Clock,
      },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} gap-1 border-0`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    return {
      total: invitations.length,
      pending: invitations.filter((i) => i.status === 'PENDING').length,
      accepted: invitations.filter((i) => i.status === 'ACCEPTED').length,
      rejected: invitations.filter((i) => i.status === 'REJECTED').length,
      expired: invitations.filter((i) => i.status === 'EXPIRED').length,
    };
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Expiring soon';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your candidate invitations and responses
            </p>
          </div>
          <Button onClick={loadInvitations} variant="outline">
            🔄 Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold mt-1">{counts.total}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </Card>
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
        </div>

        {/* Filter */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-gray-400" />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as any)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Invitations</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              Showing {invitations.length} invitation{invitations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Empty State */}
        {invitations.length === 0 && (
          <Card className="p-12 text-center">
            <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Invitations Found
            </h3>
            <p className="text-gray-500 mb-4">
              {statusFilter === 'ALL'
                ? "You haven't sent any invitations yet. Go to the Candidates page to invite candidates to apply."
                : `No ${statusFilter.toLowerCase()} invitations.`}
            </p>
            <Button onClick={() => router.push('/candidates')}>
              Find Candidates
            </Button>
          </Card>
        )}

        {/* Invitations List */}
        {invitations.length > 0 && (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card
                key={invitation.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openViewDialog(invitation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {invitation.candidate.full_name}
                          </h3>
                          <p className="text-sm text-gray-500">{invitation.candidate.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(invitation.status)}
                    </div>

                    {/* Job Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 pl-13">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-medium">{invitation.job.title}</span>
                      {invitation.job.location && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{invitation.job.location}</span>
                        </>
                      )}
                    </div>

                    {/* Message Preview */}
                    <div className="pl-13">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {invitation.message}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pl-13">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Sent {formatDate(invitation.sent_at)}</span>
                      </div>
                      {invitation.status === 'PENDING' && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className={isExpired(invitation.expires_at) ? 'text-red-600' : ''}>
                            {getTimeRemaining(invitation.expires_at)}
                          </span>
                        </div>
                      )}
                      {invitation.responded_at && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Responded {formatDate(invitation.responded_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Response Indicator */}
                  {invitation.status === 'ACCEPTED' && (
                    <div className="ml-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  )}
                  {invitation.status === 'REJECTED' && (
                    <div className="ml-4">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View Details Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invitation Details</DialogTitle>
              <DialogDescription>
                Review the invitation you sent to the candidate
              </DialogDescription>
            </DialogHeader>

            {selectedInvitation && (
              <div className="space-y-6 py-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  {getStatusBadge(selectedInvitation.status)}
                </div>

                {/* Candidate */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Candidate</h3>
                  <Card className="p-4 bg-gray-50">
                    <div className="space-y-2">
                      <div className="font-medium text-lg">
                        {selectedInvitation.candidate.full_name}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedInvitation.candidate.email}
                      </div>
                      {selectedInvitation.candidate.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {selectedInvitation.candidate.location}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Job */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Job Position</h3>
                  <Card className="p-4 bg-blue-50">
                    <div className="font-medium">{selectedInvitation.job.title}</div>
                    {selectedInvitation.job.location && (
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedInvitation.job.location}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Message */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Message</h3>
                  <Card className="p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedInvitation.message}
                    </p>
                  </Card>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <div className="w-28 font-medium">Sent:</div>
                      <div>{formatDate(selectedInvitation.sent_at)}</div>
                    </div>
                    {selectedInvitation.responded_at && (
                      <div className="flex items-center text-gray-600">
                        <div className="w-28 font-medium">Responded:</div>
                        <div>{formatDate(selectedInvitation.responded_at)}</div>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <div className="w-28 font-medium">Expires:</div>
                      <div>
                        {formatDate(selectedInvitation.expires_at)}
                        <span className="ml-2 text-xs">
                          ({getTimeRemaining(selectedInvitation.expires_at)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Message */}
                {selectedInvitation.status === 'ACCEPTED' && (
                  <Card className="p-4 bg-green-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-900">Invitation Accepted!</div>
                        <div className="text-sm text-green-700 mt-1">
                          The candidate has accepted your invitation. You can expect an application
                          soon.
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                {selectedInvitation.status === 'REJECTED' && (
                  <Card className="p-4 bg-red-50">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-900">Invitation Declined</div>
                        <div className="text-sm text-red-700 mt-1">
                          The candidate has declined your invitation. Consider reaching out to
                          other qualified candidates.
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              {selectedInvitation?.status === 'ACCEPTED' && (
                <Button onClick={() => router.push('/applications')}>
                  View Applications
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
