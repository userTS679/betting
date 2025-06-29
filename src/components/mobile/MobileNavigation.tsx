import React from 'react';
import { 
  Home, 
  TrendingUp, 
  User, 
  Shield,
  Trophy,
  BarChart3
} from 'lucide-react';

interface MobileNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onViewChange,
  isAdmin
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Home },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  // Limit to 5 items for better mobile UX
  const displayItems = navItems.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 z-50 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-2">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 min-h-[44px] touch-manipulation relative ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs font-medium truncate max-w-full ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};