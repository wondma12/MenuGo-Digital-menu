// src/models/KitchenOrder.js
const db = require('../config/database');
const { format } = require('date-fns');

class KitchenOrder {
  // Create new kitchen order
  static async create(orderData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insert kitchen order
      // Coerce undefined to null (DB driver disallows undefined binds)
      const orderId = orderData.order_id ?? null;
      const restaurantId = orderData.restaurant_id ?? null;
      // Ensure orderNumber never null: fallback to orderId string or empty string
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
          waiter_id, waiter_name, status, station, priority, 
          estimated_time, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, restaurantId, orderNumber,
          tableNumber, customerName, waiterId,
          waiterName, 'pending', stationVal,
          priorityVal, estimatedTime, notesVal
        ]
      );

      const kitchenOrderId = result.insertId;

      // Insert order items
      for (const item of (orderData.items || [])) {
        const itemId = typeof item.item_id !== 'undefined' ? item.item_id : null;
        const itemName = typeof item.item_name !== 'undefined' ? item.item_name : null;
        const quantity = typeof item.quantity === 'number' ? item.quantity : (item.quantity ? Number(item.quantity) : 1);
        const prepTime = typeof item.preparation_time !== 'undefined' && item.preparation_time !== null ? item.preparation_time : 5;
        const specialInstructions = typeof item.special_instructions !== 'undefined' ? item.special_instructions : null;

        const [itemResult] = await connection.execute(
          `INSERT INTO kitchen_order_items (
            kitchen_order_id, item_id, item_name, quantity, 
            preparation_time, special_instructions
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            kitchenOrderId, itemId, itemName, quantity,
            prepTime, specialInstructions
          ]
        );

        // Insert modifiers if any
        if (item.modifiers && item.modifiers.length > 0) {
          for (const modifier of (item.modifiers || [])) {
            const modName = typeof modifier.name !== 'undefined' ? modifier.name : null;
            const modPrice = typeof modifier.price !== 'undefined' && modifier.price !== null ? modifier.price : 0;
            await connection.execute(
              `INSERT INTO kitchen_order_item_modifiers (
                kitchen_order_item_id, modifier_name, modifier_price
              ) VALUES (?, ?, ?)`,
              [itemResult.insertId, modName, modPrice]
            );
          }
        }
      }

      // Log activity
      await connection.execute(
        `INSERT INTO kitchen_activity_logs (
          restaurant_id, kitchen_order_id, action, notes
        ) VALUES (?, ?, ?, ?)`,
        [restaurantId, kitchenOrderId, 'created', 'Order received in kitchen']
      );

      await connection.commit();
      return { id: kitchenOrderId, ...orderData };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get dashboard data
  static async getDashboardData(restaurantId) {
    // Ensure any waiter-verified orders without a kitchen order are materialized
    try {
      const [untracked] = await db.execute(
        `SELECT o.* FROM orders o
         LEFT JOIN kitchen_orders k ON k.order_id = o.id
         WHERE o.restaurant_id = ? AND o.status = 'verified' AND k.id IS NULL
         ORDER BY o.created_at ASC
         LIMIT 50`,
        [restaurantId]
      );

      for (const o of untracked) {
        // Load order items with menu item info and modifiers
        const [orderItems] = await db.execute(
          `SELECT oi.*, mi.name as menu_item_name
           FROM order_items oi
           LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
           WHERE oi.order_id = ?`,
          [o.id]
        );

        const itemsForKitchen = [];
        for (const it of orderItems) {
          const [mods] = await db.execute(
            `SELECT modifier_name as name, price_adjustment as price
             FROM order_item_modifiers WHERE order_item_id = ?`,
            [it.id]
          );

          itemsForKitchen.push({
            item_id: it.menu_item_id,
            item_name: it.item_name || it.menu_item_name,
            quantity: it.quantity,
            preparation_time: null,
            special_instructions: it.special_instructions,
            modifiers: mods || [],
            category: null,
          });
        }

        // Resolve waiter.user_id (users.id) when we only have waiter table id
        let waiterUserId = null;
        if (o.waiter_id) {
          try {
            const [w] = await db.execute(`SELECT user_id FROM waiters WHERE id = ?`, [o.waiter_id]);
            if (w && w.length) waiterUserId = w[0].user_id;
          } catch (e) {
            // ignore lookup errors
          }
        }

        // Create kitchen order for this verified order
        try {
          await KitchenOrder.create({
            order_id: o.id,
            restaurant_id: o.restaurant_id,
            order_number: o.order_number,
            table_number: o.table_number,
            customer_name: o.customer_name,
            // Pass the users.id for waiter to satisfy FK constraint
            waiter_id: waiterUserId,
            waiter_name: o.waiter_name || null,
            items: itemsForKitchen,
            notes: o.special_instructions,
            priority: 'normal'
          });
        } catch (e) {
          // swallow per-order create errors to avoid blocking dashboard
          console.error('Failed to create kitchen order for verified order', o.id, e.message || e);
        }
      }
    } catch (err) {
      // Non-fatal: log and continue to build dashboard
      console.error('Error ensuring kitchen orders for verified orders:', err.message || err);
    }

    const [pending] = await db.execute(
      `SELECT k.*, 
        COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count
       FROM kitchen_orders k
       WHERE k.restaurant_id = ? AND k.status = 'pending'
       ORDER BY CASE k.priority 
         WHEN 'urgent' THEN 1 
         WHEN 'high' THEN 2 
         WHEN 'normal' THEN 3 
         ELSE 4 END, k.created_at ASC
       LIMIT 50`,
      [restaurantId]
    );

    const [preparing] = await db.execute(
      `SELECT k.*, 
        TIMESTAMPDIFF(MINUTE, k.started_at, NOW()) as elapsed_minutes,
        COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count
       FROM kitchen_orders k
       WHERE k.restaurant_id = ? AND k.status = 'preparing'
       ORDER BY k.started_at ASC
       LIMIT 50`,
      [restaurantId]
    );

    const [ready] = await db.execute(
      `SELECT k.*, 
        COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count
       FROM kitchen_orders k
       WHERE k.restaurant_id = ? AND k.status = 'ready'
       ORDER BY k.ready_at DESC
       LIMIT 50`,
      [restaurantId]
    );

    const [completedToday] = await db.execute(
      `SELECT COUNT(*) as count FROM kitchen_orders 
       WHERE restaurant_id = ? AND status = 'completed' 
       AND DATE(completed_at) = CURDATE()`,
      [restaurantId]
    );

    const [avgPrepTime] = await db.execute(
      `SELECT AVG(TIMESTAMPDIFF(MINUTE, started_at, ready_at)) as avg_time 
       FROM kitchen_orders 
       WHERE restaurant_id = ? AND status = 'completed' 
       AND DATE(completed_at) = CURDATE()
       AND started_at IS NOT NULL AND ready_at IS NOT NULL`,
      [restaurantId]
    );

    const stats = {
      pending: pending.length,
      preparing: preparing.length,
      ready: ready.length,
      completedToday: completedToday[0].count,
      avgPrepTime: Math.floor(avgPrepTime[0].avg_time || 0)
    };

    const orders = [...pending, ...preparing, ...ready];

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

      order.items = items || [];
    }

    return { orders, stats };
  }

  // Update order status
  static async updateStatus(orderId, status, notes = null) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Get current order
      const [orders] = await connection.execute(
        `SELECT * FROM kitchen_orders WHERE id = ?`,
        [orderId]
      );

      if (orders.length === 0) {
        throw new Error('Order not found');
      }

      const currentOrder = orders[0];
      const updates = { status };
      
      if (status === 'preparing' && !currentOrder.started_at) {
        updates.started_at = new Date();
      } else if (status === 'ready') {
        updates.ready_at = new Date();
      } else if (status === 'completed') {
        updates.completed_at = new Date();
      }

      // Update kitchen order
      const startedAt = typeof updates.started_at !== 'undefined' ? updates.started_at : null;
      const readyAt = typeof updates.ready_at !== 'undefined' ? updates.ready_at : null;
      const completedAt = typeof updates.completed_at !== 'undefined' ? updates.completed_at : null;
      const notesParam = typeof notes !== 'undefined' ? notes : null;

      await connection.execute(
        `UPDATE kitchen_orders 
         SET status = ?, started_at = COALESCE(?, started_at), 
             ready_at = COALESCE(?, ready_at), completed_at = COALESCE(?, completed_at),
             notes = COALESCE(?, notes)
         WHERE id = ?`,
        [status, startedAt, readyAt, completedAt, notesParam, orderId]
      );

      // Update main order kitchen status
      // Update main order status to reflect kitchen lifecycle
      await connection.execute(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, currentOrder.order_id]
      );

      // Log activity
      await connection.execute(
        `INSERT INTO kitchen_activity_logs (
          restaurant_id, kitchen_order_id, action, old_status, new_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          currentOrder.restaurant_id, orderId, 'status_update',
          currentOrder.status, status, notesParam
        ]
      );

      await connection.commit();

      return { id: orderId, status, ...updates };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get order details
  static async getOrderDetails(orderId) {
    const [orders] = await db.execute(
      `SELECT k.*, o.customer_name as main_customer_name, o.total_amount, o.payment_method
       FROM kitchen_orders k
       LEFT JOIN orders o ON k.order_id = o.id
       WHERE k.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return null;
    }

    const order = orders[0];
    
    const [items] = await db.execute(
      `SELECT ki.*, mi.image_url as menu_item_image, mi.name as menu_item_name
       FROM kitchen_order_items ki
       LEFT JOIN menu_items mi ON mi.id = ki.item_id
       WHERE ki.kitchen_order_id = ?`,
      [orderId]
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

    order.items = items || [];
    
    return order;
  }

  // Bulk update orders
  static async bulkUpdateStatus(orderIds, status) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const placeholders = orderIds.map(() => '?').join(',');
      
      await connection.execute(
        `UPDATE kitchen_orders 
         SET status = ?,
             started_at = CASE WHEN ? = 'preparing' AND started_at IS NULL THEN NOW() ELSE started_at END,
             ready_at = CASE WHEN ? = 'ready' THEN NOW() ELSE ready_at END,
             completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END
         WHERE id IN (${placeholders})`,
        [status, status, status, status, ...orderIds]
      );

      await connection.commit();
      return { modifiedCount: orderIds.length };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get completed orders with pagination
  static async getCompletedOrders(restaurantId, page = 1, limit = 20, startDate = null, endDate = null) {
    let query = `SELECT k.*, 
           COALESCE((SELECT COUNT(*) FROM kitchen_order_items WHERE kitchen_order_id = k.id), 0) as item_count,
           TIMESTAMPDIFF(MINUTE, k.started_at, k.ready_at) as prep_time
           FROM kitchen_orders k
           WHERE k.restaurant_id = ? AND k.status = 'completed'`;
    const params = [restaurantId];

    if (startDate) {
      query += ` AND DATE(completed_at) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(completed_at) <= ?`;
      params.push(endDate);
    }

    // Use numeric interpolation for LIMIT/OFFSET to avoid prepared-statement binding issues
    const offset = (page - 1) * limit;
    const safeLimit = Number.isFinite(Number(limit)) ? parseInt(limit) : 20;
    const safeOffset = Number.isFinite(Number(offset)) ? parseInt(offset) : 0;

    query += ` ORDER BY completed_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [orders] = await db.execute(query, params);

    const [totalResult] = await db.execute(
      `SELECT COUNT(*) as total FROM kitchen_orders 
       WHERE restaurant_id = ? AND status = 'completed'`,
      [restaurantId]
    );

    // Attach items and modifiers for each completed order so frontend can show counts/details
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
           FROM kitchen_order_item_modifiers WHERE kitchen_order_item_id = ?`,
          [item.id]
        );
        item.modifiers = modifiers || [];
        item.image = item.menu_item_image || null;
      }

      order.items = items || [];
      // Ensure numeric item_count for downstream consumers
      order.item_count = Number(order.item_count || (order.items ? order.items.length : 0));
    }

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        pages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  // Get kitchen analytics
  static async getAnalytics(restaurantId, date = null) {
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = format(targetDate, 'yyyy-MM-dd');

    const [analytics] = await db.execute(
      `SELECT status, COUNT(*) as count, 
        AVG(TIMESTAMPDIFF(MINUTE, started_at, ready_at)) as avg_prep_time
       FROM kitchen_orders 
       WHERE restaurant_id = ? AND DATE(created_at) = ?
       GROUP BY status`,
      [restaurantId, dateStr]
    );

    const [topItems] = await db.execute(
      `SELECT ki.item_name as name, SUM(ki.quantity) as total_quantity,
        AVG(ki.preparation_time) as avg_prep_time
       FROM kitchen_order_items ki
       JOIN kitchen_orders k ON ki.kitchen_order_id = k.id
       WHERE k.restaurant_id = ? AND k.status = 'completed'
       GROUP BY ki.item_name
       ORDER BY total_quantity DESC
       LIMIT 10`,
      [restaurantId]
    );

    return { analytics, topItems };
  }

  // Get inventory alerts
  static async getInventoryAlerts(restaurantId) {
    const [alerts] = await db.execute(
      `SELECT * FROM kitchen_inventory_alerts 
       WHERE restaurant_id = ? AND resolved_at IS NULL
       ORDER BY 
         CASE status 
           WHEN 'out_of_stock' THEN 1 
           WHEN 'critical' THEN 2 
           ELSE 3 
         END, created_at DESC`,
      [restaurantId]
    );

    return alerts;
  }
}

module.exports = KitchenOrder;