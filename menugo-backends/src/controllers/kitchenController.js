// src/controllers/kitchenController.js
const KitchenOrder = require('../models/KitchenOrder');
const { emitToRestaurant } = require('../sockets');
const KitchenStation = require('../models/KitchenStation');
const db = require('../config/database');

class KitchenController {
  // Get kitchen dashboard data
  async getDashboardData(req, res) {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query;
      const data = await KitchenOrder.getDashboardData(restaurantId, date);
      // Normalize DB snake_case -> frontend camelCase shape
      const normalizeItem = (it) => ({
        id: it.id,
        itemId: it.item_id || it.menu_item_id || it.itemId,
        name: it.item_name || it.menu_item_name || it.name,
          image: it.menu_item_image || it.image || null,
        quantity: it.quantity,
        preparationTime: it.preparation_time || it.preparationTime || null,
        specialInstructions: it.special_instructions || it.specialInstructions || null,
        modifiers: (it.modifiers || []).map(m => ({ name: m.name || m.modifier_name, price: m.price || m.price_adjustment || m.modifier_price }))
      });

      const normalizeOrder = (o) => ({
        id: o.id,
        orderId: o.order_id || o.orderId,
        order_id: o.order_id || o.orderId,
        orderNumber: o.order_number || o.orderNumber,
        order_number: o.order_number || o.orderNumber,
        tableNumber: o.table_number || o.tableNumber,
        table_number: o.table_number || o.tableNumber,
        tableSection: o.table_section || o.tableSection || 'General',
        table_section: o.table_section || o.tableSection || 'General',
        customerName: o.customer_name || o.customerName,
        waiterId: o.waiter_id || o.waiterId,
        waiterName: o.waiter_name || o.waiterName,
        status: o.status,
        station: o.station,
        priority: o.priority,
        estimatedTime: o.estimated_time || o.estimatedTime || null,
        notes: o.notes || null,
        createdAt: o.created_at || o.createdAt,
        created_at: o.created_at || o.createdAt,
        startedAt: o.started_at || o.startedAt,
        started_at: o.started_at || o.startedAt,
        readyAt: o.ready_at || o.readyAt,
        ready_at: o.ready_at || o.readyAt,
        completedAt: o.completed_at || o.completedAt,
        completed_at: o.completed_at || o.completedAt,
        items: (o.items || []).map(normalizeItem)
      });

      const normalized = {
        orders: (data.orders || []).map(normalizeOrder),
        stats: data.stats || {},
      };

      res.json({ success: true, data: normalized, message: 'Kitchen data retrieved successfully' });
    } catch (error) {
      console.error('Error getting kitchen dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, notes } = req.body;

      const updatedOrder = await KitchenOrder.updateStatus(orderId, status, notes);
      
      // Emit socket event to restaurant room via socket helper
      try {
        const orderDetails = await KitchenOrder.getOrderDetails(orderId);
        const rid = orderDetails?.restaurant_id || req.body?.restaurant_id || req.user?.restaurantId;
        if (rid) emitToRestaurant(rid, 'kitchen-order-updated', { orderId, status, updatedOrder: orderDetails });
      } catch (e) {
        console.error('Failed to emit kitchen-order-updated:', e.message || e);
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get order details
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      const order = await KitchenOrder.getOrderDetails(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order,
        message: 'Order details retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting order details:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Bulk update orders
  async bulkUpdateStatus(req, res) {
    try {
      const { orderIds, status } = req.body;
      
      const result = await KitchenOrder.bulkUpdateStatus(orderIds, status);
      
      // Emit bulk update event via socket helper
      try {
        const restaurantId = req.body?.restaurant_id || req.user?.restaurantId;
        if (restaurantId) emitToRestaurant(restaurantId, 'kitchen-bulk-update', { orderIds, status, count: result.modifiedCount });
      } catch (e) {
        console.error('Failed to emit kitchen-bulk-update:', e.message || e);
      }

      res.json({
        success: true,
        data: result,
        message: 'Bulk update completed'
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get completed orders
  async getCompletedOrders(req, res) {
    try {
      const { restaurantId } = req.params;
      const { page = 1, limit = 20, startDate, endDate } = req.query;
      
      const result = await KitchenOrder.getCompletedOrders(
        restaurantId, page, limit, startDate, endDate
      );

      res.json({
        success: true,
        data: result,
        message: 'Completed orders retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting completed orders:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get kitchen analytics
  async getKitchenAnalytics(req, res) {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query;
      
      const analytics = await KitchenOrder.getAnalytics(restaurantId, date);

      res.json({
        success: true,
        data: analytics,
        message: 'Kitchen analytics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting kitchen analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get inventory alerts
  async getInventoryAlerts(req, res) {
    try {
      const { restaurantId } = req.params;
      const alerts = await KitchenOrder.getInventoryAlerts(restaurantId);

      res.json({
        success: true,
        data: alerts,
        message: 'Inventory alerts retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting inventory alerts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get kitchen stations
  async getKitchenStations(req, res) {
    try {
      const { restaurantId } = req.params;
      const stations = await KitchenStation.getByRestaurant(restaurantId);

      res.json({
        success: true,
        data: stations,
        message: 'Kitchen stations retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting kitchen stations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new KitchenController();