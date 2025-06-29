import React from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Wallet,
  Target,
  Award,
  BarChart3
} from 'lucide-react';

interface ResponsiveDashboardProps {
  user: any;
  events: any[];
  userBets: any[];
  formatCurrency: (amount: number) => string;
}

export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  user,
  events,
  userBets,
  formatCurrency
}) => {
  const activeBets = userBets.filter(bet => bet.status === 'active');
  const wonBets = userBets.filter(bet => bet.status === 'won');
  const totalActiveBetAmount = activeBets.reduce((sum, bet) => sum + bet.amount, 0);
  const winRate = user.totalBets > 0 ? (wonBets.length / user.totalBets) * 100 : 0;
  const totalPool = events.reduce((sum, event) => sum + event.totalPool, 0);

  // Mobile-first stat card component
  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = 'blue',
    size = 'default'
  }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    size?: 'default' | 'large';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${
        size === 'large' ? 'col-span-2' : ''
      }`}>
        <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} p-3 sm:p-4`}>
          <div className="flex items-center gap-2 sm:gap-3 text-white">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-semibold">{title}</h3>
              {subtitle && (
                <p className="text-xs opacity-80">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className={`${size === 'large' ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl'} font-bold text-slate-900 dark:text-white`}>
            {value}
          </div>
        </div>
      </div>
    );
  };

  // Quick action button component
  const QuickActionButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    color = 'blue' 
  }: {
    icon: any;
    label: string;
    onClick: () => void;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
      purple: 'from-purple-600 to-purple-700'
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg min-h-[44px] touch-manipulation`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              {user.isAdmin ? 'Admin Dashboard' : 'Your Betting Dashboard'}
            </p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(user.balance)}</p>
            </div>
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={Activity}
          title="Total Bets"
          value={user.totalBets}
          subtitle="Lifetime bets placed"
          color="blue"
        />
        
        <StatCard
          icon={TrendingUp}
          title="Total Winnings"
          value={formatCurrency(user.totalWinnings)}
          subtitle="All-time earnings"
          color="green"
        />
        
        <StatCard
          icon={Target}
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          subtitle="Success percentage"
          color="purple"
        />
        
        <StatCard
          icon={Users}
          title="Active Events"
          value={events.filter(e => e.status === 'active').length}
          subtitle="Available to bet"
          color="orange"
        />
        
        <StatCard
          icon={DollarSign}
          title="Total Pool"
          value={formatCurrency(totalPool)}
          subtitle="Platform-wide"
          color="indigo"
          size="large"
        />
      </div>

      {/* Active Bets Section */}
      {activeBets.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Active Bets ({activeBets.length})
            </h2>
          </div>
          
          <div className="space-y-2 sm:space-y-3 mb-4">
            {activeBets.slice(0, 3).map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    Event #{bet.eventId.slice(-4)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Placed {bet.placedAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400">
                    {formatCurrency(bet.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 dark:text-blue-300 font-medium text-sm sm:text-base">
                Total Active Amount:
              </span>
              <span className="text-blue-900 dark:text-blue-100 font-bold text-sm sm:text-base">
                {formatCurrency(totalActiveBetAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <QuickActionButton
            icon={Wallet}
            label="Add Money"
            onClick={() => {}}
            color="green"
          />
          
          <QuickActionButton
            icon={TrendingUp}
            label="View Rankings"
            onClick={() => {}}
            color="blue"
          />
          
          <QuickActionButton
            icon={Award}
            label="Achievements"
            onClick={() => {}}
            color="purple"
          />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">
          Performance Summary
        </h2>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Win Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-20 sm:w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${Math.min(winRate, 100)}%` }}
                />
              </div>
              <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                {winRate.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Current Streak</span>
            <span className="font-semibold text-sm sm:text-base text-orange-600 dark:text-orange-400">
              {user.currentStreak || 0} wins
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Total Profit</span>
            <span className={`font-semibold text-sm sm:text-base ${
              (user.netPL || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {(user.netPL || 0) >= 0 ? '+' : ''}{formatCurrency(user.netPL || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};