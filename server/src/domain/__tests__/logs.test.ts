/**
 * Tests for logs domain module
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  logRequest,
  getRequestLogs,
  clearRequestLogs,
  logStraddleCall,
  type RequestLog,
} from '../logs.js';

describe('Logs Domain', () => {
  beforeEach(() => {
    // Clear logs before each test
    clearRequestLogs();
  });

  describe('logRequest', () => {
    it('should add a request log entry', () => {
      const log: RequestLog = {
        requestId: 'req-123',
        correlationId: 'corr-456',
        method: 'POST',
        path: '/api/customers',
        statusCode: 201,
        duration: 150,
        timestamp: '2025-11-19T12:00:00.000Z',
      };

      logRequest(log);

      const logs = getRequestLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual(log);
    });

    it('should add logs in reverse chronological order (newest first)', () => {
      const log1: RequestLog = {
        requestId: 'req-1',
        correlationId: 'corr-1',
        method: 'GET',
        path: '/api/state',
        statusCode: 200,
        duration: 10,
        timestamp: '2025-11-19T12:00:00.000Z',
      };

      const log2: RequestLog = {
        requestId: 'req-2',
        correlationId: 'corr-2',
        method: 'POST',
        path: '/api/customers',
        statusCode: 201,
        duration: 150,
        timestamp: '2025-11-19T12:01:00.000Z',
      };

      logRequest(log1);
      logRequest(log2);

      const logs = getRequestLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0]).toEqual(log2); // Most recent first
      expect(logs[1]).toEqual(log1);
    });

    it('should keep only the most recent 100 logs', () => {
      // Add 105 logs
      for (let i = 0; i < 105; i++) {
        logRequest({
          requestId: `req-${i}`,
          correlationId: `corr-${i}`,
          method: 'GET',
          path: '/api/test',
          statusCode: 200,
          duration: 10,
          timestamp: new Date().toISOString(),
        });
      }

      const logs = getRequestLogs();
      expect(logs).toHaveLength(100);
      // Most recent should be req-104
      expect(logs[0].requestId).toBe('req-104');
      // Oldest should be req-5
      expect(logs[99].requestId).toBe('req-5');
    });

    it('should include optional fields when provided', () => {
      const log: RequestLog = {
        requestId: 'req-123',
        correlationId: 'corr-456',
        idempotencyKey: 'idem-789',
        method: 'POST',
        path: '/api/charges',
        statusCode: 201,
        duration: 200,
        timestamp: '2025-11-19T12:00:00.000Z',
        straddleEndpoint: 'charges',
        requestBody: { amount: 5000 },
        responseBody: { data: { id: 'charge_123', status: 'paid' } },
      };

      logRequest(log);

      const logs = getRequestLogs();
      expect(logs[0]).toEqual(log);
      expect(logs[0].idempotencyKey).toBe('idem-789');
      expect(logs[0].straddleEndpoint).toBe('charges');
      expect(logs[0].requestBody).toEqual({ amount: 5000 });
      expect(logs[0].responseBody).toEqual({ data: { id: 'charge_123', status: 'paid' } });
    });
  });

  describe('getRequestLogs', () => {
    it('should return an empty array when no logs exist', () => {
      const logs = getRequestLogs();
      expect(logs).toEqual([]);
    });

    it('should return a copy of the logs array', () => {
      const log: RequestLog = {
        requestId: 'req-123',
        correlationId: 'corr-456',
        method: 'GET',
        path: '/api/state',
        statusCode: 200,
        duration: 10,
        timestamp: '2025-11-19T12:00:00.000Z',
      };

      logRequest(log);

      const logs1 = getRequestLogs();
      const logs2 = getRequestLogs();

      // Should be different array instances
      expect(logs1).not.toBe(logs2);
      // But have the same content
      expect(logs1).toEqual(logs2);
    });
  });

  describe('clearRequestLogs', () => {
    it('should remove all logs', () => {
      // Add some logs
      logRequest({
        requestId: 'req-1',
        correlationId: 'corr-1',
        method: 'GET',
        path: '/api/state',
        statusCode: 200,
        duration: 10,
        timestamp: '2025-11-19T12:00:00.000Z',
      });

      logRequest({
        requestId: 'req-2',
        correlationId: 'corr-2',
        method: 'POST',
        path: '/api/customers',
        statusCode: 201,
        duration: 150,
        timestamp: '2025-11-19T12:01:00.000Z',
      });

      expect(getRequestLogs()).toHaveLength(2);

      clearRequestLogs();

      expect(getRequestLogs()).toHaveLength(0);
    });

    it('should allow adding logs after clearing', () => {
      logRequest({
        requestId: 'req-1',
        correlationId: 'corr-1',
        method: 'GET',
        path: '/api/state',
        statusCode: 200,
        duration: 10,
        timestamp: '2025-11-19T12:00:00.000Z',
      });

      clearRequestLogs();

      logRequest({
        requestId: 'req-2',
        correlationId: 'corr-2',
        method: 'POST',
        path: '/api/customers',
        statusCode: 201,
        duration: 150,
        timestamp: '2025-11-19T12:01:00.000Z',
      });

      const logs = getRequestLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].requestId).toBe('req-2');
    });
  });

  describe('logStraddleCall', () => {
    it('should format and log a Straddle API call', () => {
      const requestBody = { name: 'Test Customer', type: 'individual' };
      const responseBody = { data: { id: 'customer_123', verification_status: 'verified' } };

      logStraddleCall(
        'req-123',
        'corr-456',
        'customers',
        'POST',
        201,
        150,
        requestBody,
        responseBody
      );

      const logs = getRequestLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        requestId: 'req-123',
        correlationId: 'corr-456',
        method: 'POST',
        path: '/customers',
        statusCode: 201,
        duration: 150,
        straddleEndpoint: 'customers',
        requestBody,
        responseBody,
      });
      expect(logs[0].timestamp).toBeDefined();
    });

    it('should log Straddle calls without request/response bodies', () => {
      logStraddleCall('req-123', 'corr-456', 'paykeys/pk_123', 'GET', 200, 75);

      const logs = getRequestLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        requestId: 'req-123',
        correlationId: 'corr-456',
        method: 'GET',
        path: '/paykeys/pk_123',
        statusCode: 200,
        duration: 75,
        straddleEndpoint: 'paykeys/pk_123',
      });
      expect(logs[0].requestBody).toBeUndefined();
      expect(logs[0].responseBody).toBeUndefined();
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PATCH', 'DELETE'];

      methods.forEach((method, index) => {
        logStraddleCall(`req-${index}`, `corr-${index}`, `endpoint-${index}`, method, 200, 50);
      });

      const logs = getRequestLogs();
      expect(logs).toHaveLength(4);

      methods.forEach((method, index) => {
        // Logs are in reverse order (newest first)
        expect(logs[3 - index].method).toBe(method);
      });
    });

    it('should handle different status codes', () => {
      const statusCodes = [200, 201, 400, 404, 500];

      statusCodes.forEach((statusCode, index) => {
        logStraddleCall(`req-${index}`, `corr-${index}`, `endpoint-${index}`, 'GET', statusCode, 50);
      });

      const logs = getRequestLogs();
      expect(logs).toHaveLength(5);

      statusCodes.forEach((statusCode, index) => {
        // Logs are in reverse order (newest first)
        expect(logs[4 - index].statusCode).toBe(statusCode);
      });
    });

    it('should handle complex nested request/response bodies', () => {
      const requestBody = {
        customer_id: 'customer_123',
        amount: 5000,
        metadata: {
          order_id: 'order_456',
          items: [
            { id: 'item_1', price: 2500 },
            { id: 'item_2', price: 2500 },
          ],
        },
      };

      const responseBody = {
        data: {
          id: 'charge_789',
          status: 'paid',
          breakdown: {
            subtotal: 5000,
            fees: 150,
            total: 5150,
          },
        },
      };

      logStraddleCall('req-123', 'corr-456', 'charges', 'POST', 201, 200, requestBody, responseBody);

      const logs = getRequestLogs();
      expect(logs[0].requestBody).toEqual(requestBody);
      expect(logs[0].responseBody).toEqual(responseBody);
    });
  });
});
