import React from 'react';
import { 
  TrendingUp, 
  Bell, 
  Settings, 
  Wifi, 
  WifiOff,
  Download,
  X
} from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface MobileHeaderProps {
  currentUser: any;
  onSignOut: () => void;
  formatCurrency: (amount: number) => string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  onSignOut,
  formatCurrency
}) => {
  const { isOffline, isInstallable, installApp, showInstallPrompt, dismissInstallPrompt } = usePWA();

  return (
    <>
      {/* Install App Prompt */}
      {showInstallPrompt && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 z-50 safe-area-pt">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Download className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Install PredictBet</p>
                <p className="text-xs opacity-90">Get the full app experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={installApp}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                Install
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={`sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 z-40 ${showInstallPrompt ? 'mt-16' : ''} safe-area-pt`}>
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">PredictBet</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-1 ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span className="text-xs">{isOffline ? 'Offline' : 'Online'}</span>
            </div>
            
            {/* Notifications */}
            <button className="relative p-1">
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Welcome back, {currentUser.name.split(' ')[0]}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {currentUser.isAdmin ? 'Admin Account' : 'Bettor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance */}
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(currentUser.balance)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Available</p>
            </div>

            {/* Settings */}
            <button
              onClick={onSignOut}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};