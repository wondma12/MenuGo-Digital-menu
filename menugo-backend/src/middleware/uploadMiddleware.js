const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ApiError } = require('../utils/apiError');

// Ensure upload directories exist (include documents)
const uploadDirs = [
  'uploads',
  'uploads/menus',
  'uploads/qrcodes',
  'uploads/avatars',
  'uploads/invoices',
  'uploads/documents',
  'uploads/temp',
];
uploadDirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    // If directory creation fails, log and continue; middleware will handle errors later
    console.error('Failed to ensure upload dir exists:', dir, err && err.message);
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/temp';
    if (file.fieldname === 'menuImage' || file.fieldname === 'itemImage') {
      folder = 'uploads/menus';
    } else if (file.fieldname === 'avatar') {
      folder = 'uploads/avatars';
    } else if (file.fieldname === 'qrCode') {
      folder = 'uploads/qrcodes';
    } else if (file.fieldname === 'invoice') {
      folder = 'uploads/invoices';
    } else if (file.fieldname === 'document') {
      folder = 'uploads/documents';
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow bypass in development for local testing convenience
  if (process.env.ALLOW_DEV_UPLOAD_ANY === 'true') {
    return cb(null, true)
  }

  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed'));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB default
  fileFilter: fileFilter,
});

// Single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return next(new ApiError(400, 'File too large. Maximum size is 5MB'));
        }
        return next(new ApiError(400, err.message));
      } else if (err) {
        return next(new ApiError(400, err.message));
      }
      return next();
    });
  };
};

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return next(new ApiError(400, 'File too large. Maximum size is 5MB'));
        }
        return next(new ApiError(400, err.message));
      } else if (err) {
        return next(new ApiError(400, err.message));
      }
      return next();
    });
  };
};

// Multiple fields upload
const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return next(new ApiError(400, 'File too large. Maximum size is 5MB'));
        }
        return next(new ApiError(400, err.message));
      } else if (err) {
        return next(new ApiError(400, err.message));
      }
      return next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  upload,
};