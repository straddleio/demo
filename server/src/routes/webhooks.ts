import { Router, Request, Response } from 'express';
import { eventBroadcaster } from '../domain/events.js';
import { stateManager } from '../domain/state.js';

const router = Router();

/**
 * POST /api/webhooks/straddle
 * Receive webhooks from Straddle
 */
router.post('/straddle', async (req: Request, res: Response) => {
  try {
    const webhookEvent = req.body;

    // Webhook structure: { event_type, event_id, account_id, data }
    console.log('Received webhook:', {
      event_type: webhookEvent.event_type,
      event_id: webhookEvent.event_id,
      resource_id: webhookEvent.data?.id,
    });

    // Broadcast webhook event to connected SSE clients
    eventBroadcaster.broadcast('webhook', webhookEvent);

    // Handle specific webhook events (format: resource.action.v1)
    switch (webhookEvent.event_type) {
      case 'customer.created.v1':
      case 'customer.event.v1':
        // Update customer state if it matches current demo customer
        const state = stateManager.getState();
        if (state.customer && webhookEvent.data?.id === state.customer.id) {
          stateManager.updateCustomer({
            verification_status: webhookEvent.data.status,
            risk_score: webhookEvent.data.risk_score,
          });
        }
        break;

      case 'paykey.created.v1':
      case 'paykey.event.v1':
        // Update paykey state
        const paykeyState = stateManager.getState();
        if (paykeyState.paykey && webhookEvent.data?.id === paykeyState.paykey.id) {
          stateManager.setPaykey({
            ...paykeyState.paykey,
            status: webhookEvent.data.status,
          });
        }
        break;

      case 'charge.created.v1':
      case 'charge.event.v1':
        // Update charge state
        const chargeState = stateManager.getState();
        if (chargeState.charge && webhookEvent.data?.id === chargeState.charge.id) {
          stateManager.updateCharge({
            status: webhookEvent.data.status,
            completed_at: webhookEvent.data.completed_at,
            failure_reason: webhookEvent.data.failure_reason,
          });
        }
        break;

      default:
        console.log(`Unhandled webhook type: ${webhookEvent.event_type}`);
    }

    // Acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
