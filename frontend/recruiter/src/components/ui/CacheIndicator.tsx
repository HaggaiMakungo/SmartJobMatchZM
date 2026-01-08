import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

interface CacheIndicatorProps {
  lastFetched?: number;
  isFetching?: boolean;
  isStale?: boolean;
  className?: string;
}

/**
 * Visual indicator showing cache status and data freshness
 * 
 * Shows:
 * - Green: Fresh data (< 5 min)
 * - Yellow: Slightly stale (5-10 min)
 * - Red: Very stale (> 10 min)
 * - Spinner: Currently fetching
 */
export default function CacheIndicator({ 
  lastFetched, 
  isFetching,
  isStale,
  className = '' 
}: CacheIndicatorProps) {
  const [ageMinutes, setAgeMinutes] = useState(0);

  useEffect(() => {
    if (!lastFetched) return;

    const updateAge = () => {
      const age = Math.floor((Date.now() - lastFetched) / 60000);
      setAgeMinutes(age);
    };

    updateAge();
    const interval = setInterval(updateAge, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [lastFetched]);

  if (!lastFetched && !isFetching) return null;

  const getStatusColor = () => {
    if (isFetching) return 'text-blue-500';
    if (ageMinutes < 5) return 'text-green-500';
    if (ageMinutes < 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (isFetching) return 'Refreshing...';
    if (ageMinutes === 0) return 'Just now';
    if (ageMinutes === 1) return '1 min ago';
    if (ageMinutes < 60) return `${ageMinutes} min ago`;
    const hours = Math.floor(ageMinutes / 60);
    return `${hours}h ago`;
  };

  const StatusIcon = isFetching ? RefreshCw : Clock;

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()} ${className}`}>
      <StatusIcon 
        className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} 
      />
      <span className="font-medium">{getStatusText()}</span>
      {isStale && !isFetching && (
        <span className="text-xs text-gray-500">(updating in background)</span>
      )}
    </div>
  );
}

/**
 * Network status indicator
 */
export function NetworkIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <WifiOff className="w-5 h-5" />
      <div>
        <p className="font-semibold">You're offline</p>
        <p className="text-sm">Showing cached data</p>
      </div>
    </div>
  );
}

/**
 * Page cache age indicator (for debugging)
 */
interface PageCacheAgeProps {
  cacheTimestamp: number;
  pageName: string;
}

export function PageCacheAge({ cacheTimestamp, pageName }: PageCacheAgeProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  const ageMinutes = Math.floor((Date.now() - cacheTimestamp) / 60000);

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded text-xs font-mono z-50 opacity-50 hover:opacity-100 transition-opacity">
      <div className="font-semibold">{pageName} Cache</div>
      <div>Age: {ageMinutes === 0 ? 'Just now' : `${ageMinutes} min`}</div>
      <div>Valid: {ageMinutes < 10 ? '✓' : '✗'}</div>
    </div>
  );
}
