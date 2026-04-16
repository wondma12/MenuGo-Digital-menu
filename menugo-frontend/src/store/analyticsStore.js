import { create } from 'zustand'
import { 
  getRestaurantAnalytics, 
  getSalesReport, 
  getOrderReport,
  getMenuPerformance,
  getCustomerReport
} from '../services/analyticsService'

const useAnalyticsStore = create((set, get) => ({
  analytics: null,
  salesReport: null,
  orderReport: null,
  menuPerformance: null,
  customerReport: null,
  isLoading: false,
  error: null,

  fetchRestaurantAnalytics: async (restaurantId, dateRange) => {
    set({ isLoading: true, error: null })
    try {
      const analytics = await getRestaurantAnalytics(restaurantId, dateRange)
      set({ analytics, isLoading: false })
      return analytics
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchSalesReport: async (restaurantId, dateRange, filters) => {
    set({ isLoading: true, error: null })
    try {
      const report = await getSalesReport(restaurantId, dateRange, filters)
      set({ salesReport: report, isLoading: false })
      return report
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchOrderReport: async (restaurantId, dateRange) => {
    set({ isLoading: true, error: null })
    try {
      const report = await getOrderReport(restaurantId, dateRange)
      set({ orderReport: report, isLoading: false })
      return report
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchMenuPerformance: async (restaurantId, dateRange) => {
    set({ isLoading: true, error: null })
    try {
      const performance = await getMenuPerformance(restaurantId, dateRange)
      set({ menuPerformance: performance, isLoading: false })
      return performance
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchCustomerReport: async (restaurantId, dateRange) => {
    set({ isLoading: true, error: null })
    try {
      const report = await getCustomerReport(restaurantId, dateRange)
      set({ customerReport: report, isLoading: false })
      return report
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))

export { useAnalyticsStore }