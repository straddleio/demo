import { Router, Request, Response } from 'express';
import straddleClient from '../sdk.js';
import { stateManager } from '../domain/state.js';
import { DemoCharge } from '../domain/types.js';
import { addLogEntry } from '../domain/log-stream.js';

const router = Router();

/**
 * Get current date in Denver/Mountain Time (America/Denver)
 * Automatically handles MST/MDT transitions
 */
function getTodayInDenver(): string {
  const now = new Date();

  // Convert to Denver time using Intl.DateTimeFormat
  const denverDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  // Format is MM/DD/YYYY, convert to YYYY-MM-DD
  const [month, day, year] = denverDate.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * POST /api/charges
 * Create a charge (Pay by Bank payment)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { amount, paykey, currency, payment_date, outcome, description } = req.body;

    // Validate required fields
    if (!paykey) {
      return res.status(400).json({ error: 'paykey is required' });
    }

    // Generate unique external_id
    const external_id = `charge_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Default charge data
    const chargeData = {
      amount: amount || 10000, // $100.00 in cents
      paykey,
      currency: currency || 'USD',
      external_id, // Unique identifier for this charge
      description: description || 'Demo charge payment',
      consent_type: 'internet' as const,
      device: { ip_address: req.ip || '192.168.1.1' },
      payment_date: payment_date || getTodayInDenver(), // Use Denver Mountain Time
      config: {
        balance_check: 'enabled' as const,
        sandbox_outcome: (outcome === 'failed'
          ? 'failed_insufficient_funds'
          : outcome || 'paid') as 'paid' | 'failed_insufficient_funds' | 'reversed_insufficient_funds' | 'on_hold_daily_limit' | 'cancelled_for_fraud_risk'
      },
    };

    // Log outbound Straddle request to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-req',
      method: 'POST',
      path: '/charges',
      requestBody: chargeData,
      requestId: req.requestId,
    });

    // Create charge via Straddle SDK
    const startTime = Date.now();
    const charge = await straddleClient.charges.create(chargeData);
    const duration = Date.now() - startTime;

    // Log inbound Straddle response to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-res',
      statusCode: 200,
      responseBody: charge.data,
      duration,
      requestId: req.requestId,
    });

    // Debug: Log the actual charge response
    console.log('Straddle charge response (create):', JSON.stringify(charge, null, 2));

    // Map to demo charge format (Straddle wraps response in .data)
    const demoCharge: DemoCharge = {
      id: charge.data.id,
      customer_id: undefined,  // Charges are linked via paykey, not customer_id
      paykey: charge.data.paykey || '',
      amount: charge.data.amount,
      currency: charge.data.currency,
      status: charge.data.status,
      payment_date: charge.data.payment_date,
      created_at: charge.data.created_at || new Date().toISOString(),
      scheduled_at: (charge.data as any).scheduled_at || undefined,
      completed_at: (charge.data as any).completed_at || undefined,
      failure_reason: (charge.data as any).failure_reason || undefined,
      status_history: charge.data.status_history?.map((h: any) => ({
        status: h.status,
        timestamp: h.changed_at, // Map changed_at to timestamp
        reason: h.reason,
        message: h.message, // Include the message!
        source: h.source,
      })),
      sandbox_outcome: outcome,
    };

    // Update demo state
    stateManager.setCharge(demoCharge);

    return res.status(201).json(demoCharge);
  } catch (error: any) {
    console.error('Error creating charge:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Failed to create charge',
      details: error.error || null,
    });
  }
});

/**
 * GET /api/charges/:id
 * Get charge details with full lifecycle status history
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Log outbound Straddle request to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-req',
      method: 'GET',
      path: `/charges/${req.params.id}`,
      requestId: req.requestId,
    });

    const startTime = Date.now();
    const charge = await straddleClient.charges.get(req.params.id);
    const duration = Date.now() - startTime;

    // Log inbound Straddle response to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-res',
      statusCode: 200,
      responseBody: charge.data,
      duration,
      requestId: req.requestId,
    });

    // Debug: Log the actual charge response
    console.log('Straddle charge response (get):', JSON.stringify(charge, null, 2));

    // Map to demo charge format (Straddle wraps response in .data)
    const demoCharge: DemoCharge = {
      id: charge.data.id,
      customer_id: undefined,  // Charges are linked via paykey, not customer_id
      paykey: charge.data.paykey || '',
      amount: charge.data.amount,
      currency: charge.data.currency,
      status: charge.data.status,
      payment_date: charge.data.payment_date,
      created_at: charge.data.created_at || new Date().toISOString(),
      scheduled_at: (charge.data as any).scheduled_at || undefined,
      completed_at: (charge.data as any).completed_at || undefined,
      failure_reason: (charge.data as any).failure_reason || undefined,
      status_history: charge.data.status_history?.map((h: any) => ({
        status: h.status,
        timestamp: h.changed_at, // Map changed_at to timestamp
        reason: h.reason,
        message: h.message, // Include the message!
        source: h.source,
      })),
    };

    return res.json(demoCharge);
  } catch (error: any) {
    console.error('Error getting charge:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Failed to get charge',
    });
  }
});

/**
 * POST /api/charges/:id/cancel
 * Cancel a charge
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    // Log outbound Straddle request to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-req',
      method: 'POST',
      path: `/charges/${req.params.id}/cancel`,
      requestId: req.requestId,
    });

    const startTime = Date.now();
    const charge = await straddleClient.charges.cancel(req.params.id);
    const duration = Date.now() - startTime;

    // Log inbound Straddle response to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-res',
      statusCode: 200,
      responseBody: charge.data,
      duration,
      requestId: req.requestId,
    });

    // Straddle wraps response in .data
    res.json(charge.data);
  } catch (error: any) {
    console.error('Error cancelling charge:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to cancel charge',
    });
  }
});

/**
 * POST /api/charges/:id/hold
 * Place a hold on a charge
 */
router.post('/:id/hold', async (req: Request, res: Response) => {
  try {
    // Log outbound Straddle request to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-req',
      method: 'POST',
      path: `/charges/${req.params.id}/hold`,
      requestId: req.requestId,
    });

    const startTime = Date.now();
    const charge = await straddleClient.charges.hold(req.params.id);
    const duration = Date.now() - startTime;

    // Log inbound Straddle response to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-res',
      statusCode: 200,
      responseBody: charge.data,
      duration,
      requestId: req.requestId,
    });

    // Straddle wraps response in .data
    res.json(charge.data);
  } catch (error: any) {
    console.error('Error holding charge:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to hold charge',
    });
  }
});

/**
 * POST /api/charges/:id/release
 * Release a hold on a charge
 */
router.post('/:id/release', async (req: Request, res: Response) => {
  try {
    // Log outbound Straddle request to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-req',
      method: 'POST',
      path: `/charges/${req.params.id}/release`,
      requestId: req.requestId,
    });

    const startTime = Date.now();
    const charge = await straddleClient.charges.release(req.params.id);
    const duration = Date.now() - startTime;

    // Log inbound Straddle response to stream
    addLogEntry({
      timestamp: new Date().toISOString(),
      type: 'straddle-res',
      statusCode: 200,
      responseBody: charge.data,
      duration,
      requestId: req.requestId,
    });

    // Straddle wraps response in .data
    res.json(charge.data);
  } catch (error: any) {
    console.error('Error releasing charge:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to release charge',
    });
  }
});

export default router;
