const crypto = require('crypto');
const { logger } = require('../utils/logger');
const { handleWebhook: handleStripeWebhook } = require('../controllers/subscriptionController');

// Verify webhook signature
const verifyWebhookSignature = (payload, signature, secret, header = 'stripe-signature') => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Webhook signature verification error:', error);
    return false;
  }
};

// Process Stripe webhook
const processStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!verifyWebhookSignature(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  return handleStripeWebhook(req, res);
};

// Process webhook with retry logic
const processWebhookWithRetry = async (webhookHandler, event, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await webhookHandler(event);
      return result;
    } catch (error) {
      lastError = error;
      logger.error(`Webhook attempt ${i + 1} failed:`, error);
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw lastError;
};

// Create webhook payload
const createWebhookPayload = (eventType, data) => {
  return {
    id: crypto.randomBytes(16).toString('hex'),
    type: eventType,
    created_at: new Date().toISOString(),
    data,
  };
};

// Send webhook (HTTP request)
const sendWebhook = async (url, payload, headers = {}) => {
  const fetch = require('node-fetch');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });
    
    return {
      success: response.ok,
      status: response.status,
      data: await response.text(),
    };
  } catch (error) {
    logger.error('Send webhook error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  verifyWebhookSignature,
  processStripeWebhook,
  processWebhookWithRetry,
  createWebhookPayload,
  sendWebhook,
};