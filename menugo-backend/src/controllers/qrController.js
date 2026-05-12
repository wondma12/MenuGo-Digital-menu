const { QRCode, QRCodeScan, Restaurant, Table } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { generateQRCode, generateQRCodeBase64 } = require('../utils/generateQR');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');

// Generate QR code for restaurant
const generateRestaurantQR = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Use existing restaurant qr identifier if present, otherwise create one
  let qrIdentifier = restaurant.qr_code_identifier
  let qrCloudinaryUrl = null
  let qrBase64 = null
  let qrCodeRecord = null

  // allow selecting route via query param (route=menu|cart|table|order|history|root/customer)
  // optional query params: table, orderId
  const route = (req.query && req.query.route) ? String(req.query.route).toLowerCase() : 'menu'
  const tableNumber = req.query && (req.query.table || req.query.tableNumber) ? String(req.query.table || req.query.tableNumber) : null
  const orderIdParam = req.query && req.query.orderId ? String(req.query.orderId) : null

  const getBaseUrl = () => {
    // Prefer the request origin (frontend host) so generated QR links point to the UI that made the request.
    // Fallback to configured CLIENT_URL, then to a sensible localhost default.
    const origin = (req.get && req.get('origin')) || (req.headers && req.headers.origin) || process.env.CLIENT_URL || 'http://localhost:5173'
    return String(origin).replace(/\/$/, '')
  }

  const makeQrUrl = (identifier) => {
    const base = getBaseUrl()
    if (!route || route === 'menu') return `${base}/menu/${identifier}`
    if (route === 'customer' || route === 'root') return `${base}/menu/${identifier}`
    if (route === 'cart') return `${base}/menu/${identifier}/cart`
    if (route === 'order') return orderIdParam ? `${base}/menu/${identifier}/order/${orderIdParam}` : `${base}/menu/${identifier}`
    if (route === 'history') return `${base}/menu/${identifier}/history`
    if (route === 'table') return tableNumber ? `${base}/menu/${identifier}?table=${tableNumber}` : `${base}/menu/${identifier}`
    return `${base}/menu/${identifier}`
  }

  if (!qrIdentifier) {
    // create a URL-friendly identifier
    qrIdentifier = `${restaurant.name ? restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'restaurant'}-${Date.now()}`
    const qrUrl = makeQrUrl(qrIdentifier)

    const qrImagePath = await generateQRCode(qrUrl, qrIdentifier)
    qrBase64 = await generateQRCodeBase64(qrUrl)

    if (qrImagePath && fs.existsSync(qrImagePath)) {
      const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes')
      qrCloudinaryUrl = uploadResult.url
    }

    const [newQr] = await QRCode.upsert({
      restaurant_id: restaurantId,
      identifier: qrIdentifier,
      url: qrUrl,
      qr_image_url: qrCloudinaryUrl,
      is_active: true,
    })

    qrCodeRecord = newQr
    await restaurant.update({ qr_code_identifier: qrIdentifier, qr_code_url: qrCloudinaryUrl })
  } else {
    // If identifier exists, try to find an existing record
    const existing = await QRCode.findOne({ where: { restaurant_id: restaurantId, identifier: qrIdentifier } })
    if (existing) {
      qrCodeRecord = existing
      qrCloudinaryUrl = existing.qr_image_url
    } else {
      const qrUrl = makeQrUrl(qrIdentifier)
      const qrImagePath = await generateQRCode(qrUrl, qrIdentifier)
      qrBase64 = await generateQRCodeBase64(qrUrl)
      if (qrImagePath && fs.existsSync(qrImagePath)) {
        const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes')
        qrCloudinaryUrl = uploadResult.url
      }

      const [newQr] = await QRCode.upsert({
        restaurant_id: restaurantId,
        identifier: qrIdentifier,
        url: qrUrl,
        qr_image_url: qrCloudinaryUrl,
        is_active: true,
      })

      qrCodeRecord = newQr
      await restaurant.update({ qr_code_url: qrCloudinaryUrl })
    }
  }

  res.json(ApiResponse.success({
    qr_code: qrCodeRecord,
    qr_image_url: qrCloudinaryUrl,
    qr_base64: qrBase64,
    download_url: `/api/qr/download/${qrIdentifier}`,
  }, 'QR code generated'));
});

// Generate QR code for table (reuse restaurant-level QR; do not create per-table QR)
const generateTableQR = catchAsync(async (req, res) => {
  const { restaurantId, tableId } = req.params;

  const table = await Table.findByPk(tableId);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Use the restaurant-level QR (identifier) and ensure a QR record exists
  let qrIdentifier = restaurant.qr_code_identifier
  let qrCloudinaryUrl = null
  let qrBase64 = null
  let qrCodeRecord = null

  if (!qrIdentifier) {
    // Create a new restaurant qr identifier and QR
    qrIdentifier = `${restaurant.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const qrUrl = `${getBaseUrl()}/menu/${qrIdentifier}`
    const qrImagePath = await generateQRCode(qrUrl, qrIdentifier)
    qrBase64 = await generateQRCodeBase64(qrUrl)
    if (qrImagePath && fs.existsSync(qrImagePath)) {
      const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes')
      qrCloudinaryUrl = uploadResult.url
    }

    const [newQr] = await QRCode.upsert({
      restaurant_id: restaurantId,
      identifier: qrIdentifier,
      url: qrUrl,
      qr_image_url: qrCloudinaryUrl,
      is_active: true,
    })

    qrCodeRecord = newQr
    await restaurant.update({ qr_code_identifier: qrIdentifier, qr_code_url: qrCloudinaryUrl })
  } else {
    // Try to find existing restaurant-level QR
    const existing = await QRCode.findOne({ where: { restaurant_id: restaurantId, identifier: qrIdentifier } })
    if (existing) {
      qrCodeRecord = existing
      qrCloudinaryUrl = existing.qr_image_url
    } else {
      const qrUrl = `${getBaseUrl()}/menu/${qrIdentifier}`
      const qrImagePath = await generateQRCode(qrUrl, qrIdentifier)
      qrBase64 = await generateQRCodeBase64(qrUrl)
      if (qrImagePath && fs.existsSync(qrImagePath)) {
        const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes')
        qrCloudinaryUrl = uploadResult.url
      }

      const [newQr] = await QRCode.upsert({
        restaurant_id: restaurantId,
        identifier: qrIdentifier,
        url: qrUrl,
        qr_image_url: qrCloudinaryUrl,
        is_active: true,
      })

      qrCodeRecord = newQr
      await restaurant.update({ qr_code_url: qrCloudinaryUrl })
    }
  }

  if (qrCodeRecord) {
    // Attach restaurant QR to table record for easy access in admin UI
    await table.update({ qr_code_id: qrCodeRecord.id, qr_code_url: qrCloudinaryUrl })
  }

  res.json(ApiResponse.success({
    qr_code: qrCodeRecord,
    qr_image_url: qrCloudinaryUrl,
    qr_base64: qrBase64,
  }, 'Table QR code generated (restaurant-level)'));
});

// Download QR code
const downloadQR = catchAsync(async (req, res) => {
  const { identifier } = req.params;

  const qrCode = await QRCode.findOne({ where: { identifier } });
  if (!qrCode) {
    throw new ApiError(404, 'QR code not found');
  }

  const filePath = `uploads/qrcodes/${identifier}.png`;
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'QR code file not found');
  }

  res.download(filePath, `${identifier}.png`);
});

// Record QR scan
const recordScan = catchAsync(async (req, res) => {
  const { identifier } = req.params;
  const { ip_address, user_agent, location } = req.body;

  const qrCode = await QRCode.findOne({ where: { identifier } });
  if (!qrCode) {
    throw new ApiError(404, 'QR code not found');
  }

  // Update scan count
  await qrCode.increment('scan_count');
  await qrCode.update({ last_scanned_at: new Date() });

  // Record scan log
  await QRCodeScan.create({
    qr_code_id: qrCode.id,
    restaurant_id: qrCode.restaurant_id,
    ip_address: ip_address || req.ip,
    user_agent: user_agent || req.headers['user-agent'],
    device_type: req.headers['sec-ch-ua-platform'] || 'unknown',
    browser: req.headers['sec-ch-ua'] || 'unknown',
    location: location || null,
  });

  res.json(ApiResponse.success({
    redirect_url: qrCode.url,
    restaurant_id: qrCode.restaurant_id,
    table_number: qrCode.table_number,
  }, 'Scan recorded'));
});

// Get QR code analytics
const getQRAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { period = 'week' } = req.query;

  let dateFilter = {};
  if (period === 'week') {
    dateFilter = { scanned_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
  } else if (period === 'month') {
    dateFilter = { scanned_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
  }

  const scans = await QRCodeScan.findAll({
    where: { restaurant_id: restaurantId, ...dateFilter },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('scanned_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: [sequelize.fn('DATE', sequelize.col('scanned_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('scanned_at')), 'ASC']],
  });

  const totalScans = await QRCodeScan.count({ where: { restaurant_id: restaurantId } });
  const uniqueDevices = await QRCodeScan.count({
    where: { restaurant_id: restaurantId },
    distinct: true,
    col: 'device_type',
  });

  const qrCodes = await QRCode.findAll({
    where: { restaurant_id: restaurantId },
    attributes: ['table_number', 'scan_count', 'last_scanned_at'],
  });

  res.json(ApiResponse.success({
    total_scans: totalScans,
    unique_devices: uniqueDevices,
    daily_scans: scans,
    qr_codes: qrCodes,
  }, 'QR analytics retrieved'));
});

// Get all QR codes for restaurant
const getRestaurantQRCodes = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const qrCodes = await QRCode.findAll({
    where: { restaurant_id: restaurantId },
    include: [{ model: Table, as: 'qrcode_table' }],
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success(qrCodes, 'QR codes retrieved'));
});

// Deactivate QR code
const deactivateQR = catchAsync(async (req, res) => {
  const { id } = req.params;

  const qrCode = await QRCode.findByPk(id);
  if (!qrCode) {
    throw new ApiError(404, 'QR code not found');
  }

  await qrCode.update({ is_active: false });

  res.json(ApiResponse.success(null, 'QR code deactivated'));
});

module.exports = {
  generateRestaurantQR,
  generateTableQR,
  downloadQR,
  recordScan,
  getQRAnalytics,
  getRestaurantQRCodes,
  deactivateQR,
};