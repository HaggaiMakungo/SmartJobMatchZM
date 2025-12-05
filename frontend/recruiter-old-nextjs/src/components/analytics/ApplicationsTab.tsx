'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface ApplicationsTabProps {
  dateRange: string;
  compareMode: boolean;
}

const applicationsData = [
  { week: 'Week 1', new: 245, screening: 180, interview: 45, offer: 12, hired: 4 },
  { week: 'Week 2', new: 298, screening: 220, interview: 58, offer: 15, hired: 5 },
  { week: 'Week 3', new: 312, screening: 245, interview: 62, offer: 18, hired: 3 },
  { week: 'Week 4', new: 392, screening: 290, interview: 78, offer: 22, hired: 6 }
];

const stageConversionData = [
  { stage: 'New → Screening', rate: 74, dropRate: 26 },
  { stage: 'Screening → Interview', rate: 28, dropRate: 72 },
  { stage: 'Interview → Offer', rate: 32, dropRate: 68 },
  { stage: 'Offer → Hired', rate: 68, dropRate: 32 }
];

const responseTimeData = [
  { day: 'Mon', avgHours: 4.2 },
  { day: 'Tue', avgHours: 3.8 },
  { day: 'Wed', avgHours: 5.1 },
  { day: 'Thu', avgHours: 4.5 },
  { day: 'Fri', avgHours: 6.2 }
];

export default function ApplicationsTab({ dateRange, compareMode }: ApplicationsTabProps) {
  return (
    <div className="space-y-6">
      {/* Application Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <FileText className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">1,247</p>
          <p className="text-sm text-sage">Total Applications</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+12.5% vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">74%</p>
          <p className="text-sm text-sage">Screening Rate</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+3.2% vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <Clock className="w-5 h-5 text-tangerine mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">4.6h</p>
          <p className="text-sm text-sage">Avg Response Time</p>
          {compareMode && <p className="text-xs text-red-500 mt-1">+0.8h vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <CheckCircle className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">68%</p>
          <p className="text-sm text-sage">Offer Accept Rate</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+5.1% vs last period</p>}
        </div>
      </div>

      {/* Applications Flow Over Time */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Application Flow by Stage</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={applicationsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
            <XAxis dataKey="week" stroke="#b8b08d" />
            <YAxis stroke="#b8b08d" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#202c39',
                border: '1px solid #b8b08d',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="new" stroke="#3b82f6" strokeWidth={2} name="New" />
            <Line type="monotone" dataKey="screening" stroke="#8b5cf6" strokeWidth={2} name="Screening" />
            <Line type="monotone" dataKey="interview" stroke="#f59e0b" strokeWidth={2} name="Interview" />
            <Line type="monotone" dataKey="offer" stroke="#10b981" strokeWidth={2} name="Offer" />
            <Line type="monotone" dataKey="hired" stroke="#22c55e" strokeWidth={3} name="Hired" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Conversion Rates */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Stage Conversion Rates</h3>
          <div className="space-y-4">
            {stageConversionData.map((stage, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gunmetal dark:text-peach">{stage.stage}</span>
                  <span className="text-sm font-semibold text-green-500">{stage.rate}%</span>
                </div>
                <div className="w-full bg-sage/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                    style={{ width: `${stage.rate}%` }}
                  />
                </div>
                <p className="text-xs text-red-500 mt-1">Drop-off: {stage.dropRate}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Average Response Time */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Response Time by Day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
              <XAxis dataKey="day" stroke="#b8b08d" />
              <YAxis stroke="#b8b08d" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#202c39',
                  border: '1px solid #b8b08d',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="avgHours" fill="#f29559" name="Avg Hours" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drop-off Analysis */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Drop-off Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">Top Reasons for Rejection</h4>
            <div className="space-y-2">
              {[
                { reason: 'Skills mismatch', percentage: 42 },
                { reason: 'Experience level', percentage: 28 },
                { reason: 'Location', percentage: 18 },
                { reason: 'Salary expectations', percentage: 12 }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-peach/10 dark:bg-gunmetal rounded-lg">
                  <span className="text-sm text-gunmetal dark:text-peach">{item.reason}</span>
                  <span className="text-sm font-bold text-tangerine">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">Stage with Highest Drop-off</h4>
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-lg border-l-4 border-red-500">
              <p className="text-3xl font-bold text-red-500 mb-2">72%</p>
              <p className="text-sm text-gunmetal dark:text-peach font-medium mb-1">Screening → Interview</p>
              <p className="text-xs text-sage">Most candidates drop off during screening stage</p>
              <div className="mt-4 p-3 bg-white dark:bg-gunmetal rounded-lg">
                <p className="text-xs text-sage mb-1">💡 Recommendation:</p>
                <p className="text-sm text-gunmetal dark:text-peach">Review screening criteria to reduce false negatives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
