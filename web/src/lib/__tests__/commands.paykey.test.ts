import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeCommand } from '../commands';
import * as api from '../api';
import type { Customer, Paykey, PaykeyReview } from '../api';
import { useDemoStore } from '../state';

// Mock the API module
vi.mock('../api');

describe('handleCreatePaykey with review data', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store state with a customer
    const mockCustomer: Partial<Customer> = {
      id: 'cust_123',
      name: 'Test Customer',
    };
    // Use individual setters to work with the mocked store
    useDemoStore.getState().setCustomer(mockCustomer as Customer);
    useDemoStore.getState().setPaykey(null);
    useDemoStore.getState().setCharge(null);
    useDemoStore.getState().clearGeneratorData();
  });

  it('should create paykey with review data included in response', async () => {
    // Server now fetches review data internally and includes it in the response
    const mockReview: Partial<PaykeyReview> = {
      verification_details: {
        id: 'vd_123',
        decision: 'accept',
        created_at: '2025-11-16T00:00:00Z',
        updated_at: '2025-11-16T00:00:00Z',
        messages: {},
        breakdown: {
          account_validation: {
            decision: 'accept',
            codes: [],
            reason: null,
          },
        },
      },
    };

    const mockPaykey: Partial<Paykey> = {
      id: 'pk_123',
      status: 'active',
      paykey: 'token_123',
      source: 'bank_account' as const,
      bank_data: {
        account_number: '****1234',
        account_type: 'checking',
        routing_number: '021000021',
      },
      review: mockReview as PaykeyReview,
    };

    // Mock API call - server returns paykey with review data already attached
    vi.mocked(api.createPaykey).mockResolvedValueOnce(mockPaykey as Paykey);

    // Execute the command
    const result = await executeCommand('/create-paykey bank --outcome active');

    // Log result for debugging
    if (!result.success) {
      console.log('Command failed:', result.message);
    }

    // Verify only createPaykey was called (review fetch happens server-side)
    expect(api.createPaykey).toHaveBeenCalledTimes(1);

    // Verify generator modal data was set
    const generatorData = useDemoStore.getState().generatorData;
    expect(generatorData).toBeDefined();
    expect(generatorData?.customerName).toBe('Test Customer');
    expect(generatorData?.paykeyToken).toBe('token_123');
    expect(generatorData?.accountLast4).toBe('1234');
    expect(generatorData?.routingNumber).toBe('021000021');
    expect(generatorData?.waldoData).toBeUndefined(); // Bank account method has no WALDO

    // Verify modal is shown
    expect(useDemoStore.getState().showPaykeyGenerator).toBe(true);

    // Verify success result
    expect(result.success).toBe(true);
  });

  it('should handle Plaid paykey creation with WALDO data', async () => {
    const mockReview: Partial<PaykeyReview> = {
      verification_details: {
        id: 'vd_456',
        decision: 'accept',
        created_at: '2025-11-16T00:00:00Z',
        updated_at: '2025-11-16T00:00:00Z',
        messages: {},
        breakdown: {
          account_validation: {
            decision: 'accept',
            codes: [],
            reason: null,
          },
          name_match: {
            decision: 'accept',
            codes: [],
            correlation_score: 95,
            customer_name: 'Test Customer',
            matched_name: 'T. Customer',
            names_on_account: ['Test Customer', 'T. Customer'],
            reason: null,
          },
        },
      },
    };

    const mockPaykey: Partial<Paykey> = {
      id: 'pk_456',
      status: 'active',
      paykey: 'token_456',
      source: 'plaid' as const,
      bank_data: {
        account_number: '****5678',
        account_type: 'checking',
        routing_number: '021000022',
      },
      review: mockReview as PaykeyReview,
    };

    // Mock paykey creation
    vi.mocked(api.createPaykey).mockResolvedValueOnce(mockPaykey as Paykey);

    // Execute the command
    const result = await executeCommand('/create-paykey plaid --outcome active');

    // Verify generator modal data was set with WALDO data
    const generatorData = useDemoStore.getState().generatorData;
    expect(generatorData).toBeDefined();
    expect(generatorData?.customerName).toBe('Test Customer');
    expect(generatorData?.paykeyToken).toBe('token_456');
    expect(generatorData?.accountLast4).toBe('5678');
    expect(generatorData?.routingNumber).toBe('021000022');
    expect(generatorData?.waldoData).toBeDefined();
    expect(generatorData?.waldoData?.correlationScore).toBe(95);
    expect(generatorData?.waldoData?.matchedName).toBe('T. Customer');
    expect(generatorData?.waldoData?.namesOnAccount).toEqual(['Test Customer', 'T. Customer']);

    // Verify modal is shown
    expect(useDemoStore.getState().showPaykeyGenerator).toBe(true);

    // Verify success result
    expect(result.success).toBe(true);
  });

  it('should handle Plaid paykey creation without WALDO data', async () => {
    const mockReview: Partial<PaykeyReview> = {
      verification_details: {
        id: 'vd_789',
        decision: 'accept',
        created_at: '2025-11-16T00:00:00Z',
        updated_at: '2025-11-16T00:00:00Z',
        messages: {},
        breakdown: {
          account_validation: {
            decision: 'accept',
            codes: [],
            reason: null,
          },
          // No name_match data
        },
      },
    };

    const mockPaykey: Partial<Paykey> = {
      id: 'pk_789',
      status: 'active',
      paykey: 'token_789',
      source: 'plaid' as const,
      bank_data: {
        account_number: '****9999',
        account_type: 'savings',
        routing_number: '021000023',
      },
      review: mockReview as PaykeyReview,
    };

    // Mock paykey creation
    vi.mocked(api.createPaykey).mockResolvedValueOnce(mockPaykey as Paykey);

    // Execute the command
    const result = await executeCommand('/create-paykey plaid --outcome active');

    // Verify generator modal data was set WITHOUT WALDO data
    const generatorData = useDemoStore.getState().generatorData;
    expect(generatorData).toBeDefined();
    expect(generatorData?.waldoData).toBeUndefined();

    // Verify success result
    expect(result.success).toBe(true);
  });

  it('should skip generator modal when running /demo command', async () => {
    const mockPaykey: Partial<Paykey> = {
      id: 'pk_demo',
      status: 'active',
      paykey: 'token_demo',
      source: 'plaid' as const,
      bank_data: {
        account_number: '****1234',
        account_type: 'checking',
        routing_number: '021000021',
      },
    };

    // Mock API calls
    vi.mocked(api.createCustomer).mockResolvedValueOnce({
      id: 'cust_demo',
      name: 'Demo User',
    } as Customer);
    vi.mocked(api.createPaykey).mockResolvedValueOnce(mockPaykey as Paykey);
    vi.mocked(api.createCharge).mockResolvedValueOnce({
      id: 'ch_demo',
      status: 'paid',
      amount: 5000,
    } as any);

    // Execute the demo command
    const result = await executeCommand('/demo');

    if (!result.success) {
      console.error('Demo command failed:', result.message);
    }

    // Verify success
    expect(result.success).toBe(true);

    // Verify generator modal was NOT shown
    expect(useDemoStore.getState().showPaykeyGenerator).toBe(false);
    expect(useDemoStore.getState().generatorData).toBeNull();
  });
});
