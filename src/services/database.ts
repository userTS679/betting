import { supabase } from '../lib/supabase';
import { Event, User, Bet, Transaction, PaymentMethod, BetOption } from '../types';

// User operations
export const createUser = async (userData: {
  id: string;
  name: string;
  isAdmin?: boolean;
}) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userData.id,
      name: userData.name,
      is_admin: userData.isAdmin || false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserBalance = async (userId: string, newBalance: number) => {
  const { data, error } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Event operations
export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      bet_options (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createEvent = async (eventData: {
  title: string;
  description: string;
  category: string;
  createdBy: string;
  expiresAt: string;
  options: Array<{ label: string; odds: number }>;
}) => {
  // Create event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      created_by: eventData.createdBy,
      expires_at: eventData.expiresAt
    })
    .select()
    .single();

  if (eventError) throw eventError;

  // Create bet options
  const optionsData = eventData.options.map(option => ({
    event_id: event.id,
    label: option.label,
    odds: option.odds
  }));

  const { data: options, error: optionsError } = await supabase
    .from('bet_options')
    .insert(optionsData)
    .select();

  if (optionsError) throw optionsError;

  return { ...event, bet_options: options };
};

// Bet operations
export const placeBet = async (betData: {
  eventId: string;
  userId: string;
  optionId: string;
  amount: number;
}) => {
  const { data, error } = await supabase
    .from('bets')
    .insert({
      event_id: betData.eventId,
      user_id: betData.userId,
      option_id: betData.optionId,
      amount: betData.amount
    })
    .select()
    .single();

  if (error) throw error;

    // Update the totalPool in the events table
  const { error: updateError } = await supabase
    .rpc('increment_event_total_pool', {
      event_id_input: betData.eventId,
      amount_input: betData.amount
    });

  if (updateError) throw updateError;
  
  return data;
};

export const getUserBets = async (userId: string) => {
  const { data, error } = await supabase
    .from('bets')
    .select(`
      *,
      events (title),
      bet_options (label)
    `)
    .eq('user_id', userId)
    .order('placed_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Transaction operations
export const createTransaction = async (transactionData: {
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet_placed' | 'bet_won' | 'bet_lost' | 'refund';
  amount: number;
  description: string;
  paymentMethod?: string;
  transactionId?: string;
  eventId?: string;
  betId?: string;
}) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      payment_method: transactionData.paymentMethod,
      transaction_id: transactionData.transactionId,
      event_id: transactionData.eventId,
      bet_id: transactionData.betId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Payment method operations
export const getUserPaymentMethods = async (userId: string) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPaymentMethod = async (paymentMethodData: {
  userId: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet';
  name: string;
  details: string;
  isDefault?: boolean;
}) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: paymentMethodData.userId,
      type: paymentMethodData.type,
      name: paymentMethodData.name,
      details: paymentMethodData.details,
      is_default: paymentMethodData.isDefault || false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update event statistics
export const updateEventStats = async (eventId: string, optionId: string, betAmount: number) => {
  // Update event total pool and participant count
  const { error: eventError } = await supabase.rpc('increment_event_stats', {
    event_id: eventId,
    bet_amount: betAmount
  });

  if (eventError) {
    // Fallback to manual update if RPC doesn't exist
    const { data: event } = await supabase
      .from('events')
      .select('total_pool, participant_count')
      .eq('id', eventId)
      .single();

    if (event) {
      await supabase
        .from('events')
        .update({
          total_pool: event.total_pool + betAmount,
          participant_count: event.participant_count + 1
        })
        .eq('id', eventId);
    }
  }

  // Update bet option stats
  const { data: option } = await supabase
    .from('bet_options')
    .select('total_bets, bettors')
    .eq('id', optionId)
    .single();

  if (option) {
    await supabase
      .from('bet_options')
      .update({
        total_bets: option.total_bets + betAmount,
        bettors: option.bettors + 1
      })
      .eq('id', optionId);
  }
};