import React, { useState } from 'react';
import { Trophy, Clock, Users, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
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

  const getUserBetStatus = (eventId: string) => {
    const userBet = userBetsByEvent[eventId];
    if (!userBet) return 'no_bet';
    return userBet.status === 'won' ? 'won' : 'lost';
  };

  const filteredEvents = resolvedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterType === 'all') return true;
    
    const betStatus = getUserBetStatus(event.id);
    return betStatus === filterType;
  });

  const getWinningOption = (event: Event) => {
    return event.options.find(opt => opt.id === event.winningOption);
  };

  if (resolvedEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Completed Events</h2>
            <p className="text-gray-600">View results from past events</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredEvents.length} of {resolvedEvents.length} events
        </div>
      </div>

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
          <option value="won">Events I Won</option>
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
          const isWinner = userBet?.status === 'won';
          const isLoser = userBet?.status === 'lost';
          const hasNoBet = !userBet;

          return (
            <div
              key={event.id}
              className={`rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                hasNoBet ? 'bg-gray-50 border-gray-200 opacity-75' :
                isWinner ? 'bg-green-50 border-green-200' :
                'bg-gray-50 border-gray-200'
              }`}
              onClick={() => onEventClick(event)}
            >
              <div className="p-5">
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
                        {isWinner ? 'WON' : 'LOST'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {event.title}
                </h3>

                {/* Pool Info */}
                <div className={`rounded-lg p-4 text-white mb-4 ${
                  hasNoBet ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  isWinner ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}>
                  <div className="flex items-center justify-between">
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
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
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
                  <div className={`rounded-lg p-4 border-2 ${
                    isWinner ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
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
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatCurrency(userBet.amount)}</span>
                      </div>
                      {isWinner && userBet.payout && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payout:</span>
                            <span className="font-bold text-green-700">{formatCurrency(userBet.payout)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-green-200">
                            <span className="text-green-700 font-medium">Profit:</span>
                            <span className="font-bold text-green-700">
                              +{formatCurrency(userBet.payout - userBet.amount)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {isWinner && (
                      <div className="mt-3 text-center">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                          <Trophy className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Congratulations! 🎉
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="text-gray-600 text-sm">
                      You didn't place a bet on this event
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
    </div>
  );
};