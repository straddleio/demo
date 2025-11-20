import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  addLogEntry,
  getLogStream,
  clearLogStream,
  parseStraddleError,
} from '../log-stream.js';

describe('Log Stream', () => {
  beforeEach(() => {
    clearLogStream();
  });

  describe('addLogEntry', () => {
    it('should add request entry to stream', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.000Z',
        type: 'request',
        method: 'POST',
        path: '/api/customers',
        requestBody: { name: 'Test User' },
        requestId: 'req_123',
        correlationId: 'corr_456',
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        timestamp: '2025-11-19T10:00:00.000Z',
        type: 'request',
        method: 'POST',
        path: '/api/customers',
        requestBody: { name: 'Test User' },
        requestId: 'req_123',
        correlationId: 'corr_456',
      });
      expect(logs[0].id).toMatch(/^log_\d+_[a-z0-9]+$/);
    });

    it('should add response entry to stream', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.100Z',
        type: 'response',
        statusCode: 200,
        responseBody: { success: true },
        duration: 150,
        requestId: 'req_123',
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        timestamp: '2025-11-19T10:00:00.100Z',
        type: 'response',
        statusCode: 200,
        responseBody: { success: true },
        duration: 150,
        requestId: 'req_123',
      });
    });

    it('should add straddle-req entry to stream', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.200Z',
        type: 'straddle-req',
        method: 'POST',
        path: '/customers',
        requestBody: { type: 'individual' },
        correlationId: 'corr_789',
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        type: 'straddle-req',
        method: 'POST',
        path: '/customers',
      });
    });

    it('should add straddle-res entry to stream', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.300Z',
        type: 'straddle-res',
        statusCode: 201,
        responseBody: { data: { id: 'cust_123' } },
        duration: 250,
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        type: 'straddle-res',
        statusCode: 201,
        responseBody: { data: { id: 'cust_123' } },
      });
    });

    it('should add webhook entry to stream', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.400Z',
        type: 'webhook',
        eventType: 'charge.paid',
        eventId: 'evt_123',
        webhookPayload: { charge_id: 'charge_123' },
        requestId: 'req_webhook_1',
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        type: 'webhook',
        eventType: 'charge.paid',
        eventId: 'evt_123',
        webhookPayload: { charge_id: 'charge_123' },
      });
    });

    it('should generate unique IDs for each entry', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.000Z',
        type: 'request',
        method: 'GET',
        path: '/api/state',
      });

      addLogEntry({
        timestamp: '2025-11-19T10:00:01.000Z',
        type: 'request',
        method: 'GET',
        path: '/api/state',
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(2);
      expect(logs[0].id).not.toBe(logs[1].id);
    });

    it('should add newest entries at the beginning', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.000Z',
        type: 'request',
        method: 'GET',
        path: '/first',
      });

      addLogEntry({
        timestamp: '2025-11-19T10:00:01.000Z',
        type: 'request',
        method: 'GET',
        path: '/second',
      });

      addLogEntry({
        timestamp: '2025-11-19T10:00:02.000Z',
        type: 'request',
        method: 'GET',
        path: '/third',
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(3);
      expect(logs[0].path).toBe('/third');
      expect(logs[1].path).toBe('/second');
      expect(logs[2].path).toBe('/first');
    });
  });

  describe('Stream size limiting', () => {
    it('should limit stream size to 200 entries', () => {
      // Add 250 entries (50 more than max)
      for (let i = 0; i < 250; i++) {
        addLogEntry({
          timestamp: new Date().toISOString(),
          type: 'request',
          method: 'GET',
          path: `/api/test/${i}`,
          requestId: `req_${i}`,
        });
      }

      const logs = getLogStream();
      expect(logs).toHaveLength(200);
    });

    it('should remove oldest entries when exceeding limit', () => {
      // Add 250 entries
      for (let i = 0; i < 250; i++) {
        addLogEntry({
          timestamp: new Date().toISOString(),
          type: 'request',
          method: 'GET',
          path: `/api/test/${i}`,
          requestId: `req_${i}`,
        });
      }

      const logs = getLogStream();

      // First entry should be the newest (249)
      expect(logs[0].requestId).toBe('req_249');

      // Last entry should be entry 50 (249 - 199)
      expect(logs[199].requestId).toBe('req_50');

      // Oldest entries (0-49) should be gone
      const hasOldEntries = logs.some((log) => log.requestId === 'req_0' || log.requestId === 'req_49');
      expect(hasOldEntries).toBe(false);
    });

    it('should maintain exactly 200 entries after multiple additions beyond limit', () => {
      // Add 300 entries in total
      for (let i = 0; i < 300; i++) {
        addLogEntry({
          timestamp: new Date().toISOString(),
          type: 'request',
          method: 'GET',
          path: `/api/test/${i}`,
        });
      }

      const logs = getLogStream();
      expect(logs).toHaveLength(200);
    });
  });

  describe('getLogStream', () => {
    it('should return all logs in chronological order (newest first)', () => {
      const timestamps = [
        '2025-11-19T10:00:00.000Z',
        '2025-11-19T10:00:01.000Z',
        '2025-11-19T10:00:02.000Z',
      ];

      timestamps.forEach((timestamp, i) => {
        addLogEntry({
          timestamp,
          type: 'request',
          method: 'GET',
          path: `/api/${i}`,
        });
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(3);
      expect(logs[0].timestamp).toBe(timestamps[2]);
      expect(logs[1].timestamp).toBe(timestamps[1]);
      expect(logs[2].timestamp).toBe(timestamps[0]);
    });

    it('should return copy of log stream to prevent external mutations', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.000Z',
        type: 'request',
        method: 'GET',
        path: '/api/test',
      });

      const logs1 = getLogStream();
      const logs2 = getLogStream();

      expect(logs1).toEqual(logs2);
      expect(logs1).not.toBe(logs2); // Different array references

      // Mutating returned array should not affect internal state
      logs1.push({
        id: 'fake_log',
        timestamp: '2025-11-19T11:00:00.000Z',
        type: 'request',
        method: 'POST',
        path: '/fake',
      });

      const logs3 = getLogStream();
      expect(logs3).toHaveLength(1); // Still only original entry
    });

    it('should return empty array when no logs exist', () => {
      const logs = getLogStream();
      expect(logs).toEqual([]);
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('clearLogStream', () => {
    it('should clear all logs from stream', () => {
      // Add multiple entries
      for (let i = 0; i < 10; i++) {
        addLogEntry({
          timestamp: new Date().toISOString(),
          type: 'request',
          method: 'GET',
          path: `/api/test/${i}`,
        });
      }

      expect(getLogStream()).toHaveLength(10);

      clearLogStream();

      expect(getLogStream()).toHaveLength(0);
      expect(getLogStream()).toEqual([]);
    });

    it('should allow adding entries after clearing', () => {
      addLogEntry({
        timestamp: '2025-11-19T10:00:00.000Z',
        type: 'request',
        method: 'GET',
        path: '/before',
      });

      clearLogStream();

      addLogEntry({
        timestamp: '2025-11-19T10:00:01.000Z',
        type: 'request',
        method: 'GET',
        path: '/after',
      });

      const logs = getLogStream();
      expect(logs).toHaveLength(1);
      expect(logs[0].path).toBe('/after');
    });

    it('should handle multiple clears without errors', () => {
      clearLogStream();
      clearLogStream();
      clearLogStream();

      expect(getLogStream()).toEqual([]);
    });
  });

  describe('Concurrent additions', () => {
    it('should handle rapid sequential additions', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({
        timestamp: new Date().toISOString(),
        type: 'request' as const,
        method: 'GET',
        path: `/api/test/${i}`,
      }));

      entries.forEach((entry) => addLogEntry(entry));

      const logs = getLogStream();
      expect(logs).toHaveLength(50);
    });

    it('should maintain data integrity with concurrent-like additions', () => {
      // Simulate concurrent additions by adding entries with identical timestamps
      const timestamp = '2025-11-19T10:00:00.000Z';

      for (let i = 0; i < 10; i++) {
        addLogEntry({
          timestamp,
          type: 'request',
          method: 'POST',
          path: `/api/concurrent/${i}`,
          requestId: `req_${i}`,
        });
      }

      const logs = getLogStream();
      expect(logs).toHaveLength(10);

      // All entries should have unique IDs despite same timestamp
      const ids = logs.map((log) => log.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);

      // All request IDs should be present
      const requestIds = logs.map((log) => log.requestId).sort();
      expect(requestIds).toEqual(['req_0', 'req_1', 'req_2', 'req_3', 'req_4', 'req_5', 'req_6', 'req_7', 'req_8', 'req_9']);
    });
  });

  describe('parseStraddleError', () => {
    it('should extract error from .error property', () => {
      const sdkError = {
        error: {
          type: 'invalid_request',
          code: 'INVALID_CUSTOMER',
          message: 'Customer not found',
        },
        status: 404,
      };

      const result = parseStraddleError(sdkError);
      expect(result).toEqual({
        type: 'invalid_request',
        code: 'INVALID_CUSTOMER',
        message: 'Customer not found',
      });
    });

    it('should parse stringified JSON from error message', () => {
      const sdkError = {
        message:
          '422 {"error":{"type":"invalid_request","code":"INVALID_PAYKEY","detail":"Paykey is inactive"}}',
      };

      const result = parseStraddleError(sdkError);
      expect(result).toEqual({
        error: {
          type: 'invalid_request',
          code: 'INVALID_PAYKEY',
          detail: 'Paykey is inactive',
        },
      });
    });

    it('should handle stringified error with different status codes', () => {
      const sdkError = {
        message: '400 {"error":{"type":"validation_error","code":"BAD_REQUEST"}}',
      };

      const result = parseStraddleError(sdkError);
      expect(result).toEqual({
        error: {
          type: 'validation_error',
          code: 'BAD_REQUEST',
        },
      });
    });

    it('should return null for plain error message without status code', () => {
      const sdkError = {
        message: 'Something went wrong',
      };

      const result = parseStraddleError(sdkError);
      expect(result).toBeNull();
    });

    it('should wrap error message in object when JSON parsing fails', () => {
      const sdkError = {
        message: '500 {invalid json}',
      };

      const result = parseStraddleError(sdkError);
      expect(result).toEqual({ message: '500 {invalid json}' });
    });

    it('should return null for null input', () => {
      const result = parseStraddleError(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = parseStraddleError(undefined);
      expect(result).toBeNull();
    });

    it('should return null for primitive types', () => {
      expect(parseStraddleError('error string')).toBeNull();
      expect(parseStraddleError(123)).toBeNull();
      expect(parseStraddleError(true)).toBeNull();
    });

    it('should return null for object without error or message', () => {
      const result = parseStraddleError({ foo: 'bar' });
      expect(result).toBeNull();
    });

    it('should prefer .error property over .message', () => {
      const sdkError = {
        error: {
          type: 'invalid_request',
          code: 'ERROR_CODE',
        },
        message: '400 {"error":{"type":"different_error"}}',
      };

      const result = parseStraddleError(sdkError);
      expect(result).toEqual({
        type: 'invalid_request',
        code: 'ERROR_CODE',
      });
    });
  });
});
