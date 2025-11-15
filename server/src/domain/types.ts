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
  address?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  compliance_profile?: {
    ssn?: string; // Masked format: ***-**-****
    dob?: string; // Masked format: ****-**-**
  };
  review?: CustomerReview;
}

export interface CustomerReview {
  review_id: string;
  decision: string;
  messages?: Record<string, string>;
  breakdown: {
    email?: {
      decision: string;
      codes?: string[];
      risk_score?: number;
      correlation_score?: number;
      correlation?: string;
    };
    phone?: {
      decision: string;
      codes?: string[];
      risk_score?: number;
      correlation_score?: number;
      correlation?: string;
    };
    fraud?: {
      decision: string;
      codes?: string[];
      risk_score?: number;
    };
    synthetic?: {
      decision: string;
      codes?: string[];
      risk_score?: number;
    };
  };
  kyc?: {
    decision: string;
    codes?: string[];
    validations?: {
      address?: boolean;
      city?: boolean;
      dob?: boolean;
      email?: boolean;
      first_name?: boolean;
      last_name?: boolean;
      phone?: boolean;
      ssn?: boolean;
      state?: boolean;
      zip?: boolean;
    };
  };
  reputation?: {
    decision: string;
    codes?: string[];
    risk_score?: number;
    insights?: {
      ach_fraud_transactions_count?: number;
      ach_fraud_transactions_total_amount?: number;
      ach_returned_transactions_count?: number;
      ach_returned_transactions_total_amount?: number;
      card_fraud_transactions_count?: number;
      card_fraud_transactions_total_amount?: number;
      card_disputed_transactions_count?: number;
      card_disputed_transactions_total_amount?: number;
      accounts_count?: number;
      accounts_active_count?: number;
      accounts_fraud_count?: number;
      applications_count?: number;
      [key: string]: any;
    };
  };
  network_alerts?: {
    decision: string;
    codes?: string[];
    alerts?: any[];
  };
  watch_list?: {
    decision: string;
    codes?: string[];
    matches?: Array<{
      correlation: string;
      list_name: string;
      match_fields: string[];
      urls: string[];
    }>;
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
  message?: string;
  source?: string;
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
