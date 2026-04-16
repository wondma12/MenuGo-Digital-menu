import { useQuery } from 'react-query'
import {
  getRestaurantAnalytics,
  getSalesReport,
  getOrderReport,
  getMenuPerformance,
  getCustomerReport,
  getPlatformAnalytics,
  getRevenueAnalytics,
  getUserAnalytics,
} from '../services/analyticsService'

export const useRestaurantAnalytics = (restaurantId, dateRange) => {
  const { data, isLoading } = useQuery(
    ['restaurant-analytics', restaurantId, dateRange],
    () => getRestaurantAnalytics(restaurantId, dateRange),
    { enabled: !!restaurantId }
  )

  return { analytics: data, isLoading }
}

export const useSalesReport = (restaurantId, dateRange, filters) => {
  const { data, isLoading } = useQuery(
    ['sales-report', restaurantId, dateRange, filters],
    () => getSalesReport(restaurantId, dateRange, filters),
    { enabled: !!restaurantId }
  )

  return { report: data, isLoading }
}

export const useOrderReport = (restaurantId, dateRange) => {
  const { data, isLoading } = useQuery(
    ['order-report', restaurantId, dateRange],
    () => getOrderReport(restaurantId, dateRange),
    { enabled: !!restaurantId }
  )

  return { report: data, isLoading }
}

export const useMenuPerformance = (restaurantId, dateRange) => {
  const { data, isLoading } = useQuery(
    ['menu-performance', restaurantId, dateRange],
    () => getMenuPerformance(restaurantId, dateRange),
    { enabled: !!restaurantId }
  )

  return { performance: data, isLoading }
}

export const useCustomerReport = (restaurantId, dateRange) => {
  const { data, isLoading } = useQuery(
    ['customer-report', restaurantId, dateRange],
    () => getCustomerReport(restaurantId, dateRange),
    { enabled: !!restaurantId }
  )

  return { report: data, isLoading }
}

export const usePlatformAnalytics = (dateRange) => {
  const { data, isLoading } = useQuery(
    ['platform-analytics', dateRange],
    () => getPlatformAnalytics(dateRange)
  )

  return { analytics: data, isLoading }
}

export default useAnalytics