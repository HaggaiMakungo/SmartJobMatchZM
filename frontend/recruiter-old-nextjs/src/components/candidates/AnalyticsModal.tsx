import { X, BarChart3, TrendingUp, Clock, Users } from 'lucide-react';

interface Candidate {
  stage: string;
  saved_date: string;
}

interface AnalyticsModalProps {
  candidates: Candidate[];
  onClose: () => void;
}

export default function AnalyticsModal({ candidates, onClose }: AnalyticsModalProps) {
  // Calculate analytics
  const totalCandidates = candidates.length;
  const avgTimeToHire = 28; // Mock data
  const conversionRate = 12; // Mock data
  
  const stageDistribution = {
    saved: candidates.filter(c => c.stage === 'saved').length,
    invited: candidates.filter(c => c.stage === 'invited').length,
    screening: candidates.filter(c => c.stage === 'screening').length,
    interview: candidates.filter(c => c.stage === 'interview').length,
    offer: candidates.filter(c => c.stage === 'offer').length,
    hired: candidates.filter(c => c.stage === 'hired').length,
    rejected: candidates.filter(c => c.stage === 'rejected').length,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8555] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              <h3 className="text-2xl font-bold">Hiring Analytics</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-blue-800 mb-1">Total Candidates</p>
              <p className="text-3xl font-bold text-blue-900">{totalCandidates}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-green-800 mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-green-900">{conversionRate}%</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-purple-800 mb-1">Avg Time to Hire</p>
              <p className="text-3xl font-bold text-purple-900">{avgTimeToHire}d</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-sm text-orange-800 mb-1">Hired</p>
              <p className="text-3xl font-bold text-orange-900">{stageDistribution.hired}</p>
            </div>
          </div>

          {/* Pipeline Health */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h4>
            <div className="space-y-3">
              {Object.entries(stageDistribution).map(([stage, count]) => {
                const percentage = totalCandidates > 0 ? (count / totalCandidates * 100).toFixed(1) : 0;
                const colors: Record<string, string> = {
                  saved: 'bg-gray-500',
                  invited: 'bg-blue-500',
                  screening: 'bg-yellow-500',
                  interview: 'bg-purple-500',
                  offer: 'bg-green-500',
                  hired: 'bg-emerald-600',
                  rejected: 'bg-red-500'
                };

                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{stage}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${colors[stage]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">3 candidates moved to Interview</p>
                  <p className="text-sm text-gray-600">Today, 2:30 PM</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">5 new candidates saved</p>
                  <p className="text-sm text-gray-600">Yesterday, 4:15 PM</p>
                </div>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">2 offers sent</p>
                  <p className="text-sm text-gray-600">2 days ago, 11:00 AM</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
