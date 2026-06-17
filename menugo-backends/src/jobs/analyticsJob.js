const { Order, OrderItem, MenuItem, MenuItemAnalytics, HourlyAnalytics, Restaurant, InventoryItem, Notification } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Aggregate hourly analytics
const aggregateHourlyAnalytics = async () => {
  try {
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);
    const previousHour = new Date(currentHour);
    previousHour.setHours(previousHour.getHours() - 1);

    const orders = await Order.findAll({
      where: {
        created_at: { [Op.between]: [previousHour, currentHour] },
        status: 'completed',
      },
    });

    // Group by restaurant
    const restaurantOrders = {};
    orders.forEach(order => {
      if (!restaurantOrders[order.restaurant_id]) {
        restaurantOrders[order.restaurant_id] = [];
      }
      restaurantOrders[order.restaurant_id].push(order);
    });

    // Save hourly analytics for each restaurant
    for (const [restaurantId, restaurantOrderList] of Object.entries(restaurantOrders)) {
      const totalRevenue = restaurantOrderList.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
      
      await HourlyAnalytics.upsert({
        restaurant_id: restaurantId,
        date: previousHour,
        hour: previousHour.getHours(),
        orders_count: restaurantOrderList.length,
        revenue: totalRevenue,
      });
    }

    logger.info(`Hourly analytics aggregated for ${Object.keys(restaurantOrders).length} restaurants`);
  } catch (error) {
    logger.error('Error aggregating hourly analytics:', error);
    throw error;
  }
};

// Generate daily summary analytics
const generateDailySummary = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurants = await Restaurant.findAll({ where: { is_active: true } });

    for (const restaurant of restaurants) {
      const orders = await Order.findAll({
        where: {
          restaurant_id: restaurant.id,
          created_at: { [Op.between]: [yesterday, today] },
          status: 'completed',
        },
      });

      // Update menu item analytics
      const orderItems = await OrderItem.findAll({
        where: {
          order_id: { [Op.in]: orders.map(o => o.id) },
        },
        include: [{ model: MenuItem, as: 'order_menu_item' }],
      });

      const menuItemStats = {};
      orderItems.forEach(item => {
        if (!menuItemStats[item.menu_item_id]) {
          menuItemStats[item.menu_item_id] = {
            quantity: 0,
            revenue: 0,
            orders: new Set(),
          };
        }
        menuItemStats[item.menu_item_id].quantity += item.quantity;
        menuItemStats[item.menu_item_id].revenue += parseFloat(item.subtotal);
        menuItemStats[item.menu_item_id].orders.add(item.order_id);
      });

      for (const [menuItemId, stats] of Object.entries(menuItemStats)) {
        await MenuItemAnalytics.upsert({
          restaurant_id: restaurant.id,
          menu_item_id: menuItemId,
          date: yesterday,
          order_count: stats.orders.size,
          quantity_sold: stats.quantity,
          revenue: stats.revenue,
        });

        // Update menu item sales count
        await MenuItem.update(
          { 
            // eslint-disable-next-line no-undef
            sales_count: sequelize.literal(`sales_count + ${stats.quantity}`),
          },
          { where: { id: menuItemId } },
        );
      }
    }

    logger.info(`Daily summary generated for ${restaurants.length} restaurants`);
  } catch (error) {
    logger.error('Error generating daily summary:', error);
    throw error;
  }
};

// Check low stock items
const checkLowStock = async () => {
  try {
    const lowStockItems = await InventoryItem.findAll({
      where: {
        // eslint-disable-next-line no-undef
        quantity: { [Op.lte]: sequelize.col('reorder_level') },
        reorder_level: { [Op.gt]: 0 },
      },
      include: [{ model: Restaurant, as: 'inventory_restaurant' }],
    });

    for (const item of lowStockItems) {
      // Create notification for restaurant admins
      await Notification.create({
        restaurant_id: item.restaurant_id,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${item.name} is running low. Current stock: ${item.quantity} ${item.unit}. Reorder level: ${item.reorder_level}`,
        data: {
          inventory_item_id: item.id,
          current_quantity: item.quantity,
          reorder_level: item.reorder_level,
        },
      });

      logger.info(`Low stock alert created for item ${item.name} in restaurant ${item.restaurant_id}`);
    }
  } catch (error) {
    logger.error('Error checking low stock:', error);
    throw error;
  }
};

// Calculate restaurant performance metrics
const calculateRestaurantPerformance = async (restaurantId, startDate, endDate) => {
  try {
    const orders = await Order.findAll({
      where: {
        restaurant_id: restaurantId,
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth compared to previous period
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (endDate - startDate) / (1000 * 60 * 60 * 24));
    const previousEndDate = new Date(startDate);

    const previousOrders = await Order.count({
      where: {
        restaurant_id: restaurantId,
        created_at: { [Op.between]: [previousStartDate, previousEndDate] },
        status: 'completed',
      },
    });

    const orderGrowth = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue,
      order_growth: orderGrowth,
    };
  } catch (error) {
    logger.error('Error calculating restaurant performance:', error);
    throw error;
  }
};

// Calculate waiter performance
const calculateWaiterPerformance = async (waiterId, startDate, endDate) => {
  try {
    const orders = await Order.findAll({
      where: {
        waiter_id: waiterId,
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const averageResponseTime = orders.reduce((sum, o) => {
      if (o.verified_at && o.created_at) {
        return sum + (new Date(o.verified_at) - new Date(o.created_at)) / 1000;
      }
      return sum;
    }, 0) / (orders.filter(o => o.verified_at).length || 1);

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_response_time: averageResponseTime,
      orders_served: totalOrders,
    };
  } catch (error) {
    logger.error('Error calculating waiter performance:', error);
    throw error;
  }
};

// Get popular items for a period
const getPopularItems = async (restaurantId, startDate, endDate, limit = 10) => {
  try {
    const analytics = await MenuItemAnalytics.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.between]: [startDate, endDate] },
      },
      attributes: [
        'menu_item_id',
        [sequelize.fn('SUM', sequelize.col('quantity_sold')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('order_count')), 'total_orders'],
      ],
      group: ['menu_item_id'],
      order: [[sequelize.literal('total_quantity'), 'DESC']],
      limit,
    });

    const menuItemIds = analytics.map((row) => row.menu_item_id).filter(Boolean);
    if (menuItemIds.length === 0) {
      return analytics;
    }

    const menuItems = await MenuItem.findAll({
      where: { id: menuItemIds },
    });

    const menuItemMap = new Map(menuItems.map((item) => [String(item.id), item]));

    return analytics.map((row) => {
      const plainRow = row.toJSON ? row.toJSON() : row;
      return {
        ...plainRow,
        analytics_item: menuItemMap.get(String(plainRow.menu_item_id)) || null,
      };
    });
  } catch (error) {
    logger.error('Error getting popular items:', error);
    throw error;
  }
};

module.exports = {
  aggregateHourlyAnalytics,
  generateDailySummary,
  checkLowStock,
  calculateRestaurantPerformance,
  calculateWaiterPerformance,
  getPopularItems,
};
