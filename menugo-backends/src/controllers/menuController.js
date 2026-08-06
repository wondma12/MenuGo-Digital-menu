const { MenuCategory, MenuItem, MenuItemOptionGroup, MenuItemOption, Restaurant, SubscriptionPlan } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { Op } = require('sequelize');

// Get all categories for a restaurant
// If query param `include_inactive=true` is provided, return all categories
const getCategories = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { include_inactive, includeInactive } = req.query;
  const includeInactiveFlag = (include_inactive === 'true') || (includeInactive === 'true');

  const where = { restaurant_id: restaurantId };
  if (!includeInactiveFlag) where.is_active = true;

  const categories = await MenuCategory.findAll({
    where,
    order: [['display_order', 'ASC']],
  });

  res.json(ApiResponse.success(categories, 'Categories retrieved'));
});

// Create category
const createCategory = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { name, description, icon_url, image_url, display_order } = req.body;

  const existingCategory = await MenuCategory.findOne({
    where: { restaurant_id: restaurantId, name },
  });

  if (existingCategory) {
    throw new ApiError(400, 'Category with this name already exists');
  }

  const category = await MenuCategory.create({
    restaurant_id: restaurantId,
    name,
    description,
    icon_url,
    image_url,
    display_order: display_order || 0,
  });

  res.status(201).json(ApiResponse.success(category, 'Category created'));
});

// Update category
const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const category = await MenuCategory.findByPk(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await category.update(updates);

  res.json(ApiResponse.success(category, 'Category updated'));
});

// Delete category
const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  const category = await MenuCategory.findByPk(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await category.update({ is_active: false });

  res.json(ApiResponse.success(null, 'Category deleted'));
});

// Toggle category status (active/inactive)
const toggleCategoryStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive, is_active } = req.body;

  const category = await MenuCategory.findByPk(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const incoming = isActive !== undefined ? isActive : (is_active !== undefined ? is_active : null);
  let desiredStatus;
  if (incoming === null) {
    desiredStatus = !category.is_active;
  } else if (typeof incoming === 'string') {
    desiredStatus = incoming === 'true';
  } else {
    desiredStatus = !!incoming;
  }

  await category.update({ is_active: desiredStatus });

  res.json(ApiResponse.success(category, 'Category status updated'));
});

// Get all menu items
const getMenuItems = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  // frontend may send `category` / `availability` or `category_id` / `is_available`
  const { category_id, is_available, category, availability, search } = req.query;

  const where = { restaurant_id: restaurantId, deleted_at: null };

  const cat = category_id || (category && category !== 'all' ? category : null);
  if (cat && String(cat) !== 'all') where.category_id = cat;

  const avail = typeof is_available !== 'undefined' ? is_available : (typeof availability !== 'undefined' ? availability : undefined);
  if (typeof avail !== 'undefined' && String(avail) !== 'all') {
    // treat 'true'/'false' strings properly
    if (String(avail).toLowerCase() === 'true') where.is_available = true;
    else if (String(avail).toLowerCase() === 'false') where.is_available = false;
  }

  const q = typeof search === 'string' ? search.trim() : '';
  if (q.length > 0) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }

  const items = await MenuItem.findAll({
    where,
    include: [
      { model: MenuCategory, as: 'category' },
      { model: MenuItemOption, as: 'item_options', include: [{ model: MenuItemOptionGroup, as: 'option_group' }] },
    ],
    order: [['display_order', 'ASC']],
  });

  res.json(ApiResponse.success(items, 'Menu items retrieved'));
});

// Get menu item by ID
const getMenuItemById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await MenuItem.findByPk(id, {
    include: [
      { model: MenuCategory, as: 'category' },
      { model: MenuItemOption, as: 'item_options', include: [{ model: MenuItemOptionGroup, as: 'option_group' }] },
    ],
  });

  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }

  res.json(ApiResponse.success(item, 'Menu item retrieved'));
});

// Create menu item
const createMenuItem = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const {
    category_id, name, description, price, discount_price,
    is_available, is_recommended, is_vegetarian, is_vegan,
    is_gluten_free, spice_level, preparation_time, calories,
    allergens, tags, display_order,
  } = req.body;

  // Find restaurant and enforce subscription limits (max menu items)
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) throw new ApiError(404, 'Restaurant not found');

  // Determine allowed max menu items: prefer explicit restaurant.max_menu_items,
  // otherwise fall back to subscription plan limits JSON, otherwise default to 50
  let allowedMax = Number(restaurant.max_menu_items) || 0;
  if (!allowedMax) {
    const plan = await SubscriptionPlan.findOne({ where: { tier: restaurant.subscription_tier } }).catch(() => null);
    if (plan && plan.limits && typeof plan.limits.max_menu_items !== 'undefined') {
      allowedMax = Number(plan.limits.max_menu_items) || 0;
    }
  }
  if (!allowedMax) allowedMax = 50;

  // Count existing active (not soft-deleted) menu items for this restaurant
  const existingCount = await MenuItem.count({ where: { restaurant_id: restaurantId, deleted_at: null } }).catch(() => 0);
  if (existingCount >= allowedMax) {
    throw new ApiError(403, `Menu item limit reached for this restaurant (limit: ${allowedMax}). Upgrade your subscription to add more items.`);
  }

  // Allow passing an image URL directly in the JSON payload (e.g. frontend uploaded separately
  // or provided a remote URL). If a file is uploaded in this request, it takes precedence
  // and will be uploaded to Cloudinary.
  let image_url = req.body.image_url || null;
  let image_public_id = req.body.image_public_id || null;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.path, 'menugo/menu-items');
    image_url = uploadResult.url;
    image_public_id = uploadResult.publicId;
  }

  const item = await MenuItem.create({
    restaurant_id: restaurantId,
    category_id,
    name,
    description,
    price,
    discount_price,
    image_url,
    image_public_id,
    is_available: is_available !== undefined ? is_available : true,
    is_recommended: is_recommended || false,
    is_vegetarian: is_vegetarian || false,
    is_vegan: is_vegan || false,
    is_gluten_free: is_gluten_free || false,
    spice_level: spice_level || 0,
    preparation_time: preparation_time || 0,
    calories: calories || 0,
    allergens: allergens || [],
    tags: tags || [],
    display_order: display_order || 0,
  });

  res.status(201).json(ApiResponse.success(item, 'Menu item created'));
});

// Update menu item
const updateMenuItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const item = await MenuItem.findByPk(id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }

  if (req.file) {
    // Delete old image
    if (item.image_public_id) {
      await deleteFromCloudinary(item.image_public_id);
    }

    const uploadResult = await uploadToCloudinary(req.file.path, 'menugo/menu-items');
    updates.image_url = uploadResult.url;
    updates.image_public_id = uploadResult.publicId;
  }

  await item.update(updates);

  res.json(ApiResponse.success(item, 'Menu item updated'));
});

// Delete menu item (soft delete)
const deleteMenuItem = catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await MenuItem.findByPk(id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }

  // Delete image from Cloudinary
  if (item.image_public_id) {
    await deleteFromCloudinary(item.image_public_id);
  }

  await item.update({ deleted_at: new Date() });

  res.json(ApiResponse.success(null, 'Menu item deleted'));
});

// Toggle item availability
const toggleAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await MenuItem.findByPk(id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }

  await item.update({ is_available: !item.is_available });

  res.json(ApiResponse.success({ is_available: item.is_available }, 'Availability toggled'));
});

// Get customer menu (public)
const getCustomerMenu = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const normalizeIdentifier = (value) => {
    return (value || '').toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  };

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  let restaurant = null;

  // First try an exact identifier match across non-deleted, active restaurants.
  if (restaurantId) {
    restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurantId, deleted_at: null, is_active: true } }).catch(() => null);
  }

  // Fallback to UUID primary key lookup.
  if (!restaurant && restaurantId && uuidRegex.test(restaurantId)) {
    restaurant = await Restaurant.findOne({ where: { id: restaurantId, deleted_at: null, is_active: true } }).catch(() => null);
  }

  // If still not found, attempt a forgiving slug/name lookup across all non-deleted restaurants.
  if (!restaurant) {
    const candidates = await Restaurant.findAll({ where: { deleted_at: null } }).catch(() => []);
    restaurant = candidates.find((candidate) => {
      try {
        const normalizedCandidate = normalizeIdentifier(candidate.qr_code_identifier) || normalizeIdentifier(candidate.name);
        const normalizedLookup = normalizeIdentifier(restaurantId);
        return normalizedCandidate === normalizedLookup || normalizeIdentifier(candidate.name) === normalizedLookup;
      } catch (error) {
        return false;
      }
    }) || null;
  }

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const categories = await MenuCategory.findAll({
    where: { restaurant_id: restaurant.id, is_active: true },
    order: [['display_order', 'ASC']],
  });

  const items = await MenuItem.findAll({
    where: { restaurant_id: restaurant.id, deleted_at: null },
    include: [
      { model: MenuCategory, as: 'category' },
      { model: MenuItemOption, as: 'item_options', include: [{ model: MenuItemOptionGroup, as: 'option_group' }] },
    ],
  });

  res.json(ApiResponse.success({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      country: restaurant.country,
      postal_code: restaurant.postal_code,
      phone: restaurant.phone,
      whatsapp_number: restaurant.whatsapp_number,
      email: restaurant.email,
      website: restaurant.website,
      logo_url: restaurant.logo_url,
      cover_image_url: restaurant.cover_image_url,
      cuisine_type: restaurant.cuisine_type,
      cuisine_types: restaurant.cuisine_types,
      operating_hours: restaurant.operating_hours,
      settings: restaurant.settings,
      features: restaurant.features,
      enable_delivery: restaurant.settings?.enable_delivery ?? restaurant.enable_delivery ?? false,
      enable_pickup: restaurant.settings?.enable_pickup ?? restaurant.enable_pickup ?? false,
      average_rating: restaurant.average_rating,
      total_reviews: restaurant.total_reviews,
    },
    categories,
    items,
  }, 'Menu retrieved'));
});

// Create option group
const createOptionGroup = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { name, description, min_selection, max_selection, is_required } = req.body;

  const optionGroup = await MenuItemOptionGroup.create({
    restaurant_id: restaurantId,
    name,
    description,
    min_selection: min_selection || 0,
    max_selection: max_selection || 1,
    is_required: is_required || false,
  });

  res.status(201).json(ApiResponse.success(optionGroup, 'Option group created'));
});

// Add option to group
const addOption = catchAsync(async (req, res) => {
  const { groupId } = req.params;
  const { menu_item_id, name, price_adjustment, is_default } = req.body;

  const option = await MenuItemOption.create({
    menu_item_id,
    option_group_id: groupId,
    name,
    price_adjustment: price_adjustment || 0,
    is_default: is_default || false,
  });

  res.status(201).json(ApiResponse.success(option, 'Option added'));
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getCustomerMenu,
  createOptionGroup,
  addOption,
};