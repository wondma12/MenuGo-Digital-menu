const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const { uploadFile, uploadMultipleFiles, deleteFile } = require('../controllers/uploadController');

// Single file upload: field name `file`
router.post('/', uploadSingle('file'), uploadFile);

// Multiple files upload: field name `files`
router.post('/multiple', uploadMultiple('files'), uploadMultipleFiles);

// Delete uploaded file by publicId (supports slashes via wildcard)
router.delete('/:publicId(*)', deleteFile);

module.exports = router;
