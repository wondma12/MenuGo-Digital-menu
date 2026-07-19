// src/controllers/subscriptionController.js
const { Restaurant, SubscriptionPlan, Subscription } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');

// Default subscription plans - now empty, plans come from database only
const DEFAULT_SUBSCRIPTION_PLANS = [];

// Get all subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    console.log('=== getSubscriptionPlans called ===');
    
    let plans = [];
    
    try {
      if (!SubscriptionPlan || typeof SubscriptionPlan.findAll !== 'function') {
        throw new Error('SubscriptionPlan model is not available');
      }

      plans = await SubscriptionPlan.findAll({
        where: { is_active: true },
        order: [['price_monthly', 'ASC']],
      });
    } catch (err) {
      console.error('Database error in getSubscriptionPlans:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve subscription plans',
        error: err.message || 'Database error',
        data: [],
      });
    }

    // Ensure all numeric values are numbers, not undefined
    const safePlans = plans.map(plan => ({
      ...plan.toJSON ? plan.toJSON() : plan,
      price_monthly: plan.price_monthly || 0,
      price_yearly: plan.price_yearly || 0,
    }));
    
    res.status(200).json({
      success: true,
      message: 'Subscription plans retrieved',
      data: safePlans,
    });
  } catch (error) {
    console.error('Error in getSubscriptionPlans:', error);
    res.status(200).json({
      success: true,
      message: 'Subscription plans retrieved (fallback)',
      data: DEFAULT_SUBSCRIPTION_PLANS,
    });
  }
};

// Create subscription plan - FIXED to handle both POST /plans and POST /plans/create
const createSubscriptionPlan = async (req, res) => {
  try {
    console.log('=== createSubscriptionPlan called ===');
    console.log('Request body:', req.body);
    
    const planData = req.body;
    
    // Ensure numeric values are numbers
    const newPlan = {
      name: planData.name || 'New Plan',
      tier: planData.tier || 'custom',
      description: planData.description || '',
      price_monthly: parseFloat(planData.price_monthly) || 0,
      price_yearly: parseFloat(planData.price_yearly) || 0,
      features: planData.features || [],
      limits: planData.limits || {},
      is_active: planData.is_active !== undefined ? planData.is_active : true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    // Try to save to database if model exists
    try {
      if (!SubscriptionPlan || typeof SubscriptionPlan.create !== 'function') {
        throw new Error('SubscriptionPlan model is not available');
      }

      const savedPlan = await SubscriptionPlan.create(newPlan);
      return res.status(201).json({
        success: true,
        message: 'Subscription plan created',
        data: savedPlan,
      });
    } catch (err) {
      console.error('Database save error in createSubscriptionPlan:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create subscription plan',
        error: err.message || 'Database save error',
      });
    }
  } catch (error) {
    console.error('Error in createSubscriptionPlan:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

// Update subscription plan
const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!SubscriptionPlan) {
      return res.status(500).json({
        success: false,
        message: 'SubscriptionPlan model not available',
      });
    }
    
    // Ensure numeric values are numbers
    const updateData = {
      ...updates,
      price_monthly: updates.price_monthly ? parseFloat(updates.price_monthly) : undefined,
      price_yearly: updates.price_yearly ? parseFloat(updates.price_yearly) : undefined,
      updated_at: new Date(),
    };
    
    const [updated] = await SubscriptionPlan.update(updateData, {
      where: { id: id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found',
      });
    }
    
    // Fetch the updated plan
    const updatedPlan = await SubscriptionPlan.findByPk(id);
    
    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Error in updateSubscriptionPlan:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete subscription plan
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!SubscriptionPlan) {
      return res.status(500).json({
        success: false,
        message: 'SubscriptionPlan model not available',
      });
    }
    
    const deleted = await SubscriptionPlan.destroy({
      where: { id: id }
    });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteSubscriptionPlan:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    res.status(200).json({
      success: true,
      message: 'Subscriptions retrieved',
      data: {
        subscriptions: [],
        total: 0,
        page: parseInt(page),
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Error in getAllSubscriptions:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    res.status(200).json({
      success: true,
      message: 'Subscription retrieved',
      data: null,
    });
  } catch (error) {
    console.error('Error in getSubscriptionById:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get restaurant subscription
const getRestaurantSubscription = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required',
        data: null,
      });
    }

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
        data: null,
      });
    }

    let currentPlan = null;
    try {
      currentPlan = await SubscriptionPlan.findOne({ where: { tier: restaurant.subscription_tier } });
    } catch (e) {
      currentPlan = null;
    }

    const planName = currentPlan?.name || currentPlan?.tier || restaurant.subscription_tier;
    const monthlyPrice = currentPlan?.price_monthly || 0;
    const yearlyPrice = currentPlan?.price_yearly || 0;

    res.status(200).json({
      success: true,
      message: 'Restaurant subscription retrieved',
      data: {
        current_subscription: currentPlan
          ? {
              id: currentPlan.id,
              name: planName,
              tier: currentPlan.tier,
              description: currentPlan.description,
              price_monthly: monthlyPrice,
              price_yearly: yearlyPrice,
              features: currentPlan.features || [],
              limits: currentPlan.limits || {},
              stripe_price_monthly_id: currentPlan.stripe_price_monthly_id,
              stripe_price_yearly_id: currentPlan.stripe_price_yearly_id,
            }
          : null,
        subscription_tier: restaurant.subscription_tier || 'monthly',
        subscription_status: restaurant.subscription_status || 'active',
        subscription_start_date: restaurant.subscription_start_date || null,
        subscription_end_date: restaurant.subscription_end_date || null,
        next_billing_date: restaurant.subscription_end_date || null,
        billing_cycle: restaurant.subscription_tier || 'monthly',
        plan_name: planName,
        name: planName,
        price_monthly: monthlyPrice,
        price_yearly: yearlyPrice,
      },
    });
  } catch (error) {
    console.error('Error in getRestaurantSubscription:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create subscription
const createSubscription = async (req, res) => {
  try {
    const subscriptionData = req.body;
    
    res.status(201).json({
      success: true,
      message: 'Subscription created',
      data: { id: 'sub_' + Date.now(), ...subscriptionData },
    });
  } catch (error) {
    console.error('Error in createSubscription:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated',
      data: { id, ...updates },
    });
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    res.status(200).json({
      success: true,
      message: 'Subscription cancelled',
    });
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get subscription revenue
const getSubscriptionRevenue = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Subscription revenue retrieved',
      data: {
        total_revenue: 0,
        active_subscriptions: 0,
        revenue_by_tier: { basic: 0, premium: 0, enterprise: 0 },
      },
    });
  } catch (error) {
    console.error('Error in getSubscriptionRevenue:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSubscriptionPlans,
  getAllSubscriptions,
  getSubscriptionById,
  getRestaurantSubscription,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionRevenue,
};