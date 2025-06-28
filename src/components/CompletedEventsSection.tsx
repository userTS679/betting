import React, { useState } from 'react';
import { Trophy, Clock, Users, CheckCircle, XCircle, Search, Star, TrendingUp, Gift } from 'lucide-react';
import { Event, Bet } from '../types';

interface CompletedEventsSectionProps {
  resolvedEvents: Event[];
  userBets: Bet[];
  userBetsByEvent: { [eventId: string]: Bet };
  onEventClick: (event: Event) => void;
  isAdmin?: boolean;
}

export const CompletedEventsSection: React.FC<CompletedEventsSectionProps> = ({
  resolvedEvents,
  userBets,
  userBetsByEvent,
  // onEventClick,
  isAdmin = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'won' | 'lost' | 'no_bet'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Weather: 'bg-blue-500',
      Cryptocurrency: 'bg-orange-500',
      Sports: 'bg-green-500',
      Technology: 'bg-purple-500',
      Finance: 'bg-indigo-500',
      Politics: 'bg-red-500',
      Entertainment: 'bg-pink-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  // Determine user bet status based on event resolution
  const getUserBetStatus = (event: Event) => {
    const userBet = userBetsByEvent[event.id];
    if (!userBet) return 'no_bet';
    if (event.winningOption && userBet.optionId === event.winningOption) {
      return 'won';
    } else if (event.winningOption) {
      return 'lost';
    }
    return userBet.status === 'won' ? 'won' : 'lost';
  };

  const filteredEvents = resolvedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    const betStatus = getUserBetStatus(event);
    return betStatus === filterType;
  });

  const getWinningOption = (event: Event) => {
    return event.options.find(opt => opt.id === event.winningOption);
  };

  // Calculate stats for motivation
  const userWonEvents = filteredEvents.filter(event => getUserBetStatus(event) === 'won');
  const totalWinnings = userWonEvents.reduce((sum, event) => {
    const userBet = userBetsByEvent[event.id];
    return sum + ((userBet?.payout || 0));
  }, 0);

  if (resolvedEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Completed Events</h2>
              {/* Motivational message */}
              <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-5 py-2 shadow">
                <TrendingUp className="w-6 h-6 text-green-200" />
                <span className="text-base text-green-100 font-semibold">
                  You're on a winning streak! Keep the momentum going – check out the active events! 🚀
                </span>
              </div>
            </div>
          </div>
          {/* Only show total profit in the header */}
          {userWonEvents.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-6 text-center flex flex-col items-center shadow-lg border border-white/30">
              <div className="text-4xl md:text-5xl font-extrabold text-green-300 drop-shadow-lg tracking-tight leading-tight">
                {formatCurrency(totalWinnings)}
              </div>
              <div className="text-base mt-2 text-purple-100 font-medium tracking-wide uppercase letter-spacing-wider">
                Total Winnings
              </div>
            </div>
          )}
        </div>
        {/* Stats bar */}
        
      </div>

      <div className="p-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search completed events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          >
            <option value="all">All Events</option>
            <option value="won">🏆 Events I Won</option>
            <option value="lost">Events I Lost</option>
            <option value="no_bet">Events I Didn't Bet On</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map((event) => {
            const userBet = userBetsByEvent[event.id];
            const winningOption = getWinningOption(event);
            const userBetOption = userBet ? event.options.find(opt => opt.id === userBet.optionId) : null;
            const betStatus = getUserBetStatus(event);
            const isWinner = betStatus === 'won';
            const isLoser = betStatus === 'lost';
            const hasNoBet = betStatus === 'no_bet';

            // Calculate user's profit for this bet
            const userProfit = userBet && userBet.payout
              ? userBet.payout
              : 0;

            return (
              <div
                key={event.id}
                className={`relative rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  hasNoBet
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    : isWinner
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-600 shadow-green-100 dark:shadow-green-900/20'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                }`}
                style={{ cursor: 'default' }}
              >
                {/* Winner ribbon - fixed inside the card */}
                {isWinner && (
                  <div className="absolute top-5 right-5 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3" />
                      WINNER
                    </div>
                  </div>
                )}

                <div className="p-6 relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {event.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {userBet && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isWinner
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {isWinner ? '🏆 WON' : 'LOST'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                    {event.title}
                  </h3>

                  {/* User's Profit Info */}
                  <div
  className={`rounded-xl p-4 mb-4 relative overflow-hidden flex flex-col items-center justify-center ${
    isWinner
      ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
      : hasNoBet
      ? 'bg-gradient-to-r from-gray-400 to-gray-500'
      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
  }`}
>
  <div className="flex flex-col items-center justify-center w-full">
    <div
      className={`font-extrabold ${
        isWinner
          ? 'text-green-100'
          : hasNoBet
          ? 'text-gray-200'
          : 'text-blue-100'
      }`}
      style={{
        fontSize: '2.8rem',
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        textShadow: isWinner
          ? '0 4px 24px rgba(16,185,129,0.25)'
          : '0 2px 12px rgba(59,130,246,0.15)'
      }}
    >
      {userBet
        ? isWinner
          ? `${formatCurrency(userProfit)}`
          : formatCurrency(0)
        : formatCurrency(0)}
    </div>
    {/* <div className="text-lg font-medium mt-2 opacity-90 text-white text-center">
      {userBet
        ? isWinner
          ? 'Your Profit'
          : 'No Profit'
        : 'No Bet'}
    </div> */}
    {isWinner && (
      <div className="mt-2 text-green-50 text-base font-semibold text-center">
        🎉 Amazing! Keep up the winning streak!
      </div>
    )}
  </div>
</div>
                  {/* User's Bet Result */}
                  {userBet ? (
                    <div
                      className={`rounded-xl p-4 border-2 relative overflow-hidden ${
                        isWinner
                          ? 'border-green-300 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      {isWinner && (
                        <div className="absolute top-2 right-2">
                          <Gift className="w-5 h-5 text-green-600 dark:text-green-400 animate-bounce" />
                        </div>
                      )}

                      {isWinner && (
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-bold">
                              Congratulations! You won! 🎉
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        You didn't place a bet on this event
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Don't miss out on future opportunities!
                      </div>
                    </div>
                  )}
                  <div className="my-4" />

                  {/* Result */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-900 dark:text-purple-300">Winning Result</span>
                    </div>
                    <div className="font-medium text-purple-800 dark:text-purple-200">
                      {winningOption?.label || 'Result not available'}
                    </div>
                  </div>

                  {/* Event Stats */}
                  <div className="flex justify-between items-center gap-3 mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Resolved {event.expiresAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.participantCount} bettors</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No completed events found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Completed events will appear here once results are declared'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};