'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Users, FileText, TrendingUp, Plus, Eye, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jobsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newCandidates: 0,
    interviewsScheduled: 0,
  });

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load jobs count
      const jobsData = await jobsApi.getCorporate({ limit: 100 });
      
      // Update stats with real job count
      setStats({
        activeJobs: jobsData.total || 0,
        totalApplications: 0, // TODO: Connect to applications API later
        newCandidates: 0,
        interviewsScheduled: 0,
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tangerine"></div>
      </div>
    );
  }

  const metricCards = [
    { 
      title: 'Active Jobs', 
      value: stats.activeJobs.toString(), 
      change: 'Ready to match', 
      icon: Briefcase, 
      color: 'tangerine' 
    },
    { 
      title: 'Job Matching', 
      value: 'AI-Powered', 
      change: 'Enhanced algorithm', 
      icon: TrendingUp, 
      color: 'peach' 
    },
    { 
      title: 'Candidates', 
      value: '2,500+', 
      change: 'In database', 
      icon: Users, 
      color: 'sage' 
    },
    { 
      title: 'Match Quality', 
      value: '90%', 
      change: 'Relevance rate', 
      icon: CheckCircle, 
      color: 'gunmetal' 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gunmetal dark:text-peach">Welcome back!</h1>
          <p className="text-sage mt-1">AI-powered candidate matching for your job postings</p>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard/jobs'}
          className="flex items-center gap-2 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Eye className="w-5 h-5" />
          View Job Matches
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-sage/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${card.color}/10 rounded-lg`}>
                <card.icon className={`w-6 h-6 text-${card.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gunmetal dark:text-peach mb-1">{card.value}</h3>
            <p className="text-sm text-sage mb-2">{card.title}</p>
            <p className="text-xs text-sage/70 font-medium">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Matching */}
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-tangerine/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-tangerine" />
            </div>
            <h3 className="text-lg font-bold text-gunmetal dark:text-peach">AI Matching</h3>
          </div>
          <p className="text-sage mb-4">
            Our enhanced matching algorithm uses semantic AI and skill rarity weighting to find the best candidates for your roles.
          </p>
          <ul className="space-y-2 text-sm text-sage">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              90% relevance rate
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Skills-first approach
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Category-aware filtering
            </li>
          </ul>
        </div>

        {/* Candidate Database */}
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-peach/10 rounded-lg">
              <Users className="w-6 h-6 text-peach" />
            </div>
            <h3 className="text-lg font-bold text-gunmetal dark:text-peach">Candidate Pool</h3>
          </div>
          <p className="text-sage mb-4">
            Access our database of 2,500+ qualified candidates across various industries and skill levels.
          </p>
          <ul className="space-y-2 text-sm text-sage">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Verified CVs
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Diverse skill sets
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Real-time matching
            </li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-sage/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-sage" />
            </div>
            <h3 className="text-lg font-bold text-gunmetal dark:text-peach">Your Jobs</h3>
          </div>
          <p className="text-sage mb-4">
            Manage your job postings and view AI-matched candidates for each role.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/jobs'}
            className="w-full px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-all"
          >
            View All Jobs
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gunmetal/40 rounded-xl shadow-lg p-6 border border-sage/10">
        <h3 className="text-lg font-bold text-gunmetal dark:text-peach mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard/jobs'}
            className="p-4 bg-sage/5 hover:bg-sage/10 rounded-lg transition-all text-left group"
          >
            <Briefcase className="w-8 h-8 text-tangerine mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gunmetal dark:text-peach">View Matches</p>
            <p className="text-xs text-sage mt-1">See AI-matched candidates</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard/candidates'}
            className="p-4 bg-sage/5 hover:bg-sage/10 rounded-lg transition-all text-left group"
          >
            <Users className="w-8 h-8 text-peach mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gunmetal dark:text-peach">Saved Candidates</p>
            <p className="text-xs text-sage mt-1">Manage your candidate pool</p>
          </button>
          
          <button className="p-4 bg-sage/5 hover:bg-sage/10 rounded-lg transition-all text-left group">
            <FileText className="w-8 h-8 text-sage mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gunmetal dark:text-peach">Download CVs</p>
            <p className="text-xs text-sage mt-1">Export candidate resumes</p>
          </button>
          
          <button className="p-4 bg-sage/5 hover:bg-sage/10 rounded-lg transition-all text-left group">
            <Clock className="w-8 h-8 text-gunmetal/70 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gunmetal dark:text-peach">Job Analytics</p>
            <p className="text-xs text-sage mt-1">View matching insights</p>
          </button>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-r from-tangerine/10 to-peach/10 rounded-xl p-6 border border-tangerine/20">
        <h3 className="text-lg font-bold text-gunmetal dark:text-peach mb-3">🚀 Getting Started</h3>
        <div className="space-y-2 text-sm text-sage">
          <p>1. <strong>View your jobs</strong> - Click "View Matches" to see your active job postings</p>
          <p>2. <strong>Review AI matches</strong> - Each job has AI-matched candidates ranked by relevance</p>
          <p>3. <strong>Save candidates</strong> - Bookmark promising candidates for later review</p>
          <p>4. <strong>Download CVs</strong> - Get full candidate details for shortlisted applicants</p>
        </div>
      </div>
    </div>
  );
}
