import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Flame, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  BarChart3,
  Activity,
  Zap,
  Gift,
  Share2,
  UserPlus,
  Eye,
  Clock,
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface LeaderboardPlayer {
  id: string;
  name: string;
  rank: number;
  previousRank?: number;
  totalEarnings: number;
  currentStreak: number;
  winRate: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  highestWin: number;
  longestStreak: number;
  memberSince: Date;
  isVerified: boolean;
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  achievements: string[];
  weeklyEarnings: number;
  monthlyEarnings: number;
  favoriteCategories: string[];
  recentActivity: any[];
  profilePicture?: string;
  isFollowing?: boolean;
  distanceToNextRank: number;
  nextRankEarnings: number;
}

interface LeaderboardProps {
  currentUser: User;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'earnings' | 'weekly' | 'monthly' | 'winRate' | 'streak'>('earnings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardPlayer | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatingRanks, setAnimatingRanks] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'from-cyan-400 to-blue-600';
      case 'Platinum': return 'from-gray-300 to-gray-600';
      case 'Gold': return 'from-yellow-400 to-orange-500';
      case 'Silver': return 'from-gray-200 to-gray-400';
      case 'Bronze': return 'from-orange-300 to-orange-600';
      default: return 'from-gray-300 to-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Diamond': return <Sparkles className="w-4 h-4" />;
      case 'Platinum': return <Crown className="w-4 h-4" />;
      case 'Gold': return <Trophy className="w-4 h-4" />;
      case 'Silver': return <Medal className="w-4 h-4" />;
      case 'Bronze': return <Award className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 animate-pulse" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return null;
  };

  const getRankChange = (player: LeaderboardPlayer) => {
    if (!player.previousRank) return null;
    const change = player.previousRank - player.rank;
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <ArrowUp className="w-3 h-3" />
          <span className="text-xs font-medium">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <ArrowDown className="w-3 h-3" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
        <span className="text-xs">—</span>
      </div>
    );
  };

  const calculateTier = (earnings: number): LeaderboardPlayer['tier'] => {
    if (earnings >= 1000000) return 'Diamond';
    if (earnings >= 500000) return 'Platinum';
    if (earnings >= 100000) return 'Gold';
    if (earnings >= 25000) return 'Silver';
    return 'Bronze';
  };

  const generateMockPlayers = (): LeaderboardPlayer[] => {
    const mockPlayers: LeaderboardPlayer[] = [];
    const names = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
      'Anita Reddy', 'Rohit Mehta', 'Kavya Nair', 'Arjun Yadav', 'Deepika Joshi',
      'Sanjay Agarwal', 'Meera Iyer', 'Karan Malhotra', 'Ritu Bansal', 'Nikhil Jain'
    ];
    
    const categories = ['Weather', 'Cryptocurrency', 'Sports', 'Technology', 'Finance', 'Politics'];
    const achievements = ['First Win', 'Hot Streak', 'Big Winner', 'Consistent Player', 'Risk Taker', 'Safe Player'];

    for (let i = 0; i < 100; i++) {
      const baseEarnings = Math.max(0, 2000000 - (i * 15000) + (Math.random() * 50000));
      const totalBets = Math.floor(50 + Math.random() * 500);
      const totalWins = Math.floor(totalBets * (0.3 + Math.random() * 0.4));
      const totalLosses = totalBets - totalWins;
      const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
      const currentStreak = Math.floor(Math.random() * 15);
      const longestStreak = Math.max(currentStreak, Math.floor(Math.random() * 25));
      
      mockPlayers.push({
        id: `player-${i + 1}`,
        name: names[Math.floor(Math.random() * names.length)] + ` ${i + 1}`,
        rank: i + 1,
        previousRank: i > 0 ? i + 1 + Math.floor((Math.random() - 0.5) * 6) : undefined,
        totalEarnings: baseEarnings,
        currentStreak,
        winRate,
        totalBets,
        totalWins,
        totalLosses,
        highestWin: Math.floor(baseEarnings * 0.1 + Math.random() * baseEarnings * 0.2),
        longestStreak,
        memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        isVerified: Math.random() > 0.7,
        tier: calculateTier(baseEarnings),
        achievements: achievements.slice(0, Math.floor(Math.random() * 4) + 1),
        weeklyEarnings: Math.floor(baseEarnings * 0.05 + Math.random() * baseEarnings * 0.1),
        monthlyEarnings: Math.floor(baseEarnings * 0.2 + Math.random() * baseEarnings * 0.3),
        favoriteCategories: categories.slice(0, Math.floor(Math.random() * 3) + 1),
        recentActivity: [],
        isFollowing: Math.random() > 0.8,
        distanceToNextRank: i < 99 ? Math.floor(Math.random() * 50000) : 0,
        nextRankEarnings: i > 0 ? mockPlayers[i - 1]?.totalEarnings || baseEarnings + 50000 : baseEarnings + 50000
      });
    }

    return mockPlayers;
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from the database
        const mockData = generateMockPlayers();
        setPlayers(mockData);
        
        // Simulate rank changes animation
        setTimeout(() => {
          const changingRanks = new Set(mockData.slice(0, 10).map(p => p.id));
          setAnimatingRanks(changingRanks);
          setTimeout(() => setAnimatingRanks(new Set()), 2000);
        }, 1000);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortBy) {
      case 'weekly': return b.weeklyEarnings - a.weeklyEarnings;
      case 'monthly': return b.monthlyEarnings - a.monthlyEarnings;
      case 'winRate': return b.winRate - a.winRate;
      case 'streak': return b.currentStreak - a.currentStreak;
      default: return b.totalEarnings - a.totalEarnings;
    }
  });

  const filteredPlayers = sortedPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayerClick = (player: LeaderboardPlayer) => {
    setSelectedPlayer(player);
    if (player.rank <= 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const PlayerCard: React.FC<{ player: LeaderboardPlayer; index: number }> = ({ player, index }) => {
    const isTop3 = player.rank <= 3;
    const isAnimating = animatingRanks.has(player.id);
    
    return (
      <div
        className={`relative group cursor-pointer transition-all duration-500 ${
          isAnimating ? 'animate-pulse scale-105' : 'hover:scale-102'
        } ${isTop3 ? 'transform hover:scale-105' : ''}`}
        onClick={() => handlePlayerClick(player)}
      >
        <div className={`
          relative overflow-hidden rounded-2xl border-2 transition-all duration-300
          ${isTop3 
            ? `bg-gradient-to-br ${getTierColor(player.tier)} p-[2px] shadow-2xl` 
            : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl'
          }
        `}>
          {isTop3 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse opacity-30"></div>
          )}
          
          <div className={`
            relative p-6 rounded-2xl transition-all duration-300
            ${isTop3 
              ? 'bg-white dark:bg-slate-900' 
              : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group-hover:bg-white/90 dark:group-hover:bg-slate-800/90'
            }
          `}>
            {/* Rank and Change */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                  ${isTop3 
                    ? `bg-gradient-to-br ${getTierColor(player.tier)} text-white shadow-lg` 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }
                `}>
                  {getRankIcon(player.rank) || player.rank}
                  {isTop3 && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
                {getRankChange(player)}
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`
                  px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1
                  bg-gradient-to-r ${getTierColor(player.tier)} text-white
                `}>
                  {getTierIcon(player.tier)}
                  {player.tier}
                </div>
                {player.isVerified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </div>
                {player.currentStreak > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Flame className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {player.name}
                  {player.isFollowing && (
                    <UserPlus className="w-4 h-4 text-blue-500" />
                  )}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member since {player.memberSince.getFullYear()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {player.winRate.toFixed(1)}% win rate
                  </span>
                </div>
              </div>
            </div>

            {/* Earnings Display */}
            <div className="mb-4">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                {formatCurrency(player.totalEarnings)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Earnings
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {player.currentStreak}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Streak</div>
              </div>
              <div className="text-center p-2 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {player.totalWins}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Wins</div>
              </div>
              <div className="text-center p-2 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(player.highestWin)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Best Win</div>
              </div>
            </div>

            {/* Progress to Next Rank */}
            {player.rank > 1 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Distance to Rank {player.rank - 1}</span>
                  <span>{formatCurrency(player.distanceToNextRank)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.max(10, Math.min(90, ((player.nextRankEarnings - player.distanceToNextRank) / player.nextRankEarnings) * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Achievements */}
            {player.achievements.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {player.achievements.slice(0, 3).map((achievement, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {achievement}
                  </span>
                ))}
                {player.achievements.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                    +{player.achievements.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {i % 4 === 0 ? '🎉' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '🎊' : '⭐'}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                Global Leaderboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Top 100 Prediction Masters
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-2">🏆 Hall of Champions</h2>
            <p className="text-blue-100">
              Compete with the best prediction masters and climb your way to the top!
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300/60 dark:border-slate-600/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-slate-300/60 dark:border-slate-600/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white"
              >
                <option value="earnings">All-time Earnings</option>
                <option value="weekly">Weekly Performance</option>
                <option value="monthly">Monthly Performance</option>
                <option value="winRate">Highest Win Rate</option>
                <option value="streak">Current Streak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player, index) => (
            <PlayerCard key={player.id} player={player} index={index} />
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No players found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      {selectedPlayer.name}
                      {selectedPlayer.isVerified && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </h2>
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        Rank #{selectedPlayer.rank}
                      </span>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1
                        bg-gradient-to-r ${getTierColor(selectedPlayer.tier)} text-white
                      `}>
                        {getTierIcon(selectedPlayer.tier)}
                        {selectedPlayer.tier}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    {selectedPlayer.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button 
                    onClick={() => setSelectedPlayer(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{formatCurrency(selectedPlayer.totalEarnings)}</div>
                  <div className="text-green-100">Total Earnings</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{selectedPlayer.winRate.toFixed(1)}%</div>
                  <div className="text-blue-100">Win Rate</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{selectedPlayer.currentStreak}</div>
                  <div className="text-orange-100">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{formatCurrency(selectedPlayer.highestWin)}</div>
                  <div className="text-purple-100">Highest Win</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Performance Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Total Bets</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedPlayer.totalBets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Wins / Losses</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedPlayer.totalWins} / {selectedPlayer.totalLosses}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Longest Streak</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedPlayer.longestStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Weekly Earnings</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedPlayer.weeklyEarnings)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Monthly Earnings</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedPlayer.monthlyEarnings)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Achievements & Categories</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Achievements</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlayer.achievements.map((achievement, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Favorite Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlayer.favoriteCategories.map((category, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Member Since</h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {selectedPlayer.memberSince.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};