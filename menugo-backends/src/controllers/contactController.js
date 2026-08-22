const { Op } = require('sequelize');
const ContactMessage = require('../models/ContactMessage');
const { ApiResponse, paginatedResponse } = require('../utils/apiResponse');
const { catchAsync } = require('../utils/catchAsync');

const getMessageStatus = (msg) => {
  if (!msg) return 'unread';
  if (msg.replied_at || msg.reply_from_restaurant) return 'replied';
  if (msg.read_at) return 'read';
  return msg.status || 'unread';
};

const toMessageView = (msg) => ({
  ...msg.toJSON(),
  status: getMessageStatus(msg),
});

const createContactMessage = catchAsync(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json(ApiResponse.error('Missing required fields'));
  }

  const msg = await ContactMessage.create({
    name,
    email,
    phone,
    subject,
    message,
    status: 'unread',
    read_at: null,
    replied_at: null,
    reply_from_restaurant: null,
  });

  // Optionally: emit a notification or email here

  res.status(201).json(ApiResponse.success(msg, 'Message received'));
});

const listContactMessages = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;
  const where = {};

  if (search) {
    const searchPattern = `%${String(search).trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: searchPattern } },
      { email: { [Op.like]: searchPattern } },
      { subject: { [Op.like]: searchPattern } },
      { message: { [Op.like]: searchPattern } },
    ];
  }

  if (status === 'unread') {
    where.read_at = null;
    where.replied_at = null;
    where.reply_from_restaurant = null;
  } else if (status === 'read') {
    where.read_at = { [Op.ne]: null };
    where.replied_at = null;
    where.reply_from_restaurant = null;
  } else if (status === 'replied') {
    where[Op.or] = [
      ...(where[Op.or] || []),
      { replied_at: { [Op.ne]: null } },
      { reply_from_restaurant: { [Op.ne]: null } },
    ];
  }

  const { count, rows } = await ContactMessage.findAndCountAll({
    where,
    limit: parsedLimit,
    offset,
    order: [['created_at', 'DESC']],
  });

  const [total, read, replied] = await Promise.all([
    ContactMessage.count(),
    ContactMessage.count({
      where: {
        read_at: { [Op.ne]: null },
        [Op.and]: [
          { replied_at: null },
          { reply_from_restaurant: null },
        ],
      },
    }),
    ContactMessage.count({
      where: {
        [Op.or]: [
          { replied_at: { [Op.ne]: null } },
          { reply_from_restaurant: { [Op.ne]: null } },
        ],
      },
    }),
  ]);

  const unread = Math.max(total - read - replied, 0);
  const summary = { total, unread, read, replied };

  res.json(paginatedResponse(rows.map(toMessageView), count, parsedPage, parsedLimit, summary));
});

const markContactMessageRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const msg = await ContactMessage.findByPk(id);
  if (!msg) return res.status(404).json(ApiResponse.error('Message not found'));

  if (!msg.read_at) {
    await msg.update({
      status: msg.replied_at || msg.reply_from_restaurant ? 'replied' : 'read',
      read_at: new Date(),
    });
  }

  res.json(ApiResponse.success(toMessageView(msg), 'Message marked as read'));
});

const deleteContactMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const msg = await ContactMessage.findByPk(id);
  if (!msg) {
    return res.status(404).json(ApiResponse.error('Message not found'));
  }
  await msg.destroy();
  res.json(ApiResponse.success(null, 'Message deleted'));
});

const replyContactMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  if (!reply || !reply.trim()) return res.status(400).json(ApiResponse.error('Reply is required'));

  const msg = await ContactMessage.findByPk(id);
  if (!msg) return res.status(404).json(ApiResponse.error('Message not found'));

  await msg.update({
    status: 'replied',
    read_at: msg.read_at || new Date(),
    replied_at: new Date(),
    reply_from_restaurant: reply,
  });

  // Send reply email to the original sender if email configured
  try {
    const { sendEmail } = require('../services/emailService');
    const subject = `Reply from ${process.env.APP_NAME || 'MenuGo'}: ${msg.subject || 'Response'}`;
    await sendEmail(msg.email, subject, 'plain', { body: reply });
  } catch (err) {
    // non-fatal: log and continue
    console.error('replyContactMessage: email send failed', err && err.message ? err.message : err);
  }

  res.json(ApiResponse.success(null, 'Reply sent'));
});

module.exports = {
  createContactMessage,
  listContactMessages,
  markContactMessageRead,
  deleteContactMessage,
  replyContactMessage,
};
