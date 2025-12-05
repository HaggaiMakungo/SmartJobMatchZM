'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const POOL_TEMPLATES = [
  {
    id: 'shortlist',
    name: 'Shortlist',
    description: 'Top candidates for immediate consideration',
    icon: '⭐',
    color: '#f59e0b'
  },
  {
    id: 'interview-pipeline',
    name: 'Interview Pipeline',
    description: 'Candidates scheduled or ready for interviews',
    icon: '📅',
    color: '#3b82f6'
  },
  {
    id: 'future-hires',
    name: 'Future Hires',
    description: 'Great candidates to keep in touch with',
    icon: '🚀',
    color: '#8b5cf6'
  },
  {
    id: 'referrals',
    name: 'Referrals',
    description: 'Candidates recommended by employees',
    icon: '🤝',
    color: '#10b981'
  },
  {
    id: 'alumni',
    name: 'Alumni',
    description: 'Former employees eligible for rehire',
    icon: '🎓',
    color: '#f43f5e'
  }
];

const ICONS = ['⭐', '🚀', '💼', '🎯', '🔥', '💡', '🌟', '👑', '🎓', '🤝', '📅', '🌙', '⚡', '🎨', '🏆'];
const COLORS = [
  '#f29559', // Tangerine
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#6366f1'  // Indigo
];

interface CreatePoolModalProps {
  onClose: () => void;
  onCreate: (poolData: any) => void;
}

export default function CreatePoolModal({ onClose, onCreate }: CreatePoolModalProps) {
  const [step, setStep] = useState<'choose' | 'customize'>('choose');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('⭐');
  const [selectedColor, setSelectedColor] = useState('#f29559');
  const [visibility, setVisibility] = useState<'private' | 'team' | 'company'>('private');
  const [isSmartPool, setIsSmartPool] = useState(false);
  const [matchScoreThreshold, setMatchScoreThreshold] = useState(80);
  const [autoSkills, setAutoSkills] = useState('');

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setName(template.name);
    setDescription(template.description);
    setSelectedIcon(template.icon);
    setSelectedColor(template.color);
    setStep('customize');
  };

  const handleBlankPool = () => {
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    setSelectedIcon('⭐');
    setSelectedColor('#f29559');
    setStep('customize');
  };

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Please enter a pool name');
      return;
    }

    const poolData = {
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

    onCreate(poolData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gunmetal rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gunmetal border-b border-sage/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">
              {step === 'choose' ? 'Create Talent Pool' : 'Customize Pool'}
            </h2>
            <p className="text-sage text-sm mt-1">
              {step === 'choose' 
                ? 'Start from scratch or use a template'
                : 'Set up your talent pool details'
              }
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
        <div className="p-6">
          {step === 'choose' ? (
            // Step 1: Choose Template or Blank
            <div className="space-y-6">
              {/* Blank Pool Option */}
              <button
                onClick={handleBlankPool}
                className="w-full p-6 border-2 border-dashed border-sage/30 hover:border-tangerine rounded-xl transition-all hover:bg-peach/5 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-sage/10 flex items-center justify-center text-3xl group-hover:bg-tangerine/10 transition-colors">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gunmetal dark:text-peach mb-1">
                      Start from Scratch
                    </h3>
                    <p className="text-sm text-sage">
                      Create a custom talent pool with your own settings
                    </p>
                  </div>
                </div>
              </button>

              {/* Templates */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-tangerine" />
                  <h3 className="text-lg font-semibold text-gunmetal dark:text-peach">
                    Or Choose a Template
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {POOL_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 border-2 border-sage/20 hover:border-tangerine rounded-xl transition-all hover:bg-peach/5 text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: template.color + '20' }}
                        >
                          {template.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gunmetal dark:text-peach mb-1">
                            {template.name}
                          </h4>
                          <p className="text-sm text-sage">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Customize Pool
            <div className="space-y-6">
              {/* Pool Name */}
              <div>
                <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                  Pool Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Frontend Stars"
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
                  placeholder="Brief description of this talent pool..."
                  rows={3}
                  className="w-full px-4 py-3 bg-peach/10 dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tangerine text-gunmetal dark:text-peach resize-none"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                        selectedIcon === icon
                          ? 'bg-tangerine/20 ring-2 ring-tangerine'
                          : 'bg-sage/10 hover:bg-sage/20'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        selectedColor === color
                          ? 'ring-2 ring-offset-2 ring-tangerine'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['private', 'team', 'company'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setVisibility(level)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        visibility === level
                          ? 'border-tangerine bg-tangerine/10'
                          : 'border-sage/20 hover:border-sage/40'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {level === 'private' ? '🔒' : level === 'team' ? '👥' : '🌐'}
                      </div>
                      <div className="text-sm font-medium text-gunmetal dark:text-peach capitalize">
                        {level}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Pool Toggle */}
              <div className="border-t border-sage/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gunmetal dark:text-peach flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      Smart Pool (Auto-Update)
                    </h3>
                    <p className="text-sm text-sage mt-1">
                      Automatically add candidates based on rules
                    </p>
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

                {/* Smart Pool Rules */}
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
                        placeholder="e.g., React, TypeScript, Node.js"
                        className="w-full px-4 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gunmetal dark:text-peach"
                      />
                    </div>
                    <p className="text-xs text-sage">
                      💡 Candidates matching these criteria will be automatically added to this pool hourly.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 px-6 py-3 bg-sage/10 hover:bg-sage/20 text-gunmetal dark:text-peach rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium transition-colors"
                >
                  Create Pool
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
