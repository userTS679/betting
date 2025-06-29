import React, { useState, useEffect } from 'react';
import { MobileNavigation } from './MobileNavigation';
import { MobileHeader } from './MobileHeader';
import { ResponsiveEventCard } from './ResponsiveCard';
import { ResponsiveLeaderboard } from './ResponsiveLeaderboard';
import { ResponsiveDashboard } from './ResponsiveDashboard';
import { MobileProfile } from './MobileProfile';
import { PullToRefresh } from './PullToRefresh';
import { BettingModal } from '../BettingModal';
import { PaymentManagement } from '../PaymentManagement';
import { AdminDashboard } from '../admin/AdminDashboard';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';

interface MobileAppProps {
  currentUser: any;
  events: any[];
  userBets: any[];
  userBetsByEvent: any;
  transactions: any[];
  paymentMethods: any[];
  onSignOut: () => void;
  onPlaceBet: (eventId: string, optionId: string, amount: number) => void;
  onCreateEvent: (eventData: any) => void;
  onAddMoney: (amount: number, methodId: string) => void;
  onWithdraw: (amount: number, methodId: string) => void;
  onRefreshEvents: () => void;
  formatCurrency: (amount: number) => string;
}

export const MobileApp: React.FC<MobileAppProps> = ({
  currentUser,
  events,
  userBets,
  userBetsByEvent,
  transactions,
  paymentMethods,
  onSignOut,
  onPlaceBet,
  onCreateEvent,
  onAddMoney,
  onWithdraw,
  onRefreshEvents,
  formatCurrency
}) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'Weather', 'Cryptocurrency', 'Sports', 'Technology', 'Finance', 'Politics', 'Entertainment'];

  // Pull to refresh functionality
  const { isPulling, isRefreshing, pullDistance, shouldShowIndicator } = usePullToRefresh({
    onRefresh: async () => {
      await onRefreshEvents();
    },
    threshold: 80,
    enabled: ['dashboard', 'events', 'leaderboard'].includes(currentView)
  });

  // Swipe gestures for navigation
  useSwipeGestures({
    onSwipeLeft: () => {
      const views = ['dashboard', 'events', 'leaderboard', 'payments', 'profile'];
      const currentIndex = views.indexOf(currentView);
      if (currentIndex < views.length - 1) {
        setCurrentView(views[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const views = ['dashboard', 'events', 'leaderboard', 'payments', 'profile'];
      const currentIndex = views.indexOf(currentView);
      if (currentIndex > 0) {
        setCurrentView(views[currentIndex - 1]);
      }
    },
    threshold: 100,
    preventScroll: false
  });

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeEvents = filteredEvents.filter(event => event.status === 'active');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ResponsiveDashboard
            user={currentUser}
            events={events}
            userBets={userBets}
            formatCurrency={formatCurrency}
          />
        );

      case 'events':
        return (
          <div className="space-y-4 pb-20">
            {/* Mobile-Optimized Search and Filters */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 border-b border-slate-200 dark:border-slate-700 z-10">
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-base"
                  />
                </div>

                {/* Category Filter - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle and Admin Create */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                    >
                      {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                      <span className="text-sm">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
                    </button>
                  </div>

                  {currentUser.isAdmin && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold min-h-[40px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Create</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Events List - Responsive Layout */}
            <div className={`px-4 ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
            }`}>
              {activeEvents.map(event => (
                <ResponsiveEventCard
                  key={event.id}
                  event={event}
                  userBet={userBetsByEvent[event.id]}
                  onBet={setSelectedEvent}
                  isAdmin={currentUser.isAdmin}
                />
              ))}

              {activeEvents.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-slate-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No events found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="p-4 pb-20">
            <ResponsiveLeaderboard
              players={[]} // This would be populated from props
              currentUser={currentUser}
              formatCurrency={formatCurrency}
            />
          </div>
        );

      case 'payments':
        return (
          <PaymentManagement
            userId={currentUser.id}
            currentBalance={currentUser.balance}
            transactions={transactions}
            paymentMethods={paymentMethods}
            onAddMoney={onAddMoney}
            onWithdraw={onWithdraw}
          />
        );

      case 'profile':
        return (
          <div className="px-4">
            <MobileProfile
              user={currentUser}
              userBets={userBets}
              formatCurrency={formatCurrency}
            />
          </div>
        );

      case 'admin':
        return currentUser.isAdmin ? (
          <div className="px-4 pb-20">
            <AdminDashboard
              events={events}
              currentUser={currentUser}
              onCreateEvent={onCreateEvent}
              onRefreshEvents={onRefreshEvents}
            />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Pull to Refresh Indicator */}
      {shouldShowIndicator && (
        <PullToRefresh
          isPulling={isPulling}
          isRefreshing={isRefreshing}
          pullDistance={pullDistance}
          threshold={80}
        />
      )}

      {/* Header */}
      <MobileHeader
        currentUser={currentUser}
        onSignOut={onSignOut}
        formatCurrency={formatCurrency}
      />

      {/* Main Content */}
      <main className="relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        isAdmin={currentUser.isAdmin}
      />

      {/* Modals */}
      {selectedEvent && (
        <BettingModal
          event={selectedEvent}
          userBalance={currentUser.balance}
          isAdmin={currentUser.isAdmin}
          onClose={() => setSelectedEvent(null)}
          onPlaceBet={onPlaceBet}
        />
      )}
    </div>
  );
};