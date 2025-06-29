import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  TrendingUp,
  Zap,
  Target,
  Star
} from 'lucide-react';
import { Event } from '../../types';
import { EventCard } from '../EventCard';

interface EventsSectionProps {
  events: Event[];
  userBetsByEvent: any;
  onBet: (event: Event) => void;
  isAdmin?: boolean;
  formatCurrency: (amount: number) => string;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  userBetsByEvent,
  onBet,
  isAdmin = false,
  formatCurrency
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeRange, setTimeRange] = useState('All');
  const [betAmountRange, setBetAmountRange] = useState('All');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Sports', 'Cryptocurrency', 'Weather', 'Technology', 'Finance', 'Politics', 'Entertainment'];
  const timeRanges = ['All', 'Next Hour', 'Next 6 Hours', 'Today', 'This Week'];
  const betRanges = ['All', '₹100-500', '₹500-2000', '₹2000-5000', '₹5000+'];
  const quickBetAmounts = [100, 500, 1000, 2500];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    // Time range filter
    let matchesTime = true;
    if (timeRange !== 'All') {
      const now = Date.now();
      const eventTime = event.expiresAt.getTime();
      const timeDiff = eventTime - now;
      
      switch (timeRange) {
        case 'Next Hour':
          matchesTime = timeDiff <= 60 * 60 * 1000;
          break;
        case 'Next 6 Hours':
          matchesTime = timeDiff <= 6 * 60 * 60 * 1000;
          break;
        case 'Today':
          matchesTime = timeDiff <= 24 * 60 * 60 * 1000;
          break;
        case 'This Week':
          matchesTime = timeDiff <= 7 * 24 * 60 * 60 * 1000;
          break;
      }
    }

    // Status filter
    let matchesStatus = true;
    switch (statusFilter) {
      case 'upcoming':
        matchesStatus = event.status === 'active' && event.expiresAt.getTime() > Date.now();
        break;
      case 'live':
        matchesStatus = event.status === 'active' && event.expiresAt.getTime() <= Date.now();
        break;
      case 'completed':
        matchesStatus = event.status === 'resolved';
        break;
    }

    return matchesSearch && matchesCategory && matchesTime && matchesStatus;
  });

  // Sort events to prioritize user's bets and high-value events
  const sortedEvents = filteredEvents.sort((a, b) => {
    const aHasUserBet = userBetsByEvent[a.id] ? 1 : 0;
    const bHasUserBet = userBetsByEvent[b.id] ? 1 : 0;
    
    if (aHasUserBet !== bHasUserBet) {
      return bHasUserBet - aHasUserBet;
    }
    
    // Then by total pool size
    return b.totalPool - a.totalPool;
  });

  const QuickBetButton = ({ amount }: { amount: number }) => (
    <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
      Quick Bet ₹{amount}
    </button>
  );

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live Events</h2>
            <p className="text-slate-600 dark:text-slate-400">Find your next winning opportunity</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Quick Bet Amounts */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Quick Bet Amounts
        </h3>
        <div className="flex gap-3 flex-wrap">
          {quickBetAmounts.map(amount => (
            <QuickBetButton key={amount} amount={amount} />
          ))}
        </div>
      </div>

      {/* Search and Status Tabs */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300/60 dark:border-slate-600/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          
          {/* Status Filter Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {[
              { id: 'upcoming', label: 'Upcoming', icon: Clock },
              { id: 'live', label: 'Live', icon: TrendingUp },
              { id: 'completed', label: 'Completed', icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setStatusFilter(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  statusFilter === id
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {timeRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            
            <select
              value={betAmountRange}
              onChange={(e) => setBetAmountRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {betRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => (
          <div key={event.id} className="relative">
            {/* Highlight user's bets */}
            {userBetsByEvent[event.id] && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Your Bet
                </div>
              </div>
            )}
            
            {/* Potential Winning Highlight */}
            {event.totalPool > 10000 && (
              <div className="absolute -top-2 -left-2 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  🎯 High Value
                </div>
              </div>
            )}
            
            <EventCard
              event={event}
              userBet={userBetsByEvent[event.id] || null}
              onBet={onBet}
              isAdmin={isAdmin}
            />
            
            {/* Quick Bet Overlay for High-Value Events */}
            {event.totalPool > 5000 && !userBetsByEvent[event.id] && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-lg text-center text-sm font-semibold">
                  💰 Potential Win: {formatCurrency(event.totalPool * 0.4)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No events found</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your filters or check back later for new opportunities
          </p>
        </div>
      )}
    </div>
  );
};