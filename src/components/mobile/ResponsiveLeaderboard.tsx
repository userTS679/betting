import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  Loader
} from 'lucide-react';
import { getLeaderboard, getUserRank, LeaderboardUser } from '../../services/leaderboard';

interface ResponsiveLeaderboardProps {
  currentUser: any;
  formatCurrency: (amount: number) => string;
}

export const ResponsiveLeaderboard: React.FC<ResponsiveLeaderboardProps> = ({
  currentUser,
  formatCurrency
}) => {
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; percentile: number } | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [leaderboardData, rankData] = await Promise.all([
          getLeaderboard(100, 0, 'total_points'),
          getUserRank(currentUser.id)
        ]);
        
        setPlayers(leaderboardData);
        setUserRank(rankData);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setError('Failed to load leaderboard. Please try again.');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [currentUser.id]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
    return null;
  };

  const getTierColor = (tier: string) => {
    const colors = {
      Master: 'from-red-500 to-pink-600',
      Diamond: 'from-cyan-400 to-blue-500',
      Platinum: 'from-gray-300 to-gray-500',
      Gold: 'from-yellow-400 to-orange-500',
      Silver: 'from-gray-200 to-gray-400',
      Bronze: 'from-orange-300 to-orange-600'
    };
    return colors[tier as keyof typeof colors] || 'from-gray-300 to-gray-500';
  };

  // Mobile-optimized header
  const LeaderboardHeader = () => (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 sm:p-6 text-white rounded-t-xl sm:rounded-t-2xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Leaderboard</h2>
            <p className="text-xs sm:text-sm opacity-90">Top Prediction Masters</p>
          </div>
        </div>
        
        <button
          onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors"
        >
          {viewMode === 'compact' ? 'Detailed' : 'Compact'}
        </button>
      </div>
      
      {/* User's rank display */}
      {userRank && (
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Rank:</span>
            <span className="text-lg font-bold">#{userRank.rank}</span>
          </div>
          <div className="text-xs opacity-80 mt-1">
            Top {userRank.percentile}% of {userRank.totalUsers} players
          </div>
        </div>
      )}
    </div>
  );

  // Compact player card for mobile
  const CompactPlayerCard = ({ player, index }: { player: LeaderboardUser; index: number }) => (
    <div 
      className={`flex items-center gap-3 p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer touch-manipulation ${
        player.id === currentUser.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
        {getRankIcon(player.rank_position) || (
          <span className="font-bold text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {player.rank_position}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
          {player.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        {player.is_verified && (
          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {player.name}
          </h4>
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(player.tier)} text-white`}>
            {player.tier}
          </div>
        </div>
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {player.total_points.toLocaleString()} pts • {player.current_streak} streak
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          {formatCurrency(player.total_winnings)}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500">winnings</div>
      </div>

      {/* Expand indicator */}
      <div className="ml-2">
        {expandedPlayer === player.id ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden max-w-full">
        <LeaderboardHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden max-w-full">
        <LeaderboardHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden max-w-full">
      <LeaderboardHeader />
      
      <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
        <div>
          {players.slice(0, 50).map((player, index) => (
            <div key={player.id}>
              <CompactPlayerCard player={player} index={index} />
              {expandedPlayer === player.id && (
                <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-700/50">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(player.weekly_earnings || 0)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {player.longest_streak}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Best Streak</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {players.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No players found</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Be the first to join the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
};