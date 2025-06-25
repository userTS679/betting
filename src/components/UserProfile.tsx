import React, { useState, useEffect } from 'react';
import { User, TrendingUp, TrendingDown, Activity, Wallet, Target, Award, BarChart3, Trophy, Flame, Zap } from 'lucide-react';
import { User as UserType, Bet } from '../types';
import { getUserBettingStats } from '../services/betting';
import { supabase } from '../lib/supabase';

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
  currentStreak: number;
  longestStreak: number;
  streakType: 'win' | 'loss' | 'none';
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, userBets }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventNames, setEventNames] = useState<{ [eventId: string]: string }>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate betting streaks
  const calculateStreaks = (bets: Bet[]) => {
    const resolvedBets = bets
      .filter(bet => bet.status === 'won' || bet.status === 'lost')
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime()); // Most recent first

    if (resolvedBets.length === 0) {
      return { currentStreak: 0, longestStreak: 0, streakType: 'none' as const };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakType: 'win' | 'loss' | 'none' = 'none';
    let tempStreak = 0;
    let tempStreakType: 'win' | 'loss' | 'none' = 'none';

    // Calculate current streak
    for (let i = 0; i < resolvedBets.length; i++) {
      const bet = resolvedBets[i];
      if (i === 0) {
        currentStreak = 1;
        currentStreakType = bet.status === 'won' ? 'win' : 'loss';
        tempStreak = 1;
        tempStreakType = currentStreakType;
      } else {
        const expectedStatus = currentStreakType === 'win' ? 'won' : 'lost';
        if (bet.status === expectedStatus) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 0;
    tempStreakType = 'none';
    
    for (let i = 0; i < resolvedBets.length; i++) {
      const bet = resolvedBets[i];
      const betType = bet.status === 'won' ? 'win' : 'loss';
      
      if (tempStreakType === 'none' || tempStreakType === betType) {
        tempStreak++;
        tempStreakType = betType;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
        tempStreakType = betType;
      }
    }

    return { currentStreak, longestStreak, streakType: currentStreakType };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await getUserBettingStats(user.id);
        
        // Calculate streaks
        const streakData = calculateStreaks(userBets);
        
        setStats({
          ...userStats,
          ...streakData
        });
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

        // Calculate streaks
        const streakData = calculateStreaks(userBets);

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
          lostBetsCount: lostBets.length,
          ...streakData
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, userBets]);

  useEffect(() => {
    // Fetch event names for all unique eventIds in userBets
    const fetchEventNames = async () => {
      const uniqueEventIds = Array.from(new Set(userBets.map(bet => bet.eventId)));
      if (uniqueEventIds.length === 0) return;

      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .in('id', uniqueEventIds);

      if (!error && data) {
        const namesMap: { [eventId: string]: string } = {};
        data.forEach((event: { id: string; title: string }) => {
          namesMap[event.id] = event.title;
        });
        setEventNames(namesMap);
      }
    };

    fetchEventNames();
  }, [userBets]);

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

  // Show both active and resolved bets in the active bets section
  const activeBets = userBets.filter(bet => bet.status === 'active');
  const recentResolvedBets = userBets
    .filter(bet => bet.status === 'won' || bet.status === 'lost')
    .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime())
    .slice(0, 2); // Show 2 most recent resolved bets
  
  const betsToShow = [...activeBets, ...recentResolvedBets].slice(0, 3);
  const netPL = user.netPL !== undefined ? user.netPL : stats.netProfit;

  const getStreakIcon = () => {
    if (stats.currentStreak === 0) return <Activity className="w-5 h-5 text-gray-600" />;
    if (stats.streakType === 'win') return <Flame className="w-5 h-5 text-orange-500" />;
    return <Zap className="w-5 h-5 text-blue-500" />;
  };

  const getStreakColor = () => {
    if (stats.currentStreak === 0) return 'text-gray-600';
    if (stats.streakType === 'win') return 'text-orange-600';
    return 'text-blue-600';
  };

  const getStreakBg = () => {
    if (stats.currentStreak === 0) return 'bg-gray-50';
    if (stats.streakType === 'win') return 'bg-orange-50';
    return 'bg-blue-50';
  };

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

        <div className={`p-4 rounded-lg ${getStreakBg()}`}>
          <div className="flex items-center gap-2 mb-2">
            {getStreakIcon()}
            <span className={`text-sm font-medium ${getStreakColor()}`}>
              {stats.streakType === 'win' ? 'Win Streak' : 
               stats.streakType === 'loss' ? 'Current Streak' : 'No Streak'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${getStreakColor()}`}>
            {stats.currentStreak}
            {stats.streakType === 'win' && stats.currentStreak >= 3 && (
              <span className="text-sm ml-1">🔥</span>
            )}
          </div>
        </div>
      </div>

      {/* Streak Motivation */}
      {stats.currentStreak > 0 && (
        <div className={`p-4 rounded-lg mb-6 ${
          stats.streakType === 'win' ? 'bg-gradient-to-r from-orange-100 to-red-100' : 'bg-blue-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-gray-900">
              {stats.streakType === 'win' ? 'You\'re on fire!' : 'Keep going!'}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {stats.streakType === 'win' 
              ? `${stats.currentStreak} wins in a row! Your longest streak is ${stats.longestStreak}.`
              : `Current streak: ${stats.currentStreak}. Your longest win streak is ${stats.longestStreak}.`
            }
          </p>
          {stats.streakType === 'win' && stats.currentStreak >= 5 && (
            <p className="text-sm text-orange-700 font-medium mt-1">
              🎯 Amazing! You're in the zone!
            </p>
          )}
        </div>
      )}

      {/* Recent Bets (Active + Recent Resolved) */}
      {betsToShow.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Recent Activity ({activeBets.length} active)
          </h3>
          <div className="space-y-2">
            {betsToShow.map((bet) => (
              <div key={bet.id} className={`flex items-center justify-between p-3 rounded-lg ${
                bet.status === 'active' ? 'bg-blue-50' :
                bet.status === 'won' ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {eventNames[bet.eventId] || `Event #${bet.eventId.slice(-4)}`}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>Placed on {bet.placedAt.toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bet.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      bet.status === 'won' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {bet.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(bet.amount)}</div>
                  {bet.status === 'won' && bet.payout && (
                    <div className="text-sm text-green-600 font-medium">
                      Won: {formatCurrency(bet.payout)}
                    </div>
                  )}
                  {bet.status === 'active' && (
                    <div className="text-sm text-gray-600">bet amount</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {activeBets.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">Total Active Amount:</span>
                <span className="text-blue-900 font-bold">{formatCurrency(stats.totalActiveBetAmount)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {betsToShow.length === 0 && stats.total_bets === 0 && (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-2">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Start Betting?</h3>
          <p className="text-gray-600 text-sm">
            Place your first bet on any of the available events to get started!
          </p>
        </div>
      )}

      {betsToShow.length === 0 && stats.total_bets > 0 && (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-2">🎲</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Active Bets</h3>
          <p className="text-gray-600 text-sm">
            {stats.streakType === 'win' 
              ? `You're on a ${stats.currentStreak} win streak! Keep it going!`
              : 'Find your next winning opportunity!'
            }
          </p>
        </div>
      )}
    </div>
  );
};