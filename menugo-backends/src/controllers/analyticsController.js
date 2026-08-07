const { DailySalesSummary, MenuItemAnalytics, HourlyAnalytics, Order, Restaurant, MenuItem } = require('../models');
const { sequelize } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op, QueryTypes } = require('sequelize');

// Dialect helpers: keep the analytics layer database-aware so Postgres,
// MySQL and SQLite do not emit incompatible SQL fragments.
const getRuntimeDialect = () => {
  const activeDialect = sequelize && typeof sequelize.getDialect === 'function'
    ? sequelize.getDialect()
    : (sequelize && sequelize.options && sequelize.options.dialect) || 'mysql';

  return String(activeDialect || 'mysql').toLowerCase();
};

const formatDateCol = (col, format) => {
  const dialect = getRuntimeDialect();

  if (dialect === 'sqlite') {
    return sequelize.fn('strftime', format, sequelize.col(col));
  }

  if (dialect === 'postgres' || dialect === 'postgresql') {
    const postgresFormat = (() => {
      if (format === '%Y-%m') return 'YYYY-MM';
      if (format === '%Y-%m-%d') return 'YYYY-MM-DD';
      if (format === '%Y-%m-%d %H:%i:%s') return 'YYYY-MM-DD HH24:MI:SS';
      if (format === '%Y') return 'YYYY';
      if (format === '%H') return 'HH24';
      return format;
    })();

    return sequelize.fn('TO_CHAR', sequelize.col(col), postgresFormat);
  }

  return sequelize.fn('DATE_FORMAT', sequelize.col(col), format);
};

const formatHourCol = (colName = 'created_at') => {
  const dialect = getRuntimeDialect();

  if (dialect === 'sqlite') {
    return sequelize.fn('strftime', '%H', sequelize.col(colName));
  }

  if (dialect === 'postgres' || dialect === 'postgresql') {
    return sequelize.literal(`EXTRACT(HOUR FROM ${colName})`);
  }

  return sequelize.fn('HOUR', sequelize.col(colName));
};

const toStartOfDay = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const toEndOfDay = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(23, 59, 59, 999)
  return date
}

const toLocalDay = (value, endOfDay = false) => {
  if (!value) return null

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const year = Number(match[1])
      const month = Number(match[2]) - 1
      const day = Number(match[3])
      const date = new Date(year, month, day)
      date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0)
      return date
    }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0)
  return date
}

const toLocalDateString = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get restaurant sales analytics
const getSalesAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date, group_by = 'day' } = req.query;

  const startDate = start_date ? toLocalDay(start_date, false) : toLocalDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), false);
  const endDate = end_date ? toLocalDay(end_date, true) : toLocalDay(new Date(), true);

  let salesData;
  
  if (group_by === 'day') {
    const dailySummaries = await DailySalesSummary.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'ASC']],
    });
    const summaryMap = new Map((dailySummaries || []).map((row) => {
      const rowDate = row?.date ? new Date(row.date) : null
      const key = rowDate && !Number.isNaN(rowDate.getTime()) ? toLocalDateString(rowDate) : String(row?.date || '')
      return [key, row]
    }))

    const derived = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const thisDay = new Date(d);
      thisDay.setHours(0, 0, 0, 0);
      const nextDay = new Date(thisDay);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayKey = toLocalDateString(thisDay)
      const existing = summaryMap.get(dayKey)

      let dailyRevenue = Number(existing?.total_revenue ?? 0)
      let dailyOrders = Number(existing?.total_orders ?? 0)

      if (!existing) {
        dailyRevenue = await Order.sum('total_amount', {
          where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.between]: [thisDay, nextDay] } },
        }).catch(() => 0) || 0;

        dailyOrders = await Order.count({
          where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.between]: [thisDay, nextDay] } },
        }).catch(() => 0) || 0;
      }

      derived.push({
        date: dayKey,
        total_revenue: dailyRevenue,
        total_orders: dailyOrders,
        average_order_value: Number(existing?.average_order_value ?? (dailyOrders > 0 ? dailyRevenue / dailyOrders : 0)),
      });
    }

    salesData = derived;
  } else if (group_by === 'hour') {
    salesData = await HourlyAnalytics.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'ASC'], ['hour', 'ASC']],
    });
  } else if (group_by === 'month') {
    // Group by month (dialect-aware)
    const monthFormat = '%Y-%m';
    const monthExpr = formatDateCol('date', monthFormat);
    salesData = await DailySalesSummary.findAll({
      where: {
        restaurant_id: restaurantId,
        date: { [Op.between]: [startDate, endDate] },
      },
      attributes: [
        [monthExpr, 'month'],
        [sequelize.fn('SUM', sequelize.col('total_orders')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.col('total_revenue')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('average_order_value')), 'average_order_value'],
      ],
      group: [monthExpr],
      order: [[monthExpr, 'ASC']],
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

  // Fallback summary derived from Orders when no DailySalesSummary exists
  let finalSummary = summary;
  if (!summary || !summary.dataValues || Object.values(summary.dataValues).every(v => v === null)) {
    try {
      const totalOrders = await Order.count({ where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.between]: [startDate, endDate] } } }).catch(() => 0) || 0;
      const totalRevenue = await Order.sum('total_amount', { where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.between]: [startDate, endDate] } } }).catch(() => 0) || 0;
      const totalTax = await Order.sum('tax_amount', { where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.between]: [startDate, endDate] } } }).catch(() => 0) || 0;
      const totalDiscount = await Order.sum('discount_amount', { where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.between]: [startDate, endDate] } } }).catch(() => 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      finalSummary = { dataValues: { total_orders: totalOrders, completed_orders: totalOrders, total_revenue: totalRevenue, total_tax: totalTax, total_discount: totalDiscount, avg_order_value: avgOrderValue } };
    } catch (e) {
      finalSummary = summary;
    }
  }

  // Always provide completed_orders so frontend can exclude rejected/cancelled reliably.
  try {
    const completedOrders = await Order.count({
      where: {
        restaurant_id: restaurantId,
        status: 'completed',
        created_at: { [Op.between]: [startDate, endDate] },
      },
    }).catch(() => 0) || 0;

    if (!finalSummary) {
      finalSummary = { dataValues: { completed_orders: completedOrders, total_orders: completedOrders } };
    } else if (finalSummary.dataValues) {
      finalSummary.dataValues.completed_orders = completedOrders;
    }
  } catch (e) {
    // ignore completed_orders augmentation errors
  }

  res.json(ApiResponse.success({
    summary: finalSummary,
    data: salesData,
    // derive order type distribution directly from orders as a robust fallback
    order_type_distribution: await (async () => {
      try {
        const rawTypes = await Order.findAll({
          where: { restaurant_id: restaurantId, created_at: { [Op.between]: [startDate, endDate] } },
          attributes: [
            [sequelize.fn('COALESCE', sequelize.col('order_type'), 'unknown'), 'type'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          ],
          group: [sequelize.fn('COALESCE', sequelize.col('order_type'), 'unknown')],
        });

        return rawTypes.map(r => ({ name: r.dataValues.type || 'unknown', value: Number(r.dataValues.count || 0), revenue: Number(r.dataValues.revenue || 0) }));
      } catch (e) {
        return [];
      }
    })(),
    period: { start_date: startDate, end_date: endDate },
  }, 'Sales analytics retrieved'));
});

// Get menu performance analytics
const getMenuPerformance = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date, limit = 10 } = req.query;

  const startDate = start_date ? toLocalDay(start_date, false) : toLocalDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), false);
  const endDate = end_date ? toLocalDay(end_date, true) : toLocalDay(new Date(), true);

  const topItems = await sequelize.query(
    `SELECT
      m.menu_item_id AS menu_item_id,
      mi.id AS analytics_item_id,
      mi.name AS analytics_item_name,
      SUM(m.order_count) AS total_orders,
      SUM(m.quantity_sold) AS total_quantity,
      SUM(m.revenue) AS total_revenue,
      SUM(m.view_count) AS total_views,
      SUM(m.add_to_cart_count) AS total_adds
    FROM menu_item_analytics m
    LEFT JOIN menu_items mi
      ON m.menu_item_id = mi.id
      AND mi.deleted_at IS NULL
    WHERE m.restaurant_id = :restaurantId
      AND m.date BETWEEN :startDate AND :endDate
    GROUP BY m.menu_item_id, mi.id, mi.name
    ORDER BY total_revenue DESC
    LIMIT :limit`,
    {
      replacements: {
        restaurantId,
        startDate: toLocalDateString(startDate),
        endDate: toLocalDateString(endDate),
        limit: parseInt(limit, 10),
      },
      type: sequelize.QueryTypes.SELECT,
      nest: true,
      raw: true,
    }
  ).then(rows => rows.map(row => ({
    ...row,
    analytics_item: {
      id: row.analytics_item_id,
      name: row.analytics_item_name,
    },
  })));

  const menuData = await sequelize.query(
    `SELECT m.menu_item_id AS menu_item_id,
      mi.id AS analytics_item_id,
      mi.name AS analytics_item_name,
      SUM(m.order_count) AS total_orders,
      SUM(m.quantity_sold) AS total_quantity,
      SUM(m.revenue) AS total_revenue
    FROM menu_item_analytics m
    LEFT JOIN menu_items mi
      ON m.menu_item_id = mi.id
      AND mi.deleted_at IS NULL
    WHERE m.restaurant_id = :restaurantId
      AND m.date BETWEEN :startDate AND :endDate
    GROUP BY m.menu_item_id, mi.id, mi.name`,
    {
      replacements: {
        restaurantId,
        startDate: toLocalDateString(startDate),
        endDate: toLocalDateString(endDate),
      },
      type: sequelize.QueryTypes.SELECT,
      raw: true,
      nest: true,
    }
  ).then(rows => rows.map(row => ({
    ...row,
    analytics_item: {
      id: row.analytics_item_id,
      name: row.analytics_item_name,
    },
  })));

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
    menu_performance: menuData,
  }, 'Menu performance retrieved'));
});

// Get hourly analytics
const getHourlyAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { date } = req.query;

  const targetDate = date ? toLocalDay(date, false) : toLocalDay(new Date(), false);

  const hourlyData = await HourlyAnalytics.findAll({
    where: {
      restaurant_id: restaurantId,
      date: targetDate,
    },
    order: [['hour', 'ASC']],
  });

  // Fallback: derive hourly data from Orders if HourlyAnalytics is empty
  let finalHourly = hourlyData;
  if ((!hourlyData || hourlyData.length === 0)) {
    const derived = [];
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    for (let h = 0; h < 24; h++) {
      const hourStart = new Date(dayStart);
      hourStart.setHours(h, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(h + 1);

      const ordersCount = await Order.count({ where: { restaurant_id: restaurantId, created_at: { [Op.between]: [hourStart, hourEnd] }, status: 'completed' } }).catch(() => 0) || 0;
      const revenue = await Order.sum('total_amount', { where: { restaurant_id: restaurantId, created_at: { [Op.between]: [hourStart, hourEnd] }, status: 'completed' } }).catch(() => 0) || 0;

      derived.push({ hour: h, orders_count: ordersCount, revenue });
    }

    finalHourly = derived;
  }

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

  // Fallback: compute peak hours from Orders if HourlyAnalytics has no data
  let finalPeak = peakHours;
  if ((!peakHours || peakHours.length === 0)) {
    try {
      const startWindow = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const raw = await Order.findAll({
        where: { restaurant_id: restaurantId, created_at: { [Op.between]: [startWindow, new Date()] }, status: 'completed' },
        attributes: [
          [formatHourCol('created_at'), 'hour'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'orders_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
        ],
        group: [formatHourCol('created_at')],
        order: [[sequelize.literal('orders_count'), 'DESC']],
        limit: 5,
      });

      finalPeak = raw.map(r => ({ hour: r.dataValues.hour, avg_orders: parseInt(r.dataValues.orders_count, 10), avg_revenue: parseFloat(r.dataValues.revenue) }));
    } catch (e) {
      finalPeak = peakHours;
    }
  }

  res.json(ApiResponse.success({
    hourly_data: finalHourly,
    peak_hours: finalPeak,
  }, 'Hourly analytics retrieved'));
});

// Get customer analytics
const getCustomerAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date } = req.query;

  const startDate = start_date ? toLocalDay(start_date, false) : toLocalDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), false);
  const endDate = end_date ? toLocalDay(end_date, true) : toLocalDay(new Date(), true);

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
      // Map grouping to MySQL DATE_FORMAT patterns
      [formatDateCol('date', groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d'), 'period'],
      [sequelize.fn('SUM', sequelize.col('total_revenue')), 'revenue'],
      [sequelize.fn('SUM', sequelize.col('dine_in_revenue')), 'dine_in_revenue'],
      [sequelize.fn('SUM', sequelize.col('takeaway_revenue')), 'takeaway_revenue'],
      [sequelize.fn('SUM', sequelize.col('delivery_revenue')), 'delivery_revenue'],
    ],
    group: [formatDateCol('date', groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d')],
    order: [[formatDateCol('date', groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d'), 'ASC']],
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

  const startDate = start_date ? toLocalDay(start_date, false) : toLocalDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), false);
  const endDate = end_date ? toLocalDay(end_date, true) : toLocalDay(new Date(), true);

  // Get all data
  const salesData = await DailySalesSummary.findAll({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [startDate, endDate] },
    },
    order: [['date', 'ASC']],
  });

  const menuData = await sequelize.query(
    `SELECT m.menu_item_id AS menu_item_id,
      mi.id AS analytics_item_id,
      mi.name AS analytics_item_name,
      SUM(m.order_count) AS total_orders,
      SUM(m.quantity_sold) AS total_quantity,
      SUM(m.revenue) AS total_revenue
    FROM menu_item_analytics m
    LEFT JOIN menu_items mi
      ON m.menu_item_id = mi.id
      AND mi.deleted_at IS NULL
    WHERE m.restaurant_id = :restaurantId
      AND m.date BETWEEN :startDate AND :endDate
    GROUP BY m.menu_item_id, mi.id, mi.name`,
    {
      replacements: {
        restaurantId,
        startDate: toLocalDateString(startDate),
        endDate: toLocalDateString(endDate),
      },
      type: QueryTypes.SELECT,
      raw: true,
      nest: true,
    }
  ).then(rows => rows.map(row => ({
    ...row,
    analytics_item: {
      id: row.analytics_item_id,
      name: row.analytics_item_name,
    },
  })));

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