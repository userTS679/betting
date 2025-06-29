import React from 'react';
import { 
  User, 
  TrendingUp, 
  Activity, 
  Wallet, 
  Trophy, 
  Flame,
  Target,
  Award,
  Star
} from 'lucide-react';

interface MobileProfileProps {
  user: any;
  userBets: any[];
  formatCurrency: (amount: number) => string;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({
  user,
  userBets,
  formatCurrency
}) => {
  const activeBets = userBets.filter(bet => bet.status === 'active');
  const wonBets = userBets.filter(bet => bet.status === 'won');
  const totalActiveBetAmount = activeBets.reduce((sum, bet) => sum + bet.amount, 0);
  const winRate = user.totalBets > 0 ? (wonBets.length / user.totalBets) * 100 : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-blue-100 text-sm">
              {user.isAdmin ? 'Event Creator' : 'Bettor'}
            </p>
            {user.tier && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-300" />
                <span className="text-xs text-yellow-200">{user.tier} Tier</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{formatCurrency(user.balance)}</div>
            <div className="text-xs text-blue-100">Available Balance</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{user.totalBets}</div>
            <div className="text-xs text-blue-100">Total Bets</div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(user.totalWinnings)}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">Total Winnings</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Win Rate</div>
          </div>
        </div>

        {/* Streak Info */}
        {user.currentStreak > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-orange-700 dark:text-orange-300">
                  {user.currentStreak} Win Streak! 🔥
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  Longest: {user.longestStreak || user.currentStreak}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Bets */}
      {activeBets.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Bets ({activeBets.length})
          </h3>
          
          <div className="space-y-3">
            {activeBets.slice(0, 3).map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                    Event #{bet.eventId.slice(-4)}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {bet.placedAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(bet.amount)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">bet amount</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 dark:text-blue-300 font-medium text-sm">
                Total Active Amount:
              </span>
              <span className="text-blue-900 dark:text-blue-100 font-bold">
                {formatCurrency(totalActiveBetAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {user.achievements && user.achievements.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {user.achievements.map((achievement: string, index: number) => (
              <span 
                key={index}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full font-medium"
              >
                🏆 {achievement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-300 font-medium text-sm">
            <Wallet className="w-4 h-4" />
            Add Money
          </button>
          <button className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 font-medium text-sm">
            <Trophy className="w-4 h-4" />
            View Rankings
          </button>
        </div>
      </div>
    </div>
  );
};