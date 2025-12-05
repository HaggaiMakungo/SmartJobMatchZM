import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  BookmarkCheck, 
  TrendingUp,
  Plus,
  Search,
  BarChart3,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api/client';

interface Stats {
  total_jobs: number;
  total_candidates: number;
  saved_candidates: number;
  average_match_score: number;
}

interface RecentActivity {
  id: string;
  type: 'saved' | 'moved' | 'matched';
  candidate_name: string;
  job_title?: string;
  stage?: string;
  match_score?: number;
  timestamp: string;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'saved',
      candidate_name: 'John Doe',
      job_title: 'Senior Developer',
      match_score: 92,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'moved',
      candidate_name: 'Jane Smith',
      job_title: 'Product Manager',
      stage: 'Interview',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      type: 'matched',
      candidate_name: 'Mike Johnson',
      job_title: 'Data Analyst',
      match_score: 88,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
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
      title: 'Avg Match Score',
      value: stats ? `${Math.round(stats.average_match_score)}%` : '0%',
      icon: TrendingUp,
      color: 'text-peach',
      bgColor: 'bg-peach/10',
      onClick: () => navigate('/dashboard/jobs')
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
      onClick: () => navigate('/dashboard/jobs')
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
      onClick: () => navigate('/dashboard/jobs')
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'saved': return BookmarkCheck;
      case 'moved': return ArrowRight;
      case 'matched': return TrendingUp;
      default: return Clock;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'saved':
        return `Saved ${activity.candidate_name} for ${activity.job_title}`;
      case 'moved':
        return `Moved ${activity.candidate_name} to ${activity.stage} stage`;
      case 'matched':
        return `New match: ${activity.candidate_name} for ${activity.job_title}`;
      default:
        return '';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
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

      {/* Bottom Section: Recent Activity + Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition"
                  >
                    <div className="bg-tangerine/10 text-tangerine p-2 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        {getActivityText(activity)}
                      </p>
                      {activity.match_score && (
                        <p className="text-xs text-sage mt-1">
                          {activity.match_score}% match
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* Match Quality Chart Placeholder */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Match Quality Trends</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Chart visualization coming soon</p>
              <p className="text-gray-500 text-xs mt-1">Match quality over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
