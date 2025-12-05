'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FolderHeart, TrendingUp, Users, Zap } from 'lucide-react';

interface TalentPoolsTabProps {
  dateRange: string;
  compareMode: boolean;
}

const poolGrowthData = [
  { month: 'Jan', pools: 8, candidates: 124 },
  { month: 'Feb', pools: 12, candidates: 198 },
  { month: 'Mar', pools: 15, candidates: 267 },
  { month: 'Apr', pools: 18, candidates: 342 }
];

const poolPerformanceData = [
  { pool: 'Frontend Stars', candidates: 45, avgMatch: 92, hires: 5 },
  { pool: 'High Matches', candidates: 38, avgMatch: 95, hires: 4 },
  { pool: 'Interview Pipeline', candidates: 28, avgMatch: 88, hires: 3 },
  { pool: 'Future Hires', candidates: 52, avgMatch: 86, hires: 2 },
  { pool: 'Night Shift Ready', candidates: 24, avgMatch: 84, hires: 3 }
];

const smartPoolPerformanceData = [
  { name: 'High Match Candidates', autoAdded: 28, hired: 4, efficiency: 92 },
  { name: 'React Specialists', autoAdded: 15, hired: 2, efficiency: 87 },
  { name: 'Recently Active', autoAdded: 42, hired: 3, efficiency: 78 }
];

export default function TalentPoolsTab({ dateRange, compareMode }: TalentPoolsTabProps) {
  return (
    <div className="space-y-6">
      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <FolderHeart className="w-5 h-5 text-tangerine mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">18</p>
          <p className="text-sm text-sage">Total Pools</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+6 vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <Users className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">342</p>
          <p className="text-sm text-sage">Candidates in Pools</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+75 vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <Zap className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">6</p>
          <p className="text-sm text-sage">Smart Pools</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+3 vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <TrendingUp className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">89%</p>
          <p className="text-sm text-sage">Avg Pool Match Score</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+4% vs last period</p>}
        </div>
      </div>

      {/* Pool Growth Over Time */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Pool Growth Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={poolGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
            <XAxis dataKey="month" stroke="#b8b08d" />
            <YAxis yAxisId="left" stroke="#b8b08d" />
            <YAxis yAxisId="right" orientation="right" stroke="#b8b08d" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#202c39',
                border: '1px solid #b8b08d',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="pools" stroke="#f29559" strokeWidth={3} name="Total Pools" />
            <Line yAxisId="right" type="monotone" dataKey="candidates" stroke="#3b82f6" strokeWidth={2} name="Total Candidates" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pool Performance */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Pool Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={poolPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
            <XAxis dataKey="pool" stroke="#b8b08d" />
            <YAxis stroke="#b8b08d" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#202c39',
                border: '1px solid #b8b08d',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="candidates" fill="#3b82f6" name="Candidates" radius={[8, 8, 0, 0]} />
            <Bar dataKey="hires" fill="#22c55e" name="Hires" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Pool Performance */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-500" />
          Smart Pool Performance
        </h3>
        <div className="space-y-4">
          {smartPoolPerformanceData.map((pool, idx) => (
            <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gunmetal dark:text-peach">{pool.name}</h4>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                  {pool.efficiency}% efficiency
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-sage mb-1">Auto-Added</p>
                  <p className="text-2xl font-bold text-gunmetal dark:text-peach">{pool.autoAdded}</p>
                </div>
                <div>
                  <p className="text-sm text-sage mb-1">Hired</p>
                  <p className="text-2xl font-bold text-green-500">{pool.hired}</p>
                </div>
                <div>
                  <p className="text-sm text-sage mb-1">Conversion</p>
                  <p className="text-2xl font-bold text-tangerine">
                    {((pool.hired / pool.autoAdded) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Pools */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Most Active Pools</h3>
          <div className="space-y-3">
            {poolPerformanceData.slice(0, 3).map((pool, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-peach/10 dark:bg-gunmetal rounded-lg hover:bg-peach/20 dark:hover:bg-gunmetal/80 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-tangerine text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gunmetal dark:text-peach">{pool.pool}</p>
                  <p className="text-sm text-sage">{pool.candidates} candidates • {pool.hires} hires</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-tangerine">{pool.avgMatch}%</p>
                  <p className="text-xs text-sage">avg match</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pool Insights */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Pool Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <p className="text-sm font-semibold text-gunmetal dark:text-peach mb-2">💡 Best Performing Pool</p>
              <p className="text-lg font-bold text-blue-600">{poolPerformanceData[1].pool}</p>
              <p className="text-xs text-sage mt-1">
                {poolPerformanceData[1].avgMatch}% avg match, {poolPerformanceData[1].hires} hires
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <p className="text-sm font-semibold text-gunmetal dark:text-peach mb-2">📈 Fastest Growing Pool</p>
              <p className="text-lg font-bold text-purple-600">{poolPerformanceData[3].pool}</p>
              <p className="text-xs text-sage mt-1">
                Added 18 candidates this month
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <p className="text-sm font-semibold text-gunmetal dark:text-peach mb-2">⚡ Most Efficient Smart Pool</p>
              <p className="text-lg font-bold text-green-600">{smartPoolPerformanceData[0].name}</p>
              <p className="text-xs text-sage mt-1">
                {smartPoolPerformanceData[0].efficiency}% efficiency score
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
