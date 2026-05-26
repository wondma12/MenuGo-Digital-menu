const { Order, DailySalesSummary, MenuItemAnalytics, Restaurant, OrderItem, MenuItem, MenuCategory } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { generateInvoice } = require('../utils/generateInvoice');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

// Generate sales report
const generateSalesReport = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date, format = 'json' } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const report = await generateSalesReportData(restaurantId, startDate, endDate);

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Total Orders', key: 'total_orders', width: 15 },
      { header: 'Total Revenue', key: 'total_revenue', width: 15 },
      { header: 'Average Order Value', key: 'average_order_value', width: 20 },
      { header: 'Dine In Orders', key: 'dine_in_orders', width: 15 },
      { header: 'Takeaway Orders', key: 'takeaway_orders', width: 15 },
      { header: 'Delivery Orders', key: 'delivery_orders', width: 15 },
    ];

    report.daily_data.forEach(row => {
      worksheet.addRow(row);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } else {
    res.json(ApiResponse.success(report, 'Sales report generated'));
  }
});

// Generate order report
const generateOrderReport = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date, status } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const where = {
    restaurant_id: restaurantId,
    created_at: { [Op.between]: [startDate, endDate] },
  };
  if (status) where.status = status;

  const orders = await Order.findAll({
    where,
    include: [{ model: OrderItem, as: 'order_items' }],
    order: [['created_at', 'DESC']],
  });

  const summary = {
    total_orders: orders.length,
    total_revenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
    average_order_value: orders.length > 0 ? orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) / orders.length : 0,
    status_breakdown: orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {}),
  };

  res.json(ApiResponse.success({ summary, orders }, 'Order report generated'));
});

// Generate menu performance report
const generateMenuReport = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { start_date, end_date } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const menuPerformance = await MenuItemAnalytics.findAll({
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
    ],
    include: [{ model: MenuItem, as: 'analytics_item' }],
    group: ['menu_item_id', 'menu_item.id'],
    order: [[sequelize.literal('total_revenue'), 'DESC']],
  });

  res.json(ApiResponse.success(menuPerformance, 'Menu performance report generated'));
});

// Generate invoice for order
const generateOrderInvoice = catchAsync(async (req, res) => {
  const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'order_items' },
      { model: Restaurant, as: 'order_restaurant' },
    ],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const invoicePath = await generateInvoice(order, order.restaurant, {
    name: order.customer_name,
    email: order.customer_email,
  });

  res.json(ApiResponse.success({ invoice_url: invoicePath }, 'Invoice generated'));
});

// Export data
const exportData = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { entity, start_date, end_date, format = 'excel' } = req.query;

  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  let data = [];

  if (entity === 'orders') {
    data = await Order.findAll({
      where: {
        restaurant_id: restaurantId,
        created_at: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: OrderItem, as: 'items' }],
    });
  } else if (entity === 'menu_items') {
    data = await MenuItem.findAll({
      where: { restaurant_id: restaurantId, deleted_at: null },
      include: [{ model: MenuCategory, as: 'item_category' }],
    });
  } else if (entity === 'customers') {
    data = await Order.findAll({
      where: {
        restaurant_id: restaurantId,
        created_at: { [Op.between]: [startDate, endDate] },
      },
      attributes: ['customer_name', 'customer_email', 'customer_phone'],
      group: ['customer_email', 'customer_name', 'customer_phone'],
    });
  }

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(entity);

    if (data.length > 0) {
      const headers = Object.keys(data[0].toJSON());
      worksheet.columns = headers.map(h => ({ header: h, key: h, width: 20 }));
      data.forEach(row => worksheet.addRow(row.toJSON()));
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${entity}_export_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } else {
    res.json(ApiResponse.success(data, 'Data exported'));
  }
});

// Helper function
async function generateSalesReportData(restaurantId, startDate, endDate) {
  const dailyData = await DailySalesSummary.findAll({
    where: {
      restaurant_id: restaurantId,
      date: { [Op.between]: [startDate, endDate] },
    },
    order: [['date', 'ASC']],
  });

  const summary = {
    total_orders: dailyData.reduce((sum, d) => sum + d.total_orders, 0),
    total_revenue: dailyData.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0),
    average_order_value: dailyData.length > 0 ? dailyData.reduce((sum, d) => sum + parseFloat(d.average_order_value), 0) / dailyData.length : 0,
    total_tax: dailyData.reduce((sum, d) => sum + parseFloat(d.total_tax), 0),
    total_discount: dailyData.reduce((sum, d) => sum + parseFloat(d.total_discount), 0),
  };

  return { summary, daily_data: dailyData };
}

module.exports = {
  generateSalesReport,
  generateOrderReport,
  generateMenuReport,
  generateOrderInvoice,
  exportData,
};