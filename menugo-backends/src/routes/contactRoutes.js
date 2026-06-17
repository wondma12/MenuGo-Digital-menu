const express = require('express');
const router = express.Router();
const { createContactMessage, listContactMessages } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public endpoint for creating contact messages
router.post('/', createContactMessage);

// Admin listing - protected, allow platform_admin role or system admins
router.get('/', protect, authorize('platform_admin', 'system_admin'), listContactMessages);

module.exports = router;
