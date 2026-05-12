const { InventoryItem, InventoryTransaction, MenuItem, Restaurant } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');

// Get all inventory items
const getInventoryItems = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 20, low_stock, search } = req.query;
  const offset = (page - 1) * limit;

  const where = { restaurant_id: restaurantId };
  if (low_stock === 'true') {
    where.quantity = { [Op.lte]: sequelize.col('reorder_level') };
  }
  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  const { count, rows } = await InventoryItem.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [['name', 'ASC']],
  });

  res.json(ApiResponse.success({
    items: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  }, 'Inventory items retrieved'));
});

// Get inventory item by ID
const getInventoryItemById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await InventoryItem.findByPk(id, {
    include: [{ model: InventoryTransaction, as: 'inventory_transactions', limit: 50, order: [['created_at', 'DESC']] }],
  });

  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  res.json(ApiResponse.success(item, 'Inventory item retrieved'));
});

// Create inventory item
const createInventoryItem = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { name, description, unit, quantity, reorder_level, reorder_quantity, cost_per_unit, supplier } = req.body;

  const item = await InventoryItem.create({
    restaurant_id: restaurantId,
    name,
    description,
    unit: unit || 'unit',
    quantity: quantity || 0,
    reorder_level: reorder_level || 0,
    reorder_quantity: reorder_quantity || 0,
    cost_per_unit: cost_per_unit || 0,
    supplier,
  });

  // Create initial transaction
  if (quantity > 0) {
    await InventoryTransaction.create({
      restaurant_id: restaurantId,
      inventory_item_id: item.id,
      transaction_type: 'purchase',
      quantity,
      previous_quantity: 0,
      new_quantity: quantity,
      notes: 'Initial stock',
      created_by: req.user.id,
    });
  }

  res.status(201).json(ApiResponse.success(item, 'Inventory item created'));
});

// Update inventory item
const updateInventoryItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const item = await InventoryItem.findByPk(id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  await item.update(updates);

  res.json(ApiResponse.success(item, 'Inventory item updated'));
});

// Delete inventory item
const deleteInventoryItem = catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await InventoryItem.findByPk(id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  await item.destroy();

  res.json(ApiResponse.success(null, 'Inventory item deleted'));
});

// Adjust stock
const adjustStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { quantity, transaction_type, notes } = req.body;

  const item = await InventoryItem.findByPk(id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  const previousQuantity = item.quantity;
  let newQuantity = previousQuantity;

  if (transaction_type === 'purchase') {
    newQuantity = previousQuantity + quantity;
  } else if (transaction_type === 'usage' || transaction_type === 'waste') {
    newQuantity = previousQuantity - quantity;
    if (newQuantity < 0) newQuantity = 0;
  } else if (transaction_type === 'adjustment') {
    newQuantity = quantity;
  }

  await item.update({ quantity: newQuantity });

  // Create transaction record
  const transaction = await InventoryTransaction.create({
    restaurant_id: item.restaurant_id,
    inventory_item_id: item.id,
    transaction_type,
    quantity,
    previous_quantity: previousQuantity,
    new_quantity: newQuantity,
    notes,
    created_by: req.user.id,
  });

  // Check low stock alert
  if (newQuantity <= item.reorder_level && item.reorder_level > 0) {
    await Notification.create({
      restaurant_id: item.restaurant_id,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${item.name} is running low. Current stock: ${newQuantity} ${item.unit}`,
      data: { inventory_item_id: item.id, quantity: newQuantity },
    });
  }

  res.json(ApiResponse.success({
    item,
    transaction,
    new_quantity: newQuantity,
  }, 'Stock adjusted'));
});

// Get low stock items
const getLowStockItems = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const items = await InventoryItem.findAll({
    where: {
      restaurant_id: restaurantId,
      quantity: { [Op.lte]: sequelize.col('reorder_level') },
      reorder_level: { [Op.gt]: 0 },
    },
    order: [['quantity', 'ASC']],
  });

  res.json(ApiResponse.success(items, 'Low stock items retrieved'));
});

// Get inventory transactions
const getInventoryTransactions = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 50, transaction_type, start_date, end_date } = req.query;
  const offset = (page - 1) * limit;

  const where = { restaurant_id: restaurantId };
  if (transaction_type) where.transaction_type = transaction_type;
  if (start_date && end_date) {
    where.created_at = { [Op.between]: [new Date(start_date), new Date(end_date)] };
  }

  const { count, rows } = await InventoryTransaction.findAndCountAll({
    where,
    include: [{ model: InventoryItem, as: 'transaction_item' }],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success({
    transactions: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  }, 'Transactions retrieved'));
});

// Get inventory summary
const getInventorySummary = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const totalItems = await InventoryItem.count({ where: { restaurant_id: restaurantId } });
  const lowStockCount = await InventoryItem.count({
    where: {
      restaurant_id: restaurantId,
      quantity: { [Op.lte]: sequelize.col('reorder_level') },
      reorder_level: { [Op.gt]: 0 },
    },
  });
  const outOfStockCount = await InventoryItem.count({
    where: { restaurant_id: restaurantId, quantity: 0 },
  });

  const totalValue = await InventoryItem.findAll({
    where: { restaurant_id: restaurantId },
    attributes: [[sequelize.fn('SUM', sequelize.literal('quantity * cost_per_unit')), 'total_value']],
  });

  const recentTransactions = await InventoryTransaction.findAll({
    where: { restaurant_id: restaurantId },
    limit: 10,
    include: [{ model: InventoryItem, as: 'transaction_item' }],
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success({
    total_items: totalItems,
    low_stock_items: lowStockCount,
    out_of_stock_items: outOfStockCount,
    total_inventory_value: totalValue[0]?.dataValues?.total_value || 0,
    recent_transactions: recentTransactions,
  }, 'Inventory summary retrieved'));
});

module.exports = {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
  getLowStockItems,
  getInventoryTransactions,
  getInventorySummary,
};