const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatCurrency } = require('./helpers');
const { logger } = require('./logger');

// Generate invoice PDF
const generateInvoice = async (order, restaurant, customer) => {
  return new Promise((resolve, reject) => {
    try {
      const invoiceDir = path.join(__dirname, '../../uploads/invoices');
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const fileName = `invoice_${order.order_number}.pdf`;
      const filePath = path.join(invoiceDir, fileName);
      
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header with logo
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown();
      
      // Restaurant Info
      doc.fontSize(12).font('Helvetica-Bold').text(restaurant.name, { align: 'left' });
      doc.fontSize(10).font('Helvetica');
      if (restaurant.address) doc.text(restaurant.address);
      if (restaurant.phone) doc.text(`Phone: ${restaurant.phone}`);
      if (restaurant.email) doc.text(`Email: ${restaurant.email}`);
      doc.moveDown();
      
      // Invoice Details
      const startX = 50;
      let y = doc.y;
      
      doc.font('Helvetica-Bold').text('Invoice Details:', startX, y);
      y = doc.y + 5;
      doc.font('Helvetica');
      doc.text(`Invoice Number: ${order.order_number}`, startX, y);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, startX, y + 15);
      doc.text(`Time: ${new Date(order.created_at).toLocaleTimeString()}`, startX, y + 30);
      
      // Customer Info
      const rightX = 350;
      doc.text(`Bill To:`, rightX, y);
      doc.text(customer.name || order.customer_name || 'Walk-in Customer', rightX, y + 15);
      if (customer.email || order.customer_email) {
        doc.text(customer.email || order.customer_email, rightX, y + 30);
      }
      if (customer.phone || order.customer_phone) {
        doc.text(customer.phone || order.customer_phone, rightX, y + 45);
      }
      
      doc.moveDown();
      doc.moveDown();
      
      // Table Header
      y = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, y);
      doc.text('Quantity', 250, y);
      doc.text('Unit Price', 350, y);
      doc.text('Total', 450, y);
      
      doc.moveDown();
      doc.font('Helvetica');
      
      // Items
      let currentY = doc.y;
      order.items.forEach((item, index) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
        
        doc.text(item.item_name, 50, currentY);
        doc.text(item.quantity.toString(), 250, currentY);
        doc.text(formatCurrency(item.unit_price), 350, currentY);
        doc.text(formatCurrency(item.subtotal), 450, currentY);
        currentY += 20;
      });
      
      doc.moveDown();
      
      // Totals
      const totalsY = doc.y + 10;
      doc.text(`Subtotal: ${formatCurrency(order.subtotal)}`, 350, totalsY);
      doc.text(`Tax (${order.tax_rate || 10}%): ${formatCurrency(order.tax_amount)}`, 350, totalsY + 15);
      if (order.discount_amount > 0) {
        doc.text(`Discount: -${formatCurrency(order.discount_amount)}`, 350, totalsY + 30);
        doc.text(`Total: ${formatCurrency(order.total_amount)}`, 350, totalsY + 45);
      } else {
        doc.text(`Total: ${formatCurrency(order.total_amount)}`, 350, totalsY + 30);
      }
      
      // Payment Info
      doc.moveDown();
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Payment Information:', 50, doc.y);
      doc.font('Helvetica');
      doc.text(`Payment Method: ${order.payment_method || 'Not specified'}`, 50, doc.y + 15);
      doc.text(`Payment Status: ${order.payment_status}`, 50, doc.y + 30);
      
      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .text(
            `Thank you for dining with us! Generated on ${new Date().toLocaleString()}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(`/uploads/invoices/${fileName}`);
      });
      
      stream.on('error', reject);
    } catch (error) {
      logger.error('Generate invoice error:', error);
      reject(error);
    }
  });
};

// Generate receipt PDF (simpler version)
const generateReceipt = async (order, restaurant) => {
  return new Promise((resolve, reject) => {
    try {
      const receiptDir = path.join(__dirname, '../../uploads/invoices');
      if (!fs.existsSync(receiptDir)) {
        fs.mkdirSync(receiptDir, { recursive: true });
      }

      const fileName = `receipt_${order.order_number}.pdf`;
      const filePath = path.join(receiptDir, fileName);
      
      const doc = new PDFDocument({ margin: 30, size: [210, 297] }); // A4 portrait
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      doc.fontSize(16).font('Helvetica-Bold').text(restaurant.name, { align: 'center' });
      doc.fontSize(10).font('Helvetica');
      if (restaurant.address) doc.text(restaurant.address, { align: 'center' });
      if (restaurant.phone) doc.text(`Tel: ${restaurant.phone}`, { align: 'center' });
      doc.moveDown();
      doc.text(`Receipt #: ${order.order_number}`, { align: 'center' });
      doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, { align: 'center' });
      doc.moveDown();
      
      // Divider
      doc.text('─'.repeat(42), { align: 'center' });
      doc.moveDown();
      
      // Items
      doc.font('Helvetica-Bold');
      doc.text('Item', 30, doc.y);
      doc.text('Qty', 130, doc.y);
      doc.text('Price', 170, doc.y);
      doc.moveDown();
      
      doc.font('Helvetica');
      order.items.forEach(item => {
        doc.text(item.item_name.substring(0, 30), 30, doc.y);
        doc.text(item.quantity.toString(), 130, doc.y);
        doc.text(formatCurrency(item.unit_price), 170, doc.y);
        doc.moveDown(0.5);
      });
      
      doc.moveDown();
      doc.text('─'.repeat(42), { align: 'center' });
      doc.moveDown();
      
      // Totals
      doc.text(`Subtotal: ${formatCurrency(order.subtotal)}`, { align: 'right' });
      doc.text(`Tax: ${formatCurrency(order.tax_amount)}`, { align: 'right' });
      if (order.discount_amount > 0) {
        doc.text(`Discount: -${formatCurrency(order.discount_amount)}`, { align: 'right' });
      }
      doc.font('Helvetica-Bold').text(`Total: ${formatCurrency(order.total_amount)}`, { align: 'right' });
      
      doc.moveDown();
      doc.text('─'.repeat(42), { align: 'center' });
      doc.moveDown();
      
      // Footer
      doc.fontSize(8).text('Thank you for your visit!', { align: 'center' });
      doc.text(`Table: ${order.table_number || 'N/A'}`, { align: 'center' });
      doc.text(`Waiter: ${order.waiter_name || 'N/A'}`, { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(`/uploads/invoices/${fileName}`);
      });
      
      stream.on('error', reject);
    } catch (error) {
      logger.error('Generate receipt error:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateInvoice,
  generateReceipt,
};