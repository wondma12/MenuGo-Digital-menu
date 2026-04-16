// src/services/analyticsService.js
import api from './api';

export const getRestaurantAnalytics = async (restaurantId, dateRange) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/analytics`, { 
      params: {
        startDate: dateRange?.start?.toISOString(),
        endDate: dateRange?.end?.toISOString(),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching restaurant analytics:', error);
    return {};
  }
};

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
      
      return {
        totalRestaurants: stats.total_restaurants || 0,
        activeRestaurants: stats.active_restaurants || 0,
        pendingVerification: stats.pending_verification || 0,
        restaurantsGrowth: stats.restaurants_growth || 0,
        totalUsers: stats.total_users || 0,
        activeUsers: stats.active_users || 0,
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