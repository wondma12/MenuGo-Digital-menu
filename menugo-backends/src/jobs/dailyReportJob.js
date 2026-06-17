const { Order, Restaurant, DailySalesSummary, User } = require('../models');
const { sendEmail } = require('../services/emailService');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

// Generate daily reports for all restaurants
const generateDailyReports = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurants = await Restaurant.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'restaurant_owner', attributes: ['email', 'full_name'] }],
    });

    for (const restaurant of restaurants) {
      await generateSingleDailyReport(restaurant, yesterday, today);
    }

    logger.info(`Daily reports generated for ${restaurants.length} restaurants`);
  } catch (error) {
    logger.error('Error generating daily reports:', error);
    throw error;
  }
};

// Generate single daily report for a restaurant
const generateSingleDailyReport = async (restaurant, startDate, endDate) => {
  try {
    const orders = await Order.findAll({
      where: {
        restaurant_id: restaurant.id,
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByType = {
      dine_in: orders.filter(o => o.order_type === 'dine_in').length,
      takeaway: orders.filter(o => o.order_type === 'takeaway').length,
      delivery: orders.filter(o => o.order_type === 'delivery').length,
    };

    const revenueByType = {
      dine_in: orders.filter(o => o.order_type === 'dine_in').reduce((s, o) => s + parseFloat(o.total_amount), 0),
      takeaway: orders.filter(o => o.order_type === 'takeaway').reduce((s, o) => s + parseFloat(o.total_amount), 0),
      delivery: orders.filter(o => o.order_type === 'delivery').reduce((s, o) => s + parseFloat(o.total_amount), 0),
    };

    // Save to daily sales summary
    await DailySalesSummary.upsert({
      restaurant_id: restaurant.id,
      date: startDate,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue,
      dine_in_orders: ordersByType.dine_in,
      dine_in_revenue: revenueByType.dine_in,
      takeaway_orders: ordersByType.takeaway,
      takeaway_revenue: revenueByType.takeaway,
      delivery_orders: ordersByType.delivery,
      delivery_revenue: revenueByType.delivery,
    });

    // Send email report to restaurant owner
    if (restaurant.restaurant_owner && restaurant.restaurant_owner.email) {
      await sendDailyReportEmail(restaurant.restaurant_owner.email, restaurant.restaurant_owner.full_name, {
        restaurant_name: restaurant.name,
        date: startDate.toLocaleDateString(),
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        orders_by_type: ordersByType,
        revenue_by_type: revenueByType,
      });
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByType,
      revenueByType,
    };
  } catch (error) {
    logger.error(`Error generating daily report for restaurant ${restaurant.id}:`, error);
    throw error;
  }
};

// Generate weekly reports
const generateWeeklyReports = async () => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurants = await Restaurant.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'restaurant_owner', attributes: ['email', 'full_name'] }],
    });

    for (const restaurant of restaurants) {
      await generateSingleWeeklyReport(restaurant, lastWeek, today);
    }

    logger.info(`Weekly reports generated for ${restaurants.length} restaurants`);
  } catch (error) {
    logger.error('Error generating weekly reports:', error);
    throw error;
  }
};

// Generate single weekly report
const generateSingleWeeklyReport = async (restaurant, startDate, endDate) => {
  try {
    const orders = await Order.findAll({
      where: {
        restaurant_id: restaurant.id,
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
    });

    const dailyData = await DailySalesSummary.findAll({
      where: {
        restaurant_id: restaurant.id,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'ASC']],
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const previousWeekOrders = await Order.count({
      where: {
        restaurant_id: restaurant.id,
        created_at: { [Op.between]: [new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), startDate] },
        status: 'completed',
      },
    });

    const orderGrowth = previousWeekOrders > 0 ? ((totalOrders - previousWeekOrders) / previousWeekOrders) * 100 : 0;

    // Send email report
    if (restaurant.restaurant_owner && restaurant.restaurant_owner.email) {
      await sendWeeklyReportEmail(restaurant.restaurant_owner.email, restaurant.restaurant_owner.full_name, {
        restaurant_name: restaurant.name,
        start_date: startDate.toLocaleDateString(),
        end_date: endDate.toLocaleDateString(),
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        order_growth: orderGrowth,
        daily_breakdown: dailyData,
      });
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      orderGrowth,
      dailyData,
    };
  } catch (error) {
    logger.error(`Error generating weekly report for restaurant ${restaurant.id}:`, error);
    throw error;
  }
};

// Generate monthly reports
const generateMonthlyReports = async () => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurants = await Restaurant.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'restaurant_owner', attributes: ['email', 'full_name'] }],
    });

    for (const restaurant of restaurants) {
      await generateSingleMonthlyReport(restaurant, lastMonth, today);
    }

    logger.info(`Monthly reports generated for ${restaurants.length} restaurants`);
  } catch (error) {
    logger.error('Error generating monthly reports:', error);
    throw error;
  }
};

// Generate single monthly report
const generateSingleMonthlyReport = async (restaurant, startDate, endDate) => {
  try {
    const orders = await Order.findAll({
      where: {
        restaurant_id: restaurant.id,
        created_at: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
    });

    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekOrders = orders.filter(o => o.created_at >= weekStart && o.created_at < weekEnd);
      weeklyData.push({
        week: i + 1,
        orders: weekOrders.length,
        revenue: weekOrders.reduce((s, o) => s + parseFloat(o.total_amount), 0),
      });
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Send email report
    if (restaurant.restaurant_owner && restaurant.restaurant_owner.email) {
      await sendMonthlyReportEmail(restaurant.restaurant_owner.email, restaurant.restaurant_owner.full_name, {
        restaurant_name: restaurant.name,
        month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        weekly_breakdown: weeklyData,
      });
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      weeklyData,
    };
  } catch (error) {
    logger.error(`Error generating monthly report for restaurant ${restaurant.id}:`, error);
    throw error;
  }
};

// Send daily report email
const sendDailyReportEmail = async (email, name, data) => {
  const subject = `Daily Sales Report - ${data.date}`;
  const html = `
    <h2>Daily Sales Report for ${data.restaurant_name}</h2>
    <p>Date: ${data.date}</p>
    <h3>Summary</h3>
    <ul>
      <li>Total Orders: ${data.total_orders}</li>
      <li>Total Revenue: $${data.total_revenue.toFixed(2)}</li>
      <li>Average Order Value: $${data.average_order_value.toFixed(2)}</li>
    </ul>
    <h3>Orders by Type</h3>
    <ul>
      <li>Dine In: ${data.orders_by_type.dine_in}</li>
      <li>Takeaway: ${data.orders_by_type.takeaway}</li>
      <li>Delivery: ${data.orders_by_type.delivery}</li>
    </ul>
    <h3>Revenue by Type</h3>
    <ul>
      <li>Dine In: $${data.revenue_by_type.dine_in.toFixed(2)}</li>
      <li>Takeaway: $${data.revenue_by_type.takeaway.toFixed(2)}</li>
      <li>Delivery: $${data.revenue_by_type.delivery.toFixed(2)}</li>
    </ul>
  `;

  return sendEmail(email, subject, html);
};

// Send weekly report email
const sendWeeklyReportEmail = async (email, name, data) => {
  const subject = `Weekly Sales Report - ${data.start_date} to ${data.end_date}`;
  // HTML content would be similar to daily report
  return sendEmail(email, subject, `<h2>Weekly Sales Report for ${data.restaurant_name}</h2>...`);
};

// Send monthly report email
const sendMonthlyReportEmail = async (email, name, data) => {
  const subject = `Monthly Sales Report - ${data.month}`;
  // HTML content would be similar to daily report
  return sendEmail(email, subject, `<h2>Monthly Sales Report for ${data.restaurant_name}</h2>...`);
};

module.exports = {
  generateDailyReports,
  generateWeeklyReports,
  generateMonthlyReports,
  generateSingleDailyReport,
  generateSingleWeeklyReport,
  generateSingleMonthlyReport,
};
