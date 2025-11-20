import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Request, Response } from 'express';
import { tracingMiddleware, getTracingHeaders } from '../tracing.js';

describe('Tracing Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(tracingMiddleware);
    app.use(express.json());

    // Test route to verify headers
    app.get('/test', (req: Request, res: Response) => {
      res.json({
        requestId: req.requestId,
        correlationId: req.correlationId,
        idempotencyKey: req.idempotencyKey,
        startTime: req.startTime,
      });
    });

    app.post('/test', (req: Request, res: Response) => {
      res.json({
        requestId: req.requestId,
        correlationId: req.correlationId,
        idempotencyKey: req.idempotencyKey,
        startTime: req.startTime,
      });
    });

    app.patch('/test', (req: Request, res: Response) => {
      res.json({
        requestId: req.requestId,
        correlationId: req.correlationId,
        idempotencyKey: req.idempotencyKey,
        startTime: req.startTime,
      });
    });

    jest.clearAllMocks();
  });

  describe('Request-Id header', () => {
    it('should generate Request-Id header for GET requests', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.headers['request-id']).toBeDefined();
      expect(response.headers['request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body.requestId).toBe(response.headers['request-id']);
    });

    it('should generate Request-Id header for POST requests', async () => {
      const response = await request(app).post('/test').send({});

      expect(response.status).toBe(200);
      expect(response.headers['request-id']).toBeDefined();
      expect(response.headers['request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body.requestId).toBe(response.headers['request-id']);
    });

    it('should preserve existing Request-Id header if provided', async () => {
      const customRequestId = 'custom-request-id-12345';
      const response = await request(app).get('/test').set('Request-Id', customRequestId);

      expect(response.status).toBe(200);
      expect(response.headers['request-id']).toBe(customRequestId);
      expect(response.body.requestId).toBe(customRequestId);
    });

    it('should generate unique Request-Id for each request', async () => {
      const response1 = await request(app).get('/test');
      const response2 = await request(app).get('/test');

      expect(response1.headers['request-id']).toBeDefined();
      expect(response2.headers['request-id']).toBeDefined();
      expect(response1.headers['request-id']).not.toBe(response2.headers['request-id']);
    });
  });

  describe('Correlation-Id header', () => {
    it('should generate Correlation-Id header for GET requests', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.headers['correlation-id']).toBeDefined();
      expect(response.headers['correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body.correlationId).toBe(response.headers['correlation-id']);
    });

    it('should generate Correlation-Id header for POST requests', async () => {
      const response = await request(app).post('/test').send({});

      expect(response.status).toBe(200);
      expect(response.headers['correlation-id']).toBeDefined();
      expect(response.headers['correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body.correlationId).toBe(response.headers['correlation-id']);
    });

    it('should preserve existing Correlation-Id header if provided', async () => {
      const customCorrelationId = 'custom-correlation-id-67890';
      const response = await request(app).get('/test').set('Correlation-Id', customCorrelationId);

      expect(response.status).toBe(200);
      expect(response.headers['correlation-id']).toBe(customCorrelationId);
      expect(response.body.correlationId).toBe(customCorrelationId);
    });

    it('should generate unique Correlation-Id for each request', async () => {
      const response1 = await request(app).get('/test');
      const response2 = await request(app).get('/test');

      expect(response1.headers['correlation-id']).toBeDefined();
      expect(response2.headers['correlation-id']).toBeDefined();
      expect(response1.headers['correlation-id']).not.toBe(response2.headers['correlation-id']);
    });
  });

  describe('Idempotency-Key header', () => {
    it('should generate Idempotency-Key for POST requests', async () => {
      const response = await request(app).post('/test').send({});

      expect(response.status).toBe(200);
      expect(response.headers['idempotency-key']).toBeDefined();
      expect(response.headers['idempotency-key']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body.idempotencyKey).toBe(response.headers['idempotency-key']);
    });

    it('should generate Idempotency-Key for PATCH requests', async () => {
      const response = await request(app).patch('/test').send({});

      expect(response.status).toBe(200);
      expect(response.headers['idempotency-key']).toBeDefined();
      expect(response.headers['idempotency-key']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body.idempotencyKey).toBe(response.headers['idempotency-key']);
    });

    it('should NOT generate Idempotency-Key for GET requests', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.headers['idempotency-key']).toBeUndefined();
      expect(response.body.idempotencyKey).toBeUndefined();
    });

    it('should preserve existing Idempotency-Key header if provided', async () => {
      const customIdempotencyKey = 'custom-idempotency-key-abcdef';
      const response = await request(app)
        .post('/test')
        .set('Idempotency-Key', customIdempotencyKey)
        .send({});

      expect(response.status).toBe(200);
      expect(response.headers['idempotency-key']).toBe(customIdempotencyKey);
      expect(response.body.idempotencyKey).toBe(customIdempotencyKey);
    });

    it('should generate unique Idempotency-Key for each POST request', async () => {
      const response1 = await request(app).post('/test').send({});
      const response2 = await request(app).post('/test').send({});

      expect(response1.headers['idempotency-key']).toBeDefined();
      expect(response2.headers['idempotency-key']).toBeDefined();
      expect(response1.headers['idempotency-key']).not.toBe(response2.headers['idempotency-key']);
    });

    it('should generate unique Idempotency-Key for each PATCH request', async () => {
      const response1 = await request(app).patch('/test').send({});
      const response2 = await request(app).patch('/test').send({});

      expect(response1.headers['idempotency-key']).toBeDefined();
      expect(response2.headers['idempotency-key']).toBeDefined();
      expect(response1.headers['idempotency-key']).not.toBe(response2.headers['idempotency-key']);
    });
  });

  describe('startTime tracking', () => {
    it('should set startTime on request object', async () => {
      const beforeRequest = Date.now();
      const response = await request(app).get('/test');
      const afterRequest = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.startTime).toBeDefined();
      expect(response.body.startTime).toBeGreaterThanOrEqual(beforeRequest);
      expect(response.body.startTime).toBeLessThanOrEqual(afterRequest);
    });

    it('should set different startTime for each request', async () => {
      const response1 = await request(app).get('/test');
      // Add small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      const response2 = await request(app).get('/test');

      expect(response1.body.startTime).toBeDefined();
      expect(response2.body.startTime).toBeDefined();
      expect(response2.body.startTime).toBeGreaterThanOrEqual(response1.body.startTime);
    });
  });

  describe('preserve all existing headers', () => {
    it('should preserve all custom tracing headers when provided', async () => {
      const customHeaders = {
        requestId: 'custom-request-12345',
        correlationId: 'custom-correlation-67890',
        idempotencyKey: 'custom-idempotency-abcdef',
      };

      const response = await request(app)
        .post('/test')
        .set('Request-Id', customHeaders.requestId)
        .set('Correlation-Id', customHeaders.correlationId)
        .set('Idempotency-Key', customHeaders.idempotencyKey)
        .send({});

      expect(response.status).toBe(200);
      expect(response.headers['request-id']).toBe(customHeaders.requestId);
      expect(response.headers['correlation-id']).toBe(customHeaders.correlationId);
      expect(response.headers['idempotency-key']).toBe(customHeaders.idempotencyKey);
      expect(response.body.requestId).toBe(customHeaders.requestId);
      expect(response.body.correlationId).toBe(customHeaders.correlationId);
      expect(response.body.idempotencyKey).toBe(customHeaders.idempotencyKey);
    });

    it('should preserve partial custom headers and generate missing ones', async () => {
      const customRequestId = 'custom-request-99999';
      const response = await request(app).post('/test').set('Request-Id', customRequestId).send({});

      expect(response.status).toBe(200);
      expect(response.headers['request-id']).toBe(customRequestId);
      expect(response.headers['correlation-id']).toBeDefined();
      expect(response.headers['correlation-id']).not.toBe(customRequestId);
      expect(response.headers['idempotency-key']).toBeDefined();
      expect(response.headers['idempotency-key']).not.toBe(customRequestId);
    });
  });

  describe('getTracingHeaders function', () => {
    it('should return tracing headers for GET request', async () => {
      const mockApp = express();
      mockApp.use(tracingMiddleware);
      mockApp.get('/test-headers', (req: Request, res: Response) => {
        const headers = getTracingHeaders(req);
        res.json(headers);
      });

      const response = await request(mockApp).get('/test-headers');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('Request-Id');
      expect(response.body).toHaveProperty('Correlation-Id');
      expect(response.body).not.toHaveProperty('Idempotency-Key');
      expect(response.body['Request-Id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body['Correlation-Id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should return tracing headers including Idempotency-Key for POST request', async () => {
      const mockApp = express();
      mockApp.use(tracingMiddleware);
      mockApp.post('/test-headers', (req: Request, res: Response) => {
        const headers = getTracingHeaders(req);
        res.json(headers);
      });

      const response = await request(mockApp).post('/test-headers').send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('Request-Id');
      expect(response.body).toHaveProperty('Correlation-Id');
      expect(response.body).toHaveProperty('Idempotency-Key');
      expect(response.body['Request-Id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body['Correlation-Id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body['Idempotency-Key']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should return custom tracing headers when provided', async () => {
      const mockApp = express();
      mockApp.use(tracingMiddleware);
      mockApp.post('/test-headers', (req: Request, res: Response) => {
        const headers = getTracingHeaders(req);
        res.json(headers);
      });

      const customHeaders = {
        requestId: 'custom-req-001',
        correlationId: 'custom-corr-002',
        idempotencyKey: 'custom-idem-003',
      };

      const response = await request(mockApp)
        .post('/test-headers')
        .set('Request-Id', customHeaders.requestId)
        .set('Correlation-Id', customHeaders.correlationId)
        .set('Idempotency-Key', customHeaders.idempotencyKey)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body['Request-Id']).toBe(customHeaders.requestId);
      expect(response.body['Correlation-Id']).toBe(customHeaders.correlationId);
      expect(response.body['Idempotency-Key']).toBe(customHeaders.idempotencyKey);
    });
  });
});
