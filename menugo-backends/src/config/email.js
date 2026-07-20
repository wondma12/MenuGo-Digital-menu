const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const loadTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
};

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

const sendWelcomeEmail = async (email, name, verificationToken = null) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = verificationToken
    ? `${clientUrl}/verify-email/${verificationToken}`
    : null;

  return module.exports.sendEmail(email, 'Welcome to MenuGo!', 'welcome', {
    name,
    verifyUrl,
    supportUrl: `${clientUrl}/contact`,
    unsubscribeUrl: `${clientUrl}/unsubscribe`,
    privacyUrl: `${clientUrl}/privacy`,
    termsUrl: `${clientUrl}/terms`,
  });
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  return module.exports.sendEmail(email, 'Reset Your Password', 'resetPassword', { name, resetUrl });
};

const sendRestaurantActivatedEmail = async (email, name, restaurantName, loginUrl = null) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3002';
  const targetLoginUrl = loginUrl || `${clientUrl}/login`;

  return module.exports.sendEmail(email, 'Your account has been activated', 'restaurantActivated', {
    name,
    restaurantName,
    loginUrl: targetLoginUrl,
    supportUrl: `${clientUrl}/contact`,
  });
};

const sendOrderConfirmationEmail = async (email, name, orderNumber, orderItems, total) => {
  return module.exports.sendEmail(email, `Order Confirmation #${orderNumber}`, 'orderConfirmation', {
    name,
    orderNumber,
    orderItems,
    total,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendRestaurantActivatedEmail,
  sendOrderConfirmationEmail,
};
