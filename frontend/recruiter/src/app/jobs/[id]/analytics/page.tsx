'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  category?: string;
  location?: string;
  date_posted?: string;
}

interface StatusBreakdown {
  [key: string]: number;
}

interface ApplicationByDate {
  date: string;
  count: number;
}

interface Analytics {
  job_id: number;
  job_title: string;
  total_applications: number;
  status_breakdown: StatusBreakdown;
  avg_match_score: number;
  applications_by_date: ApplicationByDate[];
}

export default function JobAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && jobId) {
      loadData();
    }
  }, [user, authLoading, router, jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load job details
      const jobResponse = await api.get(`/recruiter/jobs/${jobId}`);
      setJob(jobResponse.data);
      
      // Load analytics
      const analyticsResponse = await api.get(`/recruiter/jobs/${jobId}/analytics`);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      REVIEWING: 'bg-blue-100 text-blue-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      HIRED: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  if (!job || !analytics) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Job not found</p>
            <Button onClick={() => router.push('/jobs')}>
              Back to Jobs
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalApplications = analytics.total_applications;
  const statusBreakdown = analytics.status_breakdown;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/jobs')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Job Analytics & Performance
              </p>
            </div>
          </div>
        </div>

        {/* Job Info Card */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  {job.category}
                </Badge>
                <span className="text-sm text-gray-600">{job.location}</span>
              </div>
              {job.date_posted && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Posted on {new Date(job.date_posted).toLocaleDateString()}
                </div>
              )}
            </div>
            <Button onClick={() => router.push(`/applications?job=${jobId}`)}>
              View Applications
            </Button>
          </div>
        </Card>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold mt-2">{totalApplications}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold mt-2">{statusBreakdown.PENDING || 0}</p>
              </div>
              <Eye className="h-10 w-10 text-yellow-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-3xl font-bold mt-2">{statusBreakdown.ACCEPTED || 0}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Match Score</p>
                <p className="text-3xl font-bold mt-2">{analytics.avg_match_score.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Application Status Breakdown
          </h2>
          
          {totalApplications === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No applications yet
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const percentage = totalApplications > 0 
                  ? ((count / totalApplications) * 100).toFixed(1)
                  : '0';
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(status)} border-0`}>
                          {status}
                        </Badge>
                        <span className="text-gray-600">{count} applications</span>
                      </div>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Applications Over Time */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Applications Over Time
          </h2>
          
          {analytics.applications_by_date.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No application data available
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple bar chart */}
              <div className="flex items-end gap-2 h-64 border-l border-b border-gray-200 p-4">
                {analytics.applications_by_date.map((item, index) => {
                  const maxCount = Math.max(...analytics.applications_by_date.map(d => d.count));
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end flex-1">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          {item.count}
                        </div>
                        <div
                          className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {formatDate(item.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Insights */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h2>
          <div className="space-y-3">
            {totalApplications === 0 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-600 text-xs">!</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">No applications yet</p>
                  <p className="text-gray-600 mt-1">
                    Consider promoting this job or using the candidate discovery feature to invite qualified candidates.
                  </p>
                </div>
              </div>
            )}
            
            {statusBreakdown.PENDING > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">i</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {statusBreakdown.PENDING} applications pending review
                  </p>
                  <p className="text-gray-600 mt-1">
                    Review pending applications promptly to keep candidates engaged.
                  </p>
                </div>
              </div>
            )}
            
            {analytics.avg_match_score > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Average match score: {analytics.avg_match_score.toFixed(0)}%
                  </p>
                  <p className="text-gray-600 mt-1">
                    {analytics.avg_match_score >= 70 
                      ? "You're attracting well-qualified candidates!"
                      : "Consider refining job requirements to attract better matches."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
