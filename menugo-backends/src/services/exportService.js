const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

// Export orders to Excel
const exportOrdersToExcel = async (orders, restaurantName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  worksheet.columns = [
    { header: 'Order #', key: 'order_number', width: 15 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Customer', key: 'customer_name', width: 20 },
    { header: 'Table', key: 'table_number', width: 10 },
    { header: 'Items', key: 'item_count', width: 10 },
    { header: 'Total', key: 'total_amount', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Payment', key: 'payment_status', width: 15 },
  ];

  orders.forEach(order => {
    worksheet.addRow({
      order_number: order.order_number,
      date: new Date(order.created_at).toLocaleString(),
      customer_name: order.customer_name,
      table_number: order.table_number,
      item_count: order.items?.length || 0,
      total_amount: `$${order.total_amount}`,
      status: order.status,
      payment_status: order.payment_status,
    });
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' },
  };

  const filePath = path.join(__dirname, '../../uploads/temp', `orders_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

// Export menu items to Excel
const exportMenuToExcel = async (menuItems, restaurantName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Menu Items');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Available', key: 'is_available', width: 12 },
    { header: 'Vegetarian', key: 'is_vegetarian', width: 12 },
    { header: 'Vegan', key: 'is_vegan', width: 12 },
    { header: 'Gluten Free', key: 'is_gluten_free', width: 12 },
    { header: 'Sales', key: 'sales_count', width: 10 },
  ];

  menuItems.forEach(item => {
    worksheet.addRow({
      name: item.name,
      category: item.category?.name || 'Uncategorized',
      price: `$${item.price}`,
      is_available: item.is_available ? 'Yes' : 'No',
      is_vegetarian: item.is_vegetarian ? 'Yes' : 'No',
      is_vegan: item.is_vegan ? 'Yes' : 'No',
      is_gluten_free: item.is_gluten_free ? 'Yes' : 'No',
      sales_count: item.sales_count || 0,
    });
  });

  const filePath = path.join(__dirname, '../../uploads/temp', `menu_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

// Export customers to Excel
const exportCustomersToExcel = async (customers) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customers');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Total Orders', key: 'total_orders', width: 12 },
    { header: 'Total Spent', key: 'total_spent', width: 15 },
    { header: 'Last Order', key: 'last_order', width: 20 },
  ];

  customers.forEach(customer => {
    worksheet.addRow({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      total_orders: customer.total_orders,
      total_spent: `$${customer.total_spent}`,
      last_order: customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'N/A',
    });
  });

  const filePath = path.join(__dirname, '../../uploads/temp', `customers_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

// Export inventory to Excel
const exportInventoryToExcel = async (inventory) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventory');

  worksheet.columns = [
    { header: 'Item', key: 'name', width: 30 },
    { header: 'Unit', key: 'unit', width: 10 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Reorder Level', key: 'reorder_level', width: 12 },
    { header: 'Cost/Unit', key: 'cost_per_unit', width: 12 },
    { header: 'Total Value', key: 'total_value', width: 15 },
    { header: 'Supplier', key: 'supplier', width: 25 },
  ];

  inventory.forEach(item => {
    worksheet.addRow({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      reorder_level: item.reorder_level,
      cost_per_unit: `$${item.cost_per_unit}`,
      total_value: `$${(item.quantity * item.cost_per_unit).toFixed(2)}`,
      supplier: item.supplier || 'N/A',
    });
  });

  const filePath = path.join(__dirname, '../../uploads/temp', `inventory_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

// Clean up export file
const cleanupExportFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  exportOrdersToExcel,
  exportMenuToExcel,
  exportCustomersToExcel,
  exportInventoryToExcel,
  cleanupExportFile,
};
