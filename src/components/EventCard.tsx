import React from 'react';
import { Clock, Users } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  isAdmin?: boolean;
  onBet: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isAdmin = false, onBet }) => {
  const timeLeft = Math.max(0, event.expiresAt.getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 max-w-sm">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            event.status === 'active' ? 'bg-green-100 text-green-800' : 
            event.status === 'closed' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {event.status.toUpperCase()}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {event.title}
        </h3>

        <div className="relative mb-4">
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-lg p-4 text-white shadow-lg overflow-hidden flex flex-col items-center justify-center">
            <div className="text-4xl font-extrabold tracking-tight text-center">
              {formatCurrency(event.totalPool)}
            </div>
            <div className="text-sm opacity-80 mt-1">Total Pool</div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-30"></div>
            <div className="absolute top-2 right-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-3 left-12 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="truncate">
              {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : 
               minutesLeft > 0 ? `${minutesLeft}m left` : 'Expired'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{event.participantCount} bettors</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {event.options.slice(0, 2).map((option) => (
            <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 text-sm truncate block">
                  {option.label}
                </span>
                <div className="text-xs text-gray-500">
                  {option.bettors} bets • {formatCurrency(option.totalBets)}
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="font-bold text-lg text-blue-600">
                  {option.odds.toFixed(2)}x
                </div>
                <div className="text-xs text-gray-400">live return</div>
              </div>
            </div>
          ))}

          {event.options.length > 2 && (
            <div className="text-center text-xs text-gray-500 py-1">
              +{event.options.length - 2} more options
            </div>
          )}
        </div>

        <button
          onClick={() => onBet(event)}
          disabled={event.status !== 'active' || timeLeft <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {event.status !== 'active' ? 'Event Closed' : timeLeft <= 0 ? 'Expired' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
};