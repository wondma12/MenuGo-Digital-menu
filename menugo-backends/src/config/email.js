const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const dns = require('dns').promises;

const SMTP_HOST = String(process.env.SMTP_HOST || '').trim();
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || (process.env.SMTP_SECURE === 'true' ? 465 : 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

let transporter = nodemailer.createTransport({
  host: SMTP_HOST || undefined,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  // Ensure TLS SNI uses the configured host when connecting by IP fallback later
  tls: { servername: SMTP_HOST || undefined },
});

// Proactively prefer IPv4 when possible to avoid ENETUNREACH on platforms
// without IPv6 routing. We attempt a DNS lookup for an IPv4 address at
// startup and, if found, recreate the transporter to connect directly to
// the IPv4 address while preserving SNI via `tls.servername`.
(async () => {
  try {
    if (SMTP_HOST) {
      const lookup = await dns.lookup(SMTP_HOST, { family: 4 });
      if (lookup && lookup.address) {
        logger.info(`Using IPv4 SMTP address ${lookup.address} for host ${SMTP_HOST}`);
        transporter = nodemailer.createTransport({
          host: lookup.address,
          port: SMTP_PORT,
          secure: SMTP_SECURE,
          auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
          tls: { servername: SMTP_HOST }, // preserve SNI
        });
      }
    }
  } catch (e) {
    // Non-fatal: keep the original transporter and rely on per-send fallback
    logger.warn('IPv4 SMTP lookup failed at startup, will fallback on send-time when necessary:', e && e.message ? e.message : e);
  }
})()
  .catch(() => {})
;

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

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      // If the environment cannot reach the resolved IPv6 address (common on some hosts),
      // try resolving the SMTP host to an IPv4 address and retry using that IP.
      logger.error('Email send error:', error);

      const shouldRetryIPv4 = error && (error.code === 'ENETUNREACH' || error.errno === -101 || /ENETUNREACH|EHOSTUNREACH|EADDRNOTAVAIL/i.test(String(error.message || '')));
      if (shouldRetryIPv4 && SMTP_HOST) {
        try {
          const lookup = await dns.lookup(SMTP_HOST, { family: 4 });
          if (lookup && lookup.address) {
            logger.info(`Retrying email send via IPv4 address ${lookup.address} for host ${SMTP_HOST}`);
            const fallbackTransport = nodemailer.createTransport({
              host: lookup.address,
              port: SMTP_PORT,
              secure: SMTP_SECURE,
              auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
              tls: { servername: SMTP_HOST }, // preserve SNI
            });

            const info2 = await fallbackTransport.sendMail(mailOptions);
            logger.info(`Email sent to ${to} (via IPv4 ${lookup.address}): ${info2.messageId}`);
            return info2;
          }
        } catch (lookupErr) {
          logger.error('IPv4 fallback lookup/send failed:', lookupErr && lookupErr.message ? lookupErr.message : lookupErr);
        }
      }

      // If we couldn't recover, rethrow the original error so callers can handle it
      throw error;
    }
  } catch (error) {
    logger.error('Email send error (outer):', error && error.message ? error.message : error);
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
