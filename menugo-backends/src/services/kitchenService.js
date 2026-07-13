// src/services/kitchenService.js
const db = require('../config/database');
const KitchenOrder = require('../models/KitchenOrder');
const { Order, OrderItem, OrderItemOption, OrderItemModifier, MenuItem, Waiter, User } = require('../models');

class KitchenService {
  async createKitchenOrder(orderData) {
    try {
      // Resolve a minimal order payload (e.g. { order_id }) into full kitchen order data
      orderData = await this.normalizeKitchenOrderPayload(orderData);
      orderData.order_number = orderData.order_number || String(orderData.order_id || '');
      orderData.restaurant_id = orderData.restaurant_id || null;
      orderData.items = Array.isArray(orderData.items) ? orderData.items : [];

      // Calculate preparation times
      const itemsWithPrepTime = orderData.items.map(item => ({
        ...item,
        preparation_time: item.preparation_time || this.calculatePrepTime(item)
      }));

      const estimatedTime = this.calculateTotalPrepTime(itemsWithPrepTime);
      const station = this.determineStation(itemsWithPrepTime);

      // Create kitchen order (KitchenOrder.create manages its own DB transaction)
      const kitchenOrder = await KitchenOrder.create({
        ...orderData,
        items: itemsWithPrepTime,
        estimated_time: estimatedTime,
        station: station
      });

      // Assign to station if specific
      if (station !== 'all') {
        await this.assignToStation(station, kitchenOrder.id);
      }

      return kitchenOrder;
    } catch (error) {
      throw error;
    }
  }

  async normalizeKitchenOrderPayload(orderData) {
    if (!orderData || !orderData.order_id) return orderData;

    const shouldLoadOrder = (
      !Array.isArray(orderData.items) ||
      orderData.items.length === 0 ||
      !orderData.restaurant_id ||
      !orderData.order_number
    );

    if (!shouldLoadOrder) return orderData;

    const order = await Order.findByPk(orderData.order_id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: OrderItemOption, as: 'item_options_selected' },
            { model: OrderItemModifier, as: 'item_modifiers_selected' },
            { model: MenuItem, as: 'menu_item' }
          ]
        }
      ]
    });

    if (!order) return orderData;

    orderData.restaurant_id = orderData.restaurant_id || order.restaurant_id;
    orderData.order_number = orderData.order_number || order.order_number || String(order.id);
    orderData.table_number = orderData.table_number || order.table_number;
    orderData.customer_name = orderData.customer_name || order.customer_name;

    const waiterCandidate = orderData.waiter_id || order.waiter_id || null;
    if (waiterCandidate) {
      const waiterRecord = await Waiter.findByPk(waiterCandidate);
      orderData.waiter_id = waiterRecord ? waiterRecord.user_id : waiterCandidate;
    } else {
      orderData.waiter_id = null;
    }

    orderData.waiter_name = orderData.waiter_name || null;
    orderData.notes = typeof orderData.notes !== 'undefined' ? orderData.notes : order.special_instructions || null;

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      orderData.items = (order.items || []).map(it => ({
        item_id: it.menu_item_id,
        item_name: it.item_name || (it.menu_item && it.menu_item.name) || null,
        quantity: it.quantity,
        preparation_time: (it.menu_item && (it.menu_item.preparation_time || it.menu_item.prep_time)) || it.preparation_time || null,
        special_instructions: it.special_instructions,
        modifiers: (it.item_modifiers_selected || []).map(m => ({
          name: m.modifier_name || m.name,
          price: typeof m.price_adjustment !== 'undefined' ? m.price_adjustment : (typeof m.price !== 'undefined' ? m.price : 0)
        })),
        category: it.menu_item ? (it.menu_item.category_id || it.menu_item.category) : null,
        image: it.menu_item ? (it.menu_item.image_url || it.menu_item.image) : null,
      }));
    }

    return orderData;
  }

  calculatePrepTime(item) {
    const prepTimes = {
      appetizer: 5,
      main_course: 15,
      grill: 12,
      pizza: 10,
      pasta: 8,
      salad: 5,
      dessert: 5,
      beverage: 2,
      default: 10
    };
    return prepTimes[item.category] || prepTimes.default;
  }

  calculateTotalPrepTime(items) {
    return items.reduce((total, item) => {
      return total + (item.preparation_time * item.quantity);
    }, 0);
  }

  determineStation(items) {
    const hasGrill = items.some(i => i.category === 'grill' || i.category === 'main_course');
    const hasPizza = items.some(i => i.category === 'pizza');
    const hasSalad = items.some(i => i.category === 'salad');
    const hasDessert = items.some(i => i.category === 'dessert');
    
    if (hasGrill) return 'grill';
    if (hasPizza) return 'pizza';
    if (hasSalad) return 'salad';
    if (hasDessert) return 'dessert';
    return 'all';
  }

  async assignToStation(stationType, kitchenOrderId) {
    const [station] = await db.execute(
      `SELECT id FROM kitchen_stations WHERE station_type = ? AND is_active = TRUE LIMIT 1`,
      [stationType]
    );

    if (station.length > 0) {
      await db.execute(
        `INSERT INTO kitchen_station_assignments (station_id, kitchen_order_id)
         VALUES (?, ?)`,
        [station[0].id, kitchenOrderId]
      );
    }
  }

  async getOrdersByStatus(restaurantId, status) {
    const [orders] = await db.execute(
      `SELECT k.*, 
        COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count,
        TIMESTAMPDIFF(MINUTE, k.created_at, NOW()) as waiting_minutes
       FROM kitchen_orders k
       WHERE k.restaurant_id = ? AND k.status = ?
       ORDER BY 
         CASE k.priority 
           WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'normal' THEN 3 
           ELSE 4 
         END,
         k.created_at ASC`,
      [restaurantId, status]
    );

    // Get items for each order
    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT ki.*, mi.image_url as menu_item_image, mi.name as menu_item_name
         FROM kitchen_order_items ki
         LEFT JOIN menu_items mi ON mi.id = ki.item_id
         WHERE ki.kitchen_order_id = ?`,
        [order.id]
      );
      for (const item of items) {
        const [modifiers] = await db.execute(
          `SELECT modifier_name as name, modifier_price as price 
           FROM kitchen_order_item_modifiers 
           WHERE kitchen_order_item_id = ?`,
          [item.id]
        );
        item.modifiers = modifiers || [];
        item.image = item.menu_item_image || null;
      }
      order.items = items;
    }

    return orders;
  }

  async getKitchenMetrics(restaurantId) {
    const [metrics] = await db.execute(
      `SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_count,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_count,
        COUNT(CASE WHEN DATE(completed_at) = CURDATE() THEN 1 END) as completed_today,
        AVG(CASE WHEN status = 'completed' AND started_at IS NOT NULL AND ready_at IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, started_at, ready_at) END) as avg_prep_time,
        MAX(CASE WHEN status = 'preparing' THEN TIMESTAMPDIFF(MINUTE, started_at, NOW()) END) as longest_prep_time
       FROM kitchen_orders
       WHERE restaurant_id = ?`,
      [restaurantId]
    );

    return metrics[0];
  }

  async updatePerformanceMetrics(restaurantId) {
    const today = new Date().toISOString().split('T')[0];
    
    const metrics = await this.getKitchenMetrics(restaurantId);
    
    await db.execute(
      `INSERT INTO kitchen_performance_metrics 
       (restaurant_id, date, total_orders_completed, average_prep_time_minutes, peak_hour_orders)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       total_orders_completed = VALUES(total_orders_completed),
       average_prep_time_minutes = VALUES(average_prep_time_minutes),
       peak_hour_orders = VALUES(peak_hour_orders)`,
      [
        restaurantId, today, metrics.completed_today || 0,
        metrics.avg_prep_time || 0, 0
      ]
    );
  }

  async getRealtimeStats(restaurantId) {
    const [stats] = await db.execute(
      `SELECT 
        COUNT(*) as total_active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, NOW())) as avg_wait_time
       FROM kitchen_orders
       WHERE restaurant_id = ? AND status IN ('pending', 'preparing', 'ready')`,
      [restaurantId]
    );

    return stats[0];
  }
}

module.exports = new KitchenService();