// src/models/KitchenStation.js
const db = require('../config/database');

class KitchenStation {
  // Get all stations for restaurant
  static async getByRestaurant(restaurantId) {
    const [stations] = await db.execute(
      `SELECT * FROM kitchen_stations 
       WHERE restaurant_id = ? AND is_active = TRUE 
       ORDER BY display_order ASC`,
      [restaurantId]
    );
    return stations;
  }

  // Create station
  static async create(stationData) {
    const [result] = await db.execute(
      `INSERT INTO kitchen_stations (restaurant_id, name, station_type, chef_id, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [stationData.restaurant_id, stationData.name, stationData.station_type, 
       stationData.chef_id, stationData.display_order || 0]
    );
    return { id: result.insertId, ...stationData };
  }

  // Assign order to station
  static async assignOrder(stationId, kitchenOrderId) {
    const [result] = await db.execute(
      `INSERT INTO kitchen_station_assignments (station_id, kitchen_order_id)
       VALUES (?, ?)`,
      [stationId, kitchenOrderId]
    );
    return result;
  }

  // Complete station assignment
  static async completeAssignment(stationId, kitchenOrderId) {
    await db.execute(
      `UPDATE kitchen_station_assignments 
       SET completed_at = NOW() 
       WHERE station_id = ? AND kitchen_order_id = ? AND completed_at IS NULL`,
      [stationId, kitchenOrderId]
    );
  }

  // Get station current orders
  static async getCurrentOrders(stationId) {
    const [orders] = await db.execute(
      `SELECT k.*, ksa.started_at as assigned_at
       FROM kitchen_station_assignments ksa
       JOIN kitchen_orders k ON ksa.kitchen_order_id = k.id
       WHERE ksa.station_id = ? AND ksa.completed_at IS NULL
       ORDER BY ksa.started_at ASC`,
      [stationId]
    );
    return orders;
  }
}

module.exports = KitchenStation;