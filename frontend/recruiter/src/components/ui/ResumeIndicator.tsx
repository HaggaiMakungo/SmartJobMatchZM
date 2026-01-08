import { useEffect, useState } from 'react';
import { RotateCcw, Check, Clock } from 'lucide-react';

interface ResumeIndicatorProps {
  pageName: string;
  cacheAge: number; // in minutes
  onReset?: () => void;
  className?: string;
}

/**
 * Toast-style indicator that shows when resuming from cached state
 * Auto-dismisses after 4 seconds
 */
export default function ResumeIndicator({ 
  pageName, 
  cacheAge, 
  onReset,
  className = '' 
}: ResumeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setIsVisible(false), 300); // Wait for exit animation
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const getTimeText = () => {
    if (cacheAge === 0) return 'Just now';
    if (cacheAge === 1) return '1 minute ago';
    if (cacheAge < 60) return `${cacheAge} minutes ago`;
    const hours = Math.floor(cacheAge / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className={`fixed top-20 right-6 z-40 transition-all duration-300 ${
      isExiting ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'
    } ${className}`}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-tangerine/20 to-peach/20 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-tangerine/20 rounded-lg">
              <Check className="w-4 h-4 text-tangerine" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-white">
                  Resumed {pageName}
                </h4>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Last visited {getTimeText()}</span>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                Filters, selections, and scroll position restored
              </p>
            </div>

            {onReset && (
              <button
                onClick={() => {
                  onReset();
                  setIsExiting(true);
                  setTimeout(() => setIsVisible(false), 300);
                }}
                className="p-1.5 hover:bg-gray-700 rounded transition"
                title="Reset to defaults"
              >
                <RotateCcw className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar for auto-dismiss */}
        <div className="h-1 bg-gray-700 overflow-hidden">
          <div 
            className="h-full bg-tangerine animate-shrink-width"
            style={{ animationDuration: '4s' }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Simpler inline version for embedding in pages
 */
export function InlineResumeIndicator({ 
  cacheAge,
  onReset 
}: { 
  cacheAge: number;
  onReset?: () => void;
}) {
  if (cacheAge === 0) return null;

  const getTimeText = () => {
    if (cacheAge === 1) return '1 min ago';
    if (cacheAge < 60) return `${cacheAge} min ago`;
    const hours = Math.floor(cacheAge / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-tangerine/10 border border-tangerine/30 rounded-lg">
      <Check className="w-4 h-4 text-tangerine" />
      <span className="text-sm text-tangerine font-medium">
        Resumed from {getTimeText()}
      </span>
      {onReset && (
        <button
          onClick={onReset}
          className="ml-auto p-1 hover:bg-tangerine/20 rounded transition"
          title="Reset to defaults"
        >
          <RotateCcw className="w-3 h-3 text-tangerine" />
        </button>
      )}
    </div>
  );
}
