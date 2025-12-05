'use client';

import { Users, Briefcase, FileText, CheckCircle, Clock, TrendingUp, TrendingDown, Award, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OverviewTabProps {
  dateRange: string;
  compareMode: boolean;
}

// Mock data
const metricsData = [
  {
    label: 'Total Applications',
    value: '1,247',
    change: '+12.5%',
    trend: 'up',
    icon: FileText,
    color: 'bg-blue-500',
    comparison: compareMode => compareMode ? '1,109 last period' : null
  },
  {
    label: 'Active Candidates',
    value: '856',
    change: '+8.3%',
    trend: 'up',
    icon: Users,
    color: 'bg-green-500',
    comparison: compareMode => compareMode ? '791 last period' : null
  },
  {
    label: 'Active Jobs',
    value: '24',
    change: '+4',
    trend: 'up',
    icon: Briefcase,
    color: 'bg-tangerine',
    comparison: compareMode => compareMode ? '20 last period' : null
  },
  {
    label: 'Interviews Scheduled',
    value: '89',
    change: '+15.2%',
    trend: 'up',
    icon: Clock,
    color: 'bg-purple-500',
    comparison: compareMode => compareMode ? '77 last period' : null
  },
  {
    label: 'Offers Made',
    value: '32',
    change: '+6.7%',
    trend: 'up',
    icon: CheckCircle,
    color: 'bg-pink-500',
    comparison: compareMode => compareMode ? '30 last period' : null
  },
  {
    label: 'Hires Completed',
    value: '18',
    change: '-10.0%',
    trend: 'down',
    icon: Award,
    color: 'bg-indigo-500',
    comparison: compareMode => compareMode ? '20 last period' : null
  }
];

const applicationsOverTime = [
  { date: 'Week 1', applications: 245, interviews: 18, hires: 4 },
  { date: 'Week 2', applications: 298, interviews: 22, hires: 5 },
  { date: 'Week 3', applications: 312, interviews: 25, hires: 3 },
  { date: 'Week 4', applications: 392, interviews: 24, hires: 6 }
];

const funnelData = [
  { stage: 'New', count: 487, color: '#3b82f6' },
  { stage: 'Screening', count: 312, color: '#8b5cf6' },
  { stage: 'Interview', count: 189, color: '#f59e0b' },
  { stage: 'Offer', count: 54, color: '#10b981' },
  { stage: 'Hired', count: 18, color: '#22c55e' }
];

const sourceData = [
  { name: 'LinkedIn', value: 425, color: '#0077b5' },
  { name: 'Indeed', value: 312, color: '#2164f3' },
  { name: 'Referrals', value: 198, color: '#10b981' },
  { name: 'Direct', value: 176, color: '#f59e0b' },
  { name: 'Career Page', value: 136, color: '#8b5cf6' }
];

const predictionsData = [
  {
    title: 'Predicted Hires This Month',
    value: '22-25',
    confidence: '85%',
    icon: TrendingUp,
    color: 'bg-green-500',
    insight: 'Based on current pipeline velocity'
  },
  {
    title: 'Best Time to Post Jobs',
    value: 'Tuesday 9-11 AM',
    confidence: '92%',
    icon: Zap,
    color: 'bg-yellow-500',
    insight: '2.3x higher application rate'
  },
  {
    title: 'Average Time to Fill',
    value: '18 days',
    confidence: '78%',
    icon: Clock,
    color: 'bg-blue-500',
    insight: '3 days faster than industry avg'
  }
];

export default function OverviewTab({ dateRange, compareMode }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {metricsData.map((metric, idx) => (
          <div key={idx} className="bg-peach/10 dark:bg-gunmetal rounded-xl p-6 border border-sage/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-sage mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-gunmetal dark:text-peach">{metric.value}</p>
                {compareMode && metric.comparison(compareMode) && (
                  <p className="text-xs text-sage mt-1">{metric.comparison(compareMode)}</p>
                )}
              </div>
              <div className={`${metric.color} p-3 rounded-lg`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-sage">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Predictions */}
      <div>
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-tangerine" />
          AI-Powered Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictionsData.map((pred, idx) => (
            <div key={idx} className="bg-gradient-to-br from-tangerine/10 to-sage/10 dark:from-tangerine/20 dark:to-sage/20 rounded-xl p-5 border border-tangerine/20">
              <div className="flex items-start gap-3 mb-3">
                <div className={`${pred.color} p-2 rounded-lg`}>
                  <pred.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-sage mb-1">{pred.title}</p>
                  <p className="text-2xl font-bold text-gunmetal dark:text-peach">{pred.value}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-sage">{pred.insight}</span>
                <span className="text-xs font-medium text-tangerine">{pred.confidence} confidence</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Funnel */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Application Funnel</h3>
        <div className="flex items-end justify-between gap-2 h-64">
          {funnelData.map((stage, idx) => {
            const maxCount = Math.max(...funnelData.map(s => s.count));
            const heightPercent = (stage.count / maxCount) * 100;
            const dropRate = idx > 0 ? ((funnelData[idx - 1].count - stage.count) / funnelData[idx - 1].count * 100).toFixed(1) : 0;
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-center mb-2">
                  <p className="text-2xl font-bold text-gunmetal dark:text-peach">{stage.count}</p>
                  {idx > 0 && (
                    <p className="text-xs text-red-500">-{dropRate}%</p>
                  )}
                </div>
                <div
                  className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: stage.color
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold text-sm">Click for details</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gunmetal dark:text-peach">{stage.stage}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
              <XAxis dataKey="date" stroke="#b8b08d" />
              <YAxis stroke="#b8b08d" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#202c39', 
                  border: '1px solid #b8b08d',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#f29559" strokeWidth={3} name="Applications" />
              <Line type="monotone" dataKey="interviews" stroke="#3b82f6" strokeWidth={2} name="Interviews" />
              <Line type="monotone" dataKey="hires" stroke="#22c55e" strokeWidth={2} name="Hires" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Application Sources */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Application Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Jobs */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-tangerine" />
            Top Performing Jobs
          </h3>
          <div className="space-y-3">
            {[
              { job: 'Senior Frontend Developer', applications: 142, hires: 3, score: 95 },
              { job: 'Product Manager', applications: 98, hires: 2, score: 88 },
              { job: 'DevOps Engineer', applications: 87, hires: 2, score: 86 }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-peach/10 dark:bg-gunmetal rounded-lg hover:bg-peach/20 dark:hover:bg-gunmetal/80 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-tangerine text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gunmetal dark:text-peach">{item.job}</p>
                  <p className="text-sm text-sage">{item.applications} applications • {item.hires} hires</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-tangerine">{item.score}%</p>
                  <p className="text-xs text-sage">match</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Application Sources */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Best Application Sources
          </h3>
          <div className="space-y-3">
            {[
              { source: 'LinkedIn', applications: 425, hireRate: 8.2, cost: 'Low' },
              { source: 'Referrals', applications: 198, hireRate: 12.6, cost: 'None' },
              { source: 'Indeed', applications: 312, hireRate: 5.4, cost: 'Medium' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-peach/10 dark:bg-gunmetal rounded-lg hover:bg-peach/20 dark:hover:bg-gunmetal/80 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gunmetal dark:text-peach">{item.source}</p>
                  <p className="text-sm text-sage">{item.applications} applications • {item.cost} cost</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-500">{item.hireRate}%</p>
                  <p className="text-xs text-sage">hire rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
