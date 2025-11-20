import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { Webhook } from 'svix';

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
      secret: 'whsec_test_secret',
      ngrokUrl: '',
    },
    plaid: {
      processorToken: '',
    },
    features: {
      enableUnmask: true,
      enableLogStream: true,
    },
  },
}));

jest.mock('../../lib/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock log stream
jest.mock('../../domain/log-stream.js', () => ({
  parseStraddleError: jest.fn(),
}));

// Mock state manager
jest.mock('../../domain/state.js', () => ({
  stateManager: {
    updateCustomer: jest.fn(),
    setPaykey: jest.fn(),
    updateCharge: jest.fn(),
    getState: jest.fn(),
  },
}));

// Mock event broadcaster
jest.mock('../../domain/events.js', () => ({
  eventBroadcaster: {
    broadcast: jest.fn(),
  },
}));

// Import modules after mocking
import webhooksRouter from '../webhooks.js';
import { stateManager } from '../../domain/state.js';
import { eventBroadcaster } from '../../domain/events.js';

describe('Webhooks Routes', () => {
  let app: express.Application;
  const secret = 'whsec_test_secret';

  const signPayload = (payload: unknown): Record<string, string> => {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const msgId = `msg_${timestamp}`;
    const signature = new Webhook(secret).sign(
      msgId,
      new Date(Number(timestamp) * 1000),
      payloadString
    );

    return {
      'svix-id': msgId,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    };
  };

  const postWebhook = (payload: unknown) =>
    request(app).post('/api/webhooks/straddle').set(signPayload(payload)).send(payload);

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/webhooks', webhooksRouter);
    jest.clearAllMocks();

    // Set up spies for all methods (these will use the mocked implementations)
    jest.spyOn(stateManager, 'updateCustomer');
    jest.spyOn(stateManager, 'setPaykey');
    jest.spyOn(stateManager, 'updateCharge');
    jest.spyOn(eventBroadcaster, 'broadcast');

    // Default mock state
    jest.spyOn(stateManager, 'getState').mockReturnValue({
      customer: null,
      paykey: null,
      charge: null,
    });
  });

  describe('POST /api/webhooks/straddle', () => {
    it('should reject requests without signature headers', async () => {
      const webhookPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_sig_1',
        data: { id: 'cust_123' },
      };

      const response = await request(app)
        .post('/api/webhooks/straddle')
        .send(webhookPayload)
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing webhook signature headers' });
    });

    it('should reject requests with invalid signatures', async () => {
      const webhookPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_sig_2',
        data: { id: 'cust_123' },
      };

      const badHeaders = {
        'svix-id': 'msg_bad',
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'v1,badsignature',
      };

      const response = await request(app)
        .post('/api/webhooks/straddle')
        .set(badHeaders)
        .send(webhookPayload)
        .expect(401);

      expect(response.body).toEqual({ error: 'Invalid webhook signature' });
    });

    it('should process customer.created.v1 webhook and update state', async () => {
      const webhookPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_123',
        account_id: 'acc_456',
        data: {
          id: 'cust_123',
          status: 'verified',
          risk_score: 0.1,
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      // Mock state with existing customer
      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: {
          id: 'cust_123',
          name: 'Test User',
          type: 'individual',
          created_at: '2025-11-19T10:00:00Z',
        },
        paykey: null,
        charge: null,
      });

      const response = await postWebhook(webhookPayload).expect(200);

      expect(response.body).toEqual({ received: true });

      // Verify event broadcast
      expect(eventBroadcaster.broadcast).toHaveBeenCalledWith('webhook', webhookPayload);

      // Verify customer state was updated
      expect(stateManager.updateCustomer).toHaveBeenCalledWith({
        verification_status: 'verified',
        risk_score: 0.1,
      });
    });

    it('should process customer.event.v1 webhook', async () => {
      const webhookPayload = {
        event_type: 'customer.event.v1',
        event_id: 'evt_124',
        data: {
          id: 'cust_123',
          status: 'rejected',
          risk_score: 0.9,
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: {
          id: 'cust_123',
          name: 'Test User',
          type: 'individual',
          created_at: '2025-11-19T10:00:00Z',
        },
        paykey: null,
        charge: null,
      });

      const response = await postWebhook(webhookPayload).expect(200);

      expect(response.body).toEqual({ received: true });
      expect(stateManager.updateCustomer).toHaveBeenCalledWith({
        verification_status: 'rejected',
        risk_score: 0.9,
      });
    });

    it('should not update customer state if IDs do not match', async () => {
      const webhookPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_125',
        data: {
          id: 'cust_different',
          status: 'verified',
          risk_score: 0.1,
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: {
          id: 'cust_123',
          name: 'Test User',
          type: 'individual',
          created_at: '2025-11-19T10:00:00Z',
        },
        paykey: null,
        charge: null,
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.updateCustomer).not.toHaveBeenCalled();
    });

    it('should process paykey.created.v1 webhook and update state', async () => {
      const webhookPayload = {
        event_type: 'paykey.created.v1',
        event_id: 'evt_126',
        data: {
          id: 'pk_123',
          status: 'active',
          customer_id: 'cust_123',
          paykey: 'pk_token_123',
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: {
          id: 'pk_123',
          paykey: 'pk_token_123',
          customer_id: 'cust_123',
          status: 'pending',
          created_at: '2025-11-19T10:00:00Z',
        },
        charge: null,
      });

      const response = await postWebhook(webhookPayload).expect(200);

      expect(response.body).toEqual({ received: true });

      // Verify paykey state was updated
      expect(stateManager.setPaykey).toHaveBeenCalledWith({
        id: 'pk_123',
        paykey: 'pk_token_123',
        customer_id: 'cust_123',
        status: 'active',
        created_at: '2025-11-19T10:00:00Z',
      });
    });

    it('should process paykey.event.v1 webhook', async () => {
      const webhookPayload = {
        event_type: 'paykey.event.v1',
        event_id: 'evt_127',
        data: {
          id: 'pk_123',
          status: 'rejected',
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: {
          id: 'pk_123',
          paykey: 'pk_token_123',
          customer_id: 'cust_123',
          status: 'active',
          created_at: '2025-11-19T10:00:00Z',
        },
        charge: null,
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.setPaykey).toHaveBeenCalled();
    });

    it('should process charge.created.v1 webhook and update state with status history', async () => {
      const webhookPayload = {
        event_type: 'charge.created.v1',
        event_id: 'evt_128',
        data: {
          id: 'charge_123',
          status: 'pending',
          updated_at: '2025-11-19T10:00:00Z',
          status_details: {
            reason: 'processing',
            source: 'system',
            message: 'Payment is being processed',
            changed_at: '2025-11-19T10:00:00Z',
          },
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: null,
        charge: {
          id: 'charge_123',
          paykey: 'pk_token_123',
          amount: 5000,
          currency: 'USD',
          status: 'created',
          payment_date: '2025-11-19',
          created_at: '2025-11-19T09:00:00Z',
          status_history: [
            {
              status: 'created',
              timestamp: '2025-11-19T09:00:00Z',
            },
          ],
        },
      });

      const response = await postWebhook(webhookPayload).expect(200);

      expect(response.body).toEqual({ received: true });

      // Verify charge state was updated with new history entry
      expect(stateManager.updateCharge).toHaveBeenCalledWith({
        status: 'pending',
        status_history: [
          {
            status: 'created',
            timestamp: '2025-11-19T09:00:00Z',
          },
          {
            status: 'pending',
            timestamp: '2025-11-19T10:00:00Z',
            reason: 'processing',
            source: 'system',
            message: 'Payment is being processed',
          },
        ],
        completed_at: undefined,
        failure_reason: undefined,
      });
    });

    it('should process charge.event.v1 webhook with completed_at and failure_reason', async () => {
      const webhookPayload = {
        event_type: 'charge.event.v1',
        event_id: 'evt_129',
        data: {
          id: 'charge_123',
          status: 'failed',
          updated_at: '2025-11-19T11:00:00Z',
          completed_at: '2025-11-19T11:00:00Z',
          failure_reason: 'insufficient_funds',
          status_details: {
            reason: 'insufficient_funds',
            source: 'bank_decline',
            message: 'Insufficient funds in account',
            changed_at: '2025-11-19T11:00:00Z',
          },
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: null,
        charge: {
          id: 'charge_123',
          paykey: 'pk_token_123',
          amount: 5000,
          currency: 'USD',
          status: 'pending',
          payment_date: '2025-11-19',
          created_at: '2025-11-19T09:00:00Z',
          status_history: [
            {
              status: 'created',
              timestamp: '2025-11-19T09:00:00Z',
            },
            {
              status: 'pending',
              timestamp: '2025-11-19T10:00:00Z',
            },
          ],
        },
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.updateCharge).toHaveBeenCalledWith({
        status: 'failed',
        status_history: expect.arrayContaining([
          {
            status: 'failed',
            timestamp: '2025-11-19T11:00:00Z',
            reason: 'insufficient_funds',
            source: 'bank_decline',
            message: 'Insufficient funds in account',
          },
        ]),
        completed_at: '2025-11-19T11:00:00Z',
        failure_reason: 'insufficient_funds',
      });
    });

    it('should not add duplicate history entries', async () => {
      const webhookPayload = {
        event_type: 'charge.event.v1',
        event_id: 'evt_130',
        data: {
          id: 'charge_123',
          status: 'pending',
          updated_at: '2025-11-19T10:00:00Z',
          status_details: {
            reason: 'processing',
            source: 'system',
            message: 'Payment is being processed',
            changed_at: '2025-11-19T10:00:00Z',
          },
        },
      };

      // Mock state with identical last entry
      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: null,
        charge: {
          id: 'charge_123',
          paykey: 'pk_token_123',
          amount: 5000,
          currency: 'USD',
          status: 'pending',
          payment_date: '2025-11-19',
          created_at: '2025-11-19T09:00:00Z',
          status_history: [
            {
              status: 'pending',
              timestamp: '2025-11-19T10:00:00Z',
              message: 'Payment is being processed',
            },
          ],
        },
      });

      await postWebhook(webhookPayload).expect(200);

      // Verify that status_history was NOT updated (duplicate detected)
      expect(stateManager.updateCharge).toHaveBeenCalledWith({
        status: 'pending',
        status_history: [
          {
            status: 'pending',
            timestamp: '2025-11-19T10:00:00Z',
            message: 'Payment is being processed',
          },
        ],
        completed_at: undefined,
        failure_reason: undefined,
      });
    });

    it('should handle webhooks with no status_details gracefully', async () => {
      const webhookPayload = {
        event_type: 'charge.event.v1',
        event_id: 'evt_131',
        data: {
          id: 'charge_123',
          status: 'paid',
          updated_at: '2025-11-19T12:00:00Z',
          completed_at: '2025-11-19T12:00:00Z',
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: null,
        charge: {
          id: 'charge_123',
          paykey: 'pk_token_123',
          amount: 5000,
          currency: 'USD',
          status: 'pending',
          payment_date: '2025-11-19',
          created_at: '2025-11-19T09:00:00Z',
          status_history: [],
        },
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.updateCharge).toHaveBeenCalledWith({
        status: 'paid',
        status_history: [
          {
            status: 'paid',
            timestamp: '2025-11-19T12:00:00Z',
            reason: undefined,
            source: undefined,
            message: undefined,
          },
        ],
        completed_at: '2025-11-19T12:00:00Z',
        failure_reason: undefined,
      });
    });

    it('should handle unrecognized webhook types gracefully', async () => {
      const webhookPayload = {
        event_type: 'unknown.event.v1',
        event_id: 'evt_132',
        data: {
          id: 'unknown_123',
        },
      };

      const response = await postWebhook(webhookPayload).expect(200);

      expect(response.body).toEqual({ received: true });

      // Verify it was broadcast but no state updates
      expect(eventBroadcaster.broadcast).toHaveBeenCalledWith('webhook', webhookPayload);
      expect(stateManager.updateCustomer).not.toHaveBeenCalled();
      expect(stateManager.setPaykey).not.toHaveBeenCalled();
      expect(stateManager.updateCharge).not.toHaveBeenCalled();
    });

    it('should reject invalid webhook payload structure', async () => {
      const invalidPayload = {
        // Missing event_type, event_id, data
        some_field: 'value',
      };

      const response = await postWebhook(invalidPayload).expect(400);

      expect(response.body).toEqual({ error: 'Invalid webhook payload' });

      // Verify nothing was broadcast
      expect(eventBroadcaster.broadcast).not.toHaveBeenCalled();
    });

    it('should reject webhook with missing event_type', async () => {
      const invalidPayload = {
        event_id: 'evt_133',
        data: { id: 'test_123' },
      };

      const response = await postWebhook(invalidPayload).expect(400);

      expect(response.body).toEqual({ error: 'Invalid webhook payload' });
    });

    it('should reject webhook with missing event_id', async () => {
      const invalidPayload = {
        event_type: 'customer.created.v1',
        data: { id: 'test_123' },
      };

      const response = await postWebhook(invalidPayload).expect(400);

      expect(response.body).toEqual({ error: 'Invalid webhook payload' });
    });

    it('should reject webhook with missing data', async () => {
      const invalidPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_134',
      };

      const response = await postWebhook(invalidPayload).expect(400);

      expect(response.body).toEqual({ error: 'Invalid webhook payload' });
    });

    it('should reject webhook with non-object data', async () => {
      const invalidPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_135',
        data: 'invalid_data_string',
      };

      const response = await request(app)
        .post('/api/webhooks/straddle')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid webhook payload' });
    });

    it('should handle errors during webhook processing', async () => {
      const webhookPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_136',
        data: {
          id: 'cust_123',
          status: 'verified',
        },
      };

      // Mock error in state manager
      jest.spyOn(stateManager, 'getState').mockImplementation(() => {
        throw new Error('State manager error');
      });

      const response = await postWebhook(webhookPayload).expect(500);

      expect(response.body).toEqual({
        error: 'Webhook processing failed',
        details: null,
      });
    });

    it('should not update customer if webhook data is missing id', async () => {
      const webhookPayload = {
        event_type: 'customer.created.v1',
        event_id: 'evt_137',
        data: {
          // Missing id
          status: 'verified',
          risk_score: 0.1,
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: {
          id: 'cust_123',
          name: 'Test User',
          type: 'individual',
          created_at: '2025-11-19T10:00:00Z',
        },
        paykey: null,
        charge: null,
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.updateCustomer).not.toHaveBeenCalled();
    });

    it('should not update paykey if webhook data is missing id or status', async () => {
      const webhookPayload = {
        event_type: 'paykey.created.v1',
        event_id: 'evt_138',
        data: {
          // Missing id and status
          customer_id: 'cust_123',
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: {
          id: 'pk_123',
          paykey: 'pk_token_123',
          customer_id: 'cust_123',
          status: 'pending',
          created_at: '2025-11-19T10:00:00Z',
        },
        charge: null,
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.setPaykey).not.toHaveBeenCalled();
    });

    it('should not update charge if webhook data is missing id or status', async () => {
      const webhookPayload = {
        event_type: 'charge.created.v1',
        event_id: 'evt_139',
        data: {
          // Missing id and status
          amount: 5000,
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: null,
        charge: {
          id: 'charge_123',
          paykey: 'pk_token_123',
          amount: 5000,
          currency: 'USD',
          status: 'pending',
          payment_date: '2025-11-19',
          created_at: '2025-11-19T09:00:00Z',
          status_history: [],
        },
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.updateCharge).not.toHaveBeenCalled();
    });

    it('should use current timestamp if updated_at is missing from charge webhook', async () => {
      const webhookPayload = {
        event_type: 'charge.event.v1',
        event_id: 'evt_140',
        data: {
          id: 'charge_123',
          status: 'paid',
          // Missing updated_at
        },
      };

      jest.spyOn(stateManager, 'getState').mockReturnValue({
        customer: null,
        paykey: null,
        charge: {
          id: 'charge_123',
          paykey: 'pk_token_123',
          amount: 5000,
          currency: 'USD',
          status: 'pending',
          payment_date: '2025-11-19',
          created_at: '2025-11-19T09:00:00Z',
          status_history: [],
        },
      });

      await postWebhook(webhookPayload).expect(200);

      expect(stateManager.updateCharge).toHaveBeenCalledWith({
        status: 'paid',
        status_history: [
          {
            status: 'paid',
            timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
            reason: undefined,
            source: undefined,
            message: undefined,
          },
        ],
        completed_at: undefined,
        failure_reason: undefined,
      });
    });
  });
});
