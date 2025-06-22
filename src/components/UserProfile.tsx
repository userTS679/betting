import React, { useState, useEffect } from 'react';
import { User, TrendingUp, TrendingDown, Activity, Wallet, Target, Award, BarChart3 } from 'lucide-react';
import { User as UserType, Bet } from '../types';
import { getUserBettingStats } from '../services/betting';

interface UserProfileProps {
  user: UserType & { netPL?: number };
  userBets: Bet[];
}

interface UserStats {
  total_bets: number;
  total_winnings: number;
  balance: number;
  activeBetsCount: number;
  totalActiveBetAmount: number;
  winRate: number;
  averageBetSize: number;
  netProfit: number;
  wonBetsCount: number;
  lostBetsCount: number;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, userBets }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await getUserBettingStats(user.id);
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Fallback to calculating from local data
        const activeBets = userBets.filter(bet => bet.status === 'active');
        const wonBets = userBets.filter(bet => bet.status === 'won');
        const lostBets = userBets.filter(bet => bet.status === 'lost');
        const resolvedBets = userBets.filter(bet => bet.status === 'won' || bet.status === 'lost');
        
        const totalBetAmount = userBets.reduce((sum, bet) => sum + bet.amount, 0);
        const totalActiveBetAmount = activeBets.reduce((sum, bet) => sum + bet.amount, 0);
        const winRate = resolvedBets.length > 0 ? (wonBets.length / resolvedBets.length) * 100 : 0;
        const averageBetSize = user.totalBets > 0 ? totalBetAmount / user.totalBets : 0;
        
        // Calculate net profit from resolved bets only
        let netProfit = 0;
        resolvedBets.forEach(bet => {
          if (bet.status === 'won' && bet.payout) {
            netProfit += bet.payout - bet.amount; // Only profit, not the original bet
          } else if (bet.status === 'lost') {
            netProfit -= bet.amount;
          }
        });

        setStats({
          total_bets: user.totalBets,
          total_winnings: user.totalWinnings,
          balance: user.balance,
          activeBetsCount: activeBets.length,
          totalActiveBetAmount,
          winRate: Math.round(winRate * 100) / 100,
          averageBetSize: Math.round(averageBetSize * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          wonBetsCount: wonBets.length,
          lostBetsCount: lostBets.length
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, userBets]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          Failed to load user statistics
        </div>
      </div>
    );
  }

  const activeBets = userBets.filter(bet => bet.status === 'active');
  const netPL = user.netPL !== undefined ? user.netPL : stats.netProfit;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">
            {user.isAdmin ? 'Event Creator' : 'Bettor'}
          </p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Balance</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(stats.balance)}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Bets</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {stats.total_bets}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Total Winnings</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(stats.total_winnings)}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${netPL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {netPL >= 0 ? (
              <Award className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${netPL >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Net P&L
            </span>
          </div>
          <div className={`text-2xl font-bold ${netPL >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {netPL >= 0 ? '+' : ''}{formatCurrency(netPL)}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      {/* <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Betting Performances
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Win Rate:</span>
            <span className="font-semibold text-green-600">{stats.winRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Bet Size:</span>
            <span className="font-semibold">{formatCurrency(stats.averageBetSize)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bets Won:</span>
            <span className="font-semibold text-green-600">{stats.wonBetsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bets Lost:</span>
            <span className="font-semibold text-red-600">{stats.lostBetsCount}</span>
          </div>
        </div>
      </div> */}

      {/* Active Bets */}
      {stats.activeBetsCount > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Bets ({stats.activeBetsCount})
          </h3>
          <div className="space-y-2">
            {activeBets.slice(0, 3).map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Event #{bet.eventId.slice(-4)}</div>
                  <div className="text-sm text-gray-600">
                    Placed on {bet.placedAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(bet.amount)}</div>
                  <div className="text-sm text-gray-600">bet amount</div>
                </div>
              </div>
            ))}
            {stats.activeBetsCount > 3 && (
              <div className="text-center text-sm text-gray-600">
                +{stats.activeBetsCount - 3} more active bets
              </div>
            )}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 font-medium">Total Active Amount:</span>
              <span className="text-blue-900 font-bold">{formatCurrency(stats.totalActiveBetAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {stats.activeBetsCount === 0 && stats.total_bets === 0 && (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-2">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Start Betting?</h3>
          <p className="text-gray-600 text-sm">
            Place your first bet on any of the available events to get started!
          </p>
        </div>
      )}
    </div>
  );
};