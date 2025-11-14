import { Router, Request, Response } from 'express';
import straddleClient from '../sdk.js';
import { stateManager } from '../domain/state.js';
import { DemoCharge } from '../domain/types.js';

const router = Router();

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
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      config: {
        balance_check: 'enabled' as const,
        sandbox_outcome: (outcome === 'failed'
          ? 'failed_insufficient_funds'
          : outcome || 'paid') as 'paid' | 'failed_insufficient_funds' | 'reversed_insufficient_funds' | 'on_hold_daily_limit' | 'cancelled_for_fraud_risk'
      },
    };

    // Create charge via Straddle SDK
    const charge = await straddleClient.charges.create(chargeData);

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
        timestamp: h.timestamp,
        reason: h.reason,
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
    const charge = await straddleClient.charges.get(req.params.id);

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
        timestamp: h.timestamp,
        reason: h.reason,
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
    const charge = await straddleClient.charges.cancel(req.params.id);

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
    const charge = await straddleClient.charges.hold(req.params.id);

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
    const charge = await straddleClient.charges.release(req.params.id);

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
