import { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

type TimeRange = '30d' | '6m' | 'all';
type ChartType = 'line' | 'bar';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentValue: number | string;
  trend?: number;
  chartType?: ChartType;
  data: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  color?: string;
  icon?: React.ReactNode;
}

export default function ChartModal({
  isOpen,
  onClose,
  title,
  currentValue,
  trend,
  chartType = 'line',
  data,
  color = '#F2994A',
  icon
}: ChartModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  if (!isOpen) return null;

  // Filter data based on time range
  const filteredData = (() => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'all':
        return data;
    }

    return data.filter(item => new Date(item.date) >= cutoffDate);
  })();

  // Calculate trend from filtered data
  const calculateTrend = () => {
    if (filteredData.length < 2) return 0;
    
    const firstValue = filteredData[0].value;
    const lastValue = filteredData[filteredData.length - 1].value;
    
    if (firstValue === 0) return 100;
    
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const calculatedTrend = trend !== undefined ? trend : calculateTrend();
  const isPositive = calculatedTrend >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-gray-300 mb-1">{payload[0].payload.label || payload[0].payload.date}</p>
          <p className="text-lg font-bold" style={{ color }}>
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-sm text-gray-400 mt-1">Performance over time</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Current Value & Trend */}
          <div className="flex items-end gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Value</p>
              <p className="text-4xl font-bold text-white">{currentValue}</p>
            </div>
            
            {calculatedTrend !== 0 && (
              <div className="flex items-center gap-2 pb-2">
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{calculatedTrend.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-400">
                  vs previous period
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="border-b border-gray-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === '30d'
                  ? 'bg-tangerine text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === '6m'
                  ? 'bg-tangerine text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === 'all'
                  ? 'bg-tangerine text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={3}
                  dot={{ fill: color, r: 4 }}
                  activeDot={{ r: 6 }}
                  name={title}
                />
              </LineChart>
            ) : (
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="value"
                  fill={color}
                  name={title}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="border-t border-gray-700 px-6 py-4 bg-gray-800/50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Average</p>
              <p className="text-lg font-semibold text-white">
                {(filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Highest</p>
              <p className="text-lg font-semibold text-white">
                {Math.max(...filteredData.map(item => item.value))}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Lowest</p>
              <p className="text-lg font-semibold text-white">
                {Math.min(...filteredData.map(item => item.value))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
