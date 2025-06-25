import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, TrendingUp, Users, Clock, Settings, Wallet, Shield } from 'lucide-react';
import { Event, User, Bet, Transaction, PaymentMethod } from './types';
import { mockPaymentMethods } from './data/mockData';
import { EventCard } from './components/EventCard';
import { BettingModal } from './components/BettingModal';
import { CreateEventModal } from './components/CreateEventModal';
import { UserProfile } from './components/UserProfile';
import { PaymentManagement } from './components/PaymentManagement';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthPage } from './components/auth/AuthPage';
import { WinningAnimation } from './components/WinningAnimation';
import { getCurrentUser, onAuthStateChange, signOut, getUserProfile, createUserProfile } from './services/auth';
import { fetchEvents, createEvent } from './services/events';
import { placeBet, getUserBettingStats } from './services/betting';
import { supabase } from './lib/supabase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [userBetsByEvent, setUserBetsByEvent] = useState<{ [eventId: string]: Bet }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'ending'>('newest');
  const [currentView, setCurrentView] = useState<'events' | 'payments' | 'admin'>('events');
  
  // Winning animation state
  const [showWinningAnimation, setShowWinningAnimation] = useState(false);
  const [winningAnimationData, setWinningAnimationData] = useState<{
    winAmount: number;
    eventTitle: string;
    streak: number;
  } | null>(null);
  const [pendingWins, setPendingWins] = useState<string[]>([]);

  const categories = ['All', 'Weather', 'Cryptocurrency', 'Sports', 'Technology', 'Finance', 'Politics', 'Entertainment'];

  const handleUserProfile = async (user: any) => {
    try {
      console.log('Handling user profile for:', user.email);
      let profile = await getUserProfile(user.id);
      
      // If profile doesn't exist, create it
      if (!profile) {
        console.log('Creating new user profile');
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const userPhone = user.user_metadata?.phone || user.phone || null;
        
        // Check if this is admin login
        const isAdminEmail = user.email === 'admin@predictbet.com';
        if (isAdminEmail) {
          profile = await createUserProfile(user.id, 'Admin', userPhone);
          // Ensure admin privileges
          if (profile) {
            profile.is_admin = true;
            profile.balance = Math.max(profile.balance, 100000);
          }
        } else {
          profile = await createUserProfile(user.id, userName, userPhone);
        }
      }

      if (profile) {
        console.log('User profile loaded:', profile);
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          balance: profile.balance,
          totalBets: profile.total_bets,
          totalWinnings: profile.total_winnings,
          isAdmin: profile.is_admin || false
        });
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to create or retrieve user profile');
      }
    } catch (error) {
      console.error('Failed to handle user profile:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const loadEvents = async () => {
    try {
      console.log('Loading events...');
      const eventsData = await fetchEvents();
      console.log('Events loaded:', eventsData.length);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    }
  };

  const loadUserBets = async (userId: string) => {
    try {
      const { data: betsData, error } = await supabase
        .from('bets')
        .select(`
          *,
          events (title),
          bet_options (label)
        `)
        .eq('user_id', userId)
        .order('placed_at', { ascending: false });

      if (error) {
        console.error('Error loading user bets:', error);
        setUserBets([]);
        return;
      }

      const formattedBets: Bet[] = (betsData || []).map(bet => ({
        id: bet.id,
        eventId: bet.event_id,
        userId: bet.user_id,
        optionId: bet.option_id,
        amount: bet.amount,
        placedAt: new Date(bet.placed_at),
        status: bet.status,
        payout: bet.payout
      }));

      setUserBets(formattedBets);

      // Create a map of user bets by event ID (latest bet per event)
      const betsByEvent: { [eventId: string]: Bet } = {};
      formattedBets.forEach(bet => {
        if (!betsByEvent[bet.eventId] || bet.placedAt > betsByEvent[bet.eventId].placedAt) {
          betsByEvent[bet.eventId] = bet;
        }
      });
      setUserBetsByEvent(betsByEvent);

      // Check for new wins and show animation
      checkForNewWins(formattedBets);
    } catch (error) {
      console.error('Failed to load user bets:', error);
      setUserBets([]);
    }
  };

  const checkForNewWins = async (bets: Bet[]) => {
    if (!currentUser) return;

    const wonBets = bets.filter(bet => bet.status === 'won');
    const newWins = wonBets.filter(bet => !pendingWins.includes(bet.id));

    if (newWins.length > 0) {
      // Calculate current streak
      const resolvedBets = bets
        .filter(bet => bet.status === 'won' || bet.status === 'lost')
        .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());

      let currentStreak = 0;
      for (const bet of resolvedBets) {
        if (bet.status === 'won') {
          currentStreak++;
        } else {
          break;
        }
      }

      // Show animation for the most recent win
      const latestWin = newWins[0];
      if (latestWin.payout) {
        // Get event title
        const event = events.find(e => e.id === latestWin.eventId);
        const eventTitle = event?.title || 'Event';

        setWinningAnimationData({
          winAmount: latestWin.payout,
          eventTitle,
          streak: currentStreak
        });
        setShowWinningAnimation(true);

        // Mark these wins as shown
        setPendingWins(prev => [...prev, ...newWins.map(bet => bet.id)]);
      }
    }
  };

  const loadTransactions = async (userId: string) => {
    try {
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
        return;
      }

      const formattedTransactions: Transaction[] = (transactionsData || []).map(txn => ({
        id: txn.id,
        userId: txn.user_id,
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        timestamp: new Date(txn.created_at),
        status: txn.status,
        paymentMethod: txn.payment_method,
        transactionId: txn.transaction_id,
        eventId: txn.event_id,
        betId: txn.bet_id
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    }
  };

  // Calculate Net P&L based only on resolved bets
  const calculateNetPL = (userBets: Bet[]): number => {
    const resolvedBets = userBets.filter(bet => bet.status === 'won' || bet.status === 'lost');
    
    let totalWinnings = 0;
    let totalLosses = 0;
    
    resolvedBets.forEach(bet => {
      if (bet.status === 'won' && bet.payout) {
        totalWinnings += bet.payout - bet.amount; // Only count profit, not the original bet amount
      } else if (bet.status === 'lost') {
        totalLosses += bet.amount;
      }
    });
    
    return totalWinnings - totalLosses;
  };

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          await handleUserProfile(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        await handleUserProfile(user);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadEvents();
      loadUserBets(currentUser.id);
      loadTransactions(currentUser.id);
    }
  }, [isAuthenticated, currentUser]);

  // Reload user bets when events change (to check for new wins)
  useEffect(() => {
    if (isAuthenticated && currentUser && events.length > 0) {
      loadUserBets(currentUser.id);
    }
  }, [events]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setEvents([]);
      setUserBets([]);
      setTransactions([]);
      setPendingWins([]);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleAuthSuccess = () => {
    // Auth success will be handled by the onAuthStateChange listener
    // No need to set state here as it will be updated automatically
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      
      // For regular users, show:
      // 1. All events where they have bets (regardless of event status)
      // 2. All currently active events (for new betting opportunities)
      // For admins, show all events
      if (currentUser?.isAdmin) {
        return matchesSearch && matchesCategory;
      } else {
        const hasUserBet = userBetsByEvent[event.id];
        const isActiveEvent = event.status === 'active';
        return matchesSearch && matchesCategory && (hasUserBet || isActiveEvent);
      }
    })
    .sort((a, b) => {
      // Prioritize events where user has bets
      const aHasUserBet = userBetsByEvent[a.id] ? 1 : 0;
      const bHasUserBet = userBetsByEvent[b.id] ? 1 : 0;
      
      if (aHasUserBet !== bHasUserBet) {
        return bHasUserBet - aHasUserBet; // Events with user bets first
      }
      
      // Then sort by selected criteria
      switch (sortBy) {
        case 'popular':
          return b.participantCount - a.participantCount;
        case 'ending':
          return a.expiresAt.getTime() - b.expiresAt.getTime();
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const handlePlaceBet = async (eventId: string, optionId: string, amount: number) => {
    if (!currentUser || (currentUser.balance < amount && !currentUser.isAdmin)) {
      alert('Insufficient balance');
      return;
    }

    try {
      const { bet, transaction } = await placeBet(currentUser.id, eventId, optionId, amount);
      
      // Update local state - only update balance and total bets count
      setCurrentUser(prev => prev ? ({
        ...prev,
        balance: prev.balance - amount,
        totalBets: prev.totalBets + 1
        // Don't update totalWinnings here - only when bet is resolved
      }) : null);

      // Reload data to get updated statistics
      await loadEvents();
      await loadUserBets(currentUser.id);
      await loadTransactions(currentUser.id);

    } catch (error) {
      console.error('Failed to place bet:', error);
      alert('Failed to place bet. Please try again.');
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    if (!currentUser) return;

    try {
      console.log('Creating event with data:', eventData);
      const newEvent = await createEvent({
        ...eventData,
        createdBy: currentUser.id
      });

      console.log('Event created successfully:', newEvent.id);
      
      // Reload events to include the new one
      await loadEvents();
      
      // Close the modal
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleAddMoney = async (amount: number, methodId: string) => {
    if (!currentUser) return;

    try {
      const method = paymentMethods.find(m => m.id === methodId);
      
      // Update user balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: currentUser.balance + amount })
        .eq('id', currentUser.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: currentUser.id,
          type: 'deposit',
          amount: amount,
          description: `Wallet top-up via ${method?.name}`,
          status: 'completed',
          payment_method: method?.name,
          transaction_id: `${method?.type.toUpperCase()}${Math.random().toString().slice(2, 11)}`
        });

      if (transactionError) throw transactionError;

      // Update local state
      setCurrentUser(prev => prev ? ({
        ...prev,
        balance: prev.balance + amount
      }) : null);

      // Reload transactions
      await loadTransactions(currentUser.id);

    } catch (error) {
      console.error('Failed to add money:', error);
      alert('Failed to add money. Please try again.');
    }
  };

  const handleWithdraw = async (amount: number, methodId: string) => {
    if (!currentUser || currentUser.balance < amount) return;

    try {
      const method = paymentMethods.find(m => m.id === methodId);
      
      // Update user balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: currentUser.balance - amount })
        .eq('id', currentUser.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: currentUser.id,
          type: 'withdrawal',
          amount: -amount,
          description: `Withdrawal to ${method?.name}`,
          status: 'completed',
          payment_method: method?.name,
          transaction_id: `${method?.type.toUpperCase()}${Math.random().toString().slice(2, 11)}`
        });

      if (transactionError) throw transactionError;

      // Update local state
      setCurrentUser(prev => prev ? ({
        ...prev,
        balance: prev.balance - amount
      }) : null);

      // Reload transactions
      await loadTransactions(currentUser.id);

    } catch (error) {
      console.error('Failed to withdraw money:', error);
      alert('Failed to withdraw money. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading PredictBet...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const totalPool = events.reduce((sum, event) => sum + event.totalPool, 0);
  const totalEvents = events.length;
  const activeEvents = events.filter(event => event.status === 'active').length;
  
  // Calculate Net P&L based only on resolved bets
  const netPL = calculateNetPL(userBets);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PredictBet</h1>
                <p className="text-xs text-gray-600">Event Prediction Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('events')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'events'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setCurrentView('payments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'payments'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Payments
                </button>
                {currentUser.isAdmin && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(currentUser.balance)}
                </div>
                <div className="text-xs text-gray-600">
                  {currentUser.isAdmin ? 'Admin Balance' : 'Available Balance'}
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {currentView === 'admin' && currentUser.isAdmin ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboard
            events={events}
            currentUser={currentUser}
            onCreateEvent={handleCreateEvent}
            onRefreshEvents={loadEvents}
          />
        </div>
      ) : currentView === 'payments' ? (
        <PaymentManagement
          userId={currentUser.id}
          currentBalance={currentUser.balance}
          transactions={transactions}
          paymentMethods={paymentMethods}
          onAddMoney={handleAddMoney}
          onWithdraw={handleWithdraw}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <UserProfile user={{...currentUser, netPL}} userBets={userBets} />

              {/* Platform Stats */}
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pool</span>
                    <span className="font-semibold">{formatCurrency(totalPool)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Events</span>
                    <span className="font-semibold">{activeEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Events</span>
                    <span className="font-semibold">{totalEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">House Edge</span>
                    <span className="font-semibold text-orange-600">15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Controls */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentUser.isAdmin ? 'Manage Events' : 'Your Events & Betting History'}
                  </h2>
                  
                  {currentUser.isAdmin && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Create Event
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'ending')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="ending">Ending Soon</option>
                  </select>
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userBet={userBetsByEvent[event.id] || null}
                    onBet={setSelectedEvent}
                    isAdmin={currentUser.isAdmin}
                  />
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== 'All' 
                      ? 'Try adjusting your search or filters'
                      : currentUser.isAdmin 
                        ? 'Create your first event to get started!'
                        : userBets.length === 0
                          ? 'Start betting on events to see your history here!'
                          : 'No events match your current filters'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedEvent && (
        <BettingModal
          event={selectedEvent}
          userBalance={currentUser.balance}
          isAdmin={currentUser.isAdmin}
          onClose={() => setSelectedEvent(null)}
          onPlaceBet={handlePlaceBet}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {/* Winning Animation */}
      {showWinningAnimation && winningAnimationData && (
        <WinningAnimation
          isVisible={showWinningAnimation}
          onClose={() => setShowWinningAnimation(false)}
          winAmount={winningAnimationData.winAmount}
          eventTitle={winningAnimationData.eventTitle}
          streak={winningAnimationData.streak}
        />
      )}
    </div>
  );
}

export default App;