import { Router, Request, Response } from 'express';
import straddleClient from '../sdk.js';
import { DemoPaykey } from '../domain/types.js';

const router = Router();

/**
 * GET /api/paykeys/:id
 * Get paykey details with institution, balance, ownership
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const paykey = await straddleClient.paykeys.get(req.params.id);

    // Debug: Log the actual paykey response
    console.log('Straddle paykey response (get):', JSON.stringify(paykey, null, 2));

    // Map to demo paykey format (Straddle wraps response in .data)
    const paykeyData = paykey.data as any; // SDK types don't expose all fields
    const demoPaykey: DemoPaykey = {
      id: paykeyData.id,
      paykey: paykeyData.paykey || '', // The actual token to use in charges
      customer_id: paykeyData.customer_id,
      status: paykeyData.status,
      institution: paykeyData.institution ? {
        name: paykeyData.institution.name || 'Unknown',
        logo: paykeyData.institution.logo
      } : undefined,
      ownership_verified: paykeyData.ownership_verified || false,
      balance: paykeyData.balance ? {
        available: paykeyData.balance.available || 0,
        currency: paykeyData.balance.currency || 'USD'
      } : undefined,
      account_type: paykeyData.account_type,
      linked_at: paykeyData.created_at || new Date().toISOString(),
    };

    res.json(demoPaykey);
  } catch (error: any) {
    console.error('Error getting paykey:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to get paykey',
    });
  }
});

/**
 * POST /api/paykeys/:id/cancel
 * Cancel a paykey
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const paykey = await straddleClient.paykeys.cancel(req.params.id);

    // Straddle wraps response in .data
    res.json(paykey.data);
  } catch (error: any) {
    console.error('Error cancelling paykey:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to cancel paykey',
    });
  }
});

export default router;
