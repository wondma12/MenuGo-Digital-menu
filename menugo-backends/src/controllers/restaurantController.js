// src/controllers/restaurantController.js - Corrected (NO route definitions here)

const {
  Restaurant,
  RestaurantStaff,
  User,
  RestaurantSetting,
  MenuCategory,
  MenuItem,
  MenuItemOptionGroup,
  MenuItemOption,
  MenuItemModifier,
  MenuItemModifierAssignment,
  Table,
  QRCode,
  Coupon,
  CouponUsage,
  InventoryItem,
  InventoryTransaction,
  DailySalesSummary,
  MenuItemAnalytics,
  HourlyAnalytics,
  Review,
  SupportTicket,
  sequelize,
} = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { generateQRCode, generateQRCodeBase64 } = require('../utils/generateQR');
const { uploadToCloudinary } = require('../config/cloudinary');
const { applyUpgradeRequestToRestaurant } = require('../utils/subscriptionUtils');
const SequelizePkg = require('sequelize');
const { Op } = SequelizePkg;
const { logger } = require('../utils/logger');
const { sendRestaurantActivatedEmail } = require('../config/email');

const normalizeSettingsValue = (value) => {
  if (!value) {
    return {};
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return {};
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  return {};
};

const normalizeBooleanValue = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'approved', 'accept', 'accepted', 'enabled', 'enable'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'rejected', 'reject', 'denied', 'disabled', 'disable'].includes(normalized)) {
    return false;
  }
  return undefined;
};

const normalizeVerificationPayload = (payload = {}) => {
  const is_verified = normalizeBooleanValue(payload.is_verified ?? payload.isVerified ?? payload.status ?? payload.approved);
  const rejection_reason = payload.rejection_reason ?? payload.rejectionReason ?? payload.notes ?? null;
  return { is_verified, rejection_reason };
};

// Get all restaurants (platform admin)
const getAllRestaurants = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, tier, country, search } = req.query;
  const offset = (page - 1) * limit;

  const where = { deleted_at: null };
  
  // If user is NOT a platform admin, filter to show only active/verified restaurants
  const isAdmin = req.user && req.user.role === 'platform_admin';
  if (!isAdmin) {
    where.is_active = true;
    where.is_verified = true;
  }
  
  // Status filter
  if (status && status !== 'all') {
    if (status === 'active') {
      where.is_active = true;
      where.is_verified = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    } else if (status === 'pending') {
      where.is_verified = false;
      where.is_active = true;
    } else if (status === 'suspended') {
      where.is_active = false;
      where.is_verified = true;
    }
  }
  
  // Subscription tier filter
  if (tier && tier !== 'all') {
    where.subscription_tier = tier;
  }
  
  // Country filter
  if (country && country !== 'all') {
    where.country = country;
  }
  
  // Search filter
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
      { city: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Restaurant.findAndCountAll({
    where,
    include: [
      { model: User, as: 'restaurant_owner', attributes: ['id', 'full_name', 'email', 'phone'] },
    ],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  // Attach menu item counts to each restaurant so the platform list can show
  // real values instead of defaulting to 0.
  const restaurantIds = rows.map((restaurant) => restaurant.id).filter(Boolean);
  let menuCountMap = new Map();
  if (restaurantIds.length > 0) {
    const menuCounts = await MenuItem.findAll({
      attributes: [
        'restaurant_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_menu_items'],
      ],
      where: {
        restaurant_id: { [Op.in]: restaurantIds },
        deleted_at: null,
      },
      group: ['restaurant_id'],
      raw: true,
    }).catch(() => []);

    menuCountMap = new Map(
      menuCounts.map((item) => [String(item.restaurant_id), Number(item.total_menu_items || 0)]),
    );
  }

  const upgradeRequestCounts = await SupportTicket.findAll({
    attributes: [
      'restaurant_id',
      [sequelize.fn('COUNT', sequelize.col('id')), 'pending_upgrade_request_count'],
    ],
    where: {
      restaurant_id: { [Op.in]: restaurantIds },
      status: 'open',
      category: 'billing',
    },
    group: ['restaurant_id'],
    raw: true,
  }).catch(() => []);

  const upgradeRequestMap = new Map(
    upgradeRequestCounts.map((item) => [String(item.restaurant_id), Number(item.pending_upgrade_request_count || 0)]),
  );

  const restaurantsWithCounts = rows.map((restaurant) => {
    const plainRestaurant = restaurant.toJSON ? restaurant.toJSON() : restaurant;
    return {
      ...plainRestaurant,
      total_menu_items: menuCountMap.get(String(plainRestaurant.id)) || 0,
      pending_upgrade_request_count: upgradeRequestMap.get(String(plainRestaurant.id)) || 0,
    };
  });

  // Calculate additional stats
  const activeCount = await Restaurant.count({ 
    where: { is_active: true, is_verified: true, deleted_at: null } ,
  });
  const pendingCount = await Restaurant.count({ 
    where: { is_verified: false, is_active: true, deleted_at: null },
  });
  const premiumCount = await Restaurant.count({ 
    where: { subscription_tier: 'monthly', deleted_at: null },
  });
  const pendingUpgradeRequestsTotal = upgradeRequestCounts.reduce(
    (sum, item) => sum + Number(item.pending_upgrade_request_count || 0),
    0,
  );

  res.json(ApiResponse.success({
    restaurants: restaurantsWithCounts,
    total: count,
    active: activeCount,
    pending: pendingCount,
    premium: premiumCount,
    pendingUpgradeRequests: pendingUpgradeRequestsTotal,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  }, 'Restaurants retrieved'));
});

// Get restaurant by ID (accepts UUID PK or qr_code_identifier slug)
const getRestaurantById = catchAsync(async (req, res) => {
  const { id: paramId } = req.params;

  // UUID regex to detect if the param is a PK
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Shared include configuration used for both PK and slug lookups
  const includes = [
    { 
      model: User, 
      as: 'restaurant_owner', 
      attributes: ['id', 'full_name', 'email', 'phone'],
    },
    { 
      model: RestaurantStaff,
      as: 'restaurant_staff_members',
      include: [{ model: User, as: 'assigned_user', attributes: ['id', 'full_name', 'email', 'avatar_url'] }],
      required: false,
      // SQLite doesn't support limit in nested includes; remove it
      // limit: 20,
    },
    { 
      model: MenuCategory, 
      as: 'menu_categories', 
      where: { is_active: true },
      required: false,
      // SQLite doesn't support limit in nested includes; remove it
      // limit: 50,
    },
    { 
      model: MenuItem, 
      as: 'restaurant_menu_items', 
      where: { deleted_at: null },
      required: false,
      // SQLite doesn't support limit in nested includes; remove it
      // limit: 100,
    },
    { 
      model: Table, 
      as: 'restaurant_tables', 
      required: false,
      // SQLite doesn't support limit in nested includes; remove it
      // limit: 50,
    },
  ];

  const normalizeIdentifier = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

  let restaurant = null;
  if (uuidRegex.test(paramId)) {
    // Primary key lookup for UUID ids only.
    restaurant = await Restaurant.findByPk(paramId, { include: includes });
  } else {
    // Slug lookup by identifier. Avoid calling findByPk with non-UUID text because
    // PostgreSQL UUID columns will reject invalid UUID syntax.
    restaurant = await Restaurant.findOne({ where: { qr_code_identifier: paramId, deleted_at: null }, include: includes });

    // If not found by explicit identifier, try forgiving slug/name normalization.
    if (!restaurant) {
      const normalizedParam = normalizeIdentifier(paramId);
      const candidates = await Restaurant.findAll({ where: { deleted_at: null }, include: includes });
      restaurant = candidates.find((r) => {
        try {
          const slug = normalizeIdentifier(r.qr_code_identifier) || normalizeIdentifier(r.name);
          return slug === normalizedParam || normalizeIdentifier(r.name) === normalizedParam;
        } catch (e) {
          return false;
        }
      }) || null;
      if (restaurant && restaurant.toJSON) {
        restaurant = Restaurant.build(restaurant.toJSON(), { isNewRecord: false });
      }
    }
  }

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Use the resolved restaurant PK for subsequent counts and queries
  const restaurantPk = restaurant.id;

  // Calculate additional stats
  const totalMenuItems = await MenuItem.count({ 
    where: { restaurant_id: restaurantPk, deleted_at: null },
  });
  const totalCategories = await MenuCategory.count({ 
    where: { restaurant_id: restaurantPk, is_active: true },
  });
  const totalTables = await Table.count({ 
    where: { restaurant_id: restaurantPk }, 
  });

  const parsedSettings = normalizeSettingsValue(restaurant.settings);

  const businessLicenseSettings =
    parsedSettings?.business_license && typeof parsedSettings.business_license === 'object' && !Array.isArray(parsedSettings.business_license)
      ? parsedSettings.business_license
      : {};

  const resolvedBusinessLicenseUrl = (
    restaurant.business_license_url ||
    parsedSettings?.business_license_url ||
    parsedSettings?.businessLicenseUrl ||
    businessLicenseSettings.url ||
    businessLicenseSettings.fileUrl ||
    businessLicenseSettings.file_url ||
    businessLicenseSettings.document_url ||
    businessLicenseSettings.documentUrl ||
    businessLicenseSettings.path ||
    parsedSettings?.document_url ||
    parsedSettings?.documentUrl ||
    restaurant?.document_url ||
    restaurant?.documentUrl ||
    null
  );

  const responseData = {
    ...restaurant.toJSON(),
    cover_image_url: restaurant.cover_image_url || null,
    logo_url: restaurant.logo_url || null,
    settings: parsedSettings,
    business_license_url: resolvedBusinessLicenseUrl,
    tax_rate: restaurant.tax_rate ?? restaurant.getDataValue?.('tax_rate') ?? 0,
    taxRate: restaurant.tax_rate ?? restaurant.getDataValue?.('tax_rate') ?? 0,
    service_charge: restaurant.service_charge ?? restaurant.getDataValue?.('service_charge') ?? 0,
    serviceCharge: restaurant.service_charge ?? restaurant.getDataValue?.('service_charge') ?? 0,
    total_menu_items: totalMenuItems,
    total_categories: totalCategories,
    total_tables: totalTables,
  };

  res.json(ApiResponse.success(responseData, 'Restaurant retrieved'));
});

// src/controllers/restaurantController.js - Updated createRestaurant function

const createRestaurant = catchAsync(async (req, res) => {
  const userId = req.user.id; // Platform admin creating the restaurant
  const {
    name, 
    description, 
    address, 
    city, 
    state, 
    country, 
    postal_code,
    phone, 
    email, 
    website, 
    cuisine_type, 
    operating_hours,
    whatsapp,
    owner_email, // Email of the restaurant owner
    owner_name,  // Name of the restaurant owner
    owner_phone, // Phone of the restaurant owner
  } = req.body;

  // Check if restaurant with same name exists
  const existingRestaurant = await Restaurant.findOne({ 
    where: { name, deleted_at: null },
  });
  
  if (existingRestaurant) {
    throw new ApiError(400, 'Restaurant with this name already exists');
  }

  // Create or find the restaurant owner
  let ownerId = null;
  
  if (owner_email) {
    // Check if user already exists
    let owner = await User.findOne({ where: { email: owner_email } });
    
    if (!owner) {
      // Create a new user as restaurant_admin
      const tempPassword = generateRandomPassword(); // Generate random password
      // eslint-disable-next-line no-undef
      const salt = await bcrypt.genSalt(10);
      // eslint-disable-next-line no-undef
      const password_hash = await bcrypt.hash(tempPassword, salt);
      
      owner = await User.create({
        email: owner_email,
        password_hash,
        full_name: owner_name || 'Restaurant Owner',
        phone: owner_phone || null,
        role: 'restaurant_admin',
        is_active: true,
        is_verified: true,
        email_verified: false, // Will need to verify email
      });
      
      // Send welcome email with temporary password
      try {
        await sendWelcomeEmail(owner_email, owner_name, {
          temporaryPassword: tempPassword,
          loginUrl: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://menugo-saas-digital-menu-mipr.onrender.com/'}/login`,
        });
        logger.info(`Welcome email sent to restaurant owner ${owner_email}`);
      } catch (emailError) {
        logger.error(`Failed to send welcome email to restaurant owner ${owner_email}:`, emailError && emailError.message ? emailError.message : emailError);
      }
    }
    
    ownerId = owner.id;
  } else {
    // Use the platform admin as owner (for testing)
    ownerId = userId;
  }

  // Generate unique QR code identifier
  const qrIdentifier = `${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
  const qrUrl = `${process.env.CLIENT_URL || 'https://menugo-saas-digital-menu-mipr.onrender.com/'}/menu/${qrIdentifier}`;
  
  let qrCloudinaryUrl = null;
  try {
    const qrImagePath = await generateQRCode(qrUrl, qrIdentifier);
    if (qrImagePath) {
      const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes');
      qrCloudinaryUrl = uploadResult.url;
    }
  } catch (qrError) { /* empty */ }

  // Create restaurant
  const restaurant = await Restaurant.create({
    owner_id: ownerId,
    name,
    description: description || null,
    address: address || null,
    city: city || null,
    state: state || null,
    country: country || 'USA',
    postal_code: postal_code || null,
    phone: phone || null,
    whatsapp_number: whatsapp || null,
    email: email || null,
    website: website || null,
    cuisine_type: cuisine_type || null,
    operating_hours: operating_hours || {},
    qr_code_identifier: qrIdentifier,
    qr_code_url: qrCloudinaryUrl,
    subscription_status: 'trial',
    subscription_tier: 'monthly',
    subscription_start_date: new Date(),
    subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    is_active: true,
    is_verified: false, // Needs admin verification
  });

  // Create admin staff record for the owner
  await RestaurantStaff.create({
    restaurant_id: restaurant.id,
    user_id: ownerId,
    role: 'admin',
    permissions: {
      can_view_orders: true,
      can_update_order_status: true,
      can_verify_orders: true,
      can_view_tables: true,
      can_manage_staff: true,
      can_manage_menu: true,
      can_view_reports: true,
    },
    is_active: true,
  });

  // Create default menu categories
  const defaultCategories = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'];
  for (let i = 0; i < defaultCategories.length; i++) {
    await MenuCategory.create({
      restaurant_id: restaurant.id,
      name: defaultCategories[i],
      display_order: i + 1,
      is_active: true,
    });
  }

  // Create default tables
  const defaultTables = ['1', '2', '3', '4', '5'];
  for (const tableNum of defaultTables) {
    await Table.create({
      restaurant_id: restaurant.id,
      table_number: tableNum,
      table_name: `Table ${tableNum}`,
      capacity: 4,
      status: 'available',
    });
  }

  // If files were uploaded (business license, logo, banner/coverImage), store them accordingly
  try {
    const files = req.files || {};
    const licenseFile = (files.document && files.document[0]) || (files.businessLicenseDocument && files.businessLicenseDocument[0]) || null;
    if (licenseFile) {
      const uploadResult = await uploadToCloudinary(licenseFile.path, 'menugo/documents');
      if (uploadResult && uploadResult.url) {
        const settings = restaurant.settings || {};
        settings.business_license = {
          url: uploadResult.url,
          publicId: uploadResult.publicId || null,
          uploadedAt: new Date(),
          originalName: licenseFile.originalname,
        };
        await restaurant.update({ settings });
      }
    }

    const logoFile = (files.logo && files.logo[0]) || null;
    const bannerFile = (files.banner && files.banner[0]) || (files.coverImage && files.coverImage[0]) || null;
    const updateFields = {};
    if (logoFile) {
      const r = await uploadToCloudinary(logoFile.path, 'menugo/restaurants');
      if (r && r.url) {
        updateFields.logo_url = r.url;
      }
    }
    if (bannerFile) {
      const r2 = await uploadToCloudinary(bannerFile.path, 'menugo/restaurants');
      if (r2 && r2.url) {
        updateFields.cover_image_url = r2.url;
      }
    }
    if (Object.keys(updateFields).length) {
      await restaurant.update(updateFields);
    }
  } catch (docErr) {
    console.error('Failed to upload business license during restaurant creation:', docErr && docErr.message ? docErr.message : docErr);
    // non-fatal
  }

  res.status(201).json(ApiResponse.success({
    restaurant,
    owner: {
      id: ownerId,
      email: owner_email,
      full_name: owner_name,
    },
    message: owner_email ? 'Restaurant created. Owner invited via email.' : 'Restaurant created successfully',
  }, 'Restaurant created successfully'));
});

// Helper function to generate random password
function generateRandomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Update restaurant
const updateRestaurant = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Check ownership
  if (restaurant.owner_id !== req.user.id && req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'You do not have permission to update this restaurant');
  }

  const normalizedSubCity = updates.sub_city || updates.subCity || updates.restaurant_sub_city || updates.restaurantSubCity || null;
  const normalizedBusinessLicenseNumber = updates.business_license_number || updates.businessLicenseNumber || updates.businessLicenseNumber || null;
  const normalizedTinNumber = updates.tin_number || updates.tinNumber || null;
  const normalizedSlogan = updates.restaurant_slogan || updates.slogan || updates.description || null;

  if (normalizedSubCity) {
    updates.sub_city = normalizedSubCity;
  }
  if (normalizedBusinessLicenseNumber) {
    updates.business_license_number = normalizedBusinessLicenseNumber;
  }
  if (normalizedTinNumber) {
    updates.tin_number = normalizedTinNumber;
  }
  if (normalizedSlogan) {
    updates.slogan = normalizedSlogan;
  }

  if (normalizedBusinessLicenseNumber || normalizedTinNumber || updates.settings?.business_license?.number || updates.settings?.business_license?.tin_number || updates.settings?.business_license?.tinNumber) {
    const existingSettings = normalizeSettingsValue(restaurant.settings);
    const businessLicenseSettings = normalizeSettingsValue(existingSettings.business_license);

    if (normalizedBusinessLicenseNumber) {
      businessLicenseSettings.number = normalizedBusinessLicenseNumber;
    }
    if (normalizedTinNumber) {
      businessLicenseSettings.tin_number = normalizedTinNumber;
      businessLicenseSettings.tinNumber = normalizedTinNumber;
    }

    if (updates.settings?.business_license && typeof updates.settings.business_license === 'object' && !Array.isArray(updates.settings.business_license)) {
      Object.assign(businessLicenseSettings, updates.settings.business_license);
    }

    existingSettings.business_license = businessLicenseSettings;
    updates.settings = existingSettings;
  }

  // Handle uploaded files (support req.files from upload.fields)
  try {
    const files = req.files || {};
    const logoFile = (files.logo && files.logo[0]) || null;
    const coverFile = (files.coverImage && files.coverImage[0]) || (files.banner && files.banner[0]) || null;
    const docFile = (files.document && files.document[0]) || (files.businessLicenseDocument && files.businessLicenseDocument[0]) || null;

    if (logoFile) {
      const uploadResult = await uploadToCloudinary(logoFile.path, 'menugo/restaurants');
      if (uploadResult && uploadResult.url) {
        updates.logo_url = uploadResult.url;
      }
    }

    if (coverFile) {
      const uploadResult = await uploadToCloudinary(coverFile.path, 'menugo/restaurants');
      if (uploadResult && uploadResult.url) {
        updates.cover_image_url = uploadResult.url;
      }
    }

    if (docFile) {
      try {
        const uploadResult = await uploadToCloudinary(docFile.path, 'menugo/documents');
        if (uploadResult && uploadResult.url) {
          const settings = normalizeSettingsValue(restaurant.settings);
          settings.business_license = {
            ...normalizeSettingsValue(settings.business_license),
            url: uploadResult.url,
            publicId: uploadResult.publicId || null,
            uploadedAt: new Date(),
            originalName: docFile.originalname,
          };
          updates.settings = settings;
          updates.business_license_url = uploadResult.url;
        }
      } catch (docErr) {
        console.error('Failed to upload business license during restaurant update:', docErr && docErr.message ? docErr.message : docErr);
      }
    }
  } catch (e) {
    // ignore file handling errors (non-fatal)
  }

  const updatedRestaurant = await restaurant.update(updates);

  res.json(ApiResponse.success(updatedRestaurant, 'Restaurant updated'));
});

// Delete restaurant
// - For restaurant owners: perform a soft delete (mark deleted_at)
// - For platform admins: attempt a permanent (hard) delete of restaurant and common dependent records
const deleteRestaurant = catchAsync(async (req, res) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.owner_id !== req.user.id && req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'You do not have permission to delete this restaurant');
  }

  // Perform dependent cleanup operations in isolated transactions so schema drift
  // or missing columns on one cleanup step does not abort the whole restaurant deletion.
  const t = await sequelize.transaction();
  try {
    if (req.user.role === 'platform_admin') {
      // Load models not destructured at file top
      const models = require('../models');
      const {
        Order,
        OrderItem,
        OrderItemOption,
        OrderItemModifier,
        OrderStatusHistory,
        OrderVerificationAttempt,
        OrderRejectionReason,
        Notification,
        WaiterNotification,
        WaiterFeedback,
        WaiterCallRequest,
        WaiterTip,
        WaiterCommission,
        TableAssignment,
        TableReservation,
        TableStatusHistory,
        QRCodeScan,
        Subscription,
        Invoice,
        SupportTicket,
        TicketMessage,
        Waiter,
        WaiterShift,
        WaiterPerformance,
        WaiterRealtimeStatus,
        WaiterActivityLog,
        StaffActivityLog,
        PushNotificationToken,
      } = models;

      // First collect coupon ids for this restaurant so we can delete usages by coupon_id
      let couponIds = [];
      try {
        if (Coupon) {
          const coupons = await Coupon.findAll({ where: { restaurant_id: id }, attributes: ['id'] });
          couponIds = coupons.map(c => c.id);
        }
      } catch (e) {
        console.warn('Ignoring coupon lookup error during restaurant hard-delete cleanup:', e.message || e);
        couponIds = [];
      }

      // Collect orders and order-items for the restaurant so we can remove order children safely
      let orderIds = [];
      try {
        const orders = Order ? await Order.findAll({ where: { restaurant_id: id }, attributes: ['id'] }) : [];
        orderIds = orders.map(o => o.id);
      } catch (e) {
        console.warn('Ignoring order lookup error during restaurant hard-delete cleanup:', e.message || e);
        orderIds = [];
      }

      let orderItemIds = [];
      try {
        const orderItems = (OrderItem && orderIds.length) ? await OrderItem.findAll({ where: { order_id: { [Op.in]: orderIds } }, attributes: ['id'] }) : [];
        orderItemIds = orderItems.map(oi => oi.id);
      } catch (e) {
        console.warn('Ignoring orderItem lookup error during restaurant hard-delete cleanup:', e.message || e);
        orderItemIds = [];
      }

      // Collect waiters for this restaurant so we can clean up waiter-scoped records properly
      let waiterIds = [];
      let waiterUserIds = [];
      try {
        const waiters = Waiter ? await Waiter.findAll({ where: { restaurant_id: id }, attributes: ['id', 'user_id'] }) : [];
        waiterIds = waiters.map(w => w.id);
        waiterUserIds = waiters.map(w => w.user_id).filter(Boolean);
      } catch (e) {
        console.warn('Ignoring waiter lookup error during restaurant hard-delete cleanup:', e.message || e);
        waiterIds = [];
        waiterUserIds = [];
      }

      // Collect restaurant staff users and ids to clean up staff-scoped records and push tokens
      let staffIds = [];
      let staffUserIds = [];
      try {
        const staffMembers = RestaurantStaff ? await RestaurantStaff.findAll({ where: { restaurant_id: id }, attributes: ['id', 'user_id'] }) : [];
        staffIds = staffMembers.map(s => s.id);
        staffUserIds = staffMembers.map(s => s.user_id).filter(Boolean);
      } catch (e) {
        console.warn('Ignoring restaurant staff lookup error during restaurant hard-delete cleanup:', e.message || e);
        staffIds = [];
        staffUserIds = [];
      }

      const pushTokenUserIds = [...new Set([...(restaurant.owner_id ? [restaurant.owner_id] : []), ...waiterUserIds, ...staffUserIds])];

      // Collect support tickets so we can delete messages
      let ticketIds = [];
      try {
        const tickets = SupportTicket ? await SupportTicket.findAll({ where: { restaurant_id: id }, attributes: ['id'] }) : [];
        ticketIds = tickets.map(tt => tt.id);
      } catch (e) {
        console.warn('Ignoring support ticket lookup error during restaurant hard-delete cleanup:', e.message || e);
        ticketIds = [];
      }

      // Collect menu-related IDs to safely delete menu children without unbounded deletes
      let menuItemIds = [];
      let menuModifierIds = [];
      try {
        const menuItems = MenuItem ? await MenuItem.findAll({ where: { restaurant_id: id }, attributes: ['id'] }) : [];
        menuItemIds = menuItems.map(m => m.id);
      } catch (e) {
        console.warn('Ignoring menu item lookup error during restaurant hard-delete cleanup:', e.message || e);
        menuItemIds = [];
      }

      try {
        const modifiers = MenuItemModifier ? await MenuItemModifier.findAll({ where: { restaurant_id: id }, attributes: ['id'] }) : [];
        menuModifierIds = modifiers.map(m => m.id);
      } catch (e) {
        console.warn('Ignoring menu item modifier lookup error during restaurant hard-delete cleanup:', e.message || e);
        menuModifierIds = [];
      }

      const menuItemModifierAssignmentWhere = [];
      if (menuItemIds.length) {
        menuItemModifierAssignmentWhere.push({ menu_item_id: { [Op.in]: menuItemIds } });
      }
      if (menuModifierIds.length) {
        menuItemModifierAssignmentWhere.push({ modifier_id: { [Op.in]: menuModifierIds } });
      }

      const isMissingTableOrColumnError = (err) => {
        const msg = (err && (err.original && err.original.message)) || err.message || '';
        return /doesn't exist|does not exist|Unknown table|ER_NO_SUCH_TABLE|Unknown column|no such column|ER_BAD_FIELD_ERROR/i.test(msg);
      };

      const tableColumnCache = {};

      const getTableColumns = async (tableName) => {
        if (!tableName) {
          return null;
        }

        if (tableColumnCache[tableName]) {
          return tableColumnCache[tableName];
        }

        try {
          if (sequelize.getQueryInterface && typeof sequelize.getQueryInterface().describeTable === 'function') {
            const description = await sequelize.getQueryInterface().describeTable(tableName);
            const columns = Object.keys(description || {});
            tableColumnCache[tableName] = columns;
            return columns;
          }

          if (SequelizePkg.QueryTypes && typeof sequelize.query === 'function') {
            const [results] = await sequelize.query(
              `SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = :tableName`,
              {
                replacements: { tableName },
                type: SequelizePkg.QueryTypes.SELECT,
              }
            );
            const columns = Array.isArray(results) ? results.map((row) => row.column_name) : [];
            tableColumnCache[tableName] = columns;
            return columns;
          }

          tableColumnCache[tableName] = null;
          return null;
        } catch (e) {
          if (isMissingTableOrColumnError(e) || /relation .* does not exist/i.test((e.message || ''))) {
            tableColumnCache[tableName] = null;
            return null;
          }
          throw e;
        }
      };

      const tableHasColumns = async (tableName, requiredColumns = []) => {
        if (!tableName || !requiredColumns.length) {
          return true;
        }

        const columns = await getTableColumns(tableName);
        if (!Array.isArray(columns)) {
          return false;
        }

        return requiredColumns.every((column) => columns.includes(column));
      };

      const getModelTableName = (model) => {
        if (!model) {
          return null;
        }
        if (typeof model.getTableName === 'function') {
          const tableName = model.getTableName();
          return typeof tableName === 'string' ? tableName : tableName.tableName || null;
        }
        return model.tableName || null;
      };

      const executeDestroyOp = async (opInfo) => {
        if (!opInfo || typeof opInfo.fn !== 'function') {
          return null;
        }

        if (opInfo.model && opInfo.requiredColumns && opInfo.requiredColumns.length) {
          const tableName = getModelTableName(opInfo.model);
          if (!(await tableHasColumns(tableName, opInfo.requiredColumns))) {
            console.warn(`Skipping ${opInfo.name} destroy op because required columns are missing from table ${tableName}:`, opInfo.requiredColumns.join(', '));
            return null;
          }
        }

        try {
          return await opInfo.fn(t);
        } catch (e) {
          if (isMissingTableOrColumnError(e)) {
            console.warn(`Skipping ${opInfo.name} destroy op due to missing table/column:`, (e.original && e.original.message) || e.message || e);
            return null;
          }
          throw e;
        }
      };

      // Build destroy operations covering more dependent tables (order children, tickets, waiter-related, subscriptions, notifications, etc.)
      const destroyOps = [
        // Order-related children (options/modifiers) - use collected orderItemIds/orderIds
        {
          name: 'OrderItemOption',
          model: OrderItemOption,
          requiredColumns: ['order_item_id'],
          fn: (transaction) => (OrderItemOption && orderItemIds.length) ? OrderItemOption.destroy({ where: { order_item_id: { [Op.in]: orderItemIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'OrderItemModifier',
          model: OrderItemModifier,
          requiredColumns: ['order_item_id'],
          fn: (transaction) => (OrderItemModifier && orderItemIds.length) ? OrderItemModifier.destroy({ where: { order_item_id: { [Op.in]: orderItemIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'OrderItem',
          model: OrderItem,
          requiredColumns: ['order_id'],
          fn: (transaction) => (OrderItem && orderIds.length) ? OrderItem.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'OrderStatusHistory',
          model: OrderStatusHistory,
          requiredColumns: ['order_id'],
          fn: (transaction) => (OrderStatusHistory && orderIds.length) ? OrderStatusHistory.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'OrderVerificationAttempt',
          model: OrderVerificationAttempt,
          requiredColumns: ['order_id'],
          fn: (transaction) => (OrderVerificationAttempt && orderIds.length) ? OrderVerificationAttempt.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'OrderRejectionReason',
          model: OrderRejectionReason,
          requiredColumns: ['order_id'],
          fn: (transaction) => (OrderRejectionReason && orderIds.length && OrderRejectionReason.rawAttributes && OrderRejectionReason.rawAttributes.order_id) ? OrderRejectionReason.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        // Coupon usages connected to orders
        {
          name: 'CouponUsageByOrder',
          model: CouponUsage,
          requiredColumns: ['order_id'],
          fn: (transaction) => (CouponUsage && orderIds.length) ? CouponUsage.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        // Notifications and waiter notifications tied to orders
        {
          name: 'Notification',
          model: Notification,
          requiredColumns: ['order_id'],
          fn: (transaction) => (Notification && orderIds.length) ? Notification.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'WaiterNotification',
          model: WaiterNotification,
          requiredColumns: ['order_id'],
          fn: (transaction) => (WaiterNotification && orderIds.length) ? WaiterNotification.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        // Waiter related order feedback/tips/commissions
        {
          name: 'WaiterFeedback',
          model: WaiterFeedback,
          requiredColumns: ['order_id'],
          fn: (transaction) => (WaiterFeedback && orderIds.length) ? WaiterFeedback.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'WaiterTip',
          model: WaiterTip,
          requiredColumns: ['order_id'],
          fn: (transaction) => (WaiterTip && orderIds.length) ? WaiterTip.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'WaiterCommission',
          model: WaiterCommission,
          requiredColumns: ['order_id'],
          fn: (transaction) => (WaiterCommission && orderIds.length) ? WaiterCommission.destroy({ where: { order_id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },

        // Order records themselves
        {
          name: 'Order',
          model: Order,
          requiredColumns: ['id'],
          fn: (transaction) => (Order && orderIds.length) ? Order.destroy({ where: { id: { [Op.in]: orderIds } }, force: true, transaction }) : Promise.resolve(),
        },

        // Table-related history/assignments/reservations
        {
          name: 'TableAssignment',
          model: TableAssignment,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (TableAssignment) ? TableAssignment.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'TableReservation',
          model: TableReservation,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (TableReservation) ? TableReservation.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'TableStatusHistory',
          model: TableStatusHistory,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (TableStatusHistory) ? TableStatusHistory.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // QR code scans and QR codes
        {
          name: 'QRCodeScan',
          model: QRCodeScan,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (QRCodeScan) ? QRCodeScan.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'QRCode',
          model: QRCode,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (QRCode) ? QRCode.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Coupon and coupon usages by coupon id
        {
          name: 'CouponUsageByCoupon',
          model: CouponUsage,
          requiredColumns: ['coupon_id'],
          fn: (transaction) => (CouponUsage && couponIds.length > 0) ? CouponUsage.destroy({ where: { coupon_id: { [Op.in]: couponIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'Coupon',
          model: Coupon,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (Coupon) ? Coupon.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Inventory
        {
          name: 'InventoryTransaction',
          model: InventoryTransaction,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (InventoryTransaction) ? InventoryTransaction.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'InventoryItem',
          model: InventoryItem,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (InventoryItem) ? InventoryItem.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Analytics and reviews
        {
          name: 'DailySalesSummary',
          model: DailySalesSummary,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (DailySalesSummary) ? DailySalesSummary.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'MenuItemAnalytics',
          model: MenuItemAnalytics,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (MenuItemAnalytics) ? MenuItemAnalytics.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'HourlyAnalytics',
          model: HourlyAnalytics,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (HourlyAnalytics) ? HourlyAnalytics.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'Review',
          model: Review,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (Review) ? Review.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Menu structures and options/modifiers
        {
          name: 'MenuItemOption',
          model: MenuItemOption,
          requiredColumns: ['menu_item_id'],
          fn: (transaction) => (MenuItemOption && menuItemIds.length) ? MenuItemOption.destroy({ where: { menu_item_id: { [Op.in]: menuItemIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'MenuItemOptionGroup',
          model: MenuItemOptionGroup,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (MenuItemOptionGroup) ? MenuItemOptionGroup.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'MenuItemModifierAssignment',
          model: MenuItemModifierAssignment,
          requiredColumns: ['menu_item_id', 'modifier_id'],
          fn: (transaction) => (MenuItemModifierAssignment && menuItemModifierAssignmentWhere.length) ? MenuItemModifierAssignment.destroy({ where: { [Op.or]: menuItemModifierAssignmentWhere }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'MenuItemModifier',
          model: MenuItemModifier,
          requiredColumns: ['id'],
          fn: (transaction) => (MenuItemModifier && menuModifierIds.length) ? MenuItemModifier.destroy({ where: { id: { [Op.in]: menuModifierIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'MenuItem',
          model: MenuItem,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (MenuItem) ? MenuItem.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'MenuCategory',
          model: MenuCategory,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (MenuCategory) ? MenuCategory.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Restaurant staff and waiter related records
        {
          name: 'RestaurantStaff',
          model: RestaurantStaff,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (RestaurantStaff) ? RestaurantStaff.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'WaiterActivityLog',
          model: WaiterActivityLog,
          requiredColumns: ['waiter_id'],
          fn: (transaction) => (WaiterActivityLog && waiterIds.length) ? WaiterActivityLog.destroy({ where: { waiter_id: { [Op.in]: waiterIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'StaffActivityLog',
          model: StaffActivityLog,
          requiredColumns: ['staff_id'],
          fn: (transaction) => (StaffActivityLog && staffIds.length) ? StaffActivityLog.destroy({ where: { staff_id: { [Op.in]: staffIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'WaiterShift',
          model: WaiterShift,
          requiredColumns: ['waiter_id'],
          fn: (transaction) => (WaiterShift && waiterIds.length) ? WaiterShift.destroy({ where: { waiter_id: { [Op.in]: waiterIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'WaiterPerformance',
          model: WaiterPerformance,
          requiredColumns: ['waiter_id'],
          fn: (transaction) => (WaiterPerformance && waiterIds.length) ? WaiterPerformance.destroy({ where: { waiter_id: { [Op.in]: waiterIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'WaiterRealtimeStatus',
          model: WaiterRealtimeStatus,
          requiredColumns: ['waiter_id'],
          fn: (transaction) => (WaiterRealtimeStatus && waiterIds.length) ? WaiterRealtimeStatus.destroy({ where: { waiter_id: { [Op.in]: waiterIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'Waiter',
          model: Waiter,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (Waiter) ? Waiter.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Support tickets and messages
        {
          name: 'TicketMessage',
          model: TicketMessage,
          requiredColumns: ['ticket_id'],
          fn: (transaction) => (TicketMessage && ticketIds.length) ? TicketMessage.destroy({ where: { ticket_id: { [Op.in]: ticketIds } }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'SupportTicket',
          model: SupportTicket,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (SupportTicket) ? SupportTicket.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Subscriptions / invoices
        {
          name: 'Invoice',
          model: Invoice,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (Invoice) ? Invoice.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
        {
          name: 'Subscription',
          model: Subscription,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (Subscription) ? Subscription.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Push tokens are scoped to users; delete tokens for staff/waiter/user IDs if available
        {
          name: 'PushNotificationToken',
          model: PushNotificationToken,
          requiredColumns: ['user_id'],
          fn: (transaction) => (PushNotificationToken && pushTokenUserIds.length) ? PushNotificationToken.destroy({ where: { user_id: { [Op.in]: pushTokenUserIds } }, force: true, transaction }) : Promise.resolve(),
        },

        // Table records themselves
        {
          name: 'Table',
          model: Table,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (Table) ? Table.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },

        // Restaurant settings
        {
          name: 'RestaurantSetting',
          model: RestaurantSetting,
          requiredColumns: ['restaurant_id'],
          fn: (transaction) => (RestaurantSetting) ? RestaurantSetting.destroy({ where: { restaurant_id: id }, force: true, transaction }) : Promise.resolve(),
        },
      ];

      // Run destroy operations sequentially one-by-one so a missing-column/table error does not abort the outer transaction.
      for (const op of destroyOps) {
        await executeDestroyOp(op);
      }

      // Finally hard-delete the restaurant record
      await restaurant.destroy({ force: true, transaction: t });
    } else {
      // Soft delete for restaurant owners
      await restaurant.update({ deleted_at: new Date(), is_active: false }, { transaction: t });
    }

    await t.commit();
  } catch (err) {
    await t.rollback();

    // If this was a platform_admin hard-delete attempt and it failed due to
    // foreign key constraints (dependent records), fall back to a soft-delete
    // so the user can still remove the restaurant from the UI without losing
    // the ability to inspect/clean dependent data.
    const fkConstraintError =
      err && (err.name === 'SequelizeForeignKeyConstraintError' || (err.original && /foreign key/i.test(err.original.message || '')) || /foreign key constraint/i.test(err.message || ''));

    if (req.user.role === 'platform_admin' && fkConstraintError) {
      try {
        await restaurant.update({ deleted_at: new Date(), is_active: false });
        return res.json(ApiResponse.success(null, 'Restaurant soft-deleted because dependent records prevent permanent deletion. Remove related records to permanently delete.'));
      } catch (softErr) {
        // If the soft-delete also fails, rethrow the original to surface the real issue.
        throw err;
      }
    }

    // Re-throw other errors so catchAsync middleware can handle them (500 response)
    throw err;
  }

  res.json(ApiResponse.success(null, 'Restaurant deleted'));
});

// Update restaurant status (activate/deactivate)
const updateRestaurantStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  await restaurant.update({ is_active });

  // If restaurant is being deactivated, deactivate its owner and active staff users (best-effort)
  if (is_active === false) {
    try {
      // Deactivate owner
      if (restaurant.owner_id) {
        const owner = await User.findByPk(restaurant.owner_id);
        if (owner && owner.is_active) {
          await owner.update({ is_active: false });
        }
      }

      // Deactivate staff users associated with this restaurant
      const staff = await RestaurantStaff.findAll({ where: { restaurant_id: id }, attributes: ['user_id'] });
      const userIds = staff.map(s => s.user_id).filter(Boolean);
      if (userIds.length) {
        await User.update({ is_active: false }, { where: { id: { [Op.in]: userIds } } });
      }
    } catch (e) {
      console.warn('Failed to cascade deactivate users for restaurant:', e && e.message ? e.message : e);
    }
  }

  // If restaurant is being activated, attempt to reactivate its owner and staff (best-effort).
  // This is a convenience to restore access after a restaurant is re-enabled.
  if (is_active === true) {
    try {
      if (restaurant.owner_id) {
        const owner = await User.findByPk(restaurant.owner_id);
        if (owner && !owner.is_active) {
          await owner.update({ is_active: true });
        }
      }

      const staff = await RestaurantStaff.findAll({ where: { restaurant_id: id }, attributes: ['user_id'] });
      const userIds = staff.map(s => s.user_id).filter(Boolean);
      if (userIds.length) {
        await User.update({ is_active: true }, { where: { id: { [Op.in]: userIds } } });
      }
    } catch (e) {
      console.warn('Failed to cascade activate users for restaurant:', e && e.message ? e.message : e);
    }

    // Apply any pending billing upgrade if one exists and restaurant is being activated.
    try {
      const pendingUpgradeTicket = await SupportTicket.findOne({
        where: {
          restaurant_id: id,
          category: 'billing',
          status: 'open',
        },
        order: [['created_at', 'ASC']],
      });

      if (pendingUpgradeTicket) {
        await applyUpgradeRequestToRestaurant(pendingUpgradeTicket, Restaurant);
      }
    } catch (upgradeError) {
      console.warn('Failed to apply pending upgrade request during restaurant activation:', upgradeError?.message || upgradeError);
    }
  }

  res.json(ApiResponse.success({ is_active: restaurant.is_active }, 'Restaurant status updated'));
});

// Get restaurant dashboard stats
const getDashboardStats = catchAsync(async (req, res) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Get orders count
  const { Order } = require('../models');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.count({
    where: {
      restaurant_id: id,
      created_at: { [Op.gte]: today },
    },
  });

  const totalOrders = await Order.count({
    where: { restaurant_id: id },
  });

  const totalRevenue = await Order.sum('total_amount', {
    where: { restaurant_id: id, status: 'completed' },
  });

  const stats = {
    today_orders: todayOrders,
    total_orders: totalOrders,
    total_revenue: totalRevenue || 0,
    total_menu_items: await MenuItem.count({ where: { restaurant_id: id, deleted_at: null } }),
    total_categories: await MenuCategory.count({ where: { restaurant_id: id, is_active: true } }),
    total_tables: await Table.count({ where: { restaurant_id: id } }),
    total_staff: await RestaurantStaff.count({ where: { restaurant_id: id, is_active: true } }),
    // Completed orders: today and overall
    completed_today: await Order.count({ where: { restaurant_id: id, status: 'completed', created_at: { [Op.gte]: today } } }),
    completed_total: await Order.count({ where: { restaurant_id: id, status: 'completed' } }),
  };

  res.json(ApiResponse.success(stats, 'Dashboard stats retrieved'));
});

// Get pending verifications for platform admin
const getPendingVerifications = catchAsync(async (req, res) => {
  const pending = await Restaurant.findAll({
    where: { is_verified: false, is_active: true, deleted_at: null },
    attributes: [
      'id',
      'owner_id',
      'name',
      'description',
      'address',
      'city',
      'state',
      'country',
      'postal_code',
      'phone',
      'email',
      'is_active',
      'is_verified',
      'created_at',
      'updated_at',
      'verification_date',
      'rejection_reason',
    ],
    include: [
      { model: User, as: 'restaurant_owner', attributes: ['id', 'full_name', 'email', 'phone'] },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success(pending, 'Pending verifications retrieved'));
});

// Verify restaurant (platform admin)
const verifyRestaurant = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.query, ...req.body };
  const { is_verified, rejection_reason } = normalizeVerificationPayload(payload);

  if (typeof is_verified === 'undefined') {
    throw new ApiError(400, 'is_verified is required and must be a boolean or an approval status');
  }

  const restaurantId = String(id || payload.restaurantId || payload.restaurant_id || payload.id || '').trim();
  const restaurant = restaurantId
    ? await Restaurant.findOne({ where: { id: restaurantId } })
    : null;

  if (!restaurant) {
    logger.warn('Restaurant verification failed because restaurant lookup returned no result', {
      attemptedId: restaurantId,
      requestParams: req.params,
      requestBody: payload,
      userId: req.user?.id,
    });
    throw new ApiError(404, 'Restaurant not found');
  }

  await restaurant.update({
    is_verified,
    verification_date: is_verified ? new Date() : null,
    verified_by: req.user.id,
    rejection_reason: rejection_reason || null,
  });

  // If approved, activate the restaurant owner user account so they can log in
  if (is_verified) {
    try {
      if (restaurant.owner_id) {
        const owner = await User.findByPk(restaurant.owner_id);
        if (owner) {
          await owner.update({ is_active: true, is_verified: true });
        }

        const ownerEmail = owner?.email || restaurant.email || null;
        const ownerName = owner?.full_name || restaurant.name || 'Restaurant Owner';
        if (ownerEmail) {
          await sendRestaurantActivatedEmail(ownerEmail, ownerName, restaurant.name || 'your restaurant');
          logger.info(`Activation email sent to ${ownerEmail} for restaurant ${restaurant.id}`);
        }
      }
    } catch (ownerErr) {
      console.error('Failed to activate restaurant owner user after verification', ownerErr);
    }
  }

  res.json(ApiResponse.success(restaurant, `Restaurant ${is_verified ? 'verified' : 'rejected'}`));
});

// Update restaurant settings
const updateSettings = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { settings } = req.body;

  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const updatedSettings = { ...restaurant.settings, ...settings };

  const topLevelUpdates = {};
  if (typeof settings?.taxRate !== 'undefined') {
    topLevelUpdates.tax_rate = settings.taxRate === '' || settings.taxRate === null ? null : Number(settings.taxRate);
  }
  if (typeof settings?.serviceCharge !== 'undefined') {
    topLevelUpdates.service_charge = settings.serviceCharge === '' || settings.serviceCharge === null ? null : Number(settings.serviceCharge);
  }
  if (typeof settings?.taxInclusive !== 'undefined') {
    topLevelUpdates.tax_inclusive = Boolean(settings.taxInclusive);
  }
  if (typeof settings?.serviceChargeType !== 'undefined') {
    topLevelUpdates.service_charge_type = String(settings.serviceChargeType);
  }
  if (typeof settings?.applyTaxToDelivery !== 'undefined') {
    topLevelUpdates.apply_tax_to_delivery = Boolean(settings.applyTaxToDelivery);
  }

  await restaurant.update({
    settings: updatedSettings,
    ...topLevelUpdates,
  });

  res.json(ApiResponse.success(restaurant.settings, 'Settings updated'));
});

// Update a named settings section for the authenticated user's restaurant or provided restaurant id
const updateSettingsSection = catchAsync(async (req, res) => {
  const { section } = req.params;
  const payload = req.body || {};

  // Determine restaurant id from payload or auth (owner or staff)
  let restaurantId = payload.restaurantId || payload.restaurant_id || req.user?.restaurant_id || (req.user && req.user.restaurant && req.user.restaurant.id);

  if (!restaurantId) {
    // Try to find a restaurant owned by this user
    const owned = await Restaurant.findOne({ where: { owner_id: req.user.id } });
    if (owned) {
      restaurantId = owned.id;
    }
  }

  if (!restaurantId) {
    // Try to find a staff assignment
    const staffRec = await RestaurantStaff.findOne({ where: { user_id: req.user.id, is_active: true } });
    if (staffRec) {
      restaurantId = staffRec.restaurant_id;
    }
  }

  if (!restaurantId) {
    throw new ApiError(400, 'Restaurant ID is required');
  }

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Authorization: allow platform_admin or restaurant owner/staff
  if (req.user.role !== 'platform_admin') {
    if (restaurant.owner_id !== req.user.id) {
      // check staff membership
      const staff = await RestaurantStaff.findOne({ where: { restaurant_id: restaurantId, user_id: req.user.id, is_active: true } });
      if (!staff) {
        throw new ApiError(403, 'You do not have permission to update this restaurant settings');
      }
    }
  }

  // Merge payload into the named section of restaurant.settings
  const existing = restaurant.settings || {};
  const sectionValue = existing[section] && typeof existing[section] === 'object' ? { ...existing[section] } : {};

  // If payload contains a wrapper `settings` object (some clients send { settings: {...} }), prefer that
  const incoming = payload.settings && typeof payload.settings === 'object' ? { ...payload.settings } : { ...payload };

  // Remove control fields that should not be stored in settings
  delete incoming.restaurantId;
  delete incoming.restaurant_id;
  delete incoming.userId;
  delete incoming.user_id;

  const merged = { ...sectionValue, ...incoming };
  existing[section] = merged;

  const topLevelUpdates = {};
  if (section === 'taxes' || section === 'tax') {
    if (typeof incoming.taxRate !== 'undefined') {
      topLevelUpdates.tax_rate = incoming.taxRate === '' || incoming.taxRate === null ? null : Number(incoming.taxRate);
    }
    if (typeof incoming.serviceCharge !== 'undefined') {
      topLevelUpdates.service_charge = incoming.serviceCharge === '' || incoming.serviceCharge === null ? null : Number(incoming.serviceCharge);
    }
    if (typeof incoming.taxInclusive !== 'undefined') {
      topLevelUpdates.tax_inclusive = Boolean(incoming.taxInclusive);
    }
    if (typeof incoming.serviceChargeType !== 'undefined') {
      topLevelUpdates.service_charge_type = String(incoming.serviceChargeType);
    }
    if (typeof incoming.applyTaxToDelivery !== 'undefined') {
      topLevelUpdates.apply_tax_to_delivery = Boolean(incoming.applyTaxToDelivery);
    }
  }

  await restaurant.update({ settings: existing, ...topLevelUpdates });

  res.json(ApiResponse.success(existing[section], 'Settings updated'));
});

// Get restaurant tables
const getTables = catchAsync(async (req, res) => {
  const { id } = req.params;

  const tables = await Table.findAll({
    where: { restaurant_id: id },
    order: [['table_number', 'ASC']],
  });

  // If request flagged as public, return a minimal sanitized shape and only available tables
  if (req.isPublicTables) {
    const publicTables = (tables || []).map(t => ({ id: t.id, table_number: t.table_number, tableNumber: t.table_number, status: t.status }));
    return res.json(ApiResponse.success(publicTables, 'Public tables retrieved'));
  }

  res.json(ApiResponse.success(tables, 'Tables retrieved'));
});

// Create table
const createTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { table_number, table_name, capacity, section } = req.body;

  const existingTable = await Table.findOne({
    where: { restaurant_id: id, table_number },
  });

  if (existingTable) {
    throw new ApiError(400, 'Table number already exists');
  }

  const restaurant = await Restaurant.findByPk(id);
  const table = await Table.create({
    restaurant_id: id,
    table_number,
    table_name,
    capacity: capacity || 4,
    section,
    status: 'available',
  });

  // Attach or generate a restaurant-level QR for the table (do not create per-table QR codes)
  try {
    // Ensure restaurant has a qr_code_identifier; create restaurant-level QR if missing
    let qrIdentifier = restaurant.qr_code_identifier;
    let qrCloudinaryUrl = null;
    let qrCodeRecord = null;

    if (!qrIdentifier) {
      qrIdentifier = `${restaurant.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const qrUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu/${qrIdentifier}`;
      const qrImagePath = await generateQRCode(qrUrl, qrIdentifier);
      const qrBase64 = await generateQRCodeBase64(qrUrl);
      if (qrImagePath) {
        const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes');
        qrCloudinaryUrl = uploadResult.url;
      }

      let newQr = null
      const existingQrRecord = await QRCode.findOne({ where: { restaurant_id: id, identifier: qrIdentifier } })
      if (existingQrRecord) {
        await existingQrRecord.update({ url: qrUrl, qr_image_url: qrCloudinaryUrl, is_active: true })
        newQr = existingQrRecord
      } else {
        newQr = await QRCode.create({ restaurant_id: id, identifier: qrIdentifier, url: qrUrl, qr_image_url: qrCloudinaryUrl, is_active: true })
      }

      qrCodeRecord = newQr;
      await restaurant.update({ qr_code_identifier: qrIdentifier, qr_code_url: qrCloudinaryUrl });
    } else {
      // Try to find an existing restaurant QR record
      const existing = await QRCode.findOne({ where: { restaurant_id: id, identifier: qrIdentifier } });
      if (existing) {
        qrCodeRecord = existing;
        qrCloudinaryUrl = existing.qr_image_url;
      } else {
        const qrUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu/${qrIdentifier}`;
        const qrImagePath = await generateQRCode(qrUrl, qrIdentifier);
        const qrBase64 = await generateQRCodeBase64(qrUrl);
        if (qrImagePath) {
          const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes');
          qrCloudinaryUrl = uploadResult.url;
        }

        let newQr = null
        const existingQrRecord = await QRCode.findOne({ where: { restaurant_id: id, identifier: qrIdentifier } })
        if (existingQrRecord) {
          await existingQrRecord.update({ url: qrUrl, qr_image_url: qrCloudinaryUrl, is_active: true })
          newQr = existingQrRecord
        } else {
          newQr = await QRCode.create({ restaurant_id: id, identifier: qrIdentifier, url: qrUrl, qr_image_url: qrCloudinaryUrl, is_active: true })
        }

        qrCodeRecord = newQr;
        await restaurant.update({ qr_code_url: qrCloudinaryUrl });
      }
    }

    if (qrCodeRecord) {
      await table.update({ qr_code_id: qrCodeRecord.id, qr_code_url: qrCloudinaryUrl });
    }
  } catch (qrError) {
    console.error('QR generation error:', qrError);
  }

  res.status(201).json(ApiResponse.success(table, 'Table created'));
});

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
  getDashboardStats,
  verifyRestaurant,
  getPendingVerifications,
  updateSettings,
  updateSettingsSection,
  getTables,
  createTable,
  
};
