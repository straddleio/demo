import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { tracingMiddleware } from './middleware/tracing.js';
import { stateManager } from './domain/state.js';
import { eventBroadcaster } from './domain/events.js';

// Import routes
import customersRouter from './routes/customers.js';
import bridgeRouter from './routes/bridge.js';
import paykeysRouter from './routes/paykeys.js';
import chargesRouter from './routes/charges.js';
import webhooksRouter from './routes/webhooks.js';
import stateRouter from './routes/state.js';

const app = express();

// Middleware
app.use(cors({ origin: config.server.corsOrigin }));
app.use(express.json());
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

// Subscribe to state changes and broadcast to SSE clients
stateManager.on('state:change', (state) => {
  eventBroadcaster.broadcast('state:change', state);
});

stateManager.on('state:customer', (customer) => {
  eventBroadcaster.broadcast('state:customer', customer);
});

stateManager.on('state:paykey', (paykey) => {
  eventBroadcaster.broadcast('state:paykey', paykey);
});

stateManager.on('state:charge', (charge) => {
  eventBroadcaster.broadcast('state:charge', charge);
});

stateManager.on('state:reset', () => {
  eventBroadcaster.broadcast('state:reset', {});
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: config.server.nodeEnv === 'development' ? err.stack : undefined,
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Straddle NerdCon Demo Server running on port ${PORT}`);
  console.log(`📡 Environment: ${config.straddle.environment}`);
  console.log(`🔗 CORS origin: ${config.server.corsOrigin}`);
  console.log(`📬 Webhook endpoint (local): http://localhost:${PORT}/api/webhooks/straddle`);

  if (config.webhook.ngrokUrl) {
    console.log(`📬 Webhook endpoint (ngrok): ${config.webhook.ngrokUrl}/api/webhooks/straddle`);
    console.log(`   → Use this URL in Straddle webhook settings`);
  } else {
    console.log(`⚠️  NGROK_URL not set - configure ngrok for webhook testing`);
  }

  console.log(`📊 SSE endpoint: http://localhost:${PORT}/api/events/stream`);

  if (config.plaid.processorToken) {
    console.log(`✅ Plaid processor token configured`);
  }
});
