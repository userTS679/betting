import React, { useState } from 'react';
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  Settings, 
  Bell,
  Search,
  Filter,
  X,
  Menu
} from 'lucide-react';

interface QuickActionsProps {
  onAddMoney: () => void;
  onViewRankings: () => void;
  onOpenSettings: () => void;
  onSearch: () => void;
  onFilter: () => void;
  isAdmin?: boolean;
  onCreateEvent?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddMoney,
  onViewRankings,
  onOpenSettings,
  onSearch,
  onFilter,
  isAdmin = false,
  onCreateEvent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      id: 'add-money',
      icon: Wallet,
      label: 'Add Money',
      onClick: onAddMoney,
      color: 'from-green-600 to-emerald-600',
      priority: 'high'
    },
    {
      id: 'rankings',
      icon: TrendingUp,
      label: 'Rankings',
      onClick: onViewRankings,
      color: 'from-blue-600 to-indigo-600',
      priority: 'high'
    },
    {
      id: 'search',
      icon: Search,
      label: 'Search',
      onClick: onSearch,
      color: 'from-purple-600 to-violet-600',
      priority: 'medium'
    },
    {
      id: 'filter',
      icon: Filter,
      label: 'Filter',
      onClick: onFilter,
      color: 'from-orange-600 to-red-600',
      priority: 'medium'
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Alerts',
      onClick: () => {},
      color: 'from-yellow-600 to-orange-600',
      priority: 'low'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      onClick: onOpenSettings,
      color: 'from-gray-600 to-slate-600',
      priority: 'low'
    }
  ];

  // Add admin-specific action
  if (isAdmin && onCreateEvent) {
    actions.unshift({
      id: 'create-event',
      icon: Plus,
      label: 'Create Event',
      onClick: onCreateEvent,
      color: 'from-emerald-600 to-green-600',
      priority: 'high'
    });
  }

  const highPriorityActions = actions.filter(action => action.priority === 'high');
  const otherActions = actions.filter(action => action.priority !== 'high');

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center touch-manipulation"
          style={{ 
            transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
            zIndex: 50
          }}
        >
          {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Quick Actions Menu */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Actions Container */}
          <div className="fixed bottom-36 right-4 z-40 space-y-3">
            {/* High Priority Actions - Always Visible */}
            {highPriorityActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  className="flex items-center gap-3 animate-slide-up"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Label */}
                  <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {action.label}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      action.onClick();
                      setIsExpanded(false);
                    }}
                    className={`w-12 h-12 bg-gradient-to-r ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation hover:scale-110 active:scale-95`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            {/* Secondary Actions */}
            {otherActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  className="flex items-center gap-3 animate-slide-up"
                  style={{ 
                    animationDelay: `${(highPriorityActions.length + index) * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Label */}
                  <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {action.label}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      action.onClick();
                      setIsExpanded(false);
                    }}
                    className={`w-10 h-10 bg-gradient-to-r ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation hover:scale-110 active:scale-95`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};