import { create } from 'zustand'
import { 
  getMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  updateMenuItemAvailability 
} from '../services/menuService'

const useMenuStore = create((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  total: 0,

  fetchItems: async (restaurantId, params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getMenuItems(restaurantId, params)
      set({ items: response.items, total: response.total, isLoading: false })
      return response
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  createItem: async (restaurantId, data) => {
    set({ isLoading: true, error: null })
    try {
      const item = await createMenuItem(restaurantId, data)
      set(state => ({ 
        items: [item, ...state.items], 
        total: state.total + 1,
        isLoading: false 
      }))
      return item
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateItem: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const item = await updateMenuItem(id, data)
      set(state => ({
        items: state.items.map(i => i.id === id ? item : i),
        isLoading: false
      }))
      return item
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await deleteMenuItem(id)
      set(state => ({
        items: state.items.filter(i => i.id !== id),
        total: state.total - 1,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateAvailability: async (id, isAvailable) => {
    set({ isLoading: true, error: null })
    try {
      const item = await updateMenuItemAvailability(id, isAvailable)
      set(state => ({
        items: state.items.map(i => i.id === id ? item : i),
        isLoading: false
      }))
      return item
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))

export { useMenuStore }