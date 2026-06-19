const express = require('express');
const router = express.Router();
const { createContactMessage, listContactMessages, deleteContactMessage, replyContactMessage } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public endpoint for creating contact messages
router.post('/', createContactMessage);

// Admin listing - protected, allow platform_admin role or system admins
router.get('/', protect, authorize('platform_admin', 'system_admin'), listContactMessages);

// Admin delete
router.delete('/:id', protect, authorize('platform_admin', 'system_admin'), deleteContactMessage);
// Admin reply - send reply to user and record reply
router.post('/:id/reply', protect, authorize('platform_admin', 'system_admin'), replyContactMessage);

module.exports = router;
