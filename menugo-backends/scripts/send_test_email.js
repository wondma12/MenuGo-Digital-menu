require('dotenv').config();
const { sendEmail } = require('../src/services/emailService');

const to = process.env.TEST_EMAIL || process.env.SMTP_USER;
if (!to) {
  console.error('Please set TEST_EMAIL or SMTP_USER in .env to receive test email');
  process.exit(1);
}

(async () => {
  try {
    const appName = process.env.APP_NAME || 'MenuGo';
    const logoUrl = process.env.APP_LOGO_URL || 'https://menugo.app/logo.svg';
    const htmlData = {
      title: `Test email from ${appName}`,
      heading: 'Test Email',
      body: '<p>This is a test email sent from the local dev environment to verify the email service.</p>',
      appName,
      logoUrl,
      year: new Date().getFullYear(),
    };

    const info = await sendEmail(to, `Test email — ${appName}`, 'plain', htmlData);
    console.log('Email sent:', info && info.messageId ? info.messageId : info);
  } catch (err) {
    console.error('Failed to send test email:', err && err.message ? err.message : err);
    process.exitCode = 2;
  }
})();
