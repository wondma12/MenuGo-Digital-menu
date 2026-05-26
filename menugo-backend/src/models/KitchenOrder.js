// src/models/KitchenOrder.js
const db = require('../config/database');
const { format } = require('date-fns');

class KitchenOrder {
  // Create new kitchen order and associated items/modifiers
  static async create(orderData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const orderId = orderData.order_id ?? null;
      const restaurantId = orderData.restaurant_id ?? null;
      const orderNumber = typeof orderData.order_number !== 'undefined' && orderData.order_number !== null
        ? orderData.order_number
        : (orderId ? String(orderId) : '');
      const tableNumber = orderData.table_number ?? null;
      const customerName = orderData.customer_name ?? null;
      const waiterId = orderData.waiter_id ?? null;
      const waiterName = orderData.waiter_name ?? null;
      const stationVal = orderData.station || 'all';
      const priorityVal = orderData.priority || 'normal';
      const estimatedTime = typeof orderData.estimated_time !== 'undefined' ? orderData.estimated_time : null;
      const notesVal = typeof orderData.notes !== 'undefined' ? orderData.notes : null;

      const [result] = await connection.execute(
        `INSERT INTO kitchen_orders (
          order_id, restaurant_id, order_number, table_number, customer_name,
          waiter_id, waiter_name, status, station, priority, estimated_time, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, restaurantId, orderNumber, tableNumber, customerName, waiterId, waiterName, 'pending', stationVal, priorityVal, estimatedTime, notesVal]
      );

      const kitchenOrderId = result.insertId;

      // Insert items and modifiers
      if (Array.isArray(orderData.items)) {
        for (const it of orderData.items) {
          const itemId = it.item_id ?? null;
          const itemName = it.item_name ?? it.name ?? null;
          const qty = typeof it.quantity !== 'undefined' ? it.quantity : 1;
          const prepTime = typeof it.preparation_time !== 'undefined' ? it.preparation_time : null;

          const [itemRes] = await connection.execute(
            `INSERT INTO kitchen_order_items (kitchen_order_id, item_id, item_name, quantity, preparation_time)
             VALUES (?, ?, ?, ?, ?)`,
            [kitchenOrderId, itemId, itemName, qty, prepTime]
          );

          const kitchenOrderItemId = itemRes.insertId;

          if (Array.isArray(it.modifiers)) {
            for (const m of it.modifiers) {
              const name = m.name ?? m.modifier_name ?? null;
              const price = typeof m.price !== 'undefined' ? m.price : null;
              await connection.execute(
                `INSERT INTO kitchen_order_item_modifiers (kitchen_order_item_id, modifier_name, modifier_price)
                 VALUES (?, ?, ?)`,
                [kitchenOrderItemId, name, price]
              );
            }
          }
        }
      }

      await connection.commit();

      // Return created summary
      const [rows] = await db.execute(`SELECT * FROM kitchen_orders WHERE id = ?`, [kitchenOrderId]);
      return rows[0] || { id: kitchenOrderId };
    } catch (err) {
      try { await connection.rollback(); } catch (e) {}
      if (err && (err.code === 'ER_NO_SUCH_TABLE' || (err.message || '').includes("doesn't exist"))) {
        throw new Error('Kitchen feature is not available: required tables are missing');
      }
      throw err;
    } finally {
      try { connection.release(); } catch (e) {}
    }
  }

  // Build dashboard data (pending, preparing, ready) and stats
  static async getDashboardData(restaurantId, date = null) {
    try {
      const dashboardDate = date ? new Date(date) : new Date();
      const dateStr = format(dashboardDate, 'yyyy-MM-dd');

      const [pending] = await db.execute(
        `SELECT k.*, COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count
         FROM kitchen_orders k
         WHERE k.restaurant_id = ? AND k.status = 'pending'
         ORDER BY CASE k.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END, k.created_at ASC
         LIMIT 50`,
        [restaurantId]
      );

      const [preparing] = await db.execute(
        `SELECT k.*, TIMESTAMPDIFF(MINUTE, k.started_at, NOW()) as elapsed_minutes,
          COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count
         FROM kitchen_orders k
         WHERE k.restaurant_id = ? AND k.status = 'preparing'
         ORDER BY k.started_at ASC
         LIMIT 50`,
        [restaurantId]
      );

      const [ready] = await db.execute(
        `SELECT k.*, COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count
         FROM kitchen_orders k
         WHERE k.restaurant_id = ? AND k.status = 'ready'
         ORDER BY k.ready_at DESC
         LIMIT 50`,
        [restaurantId]
      );

      // Count completed orders from the main orders table so kitchen totals
      // match other dashboards and business reporting.
      const [completedToday] = await db.execute(
        `SELECT COUNT(*) as count
         FROM orders
         WHERE restaurant_id = ?
           AND status = 'completed'
           AND DATE(COALESCE(served_at, updated_at, created_at)) = ?`,
        [restaurantId, dateStr]
      );

      const [avgPrepTime] = await db.execute(
        `SELECT AVG(TIMESTAMPDIFF(MINUTE, started_at, ready_at)) as avg_time FROM kitchen_orders WHERE restaurant_id = ? AND status = 'completed' AND DATE(completed_at) = ? AND started_at IS NOT NULL AND ready_at IS NOT NULL`,
        [restaurantId, dateStr]
      );

      const stats = {
        pending: pending.length,
        preparing: preparing.length,
        ready: ready.length,
        completedToday: completedToday[0]?.count || 0,
        avgPrepTime: Math.floor(avgPrepTime[0]?.avg_time || 0)
      };

      const orders = [...pending, ...preparing, ...ready];

      for (const order of orders) {
        const [items] = await db.execute(
          `SELECT ki.*, mi.image_url as menu_item_image, mi.name as menu_item_name FROM kitchen_order_items ki LEFT JOIN menu_items mi ON mi.id = ki.item_id WHERE ki.kitchen_order_id = ?`,
          [order.id]
        );

        for (const item of items) {
          const [mods] = await db.execute(`SELECT modifier_name as name, modifier_price as price FROM kitchen_order_item_modifiers WHERE kitchen_order_item_id = ?`, [item.id]);
          item.modifiers = mods || [];
          item.image = item.menu_item_image || null;
        }

        order.items = items || [];
      }

      return { orders, stats };
    } catch (err) {
      if (err && (err.code === 'ER_NO_SUCH_TABLE' || (err.message || '').includes("doesn't exist"))) {
        console.warn('Kitchen tables missing; returning empty dashboard:', err.message || err);
        return { orders: [], stats: { pending: 0, preparing: 0, ready: 0, completedToday: 0, avgPrepTime: 0 } };
      }
      throw err;
    }
  }

  // Update a single order status
  static async updateStatus(orderId, status, notes = null) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [orders] = await connection.execute(`SELECT * FROM kitchen_orders WHERE id = ?`, [orderId]);
      if (orders.length === 0) throw new Error('Order not found');

      const currentOrder = orders[0];
      const updates = { status };

      if (status === 'preparing' && !currentOrder.started_at) updates.started_at = new Date();
      else if (status === 'ready') updates.ready_at = new Date();
      else if (status === 'completed') updates.completed_at = new Date();

      const startedAt = updates.started_at || null;
      const readyAt = updates.ready_at || null;
      const completedAt = updates.completed_at || null;
      const notesParam = typeof notes !== 'undefined' ? notes : null;

      await connection.execute(`UPDATE kitchen_orders SET status = ?, started_at = COALESCE(?, started_at), ready_at = COALESCE(?, ready_at), completed_at = COALESCE(?, completed_at), notes = COALESCE(?, notes) WHERE id = ?`,
        [status, startedAt, readyAt, completedAt, notesParam, orderId]);

      // keep main orders.status in sync if possible
      try {
        await connection.execute(`UPDATE orders SET status = ? WHERE id = ?`, [status, currentOrder.order_id]);
      } catch (e) {
        // ignore if orders table not available or FK mismatch
      }

      await connection.execute(`INSERT INTO kitchen_activity_logs (restaurant_id, kitchen_order_id, action, old_status, new_status, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [currentOrder.restaurant_id, orderId, 'status_update', currentOrder.status, status, notesParam]);

      await connection.commit();
      return { id: orderId, status, ...updates };
    } catch (error) {
      try { await connection.rollback(); } catch (e) {}
      if (error && (error.code === 'ER_NO_SUCH_TABLE' || (error.message || '').includes("doesn't exist"))) {
        throw new Error('Kitchen feature is not available: required tables are missing');
      }
      throw error;
    } finally {
      try { connection.release(); } catch (e) {}
    }
  }

  static async getOrderDetails(orderId) {
    try {
      const [orders] = await db.execute(`SELECT k.*, o.customer_name as main_customer_name, o.total_amount, o.payment_method FROM kitchen_orders k LEFT JOIN orders o ON k.order_id = o.id WHERE k.id = ?`, [orderId]);
      if (!orders || orders.length === 0) return null;
      const order = orders[0];

      const [items] = await db.execute(`SELECT ki.*, mi.image_url as menu_item_image, mi.name as menu_item_name FROM kitchen_order_items ki LEFT JOIN menu_items mi ON mi.id = ki.item_id WHERE ki.kitchen_order_id = ?`, [orderId]);
      for (const item of items) {
        const [mods] = await db.execute(`SELECT modifier_name as name, modifier_price as price FROM kitchen_order_item_modifiers WHERE kitchen_order_item_id = ?`, [item.id]);
        item.modifiers = mods || [];
        item.image = item.menu_item_image || null;
      }
      order.items = items || [];
      return order;
    } catch (err) {
      if (err && (err.code === 'ER_NO_SUCH_TABLE' || (err.message || '').includes("doesn't exist"))) {
        console.warn('Kitchen tables missing; getOrderDetails returning null:', err.message || err);
        return null;
      }
      throw err;
    }
  }

  static async bulkUpdateStatus(orderIds, status) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const placeholders = orderIds.map(() => '?').join(',');
      await connection.execute(`UPDATE kitchen_orders SET status = ?, started_at = CASE WHEN ? = 'preparing' AND started_at IS NULL THEN NOW() ELSE started_at END, ready_at = CASE WHEN ? = 'ready' THEN NOW() ELSE ready_at END, completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END WHERE id IN (${placeholders})`,
        [status, status, status, status, ...orderIds]);
      await connection.commit();
      return { modifiedCount: orderIds.length };
    } catch (error) {
      try { await connection.rollback(); } catch (e) {}
      if (error && (error.code === 'ER_NO_SUCH_TABLE' || (error.message || '').includes("doesn't exist"))) {
        throw new Error('Kitchen feature is not available: required tables are missing');
      }
      throw error;
    } finally {
      try { connection.release(); } catch (e) {}
    }
  }

  static async getCompletedOrders(restaurantId, page = 1, limit = 20, startDate = null, endDate = null) {
    let query = `
      SELECT
        o.id,
        o.order_number,
        o.table_number,
        o.customer_name,
        o.status,
        COALESCE(o.served_at, o.updated_at, o.created_at) as completed_at,
        COALESCE((SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id), 0) as item_count,
        NULL as prep_time
      FROM orders o
      WHERE o.restaurant_id = ?
        AND o.status = 'completed'`;

    const params = [restaurantId];
    if (startDate) { query += ` AND DATE(COALESCE(o.served_at, o.updated_at, o.created_at)) >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND DATE(COALESCE(o.served_at, o.updated_at, o.created_at)) <= ?`; params.push(endDate); }

    const offset = (page - 1) * limit;
    const safeLimit = Number.isFinite(Number(limit)) ? parseInt(limit) : 20;
    const safeOffset = Number.isFinite(Number(offset)) ? parseInt(offset) : 0;
    query += ` ORDER BY completed_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [orders] = await db.execute(query, params);

    let totalQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE o.restaurant_id = ?
        AND o.status = 'completed'`;
    const totalParams = [restaurantId];
    if (startDate) { totalQuery += ` AND DATE(COALESCE(o.served_at, o.updated_at, o.created_at)) >= ?`; totalParams.push(startDate); }
    if (endDate) { totalQuery += ` AND DATE(COALESCE(o.served_at, o.updated_at, o.created_at)) <= ?`; totalParams.push(endDate); }
    const [totalResult] = await db.execute(totalQuery, totalParams);

    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT oi.*, mi.image_url as menu_item_image, mi.name as menu_item_name
         FROM order_items oi
         LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      for (const item of items) {
        item.modifiers = [];
        item.image = item.menu_item_image || null;
      }

      order.items = items || [];
      order.item_count = Number(order.item_count || (order.items ? order.items.length : 0));
    }

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        pages: Math.ceil(totalResult[0].total / limit),
      },
    };
  }

  static async getAnalytics(restaurantId, date = null) {
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const [analytics] = await db.execute(`SELECT status, COUNT(*) as count, AVG(TIMESTAMPDIFF(MINUTE, started_at, ready_at)) as avg_prep_time FROM kitchen_orders WHERE restaurant_id = ? AND DATE(created_at) = ? GROUP BY status`, [restaurantId, dateStr]);
    const [topItems] = await db.execute(`SELECT ki.item_name as name, SUM(ki.quantity) as total_quantity, AVG(ki.preparation_time) as avg_prep_time FROM kitchen_order_items ki JOIN kitchen_orders k ON ki.kitchen_order_id = k.id WHERE k.restaurant_id = ? AND k.status = 'completed' GROUP BY ki.item_name ORDER BY total_quantity DESC LIMIT 10`, [restaurantId]);
    return { analytics, topItems };
  }

  static async getInventoryAlerts(restaurantId) {
    const [alerts] = await db.execute(`SELECT * FROM kitchen_inventory_alerts WHERE restaurant_id = ? AND resolved_at IS NULL ORDER BY CASE status WHEN 'out_of_stock' THEN 1 WHEN 'critical' THEN 2 ELSE 3 END, created_at DESC`, [restaurantId]);
    return alerts;
  }
}

module.exports = KitchenOrder;