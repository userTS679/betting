import React from 'react';
import { Clock, Users, Trophy, TrendingUp, Zap } from 'lucide-react';

interface OptimizedEventCardProps {
  event: any;
  userBet?: any;
  onBet: (event: any) => void;
  isAdmin?: boolean;
}

export const OptimizedEventCard: React.FC<OptimizedEventCardProps> = ({
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

  const getCategoryGradient = (category: string) => {
    const gradients = {
      Weather: 'from-blue-500 to-cyan-500',
      Cryptocurrency: 'from-orange-500 to-yellow-500',
      Sports: 'from-green-500 to-emerald-500',
      Technology: 'from-purple-500 to-indigo-500',
      Finance: 'from-indigo-500 to-blue-500',
      Politics: 'from-red-500 to-pink-500',
      Entertainment: 'from-pink-500 to-purple-500'
    };
    return gradients[category as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl max-w-full">
      {/* Header with Category and Timer */}
      <div className={`bg-gradient-to-r ${getCategoryGradient(event.category)} p-3 sm:p-4 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
            {event.category}
          </span>
          <div className="flex items-center gap-1 text-xs font-medium">
            <Clock className="w-3 h-3" />
            {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
          </div>
        </div>
        
        <h3 className="text-base sm:text-lg font-bold leading-tight line-clamp-2">
          {event.title}
        </h3>
      </div>

      {/* Pool Information */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-3 rounded-lg mb-4 mx-3 mt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(event.totalPool)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Total Pool</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{event.participantCount}</span>
            </div>
            <p className="text-xs text-slate-500">participants</p>
          </div>
        </div>
      </div>

      {/* Betting Options - Mobile Optimized */}
      <div className="space-y-2 mb-4 px-3">
        {event.options.slice(0, 2).map((option: any) => {
          const isUserOption = userBet?.optionId === option.id;
          const isWinningOption = event.winningOption === option.id;
          
          return (
            <div 
              key={option.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                isWinningOption 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                isUserOption 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                  'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
                    {option.label}
                  </span>
                  {isWinningOption && <Trophy className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  {isUserOption && !isWinningOption && <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {option.bettors} bets • {formatCurrency(option.totalBets)}
                </div>
              </div>
              
              <div className="text-right ml-2">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {option.odds.toFixed(2)}x
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">odds</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Bet Status */}
      {userBet && (
        <div className="mb-4 px-3">
          <div className={`p-3 rounded-lg border ${
            userBet.status === 'won' 
              ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
            userBet.status === 'lost'
              ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Bet: {formatCurrency(userBet.amount)}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                userBet.status === 'won' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
                userBet.status === 'lost' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' :
                'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
              }`}>
                {userBet.status.toUpperCase()}
              </span>
            </div>
            {userBet.payout && userBet.status === 'won' && (
              <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                Won: {formatCurrency(userBet.payout)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button - Touch Optimized */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onBet(event)}
          disabled={event.status !== 'active' || timeLeft <= 0}
          className="w-full min-h-[44px] py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed shadow-lg touch-manipulation"
        >
          {event.status !== 'active' ? 'Event Closed' : 
           timeLeft <= 0 ? 'Expired' : 
           userBet ? 'Update Bet' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
};