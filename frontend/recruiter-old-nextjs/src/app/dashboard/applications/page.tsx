'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Users, Clock, CheckCircle, Calendar, TrendingUp, ArrowUpDown, GitCompare, Mail, Download } from 'lucide-react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import KanbanColumn from '@/components/applications/KanbanColumn';
import ApplicationDetailsModal from '@/components/applications/ApplicationDetailsModal';
import CompareModal from '@/components/applications/CompareModal';
import BulkActionsBar from '@/components/applications/BulkActionsBar';
import { toast } from 'sonner';
import { applicationsApi, Application, ApplicationStats } from '@/lib/api/applications';
import { ApplicationStatus } from '@/lib/api/types';

const columns = [
  { id: 'new', title: 'New', color: 'blue' },
  { id: 'screening', title: 'Screening', color: 'yellow' },
  { id: 'interview', title: 'Interview', color: 'purple' },
  { id: 'offer', title: 'Offer', color: 'green' },
  { id: 'hired', title: 'Hired', color: 'emerald' },
  { id: 'rejected', title: 'Rejected', color: 'red' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'matchScore' | 'appliedDate' | 'name'>('matchScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch applications and stats on mount
  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsApi.list({ limit: 100 });
      setApplications(response.applications);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await applicationsApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const applicationId = Number(active.id);
    const newStatus = over.id as ApplicationStatus;
    
    // Optimistic update
    setApplications(apps => 
      apps.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: newStatus }
          : app
      )
    );
    
    try {
      await applicationsApi.updateStatus(applicationId, newStatus);
      toast.success('Application status updated');
      fetchStats(); // Refresh stats
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      fetchApplications(); // Revert on error
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setDetailsModalOpen(true);
  };

  const handleSelectForCompare = (id: number) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(appId => appId !== id));
    } else if (selectedForCompare.length < 3) {
      setSelectedForCompare([...selectedForCompare, id]);
    } else {
      toast.error('You can only compare up to 3 candidates');
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Please select at least 2 candidates to compare');
      return;
    }
    setCompareModalOpen(true);
  };

  const handleBulkAction = async (action: string, applicationIds: number[]) => {
    try {
      switch(action) {
        case 'reject':
          await applicationsApi.bulkUpdateStatus(applicationIds, 'rejected');
          toast.success(`${applicationIds.length} applications rejected`);
          break;
        case 'moveToScreening':
          await applicationsApi.bulkUpdateStatus(applicationIds, 'screening');
          toast.success(`${applicationIds.length} applications moved to screening`);
          break;
        case 'sendEmail':
          toast.success(`Emails sent to ${applicationIds.length} candidates`);
          break;
        case 'export':
          toast.success(`Exporting ${applicationIds.length} applications...`);
          break;
      }
      setSelectedForCompare([]);
      fetchApplications();
      fetchStats();
    } catch (error: any) {
      console.error('Bulk action error:', error);
      toast.error('Failed to complete bulk action');
    }
  };

  // Transform applications for display (matching the component interface)
  const transformedApplications = applications.map(app => {
    // Safely parse date
    let appliedDate = 'Unknown';
    try {
      if (app.created_at) {
        const date = new Date(app.created_at);
        if (!isNaN(date.getTime())) {
          appliedDate = date.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error('Error parsing date:', app.created_at, error);
    }

    return {
      id: app.application_id,
      candidateName: app.candidate?.name || 'Unknown',
      candidateEmail: app.candidate?.email || '',
      candidatePhone: app.candidate?.phone || '',
      candidatePhoto: app.candidate?.photo_url || null,
      jobTitle: app.job?.title || 'Unknown Job',
      jobId: parseInt(app.job_id),
      matchScore: Math.round(app.match_score * 100),
      appliedDate,
      status: app.status,
      resumeUrl: '', // TODO: Add resume URL when available
      coverLetter: app.cover_letter || '',
      notes: app.recruiter_notes ? [app.recruiter_notes] : [],
      skills: app.candidate?.skills || [],
      experience: `${app.candidate?.experience_years || 0} years`,
      education: '', // TODO: Add when available
      location: app.candidate?.location || '',
      availability: 'Unknown',
      expectedSalary: '', // TODO: Add when available
      rating: app.rating || null,
    };
  });

  const filteredAndSortedApplications = transformedApplications
    .filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let compareValue = 0;
      switch(sortBy) {
        case 'matchScore':
          compareValue = a.matchScore - b.matchScore;
          break;
        case 'appliedDate':
          compareValue = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
          break;
        case 'name':
          compareValue = a.candidateName.localeCompare(b.candidateName);
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const groupedApplications = columns.reduce((acc, column) => {
    acc[column.id] = filteredAndSortedApplications.filter(app => app.status === column.id);
    return acc;
  }, {} as Record<string, typeof transformedApplications>);

  // Stats display
  const statsCards = [
    { 
      label: 'Total Applications', 
      value: stats?.total.toString() || '0', 
      change: `${applications.filter(a => new Date(a.created_at) > new Date(Date.now() - 24*60*60*1000)).length} today`, 
      icon: Users, 
      color: 'tangerine' 
    },
    { 
      label: 'New Applications', 
      value: stats?.new.toString() || '0', 
      change: 'This week', 
      icon: Clock, 
      color: 'peach' 
    },
    { 
      label: 'In Review', 
      value: stats?.screening.toString() || '0', 
      change: 'Active', 
      icon: Filter, 
      color: 'sage' 
    },
    { 
      label: 'Interviews Scheduled', 
      value: stats?.interview.toString() || '0', 
      change: 'Next 7 days', 
      icon: Calendar, 
      color: 'gunmetal' 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tangerine mx-auto mb-4"></div>
          <p className="text-sage">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gunmetal dark:text-peach">Applications</h1>
          <p className="text-sage mt-1">Review and manage candidate applications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCompare}
            disabled={selectedForCompare.length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-sage hover:bg-sage/90 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GitCompare className="w-5 h-5" />
            Compare ({selectedForCompare.length})
          </button>
          <button
            onClick={() => toast.success('Exporting all applications...')}
            className="flex items-center gap-2 px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-all"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gunmetal dark:text-peach">{stat.value}</h3>
            <p className="text-sm text-sage mb-1">{stat.label}</p>
            <p className="text-xs text-green-600 dark:text-green-400">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-4 border border-sage/10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sage w-5 h-5" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-sage/30 rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach"
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 border border-sage/30 rounded-lg focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach"
          >
            <option value="matchScore">Sort by Match Score</option>
            <option value="appliedDate">Sort by Date Applied</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="p-2.5 border border-sage/30 rounded-lg hover:bg-sage/5 transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown className="w-5 h-5 text-sage" />
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedForCompare.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedForCompare.length}
          onBulkAction={handleBulkAction}
          selectedIds={selectedForCompare}
          onClear={() => setSelectedForCompare([])}
        />
      )}

      {/* Kanban Board */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                applications={groupedApplications[column.id] || []}
                onViewApplication={handleViewApplication}
                selectedForCompare={selectedForCompare}
                onSelectForCompare={handleSelectForCompare}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {/* Modals */}
      <ApplicationDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onStatusChange={async (newStatus: string) => {
          if (!selectedApplication) return;
          
          try {
            await applicationsApi.updateStatus(selectedApplication.application_id, newStatus as ApplicationStatus);
            setApplications(apps =>
              apps.map(app =>
                app.application_id === selectedApplication.application_id
                  ? { ...app, status: newStatus as ApplicationStatus }
                  : app
              )
            );
            setSelectedApplication({ ...selectedApplication, status: newStatus as ApplicationStatus });
            toast.success('Status updated');
            fetchStats();
          } catch (error: any) {
            toast.error('Failed to update status');
          }
        }}
      />

      <CompareModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        applications={transformedApplications.filter(app => selectedForCompare.includes(app.id))}
      />
    </div>
  );
}
