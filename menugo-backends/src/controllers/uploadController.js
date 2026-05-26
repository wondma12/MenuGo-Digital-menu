const path = require('path');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Single file upload handler
const uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const folder = req.body.folder || 'menugo/temp';

  // Try uploading to Cloudinary (if configured). If not configured, fall back to local static URL.
  const uploadResult = await uploadToCloudinary(req.file.path, folder);

  if (uploadResult && uploadResult.url) {
    return res.json(ApiResponse.success({ url: uploadResult.url, publicId: uploadResult.publicId }, 'File uploaded'));
  }

  // Fallback: return local uploads path so the frontend can use the file served by the static middleware
  const normalized = req.file.path.replace(/\\/g, '/');
  const publicPath = `/${normalized}`;
  return res.json(ApiResponse.success({ url: publicPath }, 'File uploaded (local)'));
});

// Multiple files upload handler
const uploadMultipleFiles = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files uploaded');
  }

  const folder = req.body.folder || 'menugo/temp';
  const results = [];

  for (const file of req.files) {
    const uploadResult = await uploadToCloudinary(file.path, folder);
    if (uploadResult && uploadResult.url) {
      results.push({ url: uploadResult.url, publicId: uploadResult.publicId });
    } else {
      const normalized = file.path.replace(/\\/g, '/');
      results.push({ url: `/${normalized}` });
    }
  }

  res.json(ApiResponse.success(results, 'Files uploaded'));
});

// Delete uploaded file by public id
const deleteFile = catchAsync(async (req, res) => {
  const publicId = req.params.publicId || req.body.publicId;
  if (!publicId) {
    throw new ApiError(400, 'publicId is required');
  }

  const result = await deleteFromCloudinary(publicId);
  res.json(ApiResponse.success({ result }, 'File deleted'));
});

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
};
