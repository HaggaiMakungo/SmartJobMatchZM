'use client';

import { useState } from 'react';
import { X, FileText, Image, Mail, Calendar } from 'lucide-react';

interface ExportModalProps {
  activeTab: string;
  dateRange: string;
  onClose: () => void;
}

export default function ExportModal({ activeTab, dateRange, onClose }: ExportModalProps) {
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'png'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [scheduleReport, setScheduleReport] = useState(false);
  const [reportFrequency, setReportFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleExport = () => {
    // Simulate export
    console.log('Exporting:', { exportType, activeTab, dateRange, includeCharts });
    alert(`Exporting ${activeTab} analytics as ${exportType.toUpperCase()}...`);
    onClose();
  };

  const handleScheduleReport = () => {
    if (!recipientEmail) {
      alert('Please enter an email address');
      return;
    }
    console.log('Scheduling report:', { reportFrequency, recipientEmail });
    alert(`Report scheduled! You'll receive ${reportFrequency} reports at ${recipientEmail}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-sage/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">Export Analytics</h2>
            <p className="text-sage text-sm mt-1">
              Export {activeTab} data for {dateRange}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sage/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-sage" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Type Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gunmetal dark:text-peach mb-3">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportType('csv')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === 'csv'
                    ? 'border-tangerine bg-tangerine/10'
                    : 'border-sage/20 hover:border-sage/40'
                }`}
              >
                <FileText className={`w-8 h-8 mx-auto mb-2 ${
                  exportType === 'csv' ? 'text-tangerine' : 'text-sage'
                }`} />
                <p className="text-sm font-medium text-gunmetal dark:text-peach">CSV</p>
                <p className="text-xs text-sage mt-1">Data only</p>
              </button>

              <button
                onClick={() => setExportType('pdf')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === 'pdf'
                    ? 'border-tangerine bg-tangerine/10'
                    : 'border-sage/20 hover:border-sage/40'
                }`}
              >
                <FileText className={`w-8 h-8 mx-auto mb-2 ${
                  exportType === 'pdf' ? 'text-tangerine' : 'text-sage'
                }`} />
                <p className="text-sm font-medium text-gunmetal dark:text-peach">PDF</p>
                <p className="text-xs text-sage mt-1">Full report</p>
              </button>

              <button
                onClick={() => setExportType('png')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === 'png'
                    ? 'border-tangerine bg-tangerine/10'
                    : 'border-sage/20 hover:border-sage/40'
                }`}
              >
                <Image className={`w-8 h-8 mx-auto mb-2 ${
                  exportType === 'png' ? 'text-tangerine' : 'text-sage'
                }`} />
                <p className="text-sm font-medium text-gunmetal dark:text-peach">PNG</p>
                <p className="text-xs text-sage mt-1">Charts only</p>
              </button>
            </div>
          </div>

          {/* Include Charts Toggle (for CSV/PDF) */}
          {(exportType === 'pdf' || exportType === 'csv') && (
            <div className="flex items-center justify-between p-4 bg-peach/10 dark:bg-gunmetal rounded-lg">
              <div>
                <p className="text-sm font-medium text-gunmetal dark:text-peach">Include Charts</p>
                <p className="text-xs text-sage mt-1">Add visualizations to the export</p>
              </div>
              <button
                onClick={() => setIncludeCharts(!includeCharts)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  includeCharts ? 'bg-tangerine' : 'bg-sage/30'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    includeCharts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
          >
            Export {exportType.toUpperCase()}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sage/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gunmetal text-sage">or</span>
            </div>
          </div>

          {/* Schedule Reports */}
          <div className="border-2 border-sage/20 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-tangerine" />
                <div>
                  <h3 className="text-sm font-semibold text-gunmetal dark:text-peach">Schedule Automated Reports</h3>
                  <p className="text-xs text-sage mt-1">Receive reports automatically via email</p>
                </div>
              </div>
              <button
                onClick={() => setScheduleReport(!scheduleReport)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  scheduleReport ? 'bg-tangerine' : 'bg-sage/30'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    scheduleReport ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {scheduleReport && (
              <div className="space-y-4 mt-4 pt-4 border-t border-sage/10">
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                    Report Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setReportFrequency(freq)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                          reportFrequency === freq
                            ? 'bg-tangerine text-white'
                            : 'bg-sage/10 text-gunmetal dark:text-peach hover:bg-sage/20'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
                    />
                  </div>
                </div>

                {/* Schedule Button */}
                <button
                  onClick={handleScheduleReport}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Schedule {reportFrequency} Reports
                </button>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                  <p className="text-xs text-sage">
                    📧 You'll receive a {reportFrequency} email with a PDF report containing all {activeTab} analytics
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
