import React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  threshold: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isPulling,
  isRefreshing,
  pullDistance,
  threshold
}) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  if (!isPulling && !isRefreshing) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent z-30 transition-all duration-200"
      style={{ 
        height: Math.max(pullDistance, isRefreshing ? 60 : 0),
        transform: `translateY(${isRefreshing ? 0 : -20}px)`
      }}
    >
      <div className="flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
        <div 
          className={`transition-all duration-200 ${
            isRefreshing ? 'animate-spin' : shouldTrigger ? 'scale-110' : ''
          }`}
          style={{
            transform: `rotate(${progress * 180}deg)`,
            opacity: Math.max(progress, 0.3)
          }}
        >
          {isRefreshing ? (
            <RefreshCw className="w-6 h-6" />
          ) : (
            <ArrowDown className="w-6 h-6" />
          )}
        </div>
        
        <p className="text-xs font-medium">
          {isRefreshing 
            ? 'Refreshing...' 
            : shouldTrigger 
              ? 'Release to refresh' 
              : 'Pull to refresh'
          }
        </p>
        
        {/* Progress indicator */}
        <div className="w-8 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};