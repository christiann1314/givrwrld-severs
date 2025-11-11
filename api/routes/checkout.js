// Checkout Session Route
import express from 'express';
import Stripe from 'stripe';
import { getPlan, getDecryptedSecret } from '../utils/mysql.js';
import { authenticate } from '../middleware/auth.js';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/checkout/create-session
 * Create Stripe checkout session
 */
router.post('/create-session', authenticate, async (req, res) => {
  try {
    const { plan_id, item_type, term, region, server_name, addons } = req.body;

    // Validate input
    if (!plan_id || !item_type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'plan_id and item_type are required'
      });
    }

    // Create order first (pending status)
    const orderId = uuidv4();
    const serverName = server_name || `${plan_id.split('-')[0]}-${Date.now()}`;
    
    await pool.execute(
      `INSERT INTO orders (id, user_id, item_type, plan_id, term, region, server_name, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [orderId, req.userId, item_type, plan_id, term || 'monthly', region || 'us-central', serverName]
    );

    // Get plan from MySQL
    const plan = await getPlan(plan_id);
    if (!plan || plan.item_type !== item_type || !plan.is_active) {
      return res.status(404).json({
        error: 'Plan not found or inactive'
      });
    }

    // Get AES key and decrypt Stripe secret
    const aesKey = process.env.AES_KEY;
    if (!aesKey) {
      throw new Error('AES_KEY environment variable not set');
    }

    const stripeSecretKey = await getDecryptedSecret('stripe', 'STRIPE_SECRET_KEY', aesKey);
    if (!stripeSecretKey) {
      return res.status(500).json({
        error: 'Payment system configuration error'
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);

    // Build line items
    const lineItems = [{ price: plan.stripe_price_id, quantity: 1 }];

    // TODO: Add addon support if needed

    // Get origin from request
    const origin = req.headers.origin || process.env.FRONTEND_URL || process.env.PUBLIC_SITE_URL || 'https://givrwrldservers.com';
    const successUrl = `${origin}/success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout/cancel?order_id=${orderId}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        order_id: orderId,
        user_id: req.userId,
        item_type: item_type,
        plan_id: plan_id,
        term: term || 'monthly',
        region: region || 'us-central',
        server_name: serverName,
        addons: JSON.stringify(addons || [])
      },
      customer_email: req.user?.email,
      subscription_data: {
        metadata: {
          user_id: req.userId,
          plan_id: plan_id
        }
      }
    });

    // Store session in order_sessions table
    try {
      await pool.execute(
        `INSERT INTO order_sessions (order_id, stripe_session_id, status)
         VALUES (?, ?, 'created')
         ON DUPLICATE KEY UPDATE stripe_session_id = VALUES(stripe_session_id)`,
        [orderId, session.id]
      );
    } catch (sessionError) {
      console.warn('Failed to store session in order_sessions:', sessionError);
      // Don't fail the request if session storage fails
    }

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

export default router;


