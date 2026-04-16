const { MenuCategory, MenuItem, MenuItemOptionGroup, MenuItemOption, Restaurant } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { Op } = require('sequelize');

// Get all categories for a restaurant
const getCategories = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const categories = await MenuCategory.findAll({
    where: { restaurant_id: restaurantId, is_active: true },
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
  const { category_id, is_available, search } = req.query;

  const where = { restaurant_id: restaurantId, deleted_at: null };
  if (category_id) where.category_id = category_id;
  if (is_available !== undefined) where.is_available = is_available === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
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

  // Support both slug-style `qr_code_identifier` and UUID primary key values.
  let restaurant = await Restaurant.findOne({
    where: { qr_code_identifier: restaurantId, is_active: true },
  });

  if (!restaurant) {
    // Fallback: try by primary key (UUID)
    restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant && !restaurant.is_active) restaurant = null;
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
      logo_url: restaurant.logo_url,
      cover_image_url: restaurant.cover_image_url,
      operating_hours: restaurant.operating_hours,
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