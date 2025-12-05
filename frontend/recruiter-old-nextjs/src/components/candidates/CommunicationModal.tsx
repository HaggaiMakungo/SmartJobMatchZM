import { X, Mail, Phone, MessageCircle } from 'lucide-react';

interface Candidate {
  cv_id: string;
  full_name: string;
  email: string;
}

interface CommunicationModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export default function CommunicationModal({ candidate, onClose }: CommunicationModalProps) {
  const communications = candidate ? [
    { id: 1, type: 'email', subject: 'Interview Invitation', date: '2024-01-15 10:30 AM', status: 'Sent' },
    { id: 2, type: 'phone', subject: 'Initial Screening Call', date: '2024-01-10 2:00 PM', status: 'Completed' },
    { id: 3, type: 'email', subject: 'Application Confirmation', date: '2024-01-05 9:15 AM', status: 'Sent' },
  ] : [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#FF6B35]" />
            <h3 className="font-semibold text-gray-900">Communication History</h3>
            {candidate && <span className="text-sm text-gray-600">- {candidate.full_name}</span>}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Communications List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {candidate ? (
            <div className="space-y-3">
              {communications.map(comm => (
                <div key={comm.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-white rounded-lg">
                        {getIcon(comm.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{comm.subject}</h4>
                        <p className="text-sm text-gray-600 mb-2">{comm.date}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          comm.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {comm.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>All communications history</p>
              <p className="text-sm">Select a candidate to view their history</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {candidate && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
            <button className="flex-1 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8555] text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Phone className="w-4 h-4" />
              Log Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
