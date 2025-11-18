import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Set environment variables before importing config
process.env.STRADDLE_API_KEY = 'test_api_key';

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
      processorToken: '',
    },
  },
}));

jest.mock('../../sdk.js', () => ({
  default: {
    customers: {
      create: jest.fn(),
      get: jest.fn(),
      unmasked: jest.fn(),
    },
    get: jest.fn(),
  },
}));

jest.mock('../../domain/state.js', () => ({
  stateManager: {
    setCustomer: jest.fn(),
    getCustomer: jest.fn(),
  },
}));

jest.mock('../../lib/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Import modules
import customerRouter from '../customers.js';
import straddleClient from '../../sdk.js';

describe('Customer Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.requestId = 'test-request-id';
      req.correlationId = 'test-correlation-id';
      next();
    });
    app.use('/api/customers', customerRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/customers', () => {
    it('should create a customer with valid data', async () => {
      const mockCustomerResponse = {
        data: {
          id: 'cust_123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+12125550123',
          type: 'individual',
          status: 'verified',
          risk_score: 0.1,
          created_at: '2025-11-16T10:00:00Z',
        },
      };

      jest.spyOn(straddleClient.customers, 'create').mockResolvedValue(mockCustomerResponse as any);

      const response = await request(app).post('/api/customers').send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+12125550123',
        type: 'individual',
        outcome: 'verified',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'cust_123');
      expect(response.body).toHaveProperty('verification_status', 'verified');
      expect(straddleClient.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+12125550123',
          type: 'individual',
          config: expect.objectContaining({
            sandbox_outcome: 'verified',
          }),
        })
      );
    });

    it('should generate unique email if not provided', async () => {
      const mockCustomerResponse = {
        data: {
          id: 'cust_456',
          name: 'Alberta Bobbeth Charleson',
          email: 'customer.123@example.com',
          phone: '+12125550123',
          type: 'individual',
          status: 'verified',
          risk_score: 0.2,
          created_at: '2025-11-16T10:00:00Z',
        },
      };

      jest.spyOn(straddleClient.customers, 'create').mockResolvedValue(mockCustomerResponse as any);

      const response = await request(app).post('/api/customers').send({
        name: 'Alberta Bobbeth Charleson',
        phone: '+12125550123',
      });

      expect(response.status).toBe(201);
      expect(straddleClient.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.stringMatching(/customer\.\d+@example\.com/),
        })
      );
    });

    it('should use first_name and last_name if provided', async () => {
      const mockCustomerResponse = {
        data: {
          id: 'cust_789',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+12125550123',
          type: 'individual',
          status: 'verified',
          risk_score: 0.1,
          created_at: '2025-11-16T10:00:00Z',
        },
      };

      jest.spyOn(straddleClient.customers, 'create').mockResolvedValue(mockCustomerResponse as any);

      const response = await request(app).post('/api/customers').send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+12125550123',
      });

      expect(response.status).toBe(201);
      expect(straddleClient.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
        })
      );
    });

    it('should handle Straddle API errors', async () => {
      const mockError = {
        error: {
          type: 'invalid_request',
          code: 'INVALID_EMAIL',
          message: 'Email already exists',
        },
        status: 400,
      };

      jest.spyOn(straddleClient.customers, 'create').mockRejectedValue(mockError as any);

      const response = await request(app).post('/api/customers').send({
        name: 'Test User',
        email: 'duplicate@example.com',
        phone: '+12125550123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate KYC customer request when compliance_profile is provided', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '+12125550123',
          compliance_profile: 'kyc',
          address: {
            // Missing required fields for KYC
            city: 'Denver',
          },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Validation failed');
    });

    it('should accept different customer outcomes', async () => {
      const outcomes = ['verified', 'standard', 'review', 'rejected'];

      for (const outcome of outcomes) {
        const mockCustomerResponse = {
          data: {
            id: `cust_${outcome}`,
            name: 'Test User',
            email: `test-${outcome}@example.com`,
            phone: '+12125550123',
            type: 'individual',
            status: outcome === 'verified' ? 'verified' : 'pending',
            risk_score: 0.1,
            created_at: '2025-11-16T10:00:00Z',
          },
        };

        jest
          .spyOn(straddleClient.customers, 'create')
          .mockResolvedValue(mockCustomerResponse as any);

        const response = await request(app)
          .post('/api/customers')
          .send({
            name: 'Test User',
            email: `test-${outcome}@example.com`,
            phone: '+12125550123',
            outcome,
          });

        expect(response.status).toBe(201);
        expect(straddleClient.customers.create).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              sandbox_outcome: outcome,
            }),
          })
        );
      }
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should retrieve a customer by id', async () => {
      const mockCustomerResponse = {
        data: {
          id: 'cust_123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+12125550123',
          type: 'individual',
          status: 'verified',
          risk_score: 0.1,
          created_at: '2025-11-16T10:00:00Z',
        },
      };

      jest.spyOn(straddleClient.customers, 'get').mockResolvedValue(mockCustomerResponse as any);

      const response = await request(app).get('/api/customers/cust_123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'cust_123');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(straddleClient.customers.get).toHaveBeenCalledWith('cust_123');
    });

    it('should handle customer not found errors', async () => {
      const mockError = {
        error: {
          type: 'invalid_request',
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found',
        },
        status: 404,
      };

      jest.spyOn(straddleClient.customers, 'get').mockRejectedValue(mockError as any);

      const response = await request(app).get('/api/customers/cust_nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/customers/:id/unmask', () => {
    it('should call customers.unmasked() SDK method and return unmasked data', async () => {
      const mockUnmaskedResponse = {
        data: {
          id: 'cust_123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+12125550123',
          type: 'individual',
          status: 'verified',
          compliance_profile: {
            ssn: '123-45-6789',
            dob: '1990-01-01',
          },
          device: {
            ip_address: '192.168.1.1',
          },
          created_at: '2025-11-16T10:00:00Z',
        },
      };

      jest
        .spyOn(straddleClient.customers, 'unmasked')
        .mockResolvedValue(mockUnmaskedResponse as any);

      const response = await request(app).get('/api/customers/cust_123/unmask');

      // Verify the correct SDK method was called
      expect(straddleClient.customers.unmasked).toHaveBeenCalledWith('cust_123');

      // Verify response contains unmasked data (from .data wrapper)
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'cust_123');
      expect(response.body.compliance_profile).toHaveProperty('ssn', '123-45-6789');
      expect(response.body.compliance_profile).toHaveProperty('dob', '1990-01-01');
    });

    it('should handle unmask errors correctly', async () => {
      const mockError = {
        error: {
          type: 'invalid_request',
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found',
        },
        status: 404,
      };

      jest.spyOn(straddleClient.customers, 'unmasked').mockRejectedValue(mockError as any);

      const response = await request(app).get('/api/customers/cust_nonexistent/unmask');

      // Verify error response structure and content
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Customer not found');

      // Verify the correct SDK method was called
      expect(straddleClient.customers.unmasked).toHaveBeenCalledWith('cust_nonexistent');
    });
  });
});
