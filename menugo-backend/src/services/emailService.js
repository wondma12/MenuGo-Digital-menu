const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Load email template
const loadTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
};

// Send email
const sendEmail = async (to, subject, template, data) => {
  try {
    const html = loadTemplate(template, data);
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  return sendEmail(email, 'Welcome to MenuGo!', 'welcome', { name });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  return sendEmail(email, 'Reset Your Password', 'resetPassword', { name, resetUrl });
};

// Send email verification
const sendVerificationEmail = async (email, name, verificationToken) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  return sendEmail(email, 'Verify Your Email', 'verifyEmail', { name, verifyUrl });
};

// Send order confirmation
const sendOrderConfirmationEmail = async (email, name, orderNumber, orderItems, total) => {
  return sendEmail(email, `Order Confirmation #${orderNumber}`, 'orderConfirmation', {
    name,
    orderNumber,
    orderItems,
    total,
  });
};

// Send invoice email
const sendInvoiceEmail = async (email, name, invoiceNumber, amount, dueDate, invoiceUrl) => {
  return sendEmail(email, `Invoice #${invoiceNumber}`, 'invoice', {
    name,
    invoiceNumber,
    amount,
    dueDate,
    invoiceUrl,
  });
};

// Send daily report email
const sendDailyReportEmail = async (email, name, reportData) => {
  return sendEmail(email, 'Your Daily Restaurant Report', 'dailyReport', {
    name,
    ...reportData,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendInvoiceEmail,
  sendDailyReportEmail,
};
