'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Briefcase, TrendingUp, Clock, Target } from 'lucide-react';

interface JobsTabProps {
  dateRange: string;
  compareMode: boolean;
}

const jobPerformanceData = [
  { job: 'Frontend Dev', applications: 142, avgMatch: 88, timeToFill: 14 },
  { job: 'Product Manager', applications: 98, avgMatch: 92, timeToFill: 21 },
  { job: 'DevOps Engineer', applications: 87, avgMatch: 85, timeToFill: 18 },
  { job: 'UX Designer', applications: 76, avgMatch: 90, timeToFill: 12 },
  { job: 'Backend Dev', applications: 134, avgMatch: 86, timeToFill: 16 }
];

const timeToFillTrend = [
  { month: 'Jan', days: 22 },
  { month: 'Feb', days: 19 },
  { month: 'Mar', days: 17 },
  { month: 'Apr', days: 18 }
];

const jobStatusData = [
  { status: 'Active', count: 24, color: '#22c55e' },
  { status: 'On Hold', count: 8, color: '#f59e0b' },
  { status: 'Closed', count: 45, color: '#3b82f6' },
  { status: 'Draft', count: 5, color: '#8b5cf6' }
];

export default function JobsTab({ dateRange, compareMode }: JobsTabProps) {
  return (
    <div className="space-y-6">
      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-tangerine" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">24</p>
          <p className="text-sm text-sage">Active Jobs</p>
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-green-500">-3 days</span>
          </div>
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">18d</p>
          <p className="text-sm text-sage">Avg Time to Fill</p>
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">88%</p>
          <p className="text-sm text-sage">Avg Match Score</p>
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-green-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">45</p>
          <p className="text-sm text-sage">Jobs Filled</p>
        </div>
      </div>

      {/* Applications per Job */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Applications per Job</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={jobPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
            <XAxis dataKey="job" stroke="#b8b08d" />
            <YAxis stroke="#b8b08d" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#202c39',
                border: '1px solid #b8b08d',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="applications" fill="#f29559" name="Applications" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Match Score per Job */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Average Match Score</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobPerformanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
              <XAxis type="number" domain={[0, 100]} stroke="#b8b08d" />
              <YAxis dataKey="job" type="category" stroke="#b8b08d" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#202c39',
                  border: '1px solid #b8b08d',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="avgMatch" fill="#22c55e" name="Match %" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time to Fill Trend */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Time to Fill Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeToFillTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
              <XAxis dataKey="month" stroke="#b8b08d" />
              <YAxis stroke="#b8b08d" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#202c39',
                  border: '1px solid #b8b08d',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={3} name="Days" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Job Status Distribution */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Job Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {jobStatusData.map((status, idx) => (
            <div key={idx} className="p-4 bg-peach/10 dark:bg-gunmetal rounded-lg border-l-4" style={{ borderColor: status.color }}>
              <p className="text-3xl font-bold text-gunmetal dark:text-peach mb-1">{status.count}</p>
              <p className="text-sm text-sage">{status.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Jobs Table */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Job Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gunmetal dark:text-peach">Job Title</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gunmetal dark:text-peach">Applications</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gunmetal dark:text-peach">Avg Match</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gunmetal dark:text-peach">Time to Fill</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gunmetal dark:text-peach">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobPerformanceData.map((job, idx) => (
                <tr key={idx} className="border-b border-sage/10 hover:bg-peach/5 dark:hover:bg-gunmetal/80 cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-gunmetal dark:text-peach font-medium">{job.job}</td>
                  <td className="py-3 px-4 text-center text-sage">{job.applications}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      job.avgMatch >= 90 ? 'bg-green-100 text-green-700' :
                      job.avgMatch >= 85 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.avgMatch}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-sage">{job.timeToFill} days</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
