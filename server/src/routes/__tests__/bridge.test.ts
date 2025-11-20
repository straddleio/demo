import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Set environment variables before importing config
process.env.STRADDLE_API_KEY = 'test_api_key';

// Define mock functions that need to be shared
const mockSetPaykey = jest.fn();

// Mock dependencies BEFORE importing modules that use them
jest.mock('../../config.js', () => ({
  config: {
    straddle: {
      apiKey: 'test_api_key',
      environment: 'sandbox' as const,
    },
    server: {
      port: 3001,
      nodeEnv: 'test',
      corsOrigin: 'http://localhost:5173',
    },
    webhook: {
      secret: '',
      ngrokUrl: '',
    },
    plaid: {
      processorToken: 'processor-sandbox-test-token',
    },
  },
}));

jest.mock('../../sdk.js', () => ({
  default: {
    bridge: {
      link: {
        bankAccount: jest.fn(),
        plaid: jest.fn(),
      },
      initialize: jest.fn(),
    },
    paykeys: {
      review: {
        get: jest.fn(),
      },
    },
  },
}));

jest.mock('../../domain/state.js', () => ({
  stateManager: {
    setPaykey: mockSetPaykey,
  },
}));

jest.mock('../../domain/log-stream.js', () => ({
  addLogEntry: jest.fn(),
  parseStraddleError: jest.fn((error: unknown) => {
    if (error && typeof error === 'object' && 'error' in error) {
      return (error as Record<string, unknown>).error || null;
    }
    return null;
  }),
}));

jest.mock('../../domain/logs.js', () => ({
  logStraddleCall: jest.fn(),
}));

jest.mock('../../lib/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Import AFTER mocks are set up
import bridgeRouter from '../bridge.js';
import straddleClient from '../../sdk.js';

describe('Bridge Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.requestId = 'test-request-id';
      req.correlationId = 'test-correlation-id';
      next();
    });
    app.use('/api/bridge', bridgeRouter);
    jest.clearAllMocks();
    mockSetPaykey.mockClear();
  });

  describe('POST /api/bridge/bank-account', () => {
    const mockPaykeyResponse = {
      data: {
        id: 'paykey_123',
        paykey: '758c519d.02.2c16f91',
        customer_id: 'cust_123',
        status: 'active',
        label: 'Chase Bank ****6789',
        institution_name: 'Chase Bank',
        source: 'bank_account',
        balance: {
          status: 'completed',
          account_balance: 150000,
          updated_at: '2025-11-19T10:00:00Z',
        },
        bank_data: {
          account_number: '****6789',
          account_type: 'checking',
          routing_number: '021000021',
        },
        created_at: '2025-11-19T10:00:00Z',
        updated_at: '2025-11-19T10:00:00Z',
      },
    };

    const mockReviewResponse = {
      data: {
        paykey_details: {
          id: 'paykey_123',
          config: {
            review_enabled: true,
          },
        },
        verification_details: {
          decision: 'approved',
          breakdown: {
            account_validation: {
              codes: ['VALID_ACCOUNT'],
              decision: 'approved',
              reason: 'Account verified',
            },
            name_match: {
              correlation_score: 0.95,
              customer_name: 'John Doe',
              matched_name: 'John Doe',
              names_on_account: ['John Doe'],
            },
          },
        },
      },
    };

    describe('Happy Path', () => {
      it('should create paykey with default test data', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'paykey_123');
        expect(response.body).toHaveProperty('paykey', '758c519d.02.2c16f91');
        expect(response.body).toHaveProperty('customer_id', 'cust_123');
        expect(response.body).toHaveProperty('status', 'active');
        expect(response.body).toHaveProperty('institution_name', 'Chase Bank');
        expect(response.body).toHaveProperty('source', 'bank_account');

        // Verify default values were used
        expect(straddleClient.bridge.link.bankAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_id: 'cust_123',
            account_number: '123456789',
            routing_number: '021000021',
            account_type: 'checking',
          })
        );
      });

      it('should create paykey with custom account and routing numbers', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
          account_number: '987654321',
          routing_number: '021000089',
          account_type: 'savings',
        });

        expect(response.status).toBe(201);
        expect(straddleClient.bridge.link.bankAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_id: 'cust_123',
            account_number: '987654321',
            routing_number: '021000089',
            account_type: 'savings',
          })
        );
      });

      it('should include balance data in response', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body.balance).toEqual({
          status: 'completed',
          account_balance: 150000,
          updated_at: '2025-11-19T10:00:00Z',
        });
      });

      it('should include bank_data in response', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body.bank_data).toEqual({
          account_number: '****6789',
          account_type: 'checking',
          routing_number: '021000021',
        });
      });

      it('should include review data in response', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body.review).toEqual(mockReviewResponse.data);
        expect(straddleClient.paykeys.review.get).toHaveBeenCalledWith('paykey_123');
      });
    });

    describe('Sandbox Outcomes', () => {
      it('should create paykey with standard outcome', async () => {
        const standardPaykeyResponse = {
          data: {
            ...mockPaykeyResponse.data,
            status: 'pending',
          },
        };

        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(standardPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
          outcome: 'standard',
        });

        expect(response.status).toBe(201);
        expect(straddleClient.bridge.link.bankAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'standard',
            },
          })
        );
      });

      it('should create paykey with active outcome', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
          outcome: 'active',
        });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('active');
        expect(straddleClient.bridge.link.bankAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'active',
            },
          })
        );
      });

      it('should create paykey with review outcome', async () => {
        const reviewPaykeyResponse = {
          data: {
            ...mockPaykeyResponse.data,
            status: 'review',
          },
        };

        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(reviewPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
          outcome: 'review',
        });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('review');
        expect(straddleClient.bridge.link.bankAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'review',
            },
          })
        );
      });

      it('should create paykey with rejected outcome', async () => {
        const rejectedPaykeyResponse = {
          data: {
            ...mockPaykeyResponse.data,
            status: 'rejected',
          },
        };

        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(rejectedPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
          outcome: 'rejected',
        });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('rejected');
        expect(straddleClient.bridge.link.bankAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'rejected',
            },
          })
        );
      });

      it('should not include config when outcome is not provided', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(straddleClient.bridge.link.bankAccount).toHaveBeenCalledWith(
          expect.not.objectContaining({
            config: expect.anything(),
          })
        );
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when customer_id is missing', async () => {
        const response = await request(app).post('/api/bridge/bank-account').send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'customer_id is required');
      });

      it('should return 400 when customer_id is not a string', async () => {
        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 12345,
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'customer_id is required');
      });

      it('should return 400 for invalid outcome', async () => {
        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
          outcome: 'invalid_outcome',
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid outcome');
        expect(response.body.error).toContain('standard');
        expect(response.body.error).toContain('active');
        expect(response.body.error).toContain('review');
        expect(response.body.error).toContain('rejected');
      });

      it('should reject "inactive" as invalid outcome', async () => {
        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
          outcome: 'inactive',
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid outcome');
      });
    });

    describe('Review Data Handling', () => {
      it('should continue without review data if review fetch fails', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(mockPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockRejectedValue(new Error('Review not found'));

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'paykey_123');
        expect(response.body.review).toBeUndefined();
      });

      it('should handle missing balance data gracefully', async () => {
        const paykeyWithoutBalance = {
          data: {
            ...mockPaykeyResponse.data,
            balance: undefined,
          },
        };

        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(paykeyWithoutBalance as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body.balance).toBeUndefined();
      });

      it('should handle missing bank_data gracefully', async () => {
        const paykeyWithoutBankData = {
          data: {
            ...mockPaykeyResponse.data,
            bank_data: undefined,
          },
        };

        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(paykeyWithoutBankData as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body.bank_data).toBeUndefined();
      });

      it('should use "Unknown Bank" when institution_name is missing', async () => {
        const paykeyWithoutInstitution = {
          data: {
            ...mockPaykeyResponse.data,
            institution_name: undefined,
          },
        };

        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(paykeyWithoutInstitution as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body.institution_name).toBe('Unknown Bank');
      });

      it('should use "bank_account" as default source', async () => {
        const paykeyWithoutSource = {
          data: {
            ...mockPaykeyResponse.data,
            source: undefined,
          },
        };

        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockResolvedValue(paykeyWithoutSource as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(response.body.source).toBe('bank_account');
      });
    });

    describe('Error Handling', () => {
      it('should handle Straddle SDK errors', async () => {
        const mockError = {
          error: {
            type: 'invalid_request',
            code: 'INVALID_CUSTOMER',
            message: 'Customer not found',
          },
          status: 404,
        };

        jest.spyOn(straddleClient.bridge.link, 'bankAccount').mockRejectedValue(mockError as any);

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_invalid',
        });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Customer not found');
      });

      it('should handle generic errors', async () => {
        jest
          .spyOn(straddleClient.bridge.link, 'bankAccount')
          .mockRejectedValue(new Error('Network error'));

        const response = await request(app).post('/api/bridge/bank-account').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('POST /api/bridge/plaid', () => {
    const mockPlaidPaykeyResponse = {
      data: {
        id: 'paykey_plaid_123',
        paykey: '758c519d.03.plaid123',
        customer_id: 'cust_123',
        status: 'active',
        label: 'Bank of America ****4567',
        institution_name: 'Bank of America',
        source: 'plaid',
        balance: {
          status: 'completed',
          account_balance: 250000,
          updated_at: '2025-11-19T10:00:00Z',
        },
        bank_data: {
          account_number: '****4567',
          account_type: 'checking',
          routing_number: '021200339',
        },
        created_at: '2025-11-19T10:00:00Z',
        updated_at: '2025-11-19T10:00:00Z',
      },
    };

    const mockReviewResponse = {
      data: {
        paykey_details: {
          id: 'paykey_plaid_123',
          config: {
            review_enabled: true,
          },
        },
        verification_details: {
          decision: 'approved',
          breakdown: {
            account_validation: {
              codes: ['VALID_ACCOUNT'],
              decision: 'approved',
              reason: 'Account verified via Plaid',
            },
            name_match: {
              correlation_score: 0.98,
              customer_name: 'Jane Smith',
              matched_name: 'Jane Smith',
              names_on_account: ['Jane Smith'],
            },
          },
        },
      },
    };

    describe('Happy Path', () => {
      it('should create paykey with provided plaid_token', async () => {
        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(mockPlaidPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'paykey_plaid_123');
        expect(response.body).toHaveProperty('paykey', '758c519d.03.plaid123');
        expect(response.body).toHaveProperty('source', 'plaid');
        expect(straddleClient.bridge.link.plaid).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_id: 'cust_123',
            plaid_token: 'processor-sandbox-custom-token',
          })
        );
      });

      it('should use env variable PLAID_PROCESSOR_TOKEN as fallback', async () => {
        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(mockPlaidPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(201);
        expect(straddleClient.bridge.link.plaid).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_id: 'cust_123',
            plaid_token: expect.stringMatching(/^processor-sandbox-/), // From mocked config or generated
          })
        );
      });

      it('should include review data in response', async () => {
        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(mockPlaidPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(201);
        expect(response.body.review).toEqual(mockReviewResponse.data);
        expect(straddleClient.paykeys.review.get).toHaveBeenCalledWith('paykey_plaid_123');
      });

      it('should include balance data in response', async () => {
        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(mockPlaidPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(201);
        expect(response.body.balance).toEqual({
          status: 'completed',
          account_balance: 250000,
          updated_at: '2025-11-19T10:00:00Z',
        });
      });
    });

    describe('Sandbox Outcomes', () => {
      it('should create paykey with standard outcome', async () => {
        const standardPaykeyResponse = {
          data: {
            ...mockPlaidPaykeyResponse.data,
            status: 'pending',
          },
        };

        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(standardPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
          outcome: 'standard',
        });

        expect(response.status).toBe(201);
        expect(straddleClient.bridge.link.plaid).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'standard',
            },
          })
        );
      });

      it('should create paykey with active outcome', async () => {
        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(mockPlaidPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
          outcome: 'active',
        });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('active');
        expect(straddleClient.bridge.link.plaid).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'active',
            },
          })
        );
      });

      it('should create paykey with review outcome', async () => {
        const reviewPaykeyResponse = {
          data: {
            ...mockPlaidPaykeyResponse.data,
            status: 'review',
          },
        };

        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(reviewPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
          outcome: 'review',
        });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('review');
        expect(straddleClient.bridge.link.plaid).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'review',
            },
          })
        );
      });

      it('should create paykey with rejected outcome', async () => {
        const rejectedPaykeyResponse = {
          data: {
            ...mockPlaidPaykeyResponse.data,
            status: 'rejected',
          },
        };

        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(rejectedPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
          outcome: 'rejected',
        });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('rejected');
        expect(straddleClient.bridge.link.plaid).toHaveBeenCalledWith(
          expect.objectContaining({
            config: {
              sandbox_outcome: 'rejected',
            },
          })
        );
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when customer_id is missing', async () => {
        const response = await request(app).post('/api/bridge/plaid').send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'customer_id is required');
      });

      it('should return 400 when customer_id is not a string', async () => {
        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 12345,
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'customer_id is required');
      });

      it('should return 400 when no plaid_token provided and no env variable set', async () => {
        // Temporarily override config to have empty processor token
        const { config } = await import('../../config.js');
        const originalToken = config.plaid.processorToken;
        (config.plaid as any).processorToken = '';

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('plaid_token must be provided');
        expect(response.body.error).toContain('PLAID_PROCESSOR_TOKEN must be set');

        // Restore
        (config.plaid as any).processorToken = originalToken;
      });

      it('should return 400 for invalid outcome', async () => {
        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
          outcome: 'invalid_outcome',
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid outcome');
        expect(response.body.error).toContain('standard');
        expect(response.body.error).toContain('active');
        expect(response.body.error).toContain('review');
        expect(response.body.error).toContain('rejected');
      });

      it('should reject "inactive" as invalid outcome', async () => {
        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
          outcome: 'inactive',
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid outcome');
      });
    });

    describe('Review Data Handling', () => {
      it('should continue without review data if review fetch fails', async () => {
        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(mockPlaidPaykeyResponse as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockRejectedValue(new Error('Review not found'));

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'paykey_plaid_123');
        expect(response.body.review).toBeUndefined();
      });

      it('should handle missing balance data gracefully', async () => {
        const paykeyWithoutBalance = {
          data: {
            ...mockPlaidPaykeyResponse.data,
            balance: undefined,
          },
        };

        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(paykeyWithoutBalance as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(201);
        expect(response.body.balance).toBeUndefined();
      });

      it('should use "Unknown Bank" when institution_name is missing', async () => {
        const paykeyWithoutInstitution = {
          data: {
            ...mockPlaidPaykeyResponse.data,
            institution_name: undefined,
          },
        };

        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(paykeyWithoutInstitution as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(201);
        expect(response.body.institution_name).toBe('Unknown Bank');
      });

      it('should use "plaid" as default source', async () => {
        const paykeyWithoutSource = {
          data: {
            ...mockPlaidPaykeyResponse.data,
            source: undefined,
          },
        };

        jest.spyOn(straddleClient.bridge.link, 'plaid').mockResolvedValue(paykeyWithoutSource as any);
        jest.spyOn(straddleClient.paykeys.review, 'get').mockResolvedValue(mockReviewResponse as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(201);
        expect(response.body.source).toBe('plaid');
      });
    });

    describe('Error Handling', () => {
      it('should handle Straddle SDK errors', async () => {
        const mockError = {
          error: {
            type: 'invalid_request',
            code: 'INVALID_PLAID_TOKEN',
            message: 'Invalid Plaid processor token',
          },
          status: 400,
        };

        jest.spyOn(straddleClient.bridge.link, 'plaid').mockRejectedValue(mockError as any);

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'invalid-token',
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid Plaid processor token');
      });

      it('should handle generic errors', async () => {
        jest.spyOn(straddleClient.bridge.link, 'plaid').mockRejectedValue(new Error('Network error'));

        const response = await request(app).post('/api/bridge/plaid').send({
          customer_id: 'cust_123',
          plaid_token: 'processor-sandbox-custom-token',
        });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('POST /api/bridge/initialize', () => {
    const mockBridgeTokenResponse = {
      data: {
        bridge_token: 'bt_sandbox_1234567890abcdef',
        expires_at: '2025-11-19T11:00:00Z',
      },
    };

    describe('Happy Path', () => {
      it('should generate bridge token with valid customer_id', async () => {
        jest
          .spyOn(straddleClient.bridge, 'initialize')
          .mockResolvedValue(mockBridgeTokenResponse as any);

        const response = await request(app).post('/api/bridge/initialize').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('bridge_token', 'bt_sandbox_1234567890abcdef');
        expect(response.body.data).toHaveProperty('expires_at', '2025-11-19T11:00:00Z');
        expect(straddleClient.bridge.initialize).toHaveBeenCalledWith({
          customer_id: 'cust_123',
        });
      });

      it('should return bridge token with expiration', async () => {
        jest
          .spyOn(straddleClient.bridge, 'initialize')
          .mockResolvedValue(mockBridgeTokenResponse as any);

        const response = await request(app).post('/api/bridge/initialize').send({
          customer_id: 'cust_456',
        });

        expect(response.status).toBe(200);
        expect(response.body.data.bridge_token).toBe('bt_sandbox_1234567890abcdef');
        expect(response.body.data.expires_at).toBe('2025-11-19T11:00:00Z');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when customer_id is missing', async () => {
        const response = await request(app).post('/api/bridge/initialize').send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'customer_id is required');
      });

      it('should return 400 when customer_id is not a string', async () => {
        const response = await request(app).post('/api/bridge/initialize').send({
          customer_id: 12345,
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'customer_id is required');
      });
    });

    describe('Error Handling', () => {
      it('should handle Straddle SDK errors', async () => {
        const mockError = {
          error: {
            type: 'invalid_request',
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Customer not found',
          },
          status: 404,
        };

        jest.spyOn(straddleClient.bridge, 'initialize').mockRejectedValue(mockError as any);

        const response = await request(app).post('/api/bridge/initialize').send({
          customer_id: 'cust_nonexistent',
        });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Customer not found');
      });

      it('should handle generic errors', async () => {
        jest.spyOn(straddleClient.bridge, 'initialize').mockRejectedValue(new Error('Network error'));

        const response = await request(app).post('/api/bridge/initialize').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });

      it('should handle authentication errors', async () => {
        const mockError = {
          error: {
            type: 'authentication_error',
            code: 'INVALID_API_KEY',
            message: 'Invalid API key',
          },
          status: 401,
        };

        jest.spyOn(straddleClient.bridge, 'initialize').mockRejectedValue(mockError as any);

        const response = await request(app).post('/api/bridge/initialize').send({
          customer_id: 'cust_123',
        });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      });
    });
  });
});
