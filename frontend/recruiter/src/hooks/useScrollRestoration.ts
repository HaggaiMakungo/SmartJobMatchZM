import { useEffect, useRef } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

interface UseScrollRestorationOptions {
  key: string;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook to automatically save and restore scroll position for a page
 * 
 * Usage:
 * const scrollContainerRef = useScrollRestoration({ key: 'jobs-page' });
 * <div ref={scrollContainerRef} className="overflow-auto">...</div>
 */
export function useScrollRestoration({ 
  key, 
  enabled = true,
  debounceMs = 100 
}: UseScrollRestorationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isRestoringRef = useRef(false);

  // Restore scroll position on mount
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition) {
      try {
        const { x, y } = JSON.parse(savedPosition) as ScrollPosition;
        isRestoringRef.current = true;
        
        // Delay restoration to ensure content is loaded
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo(x, y);
            
            // Reset flag after restoration
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 100);
          }
        });
      } catch (error) {
        console.error('Failed to restore scroll position:', error);
      }
    }
  }, [key, enabled]);

  // Save scroll position on scroll
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      // Don't save during restoration
      if (isRestoringRef.current) return;

      // Debounce saves
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const position: ScrollPosition = {
          x: container.scrollLeft,
          y: container.scrollTop,
        };
        sessionStorage.setItem(`scroll-${key}`, JSON.stringify(position));
      }, debounceMs);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [key, enabled, debounceMs]);

  // Clear scroll position on unmount if disabled
  useEffect(() => {
    return () => {
      if (!enabled) {
        sessionStorage.removeItem(`scroll-${key}`);
      }
    };
  }, [key, enabled]);

  return containerRef;
}

/**
 * Manually save scroll position
 */
export function saveScrollPosition(key: string, x: number, y: number) {
  const position: ScrollPosition = { x, y };
  sessionStorage.setItem(`scroll-${key}`, JSON.stringify(position));
}

/**
 * Manually restore scroll position
 */
export function restoreScrollPosition(key: string, container: HTMLElement) {
  const savedPosition = sessionStorage.getItem(`scroll-${key}`);
  if (savedPosition) {
    try {
      const { x, y } = JSON.parse(savedPosition) as ScrollPosition;
      container.scrollTo(x, y);
    } catch (error) {
      console.error('Failed to restore scroll position:', error);
    }
  }
}

/**
 * Clear scroll position for a specific key
 */
export function clearScrollPosition(key: string) {
  sessionStorage.removeItem(`scroll-${key}`);
}

/**
 * Clear all scroll positions
 */
export function clearAllScrollPositions() {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith('scroll-')) {
      sessionStorage.removeItem(key);
    }
  });
}
