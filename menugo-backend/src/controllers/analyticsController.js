const { DailySalesSummary, MenuItemAnalytics, HourlyAnalytics, Order, Restaurant, MenuItem } = require('../models');
const { sequelize } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');

// Get restaurant sales analytics
const getSalesAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date, group_by = 'day' } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  let salesData;
  
  if (group_by === 'day') {
    salesData = await DailySalesSummary.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'ASC']],
    });
  } else if (group_by === 'hour') {
    salesData = await HourlyAnalytics.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'ASC'], ['hour', 'ASC']],
    });
  } else if (group_by === 'month') {
    salesData = await DailySalesSummary.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.between]: [startDate, endDate] },
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('total_orders')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.col('total_revenue')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('average_order_value')), 'average_order_value'],
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'ASC']],
    });
  }

  // Get summary
  const summary = await DailySalesSummary.findOne({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [startDate, endDate] },
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_orders')), 'total_orders'],
      [sequelize.fn('SUM', sequelize.col('total_revenue')), 'total_revenue'],
      [sequelize.fn('SUM', sequelize.col('total_tax')), 'total_tax'],
      [sequelize.fn('SUM', sequelize.col('total_discount')), 'total_discount'],
      [sequelize.fn('AVG', sequelize.col('average_order_value')), 'avg_order_value'],
    ],
  });

  res.json(ApiResponse.success({
    summary,
    data: salesData,
    period: { start_date: startDate, end_date: endDate },
  }, 'Sales analytics retrieved'));
});

// Get menu performance analytics
const getMenuPerformance = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date, limit = 10 } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const topItems = await MenuItemAnalytics.findAll({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [startDate, endDate] },
    },
    attributes: [
      'menu_item_id',
      [sequelize.fn('SUM', sequelize.col('order_count')), 'total_orders'],
      [sequelize.fn('SUM', sequelize.col('quantity_sold')), 'total_quantity'],
      [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
      [sequelize.fn('SUM', sequelize.col('view_count')), 'total_views'],
      [sequelize.fn('SUM', sequelize.col('add_to_cart_count')), 'total_adds'],
    ],
    include: [{ model: MenuItem, as: 'analytics_item' }],
    group: ['menu_item_id', 'menu_item.id'],
    order: [[sequelize.literal('total_revenue'), 'DESC']],
    limit: parseInt(limit),
  });

  // Get category performance
  const categoryPerformance = await MenuItem.findAll({
    where: { restaurant_id: restaurantId, deleted_at: null },
    attributes: [
      'category_id',
      [sequelize.fn('COUNT', sequelize.col('id')), 'item_count'],
      [sequelize.fn('SUM', sequelize.col('sales_count')), 'total_sales'],
    ],
    group: ['category_id'],
  });

  res.json(ApiResponse.success({
    top_items: topItems,
    category_performance: categoryPerformance,
  }, 'Menu performance retrieved'));
});

// Get hourly analytics
const getHourlyAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { date } = req.query;

  const targetDate = date ? new Date(date) : new Date();

  const hourlyData = await HourlyAnalytics.findAll({
    where: {
      restaurant_id: restaurantId,
      date: targetDate,
    },
    order: [['hour', 'ASC']],
  });

  // Get peak hours
  const peakHours = await HourlyAnalytics.findAll({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()] },
    },
    attributes: [
      'hour',
      [sequelize.fn('AVG', sequelize.col('orders_count')), 'avg_orders'],
      [sequelize.fn('AVG', sequelize.col('revenue')), 'avg_revenue'],
    ],
    group: ['hour'],
    order: [[sequelize.literal('avg_orders'), 'DESC']],
    limit: 5,
  });

  res.json(ApiResponse.success({
    hourly_data: hourlyData,
    peak_hours: peakHours,
  }, 'Hourly analytics retrieved'));
});

// Get customer analytics
const getCustomerAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  // New vs returning customers
  const orders = await Order.findAll({
    where: {
      restaurant_id: restaurantId,
      created_at: { [Op.between]: [startDate, endDate] },
      status: 'completed',
    },
    attributes: ['customer_email', 'customer_phone'],
  });

  const uniqueCustomers = new Set();
  const customerOrders = {};

  orders.forEach(order => {
    const key = order.customer_email || order.customer_phone;
    if (key) {
      uniqueCustomers.add(key);
      customerOrders[key] = (customerOrders[key] || 0) + 1;
    }
  });

  const returningCustomers = Object.values(customerOrders).filter(count => count > 1).length;
  const newCustomers = uniqueCustomers.size - returningCustomers;

  // Average order value by customer type
  const firstTimeOrders = await Order.findAll({
    where: {
      restaurant_id: restaurantId,
      created_at: { [Op.between]: [startDate, endDate] },
      status: 'completed',
    },
    attributes: ['customer_email', 'total_amount'],
    order: [['created_at', 'ASC']],
  });

  const firstTimeValues = [];
  const processedCustomers = new Set();

  firstTimeOrders.forEach(order => {
    const key = order.customer_email || order.customer_phone;
    if (key && !processedCustomers.has(key)) {
      processedCustomers.add(key);
      firstTimeValues.push(order.total_amount);
    }
  });

  const avgFirstTime = firstTimeValues.length > 0 
    ? firstTimeValues.reduce((a, b) => a + b, 0) / firstTimeValues.length 
    : 0;

  const avgReturning = orders.length > 0
    ? orders.reduce((a, b) => a + b.total_amount, 0) / orders.length
    : 0;

  res.json(ApiResponse.success({
    total_customers: uniqueCustomers.size,
    new_customers: newCustomers,
    returning_customers: returningCustomers,
    avg_first_time_order_value: avgFirstTime,
    avg_returning_order_value: avgReturning,
  }, 'Customer analytics retrieved'));
});

// Get revenue analytics
const getRevenueAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { period = 'month' } = req.query;

  let groupBy;
  let dateRange;

  if (period === 'week') {
    groupBy = 'day';
    dateRange = { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (period === 'month') {
    groupBy = 'day';
    dateRange = { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  } else if (period === 'year') {
    groupBy = 'month';
    dateRange = { [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) };
  }

  const revenueData = await DailySalesSummary.findAll({
    where: {
      restaurant_id: restaurantId,
      date: dateRange,
    },
    attributes: [
      [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('date')), 'period'],
      [sequelize.fn('SUM', sequelize.col('total_revenue')), 'revenue'],
      [sequelize.fn('SUM', sequelize.col('dine_in_revenue')), 'dine_in_revenue'],
      [sequelize.fn('SUM', sequelize.col('takeaway_revenue')), 'takeaway_revenue'],
      [sequelize.fn('SUM', sequelize.col('delivery_revenue')), 'delivery_revenue'],
    ],
    group: [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('date'))],
    order: [[sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('date')), 'ASC']],
  });

  // Calculate growth
  const previousPeriod = await DailySalesSummary.findAll({
    where: {
      restaurant_id: restaurantId,
      date: {
        [Op.between]: [
          new Date(new Date(dateRange[Op.gte]).getTime() - (period === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
          new Date(dateRange[Op.gte]),
        ],
      },
    },
    attributes: [[sequelize.fn('SUM', sequelize.col('total_revenue')), 'revenue']],
  });

  const currentRevenue = revenueData.reduce((sum, d) => sum + parseFloat(d.dataValues.revenue), 0);
  const previousRevenue = previousPeriod[0]?.dataValues.revenue || 0;
  const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  res.json(ApiResponse.success({
    revenue_data: revenueData,
    total_revenue: currentRevenue,
    revenue_growth: growth,
    dine_in_percentage: (revenueData.reduce((s, d) => s + parseFloat(d.dataValues.dine_in_revenue), 0) / currentRevenue) * 100,
    takeaway_percentage: (revenueData.reduce((s, d) => s + parseFloat(d.dataValues.takeaway_revenue), 0) / currentRevenue) * 100,
    delivery_percentage: (revenueData.reduce((s, d) => s + parseFloat(d.dataValues.delivery_revenue), 0) / currentRevenue) * 100,
  }, 'Revenue analytics retrieved'));
});

// Export analytics report
const exportAnalyticsReport = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date, format = 'excel' } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  // Get all data
  const salesData = await DailySalesSummary.findAll({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [startDate, endDate] },
    },
    order: [['date', 'ASC']],
  });

  const menuData = await MenuItemAnalytics.findAll({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [startDate, endDate] },
    },
    attributes: [
      'menu_item_id',
      [sequelize.fn('SUM', sequelize.col('order_count')), 'total_orders'],
      [sequelize.fn('SUM', sequelize.col('quantity_sold')), 'total_quantity'],
      [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
    ],
    group: ['menu_item_id'],
    include: [{ model: MenuItem, as: 'analytics_item', attributes: ['name'] }],
  });

  const hourlyData = await HourlyAnalytics.findAll({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [startDate, endDate] },
    },
    order: [['date', 'ASC'], ['hour', 'ASC']],
  });

  const report = {
    period: { start_date: startDate, end_date: endDate },
    sales_summary: salesData,
    menu_performance: menuData,
    hourly_distribution: hourlyData,
    generated_at: new Date(),
  };

  if (format === 'json') {
    return res.json(ApiResponse.success(report, 'Report generated'));
  }

  // For Excel export, you would use exceljs library
  res.json(ApiResponse.success(report, 'Report generated'));
});

module.exports = {
  getSalesAnalytics,
  getMenuPerformance,
  getHourlyAnalytics,
  getCustomerAnalytics,
  getRevenueAnalytics,
  exportAnalyticsReport,
};