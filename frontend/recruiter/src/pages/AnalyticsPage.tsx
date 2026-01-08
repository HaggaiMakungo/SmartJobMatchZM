import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase,
  Download,
  RefreshCw,
  ChevronDown,
  MapPin,
  Award,
  Clock,
  Target,
  Filter
} from 'lucide-react';
import { apiClient } from '../lib/api/client';
import ChartModal from '../components/ChartModal';

type DateRange = '7d' | '30d' | '90d' | 'all';

interface JobStats {
  total_jobs: number;
  by_status: {
    draft: number;
    published: number;
    closed: number;
  };
  by_category: Record<string, number>;
  by_location: Record<string, number>;
  recent_jobs: any[];
}

interface CandidateStats {
  total_saved: number;
  by_stage: Record<string, number>;
  avg_match_score: number;
  favorites_count: number;
  by_location: Record<string, number>;
}

// Generate mock time series data for charts (FIXED)
const generateTimeSeriesData = (days: number, baseValue: number, variance: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const randomVariance = (Math.random() - 0.5) * variance;
    const value = Math.max(0, Math.round(baseValue + randomVariance));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
      label: date.toLocaleDateString()
    });
  }
  
  return data;
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'candidates'>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [candidateStats, setCandidateStats] = useState<CandidateStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Chart modal states
  const [activeJobsChartOpen, setActiveJobsChartOpen] = useState(false);
  const [candidatesChartOpen, setCandidatesChartOpen] = useState(false);
  const [matchScoreChartOpen, setMatchScoreChartOpen] = useState(false);
  const [conversionChartOpen, setConversionChartOpen] = useState(false);
  const [hiringFunnelChartOpen, setHiringFunnelChartOpen] = useState(false);
  const [categoryChartOpen, setCategoryChartOpen] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch job stats
      const jobsData = await apiClient.getStats();
      console.log('Job stats response:', jobsData);
      setJobStats(jobsData);

      // Fetch saved candidates and calculate stats
      const savedCandidatesResponse = await apiClient.getSavedCandidates();
      
      const savedCandidates = Array.isArray(savedCandidatesResponse) 
        ? savedCandidatesResponse 
        : (savedCandidatesResponse?.candidates || []);
      
      console.log('Saved candidates:', savedCandidates);
      
      // Calculate candidate stats
      const stages = savedCandidates.reduce((acc: any, c: any) => {
        acc[c.stage] = (acc[c.stage] || 0) + 1;
        return acc;
      }, {});

      const locations = savedCandidates.reduce((acc: any, c: any) => {
        const loc = c.city || c.province || 'Unknown';
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {});

      // Fix: Properly calculate average match score (0-1 scale, not 0-100)
      const avgScore = savedCandidates.length > 0
        ? savedCandidates.reduce((sum: number, c: any) => {
            const score = c.match_score || 0;
            // If score is already 0-1, use it; if 0-100, convert it
            const normalizedScore = score > 1 ? score / 100 : score;
            return sum + normalizedScore;
          }, 0) / savedCandidates.length
        : 0;

      const stats = {
        total_saved: savedCandidates.length,
        by_stage: stages,
        avg_match_score: avgScore, // Now properly in 0-1 range
        favorites_count: 0,
        by_location: locations
      };
      
      console.log('Candidate stats calculated:', stats);
      setCandidateStats(stats);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleExport = () => {
    console.log('Exporting analytics...');
  };

  if (loading || !jobStats || !candidateStats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tangerine border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Generate chart data based on date range (FIXED)
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, 'all': 90 };
  const days = daysMap[dateRange];
  
  const activeJobsData = generateTimeSeriesData(days, jobStats.by_status.published, 2);
  const candidatesData = generateTimeSeriesData(days, candidateStats.total_saved, 1);
  
  // Fix: Round match score properly
  const matchScorePercent = Math.round(candidateStats.avg_match_score * 100);
  const matchScoreData = generateTimeSeriesData(days, matchScorePercent, 5);
  
  // Fix: Calculate conversion rate safely
  const totalApplications = Object.values(candidateStats.by_stage).reduce((a, b) => a + b, 0);
  const hiredCount = candidateStats.by_stage['hired'] || 0;
  const conversionRate = totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0;
  const conversionData = generateTimeSeriesData(days, Math.round(conversionRate), 2);
  
  // Generate funnel data (bar chart)
  const funnelData = Object.entries(candidateStats.by_stage).map(([stage, count]) => ({
    date: stage.charAt(0).toUpperCase() + stage.slice(1),
    value: count as number,
    label: `${stage}: ${count} candidates`
  }));
  
  // Generate category data (bar chart)
  const categoryData = Object.entries(jobStats.by_category)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count]) => ({
      date: category,
      value: count,
      label: `${category}: ${count} jobs`
    }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Insights into your hiring performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="appearance-none bg-gunmetal border border-gray-700 text-white px-4 py-2 pr-10 rounded-lg hover:border-tangerine focus:outline-none focus:border-tangerine transition-colors cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gunmetal border border-gray-700 rounded-lg hover:border-tangerine transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'jobs', label: 'Jobs', icon: Briefcase },
          { id: 'candidates', label: 'Candidates', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-tangerine text-tangerine'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            jobStats={jobStats} 
            candidateStats={candidateStats}
            onActiveJobsClick={() => setActiveJobsChartOpen(true)}
            onCandidatesClick={() => setCandidatesChartOpen(true)}
            onMatchScoreClick={() => setMatchScoreChartOpen(true)}
            onConversionClick={() => setConversionChartOpen(true)}
            onHiringFunnelClick={() => setHiringFunnelChartOpen(true)}
            onCategoryClick={() => setCategoryChartOpen(true)}
          />
        )}
        
        {activeTab === 'jobs' && (
          <JobsTab jobStats={jobStats} />
        )}
        
        {activeTab === 'candidates' && (
          <CandidatesTab candidateStats={candidateStats} />
        )}
      </div>

      {/* Chart Modals */}
      <ChartModal
        isOpen={activeJobsChartOpen}
        onClose={() => setActiveJobsChartOpen(false)}
        title="Active Jobs"
        currentValue={jobStats.by_status.published}
        trend={12}
        data={activeJobsData}
        color="#3B82F6"
        icon={<Briefcase className="w-6 h-6 text-blue-400" />}
      />

      <ChartModal
        isOpen={candidatesChartOpen}
        onClose={() => setCandidatesChartOpen(false)}
        title="Total Candidates"
        currentValue={candidateStats.total_saved}
        trend={8}
        data={candidatesData}
        color="#10B981"
        icon={<Users className="w-6 h-6 text-green-400" />}
      />

      <ChartModal
        isOpen={matchScoreChartOpen}
        onClose={() => setMatchScoreChartOpen(false)}
        title="Average Match Score"
        currentValue={`${matchScorePercent}%`}
        trend={5}
        data={matchScoreData}
        color="#A855F7"
        icon={<Target className="w-6 h-6 text-purple-400" />}
      />

      <ChartModal
        isOpen={conversionChartOpen}
        onClose={() => setConversionChartOpen(false)}
        title="Conversion Rate"
        currentValue={`${Math.round(conversionRate)}%`}
        trend={-2}
        data={conversionData}
        color="#F2994A"
        icon={<Award className="w-6 h-6 text-tangerine" />}
      />

      <ChartModal
        isOpen={hiringFunnelChartOpen}
        onClose={() => setHiringFunnelChartOpen(false)}
        title="Hiring Funnel"
        currentValue={totalApplications}
        chartType="bar"
        data={funnelData}
        color="#F2994A"
        icon={<Filter className="w-6 h-6 text-tangerine" />}
      />

      <ChartModal
        isOpen={categoryChartOpen}
        onClose={() => setCategoryChartOpen(false)}
        title="Jobs by Category"
        currentValue={Object.keys(jobStats.by_category).length}
        chartType="bar"
        data={categoryData}
        color="#3B82F6"
        icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
      />
    </div>
  );
}

function OverviewTab({ 
  jobStats, 
  candidateStats,
  onActiveJobsClick,
  onCandidatesClick,
  onMatchScoreClick,
  onConversionClick,
  onHiringFunnelClick,
  onCategoryClick
}: { 
  jobStats: JobStats; 
  candidateStats: CandidateStats;
  onActiveJobsClick: () => void;
  onCandidatesClick: () => void;
  onMatchScoreClick: () => void;
  onConversionClick: () => void;
  onHiringFunnelClick: () => void;
  onCategoryClick: () => void;
}) {
  const totalApplications = Object.values(candidateStats.by_stage).reduce((a, b) => a + b, 0);
  const hiredCount = candidateStats.by_stage['hired'] || 0;
  const conversionRate = totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div onClick={onActiveJobsClick} className="cursor-pointer">
          <MetricCard
            icon={Briefcase}
            label="Active Jobs"
            value={jobStats.by_status.published}
            trend={+12}
            color="blue"
          />
        </div>
        <div onClick={onCandidatesClick} className="cursor-pointer">
          <MetricCard
            icon={Users}
            label="Total Candidates"
            value={candidateStats.total_saved}
            trend={+8}
            color="green"
          />
        </div>
        <div onClick={onMatchScoreClick} className="cursor-pointer">
          <MetricCard
            icon={Target}
            label="Avg Match Score"
            value={`${Math.round(candidateStats.avg_match_score * 100)}%`}
            trend={+5}
            color="purple"
          />
        </div>
        <div onClick={onConversionClick} className="cursor-pointer">
          <MetricCard
            icon={Award}
            label="Conversion Rate"
            value={`${Math.round(conversionRate)}%`}
            trend={-2}
            color="tangerine"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div 
          onClick={onHiringFunnelClick}
          className="bg-gunmetal border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-tangerine transition-all duration-200 transform hover:scale-[1.01]"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Hiring Funnel</h3>
          <HiringFunnelChart stages={candidateStats.by_stage} />
        </div>

        <div 
          onClick={onCategoryClick}
          className="bg-gunmetal border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-tangerine transition-all duration-200 transform hover:scale-[1.01]"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Jobs by Category</h3>
          <CategoryChart categories={jobStats.by_category} />
        </div>
      </div>

      <div className="bg-gunmetal border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Jobs</h3>
        <RecentJobsList jobs={jobStats.recent_jobs} />
      </div>
    </div>
  );
}

function JobsTab({ jobStats }: { jobStats: JobStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatusCard label="Published" count={jobStats.by_status.published} color="green" />
        <StatusCard label="Draft" count={jobStats.by_status.draft} color="yellow" />
        <StatusCard label="Closed" count={jobStats.by_status.closed} color="red" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gunmetal border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Jobs by Category</h3>
          <CategoryChart categories={jobStats.by_category} />
        </div>

        <div className="bg-gunmetal border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Jobs by Location</h3>
          <LocationChart locations={jobStats.by_location} />
        </div>
      </div>
    </div>
  );
}

function CandidatesTab({ candidateStats }: { candidateStats: CandidateStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(candidateStats.by_stage).map(([stage, count]) => (
          <StageCard key={stage} stage={stage} count={count} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gunmetal border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pipeline Overview</h3>
          <HiringFunnelChart stages={candidateStats.by_stage} />
        </div>

        <div className="bg-gunmetal border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Candidates by Location</h3>
          <LocationChart locations={candidateStats.by_location} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  trend: number; 
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    tangerine: 'bg-tangerine/20 text-tangerine'
  };

  return (
    <div className="bg-gunmetal border border-gray-700 rounded-lg p-5 hover:border-tangerine transition-all duration-200 transform hover:scale-[1.02] cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">{value}</span>
        <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'border-green-500 bg-green-500/10',
    yellow: 'border-yellow-500 bg-yellow-500/10',
    red: 'border-red-500 bg-red-500/10'
  };

  return (
    <div className={`border-2 rounded-lg p-5 ${colorMap[color]}`}>
      <div className="text-2xl font-bold text-white mb-1">{count}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function StageCard({ stage, count }: { stage: string; count: number }) {
  const stageColors: Record<string, string> = {
    saved: 'border-gray-500 bg-gray-500/10',
    invited: 'border-blue-500 bg-blue-500/10',
    screening: 'border-purple-500 bg-purple-500/10',
    interview: 'border-yellow-500 bg-yellow-500/10',
    offer: 'border-green-500 bg-green-500/10',
    hired: 'border-emerald-500 bg-emerald-500/10',
    rejected: 'border-red-500 bg-red-500/10'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${stageColors[stage] || 'border-gray-500 bg-gray-500/10'}`}>
      <div className="text-2xl font-bold text-white mb-1">{count}</div>
      <div className="text-sm text-gray-400 capitalize">{stage}</div>
    </div>
  );
}

function HiringFunnelChart({ stages }: { stages: Record<string, number> }) {
  const stageOrder = ['saved', 'invited', 'screening', 'interview', 'offer', 'hired'];
  const counts = stageOrder.map(stage => stages[stage] || 0);
  const maxCount = Math.max(...counts, 1); // Prevent division by zero

  return (
    <div className="space-y-3">
      {stageOrder.map((stage) => {
        const count = stages[stage] || 0;
        const percentage = (count / maxCount) * 100;

        return (
          <div key={stage}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400 capitalize">{stage}</span>
              <span className="text-sm font-medium text-white">{count}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-tangerine rounded-full h-2 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryChart({ categories }: { categories: Record<string, number> }) {
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  
  const counts = sortedCategories.map(([, count]) => count);
  const maxCount = Math.max(...counts, 1); // Prevent division by zero

  return (
    <div className="space-y-3">
      {sortedCategories.map(([category, count]) => {
        const percentage = (count / maxCount) * 100;

        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">{category}</span>
              <span className="text-sm font-medium text-white">{count}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LocationChart({ locations }: { locations: Record<string, number> }) {
  const sortedLocations = Object.entries(locations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  
  const counts = sortedLocations.map(([, count]) => count);
  const maxCount = Math.max(...counts, 1); // Prevent division by zero

  return (
    <div className="space-y-3">
      {sortedLocations.map(([location, count]) => {
        const percentage = (count / maxCount) * 100;

        return (
          <div key={location}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">{location}</span>
              </div>
              <span className="text-sm font-medium text-white">{count}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentJobsList({ jobs }: { jobs: any[] }) {
  if (!jobs || jobs.length === 0) {
    return <p className="text-gray-400 text-center py-8">No recent jobs</p>;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div key={job.job_id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
          <div className="flex-1">
            <h4 className="font-medium text-white">{job.title}</h4>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location_city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.status === 'published' ? 'bg-green-500/20 text-green-400' :
            job.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {job.status}
          </span>
        </div>
      ))}
    </div>
  );
}
