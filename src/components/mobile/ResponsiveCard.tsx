import React from 'react';
import { Clock, Users, Trophy, TrendingUp } from 'lucide-react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  interactive?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  variant = 'default',
  interactive = false
}) => {
  const baseClasses = `
    bg-white dark:bg-slate-800 
    rounded-xl sm:rounded-2xl 
    shadow-sm hover:shadow-md 
    border border-slate-200 dark:border-slate-700 
    transition-all duration-200
    ${interactive ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
  `;

  const variantClasses = {
    default: 'p-4 sm:p-6',
    compact: 'p-3 sm:p-4',
    minimal: 'p-2 sm:p-3'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Event Card Component
interface ResponsiveEventCardProps {
  event: any;
  userBet?: any;
  onBet: (event: any) => void;
  isAdmin?: boolean;
}

export const ResponsiveEventCard: React.FC<ResponsiveEventCardProps> = ({
  event,
  userBet,
  onBet,
  isAdmin = false
}) => {
  const timeLeft = Math.max(0, event.expiresAt.getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Weather: 'from-blue-500 to-cyan-500',
      Cryptocurrency: 'from-orange-500 to-yellow-500',
      Sports: 'from-green-500 to-emerald-500',
      Technology: 'from-purple-500 to-indigo-500',
      Finance: 'from-indigo-500 to-blue-500',
      Politics: 'from-red-500 to-pink-500',
      Entertainment: 'from-pink-500 to-purple-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <ResponsiveCard 
      interactive 
      className="max-w-full sm:max-w-md lg:max-w-lg overflow-hidden"
    >
      {/* Mobile-First Header */}
      <div className={`bg-gradient-to-r ${getCategoryColor(event.category)} p-3 sm:p-4 text-white -m-3 sm:-m-4 mb-3 sm:mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">
            {event.category}
          </span>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">
              {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
            </span>
          </div>
        </div>
        
        <h3 className="text-base sm:text-lg lg:text-xl font-bold leading-tight line-clamp-2">
          {event.title}
        </h3>
      </div>

      {/* Responsive Pool Display */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(event.totalPool)}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Pool</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base font-medium">{event.participantCount}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">participants</p>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Betting Options */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        {event.options.slice(0, 2).map((option: any) => {
          const isUserOption = userBet?.optionId === option.id;
          const isWinningOption = event.winningOption === option.id;
          
          return (
            <div 
              key={option.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border-2 transition-all touch-manipulation ${
                isWinningOption 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                isUserOption 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                  'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {option.label}
                  </span>
                  {isWinningOption && <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {option.bettors} bets • {formatCurrency(option.totalBets)}
                </div>
              </div>
              
              <div className="text-right ml-2 flex-shrink-0">
                <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {option.odds.toFixed(2)}x
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">odds</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Touch-Friendly Action Button */}
      <button
        onClick={() => onBet(event)}
        disabled={event.status !== 'active' || timeLeft <= 0}
        className="w-full min-h-[44px] py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg sm:rounded-xl transition-all disabled:cursor-not-allowed shadow-lg touch-manipulation"
      >
        {event.status !== 'active' ? 'Event Closed' : 
         timeLeft <= 0 ? 'Expired' : 
         userBet ? 'Update Bet' : 'Place Bet'}
      </button>
    </ResponsiveCard>
  );
};