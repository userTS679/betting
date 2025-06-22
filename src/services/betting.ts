/**
 * Betting service with accurate return calculations and 15% house edge
 */
import { supabase } from '../lib/supabase';
import { Event, BetOption, Bet } from '../types';

export interface BetCalculation {
  potentialReturn: number;
  potentialProfit: number;
  impliedProbability: number;
  poolShare: number;
  effectiveOdds: number;
  maxBetAmount: number;
  houseEdge: number;
}

/**
 * Calculate potential returns for a bet with 15% house edge
 */
export const calculateBetReturns = (
  event: Event,
  optionId: string,
  betAmount: number,
  isAdmin: boolean = false
): BetCalculation => {
  const option = event.options.find(opt => opt.id === optionId);
  if (!option) {
    throw new Error('Invalid betting option');
  }

  const houseEdge = 0.15; // 15% house edge
  const currentTotalPool = event.totalPool;
  const currentOptionPool = option.totalBets;
  
  // Calculate maximum bet amount (20% of total pool, unlimited for admin)
  const maxBetAmount = isAdmin ? Infinity : Math.max(100, currentTotalPool * 0.20);
  
  if (betAmount > maxBetAmount && !isAdmin) {
    throw new Error(`Maximum bet amount is ₹${maxBetAmount.toFixed(0)}`);
  }

  // New pool sizes after this bet
  const newTotalPool = currentTotalPool + betAmount;
  const newOptionPool = currentOptionPool + betAmount;
  
  // Calculate potential returns
  let potentialReturn: number;
  let effectiveOdds: number;

  if (newTotalPool === betAmount) {
    // First bet on the entire event - user gets their money back
    effectiveOdds = 1.0;
    potentialReturn = betAmount;
  } else {
    // Calculate based on pool distribution after house edge
    const netPool = newTotalPool * (1 - houseEdge); // Pool after house takes 15%
    const otherOptionsPool = newTotalPool - newOptionPool;
    
    if (otherOptionsPool === 0) {
      // Only this option has bets - user gets their money back
      effectiveOdds = 1.0;
      potentialReturn = betAmount;
    } else {
      // User's share of the winning pool
      const userShareOfOption = betAmount / newOptionPool;
      
      // If this option wins, user gets:
      // 1. Their original bet back
      // 2. Their proportional share of the losing options' pool (after house edge)
      const userWinnings = betAmount + (userShareOfOption * otherOptionsPool * (1 - houseEdge));
      
      potentialReturn = userWinnings;
      effectiveOdds = potentialReturn / betAmount;
    }
  }

  // Ensure minimum return (user gets at least their bet back)
  potentialReturn = Math.max(potentialReturn, betAmount);
  effectiveOdds = Math.max(effectiveOdds, 1.0);

  // Calculate other metrics
  const potentialProfit = potentialReturn - betAmount;
  const impliedProbability = 1 / effectiveOdds;
  const poolShare = newOptionPool / newTotalPool;

  return {
    potentialReturn: Math.round(potentialReturn * 100) / 100,
    potentialProfit: Math.round(potentialProfit * 100) / 100,
    impliedProbability: Math.round(impliedProbability * 10000) / 100, // Percentage
    poolShare: Math.round(poolShare * 10000) / 100, // Percentage
    effectiveOdds: Math.round(effectiveOdds * 100) / 100,
    maxBetAmount: isAdmin ? Infinity : Math.round(maxBetAmount),
    houseEdge: houseEdge * 100 // Percentage
  };
};

/**
 * Place a bet with proper database updates and house edge calculation
 */
export const placeBet = async (
  userId: string,
  eventId: string,
  optionId: string,
  amount: number
): Promise<{ bet: any; transaction: any }> => {
  // Check if user is admin
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('balance, total_bets, is_admin')
    .eq('id', userId)
    .single();

  if (userError) throw new Error('Failed to fetch user data');
  if (user.balance < amount) throw new Error('Insufficient balance');

  // Get event data to check bet limits
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('total_pool')
    .eq('id', eventId)
    .single();

  if (eventError) throw new Error('Failed to fetch event data');

  // Check bet limits for non-admin users
  if (!user.is_admin) {
    const maxBetAmount = Math.max(100, eventData.total_pool * 0.20);
    if (amount > maxBetAmount) {
      throw new Error(`Maximum bet amount is ₹${maxBetAmount.toFixed(0)} (20% of current pool)`);
    }
  }

  // Create the bet record
  const { data: bet, error: betError } = await supabase
    .from('bets')
    .insert({
      event_id: eventId,
      user_id: userId,
      option_id: optionId,
      amount: amount,
      status: 'active'
    })
    .select()
    .single();

  if (betError) throw new Error('Failed to place bet');

  // Update user balance and stats
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      balance: user.balance - amount,
      total_bets: user.total_bets + 1
    })
    .eq('id', userId);

  if (userUpdateError) throw new Error('Failed to update user balance');

  // Create transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'bet_placed',
      amount: -amount,
      description: `Bet placed on event`,
      status: 'completed',
      event_id: eventId,
      bet_id: bet.id
    })
    .select()
    .single();

  if (transactionError) throw new Error('Failed to create transaction');

  // Update event and option statistics
  await updateEventStatistics(eventId, optionId, amount);

  return { bet, transaction };
};

/**
 * Update event and option statistics
 */
const updateEventStatistics = async (
  eventId: string,
  optionId: string,
  betAmount: number
) => {
  // Get current event statistics
  const { data: event, error: eventFetchError } = await supabase
    .from('events')
    .select('total_pool, participant_count')
    .eq('id', eventId)
    .single();

  if (eventFetchError) throw new Error('Failed to fetch event statistics');

  // Update event statistics
  const { error: eventError } = await supabase
    .from('events')
    .update({
      total_pool: event.total_pool + betAmount,
      participant_count: event.participant_count + 1
    })
    .eq('id', eventId);

  if (eventError) throw new Error('Failed to update event statistics');

  // Get current option statistics
  const { data: option, error: optionFetchError } = await supabase
    .from('bet_options')
    .select('total_bets, bettors')
    .eq('id', optionId)
    .single();

  if (optionFetchError) throw new Error('Failed to fetch option statistics');

  // Update option statistics
  const { error: optionError } = await supabase
    .from('bet_options')
    .update({
      total_bets: option.total_bets + betAmount,
      bettors: option.bettors + 1
    })
    .eq('id', optionId);

  if (optionError) throw new Error('Failed to update option statistics');
};

/**
 * Resolve a bet when event concludes with 15% house edge
 */
export const resolveBet = async (
  betId: string,
  isWinner: boolean,
  totalEventPool: number,
  winningOptionPool: number,
  userBetAmount: number
): Promise<void> => {
  const status = isWinner ? 'won' : 'lost';
  let payout = 0;

  if (isWinner) {
    const houseEdge = 0.15;
    const netPool = totalEventPool * (1 - houseEdge);
    const losingPool = totalEventPool - winningOptionPool;
    const userShare = userBetAmount / winningOptionPool;
    
    // User gets their bet back + proportional share of losing pool (after house edge)
    payout = userBetAmount + (userShare * losingPool * (1 - houseEdge));
    payout = Math.max(payout, userBetAmount); // Ensure at least bet amount is returned
  }
  
  const { data: bet, error: betError } = await supabase
    .from('bets')
    .update({
      status,
      payout: isWinner ? payout : null,
      resolved_at: new Date().toISOString()
    })
    .eq('id', betId)
    .select('user_id, amount')
    .single();

  if (betError) throw new Error('Failed to resolve bet');

  if (isWinner && payout) {
    // Get current user balance and winnings
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('balance, total_winnings')
      .eq('id', bet.user_id)
      .single();

    if (userFetchError) throw new Error('Failed to fetch user data');

    // Update user balance and winnings
    const { error: userError } = await supabase
      .from('users')
      .update({
        balance: user.balance + payout,
        total_winnings: user.total_winnings + (payout - bet.amount)
      })
      .eq('id', bet.user_id);

    if (userError) throw new Error('Failed to update user winnings');

    // Create winning transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: bet.user_id,
        type: 'bet_won',
        amount: payout,
        description: `Bet won - payout received`,
        status: 'completed',
        bet_id: betId
      });
  } else {
    // Create losing transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: bet.user_id,
        type: 'bet_lost',
        amount: -bet.amount,
        description: `Bet lost`,
        status: 'completed',
        bet_id: betId
      });
  }
};

/**
 * Get user's betting statistics
 */
export const getUserBettingStats = async (userId: string) => {
  const { data: stats, error } = await supabase
    .from('users')
    .select('total_bets, total_winnings, balance')
    .eq('id', userId)
    .single();

  if (error) throw new Error('Failed to fetch user stats');

  // Get additional calculated stats
  const { data: bets } = await supabase
    .from('bets')
    .select('amount, status, payout')
    .eq('user_id', userId);

  const activeBets = bets?.filter(bet => bet.status === 'active') || [];
  const wonBets = bets?.filter(bet => bet.status === 'won') || [];
  const lostBets = bets?.filter(bet => bet.status === 'lost') || [];

  const totalBetAmount = bets?.reduce((sum, bet) => sum + bet.amount, 0) || 0;
  const totalActiveBetAmount = activeBets.reduce((sum, bet) => sum + bet.amount, 0);
  const winRate = stats.total_bets > 0 ? (wonBets.length / stats.total_bets) * 100 : 0;
  const averageBetSize = stats.total_bets > 0 ? totalBetAmount / stats.total_bets : 0;
  const netProfit = stats.total_winnings - totalBetAmount;

  return {
    ...stats,
    activeBetsCount: activeBets.length,
    totalActiveBetAmount,
    winRate: Math.round(winRate * 100) / 100,
    averageBetSize: Math.round(averageBetSize * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    wonBetsCount: wonBets.length,
    lostBetsCount: lostBets.length
  };
};

/**
 * Get betting history for time-based analytics
 */
export const getBettingHistory = async (eventId: string) => {
  const { data: bets, error } = await supabase
    .from('bets')
    .select(`
      amount,
      option_id,
      placed_at,
      bet_options!inner(label)
    `)
    .eq('event_id', eventId)
    .order('placed_at', { ascending: true });

  if (error) throw new Error('Failed to fetch betting history');

  return bets || [];
};