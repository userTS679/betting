import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Target,
  Zap,
  Timer,
  DollarSign
} from 'lucide-react';

interface ActiveBetsSectionProps {
  userBets: any[];
  events: any[];
  formatCurrency: (amount: number) => string;
}

export const ActiveBetsSection: React.FC<ActiveBetsSectionProps> = ({
  userBets,
  events,
  formatCurrency
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every second for live countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeBets = userBets.filter(bet => bet.status === 'active');
  const totalActiveBetAmount = activeBets.reduce((sum, bet) => sum + bet.amount, 0);

  // Calculate potential returns for each bet
  const betsWithReturns = activeBets.map(bet => {
    const event = events.find(e => e.id === bet.eventId);
    const option = event?.options.find(opt => opt.id === bet.optionId);
    const potentialReturn = option ? bet.amount * option.odds : bet.amount;
    const potentialProfit = potentialReturn - bet.amount;
    
    return {
      ...bet,
      event,
      option,
      potentialReturn,
      potentialProfit,
      timeLeft: event ? Math.max(0, event.expiresAt.getTime() - currentTime) : 0
    };
  });

  const totalPotentialReturns = betsWithReturns.reduce((sum, bet) => sum + bet.potentialReturn, 0);
  const totalPotentialProfit = betsWithReturns.reduce((sum, bet) => sum + bet.potentialProfit, 0);

  const formatTimeLeft = (timeLeft: number) => {
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getUrgencyColor = (timeLeft: number) => {
    if (timeLeft <= 5 * 60 * 1000) return 'text-red-500'; // 5 minutes
    if (timeLeft <= 30 * 60 * 1000) return 'text-orange-500'; // 30 minutes
    if (timeLeft <= 60 * 60 * 1000) return 'text-yellow-500'; // 1 hour
    return 'text-green-500';
  };

  if (activeBets.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Bets</h2>
            <p className="text-slate-600 dark:text-slate-400">Your current betting positions</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="text-slate-400 dark:text-slate-500 text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Active Bets</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Place your first bet to start tracking your potential winnings here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Active Bets ({activeBets.length})
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Track your live betting positions</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-slate-600 dark:text-slate-400">Potential Returns</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalPotentialReturns)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Total Staked</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalActiveBetAmount)}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Potential Profit</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalPotentialProfit)}</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">Potential ROI</span>
          </div>
          <div className="text-2xl font-bold">
            {totalActiveBetAmount > 0 ? `${((totalPotentialProfit / totalActiveBetAmount) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Active Bets List */}
      <div className="space-y-4">
        {betsWithReturns.map((bet) => (
          <div 
            key={bet.id} 
            className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-900/20 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {bet.event?.title || 'Event'}
                </h4>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>Bet: {bet.option?.label}</span>
                  <span>Odds: {bet.option?.odds.toFixed(2)}x</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className={`w-4 h-4 ${getUrgencyColor(bet.timeLeft)}`} />
                  <span className={`font-semibold ${getUrgencyColor(bet.timeLeft)}`}>
                    {formatTimeLeft(bet.timeLeft)}
                  </span>
                </div>
                {bet.timeLeft <= 5 * 60 * 1000 && bet.timeLeft > 0 && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">
                    ⚡ Closing Soon!
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/60 dark:bg-slate-600/60 rounded-lg">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(bet.amount)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Bet Amount</div>
              </div>
              
              <div className="text-center p-3 bg-green-100/60 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(bet.potentialReturn)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Potential Return</div>
              </div>
              
              <div className="text-center p-3 bg-blue-100/60 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  +{formatCurrency(bet.potentialProfit)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Potential Profit</div>
              </div>
            </div>
            
            {/* Progress bar for time remaining */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Time Progress</span>
                <span>{formatTimeLeft(bet.timeLeft)} remaining</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    bet.timeLeft <= 5 * 60 * 1000 ? 'bg-red-500' :
                    bet.timeLeft <= 30 * 60 * 1000 ? 'bg-orange-500' :
                    bet.timeLeft <= 60 * 60 * 1000 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ 
                    width: bet.event ? `${Math.max(0, Math.min(100, (bet.timeLeft / (24 * 60 * 60 * 1000)) * 100))}%` : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};