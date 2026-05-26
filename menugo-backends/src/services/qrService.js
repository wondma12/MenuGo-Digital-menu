const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../config/cloudinary');
const { logger } = require('../utils/logger');

// Generate QR code as file
const generateQRCodeFile = async (data, fileName) => {
  try {
    const qrDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const filePath = path.join(qrDir, `${fileName}.png`);
    await QRCode.toFile(filePath, data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return filePath;
  } catch (error) {
    logger.error('Generate QR code file error:', error);
    throw error;
  }
};

// Generate QR code as base64
const generateQRCodeBase64 = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
    return qrCode;
  } catch (error) {
    logger.error('Generate QR code base64 error:', error);
    throw error;
  }
};

// Generate QR code as buffer
const generateQRCodeBuffer = async (data) => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: 300,
      margin: 2,
    });
    return buffer;
  } catch (error) {
    logger.error('Generate QR code buffer error:', error);
    throw error;
  }
};

// Generate and upload QR code
const generateAndUploadQRCode = async (data, identifier, folder = 'menugo/qrcodes') => {
  try {
    const filePath = await generateQRCodeFile(data, identifier);
    const uploadResult = await uploadToCloudinary(filePath, folder);
    
    // Clean up local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      base64: await generateQRCodeBase64(data),
    };
  } catch (error) {
    logger.error('Generate and upload QR code error:', error);
    throw error;
  }
};

// Generate restaurant menu QR
const generateRestaurantQR = async (restaurantId, identifier) => {
  const url = `${process.env.CLIENT_URL}/menu/${identifier}`;
  return generateAndUploadQRCode(url, identifier);
};

// Generate table QR
const generateTableQR = async (restaurantId, tableNumber, identifier) => {
  const url = `${process.env.CLIENT_URL}/menu/${identifier}?table=${tableNumber}`;
  return generateAndUploadQRCode(url, identifier);
};

module.exports = {
  generateQRCodeFile,
  generateQRCodeBase64,
  generateQRCodeBuffer,
  generateAndUploadQRCode,
  generateRestaurantQR,
  generateTableQR,
};