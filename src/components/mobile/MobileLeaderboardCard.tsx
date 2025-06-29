import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Flame,
  Award
} from 'lucide-react';

interface MobileLeaderboardCardProps {
  player: any;
  rank: number;
  currentUserId: string;
  formatCurrency: (amount: number) => string;
  compact?: boolean;
}

export const MobileLeaderboardCard: React.FC<MobileLeaderboardCardProps> = ({
  player,
  rank,
  currentUserId,
  formatCurrency,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCurrentUser = player.id === currentUserId;

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Medal className="w-5 h-5 text-orange-500" />;
    return null;
  };

  const getTierGradient = (tier: string) => {
    const gradients = {
      Master: 'from-red-500 to-pink-600',
      Diamond: 'from-cyan-400 to-blue-500',
      Platinum: 'from-gray-300 to-gray-500',
      Gold: 'from-yellow-400 to-orange-500',
      Silver: 'from-gray-200 to-gray-400',
      Bronze: 'from-orange-300 to-orange-600'
    };
    return gradients[tier as keyof typeof gradients] || 'from-gray-300 to-gray-500';
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Master': return '👑';
      case 'Diamond': return '💎';
      case 'Platinum': return '🏆';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '⭐';
    }
  };

  if (compact) {
    return (
      <div 
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 touch-manipulation ${
          isCurrentUser 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-md' 
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Rank */}
        <div className="flex items-center justify-center w-10 h-10">
          {getRankIcon(rank) || (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              rank <= 10 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {rank}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {player.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          {player.current_streak > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <Flame className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {player.name}
            </h4>
            {player.is_verified && (
              <Star className="w-3 h-3 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierGradient(player.tier)} text-white font-medium`}>
              {getTierIcon(player.tier)} {player.tier}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {player.current_streak} streak
            </span>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            {player.total_points.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
        </div>

        {/* Expand indicator */}
        <div className="ml-2">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>
    );
  }

  // Full card view
  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
      isCurrentUser 
        ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-600 shadow-lg' 
        : rank <= 3
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-600 shadow-lg'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg'
    }`}>
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${getTierGradient(player.tier)} text-white`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12">
            {getRankIcon(rank) || (
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                {rank}
              </div>
            )}
          </div>
          
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm relative">
            {player.name.split(' ').map((n: string) => n[0]).join('')}
            {player.is_verified && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold">{player.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-90">{getTierIcon(player.tier)} {player.tier}</span>
              {player.current_streak > 0 && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  🔥 {player.current_streak} streak
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {player.total_points.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Points</div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(player.total_winnings)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Winnings</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {player.current_streak}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Streak</div>
          </div>
          
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {player.total_bets}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Bets</div>
          </div>
          
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(player.weekly_earnings || 0)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">This Week</div>
          </div>
        </div>

        {/* Achievements */}
        {player.achievements && player.achievements.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {player.achievements.slice(0, 3).map((achievement: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full font-medium"
                >
                  🏆 {achievement}
                </span>
              ))}
              {player.achievements.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                  +{player.achievements.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};