import { X, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

interface Candidate {
  cv_id: string;
  full_name: string;
}

interface NotesModalProps {
  candidate: Candidate;
  onClose: () => void;
}

export default function NotesModal({ candidate, onClose }: NotesModalProps) {
  const [newNote, setNewNote] = useState('');
  const [notes] = useState([
    { id: 1, text: 'Great candidate, very responsive', date: '2024-01-15', author: 'You' },
    { id: 2, text: 'Scheduled for technical interview', date: '2024-01-10', author: 'You' },
  ]);

  const addNote = () => {
    if (!newNote.trim()) return;
    alert(`Note added: ${newNote}`);
    setNewNote('');
    // TODO: Persist to backend
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#FF6B35]" />
            <h3 className="font-semibold text-gray-900">Notes & Collaboration</h3>
            <span className="text-sm text-gray-600">- {candidate.full_name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notes List */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
          {notes.map(note => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{note.author}</span>
                <span className="text-xs text-gray-500">{note.date}</span>
              </div>
              <p className="text-gray-700">{note.text}</p>
            </div>
          ))}
        </div>

        {/* Add Note */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
              placeholder="Add a note..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
            <button
              onClick={addNote}
              className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8555] text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
