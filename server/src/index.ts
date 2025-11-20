import express, { type ErrorRequestHandler, type Request } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { tracingMiddleware } from './middleware/tracing.js';
import { stateManager, type DemoState } from './domain/state.js';
import { eventBroadcaster } from './domain/events.js';
import { logger } from './lib/logger.js';
import { type DemoCustomer, type DemoPaykey, type DemoCharge } from './domain/types.js';

// Import routes
import customersRouter from './routes/customers.js';
import bridgeRouter from './routes/bridge.js';
import paykeysRouter from './routes/paykeys.js';
import chargesRouter from './routes/charges.js';
import webhooksRouter from './routes/webhooks.js';
import stateRouter from './routes/state.js';
import generatorProxyRouter from './routes/generator-proxy.js';

const app = express();

// Middleware
app.use(cors({ origin: config.server.corsOrigin }));
app.use(
  express.json({
    verify: (req: Request & { rawBody?: string }, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
app.use(tracingMiddleware);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.straddle.environment,
  });
});

// API routes
app.use('/api/customers', customersRouter);
app.use('/api/bridge', bridgeRouter);
app.use('/api/paykeys', paykeysRouter);
app.use('/api/charges', chargesRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api', stateRouter);
app.use('/api/generator', generatorProxyRouter);

// Subscribe to state changes and broadcast to SSE clients
stateManager.on('state:change', (state: DemoState) => {
  eventBroadcaster.broadcast('state:change', state as unknown as Record<string, unknown>);
});

stateManager.on('state:customer', (customer: DemoCustomer) => {
  eventBroadcaster.broadcast('state:customer', customer as unknown as Record<string, unknown>);
});

stateManager.on('state:paykey', (paykey: DemoPaykey) => {
  eventBroadcaster.broadcast('state:paykey', paykey as unknown as Record<string, unknown>);
});

stateManager.on('state:charge', (charge: DemoCharge) => {
  eventBroadcaster.broadcast('state:charge', charge as unknown as Record<string, unknown>);
});

stateManager.on('state:reset', () => {
  eventBroadcaster.broadcast('state:reset', {});
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error('Server error', err);

  // Handle err safely (ErrorRequestHandler types err as any)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const error = err as Error & { status?: number };
  const status = error.status ?? 500;
  const message = error.message || 'Internal server error';
  const stack = error.stack;

  res.status(status).json({
    error: message,
    details: config.server.nodeEnv === 'development' ? stack : undefined,
  });
};

app.use(errorHandler);

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info('Straddle NerdCon Demo Server starting', {
    port: PORT,
    environment: config.straddle.environment,
    corsOrigin: config.server.corsOrigin,
  });

  logger.info('Webhook endpoint configured', {
    local: `http://localhost:${PORT}/api/webhooks/straddle`,
    ngrok: config.webhook.ngrokUrl ? `${config.webhook.ngrokUrl}/api/webhooks/straddle` : undefined,
  });

  if (!config.webhook.ngrokUrl) {
    logger.warn('NGROK_URL not set - configure ngrok for webhook testing');
  }

  logger.info('Server ready', {
    sseEndpoint: `http://localhost:${PORT}/api/events/stream`,
    plaidConfigured: !!config.plaid.processorToken,
  });

  if (!config.straddle.apiKey && config.server.nodeEnv !== 'test') {
    logger.warn('STRADDLE_API_KEY is not set - Straddle SDK calls will fail until configured');
  }
});
