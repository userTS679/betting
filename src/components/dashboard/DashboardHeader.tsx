import React from 'react';
import { 
  TrendingUp, 
  Trophy, 
  Wallet, 
  Target, 
  ArrowUp, 
  Flame,
  Star,
  Zap
} from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  userBets: any[];
  formatCurrency: (amount: number) => string;
  onPlaceBet: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  userBets,
  formatCurrency,
  onPlaceBet
}) => {
  const wonBets = userBets.filter(bet => bet.status === 'won');
  const highestWin = Math.max(...wonBets.map(bet => bet.payout || 0), 0);
  const totalEarnings = user.totalWinnings;
  const totalWins = wonBets.length;

  // Calculate growth indicators (simulated for demo)
  const earningsGrowth = totalEarnings > 0 ? 15.2 : 0;
  const winsGrowth = totalWins > 0 ? 8.5 : 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden mb-8">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-yellow-300 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-pink-300 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10">
        {/* Welcome Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user.name.split(' ')[0]}! 🎯
            </h1>
            <p className="text-blue-100 flex items-center gap-2">
              {totalWins > 0 ? (
                <>
                  <Flame className="w-4 h-4 text-orange-300" />
                  You're on a winning streak with {totalWins} wins!
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 text-yellow-300" />
                  Ready to start your winning journey?
                </>
              )}
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Earnings */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-300" />
              </div>
              {earningsGrowth > 0 && (
                <div className="flex items-center gap-1 text-green-300 text-sm">
                  <ArrowUp className="w-3 h-3" />
                  +{earningsGrowth}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-green-300 mb-1">
              {formatCurrency(totalEarnings)}
            </div>
            <div className="text-sm text-blue-100">Total Earnings</div>
            {earningsGrowth > 0 && (
              <div className="text-xs text-green-200 mt-1">↗ Growing strong!</div>
            )}
          </div>

          {/* Total Wins */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-300" />
              </div>
              {winsGrowth > 0 && (
                <div className="flex items-center gap-1 text-yellow-300 text-sm">
                  <ArrowUp className="w-3 h-3" />
                  +{winsGrowth}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-yellow-300 mb-1">
              {totalWins}
            </div>
            <div className="text-sm text-blue-100">Total Wins</div>
            {winsGrowth > 0 && (
              <div className="text-xs text-yellow-200 mt-1">🏆 Trending up!</div>
            )}
          </div>

          {/* Available Balance */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-300" />
              </div>
              <button
                onClick={onPlaceBet}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-3 py-1 rounded-lg text-xs font-semibold transition-all transform hover:scale-105"
              >
                Place Bet
              </button>
            </div>
            <div className="text-2xl font-bold text-blue-300 mb-1">
              {formatCurrency(user.balance)}
            </div>
            <div className="text-sm text-blue-100">Available Balance</div>
          </div>

          {/* Highest Win */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-300" />
              </div>
              {highestWin >= 5000 && (
                <div className="text-xs bg-purple-500/30 px-2 py-1 rounded-full text-purple-200">
                  💎 Epic
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-purple-300 mb-1">
              {highestWin > 0 ? formatCurrency(highestWin) : '₹0'}
            </div>
            <div className="text-sm text-blue-100">Highest Single Win</div>
            {highestWin > 0 && (
              <div className="text-xs text-purple-200 mt-1">🎯 Personal best!</div>
            )}
          </div>
        </div>

        {/* Motivational Banner */}
        {totalWins > 0 && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/30 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-300" />
              </div>
              <div>
                <h3 className="font-bold text-orange-200 text-lg">
                  {totalWins >= 10 ? 'Master Predictor! 🏆' : 
                   totalWins >= 5 ? 'You\'re on fire! 🔥' :
                   'Great momentum! 🚀'}
                </h3>
                <p className="text-orange-100 text-sm">
                  {totalWins >= 10 ? 'You\'re dominating the predictions! Keep the streak alive!' : 
                   totalWins >= 5 ? 'Your prediction skills are impressive. Time for bigger wins!' :
                   'You\'re building a solid foundation. Next win is just around the corner!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};