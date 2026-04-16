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
  sequelize,
} = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { generateQRCode, generateQRCodeBase64 } = require('../utils/generateQR');
const { uploadToCloudinary } = require('../config/cloudinary');
const { Op } = require('sequelize');

// Get all restaurants (platform admin)
const getAllRestaurants = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, tier, country, search } = req.query;
  const offset = (page - 1) * limit;

  const where = { deleted_at: null };
  
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

  // Calculate additional stats
  const activeCount = await Restaurant.count({ 
    where: { is_active: true, is_verified: true, deleted_at: null } ,
  });
  const pendingCount = await Restaurant.count({ 
    where: { is_verified: false, is_active: true, deleted_at: null },
  });
  const premiumCount = await Restaurant.count({ 
    where: { subscription_tier: 'premium', deleted_at: null },
  });

  res.json(ApiResponse.success({
    restaurants: rows,
    total: count,
    active: activeCount,
    pending: pendingCount,
    premium: premiumCount,
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
      limit: 20,
    },
    { 
      model: MenuCategory, 
      as: 'menu_categories', 
      where: { is_active: true },
      required: false,
      limit: 50,
    },
    { 
      model: MenuItem, 
      as: 'restaurant_menu_items', 
      where: { deleted_at: null },
      required: false,
      limit: 100,
    },
    { 
      model: Table, 
      as: 'restaurant_tables', 
      required: false,
      limit: 50,
    },
  ];

  let restaurant = null;
  if (uuidRegex.test(paramId)) {
    // Primary key lookup
    restaurant = await Restaurant.findByPk(paramId, { include: includes });
  } else {
    // Fallback: allow lookup by qr_code_identifier (slug) for customer-facing identifiers
    restaurant = await Restaurant.findOne({ where: { qr_code_identifier: paramId, deleted_at: null }, include: includes });
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

  const responseData = {
    ...restaurant.toJSON(),
    cover_image_url: restaurant.cover_image_url || null,
    logo_url: restaurant.logo_url || null,
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
      // eslint-disable-next-line no-undef
      await sendWelcomeEmail(owner_email, owner_name, tempPassword);
    }
    
    ownerId = owner.id;
  } else {
    // Use the platform admin as owner (for testing)
    ownerId = userId;
  }

  // Generate unique QR code identifier
  const qrIdentifier = `${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
  const qrUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu/${qrIdentifier}`;
  
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
    email: email || null,
    website: website || null,
    cuisine_type: cuisine_type || null,
    operating_hours: operating_hours || {},
    qr_code_identifier: qrIdentifier,
    qr_code_url: qrCloudinaryUrl,
    subscription_status: 'trial',
    subscription_tier: 'basic',
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
  const updates = req.body;

  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Check ownership
  if (restaurant.owner_id !== req.user.id && req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'You do not have permission to update this restaurant');
  }

  // Handle logo upload if provided
  if (req.file && req.file.fieldname === 'logo') {
    const uploadResult = await uploadToCloudinary(req.file.path, 'menugo/restaurants');
    updates.logo_url = uploadResult.url;
  }

  // Handle cover image upload if provided
  if (req.file && req.file.fieldname === 'coverImage') {
    const uploadResult = await uploadToCloudinary(req.file.path, 'menugo/restaurants');
    updates.cover_image_url = uploadResult.url;
  }

  await restaurant.update(updates);

  res.json(ApiResponse.success(restaurant, 'Restaurant updated'));
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

  // Use a transaction when performing destructive operations
  const t = await sequelize.transaction();
  try {
    if (req.user.role === 'platform_admin') {
      // Hard-delete common dependent records first to avoid FK constraint issues
      // Many models use paranoid mode; use force: true to permanently remove them

      // First collect coupon ids for this restaurant so we can delete usages by coupon_id
      let couponIds = [];
      if (Coupon) {
        const coupons = await Coupon.findAll({ where: { restaurant_id: id }, attributes: ['id'], transaction: t });
        couponIds = coupons.map(c => c.id);
      }

      const destroyOps = [
        // Child records that reference primary entities should be removed first
        MenuItem ? MenuItem.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        MenuCategory ? MenuCategory.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        Table ? Table.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        RestaurantStaff ? RestaurantStaff.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        QRCode ? QRCode.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        // Delete coupon usages by coupon_id (CouponUsage table does not have restaurant_id column)
        (CouponUsage && couponIds.length > 0) ? CouponUsage.destroy({ where: { coupon_id: { [Op.in]: couponIds } }, force: true, transaction: t }) : Promise.resolve(),
        // Now remove coupons themselves
        Coupon ? Coupon.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        InventoryTransaction ? InventoryTransaction.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        InventoryItem ? InventoryItem.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        DailySalesSummary ? DailySalesSummary.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        MenuItemAnalytics ? MenuItemAnalytics.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        HourlyAnalytics ? HourlyAnalytics.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        Review ? Review.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
        RestaurantSetting ? RestaurantSetting.destroy({ where: { restaurant_id: id }, force: true, transaction: t }) : Promise.resolve(),
      ];

      // Run destroy operations in parallel
      await Promise.all(destroyOps);

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
      err && (err.name === 'SequelizeForeignKeyConstraintError' || (err.original && /foreign key/i.test(err.original.message || '')) || /foreign key constraint/i.test(err.message || ''))

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
  };

  res.json(ApiResponse.success(stats, 'Dashboard stats retrieved'));
});

// Verify restaurant (platform admin)
const verifyRestaurant = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { is_verified, rejection_reason } = req.body;

  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  await restaurant.update({
    is_verified,
    verification_date: is_verified ? new Date() : null,
    verified_by: req.user.id,
    rejection_reason: rejection_reason || null,
  });

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
  await restaurant.update({ settings: updatedSettings });

  res.json(ApiResponse.success(restaurant.settings, 'Settings updated'));
});

// Get restaurant tables
const getTables = catchAsync(async (req, res) => {
  const { id } = req.params;

  const tables = await Table.findAll({
    where: { restaurant_id: id },
    order: [['table_number', 'ASC']],
  });

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
    let qrIdentifier = restaurant.qr_code_identifier
    let qrCloudinaryUrl = null
    let qrCodeRecord = null

    if (!qrIdentifier) {
      qrIdentifier = `${restaurant.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      const qrUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu/${qrIdentifier}`
      const qrImagePath = await generateQRCode(qrUrl, qrIdentifier)
      const qrBase64 = await generateQRCodeBase64(qrUrl)
      if (qrImagePath) {
        const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes')
        qrCloudinaryUrl = uploadResult.url
      }

      const [newQr] = await QRCode.upsert({
        restaurant_id: id,
        identifier: qrIdentifier,
        url: qrUrl,
        qr_image_url: qrCloudinaryUrl,
        is_active: true,
      })

      qrCodeRecord = newQr
      await restaurant.update({ qr_code_identifier: qrIdentifier, qr_code_url: qrCloudinaryUrl })
    } else {
      // Try to find an existing restaurant QR record
      const existing = await QRCode.findOne({ where: { restaurant_id: id, identifier: qrIdentifier } })
      if (existing) {
        qrCodeRecord = existing
        qrCloudinaryUrl = existing.qr_image_url
      } else {
        const qrUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu/${qrIdentifier}`
        const qrImagePath = await generateQRCode(qrUrl, qrIdentifier)
        const qrBase64 = await generateQRCodeBase64(qrUrl)
        if (qrImagePath) {
          const uploadResult = await uploadToCloudinary(qrImagePath, 'menugo/qrcodes')
          qrCloudinaryUrl = uploadResult.url
        }

        const [newQr] = await QRCode.upsert({
          restaurant_id: id,
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
      await table.update({ qr_code_id: qrCodeRecord.id, qr_code_url: qrCloudinaryUrl })
    }
  } catch (qrError) {
    console.error('QR generation error:', qrError)
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
  updateSettings,
  getTables,
  createTable,
  
};
