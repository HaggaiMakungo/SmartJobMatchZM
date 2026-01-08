import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  BookmarkCheck, 
  Award,
  Plus,
  Search,
  BarChart3,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api/client';

interface Stats {
  total_jobs: number;
  total_candidates: number;
  saved_candidates: number;
  conversion_rate?: number;
}

interface SavedCandidate {
  id: string;
  candidate_name: string;
  current_position: string;
  stage: string;
  match_score: number;
  job_title: string;
  updated_at: string;
}

interface CombinedMetric {
  date: string;
  jobs: number;
  candidates: number;
  conversions: number;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [combinedMetrics, setCombinedMetrics] = useState<CombinedMetric[]>([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsData = await apiClient.getStats();
      
      // Fetch saved candidates for recent activity
      const candidatesResponse = await apiClient.getSavedCandidates();
      const candidates = Array.isArray(candidatesResponse) 
        ? candidatesResponse 
        : (candidatesResponse?.candidates || []);
      
      // Calculate conversion rate
      const totalSaved = candidates.length;
      const hired = candidates.filter((c: any) => c.stage === 'hired').length;
      const conversionRate = totalSaved > 0 ? (hired / totalSaved) * 100 : 0;
      
      setStats({
        total_jobs: statsData.total_jobs || 0,
        total_candidates: statsData.total_candidates || 0,
        saved_candidates: totalSaved,
        conversion_rate: conversionRate
      });
      
      // Sort by most recent
      const sorted = [...candidates].sort((a: any, b: any) => 
        new Date(b.updated_at || b.created_at).getTime() - 
        new Date(a.updated_at || a.created_at).getTime()
      );
      
      setSavedCandidates(sorted.slice(0, 5));
      
      // Generate combined metrics for last 7 days
      generateCombinedMetrics(statsData, candidates);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCombinedMetrics = (statsData: any, candidates: any[]) => {
    const metrics: CombinedMetric[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic data (in production, this would come from backend)
      const baseJobs = Math.floor(statsData.total_jobs / 7);
      const baseCandidates = Math.floor(candidates.length / 7);
      const variance = Math.random() * 0.3 - 0.15; // ±15% variance
      
      metrics.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        jobs: Math.max(0, Math.round(baseJobs * (1 + variance))),
        candidates: Math.max(0, Math.round(baseCandidates * (1 + variance))),
        conversions: Math.max(0, Math.round((baseCandidates * 0.25) * (1 + variance)))
      });
    }
    
    setCombinedMetrics(metrics);
  };

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats?.total_jobs || 0,
      icon: Briefcase,
      color: 'text-tangerine',
      bgColor: 'bg-tangerine/10',
      onClick: () => navigate('/dashboard/jobs')
    },
    {
      title: 'Total Candidates',
      value: stats?.total_candidates || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      onClick: () => navigate('/dashboard/jobs')
    },
    {
      title: 'Saved Candidates',
      value: stats?.saved_candidates || 0,
      icon: BookmarkCheck,
      color: 'text-sage',
      bgColor: 'bg-sage/10',
      onClick: () => navigate('/dashboard/candidates')
    },
    {
      title: 'Conversion Rate',
      value: stats?.conversion_rate ? `${Math.round(stats.conversion_rate)}%` : '0%',
      icon: Award,
      color: 'text-peach',
      bgColor: 'bg-peach/10',
      onClick: () => navigate('/dashboard/analytics')
    }
  ];

  const quickActions = [
    {
      title: 'Find Candidates',
      description: 'Match candidates to your jobs',
      icon: Search,
      color: 'text-tangerine',
      bgColor: 'bg-tangerine/10',
      onClick: () => navigate('/dashboard/jobs')
    },
    {
      title: 'Post New Job',
      description: 'Create a new job posting',
      icon: Plus,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      onClick: () => {
        navigate('/dashboard/jobs');
        // TODO: Open post job modal
        // This will be implemented when we add the post job modal
      }
    },
    {
      title: 'Review Candidates',
      description: 'Manage your pipeline',
      icon: Users,
      color: 'text-sage',
      bgColor: 'bg-sage/10',
      onClick: () => navigate('/dashboard/candidates')
    },
    {
      title: 'View Statistics',
      description: 'Detailed analytics & reports',
      icon: BarChart3,
      color: 'text-peach',
      bgColor: 'bg-peach/10',
      onClick: () => navigate('/dashboard/analytics')
    }
  ];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      saved: 'text-gray-400',
      invited: 'text-blue-400',
      screening: 'text-purple-400',
      interview: 'text-yellow-400',
      offer: 'text-green-400',
      hired: 'text-emerald-400',
      rejected: 'text-red-400'
    };
    return colors[stage] || 'text-gray-400';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const maxValue = Math.max(
    ...combinedMetrics.map(m => Math.max(m.jobs, m.candidates, m.conversions)),
    1
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tangerine border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.company_name}!
        </h1>
        <p className="text-gray-400">Here's what's happening with your recruitment</p>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={stat.onClick}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-tangerine transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-tangerine transition-all text-left group"
              >
                <div className={`${action.bgColor} ${action.color} p-3 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Recent Activity + Combined Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity - Real Pipeline Updates */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {savedCandidates.length > 0 ? (
              savedCandidates.map((candidate: any) => {
                const stageColor = getStageColor(candidate.stage);
                return (
                  <div
                    key={candidate.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition cursor-pointer"
                    onClick={() => navigate('/dashboard/candidates')}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="bg-tangerine/10 text-tangerine p-2 rounded-lg flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 font-medium truncate">
                          {candidate.candidate_name || 'Candidate'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {candidate.current_position || candidate.job_title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs capitalize ${stageColor}`}>
                            {candidate.stage}
                          </span>
                          {candidate.match_score > 0 && (
                            <>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-sage">
                                {Math.round(candidate.match_score * 100)}% match
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {getTimeAgo(candidate.updated_at || candidate.created_at)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No recent pipeline activity</p>
                <p className="text-gray-500 text-xs mt-1">
                  Save candidates to see updates here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Combined Analytics Overview */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Weekly Overview</h2>
            <button 
              onClick={() => navigate('/dashboard/analytics')}
              className="text-sm text-tangerine hover:text-tangerine/80 flex items-center gap-1"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {combinedMetrics.length > 0 ? (
            <div className="space-y-6">
              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full bg-tangerine"></div>
                    <span className="text-xs text-gray-400">Jobs</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {combinedMetrics.reduce((sum, m) => sum + m.jobs, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs text-gray-400">Candidates</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {combinedMetrics.reduce((sum, m) => sum + m.candidates, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-xs text-gray-400">Conversions</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {combinedMetrics.reduce((sum, m) => sum + m.conversions, 0)}
                  </p>
                </div>
              </div>

              {/* Simple Bar Chart */}
              <div className="space-y-2">
                {combinedMetrics.map((metric, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{metric.date}</span>
                      <span className="text-xs text-gray-500">
                        {metric.jobs + metric.candidates + metric.conversions}
                      </span>
                    </div>
                    <div className="flex gap-0.5 h-6">
                      <div
                        className="bg-tangerine rounded-l transition-all duration-300"
                        style={{ width: `${(metric.jobs / maxValue) * 100}%` }}
                        title={`Jobs: ${metric.jobs}`}
                      />
                      <div
                        className="bg-blue-400 transition-all duration-300"
                        style={{ width: `${(metric.candidates / maxValue) * 100}%` }}
                        title={`Candidates: ${metric.candidates}`}
                      />
                      <div
                        className="bg-green-400 rounded-r transition-all duration-300"
                        style={{ width: `${(metric.conversions / maxValue) * 100}%` }}
                        title={`Conversions: ${metric.conversions}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-tangerine"></div>
                  <span className="text-xs text-gray-400">Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-400"></div>
                  <span className="text-xs text-gray-400">Candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-400"></div>
                  <span className="text-xs text-gray-400">Conversions</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No data available yet</p>
                <p className="text-gray-500 text-xs mt-1">Start adding jobs and candidates</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
