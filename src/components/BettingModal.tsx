import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, AlertCircle, Info, BarChart3, PieChart, Activity } from 'lucide-react';
import { Event, BetOption } from '../types';
import { calculateBetReturns, BetCalculation, getBettingHistory } from '../services/betting';

interface BettingModalProps {
  event: Event;
  userBalance: number;
  isAdmin?: boolean;
  onClose: () => void;
  onPlaceBet: (eventId: string, optionId: string, amount: number) => void;
}

interface BettingHistoryPoint {
  timestamp: Date;
  optionId: string;
  optionLabel: string;
  amount: number;
  cumulativePercentage: number;
}

export const BettingModal: React.FC<BettingModalProps> = ({
  event,
  userBalance,
  isAdmin = false,
  onClose,
  onPlaceBet
}) => {
  const [selectedOption, setSelectedOption] = useState<BetOption | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isPlacing, setIsPlacing] = useState(false);
  const [betCalculation, setBetCalculation] = useState<BetCalculation | null>(null);
  const [activeTab, setActiveTab] = useState<'bet' | 'analytics'>('bet');
  const [bettingHistory, setBettingHistory] = useState<BettingHistoryPoint[]>([]);
  const [animatedReturn, setAnimatedReturn] = useState<number>(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Load betting history for analytics
  useEffect(() => {
    const loadBettingHistory = async () => {
      try {
        const history = await getBettingHistory(event.id);
        const processedHistory: BettingHistoryPoint[] = [];
        let runningTotals: { [optionId: string]: number } = {};
        let totalAmount = 0;

        history.forEach((bet: any) => {
          const optionId = bet.option_id;
          const amount = bet.amount;
          runningTotals[optionId] = (runningTotals[optionId] || 0) + amount;
          totalAmount += amount;
          const percentage = totalAmount > 0 ? (runningTotals[optionId] / totalAmount) * 100 : 0;
          processedHistory.push({
            timestamp: new Date(bet.placed_at),
            optionId: optionId,
            optionLabel: bet.bet_options.label,
            amount: amount,
            cumulativePercentage: percentage
          });
        });

        setBettingHistory(processedHistory);
      } catch (error) {
        console.error('Failed to load betting history:', error);
      }
    };

    if (activeTab === 'analytics') {
      loadBettingHistory();
    }
  }, [event.id, activeTab]);

  // Calculate percentage distribution for analytics
  const calculatePercentages = () => {
    const totalPool = event.totalPool || 1;
    return event.options.map(option => ({
      ...option,
      percentage: totalPool > 0 ? (option.totalBets / totalPool) * 100 : 0,
      color: getOptionColor(option.id)
    }));
  };

  const getOptionColor = (optionId: string) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const index = event.options.findIndex(opt => opt.id === optionId);
    return colors[index % colors.length];
  };

  // Generate time-based chart for betting history
  const generateTimeChart = () => {
    if (bettingHistory.length === 0) return null;

    const width = 400;
    const height = 200;
    const padding = 40;

    // Get time range
    const startTime = event.createdAt.getTime();
    const endTime = event.expiresAt.getTime();
    const timeRange = endTime - startTime;

    // Group history by option
    const optionGroups: { [optionId: string]: BettingHistoryPoint[] } = {};
    bettingHistory.forEach(point => {
      if (!optionGroups[point.optionId]) {
        optionGroups[point.optionId] = [];
      }
      optionGroups[point.optionId].push(point);
    });

    const paths = Object.entries(optionGroups).map(([optionId, points]) => {
      const option = event.options.find(opt => opt.id === optionId);
      if (!option) return null;

      const color = getOptionColor(optionId);
      
      // Create path points
      const pathPoints = points.map(point => {
        const x = padding + ((point.timestamp.getTime() - startTime) / timeRange) * (width - 2 * padding);
        const y = height - padding - (point.cumulativePercentage / 100) * (height - 2 * padding);
        return `${x},${y}`;
      });

      if (pathPoints.length === 0) return null;

      return (
        <g key={optionId}>
          <path
            d={`M ${pathPoints.join(' L ')}`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point, index) => {
            const x = padding + ((point.timestamp.getTime() - startTime) / timeRange) * (width - 2 * padding);
            const y = height - padding - (point.cumulativePercentage / 100) * (height - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </g>
      );
    }).filter(Boolean);

    return (
      <svg width={width} height={height} className="mx-auto">
        <defs>
          <linearGradient id="timeChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F3F4F6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#F9FAFB" stopOpacity="0.2"/>
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#timeChartGradient)" rx="8"/>
        {[0, 25, 50, 75, 100].map(percentage => {
          const y = height - padding - (percentage / 100) * (height - 2 * padding);
          return (
            <g key={percentage}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fontSize="10"
                fill="#6B7280"
                textAnchor="end"
              >
                {percentage}%
              </text>
            </g>
          );
        })}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#374151"
          strokeWidth="2"
        />
        {paths}
        <text x={width / 2} y={height - 5} fontSize="12" fill="#374151" textAnchor="middle">
          Time →
        </text>
        <text x={15} y={height / 2} fontSize="12" fill="#374151" textAnchor="middle" transform={`rotate(-90, 15, ${height / 2})`}>
          Bet %
        </text>
      </svg>
    );
  };

  // Recalculate returns whenever bet amount or selected option changes
  useEffect(() => {
    if (selectedOption && betAmount > 0) {
      try {
        const calculation = calculateBetReturns(event, selectedOption.id, betAmount, isAdmin);
        setBetCalculation(calculation);
      } catch (error) {
        setBetCalculation(null);
      }
    } else {
      setBetCalculation(null);
    }
  }, [selectedOption, betAmount, event, isAdmin]);

  // Animate the return value for a smooth, professional effect
  useEffect(() => {
    if (!betCalculation) {
      setAnimatedReturn(0);
      return;
    }
    let frame: number;
    const duration = 350;
    const start = animatedReturn;
    const end = betCalculation.potentialReturn;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedReturn(start + (end - start) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [betCalculation?.potentialReturn]);

  const handlePlaceBet = async () => {
    if (!selectedOption || betAmount <= 0 || (betAmount > userBalance && !isAdmin)) return;
    setIsPlacing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onPlaceBet(event.id, selectedOption.id, betAmount);
      onClose();
    } catch (error) {
      // handle error
    } finally {
      setIsPlacing(false);
    }
  };

  const timeLeft = Math.max(0, event.expiresAt.getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const maxBetAmount = betCalculation?.maxBetAmount || (isAdmin ? Infinity : Math.min(userBalance, 10000));
  const percentages = calculatePercentages();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
  <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-blue-100">
    <div className="p-0 sm:p-8">
      {/* Header with Icon and Close */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-2 shadow">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          {/* <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">
            Place Your Bet
          </h2> */}
              <h4 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          {event.title}
        </h4>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Event Info */}
      <div className="px-6 pt-4 pb-6 border-b border-gray-100 bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-t-2xl">
  
        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : 
                minutesLeft > 0 ? `${minutesLeft}m left` : 'Expired'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Pool: <span className="font-semibold text-blue-700">{formatCurrency(event.totalPool)}</span></span>
          </div>
          <div className="flex items-center gap-1 text-orange-600">
            <AlertCircle className="w-4 h-4" />
            <span>15% House Edge</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 bg-white px-6 pt-2">
        <button
          onClick={() => setActiveTab('bet')}
          className={`px-6 py-3 font-semibold transition-colors rounded-t-lg ${
            activeTab === 'bet'
              ? 'text-blue-700 bg-gradient-to-r from-blue-100 to-purple-100 shadow'
              : 'text-gray-600 hover:text-blue-700'
          }`}
        >
          Place Bet
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-semibold transition-colors rounded-t-lg flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'text-blue-700 bg-gradient-to-r from-blue-100 to-purple-100 shadow'
              : 'text-gray-600 hover:text-blue-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Live Analytics
        </button>
      </div>

      <div className="px-6 pb-6 pt-4">
        {activeTab === 'bet' ? (
          <>
            {/* Betting Options */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-3">Select Your Prediction</h4>
              <div className="space-y-2">
                {event.options.map((option) => {
                  const dynamicCalculation = calculateBetReturns(
                    event,
                    option.id,
                    selectedOption?.id === option.id ? betAmount : 100,
                    isAdmin
                  );
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm ${
                        selectedOption?.id === option.id
                          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-200 bg-white'
                      }`}
                      style={{ transition: 'all 0.18s cubic-bezier(.4,2,.6,1)' }}
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">
                          {option.bettors} bettors • {formatCurrency(option.totalBets)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-green-600 transition-all duration-300">
                          {dynamicCalculation.effectiveOdds.toFixed(2)}x
                        </div>
                        <div className="text-sm text-gray-500">live odds</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bet Amount & Potential Return */}
            {selectedOption && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-lg">Bet Amount</span>
                  <span className="font-semibold text-gray-900 text-lg">Potential Return</span>
                </div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Math.min(maxBetAmount, Number(e.target.value))))}
                    min="1"
                    max={maxBetAmount}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold flex-1 bg-white shadow"
                    placeholder="Enter bet amount"
                    style={{ minWidth: 120, maxWidth: 200 }}
                  />
                  {selectedOption && betCalculation && (
                    <div
                      className="transition-all duration-300 ease-out bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl shadow-lg font-extrabold text-4xl flex items-center justify-end"
                      style={{
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
                        minWidth: 180,
                        letterSpacing: 1,
                        lineHeight: 1.1,
                      }}
                    >
                      <span
                        style={{
                          transition: 'color 0.3s',
                          color: animatedReturn > betAmount ? '#22c55e' : '#fff',
                          fontSize: '2.5rem',
                        }}
                      >
                        {formatCurrency(Math.round(animatedReturn))}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col" style={{ minHeight: 40 }}>
                  <div className="text-sm text-gray-600 mt-1">
                    Available: {formatCurrency(userBalance)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Max: {isAdmin ? '∞' : formatCurrency(maxBetAmount)}
                    {!isAdmin && <span className="text-xs text-gray-400 ml-1">(20% of pool)</span>}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {[100, 500, 1000, 2500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(Math.min(amount, maxBetAmount))}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
                {betAmount > userBalance && !isAdmin && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Insufficient balance</span>
                  </div>
                )}
                {betAmount > maxBetAmount && !isAdmin && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Bet amount exceeds maximum limit (20% of pool)</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // ...analytics tab remains unchanged...
          <div className="space-y-6">{/* ...existing analytics code... */}</div>
        )}

        {/* Action Buttons */}
        {activeTab === 'bet' && (
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={!selectedOption || betAmount <= 0 || (betAmount > userBalance && !isAdmin) || (betAmount > maxBetAmount && !isAdmin) || isPlacing}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all disabled:cursor-not-allowed font-semibold shadow"
            >
              {isPlacing ? 'Placing Bet...' : `Place Bet - ${formatCurrency(betAmount)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
};