import { create } from 'zustand'
import { 
  getWaiters, 
  getWaiter, 
  createWaiter, 
  updateWaiter, 
  deleteWaiter,
  updateWaiterStatus,
  getWaiterSchedule,
  updateWaiterSchedule
} from '../services/waiterService'

const useWaiterStore = create((set, get) => ({
  waiters: [],
  currentWaiter: null,
  schedule: null,
  isLoading: false,
  error: null,
  total: 0,

  fetchWaiters: async (restaurantId, params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getWaiters(restaurantId, params)
      set({ waiters: response.waiters, total: response.total, isLoading: false })
      return response
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchWaiterDetails: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const waiter = await getWaiter(id)
      set({ currentWaiter: waiter, isLoading: false })
      return waiter
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchWaiterSchedule: async (id, dateRange) => {
    set({ isLoading: true, error: null })
    try {
      const schedule = await getWaiterSchedule(id, dateRange)
      set({ schedule, isLoading: false })
      return schedule
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  createWaiter: async (restaurantId, data) => {
    set({ isLoading: true, error: null })
    try {
      const waiter = await createWaiter(restaurantId, data)
      set(state => ({ 
        waiters: [...state.waiters, waiter], 
        total: state.total + 1,
        isLoading: false 
      }))
      return waiter
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateWaiter: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const waiter = await updateWaiter(id, data)
      set(state => ({
        waiters: state.waiters.map(w => w.id === id ? waiter : w),
        currentWaiter: state.currentWaiter?.id === id ? waiter : state.currentWaiter,
        isLoading: false
      }))
      return waiter
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  deleteWaiter: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await deleteWaiter(id)
      set(state => ({
        waiters: state.waiters.filter(w => w.id !== id),
        total: state.total - 1,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateStatus: async (id, isActive) => {
    set({ isLoading: true, error: null })
    try {
      const waiter = await updateWaiterStatus(id, isActive)
      set(state => ({
        waiters: state.waiters.map(w => w.id === id ? waiter : w),
        isLoading: false
      }))
      return waiter
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateSchedule: async (id, scheduleData) => {
    set({ isLoading: true, error: null })
    try {
      const schedule = await updateWaiterSchedule(id, scheduleData)
      set({ schedule, isLoading: false })
      return schedule
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  clearCurrentWaiter: () => set({ currentWaiter: null }),
  clearError: () => set({ error: null }),
}))

export { useWaiterStore }