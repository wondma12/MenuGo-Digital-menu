// src/controllers/supportController.js
const { SupportTicket, TicketMessage, User, Restaurant } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { applyUpgradeRequestToRestaurant } = require('../utils/subscriptionUtils');
const { Op } = require('sequelize');

// Get all support tickets
const getSupportTickets = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, priority, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (status && status !== 'all') where.status = status;
  if (priority && priority !== 'all') where.priority = priority;
  if (search) {
    where[Op.or] = [
      { subject: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { ticket_number: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await SupportTicket.findAndCountAll({
    where,
    include: [
      { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'logo_url'] },
      { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
    ],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success({
    tickets: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  }, 'Support tickets retrieved'));
});

// Get ticket details
const getTicketDetails = catchAsync(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await SupportTicket.findByPk(ticketId, {
    include: [
      { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'logo_url'] },
      { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
      { 
        model: TicketMessage, 
        as: 'messages',
        include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] }],
        order: [['created_at', 'ASC']],
      },
    ],
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  res.json(ApiResponse.success(ticket, 'Ticket details retrieved'));
});

// Create support ticket
const createSupportTicket = catchAsync(async (req, res) => {
  const { restaurant_id, subject, description, priority, category } = req.body;
  const userId = req.user.id;

  const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const ticket = await SupportTicket.create({
    restaurant_id,
    user_id: userId,
    ticket_number: ticketNumber,
    subject,
    description,
    priority: priority || 'medium',
    category: category || 'general',
    status: 'open',
  });

  res.status(201).json(ApiResponse.success(ticket, 'Support ticket created'));
});

// Get ticket messages
const getTicketMessages = catchAsync(async (req, res) => {
  const { ticketId } = req.params;

  const messages = await TicketMessage.findAll({
    where: { ticket_id: ticketId },
    include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] }],
    order: [['created_at', 'ASC']],
  });

  res.json(ApiResponse.success(messages, 'Ticket messages retrieved'));
});

// Add ticket message
const addTicketMessage = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const { message } = req.body;
  const userId = req.user.id;

  const ticket = await SupportTicket.findByPk(ticketId);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  const ticketMessage = await TicketMessage.create({
    ticket_id: ticketId,
    user_id: userId,
    message,
    is_internal_note: req.user.role === 'platform_admin' ? false : false,
  });

  // Update ticket status if customer replied to closed ticket
  if (req.user.role !== 'platform_admin' && ticket.status === 'resolved') {
    await ticket.update({ status: 'open' });
  }

  res.status(201).json(ApiResponse.success(ticketMessage, 'Message added'));
});

// Update ticket status
const updateTicketStatus = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  const ticket = await SupportTicket.findByPk(ticketId);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  await ticket.update({
    status,
    resolved_at: status === 'resolved' ? new Date() : ticket.resolved_at,
  });

  if (status === 'resolved') {
    try {
      await applyUpgradeRequestToRestaurant(ticket, Restaurant);
    } catch (upstreamError) {
      console.warn('Upgrade request resolution did not apply to restaurant:', upstreamError?.message || upstreamError);
    }
  }

  res.json(ApiResponse.success(ticket, 'Ticket status updated'));
});

// Get knowledge base articles
const getKnowledgeBaseArticles = catchAsync(async (req, res) => {
  const { search, category } = req.query;
  
  // Mock knowledge base data
  const articles = [
    {
      id: 1,
      title: 'How to create a menu item',
      category: 'menu',
      content: 'Step by step guide to create menu items...',
      views: 1250,
      helpful: 98,
    },
    {
      id: 2,
      title: 'Managing table reservations',
      category: 'tables',
      content: 'Learn how to manage table reservations...',
      views: 890,
      helpful: 95,
    },
    {
      id: 3,
      title: 'Setting up QR codes',
      category: 'qr',
      content: 'Complete guide to QR code setup...',
      views: 2100,
      helpful: 99,
    },
  ];

  let filtered = articles;
  if (search) {
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (category && category !== 'all') {
    filtered = filtered.filter(a => a.category === category);
  }

  res.json(ApiResponse.success(filtered, 'Knowledge base articles retrieved'));
});

module.exports = {
  getSupportTickets,
  getTicketDetails,
  createSupportTicket,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus,
  getKnowledgeBaseArticles,
};