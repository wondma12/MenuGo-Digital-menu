require('dotenv').config();
const { sendWelcomeEmail, sendRestaurantActivatedEmail } = require('../src/config/email');

const toAddress = process.env.SMTP_USER || 'test@example.com';
(async () => {
  try {
    console.log('Sending welcome email to', toAddress);
    const res1 = await sendWelcomeEmail(toAddress, 'Test User', { verificationToken: 'test-token-123' });
    console.log('Welcome email result:', res1 && res1.messageId ? res1.messageId : res1);
  } catch (e) {
    console.error('Welcome email failed:', e && e.message ? e.message : e);
  }

  try {
    console.log('Sending restaurant activated email to', toAddress);
    const res2 = await sendRestaurantActivatedEmail(toAddress, 'Test User', 'Test Restaurant');
    console.log('Activated email result:', res2 && res2.messageId ? res2.messageId : res2);
  } catch (e) {
    console.error('Activated email failed:', e && e.message ? e.message : e);
  }
})();