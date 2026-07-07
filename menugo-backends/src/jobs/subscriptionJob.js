const { Restaurant, Subscription, User, Notification } = require('../models');
const { sendEmail } = require('../services/emailService');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

// Check expiring subscriptions (7 days before expiration)
const checkExpiringSubscriptions = async () => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringSubscriptions = await Restaurant.findAll({
      where: {
        subscription_end_date: { [Op.lte]: sevenDaysFromNow },
        subscription_end_date: { [Op.gt]: new Date() },
        subscription_status: 'active',
      },
      include: [{ model: User, as: 'restaurant_owner', attributes: ['email', 'full_name'] }],
    });

    for (const restaurant of expiringSubscriptions) {
      const daysLeft = Math.ceil((restaurant.subscription_end_date - new Date()) / (1000 * 60 * 60 * 24));
      
      // Create notification
      await Notification.create({
        restaurant_id: restaurant.id,
        user_id: restaurant.owner_id,
        type: 'system',
        title: 'Subscription Expiring Soon',
        message: `Your ${restaurant.subscription_tier} subscription will expire in ${daysLeft} days. Please renew to continue using premium features.`,
        data: {
          subscription_tier: restaurant.subscription_tier,
          end_date: restaurant.subscription_end_date,
          days_left: daysLeft,
        },
      });

      // Send email
      if (restaurant.restaurant_owner && restaurant.restaurant_owner.email) {
        await sendSubscriptionExpiryEmail(restaurant.restaurant_owner.email, restaurant.restaurant_owner.full_name, {
          restaurant_name: restaurant.name,
          subscription_tier: restaurant.subscription_tier,
          end_date: restaurant.subscription_end_date,
          days_left: daysLeft,
        });
      }

      logger.info(`Expiring subscription notification sent for restaurant ${restaurant.id}`);
    }
  } catch (error) {
    logger.error('Error checking expiring subscriptions:', error);
    throw error;
  }
};

// Process expired subscriptions
const processExpiredSubscriptions = async () => {
  try {
    const expiredSubscriptions = await Restaurant.findAll({
      where: {
        subscription_end_date: { [Op.lt]: new Date() },
        subscription_status: { [Op.in]: ['active', 'trial'] },
      },
      include: [{ model: User, as: 'restaurant_owner', attributes: ['email', 'full_name'] }],
    });

    for (const restaurant of expiredSubscriptions) {
      // Downgrade to monthly plan
      const previousTier = restaurant.subscription_tier;
      await restaurant.update({
        subscription_tier: 'monthly',
        subscription_status: 'expired',
        max_menu_items: -1,
        max_users: -1,
        max_orders_per_day: -1,
      });

      // Create notification
      await Notification.create({
        restaurant_id: restaurant.id,
        user_id: restaurant.owner_id,
        type: 'system',
        title: 'Subscription Expired',
        message: `Your ${previousTier} subscription has expired. Your account has been downgraded to the Monthly plan.`,
        data: {
          previous_tier: previousTier,
          current_tier: 'monthly',
          end_date: restaurant.subscription_end_date,
        },
      });

      // Send email
      if (restaurant.restaurant_owner && restaurant.restaurant_owner.email) {
        await sendSubscriptionExpiredEmail(restaurant.restaurant_owner.email, restaurant.restaurant_owner.full_name, {
          restaurant_name: restaurant.name,
          previous_tier: previousTier,
          end_date: restaurant.subscription_end_date,
        });
      }

      logger.info(`Expired subscription processed for restaurant ${restaurant.id}`);
    }
  } catch (error) {
    logger.error('Error processing expired subscriptions:', error);
    throw error;
  }
};

// Send subscription expiry email
const sendSubscriptionExpiryEmail = async (email, name, data) => {
  const subject = `Your MenuGo Subscription is Expiring Soon`;
  const html = `
    <h2>Subscription Expiring Soon</h2>
    <p>Dear ${name},</p>
    <p>Your ${data.subscription_tier} subscription for <strong>${data.restaurant_name}</strong> will expire on <strong>${new Date(data.end_date).toLocaleDateString()}</strong> (${data.days_left} days from now).</p>
    <p>To avoid service interruption and continue enjoying premium features, please renew your subscription.</p>
    <p>If you have any questions, please contact our support team.</p>
    <br>
    <p>Best regards,<br>MenuGo Team</p>
  `;
  return sendEmail(email, subject, html);
};

// Send subscription expired email
const sendSubscriptionExpiredEmail = async (email, name, data) => {
  const subject = `Your MenuGo Subscription Has Expired`;
  const html = `
    <h2>Subscription Expired</h2>
    <p>Dear ${name},</p>
    <p>Your ${data.previous_tier} subscription for <strong>${data.restaurant_name}</strong> has expired on <strong>${new Date(data.end_date).toLocaleDateString()}</strong>.</p>
    <p>Your account has been downgraded to the Basic plan. To restore premium features, please renew your subscription.</p>
    <p>If you have any questions, please contact our support team.</p>
    <br>
    <p>Best regards,<br>MenuGo Team</p>
  `;
  return sendEmail(email, subject, html);
};

// Get subscription statistics
const getSubscriptionStats = async () => {
  try {
    const stats = {
      total: await Restaurant.count(),
      by_tier: {
        monthly: await Restaurant.count({ where: { subscription_tier: 'monthly' } }),
        six_month: await Restaurant.count({ where: { subscription_tier: 'six_month' } }),
        yearly: await Restaurant.count({ where: { subscription_tier: 'yearly' } }),
      },
      by_status: {
        trial: await Restaurant.count({ where: { subscription_status: 'trial' } }),
        active: await Restaurant.count({ where: { subscription_status: 'active' } }),
        past_due: await Restaurant.count({ where: { subscription_status: 'past_due' } }),
        cancelled: await Restaurant.count({ where: { subscription_status: 'cancelled' } }),
        expired: await Restaurant.count({ where: { subscription_status: 'expired' } }),
      },
      expiring_soon: await Restaurant.count({
        where: {
          subscription_end_date: { [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          subscription_end_date: { [Op.gt]: new Date() },
        },
      }),
      expired: await Restaurant.count({
        where: { subscription_end_date: { [Op.lt]: new Date() } },
      }),
    };
    return stats;
  } catch (error) {
    logger.error('Error getting subscription stats:', error);
    throw error;
  }
};

module.exports = {
  checkExpiringSubscriptions,
  processExpiredSubscriptions,
  getSubscriptionStats,
};