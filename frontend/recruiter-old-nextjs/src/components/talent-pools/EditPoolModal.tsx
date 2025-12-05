'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const ICONS = ['⭐', '🚀', '💼', '🎯', '🔥', '💡', '🌟', '👑', '🎓', '🤝', '📅', '🌙', '⚡', '🎨', '🏆'];
const COLORS = ['#f29559', '#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1'];

interface EditPoolModalProps {
  pool: any;
  onClose: () => void;
  onSave: (poolData: any) => void;
}

export default function EditPoolModal({ pool, onClose, onSave }: EditPoolModalProps) {
  const [name, setName] = useState(pool.name);
  const [description, setDescription] = useState(pool.description);
  const [selectedIcon, setSelectedIcon] = useState(pool.icon);
  const [selectedColor, setSelectedColor] = useState(pool.color);
  const [visibility, setVisibility] = useState(pool.visibility);
  const [isSmartPool, setIsSmartPool] = useState(pool.isSmartPool || false);
  const [matchScoreThreshold, setMatchScoreThreshold] = useState(pool.rules?.matchScore || 80);
  const [autoSkills, setAutoSkills] = useState(pool.rules?.skills?.join(', ') || '');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a pool name');
      return;
    }

    const poolData = {
      ...pool,
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      visibility,
      isSmartPool,
      ...(isSmartPool && {
        rules: {
          matchScore: matchScoreThreshold,
          skills: autoSkills.split(',').map(s => s.trim()).filter(Boolean),
          autoUpdate: true
        }
      })
    };

    onSave(poolData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gunmetal border-b border-sage/10 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">Edit Pool</h2>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-sage" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pool Name */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
              Pool Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach resize-none"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                    selectedIcon === icon ? 'bg-tangerine/20 ring-2 ring-tangerine' : 'bg-sage/10 hover:bg-sage/20'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Color Tag</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-lg transition-all ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-tangerine' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Visibility</label>
            <div className="grid grid-cols-3 gap-3">
              {(['private', 'team', 'company'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setVisibility(level)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    visibility === level ? 'border-tangerine bg-tangerine/10' : 'border-sage/20 hover:border-sage/40'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {level === 'private' ? '🔒' : level === 'team' ? '👥' : '🌐'}
                  </div>
                  <div className="text-sm font-medium text-gunmetal dark:text-peach capitalize">{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Pool */}
          {!pool.isSmartPool && (
            <div className="border-t border-sage/10 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gunmetal dark:text-peach flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    Convert to Smart Pool
                  </h3>
                  <p className="text-sm text-sage mt-1">Enable automatic candidate updates</p>
                </div>
                <button
                  onClick={() => setIsSmartPool(!isSmartPool)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isSmartPool ? 'bg-green-500' : 'bg-sage/30'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      isSmartPool ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {isSmartPool && (
                <div className="space-y-4 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                      Minimum Match Score: {matchScoreThreshold}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={matchScoreThreshold}
                      onChange={(e) => setMatchScoreThreshold(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                      Required Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={autoSkills}
                      onChange={(e) => setAutoSkills(e.target.value)}
                      placeholder="e.g., React, TypeScript"
                      className="w-full px-4 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gunmetal dark:text-peach"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-sage/10 hover:bg-sage/20 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
