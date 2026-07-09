import { create } from 'zustand'
import { 
  getRestaurants, 
  getRestaurantDetails, 
  updateRestaurant,
  updateRestaurantSettings 
} from '../services/restaurantService'

const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  currentRestaurant: null,
  // Legacy/consumer-friendly alias expected by layouts/components
  restaurant: null,
  isLoading: false,
  error: null,

  fetchRestaurants: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getRestaurants(params)
      set({ restaurants: response.restaurants, isLoading: false, total: response.total })
      return response
    } catch (error) {
      // Silently ignore auth-missing errors (user not logged in yet)
      if (error?.isAuthMissing) {
        set({ isLoading: false })
        return { restaurants: [], total: 0, active: 0, pending: 0, premium: 0, page: 1, totalPages: 1 }
      }
      // Silently ignore server errors (5xx errors - backend not ready or issues)
      const statusCode = error?.response?.status
      if (statusCode >= 500) {
        set({ isLoading: false })
        return { restaurants: [], total: 0, active: 0, pending: 0, premium: 0, page: 1, totalPages: 1 }
      }
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchRestaurantDetails: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const restaurant = await getRestaurantDetails(id)
      // keep both names in sync for consumers using either key
      set({ currentRestaurant: restaurant, restaurant: restaurant, isLoading: false })
      return restaurant
    } catch (error) {
      // Silently ignore auth-missing errors (user not logged in yet)
      if (error?.isAuthMissing) {
        set({ isLoading: false })
        return null
      }
      // Silently ignore server errors (5xx errors - backend not ready or issues)
      const statusCode = error?.response?.status
      if (statusCode >= 500) {
        set({ isLoading: false })
        return null
      }
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  // Alias to support components expecting fetchRestaurant
  fetchRestaurant: async (id) => {
    return get().fetchRestaurantDetails(id)
  },

  updateRestaurant: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const restaurant = await updateRestaurant(id, data)
      set({ currentRestaurant: restaurant, restaurant: restaurant, isLoading: false })
      return restaurant
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateSettings: async (id, settings) => {
    set({ isLoading: true, error: null })
    try {
      const restaurant = await updateRestaurantSettings(id, settings)
      set({ currentRestaurant: restaurant, restaurant: restaurant, isLoading: false })
      return restaurant
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  clearCurrentRestaurant: () => set({ currentRestaurant: null, restaurant: null }),
  clearRestaurant: () => set({ restaurant: null, currentRestaurant: null }),
  clearError: () => set({ error: null }),
}))

export { useRestaurantStore }