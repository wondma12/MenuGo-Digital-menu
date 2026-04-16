import { create } from 'zustand'

const useUiStore = create((set, get) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  darkMode: false,
  isLoading: false,
  modalOpen: false,
  modalContent: null,
  toast: null,

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleMobileMenu: () => set(state => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode
    set({ darkMode: newDarkMode })
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  setDarkMode: (enabled) => {
    set({ darkMode: enabled })
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),

  showToast: (message, type = 'info', duration = 3000) => {
    set({ toast: { message, type, duration } })
    setTimeout(() => set({ toast: null }), duration)
  },
  hideToast: () => set({ toast: null }),

  // Theme management
  theme: 'light',
  setTheme: (theme) => {
    set({ theme })
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  // View preferences
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Filters
  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  // Pagination
  pageSize: 10,
  setPageSize: (size) => set({ pageSize: size }),

  // Sort
  sortBy: null,
  sortOrder: 'asc',
  setSort: (field, order = 'asc') => set({ sortBy: field, sortOrder: order }),
}))

export { useUiStore }