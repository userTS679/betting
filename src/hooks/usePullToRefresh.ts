import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = (options: PullToRefreshOptions) => {
  const {
    onRefresh,
    threshold = 80,
    resistance = 2.5,
    enabled = true
  } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isAtTop = useRef<boolean>(true);

  const checkScrollPosition = () => {
    isAtTop.current = window.scrollY === 0;
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    checkScrollPosition();
    if (!isAtTop.current) return;

    startY.current = e.touches[0].clientY;
    setIsPulling(false);
    setPullDistance(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!enabled || isRefreshing || !isAtTop.current) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      // Prevent default scroll behavior when pulling down
      e.preventDefault();
      
      const distance = Math.min(deltaY / resistance, threshold * 1.5);
      setPullDistance(distance);
      setIsPulling(distance > 10);
    }
  };

  const handleTouchEnd = async () => {
    if (!enabled || isRefreshing || !isPulling) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  };

  useEffect(() => {
    if (!enabled) return;

    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', checkScrollPosition, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [enabled, onRefresh, threshold, resistance]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    shouldShowIndicator: isPulling || isRefreshing
  };
};