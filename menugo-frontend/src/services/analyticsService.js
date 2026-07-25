// src/services/analyticsService.js
import api from './api';
import { useAuthStore } from '../store/authStore'

const toLocalDateString = (value) => {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getRestaurantAnalytics = async (restaurantId, dateRange) => {
  if (!restaurantId) return {}
  // Ensure we have an auth token; if not, try refresh-token flow automatically
  const token = useAuthStore.getState().token || sessionStorage.getItem('token')
  const refreshToken = useAuthStore.getState().refreshToken || sessionStorage.getItem('refreshToken')

  if (!token && refreshToken) {
    try {
      const refreshResp = await api.post('/auth/refresh-token', { refreshToken })
      const newToken = refreshResp?.data?.data?.token || refreshResp?.data?.token
      const newRefresh = refreshResp?.data?.data?.refreshToken || refreshResp?.data?.refreshToken
      if (newToken) {
        useAuthStore.setState({ token: newToken, refreshToken: newRefresh, isAuthenticated: true })
        try { sessionStorage.setItem('token', newToken) } catch (e) { /* ignore */ }
        if (newRefresh) try { sessionStorage.setItem('refreshToken', newRefresh) } catch (e) { /* ignore */ }
      } else {
        throw new Error('no_token')
      }
    } catch (e) {
      console.warn('Automatic token refresh failed:', e?.message || e)
      // Signal caller to prompt for login
      throw new Error('auth_required')
    }
  }
  const params = {
    start_date: toLocalDateString(dateRange?.start),
    end_date: toLocalDateString(dateRange?.end),
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

    // Map backend fields to frontend shape (coerce nulls/strings into numbers and derive fallbacks)
    let totalRevenue = Number(revenue.total_revenue ?? 0)
    let revenueChange = Number(revenue.revenue_growth ?? 0)
    let revenueData = (revenue.revenue_data || []).map(d => ({ date: d.date || d.period || d.period, revenue: Number(d.revenue ?? d.total_revenue ?? d.amount ?? 0) }))
    // If revenueData empty, try to derive from sales data (fallback)
    if ((!revenueData || revenueData.length === 0) && Array.isArray(sales.data) && sales.data.length > 0) {
      const derived = sales.data.map(s => ({ date: s.date || s.period, revenue: Number(s.total_revenue ?? s.revenue ?? 0) }))
      if (derived.length) revenueData.push(...derived)
    }

    let totalOrders = Number(
      sales?.summary?.dataValues?.completed_orders
      ?? sales?.summary?.completed_orders
      ?? sales?.summary?.dataValues?.total_orders
      ?? sales?.summary?.total_orders
      ?? 0
    )
    let ordersData = (sales.data || []).map(s => ({ date: s.date || s.period, orders: Number(s.total_orders ?? s.orders ?? 0) }))
    // Derive totalOrders from ordersData when summary is null
    if ((!totalOrders || totalOrders === 0) && ordersData.length) {
      totalOrders = ordersData.reduce((sum, x) => sum + (Number(x.orders) || 0), 0)
    }
    const ordersChange = Number(sales?.summary?.dataValues?.orders_change ?? sales?.summary?.orders_change ?? 0)

    let avgOrderValue = Number(sales?.summary?.dataValues?.avg_order_value ?? sales?.summary?.avg_order_value ?? 0)
    if ((!avgOrderValue || avgOrderValue === 0) && totalOrders > 0) {
      avgOrderValue = totalRevenue / totalOrders
    }
    const avgOrderChange = 0

    // Prefer explicit order type distribution when provided by the API (order_type_distribution)
    let orderTypeDistribution = []
    const rawOrderTypes = revenue.order_type_distribution || sales.order_type_distribution || menu.order_type_distribution || menu?.category_performance || revenue.revenue_by_type || []
    if (Array.isArray(rawOrderTypes) && rawOrderTypes.length > 0) {
      orderTypeDistribution = rawOrderTypes.map((r, i) => ({
        name: r.name || r.type || r.label || (r.category_id || `Type ${i+1}`),
        value: Number(r.value ?? r.count ?? r.percentage ?? r.orders ?? r.total_sales ?? r.item_count ?? 0),
      }))
    }

    let peakHours = (hourly?.peak_hours || []).map(h => ({ hour: h.hour ?? h.dataValues?.hour ?? h.label, orders: Number(h.avg_orders ?? h.orders ?? h.count ?? 0) }))

    let topCategories = (menu?.category_performance || []).map((c, i) => ({ name: c.category_id || c.category || c.name || `Category ${i+1}`, orders: Number(c.total_sales ?? c.item_count ?? 0), percentage: 0 }))

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

    let hourlyData = (hourly.hourly_data || hourly.hourlyData || []).map(h => ({ hour: h.hour || h.label || h.time, orders: Number(h.orders || h.avg_orders || h.count || 0) }))

    // Track whether we applied any fallback so the UI can surface a banner
    let usedFallback = false
    let fallbackSource = null

    const initialState = {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      revenueDataLen: (revenueData || []).length,
    }

    // If user requested a date range but the API returned empty metrics, attempt fallback to lifetime/all-time analytics
    if ((dateRange?.start || dateRange?.end) && totalRevenue === 0 && (!revenueData || revenueData.length === 0) && (!totalOrders || totalOrders === 0)) {
      try {
        const [revAllResp, salesAllResp, menuAllResp, hourlyAllResp, custAllResp] = await Promise.all([
          api.get(`/analytics/revenue/${restaurantId}`),
          api.get(`/analytics/sales/${restaurantId}`),
          api.get(`/analytics/menu/${restaurantId}`),
          api.get(`/analytics/hourly/${restaurantId}`),
          api.get(`/analytics/customers/${restaurantId}`),
        ])

        const revAll = revAllResp?.data?.data || revAllResp?.data || {}
        const salesAll = salesAllResp?.data?.data || salesAllResp?.data || {}
        const menuAll = menuAllResp?.data?.data || menuAllResp?.data || {}
        const hourlyAll = hourlyAllResp?.data?.data || hourlyAllResp?.data || {}
        const custAll = custAllResp?.data?.data || custAllResp?.data || {}

        if ((!totalRevenue || totalRevenue === 0) && Number(revAll.total_revenue || 0) > 0) {
          totalRevenue = Number(revAll.total_revenue || 0)
          revenueChange = Number(revAll.revenue_growth || revenueChange || 0)
        }

        if ((!revenueData || revenueData.length === 0) && Array.isArray(revAll.revenue_data) && revAll.revenue_data.length > 0) {
          revenueData = revAll.revenue_data.map(d => ({ date: d.date || d.period, revenue: Number(d.revenue || d.total_revenue || 0) }))
        }

        if ((!totalOrders || totalOrders === 0) && (salesAll.summary?.dataValues?.completed_orders || salesAll.summary?.completed_orders || salesAll.summary?.dataValues?.total_orders || salesAll.summary?.total_orders)) {
          totalOrders = Number(salesAll.summary?.dataValues?.completed_orders ?? salesAll.summary?.completed_orders ?? salesAll.summary?.dataValues?.total_orders ?? salesAll.summary?.total_orders ?? 0)
        }

        if ((!ordersData || ordersData.length === 0) && Array.isArray(salesAll.data) && salesAll.data.length > 0) {
          ordersData = salesAll.data.map(s => ({ date: s.date || s.period, orders: Number(s.total_orders || s.orders || 0) }))
        }

        if ((!avgOrderValue || avgOrderValue === 0) && totalOrders > 0) {
          avgOrderValue = totalRevenue / totalOrders
        }

        if ((!orderTypeDistribution || orderTypeDistribution.length === 0) && Array.isArray(menuAll.category_performance)) {
          orderTypeDistribution = menuAll.category_performance.map((c, i) => ({ name: c.category_id || c.name || `Category ${i+1}`, value: Number(c.total_sales ?? c.item_count ?? 0) }))
        }

        if ((!topCategories || topCategories.length === 0) && Array.isArray(menuAll.category_performance)) {
          topCategories = menuAll.category_performance.map((c, i) => ({ name: c.category_id || c.name || `Category ${i+1}`, orders: Number(c.total_sales ?? c.item_count ?? 0), percentage: 0 }))
        }

        if ((!peakHours || peakHours.length === 0) && Array.isArray(hourlyAll.peak_hours)) {
          peakHours = hourlyAll.peak_hours.map(h => ({ hour: h.hour || h.label || h.time, orders: Number(h.avg_orders || h.orders || h.count || 0) }))
        }

        if ((!hourlyData || hourlyData.length === 0) && Array.isArray(hourlyAll.hourly_data)) {
          hourlyData = hourlyAll.hourly_data.map(h => ({ hour: h.hour || h.label || h.time, orders: Number(h.orders || h.avg_orders || h.count || 0) }))
        }

      } catch (e) {
        // ignore fallback errors
      }

      // mark fallback if we pulled non-empty all-time results
      if (Number(totalRevenue || 0) > (initialState.totalRevenue || 0) || Number(totalOrders || 0) > (initialState.totalOrders || 0) || (revenueData && revenueData.length > (initialState.revenueDataLen || 0))) {
        usedFallback = true
        fallbackSource = 'all_time'
      }
    }

    // Final fallback: fetch the restaurant dashboard summary (may contain totals even when analytics endpoints are empty)
    if ((totalRevenue === 0 || (!revenueData || revenueData.length === 0)) && (!totalOrders || totalOrders === 0)) {
      try {
        // Try primary dashboard endpoint
        let dash = {}
        try {
          const dashResp = await api.get(`/restaurants/${restaurantId}/dashboard`)
          dash = dashResp?.data?.data || dashResp?.data || {}
        } catch (err) {
          // try alternate dashboard endpoint used by backend logs
          try {
            const dashResp2 = await api.get('/dashboard/restaurant', { params: { restaurantId: restaurantId, startDate: params.start_date, endDate: params.end_date } })
            dash = dashResp2?.data?.data || dashResp2?.data || {}
          } catch (err2) {
            dash = {}
          }
        }

        // Prefer dashboard totals when analytics are empty
        if ((!totalRevenue || totalRevenue === 0) && (dash.today_revenue || dash.revenue || dash.total_revenue)) {
          totalRevenue = Number(dash.total_revenue ?? dash.today_revenue ?? dash.revenue ?? totalRevenue)
        }

        if ((!totalOrders || totalOrders === 0) && (dash.today_orders || dash.total_orders || dash.orders)) {
          totalOrders = Number(dash.total_orders ?? dash.today_orders ?? dash.orders ?? totalOrders)
        }

        if ((!avgOrderValue || avgOrderValue === 0) && dash.avg_order_value) {
          avgOrderValue = Number(dash.avg_order_value)
        }

        if ((!revenueData || revenueData.length === 0) && Array.isArray(dash.revenue_data)) {
          revenueData = dash.revenue_data.map(d => ({ date: d.date || d.period || d.period_start || d.period_end, revenue: Number(d.revenue || d.total_revenue || d.amount || d.value || 0) }))
        }

        if ((!ordersData || ordersData.length === 0) && Array.isArray(dash.orders_data)) {
          ordersData = dash.orders_data.map(o => ({ date: o.date || o.period || o.period_start || o.period_end, orders: Number(o.orders || o.total_orders || o.count || 0) }))
        }
        // mark dashboard fallback used
        if (Number(totalRevenue || 0) > (initialState.totalRevenue || 0) || Number(totalOrders || 0) > (initialState.totalOrders || 0) || (revenueData && revenueData.length > (initialState.revenueDataLen || 0))) {
          usedFallback = true
          fallbackSource = 'dashboard'
        }
      } catch (e) {
        // ignore
      }
    }

    // If avg rating still missing, try fetching reviews average
    // Final derivation: if totals are missing, try to compute them from returned series
    try {
      if ((!totalOrders || totalOrders === 0) && Array.isArray(ordersData) && ordersData.length > 0) {
        totalOrders = ordersData.reduce((sum, x) => sum + (Number(x.orders) || 0), 0)
      }

      if ((!totalRevenue || totalRevenue === 0) && Array.isArray(revenueData) && revenueData.length > 0) {
        totalRevenue = revenueData.reduce((sum, x) => sum + (Number(x.revenue) || 0), 0)
      }

      if ((!avgOrderValue || avgOrderValue === 0)) {
        if (totalOrders > 0 && totalRevenue > 0) {
          avgOrderValue = totalRevenue / totalOrders
        } else if (Array.isArray(revenueData) && Array.isArray(ordersData) && revenueData.length > 0 && ordersData.length > 0) {
          const revenueSum = revenueData.reduce((s, r) => s + (Number(r.revenue) || 0), 0)
          const ordersSum = ordersData.reduce((s, o) => s + (Number(o.orders) || 0), 0)
          if (ordersSum > 0) avgOrderValue = revenueSum / ordersSum
        }
      }
    } catch (e) {
      // ignore derivation errors
    }

    let avgRating = customers?.avg_rating || 0
    if ((!avgRating || avgRating === 0)) {
      try {
        const revResp = await api.get(`/reviews/restaurant/${restaurantId}`, { params: { page: 1, limit: 1 } })
        const revData = revResp?.data?.data || revResp?.data || {}
        avgRating = Number(revData?.average_rating ?? revData?.averageRating ?? revData?.average_rating ?? 0)
      } catch (e) {
        // ignore
      }
    }

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      avgOrderValue,
      avgOrderChange,
      avgRating: avgRating,
      ratingChange: customers?.rating_change || 0,
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
      usedFallback,
      fallbackSource,
    }
  } catch (error) {
    // If API returned 401, propagate a specific error so UI can prompt for login
    if (error?.response?.status === 401) {
      console.warn('Restaurant analytics request unauthorized')
      throw new Error('auth_required')
    }

    console.error('Error fetching restaurant analytics:', error)
    return {}
  }
}

export const getSalesReport = async (restaurantId, dateRange, filters) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/reports/sales`, {
      params: {
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
      }
    });
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return {};
  }
};

export const getPublicPlatformSummary = async () => {
  try {
    // Primary public summary endpoint
    const response = await api.get('/platform/public-summary');
    const data = response?.data?.data || response?.data || {};
    // If the endpoint returned useful fields, normalize and return
    if (data && (Object.keys(data).length > 0)) {
      return {
        active_users: data.active_users ?? data.activeUsers ?? data.total_users ?? data.users ?? data.team_members_enabled ?? data.activeUsersCount ?? null,
        active_restaurants: data.active_restaurants ?? data.activeRestaurants ?? data.restaurants_live ?? data.total_restaurants ?? data.restaurants ?? null,
        restaurants_live: data.restaurants_live ?? data.total_restaurants ?? data.restaurants ?? data.active_restaurants ?? null,
        team_members_enabled: data.team_members_enabled ?? data.teamMembersEnabled ?? data.total_users ?? null,
        orders_processed: data.orders_processed ?? data.completed_orders ?? data.total_orders ?? data.totalOrders ?? null,
        uptime: data.uptime ?? data.platform_uptime ?? null,
        support: data.support ?? null,
        // keep raw payload for any other UI uses
        _raw: data,
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('platform/public-summary not available:', error?.message || error)
  }

  // Fallbacks: try dashboard/platform then platform analytics or users list
  try {
    // Only attempt the protected dashboard endpoint when we have a token.
    // Avoid unauthenticated 401 requests from public summary probe.
    const token = useAuthStore.getState().token || (typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null)
    if (!token) throw new Error('no_token_for_protected_fallback')

    const dashResp = await api.get('/dashboard/platform');
    const payload = dashResp?.data?.data || dashResp?.data || {};
    const stats = payload?.stats || {};
    if (Object.keys(stats).length > 0) {
      return {
        active_users: stats.active_users ?? stats.activeUsers ?? stats.activeUsersCount ?? stats.active_users_count ?? payload.active_users ?? null,
        active_restaurants: stats.active_restaurants ?? stats.activeRestaurants ?? stats.active_restaurants_count ?? payload.active_restaurants ?? null,
        restaurants_live: stats.total_restaurants ?? stats.restaurants_live ?? payload.total_restaurants ?? null,
        orders_processed: stats.orders_processed ?? stats.completed_orders ?? stats.total_orders ?? stats.totalOrders ?? payload.total_orders ?? payload.orders ?? null,
        team_members_enabled: payload.team_members_enabled ?? payload.teamMembersEnabled ?? null,
        uptime: stats.platform_health ?? payload.platform_health ?? null,
        support: null,
        _raw: payload,
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn('dashboard/platform fallback failed:', err?.message || err)
  }

  // Try a lightweight users summary (may require auth); handle failures gracefully
  try {
    const usersResp = await api.get('/users', { params: { page: 1, limit: 1 } });
    const udata = usersResp?.data?.data || usersResp?.data || {};
    // Common shapes: { total: N } or { meta: { total: N } } or { total_users: N }
    const total = udata.total ?? udata.total_users ?? udata.totalUsers ?? udata.meta?.total ?? udata.count ?? null;
    if (total !== null && total !== undefined) {
      return {
        active_users: total,
        active_restaurants: null,
        restaurants_live: null,
        team_members_enabled: null,
        uptime: null,
        support: null,
        _raw: udata,
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn('users endpoint fallback failed:', err?.message || err)
  }

  // As a final fallback return empty summary so UI keeps defaults
  return {};
};

// MAIN DASHBOARD API - FIXED VERSION
export const getPlatformDashboardData = async (dateRange) => {
  try {
    if (import.meta.env.DEV) console.log('Calling dashboard API...');

    // Avoid calling protected dashboard when there is no auth token present.
    const token = useAuthStore.getState().token || (typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null)
    if (!token) {
      if (import.meta.env.DEV) console.debug('Skipping dashboard fetch: no token present')
      return getDefaultDashboardData()
    }

    const response = await api.get('/dashboard/platform', {
      params: {
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
      }
    });

    if (import.meta.env.DEV) console.log('Dashboard API response status:', response.status);

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
        completedOrders: stats.completed_orders || 0,
        todayOrders: stats.today_orders || 0,
        todayCompletedOrders: stats.today_completed_orders || 0,
        ordersGrowth: stats.orders_growth || 0,
        totalRevenue: stats.total_revenue || 0,
        todayRevenue: stats.today_revenue || 0,
        revenueGrowth: stats.revenue_growth || 0,
        openTickets: stats.open_tickets || 0,
        ticketsTrend: stats.tickets_trend || 0,
        platformHealth: stats.platform_health || 100,
        healthTrend: stats.health_trend || 0,
        revenueData: payload.revenue_data || [],
        // Normalize growth data to keys expected by the frontend charts
        growthData: (payload.growth_data || []).map(g => ({
          month: g.month || g.label || (g.startDate ? new Date(g.startDate).toLocaleString('default', { month: 'short', year: 'numeric' }) : ''),
          new: g.new_restaurants ?? g.new ?? g.newRestaurants ?? 0,
          total: g.total_restaurants ?? g.total ?? g.totalRestaurants ?? 0,
        })),
        metrics: payload.metrics || {},
          // Normalize user distribution from metrics.role_breakdown (dedupe, friendly names)
          userDistribution: (() => {
            const raw = payload.metrics?.role_breakdown || [];
            // normalize name (replace underscores, trim, capitalize words) and sum duplicates
            const map = {};
            raw.forEach(entry => {
              if (!entry) return;
              const rawName = (entry.name || '') + '';
              const cleaned = rawName.replace(/_/g, ' ').trim().split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
              const val = Number(entry.value || 0) || 0;
              if (!map[cleaned]) map[cleaned] = 0;
              map[cleaned] += val;
            });
            // convert to array and filter out zero values
            return Object.keys(map).map(k => ({ name: k, value: map[k] })).filter(e => e.value > 0);
          })(),
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
    // If unauthorized, quietly return defaults (public pages shouldn't need auth)
    if (error?.response?.status === 401) {
      if (import.meta.env.DEV) console.debug('Dashboard API unauthorized (401) — skipping dashboard fetch')
      return getDefaultDashboardData();
    }

    // For other errors, log in DEV only and return defaults
    if (import.meta.env.DEV) {
      console.error('Dashboard API error:', error.message);
      console.error('Error details:', error.response?.data);
    }
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
      { tier: 'monthly', count: 0 },
      { tier: 'six_month', count: 0 },
      { tier: 'yearly', count: 0 },
    ],
    alerts: [{ message: 'Unable to load dashboard data', severity: 'info' }],
  };
}

// Restaurant Dashboard Data
export const getRestaurantDashboardData = async (restaurantId, dateRange) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/dashboard`, {
      params: {
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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
      ordersData: Array.isArray(payload.orders_data) && payload.orders_data.length > 0
        ? payload.orders_data
        : (payload.revenue_data || []).map((item) => ({
            date: item.date || item.period || item.period_start || item.period_end || '',
            orders: Number(item.orders || item.total_orders || item.count || 0),
          })),
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
        startDate: toLocalDateString(dateRange?.start),
        endDate: toLocalDateString(dateRange?.end),
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