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

const DEFAULT_PUBLIC_FRONTEND_URL = 'https://menugo-digital-menu-jgz2.onrender.com';

const normalizeUrl = (url) => String(url || '').trim().replace(/\/$/, '');

const isLocalhostUrl = (url) => /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1)(:\d+)?$/i.test(String(url || '').trim());

const getClientUrl = () => {
  const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
  if (frontendUrl && !isLocalhostUrl(frontendUrl)) return frontendUrl;

  const configuredClientUrl = normalizeUrl(process.env.CLIENT_URL);
  if (configuredClientUrl && !isLocalhostUrl(configuredClientUrl)) return configuredClientUrl;

  return DEFAULT_PUBLIC_FRONTEND_URL;
};

const buildWelcomeData = (name, options = {}) => {
  const clientUrl = getClientUrl();
  const verificationToken = options.verificationToken || null;
  const temporaryPassword = options.temporaryPassword || null;
  const replyTo = options.replyTo || null;
  const loginUrl = options.loginUrl || `${clientUrl}/login`;
  const onboardingUrl = options.onboardingUrl || `${clientUrl}/welcome`;

  return {
    appName: 'MenuGo',
    name,
    clientUrl,
    loginUrl,
    onboardingUrl,
    verifyUrl: verificationToken ? `${clientUrl}/verify-email/${verificationToken}` : null,
    temporaryPassword,
    replyTo,
    supportUrl: `${clientUrl}/contact`,
    unsubscribeUrl: `${clientUrl}/unsubscribe`,
    privacyUrl: `${clientUrl}/privacy`,
    termsUrl: `${clientUrl}/terms`,
  };
};

const buildWelcomeText = (data) => {
  const lines = [
    `Welcome to ${data.appName}!`,
    '',
    `Hello ${data.name || 'there'},`,
    'Thank you for choosing MenuGo. We\'re excited to help your restaurant grow with a modern digital experience.',
    '',
    'What you can do with MenuGo:',
    '- Create beautiful digital menus accessible via QR codes',
    '- Track orders and analytics in real-time',
    '- Manage staff and tables efficiently',
    '- Process payments securely',
    '- Collect and respond to customer reviews',
    '',
  ];

  if (data.verifyUrl) {
    lines.push('Your email verification is still required before your account can be fully activated.');
    lines.push(`Verify your email: ${data.verifyUrl}`);
    lines.push('');
  }

  if (data.temporaryPassword) {
    lines.push(`Temporary password: ${data.temporaryPassword}`);
    lines.push(`Sign in here: ${data.loginUrl}`);
    lines.push('Please change your password after your first login.');
    lines.push('');
  } else {
    lines.push('Your restaurant registration is being prepared for activation.');
    lines.push(`Start onboarding: ${data.onboardingUrl}`);
    lines.push('');
  }

  lines.push('If you need help, reply to this email or visit the support center:');
  lines.push(data.supportUrl);
  lines.push('');
  lines.push('MenuGo Team');

  return lines.join('\n');
};

const loadTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
};

const sendEmail = async (to, subject, template, data) => {
  try {
    const html = loadTemplate(template, data);
    const text = template === 'welcome' ? buildWelcomeText(data) : undefined;
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'MenuGo'} <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@menugo.local'}>`,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
      replyTo: data?.replyTo || process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || process.env.SMTP_USER,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, name, options = {}) => {
  const normalizedOptions = typeof options === 'string'
    ? { verificationToken: options }
    : (options || {});

  return module.exports.sendEmail(email, 'Welcome to MenuGo!', 'welcome', buildWelcomeData(name, {
    ...normalizedOptions,
    replyTo: email,
  }));
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;
  return module.exports.sendEmail(email, 'Reset Your Password', 'resetPassword', { name, resetUrl });
};

const sendRestaurantActivatedEmail = async (email, name, restaurantName, loginUrl = null) => {
  const clientUrl = getClientUrl();
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
