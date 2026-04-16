import { create } from 'zustand'
import { 
  getTables, 
  getTable, 
  createTable, 
  updateTable, 
  deleteTable,
  updateTableStatus,
  assignTableToWaiter,
  transferTable
} from '../services/tableService'

const useTableStore = create((set, get) => ({
  tables: [],
  currentTable: null,
  isLoading: false,
  error: null,
  total: 0,

  fetchTables: async (restaurantId, params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getTables(restaurantId, params)
      set({ tables: response.tables, stats: response.stats, total: response.total, isLoading: false })
      return response
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchTableDetails: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const table = await getTable(id)
      set({ currentTable: table, isLoading: false })
      return table
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  createTable: async (restaurantId, data) => {
    set({ isLoading: true, error: null })
    try {
      const table = await createTable(restaurantId, data)
      set(state => ({ 
        tables: [...state.tables, table], 
        total: state.total + 1,
        isLoading: false 
      }))
      return table
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  updateTable: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const table = await updateTable(id, data)
      set(state => ({
        tables: state.tables.map(t => t.id === id ? table : t),
        currentTable: state.currentTable?.id === id ? table : state.currentTable,
        isLoading: false
      }))
      return table
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  deleteTable: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await deleteTable(id)
      set(state => ({
        tables: state.tables.filter(t => t.id !== id),
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
      const table = await updateTableStatus(id, status)
      set(state => ({
        tables: state.tables.map(t => t.id === id ? table : t),
        currentTable: state.currentTable?.id === id ? table : state.currentTable,
        isLoading: false
      }))
      return table
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  assignTable: async (tableId, waiterId, reason) => {
    set({ isLoading: true, error: null })
    try {
      const table = await assignTableToWaiter(tableId, waiterId, reason)
      set(state => ({
        tables: state.tables.map(t => t.id === tableId ? table : t),
        isLoading: false
      }))
      return table
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  transferTable: async (tableId, fromWaiterId, toWaiterId, reason) => {
    set({ isLoading: true, error: null })
    try {
      const table = await transferTable(tableId, fromWaiterId, toWaiterId, reason)
      set(state => ({
        tables: state.tables.map(t => t.id === tableId ? table : t),
        isLoading: false
      }))
      return table
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  clearCurrentTable: () => set({ currentTable: null }),
  clearError: () => set({ error: null }),
}))

export { useTableStore }