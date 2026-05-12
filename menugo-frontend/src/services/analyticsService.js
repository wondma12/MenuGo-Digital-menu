// src/services/analyticsService.js
import api from './api';

export const getRestaurantAnalytics = async (restaurantId, dateRange) => {
  if (!restaurantId) return {}
  const params = {
    start_date: dateRange?.start ? dateRange.start.toISOString() : undefined,
    end_date: dateRange?.end ? dateRange.end.toISOString() : undefined,
  }

  try {
    const [revenueResp, salesResp, menuResp, hourlyResp, customerResp] = await Promise.all([
      api.get(`/analytics/revenue/${restaurantId}`, { params }),
      api.get(`/analytics/sales/${restaurantId}`, { params }),
      api.get(`/analytics/menu/${restaurantId}`, { params }),
      api.get(`/analytics/hourly/${restaurantId}`, { params: { date: params.start_date } }),
      api.get(`/analytics/customers/${restaurantId}`, { params }),
    ])

    const revenue = revenueResp?.data?.data || revenueResp?.data || {}
    const sales = salesResp?.data?.data || salesResp?.data || {}
    const menu = menuResp?.data?.data || menuResp?.data || {}
    const hourly = hourlyResp?.data?.data || hourlyResp?.data || {}
    const customers = customerResp?.data?.data || customerResp?.data || {}

    // Map backend fields to frontend shape
    const totalRevenue = revenue.total_revenue || 0
    const revenueChange = revenue.revenue_growth || 0
    const revenueData = (revenue.revenue_data || []).map(d => ({ date: d.date || d.period || d.period, revenue: Number(d.revenue || d.total_revenue || 0) }))

    const totalOrders = sales?.summary?.dataValues?.total_orders || sales?.summary?.total_orders || 0
    const ordersData = (sales.data || []).map(s => ({ date: s.date, orders: s.total_orders || s.orders || 0 }))
    const ordersChange = sales?.summary?.dataValues?.orders_change || sales?.summary?.orders_change || 0

    const avgOrderValue = sales?.summary?.dataValues?.avg_order_value || sales?.summary?.avg_order_value || 0
    const avgOrderChange = 0

    const orderTypeDistribution = (menu?.category_performance || []).map((c, i) => ({ name: c.category_id || c.name || `Category ${i+1}`, value: Number(c.total_sales || c.item_count || 0) }))

    const peakHours = (hourly?.peak_hours || []).map(h => ({ hour: h.hour || h.dataValues?.hour, orders: h.avg_orders || h.orders || 0 }))

    const topCategories = (menu?.category_performance || []).map((c, i) => ({ name: c.category_id || c.category || `Category ${i+1}`, orders: Number(c.total_sales || 0), percentage: 0 }))

    const paymentMethods = []

    // Also include legacy keys expected by various dashboard components
    const popularItems = (menu.top_items || []).map(item => ({
      id: item.menu_item_id || item.analytics_item?.id || item.id,
      name: item.analytics_item?.name || item.name || item.analytics_item?.title,
      image: item.analytics_item?.image || item.analytics_item?.thumbnail || null,
      orders: Number(item.total_orders || item.total_orders || 0),
      revenue: Number(item.total_revenue || item.revenue || 0),
    }))

    const revenueByType = [
      { name: 'Dine-in', value: revenue.dine_in_percentage || 0 },
      { name: 'Takeaway', value: revenue.takeaway_percentage || 0 },
      { name: 'Delivery', value: revenue.delivery_percentage || 0 },
    ]

    const hourlyData = hourly.hourly_data || hourly.hourlyData || []

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      avgOrderValue,
      avgOrderChange,
      avgRating: customers?.avg_rating || 0,
      ratingChange: 0,
      revenueData,
      ordersData,
      orderTypeDistribution,
      peakHours,
      topCategories,
      paymentMethods,
      // legacy/alternate keys
      popularItems,
      revenueByType,
      hourlyData,
    }
  } catch (error) {
    console.error('Error fetching restaurant analytics:', error)
    return {}
  }
}

export const getSalesReport = async (restaurantId, dateRange, filters) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/reports/sales`, {
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
        ...filters,
      },
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching sales report:', error);
    return {};
  }
};

export const getOrderReport = async (restaurantId, dateRange) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/reports/orders`, { 
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching order report:', error);
    return {};
  }
};

export const getMenuPerformance = async (restaurantId, dateRange) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/reports/menu`, { 
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching menu performance:', error);
    return {};
  }
};

export const getCustomerReport = async (restaurantId, dateRange) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/reports/customers`, { 
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching customer report:', error);
    return {};
  }
};

export const getPlatformAnalytics = async (dateRange) => {
  try {
    const response = await api.get('/platform/analytics', { 
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    return {};
  }
};

export const getRevenueAnalytics = async (dateRange) => {
  try {
    const response = await api.get('/platform/analytics/revenue', { 
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return {};
  }
};

export const getUserAnalytics = async (dateRange) => {
  try {
    const response = await api.get('/platform/analytics/users', { 
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return {};
  }
};

// MAIN DASHBOARD API - FIXED VERSION
export const getPlatformDashboardData = async (dateRange) => {
  try {
    console.log('Calling dashboard API...');
    
    const response = await api.get('/dashboard/platform', {
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    
    console.log('Dashboard API response status:', response.status);
    
    // Handle successful response
    if (response.data && response.data.success !== false) {
      const payload = response.data.data || response.data;
      const stats = payload.stats || {};

      // Fetch admin-only user summary (platform_admin + restaurant_admin)
      // and prefer its active count for the dashboard Active Users metric.
      let adminActiveUsers = null;
      try {
        const adminResp = await api.get('/users', {
          params: { role: 'platform_admin,restaurant_admin', page: 1, limit: 1 }
        });
        const adminPayload = adminResp.data?.data || adminResp.data || {};
        adminActiveUsers = adminPayload?.active ?? adminPayload?.activeUsers ?? null;
      } catch (err) {
        console.warn('Failed to fetch admin users summary:', err?.message || err);
        adminActiveUsers = null;
      }

      return {
        totalRestaurants: stats.total_restaurants || 0,
        activeRestaurants: stats.active_restaurants || 0,
        pendingVerification: stats.pending_verification || 0,
        restaurantsGrowth: stats.restaurants_growth || 0,
        totalUsers: stats.total_users || 0,
        // Prefer admin-only active user count when available
        activeUsers: adminActiveUsers !== null ? adminActiveUsers : (stats.active_users || 0),
        usersGrowth: stats.users_growth || 0,
        totalOrders: stats.total_orders || 0,
        todayOrders: stats.today_orders || 0,
        ordersGrowth: stats.orders_growth || 0,
        totalRevenue: stats.total_revenue || 0,
        todayRevenue: stats.today_revenue || 0,
        revenueGrowth: stats.revenue_growth || 0,
        openTickets: stats.open_tickets || 0,
        ticketsTrend: stats.tickets_trend || 0,
        platformHealth: stats.platform_health || 100,
        healthTrend: stats.health_trend || 0,
        revenueData: payload.revenue_data || [],
        growthData: payload.growth_data || [],
        metrics: payload.metrics || {},
        systemHealth: payload.system_health || {},
        recentRestaurants: payload.recent_restaurants || [],
        recentOrders: payload.recent_orders || [],
        subscriptionBreakdown: payload.subscription_breakdown || [],
        alerts: payload.alerts || [],
      };
    } else {
      console.warn('API returned error:', response.data?.message);
      return getDefaultDashboardData();
    }
  } catch (error) {
    console.error('Dashboard API error:', error.message);
    console.error('Error details:', error.response?.data);
    return getDefaultDashboardData();
  }
};

function getDefaultDashboardData() {
  return {
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingVerification: 0,
    restaurantsGrowth: 0,
    totalUsers: 0,
    activeUsers: 0,
    usersGrowth: 0,
    totalOrders: 0,
    todayOrders: 0,
    ordersGrowth: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    revenueGrowth: 0,
    openTickets: 0,
    ticketsTrend: 0,
    platformHealth: 100,
    healthTrend: 0,
    revenueData: [],
    growthData: [],
    metrics: {},
    systemHealth: {},
    recentRestaurants: [],
    recentOrders: [],
    subscriptionBreakdown: [
      { tier: 'basic', count: 0 },
      { tier: 'premium', count: 0 },
      { tier: 'enterprise', count: 0 },
    ],
    alerts: [{ message: 'Unable to load dashboard data', severity: 'info' }],
  };
}

// Restaurant Dashboard Data
export const getRestaurantDashboardData = async (restaurantId, dateRange) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/dashboard`, {
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    
    const payload = response?.data?.data || response?.data || {};
    
    return {
      todayOrders: payload.today_orders || 0,
      todayRevenue: payload.today_revenue || 0,
      ordersChange: payload.orders_change || 0,
      revenueChange: payload.revenue_change || 0,
      activeCustomers: payload.active_customers || 0,
      customersChange: payload.customers_change || 0,
      avgRating: payload.avg_rating || 0,
      ratingChange: payload.rating_change || 0,
      revenueData: payload.revenue_data || [],
      ordersData: payload.orders_data || [],
      popularItems: payload.popular_items || [],
      lowStockItems: payload.low_stock_items || [],
      recentOrders: payload.recent_orders || [],
      todaySchedule: payload.today_schedule || {},
      customerInsights: payload.customer_insights || {},
    };
  } catch (error) {
    console.error('Error fetching restaurant dashboard:', error);
    return {
      todayOrders: 0,
      todayRevenue: 0,
      ordersChange: 0,
      revenueChange: 0,
      activeCustomers: 0,
      customersChange: 0,
      avgRating: 0,
      ratingChange: 0,
      revenueData: [],
      ordersData: [],
      popularItems: [],
      lowStockItems: [],
      recentOrders: [],
      todaySchedule: {},
      customerInsights: {},
    };
  }
};

// Export reports
export const exportReport = async (restaurantId, reportType, dateRange, format = 'excel') => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/reports/export`, {
      params: {
        type: reportType,
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
        format,
      },
      responseType: format === 'excel' ? 'blob' : 'json',
    });
    
    if (format === 'excel') {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    }
    
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error exporting report:', error);
    return { success: false, error: error.message };
  }
};