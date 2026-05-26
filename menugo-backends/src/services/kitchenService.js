// src/services/kitchenService.js
const db = require('../config/database');
const KitchenOrder = require('../models/KitchenOrder');

class KitchenService {
  async createKitchenOrder(orderData) {
    try {
      // Ensure required identifiers are present and provide safe fallbacks
      orderData.order_number = orderData.order_number || String(orderData.order_id || '')
      orderData.restaurant_id = orderData.restaurant_id || null
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