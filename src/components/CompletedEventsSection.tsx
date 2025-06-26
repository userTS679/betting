import React, { useState } from 'react';
import { Trophy, Clock, Users, CheckCircle, XCircle, Search, Filter, Star, TrendingUp, Gift } from 'lucide-react';
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
  onEventClick,
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
    
    // Check if user won based on winning option
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
    return sum + ((userBet?.payout || 0) - (userBet?.amount || 0));
  }, 0);

  if (resolvedEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Completed Events</h2>
              <p className="text-purple-100">Your betting history and achievements</p>
            </div>
          </div>
          
          {userWonEvents.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-300">
                +{formatCurrency(totalWinnings)}
              </div>
              <div className="text-sm text-purple-100">Total Profit</div>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {filteredEvents.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredEvents.length}</div>
              <div className="text-sm text-purple-200">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">{userWonEvents.length}</div>
              <div className="text-sm text-purple-200">Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {userWonEvents.length > 0 ? Math.round((userWonEvents.length / filteredEvents.filter(e => getUserBetStatus(e) !== 'no_bet').length) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-200">Win Rate</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search completed events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="won">🏆 Events I Won</option>
            <option value="lost">Events I Lost</option>
            <option value="no_bet">Events I Didn't Bet On</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const userBet = userBetsByEvent[event.id];
            const winningOption = getWinningOption(event);
            const userBetOption = userBet ? event.options.find(opt => opt.id === userBet.optionId) : null;
            const betStatus = getUserBetStatus(event);
            const isWinner = betStatus === 'won';
            const isLoser = betStatus === 'lost';
            const hasNoBet = betStatus === 'no_bet';

            return (
              <div
                key={event.id}
                className={`rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:scale-[1.02] ${
                  hasNoBet ? 'bg-gray-50 border-gray-200' :
                  isWinner ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-green-100' :
                  'bg-white border-gray-200'
                }`}
                onClick={() => onEventClick(event)}
              >
                {/* Winner ribbon */}
                {isWinner && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3" />
                      WINNER
                    </div>
                  </div>
                )}

                <div className="p-5 relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        RESOLVED
                      </span>
                      {userBet && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isWinner ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {isWinner ? '🏆 WON' : 'LOST'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {event.title}
                  </h3>

                  {/* Pool Info */}
                  <div className={`rounded-xl p-4 text-white mb-4 relative overflow-hidden ${
                    hasNoBet ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    isWinner ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500' :
                    'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}>
                    {isWinner && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-30"></div>
                        <div className="absolute top-2 right-4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                        <div className="absolute bottom-2 left-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                      </>
                    )}
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <div className="text-2xl font-bold">{formatCurrency(event.totalPool)}</div>
                        <div className="text-sm opacity-80">Total Pool</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{event.participantCount}</div>
                        <div className="text-sm opacity-80">Participants</div>
                      </div>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Winning Result</span>
                    </div>
                    <div className="font-medium text-purple-800">
                      {winningOption?.label || 'Result not available'}
                    </div>
                  </div>

                  {/* User's Bet Result */}
                  {userBet ? (
                    <div className={`rounded-xl p-4 border-2 relative overflow-hidden ${
                      isWinner ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 
                      'border-gray-300 bg-gray-50'
                    }`}>
                      {isWinner && (
                        <div className="absolute top-2 right-2">
                          <Gift className="w-5 h-5 text-green-600 animate-bounce" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        {isWinner ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-600" />
                        )}
                        <span className={`font-semibold ${
                          isWinner ? 'text-green-800' : 'text-gray-800'
                        }`}>
                          Your Bet: {userBetOption?.label}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Bet:</span>
                          <span className="font-medium">{formatCurrency(userBet.amount)}</span>
                        </div>
                        {isWinner && userBet.payout && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Payout:</span>
                              <span className="font-bold text-green-700">{formatCurrency(userBet.payout)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-200">
                              <span className="text-green-700 font-medium">Your Profit:</span>
                              <span className="font-bold text-green-700 text-lg">
                                +{formatCurrency(userBet.payout - userBet.amount)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

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
                    <div className="bg-gray-100 rounded-xl p-4 text-center border border-gray-200">
                      <div className="text-gray-600 text-sm mb-2">
                        You didn't place a bet on this event
                      </div>
                      <div className="text-xs text-gray-500">
                        Don't miss out on future opportunities!
                      </div>
                    </div>
                  )}

                  {/* Event Stats */}
                  <div className="flex justify-between items-center gap-3 mt-4 text-sm text-gray-600">
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
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed events found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Completed events will appear here once results are declared'
              }
            </p>
          </div>
        )}

        {/* Motivational footer for winners */}
        {userWonEvents.length > 0 && filterType === 'won' && (
          <div className="mt-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 border border-green-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-xl font-bold text-green-800">You're on a winning streak!</span>
              </div>
              <p className="text-green-700 mb-4">
                You've won {userWonEvents.length} event{userWonEvents.length > 1 ? 's' : ''} and earned {formatCurrency(totalWinnings)} in profit!
              </p>
              <div className="text-sm text-green-600">
                Keep the momentum going - check out the active events above! 🚀
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};