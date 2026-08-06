const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
let oauth2Client = null;
// Lazy-load google auth only if OAuth2 vars are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  try {
    const { google } = require('googleapis');
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  } catch (e) {
    logger.warn('googleapis not available, Gmail OAuth2 disabled');
  }
}

// Create transporter factory (supports plain SMTP or Gmail OAuth2)
const createTransporter = async () => {
  // Prefer explicit SMTP settings when provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && (process.env.SMTP_PASS || oauth2Client)) {
    // If OAuth2 configured for Gmail use it
    if (oauth2Client && (process.env.SMTP_HOST.includes('gmail') || process.env.SMTP_HOST.includes('google'))) {
      try {
        const accessToken = await oauth2Client.getAccessToken();
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.SMTP_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: accessToken ? accessToken.token : undefined,
          },
          connectionTimeout: parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000,
          greetingTimeout: parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000,
          socketTimeout: parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000,
        });
      } catch (err) {
        logger.error('Failed to obtain Gmail access token, falling back to SMTP username/password', err && err.message ? err.message : err);
      }
    }

    // Fallback to plain SMTP auth
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
      },
      family: 4,
      connectionTimeout: parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000,
      greetingTimeout: parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000,
      socketTimeout: parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000,
    });
  }

  // If no SMTP config provided, create a direct transport (may be blocked by providers)
  logger.warn('No SMTP configuration found; using direct transport (may not deliver)');
  return nodemailer.createTransport({ sendmail: true });
};

// Load email template
const loadTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
};

// Send email
const sendEmail = async (to, subject, template, data) => {
  const transporter = await createTransporter();
  try {
    const html = loadTemplate(template, data);

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || process.env.EMAIL_FROM || 'no-reply'} <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
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
