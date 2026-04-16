const cloudinary = require('cloudinary').v2;
const { logger } = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath, folder = 'menugo') => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      logger.warn('Cloudinary not configured (CLOUDINARY_CLOUD_NAME missing). Skipping upload.');
      return null;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      logger.warn('Cloudinary not configured (CLOUDINARY_CLOUD_NAME missing). Skipping delete.');
      return null;
    }
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
