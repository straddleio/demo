import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Response } from 'express';
import type { DemoState } from '../../domain/state.js';
import type { RequestLog } from '../../domain/logs.js';
import type { LogStreamEntry } from '../../domain/log-stream.js';

// Set environment variables before importing config
process.env.STRADDLE_API_KEY = 'test_api_key';

// Mock dependencies using unstable_mockModule for ESM support
jest.unstable_mockModule('../../config.js', () => ({
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
    generator: {
      url: 'http://localhost:8081',
    },
    features: {
      enableUnmask: false,
      enableLogStream: true,
    },
  },
}));

const mockStateManager = {
  getState: jest.fn(),
  reset: jest.fn(),
  on: jest.fn(),
};

jest.unstable_mockModule('../../domain/state.js', () => ({
  stateManager: mockStateManager,
}));

const mockLogs = {
  getRequestLogs: jest.fn(),
  clearRequestLogs: jest.fn(),
};

jest.unstable_mockModule('../../domain/logs.js', () => mockLogs);

const mockLogStream = {
  getLogStream: jest.fn(),
  clearLogStream: jest.fn(),
};

jest.unstable_mockModule('../../domain/log-stream.js', () => mockLogStream);

const mockEventBroadcaster = {
  broadcast: jest.fn(),
  addClient: jest.fn(),
};

jest.unstable_mockModule('../../domain/events.js', () => ({
  eventBroadcaster: mockEventBroadcaster,
}));

jest.unstable_mockModule('../../lib/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.unstable_mockModule('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('State Routes', () => {
  let app: express.Application;
  let stateRouter: any;

  beforeAll(async () => {
    const module = await import('../state.js');
    stateRouter = module.default;
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req: any, _res, next) => {
      req.requestId = 'test-request-id';
      req.correlationId = 'test-correlation-id';
      next();
    });
    app.use('/api', stateRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/state', () => {
    it('should return current demo state', async () => {
      const mockState: DemoState = {
        customer: {
          id: 'cust_123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+12125550123',
          type: 'individual',
          verification_status: 'verified',
          risk_score: 0.1,
          created_at: '2025-11-19T10:00:00Z',
        },
        paykey: {
          id: 'paykey_456',
          paykey: '758c519d.02.2c16f91',
          customer_id: 'cust_123',
          status: 'active',
          bank_data: {
            account_number: '****6789',
            routing_number: '021000021',
            account_type: 'checking',
          },
          institution_name: 'Test Bank',
          created_at: '2025-11-19T10:05:00Z',
        },
        charge: {
          id: 'charge_789',
          paykey: '758c519d.02.2c16f91',
          amount: 5000,
          currency: 'USD',
          status: 'paid',
          payment_date: '2025-11-19',
          created_at: '2025-11-19T10:10:00Z',
        },
      };

      mockStateManager.getState.mockReturnValue(mockState);

      const response = await request(app).get('/api/state').expect(200);

      expect(response.body).toEqual(mockState);
      expect(mockStateManager.getState).toHaveBeenCalledTimes(1);
    });

    it('should return empty state when no data exists', async () => {
      const emptyState: DemoState = {
        customer: null,
        paykey: null,
        charge: null,
      };

      mockStateManager.getState.mockReturnValue(emptyState);

      const response = await request(app).get('/api/state').expect(200);

      expect(response.body).toEqual(emptyState);
      expect(mockStateManager.getState).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/reset', () => {
    it('should reset demo state and clear logs', async () => {
      const response = await request(app).post('/api/reset').expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Demo state reset',
      });
      expect(mockStateManager.reset).toHaveBeenCalledTimes(1);
      expect(mockLogs.clearRequestLogs).toHaveBeenCalledTimes(1);
      expect(mockLogStream.clearLogStream).toHaveBeenCalledTimes(1);
      expect(mockEventBroadcaster.broadcast).toHaveBeenCalledWith('state:reset', {});
    });

    it('should broadcast reset event to SSE clients', async () => {
      await request(app).post('/api/reset').expect(200);

      expect(mockEventBroadcaster.broadcast).toHaveBeenCalledWith('state:reset', {});
    });
  });

  describe('GET /api/config', () => {
    it('should return public config (environment and safe flags)', async () => {
      const response = await request(app).get('/api/config').expect(200);

      expect(response.body).toEqual({
        environment: 'sandbox',
        features: {
          enableUnmask: false,
          enableLogStream: true,
        },
      });
    });

    it('should not expose sensitive config values', async () => {
      const response = await request(app).get('/api/config').expect(200);

      // Ensure no sensitive data is exposed
      expect(response.body).not.toHaveProperty('apiKey');
      expect(response.body).not.toHaveProperty('straddle');
      expect(response.body).not.toHaveProperty('webhook');
      expect(response.body).not.toHaveProperty('plaid');
      expect(response.body).not.toHaveProperty('processorToken');

      // Only safe fields should be present
      expect(Object.keys(response.body)).toEqual(['environment', 'features']);
    });
  });

  describe('GET /api/logs', () => {
    it('should return request logs', async () => {
      const mockLogEntries: RequestLog[] = [
        {
          requestId: 'req_123',
          correlationId: 'corr_123',
          method: 'POST',
          path: '/api/customers',
          statusCode: 201,
          duration: 245,
          timestamp: '2025-11-19T10:00:00Z',
          straddleEndpoint: 'customers',
          requestBody: { name: 'Test User' },
          responseBody: { data: { id: 'cust_123' } },
        },
        {
          requestId: 'req_124',
          correlationId: 'corr_124',
          method: 'POST',
          path: '/api/bridge/bank-account',
          statusCode: 201,
          duration: 189,
          timestamp: '2025-11-19T10:05:00Z',
          straddleEndpoint: 'bridge/link',
        },
      ];

      mockLogs.getRequestLogs.mockReturnValue(mockLogEntries);

      const response = await request(app).get('/api/logs').expect(200);

      expect(response.body).toEqual(mockLogEntries);
      expect(mockLogs.getRequestLogs).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no logs exist', async () => {
      mockLogs.getRequestLogs.mockReturnValue([]);

      const response = await request(app).get('/api/logs').expect(200);

      expect(response.body).toEqual([]);
      expect(mockLogs.getRequestLogs).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/log-stream', () => {
    it('should return filtered log stream (only Straddle API and webhook entries)', async () => {
      const mockLogStreamEntries: LogStreamEntry[] = [
        {
          id: 'log_1',
          timestamp: '2025-11-19T10:00:00Z',
          type: 'straddle-req',
          method: 'POST',
          path: '/customers',
          requestBody: { name: 'Test User' },
          requestId: 'req_123',
          correlationId: 'corr_123',
        },
        {
          id: 'log_2',
          timestamp: '2025-11-19T10:00:01Z',
          type: 'request', // Should be filtered out
          method: 'POST',
          path: '/api/customers',
        },
        {
          id: 'log_3',
          timestamp: '2025-11-19T10:00:02Z',
          type: 'straddle-res',
          statusCode: 201,
          responseBody: { data: { id: 'cust_123' } },
          duration: 245,
          requestId: 'req_123',
          correlationId: 'corr_123',
        },
        {
          id: 'log_4',
          timestamp: '2025-11-19T10:00:03Z',
          type: 'response', // Should be filtered out
          statusCode: 201,
        },
        {
          id: 'log_5',
          timestamp: '2025-11-19T10:00:04Z',
          type: 'webhook',
          eventType: 'charge.paid',
          eventId: 'evt_123',
          webhookPayload: { charge_id: 'charge_789' },
        },
      ];

      mockLogStream.getLogStream.mockReturnValue(mockLogStreamEntries);

      const response = await request(app).get('/api/log-stream').expect(200);

      // Should only include straddle-req, straddle-res, and webhook entries
      expect(response.body).toHaveLength(3);
      expect(response.body[0].type).toBe('straddle-req');
      expect(response.body[1].type).toBe('straddle-res');
      expect(response.body[2].type).toBe('webhook');
      expect(mockLogStream.getLogStream).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no Straddle/webhook logs exist', async () => {
      const mockLogStreamEntries: LogStreamEntry[] = [
        {
          id: 'log_1',
          timestamp: '2025-11-19T10:00:00Z',
          type: 'request',
          method: 'GET',
          path: '/api/state',
        },
        {
          id: 'log_2',
          timestamp: '2025-11-19T10:00:01Z',
          type: 'response',
          statusCode: 200,
        },
      ];

      mockLogStream.getLogStream.mockReturnValue(mockLogStreamEntries);

      const response = await request(app).get('/api/log-stream').expect(200);

      expect(response.body).toEqual([]);
      expect(mockLogStream.getLogStream).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/outcomes', () => {
    it('should return all sandbox outcomes', async () => {
      const response = await request(app).get('/api/outcomes').expect(200);

      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('paykey');
      expect(response.body).toHaveProperty('charge');

      // Verify structure
      expect(Array.isArray(response.body.customer)).toBe(true);
      expect(Array.isArray(response.body.paykey)).toBe(true);
      expect(Array.isArray(response.body.charge)).toBe(true);
    });

    it('should include correct customer outcomes', async () => {
      const response = await request(app).get('/api/outcomes').expect(200);

      expect(response.body.customer).toContain('standard');
      expect(response.body.customer).toContain('verified');
      expect(response.body.customer).toContain('review');
      expect(response.body.customer).toContain('rejected');
    });

    it('should include correct paykey outcomes', async () => {
      const response = await request(app).get('/api/outcomes').expect(200);

      expect(response.body.paykey).toContain('standard');
      expect(response.body.paykey).toContain('active');
      expect(response.body.paykey).toContain('review');
      expect(response.body.paykey).toContain('rejected');
    });

    it('should include correct charge outcomes', async () => {
      const response = await request(app).get('/api/outcomes').expect(200);

      expect(response.body.charge).toContain('standard');
      expect(response.body.charge).toContain('paid');
      expect(response.body.charge).toContain('on_hold_daily_limit');
      expect(response.body.charge).toContain('cancelled_for_fraud_risk');
      expect(response.body.charge).toContain('cancelled_for_balance_check');
      expect(response.body.charge).toContain('failed_insufficient_funds');
      expect(response.body.charge).toContain('reversed_insufficient_funds');
    });
  });

  describe('GET /api/events/stream', () => {
    it('should call addClient when SSE connection is established', async () => {
      mockStateManager.getState.mockReturnValue({
        customer: null,
        paykey: null,
        charge: null,
      });

      // Mock addClient to close the response immediately so the request finishes
      mockEventBroadcaster.addClient.mockImplementation((_id: any, res: any) => {
        res.end();
      });

      // Make request and await it
      await request(app).get('/api/events/stream');

      // Verify that addClient and getState were called
      expect(mockEventBroadcaster.addClient).toHaveBeenCalled();
      expect(mockStateManager.getState).toHaveBeenCalled();
    });

    it('should call broadcast when resetting state', async () => {
      await request(app).post('/api/reset').expect(200);

      expect(mockEventBroadcaster.broadcast).toHaveBeenCalledWith('state:reset', {});
    });
  });

  describe('GET /api/geolocation/:ip', () => {
    it('should return local info for private IP addresses (192.168.x.x)', async () => {
      const response = await request(app).get('/api/geolocation/192.168.1.100').expect(200);

      expect(response.body).toEqual({
        city: 'Local',
        region: 'Private',
        country: 'Network',
        countryCode: 'XX',
      });
    });

    it('should return local info for 10.x.x.x private addresses', async () => {
      const response = await request(app).get('/api/geolocation/10.0.0.1').expect(200);

      expect(response.body).toEqual({
        city: 'Local',
        region: 'Private',
        country: 'Network',
        countryCode: 'XX',
      });
    });

    it('should return local info for localhost (127.0.0.1)', async () => {
      const response = await request(app).get('/api/geolocation/127.0.0.1').expect(200);

      expect(response.body).toEqual({
        city: 'Local',
        region: 'Private',
        country: 'Network',
        countryCode: 'XX',
      });
    });

    it('should handle geolocation service errors gracefully', async () => {
      // Mock fetch to simulate service error
      global.fetch = jest.fn<typeof fetch>().mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app).get('/api/geolocation/8.8.8.8').expect(200);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch geolocation');
    });

    it('should handle non-OK responses from geolocation service', async () => {
      // Mock fetch to return non-OK response
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        } as unknown as Response)
      ) as any;

      const response = await request(app).get('/api/geolocation/8.8.8.8').expect(200);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch geolocation');
    });

    it('should fetch and return geolocation for public IP addresses', async () => {
      const mockGeoData = {
        city: 'San Francisco',
        region: 'California',
        country: 'United States',
        country_code: 'US',
      };

      // Mock successful fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGeoData),
        } as unknown as Response)
      ) as any;

      const response = await request(app).get('/api/geolocation/8.8.8.8').expect(200);

      expect(response.body).toEqual({
        city: 'San Francisco',
        region: 'California',
        country: 'United States',
        countryCode: 'US',
      });
      expect(global.fetch).toHaveBeenCalledWith('https://get.geojs.io/v1/ip/geo/8.8.8.8.json');
    });
  });
});
