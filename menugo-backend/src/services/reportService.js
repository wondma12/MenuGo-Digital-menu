const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

// Generate Excel report
const generateExcelReport = async (data, sheetName, columns) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add headers
    worksheet.columns = columns;

    // Add data
    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, cell.value ? cell.value.toString().length : 10);
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    return workbook;
  } catch (error) {
    logger.error('Generate Excel report error:', error);
    throw error;
  }
};

// Generate PDF report
const generatePDFReport = async (data, title, headers) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Add title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      
      // Add date
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();
      
      // Add table
      const tableTop = doc.y + 20;
      let y = tableTop;
      
      // Draw headers
      headers.forEach((header, i) => {
        doc.fontSize(10).text(header, 50 + (i * 100), y);
      });
      
      y += 20;
      
      // Draw data
      data.forEach(row => {
        Object.values(row).forEach((value, i) => {
          doc.fontSize(9).text(String(value), 50 + (i * 100), y);
        });
        y += 20;
        
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate CSV report
const generateCSVReport = async (data, columns) => {
  try {
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  } catch (error) {
    logger.error('Generate CSV report error:', error);
    throw error;
  }
};

// Generate sales report data
const generateSalesReportData = async (orders, startDate, endDate) => {
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const ordersByDay = {};
  orders.forEach(order => {
    const date = order.created_at.toISOString().split('T')[0];
    if (!ordersByDay[date]) {
      ordersByDay[date] = { count: 0, revenue: 0 };
    }
    ordersByDay[date].count++;
    ordersByDay[date].revenue += parseFloat(order.total_amount);
  });
  
  const dailyData = Object.entries(ordersByDay).map(([date, data]) => ({
    date,
    orders: data.count,
    revenue: data.revenue,
  }));
  
  return {
    summary: {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      period: { start_date: startDate, end_date: endDate },
    },
    daily_breakdown: dailyData,
  };
};

// Generate menu performance report
const generateMenuReportData = async (menuItems, orderItems) => {
  const itemPerformance = {};
  
  orderItems.forEach(item => {
    if (!itemPerformance[item.menu_item_id]) {
      itemPerformance[item.menu_item_id] = {
        name: item.item_name,
        quantity_sold: 0,
        revenue: 0,
        order_count: 0,
      };
    }
    itemPerformance[item.menu_item_id].quantity_sold += item.quantity;
    itemPerformance[item.menu_item_id].revenue += parseFloat(item.subtotal);
    itemPerformance[item.menu_item_id].order_count++;
  });
  
  const topItems = Object.values(itemPerformance)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  return {
    total_items: menuItems.length,
    items_with_sales: Object.keys(itemPerformance).length,
    top_performing_items: topItems,
  };
};

module.exports = {
  generateExcelReport,
  generatePDFReport,
  generateCSVReport,
  generateSalesReportData,
  generateMenuReportData,
};