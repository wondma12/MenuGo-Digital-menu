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

  // Persist reply fields if model/table supports them (best-effort)
  try {
    await msg.update({ reply_from_restaurant: reply, reply_at: new Date() });
  } catch (e) {
    // ignore if columns don't exist; continue to send email
  }

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
  deleteContactMessage,
  replyContactMessage,
};
