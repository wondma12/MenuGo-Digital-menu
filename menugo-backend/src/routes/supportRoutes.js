// src/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSupportTickets,
  getTicketDetails,
  createSupportTicket,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus,
  getKnowledgeBaseArticles,
} = require('../controllers/supportController');

// All support routes require authentication
router.use(protect);

// Ticket routes
router.get('/tickets', getSupportTickets);
router.get('/tickets/:ticketId', getTicketDetails);
router.post('/tickets', createSupportTicket);
router.get('/tickets/:ticketId/messages', getTicketMessages);
router.post('/tickets/:ticketId/messages', addTicketMessage);
router.patch('/tickets/:ticketId/status', updateTicketStatus);

// Knowledge base
router.get('/knowledge-base', getKnowledgeBaseArticles);

module.exports = router;