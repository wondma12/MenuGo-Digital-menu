const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');

// Generate QR code as file
const generateQRCodeFile = async (data, fileName, options = {}) => {
  try {
    const qrDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const filePath = path.join(qrDir, `${fileName}.png`);
    
    await QRCode.toFile(filePath, data, {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    });

    return filePath;
  } catch (error) {
    logger.error('Generate QR code file error:', error);
    throw error;
  }
};

// Generate QR code as base64
const generateQRCodeBase64 = async (data, options = {}) => {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    });
    return qrCode;
  } catch (error) {
    logger.error('Generate QR code base64 error:', error);
    throw error;
  }
};

// Generate QR code as buffer
const generateQRCodeBuffer = async (data, options = {}) => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    });
    return buffer;
  } catch (error) {
    logger.error('Generate QR code buffer error:', error);
    throw error;
  }
};

// Generate restaurant menu QR
const generateRestaurantQR = async (restaurantId, identifier) => {
  const url = `${process.env.CLIENT_URL}/menu/${identifier}`;
  const filePath = await generateQRCodeFile(url, identifier);
  const base64 = await generateQRCodeBase64(url);
  
  return {
    filePath,
    base64,
    url,
  };
};

// Generate table QR
const generateTableQR = async (restaurantId, tableNumber, identifier) => {
  const url = `${process.env.CLIENT_URL}/menu/${identifier}?table=${tableNumber}`;
  const filePath = await generateQRCodeFile(url, identifier);
  const base64 = await generateQRCodeBase64(url);
  
  return {
    filePath,
    base64,
    url,
  };
};

// Generate order QR
const generateOrderQR = async (orderId, orderNumber) => {
  const url = `${process.env.CLIENT_URL}/order/${orderId}`;
  const filePath = await generateQRCodeFile(url, `order-${orderNumber}`);
  const base64 = await generateQRCodeBase64(url);
  
  return {
    filePath,
    base64,
    url,
  };
};

// Generate payment QR
const generatePaymentQR = async (paymentIntentId, amount) => {
  const url = `${process.env.CLIENT_URL}/payment/${paymentIntentId}?amount=${amount}`;
  const filePath = await generateQRCodeFile(url, `payment-${paymentIntentId}`);
  const base64 = await generateQRCodeBase64(url);
  
  return {
    filePath,
    base64,
    url,
  };
};

// Backward-compatible alias: some controllers import `generateQRCode`
const generateQRCode = generateQRCodeFile;

module.exports = {
  generateQRCodeFile,
  generateQRCodeBase64,
  generateQRCodeBuffer,
  generateRestaurantQR,
  generateTableQR,
  generateOrderQR,
  generatePaymentQR,
  generateQRCode,
};