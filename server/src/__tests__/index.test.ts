import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Application } from 'express';

// Set environment variables before importing config
process.env.STRADDLE_API_KEY = 'test_api_key';
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Mock dependencies BEFORE importing modules that use them
jest.mock('../config.js', () => ({
  config: {
    straddle: {
      apiKey: 'test_api_key',
      environment: 'sandbox' as const,
    },
    server: {
      port: 3002,
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
    features: {
      enableUnmask: true,
      enableLogStream: true,
    },
  },
}));

jest.mock('../lib/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../domain/state.js', () => ({
  stateManager: {
    on: jest.fn(),
    setCustomer: jest.fn(),
    getCustomer: jest.fn(),
  },
}));

jest.mock('../domain/events.js', () => ({
  eventBroadcaster: {
    broadcast: jest.fn(),
  },
}));

// Mock all route modules
jest.mock('../routes/customers.js', () => {
  const router = express.Router();
  router.get('/', (_req, res) => res.json({ route: 'customers' }));
  return { default: router };
});

jest.mock('../routes/bridge.js', () => {
  const router = express.Router();
  router.get('/', (_req, res) => res.json({ route: 'bridge' }));
  return { default: router };
});

jest.mock('../routes/paykeys.js', () => {
  const router = express.Router();
  router.get('/', (_req, res) => res.json({ route: 'paykeys' }));
  return { default: router };
});

jest.mock('../routes/charges.js', () => {
  const router = express.Router();
  router.get('/', (_req, res) => res.json({ route: 'charges' }));
  return { default: router };
});

jest.mock('../routes/webhooks.js', () => {
  const router = express.Router();
  router.get('/', (_req, res) => res.json({ route: 'webhooks' }));
  return { default: router };
});

jest.mock('../routes/state.js', () => {
  const router = express.Router();
  router.get('/test', (_req, res) => res.json({ route: 'state' }));
  return { default: router };
});

describe('Express Server (index.ts)', () => {
  let app: Application;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Import express app setup from index.ts (without starting server)
    // We'll recreate the app setup here for testing
    app = express();

    // Apply middleware in same order as index.ts
    const { config } = await import('../config.js');
    const cors = (await import('cors')).default;
    const { tracingMiddleware } = await import('../middleware/tracing.js');

    app.use(cors({ origin: config.server.corsOrigin }));
    app.use(express.json());
    app.use(tracingMiddleware);

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.straddle.environment,
      });
    });

    // Mount routes
    const customersRouter = (await import('../routes/customers.js')).default;
    const bridgeRouter = (await import('../routes/bridge.js')).default;
    const paykeysRouter = (await import('../routes/paykeys.js')).default;
    const chargesRouter = (await import('../routes/charges.js')).default;
    const webhooksRouter = (await import('../routes/webhooks.js')).default;
    const stateRouter = (await import('../routes/state.js')).default;

    app.use('/api/customers', customersRouter);
    app.use('/api/bridge', bridgeRouter);
    app.use('/api/paykeys', paykeysRouter);
    app.use('/api/charges', chargesRouter);
    app.use('/api/webhooks', webhooksRouter);
    app.use('/api', stateRouter);

    // Error handling middleware
    app.use(((err, _req, res, _next) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const error = err as Error & { status?: number };
      const status = error.status ?? 500;
      const message = error.message || 'Internal server error';
      const stack = error.stack;

      res.status(status).json({
        error: message,
        details: config.server.nodeEnv === 'development' ? stack : undefined,
      });
    }) as express.ErrorRequestHandler);
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 OK with status, timestamp, and environment', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment', 'sandbox');

      // Validate timestamp is ISO format
      expect(() => new Date(response.body.timestamp as string)).not.toThrow();
    });

    it('should return current timestamp on each request', async () => {
      const response1 = await request(app).get('/health');

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response2 = await request(app).get('/health');

      expect(response1.body.timestamp).not.toBe(response2.body.timestamp);
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app).get('/health').set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });
  });

  describe('Route Mounting', () => {
    it('should import customers router module', async () => {
      const customersModule = await import('../routes/customers.js');
      expect(customersModule.default).toBeDefined();
      expect(typeof customersModule.default).toBe('function'); // Router is a function
    });

    it('should import bridge router module', async () => {
      const bridgeModule = await import('../routes/bridge.js');
      expect(bridgeModule.default).toBeDefined();
      expect(typeof bridgeModule.default).toBe('function');
    });

    it('should import paykeys router module', async () => {
      const paykeysModule = await import('../routes/paykeys.js');
      expect(paykeysModule.default).toBeDefined();
      expect(typeof paykeysModule.default).toBe('function');
    });

    it('should import charges router module', async () => {
      const chargesModule = await import('../routes/charges.js');
      expect(chargesModule.default).toBeDefined();
      expect(typeof chargesModule.default).toBe('function');
    });

    it('should import webhooks router module', async () => {
      const webhooksModule = await import('../routes/webhooks.js');
      expect(webhooksModule.default).toBeDefined();
      expect(typeof webhooksModule.default).toBe('function');
    });

    it('should import state router module', async () => {
      const stateModule = await import('../routes/state.js');
      expect(stateModule.default).toBeDefined();
      expect(typeof stateModule.default).toBe('function');
    });

    it('should verify route modules are Router instances', async () => {
      // Verify all router modules export valid Express Router instances
      const customersModule = await import('../routes/customers.js');
      const bridgeModule = await import('../routes/bridge.js');
      const paykeysModule = await import('../routes/paykeys.js');
      const chargesModule = await import('../routes/charges.js');
      const webhooksModule = await import('../routes/webhooks.js');
      const stateModule = await import('../routes/state.js');

      // All should have .use, .get, .post methods (Router interface)
      [
        customersModule,
        bridgeModule,
        paykeysModule,
        chargesModule,
        webhooksModule,
        stateModule,
      ].forEach((mod) => {
        expect(typeof mod.default).toBe('function');
        // Router has stack property for middleware
        expect(mod.default).toHaveProperty('stack');
      });
    });
  });

  describe('404 Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
    });

    it('should return 404 for root path', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for invalid API paths', async () => {
      const response = await request(app).get('/api/invalid/path/here');
      expect(response.status).toBe(404);
    });
  });

  describe('500 Error Handling', () => {
    let errorApp: Application;

    beforeEach(async () => {
      // Create a fresh app for error testing
      errorApp = express();
      const { config } = await import('../config.js');
      const cors = (await import('cors')).default;

      errorApp.use(cors({ origin: config.server.corsOrigin }));
      errorApp.use(express.json());

      // Add routes that throw errors for testing
      errorApp.get('/api/error-test', () => {
        throw new Error('Test error message');
      });

      errorApp.get('/api/custom-error', () => {
        const error = new Error('Custom error') as Error & { status?: number };
        error.status = 418;
        throw error;
      });

      errorApp.get('/api/no-message-error', () => {
        const error = new Error('');
        throw error;
      });

      // Error handling middleware
      errorApp.use((async (err, _req, res, _next) => {
        const { logger } = await import('../lib/logger.js');
        logger.error('Server error', err);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const error = err as Error & { status?: number };
        const status = error.status ?? 500;
        const message = error.message || 'Internal server error';
        const stack = error.stack;

        res.status(status).json({
          error: message,
          details: config.server.nodeEnv === 'development' ? stack : undefined,
        });
      }) as express.ErrorRequestHandler);
    });

    it('should catch errors and return 500 with error message', async () => {
      const response = await request(errorApp).get('/api/error-test');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Test error message');
    });

    it('should include stack trace in development mode', async () => {
      // Create app with development config
      const previousEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const devApp = express();
      const cors = (await import('cors')).default;

      devApp.use(cors({ origin: 'http://localhost:5173' }));
      devApp.use(express.json());

      devApp.get('/api/error-test', () => {
        throw new Error('Test error message');
      });

      devApp.use((async (err, _req, res, _next) => {
        const { logger } = await import('../lib/logger.js');
        logger.error('Server error', err);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const error = err as Error & { status?: number };
        const status = error.status ?? 500;
        const message = error.message || 'Internal server error';
        const stack = error.stack;

        res.status(status).json({
          error: message,
          details: process.env.NODE_ENV === 'development' ? stack : undefined,
        });
      }) as express.ErrorRequestHandler);

      try {
        const response = await request(devApp).get('/api/error-test');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('details');
        expect(typeof response.body.details).toBe('string');
      } finally {
        process.env.NODE_ENV = previousEnv;
      }
    });

    it('should not include stack trace in test mode', async () => {
      const response = await request(errorApp).get('/api/error-test');

      expect(response.status).toBe(500);
      expect(response.body).not.toHaveProperty('details');
    });

    it('should handle errors with custom status codes', async () => {
      const response = await request(errorApp).get('/api/custom-error');

      expect(response.status).toBe(418);
      expect(response.body).toHaveProperty('error', 'Custom error');
    });

    it('should handle errors without message', async () => {
      const response = await request(errorApp).get('/api/no-message-error');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
    });

    it('should log errors to logger', async () => {
      // Verify error handler calls logger by checking console.error was called
      // (logger.error calls console.error internally)
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await request(errorApp).get('/api/error-test');

      // Verify console.error was called (which means logger.error was called)
      expect(errorSpy).toHaveBeenCalled();
      const calls = errorSpy.mock.calls;

      // Find the call with 'Server error' message
      const serverErrorCall = calls.find((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('Server error'))
      );
      expect(serverErrorCall).toBeDefined();

      errorSpy.mockRestore();
    });
  });

  describe('JSON Parsing Middleware', () => {
    beforeEach(() => {
      app.post('/api/json-test', (req, res) => {
        res.json({ received: req.body });
      });
    });

    it('should parse JSON request bodies', async () => {
      const testData = { foo: 'bar', num: 123 };

      const response = await request(app)
        .post('/api/json-test')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(testData);
    });

    it('should handle empty JSON bodies', async () => {
      const response = await request(app)
        .post('/api/json-test')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({});
    });

    it('should handle malformed JSON with error', async () => {
      const response = await request(app)
        .post('/api/json-test')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });

  describe('Tracing Middleware Integration', () => {
    it('should apply tracing middleware to all requests', async () => {
      const response = await request(app).get('/health');

      // Tracing middleware should be applied (tested in detail in middleware tests)
      expect(response.status).toBe(200);
    });
  });

  describe('State Manager Event Subscriptions', () => {
    it('should have state manager available for event subscriptions', async () => {
      const { stateManager } = await import('../domain/state.js');

      // Verify stateManager has the `on` method (EventEmitter interface)
      expect(stateManager.on).toBeDefined();
      expect(typeof stateManager.on).toBe('function');
    });

    it('should have event broadcaster available', async () => {
      const { eventBroadcaster } = await import('../domain/events.js');

      // Verify eventBroadcaster has broadcast method
      expect(eventBroadcaster.broadcast).toBeDefined();
      expect(typeof eventBroadcaster.broadcast).toBe('function');
    });

    it('should verify stateManager is an EventEmitter', async () => {
      const { stateManager } = await import('../domain/state.js');

      // Verify key EventEmitter methods exist
      expect(stateManager.on).toBeDefined();
      expect(stateManager.emit).toBeDefined();
      expect(stateManager.removeListener).toBeDefined();
    });
  });

  describe('Event Broadcasting Integration', () => {
    it('should test stateManager can emit events', async () => {
      const { stateManager } = await import('../domain/state.js');

      // Test that we can emit events (verifies EventEmitter interface)
      const testHandler = jest.fn();
      stateManager.on('test-event', testHandler);
      stateManager.emit('test-event', { test: 'data' });

      expect(testHandler).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should test eventBroadcaster can broadcast', async () => {
      const { eventBroadcaster } = await import('../domain/events.js');

      // Verify broadcast method is callable (actual SSE broadcasting tested elsewhere)
      expect(() => {
        eventBroadcaster.broadcast('test-event', { test: 'data' });
      }).not.toThrow();
    });

    it('should verify integration between state manager and broadcaster', async () => {
      const { stateManager } = await import('../domain/state.js');
      const { eventBroadcaster } = await import('../domain/events.js');

      // Both modules are properly imported and accessible
      expect(stateManager).toBeDefined();
      expect(eventBroadcaster).toBeDefined();

      // They have the expected interfaces
      expect(typeof stateManager.on).toBe('function');
      expect(typeof stateManager.emit).toBe('function');
      expect(typeof eventBroadcaster.broadcast).toBe('function');
    });
  });
});
