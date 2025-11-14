/**
 * TypeScript types for Straddle API responses and demo state
 */

export interface DemoCustomer {
  id: string;
  name: string;
  type: 'individual' | 'business';
  email?: string;
  phone?: string;
  verification_status?: string;
  risk_score?: number;
  created_at: string;
  review?: CustomerReview;
}

export interface CustomerReview {
  status: string;
  decision?: string;
  review_reasons?: string[];
  identity?: {
    confidence?: number;
  };
}

export interface DemoPaykey {
  id: string;
  paykey: string; // The actual paykey token to use in charges
  customer_id: string;
  status: string;
  institution?: {
    name: string;
    logo?: string;
  };
  ownership_verified?: boolean;
  balance?: {
    available: number;
    currency: string;
  };
  account_type?: string;
  linked_at: string;
}

export interface DemoCharge {
  id: string;
  customer_id?: string;
  paykey: string;
  amount: number;
  currency: string;
  status: string;
  payment_date: string;
  created_at: string;
  scheduled_at?: string;
  completed_at?: string;
  failure_reason?: string;
  status_history?: ChargeStatusHistory[];
  sandbox_outcome?: string;
}

export interface ChargeStatusHistory {
  status: string;
  timestamp: string;
  reason?: string;
}

/**
 * Sandbox outcome options
 */
export type CustomerOutcome = 'verified' | 'review' | 'rejected';
export type PaykeyOutcome = 'active' | 'inactive' | 'rejected';
export type ChargeOutcome =
  | 'paid'
  | 'failed'
  | 'reversed_insufficient_funds'
  | 'on_hold_daily_limit'
  | 'cancelled_for_fraud_risk';

export const SANDBOX_OUTCOMES = {
  customer: ['verified', 'review', 'rejected'] as CustomerOutcome[],
  paykey: ['active', 'inactive', 'rejected'] as PaykeyOutcome[],
  charge: [
    'paid',
    'failed',
    'reversed_insufficient_funds',
    'on_hold_daily_limit',
    'cancelled_for_fraud_risk',
  ] as ChargeOutcome[],
} as const;
