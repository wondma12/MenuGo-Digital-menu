const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const dns = require('dns').promises;
const axios = require('axios');

const SMTP_HOST = String(process.env.SMTP_HOST || '').trim();
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || (process.env.SMTP_SECURE === 'true' ? 465 : 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const DEFAULT_SMTP_TIMEOUT = parseInt(process.env.SMTP_TIMEOUT_MS, 10) || 20000; // 20s default, override with env

// DEBUG: verify nodemailer import shape during module init
// (debug log removed)

const createTransportConfig = (host, port = SMTP_PORT, secure = SMTP_SECURE) => ({
  host: host || undefined,
  port,
  secure,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  tls: {
    servername: SMTP_HOST || undefined,
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    minVersion: 'TLSv1.2',
  },
  requireTLS: !secure,
  ignoreTLS: false,
  family: 4,
  connectionTimeout: DEFAULT_SMTP_TIMEOUT,
  greetingTimeout: DEFAULT_SMTP_TIMEOUT,
  socketTimeout: DEFAULT_SMTP_TIMEOUT,
});

const createTransportForHost = (host, port = SMTP_PORT, secure = SMTP_SECURE) => {
  return nodemailer.createTransport(createTransportConfig(host, port, secure));
};

const createGmailServiceTransport = () => {
  if (!SMTP_HOST.includes('gmail') && !SMTP_HOST.includes('google')) {
    return null;
  }
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: DEFAULT_SMTP_TIMEOUT,
    greetingTimeout: DEFAULT_SMTP_TIMEOUT,
    socketTimeout: DEFAULT_SMTP_TIMEOUT,
  });
};

// Create a default transporter immediately (do not rely on the async resolver to finish)
const transporter = nodemailer.createTransport(createTransportConfig(SMTP_HOST));

// NOTE: Startup IPv4 probing is intentionally disabled to avoid network
// operations during module import. Per-send fallback and IPv4 retries are
// handled by `sendEmail` itself to make the module safe to require.

const DEFAULT_PUBLIC_FRONTEND_URL = 'https://menugo-digital-menu-jgz2.onrender.com';

const normalizeUrl = (url) => String(url || '').trim().replace(/\/$/, '');

const isLocalhostUrl = (url) => /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1)(:\d+)?$/i.test(String(url || '').trim());

const getClientUrl = () => {
  const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
  if (frontendUrl && !isLocalhostUrl(frontendUrl)) {
    return frontendUrl;
  }

  const configuredClientUrl = normalizeUrl(process.env.CLIENT_URL);
  if (configuredClientUrl && !isLocalhostUrl(configuredClientUrl)) {
    return configuredClientUrl;
  }

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
    timeout: DEFAULT_SMTP_TIMEOUT,
  });

  if (response && (response.status === 202 || response.status === 200)) {
    return { messageId: `sendgrid-${Date.now()}` };
  }

  throw new Error(`SendGrid HTTP API returned status ${response.status}`);
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

    // If SendGrid is configured, try the safer HTTP API before direct SMTP.
    const sendgridKey = getSendGridKey();
    if (sendgridKey) {
      try {
        logger.info(`Sending email to ${to} using SendGrid HTTP API`);
        return await sendViaSendGrid(mailOptions);
      } catch (sendgridErr) {
        logger.warn('SendGrid API send failed, falling back to SMTP:', sendgridErr && sendgridErr.message ? sendgridErr.message : sendgridErr);
      }
    }

    // Attempt to send with retries and IPv4 fallbacks when network errors occur
    const maxAttempts = 3;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    let lastErr = null;

    // Build list of candidate transports: current transporter first, then resolved IPv4 addresses
    const candidates = [];
    const gmailTransport = createGmailServiceTransport();
    if (gmailTransport) {
      candidates.push({ name: 'gmail', transport: gmailTransport });
    }

    candidates.push({ name: 'default', transport: transporter });

    if (SMTP_HOST) {
      try {
        const addrs = await dns.resolve4(SMTP_HOST).catch(() => []);
        for (const addr of addrs) {
          candidates.push({ name: `ipv4:${addr}`, transport: createTransportForHost(addr) });
        }
        if (SMTP_PORT !== 465 || !SMTP_SECURE) {
          candidates.push({ name: `secure-465`, transport: createTransportForHost(SMTP_HOST, 465, true) })
        }      } catch (e) {
        logger.warn('SMTP DNS resolve failed, skipping IPv4 fallback:', e && e.message ? e.message : e);
      }
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      for (const cand of candidates) {
        try {
          logger.info(`Attempt ${attempt}: sending email to ${to} via ${cand.name}`);
          const info = await cand.transport.sendMail(mailOptions);
          logger.info(`Email sent to ${to} via ${cand.name}: ${info.messageId}`);
          // Close IPv4-created transports to avoid resource leakage
          try {
            if (cand.name.startsWith('ipv4:') && typeof cand.transport.close === 'function') {
              cand.transport.close();
            } 
          } catch (e) { /* ignore */ }
          return info;
        } catch (error) {
          lastErr = error;
          logger.warn(`Email send attempt ${attempt} via ${cand.name} failed: ${error && error.message ? error.message : error}`);
          // Close per-candidate transport if it was created for this attempt
          try {
            if (cand.name.startsWith('ipv4:') && typeof cand.transport.close === 'function') {
              cand.transport.close();
            } 
          } catch (e) { /* ignore */ }
          // On network timeout or unreachable errors, continue to next candidate
          if (error && /ENETUNREACH|EHOSTUNREACH|EADDRNOTAVAIL|ETIMEDOUT|ECONNREFUSED/i.test(String(error.code || error.errno || error.message || ''))) {
            // try next candidate immediately
            continue;
          }
          // For other errors (auth, invalid address), no point retrying this candidate
        }
      }

      // Exponential backoff before next round
      const delay = 500 * Math.pow(2, attempt - 1);
      logger.info(`Waiting ${delay}ms before next email retry round`);
      await sleep(delay);
    }

    // All attempts failed; try SendGrid HTTP fallback if configured
    logger.error('Email send failed after retries:', lastErr && (lastErr.message || lastErr));

    if (sendgridKey) {
      try {
        logger.info('Attempting SendGrid HTTP fallback');
        return await sendViaSendGrid(mailOptions);
      } catch (sgErr) {
        lastErr = sgErr;
        logger.warn('SendGrid fallback failed:', sgErr && (sgErr.message || sgErr));
      }
    }

    throw lastErr || new Error('Email send failed');
    
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
