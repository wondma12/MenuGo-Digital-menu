import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      tableNumber: '',

      addItem: (item) => {
        // Guard: prevent adding items marked unavailable by any common flag
        if (item && (item.is_available === false || item.available === false || item.isAvailable === false)) {
          return
        }
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id)
          let newItems

          if (existingItem) {
            newItems = state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            )
          } else {
            newItems = [...state.items, { ...item, quantity: item.quantity || 1 }]
          }

          const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0)
          const totalPrice = newItems.reduce((sum, i) => {
            const itemTotal = (i.price + Object.values(i.selectedOptions || {}).reduce((a, b) => a + b, 0)) * i.quantity
            return sum + itemTotal
          }, 0)

          return { items: newItems, totalItems, totalPrice }
        })
      },

      setTableNumber: (table) => {
        set(() => ({ tableNumber: table }))
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter(i => i.id !== id)
          const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0)
          const totalPrice = newItems.reduce((sum, i) => {
            const itemTotal = (i.price + Object.values(i.selectedOptions || {}).reduce((a, b) => a + b, 0)) * i.quantity
            return sum + itemTotal
          }, 0)

          return { items: newItems, totalItems, totalPrice }
        })
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const newItems = state.items.map(i =>
            i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
          ).filter(i => i.quantity > 0)

          const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0)
          const totalPrice = newItems.reduce((sum, i) => {
            const itemTotal = (i.price + Object.values(i.selectedOptions || {}).reduce((a, b) => a + b, 0)) * i.quantity
            return sum + itemTotal
          }, 0)

          return { items: newItems, totalItems, totalPrice }
        })
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 })
      },

      updateItemOptions: (id, selectedOptions) => {
        set((state) => {
          const newItems = state.items.map(i =>
            i.id === id ? { ...i, selectedOptions } : i
          )
          const totalPrice = newItems.reduce((sum, i) => {
            const itemTotal = (i.price + Object.values(i.selectedOptions || {}).reduce((a, b) => a + b, 0)) * i.quantity
            return sum + itemTotal
          }, 0)

          return { items: newItems, totalPrice }
        })
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export { useCartStore }
