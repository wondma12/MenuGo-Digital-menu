const Stripe = require('stripe');
const { logger } = require('../utils/logger');

let stripe = null;

// Initialize Stripe
const initStripe = () => {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    logger.info('Stripe payment service initialized');
  } else {
    logger.warn('Stripe credentials not configured');
  }
};

// Create payment intent
const createPaymentIntent = async (amount, currency = (process.env.STRIPE_CURRENCY || 'ETB'), metadata = {}) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      payment_method_types: ['card'],
    });
    return paymentIntent;
  } catch (error) {
    logger.error('Create payment intent error:', error);
    throw error;
  }
};

// Confirm payment intent
const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
    return paymentIntent;
  } catch (error) {
    logger.error('Confirm payment intent error:', error);
    throw error;
  }
};

// Retrieve payment intent
const getPaymentIntent = async (paymentIntentId) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Get payment intent error:', error);
    throw error;
  }
};

// Create customer
const createCustomer = async (email, name, phone) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
    });
    return customer;
  } catch (error) {
    logger.error('Create customer error:', error);
    throw error;
  }
};

// Create subscription
const createSubscription = async (customerId, priceId) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  } catch (error) {
    logger.error('Create subscription error:', error);
    throw error;
  }
};

// Cancel subscription
const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return subscription;
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    throw error;
  }
};

// Create refund
const createRefund = async (paymentIntentId, amount = null) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  } catch (error) {
    logger.error('Create refund error:', error);
    throw error;
  }
};

// Create webhook endpoint
const createWebhookEndpoint = async (url, events) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const endpoint = await stripe.webhookEndpoints.create({
      url,
      enabled_events: events,
    });
    return endpoint;
  } catch (error) {
    logger.error('Create webhook endpoint error:', error);
    throw error;
  }
};

module.exports = {
  initStripe,
  createPaymentIntent,
  confirmPaymentIntent,
  getPaymentIntent,
  createCustomer,
  createSubscription,
  cancelSubscription,
  createRefund,
  createWebhookEndpoint,
};
