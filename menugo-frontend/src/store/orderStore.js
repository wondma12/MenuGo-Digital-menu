import { create } from 'zustand'
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrderStatus,
  cancelOrder,
  verifyOrder,
  rejectOrder
} from '../services/orderService'

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  stats: null,
  isLoading: false,
  error: null,
  total: 0,

  fetchOrders: async (restaurantId, params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getOrders(restaurantId, params)
      set({ orders: response.orders, stats: response.stats, total: response.total, isLoading: false })
      return response
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchOrderDetails: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const order = await getOrder(id)
      set({ currentOrder: order, isLoading: false })
      return order
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  createOrder: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const order = await createOrder(data)
      set(state => ({ 
        orders: [order, ...state.orders], 
        total: state.total + 1,
        isLoading: false 
      }))
      return order
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateStatus: async (id, status) => {
    set({ isLoading: true, error: null })
    try {
      const order = await updateOrderStatus(id, status)
      set(state => ({
        orders: state.orders.map(o => o.id === id ? order : o),
        currentOrder: state.currentOrder?.id === id ? order : state.currentOrder,
        isLoading: false
      }))
      return order
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  cancelOrder: async (id, reason) => {
    set({ isLoading: true, error: null })
    try {
      const order = await cancelOrder(id, reason)
      set(state => ({
        orders: state.orders.map(o => o.id === id ? order : o),
        currentOrder: state.currentOrder?.id === id ? order : state.currentOrder,
        isLoading: false
      }))
      return order
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  verifyOrder: async (id, method, code) => {
    set({ isLoading: true, error: null })
    try {
      const order = await verifyOrder(id, method, code)
      set(state => ({
        orders: state.orders.map(o => o.id === id ? order : o),
        currentOrder: state.currentOrder?.id === id ? order : state.currentOrder,
        isLoading: false
      }))
      return order
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  rejectOrder: async (id, reason, notes) => {
    set({ isLoading: true, error: null })
    try {
      const order = await rejectOrder(id, reason, notes)
      set(state => ({
        orders: state.orders.map(o => o.id === id ? order : o),
        currentOrder: state.currentOrder?.id === id ? order : state.currentOrder,
        isLoading: false
      }))
      return order
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
  clearError: () => set({ error: null }),
}))

export { useOrderStore }