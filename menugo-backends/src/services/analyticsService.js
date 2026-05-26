// src/services/analyticsService.js (Backend - Node.js)
const { DailySalesSummary, MenuItemAnalytics, HourlyAnalytics, Order, MenuItem, User, Restaurant, SupportTicket, OrderItem } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');

// Generate daily sales summary
const generateDailySalesSummary = async (restaurantId, date = new Date()) => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({
      where: {
        restaurant_id: restaurantId,
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
    });

    const dineInOrders = orders.filter(o => o.order_type === 'dine_in');
    const takeawayOrders = orders.filter(o => o.order_type === 'takeaway');
    const deliveryOrders = orders.filter(o => o.order_type === 'delivery');

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const totalTax = orders.reduce((sum, o) => sum + parseFloat(o.tax_amount), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + parseFloat(o.discount_amount), 0);

    const [summary, created] = await DailySalesSummary.upsert({
      restaurant_id: restaurantId,
      date: startDate,
      total_orders: orders.length,
      total_revenue: totalRevenue,
      total_tax: totalTax,
      total_discount: totalDiscount,
      average_order_value: orders.length > 0 ? totalRevenue / orders.length : 0,
      dine_in_orders: dineInOrders.length,
      dine_in_revenue: dineInOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
      takeaway_orders: takeawayOrders.length,
      takeaway_revenue: takeawayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
      delivery_orders: deliveryOrders.length,
      delivery_revenue: deliveryOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
    });

    return summary;
  } catch (error) {
    logger.error('Generate daily sales summary error:', error);
    throw error;
  }
};

// Update menu item analytics
const updateMenuItemAnalytics = async (restaurantId, menuItemId, date = new Date()) => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const orderItems = await OrderItem.findAll({
      where: {
        menu_item_id: menuItemId,
        created_at: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: Order, as: 'item_order', where: { status: 'completed' } }],
    });

    const totalOrders = orderItems.length;
    const totalQuantity = orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
    const totalRevenue = orderItems.reduce((sum, oi) => sum + parseFloat(oi.subtotal), 0);

    await MenuItemAnalytics.upsert({
      restaurant_id: restaurantId,
      menu_item_id: menuItemId,
      date: startDate,
      order_count: totalOrders,
      quantity_sold: totalQuantity,
      revenue: totalRevenue,
    });
  } catch (error) {
    logger.error('Update menu item analytics error:', error);
    throw error;
  }
};

// Generate hourly analytics
const generateHourlyAnalytics = async (restaurantId, date = new Date()) => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({
      where: {
        restaurant_id: restaurantId,
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
    });

    const hourlyData = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { orders: 0, revenue: 0 };
    }

    orders.forEach(order => {
      const hour = order.created_at.getHours();
      hourlyData[hour].orders++;
      hourlyData[hour].revenue += parseFloat(order.total_amount);
    });

    for (const [hour, data] of Object.entries(hourlyData)) {
      await HourlyAnalytics.upsert({
        restaurant_id: restaurantId,
        date: startDate,
        hour: parseInt(hour),
        orders_count: data.orders,
        revenue: data.revenue,
      });
    }

    return hourlyData;
  } catch (error) {
    logger.error('Generate hourly analytics error:', error);
    throw error;
  }
};

// Get revenue trends
const getRevenueTrends = async (restaurantId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyData = await DailySalesSummary.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.gte]: startDate },
      },
      order: [['date', 'ASC']],
    });

    const trends = {
      daily: dailyData,
      total_revenue: dailyData.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0),
      average_daily: dailyData.length > 0 ? dailyData.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0) / dailyData.length : 0,
      growth: calculateGrowth(dailyData),
    };

    return trends;
  } catch (error) {
    logger.error('Get revenue trends error:', error);
    throw error;
  }
};

// Calculate growth percentage
const calculateGrowth = (data) => {
  if (data.length < 2) return 0;
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0) / secondHalf.length;
  
  return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
};

// Get popular items
const getPopularItems = async (restaurantId, limit = 10) => {
  try {
    const popularItems = await MenuItemAnalytics.findAll({
      where: { restaurant_id: restaurantId },
      attributes: [
        'menu_item_id',
        [sequelize.fn('SUM', sequelize.col('quantity_sold')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('order_count')), 'total_orders'],
      ],
      include: [{ model: MenuItem, as: 'analytics_item' }],
      group: ['menu_item_id', 'menu_item.id'],
      order: [[sequelize.literal('total_quantity'), 'DESC']],
      limit,
    });

    return popularItems;
  } catch (error) {
    logger.error('Get popular items error:', error);
    throw error;
  }
};

// Get platform dashboard data
const getPlatformDashboardData = async (startDate, endDate) => {
  try {
    // User stats
    const totalUsers = await User.count({ where: { deleted_at: null } });
    const activeUsers = await User.count({ 
      where: { 
        is_active: true, 
        deleted_at: null,
        last_login: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      } 
    });
    
    // Restaurant stats
    const totalRestaurants = await Restaurant.count({ where: { deleted_at: null } });
    
    // Order stats
    const totalOrders = await Order.count({ 
      where: { 
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed'
      } 
    });
    
    // Revenue stats
    const totalRevenue = await Order.sum('total_amount', { 
      where: { 
        status: 'completed',
        created_at: { [Op.between]: [startDate, endDate] } 
      } 
    }) || 0;
    
    // Support stats
    let openTickets = 0;
    try {
      openTickets = await SupportTicket.count({ where: { status: 'open' } });
    } catch (err) {
      logger.warn('SupportTicket.count failed, returning 0 for openTickets', { err: err && err.message });
      openTickets = 0;
    }
    
    return {
      totalUsers,
      activeUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue,
      openTickets,
    };
  } catch (error) {
    logger.error('Get platform dashboard data error:', error);
    throw error;
  }
};

module.exports = {
  generateDailySalesSummary,
  updateMenuItemAnalytics,
  generateHourlyAnalytics,
  getRevenueTrends,
  getPopularItems,
  getPlatformDashboardData,
  calculateGrowth,
};