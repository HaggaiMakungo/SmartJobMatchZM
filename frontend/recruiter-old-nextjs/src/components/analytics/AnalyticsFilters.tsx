'use client';

import { Calendar, GitCompare } from 'lucide-react';

interface AnalyticsFiltersProps {
  dateRange: '7d' | '30d' | '90d' | 'custom';
  onDateRangeChange: (range: '7d' | '30d' | '90d' | 'custom') => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
  compareMode: boolean;
  onCompareModeChange: (enabled: boolean) => void;
}

export default function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
  compareMode,
  onCompareModeChange
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="w-5 h-5 text-sage" />
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? 'bg-tangerine text-white'
                  : 'bg-white dark:bg-gunmetal text-gunmetal dark:text-peach hover:bg-sage/10'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDateRangeChange('custom')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dateRange === 'custom'
              ? 'bg-tangerine text-white'
              : 'bg-white dark:bg-gunmetal text-gunmetal dark:text-peach hover:bg-sage/10'
          }`}
        >
          Custom Range
        </button>
        
        {dateRange === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-sm text-gunmetal dark:text-peach focus:outline-none focus:ring-2 focus:ring-tangerine"
            />
            <span className="text-sage">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-sm text-gunmetal dark:text-peach focus:outline-none focus:ring-2 focus:ring-tangerine"
            />
          </div>
        )}
      </div>

      {/* Compare Mode Toggle */}
      <div className="flex items-center gap-3 ml-auto">
        <GitCompare className="w-5 h-5 text-sage" />
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gunmetal dark:text-peach">Compare Periods</span>
          <button
            onClick={() => onCompareModeChange(!compareMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              compareMode ? 'bg-tangerine' : 'bg-sage/30'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                compareMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
