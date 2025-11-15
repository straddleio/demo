/**
 * HTTP Client for Straddle Demo Backend
 * Calls backend API at http://localhost:3001/api/*
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * Customer API
 */
export interface CreateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  outcome?: 'verified' | 'review' | 'rejected';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  verification_status: string;
  risk_score?: number;
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
  review?: {
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
  };
}

export async function createCustomer(data: CreateCustomerRequest = {}): Promise<Customer> {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCustomer(customerId: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${customerId}`);
}

/**
 * Paykey/Bridge API
 */
export interface CreatePaykeyRequest {
  customer_id: string;
  method: 'plaid' | 'bank_account';
  outcome?: 'active' | 'inactive' | 'rejected';
}

export interface Paykey {
  id: string;
  paykey: string; // Token for charges
  customer_id: string;
  status: string;
  institution?: string | { name: string; logo?: string }; // Support both formats
  account_type?: string;
  last4?: string; // Last 4 digits of account
  balance?: {
    available: number;
    currency: string; // Not 'current'
  };
  ownership?: {
    waldo_confidence?: string;
  };
}

export async function createPaykey(data: CreatePaykeyRequest): Promise<Paykey> {
  const endpoint = data.method === 'plaid'
    ? '/bridge/plaid'
    : '/bridge/bank-account';

  return apiFetch<Paykey>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPaykey(paykeyId: string): Promise<Paykey> {
  return apiFetch<Paykey>(`/paykeys/${paykeyId}`);
}

/**
 * Charge API
 */
export interface CreateChargeRequest {
  paykey: string; // Token, not ID
  amount?: number; // Cents
  description?: string;
  outcome?: 'paid' | 'failed' | 'reversed_insufficient_funds' | 'on_hold_daily_limit' | 'cancelled_for_fraud_risk';
}

export interface Charge {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  paykey: string;
  payment_rail?: string;
  balance_check_result?: string;
  failure_reason?: string;
  status_history?: Array<{
    status: string;
    timestamp: string;
  }>;
}

export async function createCharge(data: CreateChargeRequest): Promise<Charge> {
  return apiFetch<Charge>('/charges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCharge(chargeId: string): Promise<Charge> {
  return apiFetch<Charge>(`/charges/${chargeId}`);
}

/**
 * State API
 */
export interface DemoState {
  customer?: Customer;
  paykey?: Paykey;
  charge?: Charge;
}

export async function getState(): Promise<DemoState> {
  return apiFetch<DemoState>('/state');
}

export async function resetState(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/reset', {
    method: 'POST',
  });
}

/**
 * Health Check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return apiFetch<{ status: string; timestamp: string }>('/health');
}
