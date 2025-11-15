import { Router, Request, Response } from 'express';
import { stateManager } from '../domain/state.js';
import { getRequestLogs, clearRequestLogs } from '../domain/logs.js';
import { eventBroadcaster } from '../domain/events.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * GET /api/state
 * Get current demo state (customer, paykey, charge)
 */
router.get('/state', (_req: Request, res: Response) => {
  const state = stateManager.getState();
  res.json(state);
});

/**
 * POST /api/reset
 * Reset demo state and clear logs
 */
router.post('/reset', (_req: Request, res: Response) => {
  stateManager.reset();
  clearRequestLogs();

  // Broadcast reset event to connected clients
  eventBroadcaster.broadcast('state:reset', {});

  res.json({ success: true, message: 'Demo state reset' });
});

/**
 * GET /api/logs
 * Get API request logs
 */
router.get('/logs', (_req: Request, res: Response) => {
  const logs = getRequestLogs();
  res.json(logs);
});

/**
 * GET /api/events/stream
 * Server-Sent Events endpoint for real-time updates
 */
router.get('/events/stream', (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in nginx

  // Add client to broadcaster
  const clientId = uuidv4();
  eventBroadcaster.addClient(clientId, res);

  // Send current state on connection
  const state = stateManager.getState();
  res.write(`event: state:initial\n`);
  res.write(`data: ${JSON.stringify(state)}\n\n`);

  // Keep connection alive with periodic heartbeat
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 30000); // 30 seconds

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

/**
 * GET /api/outcomes
 * Get available sandbox outcomes
 */
router.get('/outcomes', (_req: Request, res: Response) => {
  res.json({
    customer: ['verified', 'review', 'rejected'],
    paykey: ['active', 'inactive', 'rejected'],
    charge: [
      'paid',
      'failed',
      'reversed_insufficient_funds',
      'on_hold_daily_limit',
      'cancelled_for_fraud_risk',
    ],
  });
});

export default router;
