'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, TrendingUp } from 'lucide-react';
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import OverviewTab from '@/components/analytics/OverviewTab';
import JobsTab from '@/components/analytics/JobsTab';
import ApplicationsTab from '@/components/analytics/ApplicationsTab';
import CandidatesTab from '@/components/analytics/CandidatesTab';
import TalentPoolsTab from '@/components/analytics/TalentPoolsTab';
import ExportModal from '@/components/analytics/ExportModal';

type TabType = 'overview' | 'jobs' | 'applications' | 'candidates' | 'pools';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'jobs', name: 'Jobs', icon: '💼' },
    { id: 'applications', name: 'Applications', icon: '📄' },
    { id: 'candidates', name: 'Candidates', icon: '👥' },
    { id: 'pools', name: 'Talent Pools', icon: '📁' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gunmetal dark:text-peach">Analytics & Insights</h1>
          <p className="text-sage mt-1">Track performance and make data-driven decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-sage/10 hover:bg-sage/20 text-gunmetal dark:text-peach rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Sticky Filters Bar */}
      <div className="sticky top-16 z-20 bg-peach/5 dark:bg-gunmetal/20 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 backdrop-blur-sm border-b border-sage/10">
        <AnalyticsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
          compareMode={compareMode}
          onCompareModeChange={setCompareMode}
        />
      </div>

      {/* Last Refresh Info */}
      <div className="flex items-center justify-between text-xs text-sage">
        <span>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </span>
        <span>Auto-refreshes every 5 minutes</span>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-xl shadow-md border border-sage/10 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-sage/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-tangerine text-white border-b-2 border-tangerine'
                  : 'text-gunmetal dark:text-sage hover:bg-sage/5'
              }`}
            >
              {typeof tab.icon === 'string' ? (
                <span className="text-lg">{tab.icon}</span>
              ) : (
                <tab.icon className="w-5 h-5" />
              )}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              dateRange={dateRange}
              compareMode={compareMode}
            />
          )}
          {activeTab === 'jobs' && (
            <JobsTab
              dateRange={dateRange}
              compareMode={compareMode}
            />
          )}
          {activeTab === 'applications' && (
            <ApplicationsTab
              dateRange={dateRange}
              compareMode={compareMode}
            />
          )}
          {activeTab === 'candidates' && (
            <CandidatesTab
              dateRange={dateRange}
              compareMode={compareMode}
            />
          )}
          {activeTab === 'pools' && (
            <TalentPoolsTab
              dateRange={dateRange}
              compareMode={compareMode}
            />
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          activeTab={activeTab}
          dateRange={dateRange}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
