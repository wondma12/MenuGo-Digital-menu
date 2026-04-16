const twilio = require('twilio');
const { logger } = require('../utils/logger');

let twilioClient = null;

// Initialize Twilio client
const initTwilio = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    logger.info('Twilio SMS service initialized');
  } else {
    logger.warn('Twilio credentials not configured');
  }
};

// Send SMS
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    logger.warn('Twilio not configured, SMS not sent');
    return null;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    logger.info(`SMS sent to ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    logger.error('SMS send error:', error);
    throw error;
  }
};

// Send order confirmation SMS
const sendOrderConfirmationSMS = async (phone, orderNumber, total) => {
  const message = `MenuGo: Your order #${orderNumber} for $${total} has been confirmed. Thank you!`;
  return sendSMS(phone, message);
};

// Send order ready SMS
const sendOrderReadySMS = async (phone, orderNumber) => {
  const message = `MenuGo: Your order #${orderNumber} is ready for pickup!`;
  return sendSMS(phone, message);
};

// Send verification code SMS
const sendVerificationCodeSMS = async (phone, code) => {
  const message = `MenuGo: Your verification code is: ${code}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

// Send OTP SMS
const sendOTPSMS = async (phone, otp) => {
  const message = `MenuGo: Your OTP is: ${otp}. Do not share this with anyone.`;
  return sendSMS(phone, message);
};

module.exports = {
  initTwilio,
  sendSMS,
  sendOrderConfirmationSMS,
  sendOrderReadySMS,
  sendVerificationCodeSMS,
  sendOTPSMS,
};