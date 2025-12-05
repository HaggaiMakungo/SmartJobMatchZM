'use client';

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, MapPin, Briefcase, Award } from 'lucide-react';

interface CandidatesTabProps {
  dateRange: string;
  compareMode: boolean;
}

const topSkillsData = [
  { skill: 'React', count: 245 },
  { skill: 'TypeScript', count: 198 },
  { skill: 'Node.js', count: 187 },
  { skill: 'Python', count: 156 },
  { skill: 'AWS', count: 134 },
  { skill: 'SQL', count: 128 },
  { skill: 'Java', count: 112 },
  { skill: 'Docker', count: 98 }
];

const locationData = [
  { location: 'Lusaka', count: 342, color: '#f29559' },
  { location: 'Ndola', count: 156, color: '#3b82f6' },
  { location: 'Kitwe', count: 98, color: '#22c55e' },
  { location: 'Livingstone', count: 76, color: '#8b5cf6' },
  { location: 'Remote', count: 184, color: '#f59e0b' }
];

const experienceData = [
  { level: 'Entry (0-2y)', count: 198, color: '#3b82f6' },
  { level: 'Mid (3-5y)', count: 312, color: '#22c55e' },
  { level: 'Senior (6-10y)', count: 245, color: '#f59e0b' },
  { level: 'Lead (10+y)', count: 101, color: '#8b5cf6' }
];

const availabilityData = [
  { status: 'Active Seeker', count: 425, color: '#22c55e' },
  { status: 'Passive', count: 287, color: '#3b82f6' },
  { status: 'Not Looking', count: 144, color: '#8b5cf6' }
];

const matchScoreDistribution = [
  { range: '90-100%', count: 142 },
  { range: '80-89%', count: 256 },
  { range: '70-79%', count: 198 },
  { range: '60-69%', count: 134 },
  { range: '<60%', count: 126 }
];

export default function CandidatesTab({ dateRange, compareMode }: CandidatesTabProps) {
  return (
    <div className="space-y-6">
      {/* Candidate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <Users className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">856</p>
          <p className="text-sm text-sage">Total Candidates</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+8.3% vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <Award className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">142</p>
          <p className="text-sm text-sage">Perfect Matches (90%+)</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+18 vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <Users className="w-5 h-5 text-tangerine mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">425</p>
          <p className="text-sm text-sage">Active Seekers</p>
          {compareMode && <p className="text-xs text-green-500 mt-1">+12.1% vs last period</p>}
        </div>
        <div className="bg-peach/10 dark:bg-gunmetal rounded-xl p-5 border border-sage/10">
          <Briefcase className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gunmetal dark:text-peach">5.2y</p>
          <p className="text-sm text-sage">Avg Experience</p>
          {compareMode && <p className="text-xs text-sage mt-1">Same as last period</p>}
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Top Skills in Database</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={topSkillsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
            <XAxis type="number" stroke="#b8b08d" />
            <YAxis dataKey="skill" type="category" stroke="#b8b08d" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#202c39',
                border: '1px solid #b8b08d',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill="#f29559" name="Candidates" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Distribution */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-tangerine" />
            Candidate Locations
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Experience Level Distribution */}
        <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
          <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Experience Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={experienceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ level, percent }) => `${level}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {experienceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Match Score Distribution */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Match Score Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={matchScoreDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b8b08d" opacity={0.1} />
            <XAxis dataKey="range" stroke="#b8b08d" />
            <YAxis stroke="#b8b08d" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#202c39',
                border: '1px solid #b8b08d',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill="#22c55e" name="Candidates" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Availability Status */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Availability Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availabilityData.map((item, idx) => (
            <div key={idx} className="p-5 bg-peach/10 dark:bg-gunmetal rounded-lg border-l-4" style={{ borderColor: item.color }}>
              <p className="text-3xl font-bold text-gunmetal dark:text-peach mb-2">{item.count}</p>
              <p className="text-sm text-sage">{item.status}</p>
              <p className="text-xs text-sage mt-2">
                {((item.count / 856) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Most Engaged Candidates */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl p-6 border border-sage/10">
        <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-4">Most Engaged Candidates</h3>
        <div className="space-y-3">
          {[
            { name: 'Sarah Johnson', engagement: 95, applications: 5, responses: '< 2h' },
            { name: 'Michael Chen', engagement: 92, applications: 4, responses: '< 4h' },
            { name: 'Aisha Banda', engagement: 88, applications: 6, responses: '< 6h' }
          ].map((candidate, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-peach/10 dark:bg-gunmetal rounded-lg hover:bg-peach/20 dark:hover:bg-gunmetal/80 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-tangerine text-white flex items-center justify-center font-bold text-lg">
                {candidate.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gunmetal dark:text-peach">{candidate.name}</p>
                <p className="text-sm text-sage">{candidate.applications} applications • {candidate.responses} avg response</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-tangerine">{candidate.engagement}%</p>
                <p className="text-xs text-sage">engagement</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
