// src/controllers/dashboardController.js
const {
  User,
  Restaurant,
  Order,
  SupportTicket,
  RestaurantStaff,
  MenuItem,
  MenuCategory,
  Table,
  TableReservation,
  Review,
  MenuItemAnalytics,
} = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');
const { getPopularItems: getPopularItemsFromAnalytics } = require('../services/analyticsService');

// Safe helpers to guard against missing model exports or unexpected runtime issues
const safeCount = (model, options) => {
  if (!model || typeof model.count !== 'function') return Promise.resolve(0);
  return model.count(options).catch(() => 0);
};

const safeSum = (model, field, options) => {
  if (!model || typeof model.sum !== 'function') return Promise.resolve(0);
  return model.sum(field, options).catch(() => 0);
};

const toStartOfDay = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const toEndOfDay = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(23, 59, 59, 999)
  return date
}

const toDayStart = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const toDayEnd = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(23, 59, 59, 999)
  return date
}

const toLocalDateString = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toLocalDay = (value, endOfDay = false) => {
  if (!value) return null

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const year = Number(match[1])
      const month = Number(match[2]) - 1
      const day = Number(match[3])
      const date = new Date(year, month, day)
      if (endOfDay) date.setHours(23, 59, 59, 999)
      else date.setHours(0, 0, 0, 0)
      return date
    }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  if (endOfDay) date.setHours(23, 59, 59, 999)
  else date.setHours(0, 0, 0, 0)
  return date
}

const buildTodaySchedule = (reservations, tables) => {
  const slots = [
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
    '9:00 PM',
  ]

  const openTables = Math.max((tables || []).length, 0)
  return slots.map((time) => {
    const matchingReservations = (reservations || []).filter((reservation) => reservation.reservation_time === time)
    const reservationCount = matchingReservations.length
    const occupiedTables = matchingReservations.filter((reservation) => ['seated', 'confirmed'].includes(reservation.status)).length
    const availableTables = Math.max(openTables - occupiedTables, 0)

    return {
      time,
      reservations: reservationCount,
      available: availableTables,
    }
  })
}

// Get platform admin dashboard
const getPlatformDashboard = catchAsync(async (req, res) => {
  try {
    console.log('=== Platform Dashboard API Called ===');

    const rawStartDate = req.query.startDate || req.query.start_date || null
    const rawEndDate = req.query.endDate || req.query.end_date || null
    const requestedStart = rawStartDate ? toLocalDay(rawStartDate, false) : null
    const requestedEnd = rawEndDate ? toLocalDay(rawEndDate, true) : null
    const revenueStart = requestedStart || (() => { const d = new Date(); d.setDate(d.getDate() - 6); return toDayStart(d) })()
    const revenueEnd = requestedEnd || toDayEnd(new Date())
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 1. Get Restaurant Stats - with safe error handling
    let totalRestaurants = 0;
    let activeRestaurants = 0;
    let pendingVerification = 0;
    let previousRestaurants = 0;
    
    try {
      totalRestaurants = await Restaurant.count({ where: { deleted_at: null } });
      activeRestaurants = await Restaurant.count({ where: { is_active: true, deleted_at: null } });
      pendingVerification = await Restaurant.count({ where: { is_verified: false, is_active: true, deleted_at: null } });
      previousRestaurants = await Restaurant.count({
        where: {
          created_at: { [Op.lt]: thirtyDaysAgo },
          deleted_at: null
        }
      });
    } catch (err) {
      console.error('Restaurant count error:', err);
    }
    
    const restaurantsGrowth = previousRestaurants > 0 
      ? ((totalRestaurants - previousRestaurants) / previousRestaurants) * 100 
      : 0;
    
    // 2. Get User Stats
    let totalUsers = 0;
    let activeUsers = 0;
    
    try {
      totalUsers = await User.count({ where: { deleted_at: null } });
      activeUsers = await User.count({ 
        where: { 
          is_active: true, 
          deleted_at: null,
          last_login: { [Op.gte]: thirtyDaysAgo }
        } 
      });
    } catch (err) {
      console.error('User count error:', err);
    }
    
    // 3. Get Order Stats
    let totalOrders = 0;
    let todayOrders = 0;
    let totalCompletedOrders = 0;
    let todayCompletedOrders = 0;
    
    try {
      totalOrders = await Order.count();
      todayOrders = await Order.count({ 
        where: { created_at: { [Op.gte]: todayStart } } 
      });
      totalCompletedOrders = await Order.count({ where: { status: 'completed' } });
      todayCompletedOrders = await Order.count({
        where: {
          status: 'completed',
          created_at: { [Op.gte]: todayStart }
        }
      });
    } catch (err) {
      console.error('Order count error:', err);
    }
    
    // 4. Get Revenue Stats
    let totalRevenue = 0;
    let todayRevenue = 0;
    
    try {
      totalRevenue = await Order.sum('total_amount', { where: { status: 'completed' } }) || 0;
      todayRevenue = await Order.sum('total_amount', { 
        where: { 
          status: 'completed', 
          created_at: { [Op.gte]: todayStart } 
        } 
      }) || 0;
    } catch (err) {
      console.error('Revenue sum error:', err);
    }
    
    // 5. Get Support Stats (use safeCount to tolerate missing table)
    const openTickets = await safeCount(SupportTicket, { where: { status: 'open' } });
    
    // 6. Get Recent Restaurants (last 5)
    let recentRestaurants = [];
    try {
      recentRestaurants = await Restaurant.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'logo_url', 'city', 'country', 'is_verified', 'is_active', 'created_at'],
      });
    } catch (err) {
      console.error('Recent restaurants error:', err);
    }
    
    // 7. Get Recent Orders (last 5)
    let recentOrders = [];
    try {
      recentOrders = await Order.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'order_number', 'total_amount', 'status', 'created_at'],
      });
    } catch (err) {
      console.error('Recent orders error:', err);
    }
    
    // 8. Get Subscription Breakdown - FIXED: This was the error
    let monthlyCount = 0;
    let sixMonthCount = 0;
    let yearlyCount = 0;
    
    try {
      monthlyCount = await Restaurant.count({ 
        where: { subscription_tier: 'monthly', deleted_at: null } 
      });
      sixMonthCount = await Restaurant.count({ 
        where: { subscription_tier: 'six_month', deleted_at: null } 
      });
      yearlyCount = await Restaurant.count({ 
        where: { subscription_tier: 'yearly', deleted_at: null } 
      });
    } catch (err) {
      console.error('Subscription breakdown error:', err);
    }
    
    const subscriptionBreakdown = [
      { tier: 'monthly', count: monthlyCount || 0 },
      { tier: 'six_month', count: sixMonthCount || 0 },
      { tier: 'yearly', count: yearlyCount || 0 },
    ];
    
    // 9. Generate daily Revenue Data for the requested range (or last 7 days fallback)
    const revenueData = [];
    for (let date = new Date(revenueStart); date <= revenueEnd; date.setDate(date.getDate() + 1)) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const nextDate = new Date(dayStart);
      nextDate.setDate(nextDate.getDate() + 1);
      
      let dailyRevenue = 0;
      let dailyOrders = 0;
      
      try {
        dailyRevenue = await Order.sum('total_amount', {
          where: {
            status: 'completed',
            created_at: { [Op.between]: [dayStart, nextDate] },
          },
        }) || 0;
        
        dailyOrders = await Order.count({
          where: { created_at: { [Op.between]: [dayStart, nextDate] } },
        }) || 0;
      } catch (err) {
        console.error(`Daily data error for ${dayStart}:`, err);
      }
      
      revenueData.push({
        date: toLocalDateString(dayStart),
        revenue: dailyRevenue,
        orders: dailyOrders,
      });
    }

    // 10. Generate monthly growth data for the last 12 months
    const growthData = [];
    try {
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1, 0, 0, 0, 0);
        months.push({ monthStart, monthEnd });
      }

      for (const m of months) {
        const newCount = await Restaurant.count({
          where: {
            created_at: { [Op.between]: [m.monthStart, m.monthEnd] },
            deleted_at: null,
          }
        }).catch(() => 0) || 0;

        const totalCount = await Restaurant.count({
          where: {
            created_at: { [Op.lt]: m.monthEnd },
            deleted_at: null,
          }
        }).catch(() => 0) || 0;

        growthData.push({
          // friendly month label and an ISO start date for frontend parsing
          month: m.monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
          startDate: toLocalDateString(m.monthStart),
          new_restaurants: newCount,
          total_restaurants: totalCount,
        })
      }
    } catch (err) {
      console.error('Growth data generation error:', err)
    }
    
    // Prepare response stats
    const stats = {
      total_restaurants: totalRestaurants || 0,
      active_restaurants: activeRestaurants || 0,
      pending_verification: pendingVerification || 0,
      restaurants_growth: Math.round(restaurantsGrowth * 10) / 10,
      total_users: totalUsers || 0,
      active_users: activeUsers || 0,
      users_growth: 5.2,
      total_orders: totalOrders || 0,
      completed_orders: totalCompletedOrders || 0,
      today_orders: todayOrders || 0,
      today_completed_orders: todayCompletedOrders || 0,
      orders_growth: 8.5,
      total_revenue: totalRevenue || 0,
      today_revenue: todayRevenue || 0,
      revenue_growth: 10.5,
      open_tickets: openTickets || 0,
      tickets_trend: -2.5,
      platform_health: 99.9,
      health_trend: 0.5,
    };
    
    // Build metrics object for frontend dashboard cards
    const metrics = {
      avgOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      avgOrderValueChange: 0,
      activeUsers: activeUsers || 0,
      activeUsersChange: 0,
      conversionRate: 0, // placeholder - requires events/visits data
      conversionRateChange: 0,
      retentionRate: 0, // placeholder - requires cohort data
      retentionRateChange: 0,
    }

    // 11. Build user role distribution for analytics (user distribution pie)
    let roleBreakdown = []
    try {
      const roles = ['platform_admin', 'restaurant_admin', 'restaurant_owner', 'waiter', 'chef', 'customer']
      const counts = await Promise.all(roles.map(r => User.count({ where: { role: r, deleted_at: null } }).catch(() => 0)))
      roleBreakdown = roles.map((r, i) => ({ name: r.replace('_', ' '), value: counts[i] || 0 }))
    } catch (err) {
      console.error('Role breakdown error:', err)
      roleBreakdown = []
    }

    // expose role breakdown under metrics for backward compatibility
    metrics.role_breakdown = roleBreakdown

    console.log('Dashboard stats calculated successfully');

    res.json(ApiResponse.success({
      stats,
      revenue_data: revenueData,
      growth_data: growthData,
      metrics,
      recent_restaurants: recentRestaurants,
      recent_orders: recentOrders,
      subscription_breakdown: subscriptionBreakdown,
      alerts: [],
    }, 'Platform dashboard data retrieved'));
    
  } catch (error) {
    console.error('Platform dashboard error:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback data on error
    res.status(200).json(ApiResponse.success({
      stats: {
        total_restaurants: 0,
        active_restaurants: 0,
        pending_verification: 0,
        restaurants_growth: 0,
        total_users: 0,
        active_users: 0,
        users_growth: 0,
        total_orders: 0,
        today_orders: 0,
        orders_growth: 0,
        total_revenue: 0,
        today_revenue: 0,
        revenue_growth: 0,
        open_tickets: 0,
        tickets_trend: 0,
        platform_health: 100,
        health_trend: 0,
      },
      revenue_data: [],
      recent_restaurants: [],
      recent_orders: [],
      subscription_breakdown: [
        { tier: 'basic', count: 0 },
        { tier: 'premium', count: 0 },
        { tier: 'enterprise', count: 0 },
      ],
      alerts: [{ message: 'Using fallback data', severity: 'info' }],
    }, 'Platform dashboard data retrieved (fallback)'));
  }
});

// Get restaurant owner dashboard
const getRestaurantDashboard = catchAsync(async (req, res) => {
  try {
    let restaurantId = req.user.restaurantId;

    const rawStartDate = req.query.startDate || req.query.start_date || null
    const rawEndDate = req.query.endDate || req.query.end_date || null
    const requestedStart = rawStartDate ? toLocalDay(rawStartDate, false) : null
    const requestedEnd = rawEndDate ? toLocalDay(rawEndDate, true) : null
    
    if (!restaurantId) {
      const staff = await RestaurantStaff.findOne({
        where: { user_id: req.user.id, is_active: true },
      });
      if (staff) {
        restaurantId = staff.restaurant_id;
      }
    }
    
    if (!restaurantId) {
      return res.json(ApiResponse.success({
        stats: {
          total_menu_items: 0,
          total_categories: 0,
          total_tables: 0,
          occupied_tables: 0,
          pending_orders: 0,
          today_orders: 0,
          today_revenue: 0,
        },
        recent_orders: [],
      }, 'No restaurant found'));
    }
    
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['id', 'name', 'logo_url', 'is_verified'],
    });
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const [totalMenuItems, totalCategories, totalTables, occupiedTables, pendingOrders, todayOrders, todayRevenue, completedToday] = await Promise.all([
      safeCount(MenuItem, { where: { restaurant_id: restaurantId, deleted_at: null } }),
      safeCount(MenuCategory, { where: { restaurant_id: restaurantId, is_active: true } }),
      safeCount(Table, { where: { restaurant_id: restaurantId } }),
      safeCount(Table, { where: { restaurant_id: restaurantId, status: 'occupied' } }),
      safeCount(Order, { where: { restaurant_id: restaurantId, status: 'pending' } }),
      safeCount(Order, { where: { restaurant_id: restaurantId, created_at: { [Op.gte]: todayStart } } }),
      safeSum(Order, 'total_amount', { where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.gte]: todayStart } } }),
      // Count completed orders for today
      safeCount(Order, { where: { restaurant_id: restaurantId, status: 'completed', created_at: { [Op.gte]: todayStart } } }),
    ]);

    const seriesStart = requestedStart || (() => { const d = new Date(); d.setDate(d.getDate() - 6); return toStartOfDay(d) })()
    const seriesEnd = requestedEnd || toEndOfDay(new Date())

    // Build daily revenue and order counts for the restaurant across the requested range
    const revenueData = [];
    for (let d = new Date(seriesStart); d <= seriesEnd; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d)
      dayStart.setHours(0, 0, 0, 0)
      const next = new Date(dayStart)
      next.setDate(next.getDate() + 1)

      let dailyRevenue = 0;
      let dailyOrders = 0;
      try {
        dailyRevenue = await Order.sum('total_amount', {
          where: {
            restaurant_id: restaurantId,
            status: 'completed',
            created_at: { [Op.between]: [dayStart, next] },
          },
        }) || 0;

        dailyOrders = await Order.count({
          where: {
            restaurant_id: restaurantId,
            status: 'completed',
            created_at: { [Op.between]: [dayStart, next] },
          },
        }) || 0;
      } catch (err) {
        console.error('Daily chart data error for restaurant:', err);
      }

      revenueData.push({ date: toLocalDateString(dayStart), revenue: dailyRevenue, orders: dailyOrders });
    }

    const todayKey = toLocalDateString(todayStart)
    let todayReservations = []
    try {
      todayReservations = await TableReservation.findAll({
        where: {
          restaurant_id: restaurantId,
          reservation_date: todayKey,
        },
        order: [['reservation_time', 'ASC']],
      })
    } catch (err) {
      console.error('Today reservations error:', err)
      todayReservations = []
    }

    let restaurantTables = []
    try {
      restaurantTables = await Table.findAll({
        where: { restaurant_id: restaurantId },
        attributes: ['id', 'table_number', 'status'],
      })
    } catch (err) {
      console.error('Restaurant tables error:', err)
      restaurantTables = []
    }

    let popularItems = []
    try {
      const popularRows = await getPopularItemsFromAnalytics(restaurantId, 5)
      popularItems = popularRows.map((row) => {
        const plain = typeof row?.get === 'function' ? row.get({ plain: true }) : row
        const item = plain.analytics_item || plain.MenuItem || {}
        return {
          id: plain.menu_item_id || item.id,
          name: item.name || item.title || 'Menu Item',
          category: item.category_name || item.category || 'Uncategorized',
          image: item.image_url || item.image || item.thumbnail_url || null,
          orders: Number(plain.total_orders ?? plain.total_quantity ?? 0),
          revenue: Number(plain.total_revenue ?? 0),
        }
      }).filter((item) => item.id)
    } catch (err) {
      console.error('Popular items error:', err)
      popularItems = []
    }

    const tableCount = restaurantTables.length || 0
    const todaySchedule = {
      totalReservations: todayReservations.length,
      availableTables: restaurantTables.filter((table) => table.status === 'available').length,
      occupiedTables: restaurantTables.filter((table) => table.status === 'occupied').length,
      reservedTables: restaurantTables.filter((table) => table.status === 'reserved').length,
      slots: [
        '11:00 AM',
        '12:00 PM',
        '1:00 PM',
        '2:00 PM',
        '6:00 PM',
        '7:00 PM',
        '8:00 PM',
        '9:00 PM',
      ].map((time) => {
        const slotReservations = todayReservations.filter((reservation) => reservation.reservation_time === time)
        const reservedCount = slotReservations.length
        const reservedTables = slotReservations.filter((reservation) => ['confirmed', 'seated'].includes(reservation.status)).length
        return {
          time,
          reservations: reservedCount,
          available: Math.max(tableCount - reservedTables, 0),
        }
      }),
      reservations: todayReservations.map((reservation) => ({
        id: reservation.id,
        customerName: reservation.customer_name,
        tableNumber: reservation.table_number,
        partySize: reservation.party_size,
        time: reservation.reservation_time,
        status: reservation.status,
      })),
    }
    
    res.json(ApiResponse.success({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        logo_url: restaurant.logo_url,
        is_verified: restaurant.is_verified,
      },
      stats: {
        total_menu_items: totalMenuItems,
        total_categories: totalCategories,
        total_tables: totalTables,
        occupied_tables: occupiedTables,
        pending_orders: pendingOrders,
        today_orders: todayOrders,
        today_revenue: todayRevenue || 0,
        completed_today: completedToday || 0,
      },
      revenue_data: revenueData,
      popular_items: popularItems,
      today_schedule: todaySchedule,
      recent_orders: [],
    }, 'Restaurant dashboard data retrieved'));
  } catch (error) {
    console.error('Restaurant dashboard error:', error);
    res.status(500).json(ApiResponse.error('Failed to load dashboard', error.message));
  }
});

// Get waiter dashboard
const getWaiterDashboard = catchAsync(async (req, res) => {
  try {
    const { Order, Table, WaiterTip } = require('../models');
    const { Op } = require('sequelize');

    const waiterId = req.waiterId || req.waiter?.id;

    // Active orders assigned to this waiter (not completed/cancelled/rejected)
    const activeOrders = await Order.findAll({
      where: {
        waiter_id: waiterId,
        status: { [Op.notIn]: ['completed', 'cancelled', 'rejected'] },
      },
      order: [['created_at', 'DESC']],
      limit: 50,
    }).catch(() => []);

    // Completed orders today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completedToday = await Order.count({
      where: {
        waiter_id: waiterId,
        status: 'completed',
        created_at: { [Op.gte]: todayStart },
      },
    }).catch(() => 0);

    // Total orders served by waiter
    const totalServed = await Order.count({
      where: {
        waiter_id: waiterId,
        status: 'completed',
      },
    }).catch(() => 0);

    // Total tips (from waiter_tips table)
    const totalTips = await WaiterTip.sum('amount', { where: { waiter_id: waiterId } }).catch(() => 0) || 0;

    // Assigned tables (current_waiter_id on Table)
    const assignedTables = await Table.findAll({ where: { current_waiter_id: waiterId } }).catch(() => []);
    const assignedTableIds = assignedTables.map(t => t.id).filter(Boolean);

    // Pending verification: orders with status 'pending' assigned to this waiter or on their tables
    const pendingVerification = await Order.count({
      where: {
        status: 'pending',
        [Op.or]: [{ waiter_id: waiterId }, ...(assignedTableIds.length ? [{ table_id: { [Op.in]: assignedTableIds } }] : [])],
      },
    }).catch(() => 0);

    // Rejected orders today
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const rejectedToday = await Order.count({
      where: {
        waiter_id: waiterId,
        status: 'rejected',
        created_at: { [Op.between]: [todayStart, todayEnd] },
      },
    }).catch(() => 0);

    res.json(ApiResponse.success({
      stats: {
        active_orders: activeOrders.length,
        completed_orders_today: completedToday || 0,
        pending_verification: pendingVerification || 0,
        rejected_today: rejectedToday || 0,
        total_orders_served: totalServed || 0,
        total_tips: parseFloat(totalTips) || 0,
      },
      active_orders: activeOrders,
      assigned_tables: assignedTables,
    }, 'Waiter dashboard data retrieved'));
  } catch (error) {
    console.error('Waiter dashboard error:', error);
    res.status(500).json(ApiResponse.error('Failed to load waiter dashboard', error.message));
  }
});

// Get customer dashboard
const getCustomerDashboard = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const recentOrders = await Order.findAll({
    where: { user_id: userId },
    limit: 10,
    order: [['created_at', 'DESC']],
  }).catch(() => []);
  
  res.json(ApiResponse.success({
    stats: {
      total_orders: recentOrders.length,
      total_spent: recentOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
    },
    recent_orders: recentOrders,
  }, 'Customer dashboard retrieved'));
});

module.exports = {
  getRestaurantDashboard,
  getPlatformDashboard,
  getWaiterDashboard,
  getCustomerDashboard,
};
