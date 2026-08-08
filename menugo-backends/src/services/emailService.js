const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
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

const buildWelcomeText = (data) => {
  const lines = [
    `Welcome to MenuGo!`,
    '',
    `Hello ${data.name || 'there'},`,
    'Thanks for joining MenuGo. Your restaurant account is being prepared and should be active soon.',
    '',
    'If you need help, reply to this email or visit support.',
    '',
    'MenuGo Team',
  ];
  return lines.join('\n');
};

const getSendGridKey = () => process.env.SENDGRID_API_KEY || process.env.SENDGRID_KEY || '';

const sendViaSendGrid = async (mailOptions) => {
  const sendgridKey = getSendGridKey();
  if (!sendgridKey) {
    throw new Error('SendGrid API key not configured');
  }

  const payload = {
    personalizations: [{ to: [{ email: mailOptions.to }], subject: mailOptions.subject }],
    from: { email: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@menugo.local', name: process.env.EMAIL_FROM_NAME || 'MenuGo' },
    content: [
      { type: 'text/plain', value: mailOptions.text || '' },
      { type: 'text/html', value: mailOptions.html || '' },
    ],
    reply_to: mailOptions.replyTo ? { email: mailOptions.replyTo } : undefined,
  };

  const response = await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
    headers: { Authorization: `Bearer ${sendgridKey}`, 'Content-Type': 'application/json' },
    timeout: parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000,
  });

  if (response && (response.status === 202 || response.status === 200)) {
    return { messageId: `sendgrid-${Date.now()}` };
  }

  throw new Error(`SendGrid HTTP API returned status ${response.status}`);
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
      ...(template === 'welcome' ? { text: buildWelcomeText(data) } : {}),
      replyTo: data?.replyTo || process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || process.env.SMTP_USER,
    };

    const sendgridKey = getSendGridKey();
    if (sendgridKey) {
      try {
        logger.info(`Sending email to ${to} using SendGrid HTTP API`);
        return await sendViaSendGrid(mailOptions);
      } catch (sendgridErr) {
        logger.warn('SendGrid HTTP API send failed, falling back to SMTP:', sendgridErr && sendgridErr.message ? sendgridErr.message : sendgridErr);
      }
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);

    const sendgridKey = getSendGridKey();
    if (sendgridKey) {
      try {
        logger.info(`Attempting SendGrid fallback for ${to}`);
        return await sendViaSendGrid({ ...{ to, subject, html: loadTemplate(template, data), text: template === 'welcome' ? buildWelcomeText(data) : undefined, replyTo: data?.replyTo || process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || process.env.SMTP_USER }, from: mailOptions.from });
      } catch (sgErr) {
        logger.warn('SendGrid fallback failed:', sgErr && sgErr.message ? sgErr.message : sgErr);
      }
    }

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
