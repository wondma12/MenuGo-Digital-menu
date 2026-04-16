import { create } from 'zustand'
import { 
  getReservations, 
  createReservation, 
  updateReservation, 
  deleteReservation,
  updateReservationStatus,
  seatReservation
} from '../services/reservationService'

const useReservationStore = create((set, get) => ({
  reservations: [],
  currentReservation: null,
  isLoading: false,
  error: null,
  total: 0,

  fetchReservations: async (restaurantId, params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getReservations(restaurantId, params)
      set({ reservations: response.reservations, total: response.total, isLoading: false })
      return response
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  createReservation: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const reservation = await createReservation(data)
      set(state => ({ 
        reservations: [...state.reservations, reservation], 
        total: state.total + 1,
        isLoading: false 
      }))
      return reservation
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateReservation: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const reservation = await updateReservation(id, data)
      set(state => ({
        reservations: state.reservations.map(r => r.id === id ? reservation : r),
        currentReservation: state.currentReservation?.id === id ? reservation : state.currentReservation,
        isLoading: false
      }))
      return reservation
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  deleteReservation: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await deleteReservation(id)
      set(state => ({
        reservations: state.reservations.filter(r => r.id !== id),
        total: state.total - 1,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateStatus: async (id, status) => {
    set({ isLoading: true, error: null })
    try {
      const reservation = await updateReservationStatus(id, status)
      set(state => ({
        reservations: state.reservations.map(r => r.id === id ? reservation : r),
        isLoading: false
      }))
      return reservation
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  seatReservation: async (reservationId, tableId, notes) => {
    set({ isLoading: true, error: null })
    try {
      const reservation = await seatReservation(reservationId, tableId, notes)
      set(state => ({
        reservations: state.reservations.map(r => r.id === reservationId ? reservation : r),
        isLoading: false
      }))
      return reservation
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  clearCurrentReservation: () => set({ currentReservation: null }),
  clearError: () => set({ error: null }),
}))

export { useReservationStore }