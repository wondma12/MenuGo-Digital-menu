const { ContactMessage } = require('../models');
const { ApiResponse, paginatedResponse } = require('../utils/apiResponse');
const { catchAsync } = require('../utils/catchAsync');

const createContactMessage = catchAsync(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json(ApiResponse.error('Missing required fields'));
  }

  const msg = await ContactMessage.create({ name, email, phone, subject, message });

  // Optionally: emit a notification or email here

  res.status(201).json(ApiResponse.success(msg, 'Message received'));
});

const listContactMessages = catchAsync(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await ContactMessage.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
  });

  res.json(paginatedResponse(rows, count, page, limit));
});

module.exports = {
  createContactMessage,
  listContactMessages,
};
